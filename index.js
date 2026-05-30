const ADMIN_IDS = [
  // TODO: replace with your Telegram numeric user IDs, for example:
  // 123456789,
];

const SESSION_TTL = 300;
const TELEGRAM_API = "https://api.telegram.org";
const DEFAULT_STATUS = "running";
const BOT_CLOSED_MESSAGE = "当前bot已经关闭。\n​没魔力了，本大人要下线睡觉！不准再戳了，哼！💤";
const PRIVATE_CHAT_DISABLED_MESSAGE = "普通用户不支持私聊。\n​笨蛋人类！普通身份才没有资格和小魅魔说悄悄话呢！";
const THINKING_MESSAGE = "哼，魔力加载中……不准催，再催吸干你哦！(＞﹏＜)";
const CONCURRENCY_BUSY_MESSAGE = "魔力通道挤满了，稍后再来戳我！";
const CONCURRENCY_KEY = "runtime:active_requests";
const DEFAULT_CONCURRENCY_WINDOW_SECONDS = 60;
const MIN_KV_EXPIRATION_TTL_SECONDS = 60;
const SYSTEM_PROMPT_KEY = "system_prompt";
const MCP_SERVICES_KEY = "mcp_services";
const FIELD_LABELS = {
  providerName: "提供商名称",
  apiKey: "API Key",
  apiBaseUrl: "API Base URL",
  apiPath: "API 路径",
  modelName: "模型名称",
};

let memoryConcurrencySlots = [];

export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response("Telegram bot worker is running.");
    }

    try {
      const update = await request.json();
      await handleUpdate(update, env);
    } catch (error) {
      console.error("update failed", error);
    }

    return new Response("OK", { status: 200 });
  },
};

async function handleUpdate(update, env) {
  if (update.callback_query) {
    await handleCallback(update.callback_query, env);
    return;
  }

  if (update.guest_message) {
    await handleGuestMessage(update.guest_message, env);
    return;
  }

  const message = update.message;
  if (!message) return;

  if (message.guest_query_id) {
    await handleGuestMessage(message, env);
    return;
  }

  const userId = message.from?.id;
  const chatId = message.chat.id;
  const text = message.text || message.caption || "";
  const admin = isAdmin(userId, env);
  const status = await getBotStatus(env);

  if (message.chat.type === "private" && !admin) {
    await sendMessage(env, chatId, PRIVATE_CHAT_DISABLED_MESSAGE, message.message_id);
    return;
  }

  if (status === "stopped") {
    if (admin && message.chat.type === "private" && !text.startsWith("/")) {
      await showStatus(env, chatId);
      return;
    }

    if (!admin && (await shouldRespondToMessage(message, env))) {
      await sendMessage(env, chatId, BOT_CLOSED_MESSAGE, message.message_id);
      return;
    }

    if (!admin) return;
  }

  const session = await getSession(env, userId);
  if (session && admin) {
    await continueSession(message, session, env);
    return;
  }

  if (text.startsWith("/")) {
    await handleCommand(message, env);
    return;
  }

  await handleAiChat(message, env);
}

async function handleCommand(message, env) {
  const chatId = message.chat.id;
  const userId = message.from?.id;
  const command = (message.text || "").split(/\s+/)[0].split("@")[0].toLowerCase();

  if (command === "/start" || command === "/help") {
    await sendMessage(env, chatId, [
      "你好，我是访客 AI Bot。",
      "",
      "普通用户：私聊直接发送消息；群组里 @我 或回复我的消息。",
      "管理员命令：",
      "/pz - 模型配置",
      "/yl - Token 用量统计",
      "/zt - Bot 运行状态",
      "/tsc - 设置全局提示词",
      "/mcp - MCP 服务配置",
    ].join("\n"), message.message_id);
    return;
  }

  if (command === "/pz") {
    if (!(await requireAdmin(env, userId, chatId))) return;
    await showModelList(env, chatId);
    return;
  }

  if (command === "/yl") {
    if (!(await requireAdmin(env, userId, chatId))) return;
    await showUsage(env, chatId);
    return;
  }

  if (command === "/zt") {
    if (!(await requireAdmin(env, userId, chatId))) return;
    await showStatus(env, chatId);
    return;
  }

  if (command === "/tsc") {
    if (!(await requireAdmin(env, userId, chatId))) return;
    await startSystemPromptFlow(env, userId, chatId, message.message_id);
    return;
  }

  if (command === "/mcp") {
    if (!(await requireAdmin(env, userId, chatId))) return;
    await showMcpList(env, chatId);
    return;
  }
}

async function handleCallback(query, env) {
  const userId = query.from?.id;
  const chatId = query.message?.chat?.id;
  const messageId = query.message?.message_id;
  const data = query.data || "";

  if (!isAdmin(userId, env)) {
    await answerCallbackQuery(env, query.id, "此功能仅管理员可用");
    return;
  }

  try {
    await answerCallbackQuery(env, query.id);

    if (data === "pz_back") {
      await editModelList(env, chatId, messageId);
      return;
    }

    if (data === "pz_add_new") {
      await startNewModelFlow(env, userId, chatId, messageId);
      return;
    }

    if (data.startsWith("pz_select:") || data.startsWith("pz_detail:")) {
      const modelName = decodePart(data.split(":")[1]);
      await editModelDetail(env, chatId, messageId, modelName);
      return;
    }

    if (data.startsWith("pz_edit:")) {
      const [, encodedModel, field] = data.split(":");
      await startEditField(env, userId, chatId, messageId, decodePart(encodedModel), field);
      return;
    }

    if (data.startsWith("pz_modal:")) {
      const [, encodedModel, kind] = data.split(":");
      await editModalPage(env, chatId, messageId, decodePart(encodedModel), kind);
      return;
    }

    if (data.startsWith("pz_toggle:")) {
      const [, kind, field, encodedModel] = data.split(":");
      const modelName = decodePart(encodedModel);
      await toggleModality(env, chatId, messageId, modelName, kind, field);
      return;
    }

    if (data.startsWith("pz_modal_confirm:")) {
      const [, kind, encodedModel] = data.split(":");
      await editModelDetail(env, chatId, messageId, decodePart(encodedModel));
      return;
    }

    if (data.startsWith("pz_reasoning:")) {
      const [, encodedModel, level] = data.split(":");
      await setReasoning(env, chatId, messageId, decodePart(encodedModel), level);
      return;
    }

    if (data.startsWith("pz_activate:")) {
      const modelName = decodePart(data.split(":")[1]);
      await env.KV.put("active_model", modelName);
      await editModelDetail(env, chatId, messageId, modelName);
      return;
    }

    if (data.startsWith("pz_delete:")) {
      const modelName = decodePart(data.split(":")[1]);
      await deleteModel(env, chatId, messageId, modelName);
      return;
    }

    if (data.startsWith("zt_set:")) {
      const status = data.split(":")[1] === "stopped" ? "stopped" : "running";
      await env.KV.put("bot_status", status);
      await editStatus(env, chatId, messageId);
      return;
    }

    if (data === "mcp_back") {
      await editMcpList(env, chatId, messageId);
      return;
    }

    if (data === "mcp_add") {
      await startMcpAddFlow(env, userId, chatId, messageId);
      return;
    }

    if (data.startsWith("mcp_type:")) {
      await setMcpType(env, userId, chatId, messageId, data.split(":")[1]);
      return;
    }

    if (data === "mcp_headers_skip") {
      await finishMcpFromSession(env, userId, chatId, messageId, {});
      return;
    }

    if (data === "mcp_headers_add") {
      await startMcpHeadersInput(env, userId, chatId, messageId);
      return;
    }

    if (data.startsWith("mcp_select:")) {
      await editMcpDetail(env, chatId, messageId, data.split(":")[1]);
      return;
    }

    if (data.startsWith("mcp_refresh:")) {
      await refreshMcpTools(env, chatId, messageId, data.split(":")[1]);
      return;
    }

    if (data.startsWith("mcp_delete:")) {
      await deleteMcpService(env, chatId, messageId, data.split(":")[1]);
      return;
    }

    if (data.startsWith("mcp_toggle:")) {
      const [, id, index] = data.split(":");
      await toggleMcpTool(env, chatId, messageId, id, Number(index));
      return;
    }

    if (data.startsWith("mcp_tool:")) {
      const [, id, index] = data.split(":");
      await editMcpToolDetail(env, chatId, messageId, id, Number(index));
      return;
    }
  } catch (error) {
    console.error("callback failed", error);
    await answerCallbackQuery(env, query.id, "操作失败，请查看 Worker 日志");
  }
}

async function startNewModelFlow(env, userId, chatId, messageId) {
  await setSession(env, userId, {
    step: "providerName",
    isNew: true,
    pendingData: {},
  });
  await editMessageText(env, chatId, messageId, "请发送提供商名称，例如 OpenAI、Anthropic、Gemini。");
}

async function startEditField(env, userId, chatId, messageId, modelName, field) {
  await setSession(env, userId, {
    step: field,
    targetModel: modelName,
    isNew: false,
  });
  await editMessageText(env, chatId, messageId, `请直接发送新的「${FIELD_LABELS[field] || field}」。`);
}

async function continueSession(message, session, env) {
  const userId = message.from.id;
  const chatId = message.chat.id;
  const value = (message.text || "").trim();

  if (!value) {
    await sendMessage(env, chatId, "请输入有效文本。", message.message_id);
    return;
  }

  if (session.step === "systemPrompt") {
    await saveSystemPrompt(env, userId, chatId, value);
    return;
  }

  if (session.step?.startsWith("mcp_")) {
    await continueMcpSession(env, userId, chatId, value, session);
    return;
  }

  if (session.isNew) {
    await continueNewModelFlow(env, userId, chatId, value, session);
    return;
  }

  await updateExistingModelField(env, chatId, userId, session, value);
}

async function startSystemPromptFlow(env, userId, chatId, replyToMessageId) {
  const current = await env.KV.get(SYSTEM_PROMPT_KEY);
  await setSession(env, userId, { step: "systemPrompt" });
  await sendMessage(env, chatId, [
    "请发送新的全局提示词。",
    "之后所有 AI 对话都会带上这段大前提。",
    "",
    current ? `当前提示词：\n${current}` : "当前提示词：未设置",
  ].join("\n"), replyToMessageId);
}

async function saveSystemPrompt(env, userId, chatId, value) {
  await env.KV.put(SYSTEM_PROMPT_KEY, value);
  await clearSession(env, userId);
  await sendMessage(env, chatId, "已更新全局提示词。");
}

async function showMcpList(env, chatId) {
  const { text, reply_markup } = await buildMcpList(env);
  await sendMessage(env, chatId, text, null, reply_markup);
}

async function editMcpList(env, chatId, messageId) {
  const { text, reply_markup } = await buildMcpList(env);
  await editMessageText(env, chatId, messageId, text, reply_markup);
}

async function buildMcpList(env) {
  const services = await getMcpServices(env);
  const inline_keyboard = services.map((service) => [{
    text: `${service.enabled === false ? "⛔ " : "✅ "}${service.name}`,
    callback_data: `mcp_select:${service.id}`,
  }]);
  inline_keyboard.push([{ text: "🔴 添加 MCP 服务", callback_data: "mcp_add" }]);

  return {
    text: [
      "🔌 MCP 服务配置",
      "",
      services.length ? "请选择要查看或配置的 MCP 服务：" : "尚未添加 MCP 服务。",
    ].join("\n"),
    reply_markup: { inline_keyboard },
  };
}

async function startMcpAddFlow(env, userId, chatId, messageId) {
  await setSession(env, userId, {
    step: "mcp_name",
    pendingData: {},
  });
  await editMessageText(env, chatId, messageId, "请发送 MCP 服务名称，用来区分不同服务。");
}

async function continueMcpSession(env, userId, chatId, value, session) {
  const pendingData = { ...(session.pendingData || {}) };

  if (session.step === "mcp_name") {
    pendingData.name = value;
    await setSession(env, userId, { step: "mcp_type", pendingData });
    await sendMessage(env, chatId, "请选择 MCP 服务类型：", null, {
      inline_keyboard: [[
        { text: "HTTP", callback_data: "mcp_type:HTTP" },
        { text: "SSE", callback_data: "mcp_type:SSE" },
      ]],
    });
    return;
  }

  if (session.step === "mcp_url") {
    pendingData.url = value;
    await setSession(env, userId, { step: "mcp_description", pendingData });
    await sendMessage(env, chatId, "请发送 MCP 服务描述，让 LLM 知道这个服务能做什么。");
    return;
  }

  if (session.step === "mcp_description") {
    pendingData.description = value;
    await setSession(env, userId, { step: "mcp_keywords", pendingData });
    await sendMessage(env, chatId, "请发送关键词，多个关键词用逗号分隔。匹配到关键词时会优先调用该 MCP 服务。");
    return;
  }

  if (session.step === "mcp_keywords") {
    pendingData.keywords = splitKeywords(value);
    await setSession(env, userId, { step: "mcp_headers_choice", pendingData });
    await sendMessage(env, chatId, "是否需要添加自定义请求头？", null, {
      inline_keyboard: [[
        { text: "添加请求头", callback_data: "mcp_headers_add" },
        { text: "不填", callback_data: "mcp_headers_skip" },
      ]],
    });
    return;
  }

  if (session.step === "mcp_headers") {
    await finishMcpFromSession(env, userId, chatId, null, parseHeaderLines(value));
  }
}

async function setMcpType(env, userId, chatId, messageId, type) {
  const session = await getSession(env, userId);
  if (!session?.step?.startsWith("mcp_")) {
    await editMessageText(env, chatId, messageId, "配置会话已过期，请重新发送 /mcp。");
    return;
  }

  const pendingData = {
    ...(session.pendingData || {}),
    type: type === "SSE" ? "SSE" : "HTTP",
  };
  await setSession(env, userId, { step: "mcp_url", pendingData });
  await editMessageText(env, chatId, messageId, "请发送 MCP 服务地址 URL。");
}

async function startMcpHeadersInput(env, userId, chatId, messageId) {
  const session = await getSession(env, userId);
  if (!session?.step?.startsWith("mcp_")) {
    await editMessageText(env, chatId, messageId, "配置会话已过期，请重新发送 /mcp。");
    return;
  }

  await setSession(env, userId, { ...session, step: "mcp_headers" });
  await editMessageText(env, chatId, messageId, [
    "请发送自定义请求头，每行一个：",
    "",
    "Authorization=Bearer xxx",
    "X-Api-Key=xxx",
  ].join("\n"));
}

async function finishMcpFromSession(env, userId, chatId, messageId, headers) {
  const session = await getSession(env, userId);
  if (!session?.pendingData) {
    const text = "配置会话已过期，请重新发送 /mcp。";
    if (messageId) await editMessageText(env, chatId, messageId, text);
    else await sendMessage(env, chatId, text);
    return;
  }

  const service = normalizeMcpService({
    id: makeShortId(),
    ...session.pendingData,
    headers,
    tools: [],
    enabled: true,
  });

  try {
    service.tools = await fetchMcpTools(service);
    service.lastError = "";
  } catch (error) {
    service.tools = [];
    service.lastError = error.message || String(error);
  }

  await putMcpService(env, service);
  await appendMcpServiceId(env, service.id);
  await clearSession(env, userId);

  const savedText = service.lastError
    ? `已保存 MCP 服务，但拉取工具列表失败：${service.lastError}`
    : `已保存 MCP 服务，并拉取到 ${service.tools.length} 个工具。`;

  if (messageId) await editMessageText(env, chatId, messageId, savedText);
  else await sendMessage(env, chatId, savedText);
  await showMcpDetail(env, chatId, service.id);
}

async function showMcpDetail(env, chatId, id) {
  const { text, reply_markup } = await buildMcpDetail(env, id);
  await sendMessage(env, chatId, text, null, reply_markup);
}

async function editMcpDetail(env, chatId, messageId, id) {
  const { text, reply_markup } = await buildMcpDetail(env, id);
  await editMessageText(env, chatId, messageId, text, reply_markup);
}

async function buildMcpDetail(env, id) {
  const service = await getMcpService(env, id);
  if (!service) {
    return {
      text: "MCP 服务不存在。",
      reply_markup: { inline_keyboard: [[{ text: "⬅️ 返回", callback_data: "mcp_back" }]] },
    };
  }

  const inline_keyboard = [
    [{ text: "🔄 重新拉取工具列表", callback_data: `mcp_refresh:${id}` }],
    [{ text: "🗑️ 删除此 MCP 服务", callback_data: `mcp_delete:${id}` }],
  ];

  service.tools.forEach((tool, index) => {
    inline_keyboard.push([
      { text: tool.name || `Tool ${index + 1}`, callback_data: `mcp_tool:${id}:${index}` },
      { text: tool.enabled === false ? "⛔ 关闭" : "✅ 启用", callback_data: `mcp_toggle:${id}:${index}` },
    ]);
  });

  inline_keyboard.push([{ text: "⬅️ 返回", callback_data: "mcp_back" }]);

  const text = [
    "🔌 MCP 服务详情",
    "",
    `名称：${service.name}`,
    `类型：${service.type}`,
    `地址：${service.url}`,
    `描述：${service.description || "未设置"}`,
    `关键词：${service.keywords?.length ? service.keywords.join("，") : "未设置"}`,
    `自定义请求头：${Object.keys(service.headers || {}).length} 个`,
    `工具数量：${service.tools?.length || 0}`,
    service.lastError ? `\n最近拉取错误：${service.lastError}` : "",
  ].join("\n");

  return { text, reply_markup: { inline_keyboard } };
}

async function editMcpToolDetail(env, chatId, messageId, id, index) {
  const service = await getMcpService(env, id);
  const tool = service?.tools?.[index];
  if (!service || !tool) {
    await editMessageText(env, chatId, messageId, "工具不存在。", {
      inline_keyboard: [[{ text: "⬅️ 返回", callback_data: `mcp_select:${id}` }]],
    });
    return;
  }

  const parameters = tool.inputSchema || tool.parameters || {};
  await editMessageText(env, chatId, messageId, limitTelegramText([
    "🧰 MCP 工具详情",
    "",
    `工具名称 / Tool Name：${tool.name}`,
    "",
    `工具描述 / Tool Description：\n${tool.description || "无"}`,
    "",
    `输入参数 / Parameters：\n${JSON.stringify(parameters, null, 2)}`,
  ].join("\n")), {
    inline_keyboard: [
      [{ text: tool.enabled === false ? "⛔ 关闭" : "✅ 启用", callback_data: `mcp_toggle:${id}:${index}` }],
      [{ text: "⬅️ 返回服务", callback_data: `mcp_select:${id}` }],
    ],
  });
}

async function toggleMcpTool(env, chatId, messageId, id, index) {
  const service = await getMcpService(env, id);
  if (!service?.tools?.[index]) return;
  service.tools[index].enabled = service.tools[index].enabled === false;
  await putMcpService(env, service);
  await editMcpDetail(env, chatId, messageId, id);
}

async function refreshMcpTools(env, chatId, messageId, id) {
  const service = await getMcpService(env, id);
  if (!service) return;

  try {
    const oldEnabled = new Map((service.tools || []).map((tool) => [tool.name, tool.enabled !== false]));
    service.tools = (await fetchMcpTools(service)).map((tool) => ({
      ...tool,
      enabled: oldEnabled.has(tool.name) ? oldEnabled.get(tool.name) : true,
    }));
    service.lastError = "";
  } catch (error) {
    service.lastError = error.message || String(error);
  }

  await putMcpService(env, service);
  await editMcpDetail(env, chatId, messageId, id);
}

async function deleteMcpService(env, chatId, messageId, id) {
  const ids = (await getMcpServiceIds(env)).filter((item) => item !== id);
  await Promise.all([
    env.KV.delete(`mcp:${id}`),
    env.KV.put(MCP_SERVICES_KEY, JSON.stringify(ids)),
  ]);
  await editMcpList(env, chatId, messageId);
}

async function continueNewModelFlow(env, userId, chatId, value, session) {
  const pendingData = { ...(session.pendingData || {}), [session.step]: value };
  const next = nextNewModelStep(session.step);

  if (next) {
    await setSession(env, userId, { ...session, step: next, pendingData });
    await sendMessage(env, chatId, promptForStep(next));
    return;
  }

  const modelName = pendingData.modelName;
  const model = normalizeModelConfig({
    ...pendingData,
    inputModalities: { text: true, image: false },
    outputModalities: { text: true, image: false },
    reasoningLevel: "auto",
  });

  await putModel(env, modelName, model);
  await appendModelName(env, modelName);
  const active = await env.KV.get("active_model");
  if (!active) await env.KV.put("active_model", modelName);
  await clearSession(env, userId);
  await sendMessage(env, chatId, `已添加模型：${modelName}`);
  await showModelList(env, chatId);
}

async function updateExistingModelField(env, chatId, userId, session, value) {
  const oldName = session.targetModel;
  const model = await getModel(env, oldName);
  if (!model) {
    await clearSession(env, userId);
    await sendMessage(env, chatId, "模型不存在，已结束本次编辑。");
    return;
  }

  model[session.step] = value;

  if (session.step === "modelName" && value !== oldName) {
    await renameModel(env, oldName, value, model);
    await clearSession(env, userId);
    await sendMessage(env, chatId, `已更新「${FIELD_LABELS[session.step]}」。`);
    await showModelDetail(env, chatId, value);
    return;
  }

  await putModel(env, oldName, normalizeModelConfig(model));
  await clearSession(env, userId);
  await sendMessage(env, chatId, `已更新「${FIELD_LABELS[session.step] || session.step}」。`);
  await showModelDetail(env, chatId, oldName);
}

async function handleAiChat(message, env) {
  const chatId = message.chat.id;
  const text = message.text || message.caption || "";

  if (!(await shouldRespondToMessage(message, env))) return;

  const activeModel = await getActiveModel(env);
  if (!activeModel) {
    await sendMessage(env, chatId, "尚未配置可用模型，请管理员使用 /pz 添加模型。", message.message_id);
    return;
  }

  if (!activeModel.inputModalities?.text && text) {
    await sendMessage(env, chatId, "当前模型不支持文本输入。", message.message_id);
    return;
  }

  const slot = await acquireConcurrencySlot(env);
  if (!slot.acquired) {
    await sendMessage(env, chatId, CONCURRENCY_BUSY_MESSAGE, message.message_id);
    return;
  }

  let thinkingMessage = null;
  try {
    thinkingMessage = await sendMessage(env, chatId, THINKING_MESSAGE, message.message_id);

    let imageBase64 = null;
    if (message.photo?.length) {
      if (!activeModel.inputModalities?.image) {
        await editOrSendText(env, chatId, thinkingMessage?.message_id, "当前模型不支持图片输入。", message.message_id);
        return;
      }
      imageBase64 = await downloadTelegramPhoto(env, message.photo.at(-1).file_id);
    }

    const cleanText = await extractPromptText(message, env);
    const mcpContext = await resolveMcpContext(env, activeModel, cleanText);
    const finalPrompt = appendMcpContext(cleanText, mcpContext);
    await sendChatAction(env, chatId, "typing");
    const result = await callModel(env, activeModel, finalPrompt, imageBase64);

    if (result.imageUrl && activeModel.outputModalities?.image) {
      await editOrSendText(env, chatId, thinkingMessage?.message_id, "图片生成完成。", message.message_id);
      await sendPhoto(env, chatId, result.imageUrl, message.message_id);
    } else {
      await editOrSendText(env, chatId, thinkingMessage?.message_id, result.text || "（无响应）", message.message_id);
    }

    await recordTokenUsage(env, result.inputTokens, result.outputTokens);
  } catch (error) {
    console.error("ai failed", error);
    await editOrSendText(env, chatId, thinkingMessage?.message_id, `模型调用失败：${error.message}`, message.message_id);
  }
}

async function handleGuestMessage(message, env) {
  const userId = message.from?.id;
  const text = message.text || message.caption || "";
  const admin = isAdmin(userId, env);
  const status = await getBotStatus(env);

  const guestQueryId = message.guest_query_id;
  if (!guestQueryId) return;

  if (status === "stopped" && !admin) {
    await answerGuestText(env, guestQueryId, BOT_CLOSED_MESSAGE);
    return;
  }

  const activeModel = await getActiveModel(env);
  if (!activeModel) {
    await answerGuestText(env, guestQueryId, "尚未配置可用模型，请管理员私聊 bot 使用 /pz 添加模型。");
    return;
  }

  if (!activeModel.inputModalities?.text && text) {
    await answerGuestText(env, guestQueryId, "当前模型不支持文本输入。");
    return;
  }

  const slot = await acquireConcurrencySlot(env);
  if (!slot.acquired) {
    await answerGuestText(env, guestQueryId, CONCURRENCY_BUSY_MESSAGE);
    return;
  }

  try {
    let imageBase64 = null;
    if (message.photo?.length) {
      if (!activeModel.inputModalities?.image) {
        await answerGuestText(env, guestQueryId, "当前模型不支持图片输入。");
        return;
      }
      imageBase64 = await downloadTelegramPhoto(env, message.photo.at(-1).file_id);
    }

    const cleanText = await extractPromptText(message, env);
    const mcpContext = await resolveMcpContext(env, activeModel, cleanText);
    const finalPrompt = appendMcpContext(cleanText, mcpContext);
    const result = await callModel(env, activeModel, finalPrompt, imageBase64);
    await answerGuestText(env, guestQueryId, result.text || "（无响应）");
    await recordTokenUsage(env, result.inputTokens, result.outputTokens);
  } catch (error) {
    console.error("guest ai failed", error);
    await answerGuestText(env, guestQueryId, `模型调用失败：${error.message}`);
  }
}

async function shouldRespondToMessage(message, env) {
  if (message.guest_bot_caller_user || message.guest_bot_caller_chat) return true;
  if (message.chat.type === "private") return true;
  const me = await getMe(env);
  const username = me?.username ? `@${me.username}` : null;
  if (username && (message.text || message.caption || "").includes(username)) return true;
  return message.reply_to_message?.from?.id === me?.id;
}

async function cleanUserText(text, env) {
  const me = await getMe(env);
  if (!me?.username) return text;
  return text.replaceAll(`@${me.username}`, "").trim();
}

async function extractPromptText(message, env) {
  const text = message.text || message.caption || "";
  const cleanText = await cleanUserText(text, env);
  const repliedText = message.reply_to_message?.text || message.reply_to_message?.caption || "";

  if (cleanText && repliedText) {
    return [
      "用户回复了这条消息：",
      repliedText,
      "",
      "用户补充：",
      cleanText,
    ].join("\n");
  }

  if (!cleanText && repliedText) return repliedText;
  return cleanText;
}

async function callModel(env, model, text, imageBase64) {
  const systemPrompt = await env.KV.get(SYSTEM_PROMPT_KEY);

  if (isGeminiModel(model)) {
    return callGeminiModel(model, text, imageBase64, systemPrompt);
  }

  const url = `${model.apiBaseUrl.replace(/\/$/, "")}${model.apiPath}`;
  const body = {
    model: model.modelName,
    messages: buildMessages(model, text, imageBase64, systemPrompt),
  };

  if (model.providerName?.toLowerCase().includes("anthropic")) {
    body.max_tokens = 2048;
    if (model.reasoningLevel !== "auto") {
      const thinkingMap = { low: 1000, medium: 5000, high: 10000 };
      body.thinking = { type: "enabled", budget_tokens: thinkingMap[model.reasoningLevel] || 1000 };
    }
  } else if (model.reasoningLevel !== "auto") {
    body.reasoning_effort = model.reasoningLevel;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${model.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { raw };
  }

  if (!response.ok) {
    throw new Error(data.error?.message || raw || `${response.status} ${response.statusText}`);
  }

  const imageUrl = data.data?.[0]?.url || data.images?.[0]?.url;
  const textOut = data.choices?.[0]?.message?.content
    || data.content?.map((item) => item.text).filter(Boolean).join("\n")
    || data.output_text
    || "";

  return {
    text: textOut,
    imageUrl,
    inputTokens: data.usage?.prompt_tokens || data.usage?.input_tokens || 0,
    outputTokens: data.usage?.completion_tokens || data.usage?.output_tokens || 0,
  };
}

async function callGeminiModel(model, text, imageBase64, systemPrompt) {
  const apiVersion = getGeminiApiVersion(model.apiPath);
  const modelName = normalizeGeminiModelName(model.modelName);
  const url = `${model.apiBaseUrl.replace(/\/$/, "")}/${apiVersion}/models/${encodeURIComponent(modelName)}:generateContent`;
  const parts = [{ text: text || "你好" }];

  if (imageBase64 && model.inputModalities?.image) {
    parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: imageBase64,
      },
    });
  }

  const body = {
    contents: [{ role: "user", parts }],
  };

  if (systemPrompt) {
    body.systemInstruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": model.apiKey,
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { raw };
  }

  if (!response.ok) {
    throw new Error(data.error?.message || raw || `${response.status} ${response.statusText}`);
  }

  return {
    text: data.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join("\n") || "（无响应）",
    imageUrl: null,
    inputTokens: data.usageMetadata?.promptTokenCount || 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
  };
}

function buildMessages(model, text, imageBase64, systemPrompt) {
  const messages = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });

  if (imageBase64 && model.inputModalities?.image) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: text || "请描述这张图片。" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      ],
    });
    return messages;
  }

  messages.push({ role: "user", content: text || "你好" });
  return messages;
}

function isGeminiModel(model) {
  const provider = (model.providerName || "").toLowerCase();
  const baseUrl = (model.apiBaseUrl || "").toLowerCase();
  return provider.includes("gemini") || provider.includes("google") || baseUrl.includes("generativelanguage.googleapis.com");
}

function getGeminiApiVersion(apiPath = "") {
  const match = apiPath.match(/\/?(v\d+(?:beta)?)/i);
  return match?.[1] || "v1beta";
}

function normalizeGeminiModelName(modelName = "") {
  return modelName.replace(/^models\//, "").trim();
}

async function showModelList(env, chatId) {
  const { text, reply_markup } = await buildModelList(env);
  await sendMessage(env, chatId, text, null, reply_markup);
}

async function editModelList(env, chatId, messageId) {
  const { text, reply_markup } = await buildModelList(env);
  await editMessageText(env, chatId, messageId, text, reply_markup);
}

async function buildModelList(env) {
  const [models, active] = await Promise.all([getModelNames(env), env.KV.get("active_model")]);
  const inline_keyboard = models.map((name) => [{
    text: `${name === active ? "✅ " : ""}${name}`,
    callback_data: `pz_select:${encodePart(name)}`,
  }]);
  inline_keyboard.push([{ text: "🔴 添加模型", callback_data: "pz_add_new" }]);

  return {
    text: "⚙️ 模型配置\n\n请选择要配置的模型，或添加新模型：",
    reply_markup: { inline_keyboard },
  };
}

async function showModelDetail(env, chatId, modelName) {
  const { text, reply_markup } = await buildModelDetail(env, modelName);
  await sendMessage(env, chatId, text, null, reply_markup);
}

async function editModelDetail(env, chatId, messageId, modelName) {
  const { text, reply_markup } = await buildModelDetail(env, modelName);
  await editMessageText(env, chatId, messageId, text, reply_markup);
}

async function buildModelDetail(env, modelName) {
  const [model, active] = await Promise.all([getModel(env, modelName), env.KV.get("active_model")]);
  if (!model) {
    return {
      text: "模型不存在。",
      reply_markup: { inline_keyboard: [[{ text: "⬅️ 返回", callback_data: "pz_back" }]] },
    };
  }

  const encoded = encodePart(modelName);
  const text = [
    "📋 模型配置详情",
    "",
    `模型名称：${model.modelName}`,
    `提供商：${model.providerName}`,
    `API Key：${maskApiKey(model.apiKey)}`,
    `Base URL：${model.apiBaseUrl}`,
    `API 路径：${model.apiPath}`,
    `输入模态：${check(model.inputModalities?.text)} 文本  ${check(model.inputModalities?.image)} 图像`,
    `输出模态：${check(model.outputModalities?.text)} 文本  ${check(model.outputModalities?.image)} 图片`,
    `推理等级：${reasoningText(model.reasoningLevel)}`,
    active === modelName ? "\n当前已激活 ✅" : "",
  ].join("\n");

  return {
    text,
    reply_markup: {
      inline_keyboard: [
        [{ text: "✏️ 提供商名称", callback_data: `pz_edit:${encoded}:providerName` }],
        [{ text: "✏️ API Key", callback_data: `pz_edit:${encoded}:apiKey` }],
        [{ text: "✏️ Base URL", callback_data: `pz_edit:${encoded}:apiBaseUrl` }],
        [{ text: "✏️ API 路径", callback_data: `pz_edit:${encoded}:apiPath` }],
        [{ text: "✏️ 模型名称", callback_data: `pz_edit:${encoded}:modelName` }],
        [{ text: "🔳 输入模态", callback_data: `pz_modal:${encoded}:input` }],
        [{ text: "🔳 输出模态", callback_data: `pz_modal:${encoded}:output` }],
        [{ text: "🎚️ 推理等级", callback_data: `pz_modal:${encoded}:reasoning` }],
        [{ text: "✅ 设为当前模型", callback_data: `pz_activate:${encoded}` }],
        [{ text: "🗑️ 删除此模型", callback_data: `pz_delete:${encoded}` }],
        [{ text: "⬅️ 返回", callback_data: "pz_back" }],
      ],
    },
  };
}

async function editModalPage(env, chatId, messageId, modelName, kind) {
  if (kind === "reasoning") {
    await editReasoningPage(env, chatId, messageId, modelName);
    return;
  }

  const model = await getModel(env, modelName);
  const field = kind === "output" ? "outputModalities" : "inputModalities";
  const title = kind === "output" ? "输出模态" : "输入模态";
  const encoded = encodePart(modelName);
  const text = [
    `请勾选此模型支持的${title}：`,
    "",
    `当前：${check(model?.[field]?.text)} 文本  ${check(model?.[field]?.image)} 图像`,
  ].join("\n");

  await editMessageText(env, chatId, messageId, text, {
    inline_keyboard: [
      [{ text: `${check(model?.[field]?.text)} 文本`, callback_data: `pz_toggle:${kind}:text:${encoded}` }],
      [{ text: `${check(model?.[field]?.image)} 图像`, callback_data: `pz_toggle:${kind}:image:${encoded}` }],
      [{ text: "✔️ 确认", callback_data: `pz_modal_confirm:${kind}:${encoded}` }],
      [{ text: "⬅️ 返回", callback_data: `pz_detail:${encoded}` }],
    ],
  });
}

async function toggleModality(env, chatId, messageId, modelName, kind, item) {
  const model = await getModel(env, modelName);
  if (!model) return;
  const field = kind === "output" ? "outputModalities" : "inputModalities";
  model[field] = { text: true, image: false, ...(model[field] || {}) };
  model[field][item] = !model[field][item];
  await putModel(env, modelName, normalizeModelConfig(model));
  await editModalPage(env, chatId, messageId, modelName, kind);
}

async function editReasoningPage(env, chatId, messageId, modelName) {
  const model = await getModel(env, modelName);
  const current = model?.reasoningLevel || "auto";
  const encoded = encodePart(modelName);
  await editMessageText(env, chatId, messageId, "请选择此模型的推理等级：", {
    inline_keyboard: [
      ["auto", "low", "medium", "high"].map((level) => ({
        text: `${current === level ? "●" : "○"} ${reasoningLabel(level)}`,
        callback_data: `pz_reasoning:${encoded}:${level}`,
      })),
      [{ text: "⬅️ 返回", callback_data: `pz_detail:${encoded}` }],
    ],
  });
}

async function setReasoning(env, chatId, messageId, modelName, level) {
  const model = await getModel(env, modelName);
  if (!model) return;
  model.reasoningLevel = ["auto", "low", "medium", "high"].includes(level) ? level : "auto";
  await putModel(env, modelName, normalizeModelConfig(model));
  await editReasoningPage(env, chatId, messageId, modelName);
}

async function deleteModel(env, chatId, messageId, modelName) {
  const models = (await getModelNames(env)).filter((name) => name !== modelName);
  await Promise.all([
    env.KV.delete(`model:${modelName}`),
    env.KV.put("models", JSON.stringify(models)),
  ]);
  const active = await env.KV.get("active_model");
  if (active === modelName) {
    if (models[0]) await env.KV.put("active_model", models[0]);
    else await env.KV.delete("active_model");
  }
  await editModelList(env, chatId, messageId);
}

async function showUsage(env, chatId) {
  const today = new Date().toISOString().slice(0, 10);
  const [todayStats, totalStats] = await Promise.all([
    getJson(env, `stats:today:${today}`, { inputTokens: 0, outputTokens: 0 }),
    getJson(env, "stats:total", { inputTokens: 0, outputTokens: 0 }),
  ]);

  await sendMessage(env, chatId, [
    "📊 Token 用量统计",
    "",
    `📅 今日（${today}）`,
    `  输入：${formatNumber(todayStats.inputTokens)} tokens`,
    `  输出：${formatNumber(todayStats.outputTokens)} tokens`,
    "",
    "📦 累计总量",
    `  输入：${formatNumber(totalStats.inputTokens)} tokens`,
    `  输出：${formatNumber(totalStats.outputTokens)} tokens`,
  ].join("\n"));
}

async function showStatus(env, chatId) {
  const { text, reply_markup } = await buildStatus(env);
  await sendMessage(env, chatId, text, null, reply_markup);
}

async function editStatus(env, chatId, messageId) {
  const { text, reply_markup } = await buildStatus(env);
  await editMessageText(env, chatId, messageId, text, reply_markup);
}

async function buildStatus(env) {
  const status = await getBotStatus(env);
  return {
    text: `🤖 Bot 运行状态：${status === "running" ? "运行中" : "已停止"}`,
    reply_markup: {
      inline_keyboard: [[
        { text: `${status === "stopped" ? "🔴 " : ""}停止`, callback_data: status === "stopped" ? "zt_noop" : "zt_set:stopped" },
        { text: `${status === "running" ? "✅ " : ""}启动`, callback_data: status === "running" ? "zt_noop" : "zt_set:running" },
      ]],
    },
  };
}

async function recordTokenUsage(env, inputTokens = 0, outputTokens = 0) {
  const today = new Date().toISOString().slice(0, 10);
  const todayKey = `stats:today:${today}`;
  const [todayStats, totalStats] = await Promise.all([
    getJson(env, todayKey, { inputTokens: 0, outputTokens: 0 }),
    getJson(env, "stats:total", { inputTokens: 0, outputTokens: 0 }),
  ]);

  todayStats.inputTokens += inputTokens;
  todayStats.outputTokens += outputTokens;
  totalStats.inputTokens += inputTokens;
  totalStats.outputTokens += outputTokens;

  await Promise.all([
    env.KV.put(todayKey, JSON.stringify(todayStats), { expirationTtl: 86400 * 7 }),
    env.KV.put("stats:total", JSON.stringify(totalStats)),
  ]);
}

async function acquireConcurrencySlot(env) {
  const limit = getConcurrencyLimit(env);
  if (limit <= 0) return { acquired: true, id: null };

  const now = Date.now();
  const id = crypto.randomUUID();
  const windowSeconds = getConcurrencyWindowSeconds(env);

  memoryConcurrencySlots = memoryConcurrencySlots.filter((item) => item.expiresAt > now);
  if (memoryConcurrencySlots.length >= limit) return { acquired: false, id: null };

  const kvActive = await getConcurrencySnapshot(env, now);
  if (kvActive.length >= limit) return { acquired: false, id: null };

  const slot = { id, expiresAt: now + windowSeconds * 1000 };
  memoryConcurrencySlots.push(slot);

  await writeConcurrencySnapshot(env, [...kvActive, slot], windowSeconds);
  return { acquired: true, id };
}

async function getConcurrencySnapshot(env, now) {
  try {
    return (await getJson(env, CONCURRENCY_KEY, []))
      .filter((item) => item.expiresAt > now);
  } catch (error) {
    console.error("concurrency read failed", error);
    return [];
  }
}

async function writeConcurrencySnapshot(env, active, windowSeconds) {
  await env.KV.put(CONCURRENCY_KEY, JSON.stringify(active), {
    expirationTtl: Math.max(MIN_KV_EXPIRATION_TTL_SECONDS, windowSeconds + 5),
  });
}

function getConcurrencyLimit(env) {
  const value = Number(env.MAX_CONCURRENT_REQUESTS || env.CONCURRENCY_LIMIT || 0);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function getConcurrencyWindowSeconds(env) {
  const value = Number(env.CONCURRENCY_WINDOW_SECONDS || DEFAULT_CONCURRENCY_WINDOW_SECONDS);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_CONCURRENCY_WINDOW_SECONDS;
  return Math.max(MIN_KV_EXPIRATION_TTL_SECONDS, Math.floor(value));
}

async function downloadTelegramPhoto(env, fileId) {
  const file = await telegram(env, "getFile", { file_id: fileId });
  const response = await fetch(`${TELEGRAM_API}/file/bot${env.BOT_TOKEN}/${file.file_path}`);
  if (!response.ok) throw new Error("Telegram 图片下载失败");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function telegram(env, method, payload) {
  const response = await fetch(`${TELEGRAM_API}/bot${env.BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.description || `Telegram ${method} failed`);
  return data.result;
}

async function sendMessage(env, chatId, text, replyToMessageId, reply_markup) {
  const chunks = splitTelegramText(text);
  let firstMessage = null;
  for (const [index, chunk] of chunks.entries()) {
    const sent = await telegram(env, "sendMessage", {
      chat_id: chatId,
      text: chunk,
      reply_to_message_id: index === 0 ? replyToMessageId : undefined,
      reply_markup: index === chunks.length - 1 ? reply_markup : undefined,
      disable_web_page_preview: true,
    });
    if (!firstMessage) firstMessage = sent;
  }
  return firstMessage;
}

async function editMessageText(env, chatId, messageId, text, reply_markup) {
  await telegram(env, "editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    reply_markup,
    disable_web_page_preview: true,
  });
}

async function editOrSendText(env, chatId, messageId, text, replyToMessageId) {
  const chunks = splitTelegramText(text);

  if (!messageId) {
    await sendMessage(env, chatId, text, replyToMessageId);
    return;
  }

  await editMessageText(env, chatId, messageId, chunks[0]);
  for (const chunk of chunks.slice(1)) {
    await sendMessage(env, chatId, chunk, replyToMessageId);
  }
}

async function sendPhoto(env, chatId, photo, replyToMessageId) {
  await telegram(env, "sendPhoto", {
    chat_id: chatId,
    photo,
    reply_to_message_id: replyToMessageId,
  });
}

async function sendChatAction(env, chatId, action) {
  await telegram(env, "sendChatAction", { chat_id: chatId, action });
}

async function answerCallbackQuery(env, callbackQueryId, text) {
  await telegram(env, "answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: Boolean(text),
  });
}

async function answerGuestText(env, guestQueryId, text) {
  await telegram(env, "answerGuestQuery", {
    guest_query_id: guestQueryId,
    result: {
      type: "article",
      id: crypto.randomUUID(),
      title: "AI 回复",
      input_message_content: {
        message_text: limitTelegramText(text || "（无响应）"),
      },
    },
  });
}

async function getMe(env) {
  const cached = await env.KV.get("telegram:me", "json");
  if (cached) return cached;
  const me = await telegram(env, "getMe", {});
  await env.KV.put("telegram:me", JSON.stringify(me), { expirationTtl: 86400 });
  return me;
}

async function fetchMcpTools(service) {
  await mcpRpcRequest(service, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "telegram-cf-worker-bot",
      version: "1.0.0",
    },
  });

  const result = await mcpRpcRequest(service, "tools/list", {});
  return (result.tools || []).map((tool) => ({
    name: tool.name || "",
    description: tool.description || "",
    inputSchema: tool.inputSchema || tool.parameters || {},
    enabled: true,
  }));
}

async function resolveMcpContext(env, model, userText) {
  const services = (await getMcpServices(env))
    .map(normalizeMcpService)
    .filter((service) => service.enabled !== false && service.tools.some((tool) => tool.enabled !== false));

  if (!services.length || !userText) return "";

  const keywordMatched = services.filter((service) => serviceMatchesKeywords(service, userText));
  const candidates = keywordMatched.length ? keywordMatched : services;
  const forceUse = keywordMatched.length > 0;
  const plan = await chooseMcpCallPlan(env, model, userText, candidates, forceUse);
  if (!plan.length) return "";

  const results = [];
  for (const call of plan.slice(0, 3)) {
    const service = candidates.find((item) => item.id === call.serviceId || item.name === call.serviceName);
    if (!service) continue;
    const tool = service.tools.find((item) => item.enabled !== false && item.name === call.toolName);
    if (!tool) continue;

    try {
      const result = await callMcpTool(service, tool.name, call.arguments || {});
      results.push({
        service: service.name,
        tool: tool.name,
        arguments: call.arguments || {},
        result,
      });
    } catch (error) {
      results.push({
        service: service.name,
        tool: tool.name,
        arguments: call.arguments || {},
        error: error.message || String(error),
      });
    }
  }

  if (!results.length) return "";

  return [
    "以下是已调用 MCP 工具得到的上下文。请基于这些结果回答用户；如果工具报错，请自然说明无法取得该部分信息。",
    JSON.stringify(results, null, 2),
  ].join("\n");
}

async function chooseMcpCallPlan(env, model, userText, services, forceUse) {
  const manifest = services.map((service) => ({
    serviceId: service.id,
    serviceName: service.name,
    type: service.type,
    description: service.description,
    keywords: service.keywords,
    tools: service.tools
      .filter((tool) => tool.enabled !== false)
      .map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema || {},
      })),
  }));

  const prompt = [
    "你是 MCP 工具调用规划器。只返回 JSON，不要输出解释。",
    forceUse
      ? "用户消息命中了 MCP 服务关键词。请在可用工具中选择最适合的工具调用；除非完全没有合适工具，否则 calls 不应为空。"
      : "请判断是否需要调用 MCP 工具。如果普通回答足够，请返回空 calls。",
    "",
    "返回格式：",
    "{\"calls\":[{\"serviceId\":\"服务id\",\"toolName\":\"工具名称\",\"arguments\":{}}]}",
    "",
    "规则：",
    "- calls 最多 3 个。",
    "- arguments 必须符合工具 inputSchema；不知道的可省略。",
    "- 只能选择下方列出的 serviceId 和 toolName。",
    "",
    `用户消息：${userText}`,
    "",
    `可用 MCP 服务和工具：${JSON.stringify(manifest)}`,
  ].join("\n");

  try {
    const decision = await callModel(env, model, prompt, null);
    const parsed = parseJsonObject(decision.text);
    return Array.isArray(parsed.calls) ? parsed.calls : [];
  } catch (error) {
    console.error("mcp plan failed", error);
    return [];
  }
}

async function callMcpTool(service, toolName, args) {
  return mcpRpcRequest(service, "tools/call", {
    name: toolName,
    arguments: args || {},
  });
}

function appendMcpContext(userText, mcpContext) {
  if (!mcpContext) return userText;
  return [
    mcpContext,
    "",
    "用户原始问题：",
    userText,
  ].join("\n");
}

function serviceMatchesKeywords(service, userText) {
  const normalizedText = userText.toLowerCase();
  return (service.keywords || []).some((keyword) => keyword && normalizedText.includes(keyword.toLowerCase()));
}

function parseJsonObject(text = "") {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {}
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  return {};
}

async function mcpRpcRequest(service, method, params) {
  const response = await fetch(service.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": service.type === "SSE" ? "application/json, text/event-stream" : "application/json",
      "MCP-Protocol-Version": "2024-11-05",
      ...(service.headers || {}),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method,
      params,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(raw || `${response.status} ${response.statusText}`);
  }

  const data = parseMcpRpcResponse(raw, response.headers.get("content-type") || "");
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }

  return data.result || {};
}

function parseMcpRpcResponse(raw, contentType) {
  if (contentType.includes("text/event-stream") || raw.includes("\ndata:")) {
    const payloads = raw
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .filter((line) => line && line !== "[DONE]");

    for (const payload of [...payloads].reverse()) {
      try {
        const data = JSON.parse(payload);
        if (data.result || data.error) return data;
      } catch {}
    }
  }

  return JSON.parse(raw || "{}");
}

async function getMcpServiceIds(env) {
  return getJson(env, MCP_SERVICES_KEY, []);
}

async function getMcpServices(env) {
  const ids = await getMcpServiceIds(env);
  const services = await Promise.all(ids.map((id) => getMcpService(env, id)));
  return services.filter(Boolean);
}

async function getMcpService(env, id) {
  return getJson(env, `mcp:${id}`, null);
}

async function putMcpService(env, service) {
  await env.KV.put(`mcp:${service.id}`, JSON.stringify(normalizeMcpService(service)));
}

async function appendMcpServiceId(env, id) {
  const ids = await getMcpServiceIds(env);
  if (!ids.includes(id)) {
    ids.push(id);
    await env.KV.put(MCP_SERVICES_KEY, JSON.stringify(ids));
  }
}

async function getActiveModel(env) {
  const name = await env.KV.get("active_model");
  return name ? getModel(env, name) : null;
}

async function getModel(env, name) {
  return getJson(env, `model:${name}`, null);
}

async function putModel(env, name, model) {
  await env.KV.put(`model:${name}`, JSON.stringify(model));
}

async function appendModelName(env, name) {
  const models = await getModelNames(env);
  if (!models.includes(name)) {
    models.push(name);
    await env.KV.put("models", JSON.stringify(models));
  }
}

async function renameModel(env, oldName, newName, model) {
  const models = (await getModelNames(env)).map((name) => name === oldName ? newName : name);
  await Promise.all([
    env.KV.delete(`model:${oldName}`),
    env.KV.put(`model:${newName}`, JSON.stringify(normalizeModelConfig(model))),
    env.KV.put("models", JSON.stringify([...new Set(models)])),
  ]);
  const active = await env.KV.get("active_model");
  if (active === oldName) await env.KV.put("active_model", newName);
}

async function getModelNames(env) {
  return getJson(env, "models", []);
}

async function getBotStatus(env) {
  return (await env.KV.get("bot_status")) || DEFAULT_STATUS;
}

async function getSession(env, userId) {
  return getJson(env, `session:${userId}`, null);
}

async function setSession(env, userId, data) {
  await env.KV.put(`session:${userId}`, JSON.stringify(data), { expirationTtl: SESSION_TTL });
}

async function clearSession(env, userId) {
  await env.KV.delete(`session:${userId}`);
}

async function getJson(env, key, fallback) {
  const raw = await env.KV.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function isAdmin(userId, env) {
  const idsFromEnv = (env.ADMIN_IDS || "")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter(Boolean);
  return [...ADMIN_IDS, ...idsFromEnv].includes(Number(userId));
}

async function requireAdmin(env, userId, chatId) {
  if (isAdmin(userId, env)) return true;
  await sendMessage(env, chatId, "❌ 此功能仅管理员可用。");
  return false;
}

function normalizeModelConfig(model) {
  return {
    providerName: model.providerName || "",
    apiKey: model.apiKey || "",
    apiBaseUrl: model.apiBaseUrl || "",
    apiPath: model.apiPath || "/v1/chat/completions",
    modelName: model.modelName || "",
    inputModalities: { text: true, image: false, ...(model.inputModalities || {}) },
    outputModalities: { text: true, image: false, ...(model.outputModalities || {}) },
    reasoningLevel: model.reasoningLevel || "auto",
  };
}

function normalizeMcpService(service) {
  return {
    id: service.id || makeShortId(),
    name: service.name || "",
    type: service.type === "SSE" ? "SSE" : "HTTP",
    url: service.url || "",
    description: service.description || "",
    keywords: Array.isArray(service.keywords) ? service.keywords : splitKeywords(service.keywords || ""),
    headers: service.headers || {},
    tools: (service.tools || []).map((tool) => ({
      name: tool.name || "",
      description: tool.description || "",
      inputSchema: tool.inputSchema || tool.parameters || {},
      enabled: tool.enabled !== false,
    })),
    enabled: service.enabled !== false,
    lastError: service.lastError || "",
  };
}

function splitKeywords(value = "") {
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseHeaderLines(value = "") {
  const headers = {};
  for (const line of value.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const separatorIndex = trimmed.includes("=") ? trimmed.indexOf("=") : trimmed.indexOf(":");
    if (separatorIndex <= 0) continue;
    const name = trimmed.slice(0, separatorIndex).trim();
    const headerValue = trimmed.slice(separatorIndex + 1).trim();
    if (name && headerValue) headers[name] = headerValue;
  }
  return headers;
}

function makeShortId() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 12);
}

function nextNewModelStep(step) {
  const steps = ["providerName", "apiKey", "apiBaseUrl", "apiPath", "modelName"];
  const index = steps.indexOf(step);
  return steps[index + 1] || null;
}

function promptForStep(step) {
  const prompts = {
    apiKey: "请发送 API Key。",
    apiBaseUrl: "请发送 API Base URL，例如 https://api.openai.com。",
    apiPath: "请发送 API 路径，例如 /v1/chat/completions。",
    modelName: "请发送模型名称，例如 gpt-4o。",
  };
  return prompts[step] || `请发送 ${step}。`;
}

function maskApiKey(key = "") {
  if (!key) return "未设置";
  if (key.length <= 8) return "****";
  return `${key.slice(0, 3)}-****${key.slice(-4)}`;
}

function check(value) {
  return value ? "✅" : "☐";
}

function reasoningLabel(level) {
  return ({ auto: "自动", low: "低", medium: "中", high: "高" })[level] || level;
}

function reasoningText(level = "auto") {
  return ["auto", "low", "medium", "high"]
    .map((item) => `${item === level ? "●" : "○"} ${reasoningLabel(item)}`)
    .join("  ");
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function encodePart(value) {
  return encodeURIComponent(value);
}

function decodePart(value = "") {
  return decodeURIComponent(value);
}

function splitTelegramText(text) {
  const chunks = [];
  let rest = text || "";
  while (rest.length > 3900) {
    chunks.push(rest.slice(0, 3900));
    rest = rest.slice(3900);
  }
  chunks.push(rest);
  return chunks;
}

function limitTelegramText(text) {
  return (text || "").slice(0, 4096);
}
