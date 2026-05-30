# Telegram 访客 Bot 使用说明（Cloudflare 中文网页后台版）

本项目是一个基于 **Cloudflare Workers + KV** 的 Telegram Webhook Bot。你可以不使用 Wrangler，直接在 Cloudflare 中文网页后台完成创建、配置和部署。

普通用户可以在私聊中直接对话，也可以在群组里通过 `@bot_username` 或回复 bot 的消息触发 AI。管理员可以在 Telegram 里使用按钮配置模型、查看用量和开关 bot。

## 1. 项目文件

```text
.
├── index.js          # 唯一入口，全部逻辑在此文件
└── wrangler.toml     # 命令行部署时使用，网页配置可忽略
```

## 2. 创建 Telegram Bot

1. 打开 Telegram，搜索 `@BotFather`。
2. 发送 `/newbot`，按提示创建 bot。
3. 复制 BotFather 返回的 `BOT_TOKEN`，后面要填到 Cloudflare 环境变量里。
4. 发送 `/setprivacy`，选择你的 bot，然后选择 `Disable`。
5. 发送 `/setjoingroups`，选择你的 bot，然后选择 `Enable`。
6. 如需支持 Inline Mode，发送 `/setinline` 并按提示开启。

> 群组里要让 bot 看到 `@bot_username` 消息，`/setprivacy` 必须是 `Disable`。

## 3. 获取管理员 ID

管理员 ID 是 Telegram 的数字 user_id，不是用户名。

推荐方法：
1. 在 Telegram 搜索 `@userinfobot`。
2. 给它发送任意消息。
3. 复制返回的数字 ID。

多个管理员可以用英文逗号分隔，例如：

```text
123456789,987654321
```

## 4. Cloudflare 网页后台配置

### 4.1 创建 KV 命名空间

1. 登录 Cloudflare 控制台。
2. 左侧菜单进入 **Workers 和 Pages**。
3. 找到 **KV** 或 **Workers KV**。
4. 点击 **创建命名空间**。
5. 名称可以填：

```text
tg-visitor-bot-kv
```

6. 创建完成后先不用手动写数据，bot 会自动写入模型配置、状态和统计数据。

### 4.2 创建 Worker

1. 左侧菜单进入 **Workers 和 Pages**。
2. 点击 **创建应用程序**。
3. 选择 **创建 Worker**。
4. Worker 名称建议填写：

```text
tg-visitor-bot
```

5. 点击 **部署** 或 **创建**。
6. 创建完成后进入这个 Worker。

### 4.3 粘贴代码

1. 在 Worker 页面点击 **编辑代码**。
2. 删除默认示例代码。
3. 打开本项目的 [index.js](index.js)。
4. 复制全部内容，粘贴到 Cloudflare 网页编辑器。
5. 点击 **保存并部署**。

### 4.4 添加环境变量

1. 进入 Worker 页面。
2. 点击 **设置**。
3. 找到 **变量和机密**。
4. 在 **环境变量** 里添加：

```text
变量名称：BOT_TOKEN
值：你的 Telegram Bot Token
```

再添加：

```text
变量名称：ADMIN_IDS
值：你的 Telegram 数字 user_id
```

可选：添加并发限制变量。

```text
变量名称：MAX_CONCURRENT_REQUESTS
值：2
```

含义：限制一个时间窗口内最多允许多少个模型请求。填 `0` 或不添加这个变量表示不限制。这个限制同时作用于普通群组消息和访客模式消息。

可选：添加并发时间窗口变量。

```text
变量名称：CONCURRENCY_WINDOW_SECONDS
值：60
```

含义：设置限流窗口的秒数。例如 `MAX_CONCURRENT_REQUESTS=1` 与 `CONCURRENCY_WINDOW_SECONDS=60` 时，60 秒内第 1 个触发会进入模型，第 2 个触发会收到繁忙提示。

> 注意：Cloudflare KV 的过期时间最小是 60 秒，因此代码会把小于 60 的窗口值自动按 60 秒处理。

保存后页面提示重新部署，点击重新部署。

### 4.5 绑定 KV

1. 进入 Worker 页面。
2. 点击 **设置**。
3. 找到 **绑定**。
4. 点击 **添加绑定**。
5. 类型选择 **KV 命名空间**。
6. 变量名称必须填写：

```text
KV
```

7. KV 命名空间选择刚才创建的 `tg-visitor-bot-kv`。
8. 保存并重新部署。

> 注意：变量名称必须是 `KV`，因为代码里使用的是 `env.KV`。

## 5. 获取 Worker 地址

Worker 部署后，Cloudflare 会显示一个访问地址，类似：

```text
https://tg-visitor-bot.xxx.workers.dev
```

打开这个地址，如果看到：

```text
Telegram bot worker is running.
```

说明 Worker 已经可以访问。

## 6. 设置 Telegram Webhook

把下面链接中的两处替换成你自己的值，然后直接复制到浏览器地址栏打开：

```text
https://api.telegram.org/bot你的BOT_TOKEN/setWebhook?url=你的Worker地址
```

示例：

```text
https://api.telegram.org/bot123456:ABC/setWebhook?url=https://tg-visitor-bot.xxx.workers.dev
```

成功时会看到类似返回：

```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

检查 webhook 状态：

```text
https://api.telegram.org/bot你的BOT_TOKEN/getWebhookInfo
```

返回内容里应包含你的 Worker 地址，并且 `last_error_message` 为空。

## 7. BotFather 页面资料修改

这些操作都在 Telegram 的 `@BotFather` 中完成。

### 7.1 修改 bot 显示名称

```text
/setname
```

选择你的 bot，然后输入新的显示名称。

### 7.2 修改 bot 用户名

```text
/setusername
```

用户名必须以 `bot` 结尾，例如：

```text
my_visitor_ai_bot
```

### 7.3 修改简介

```text
/setdescription
```

这是 bot 列表和资料页显示的简介。

### 7.4 修改 About 文本

```text
/setabouttext
```

这是资料页里的 About 文本。

### 7.5 修改头像

```text
/setuserpic
```

选择 bot 后上传头像图片。

### 7.6 设置命令菜单

```text
/setcommands
```

建议填写：

```text
pz - 模型配置
yl - Token 用量统计
zt - Bot 运行状态
tsc - 设置全局提示词
mcp - MCP 服务配置
help - 使用帮助
```

## 8. Telegram 内使用方式

### 8.1 管理员命令

```text
/pz
```

打开模型配置页面。可以添加模型、修改 API Key、Base URL、API 路径、模型名称、输入输出模态、推理等级，也可以设置当前激活模型和删除模型。

```text
/yl
```

查看今日和累计 Token 用量。

```text
/zt
```

查看和切换 bot 运行状态。停止后，普通用户通过群组 @ 或访客模式触发 bot 时，会收到关闭提示；管理员私聊 bot 时会直接显示 `/zt` 状态面板，方便重新启动。

```text
/tsc
```

设置全局提示词。管理员发送 `/tsc` 后，再发送一段提示词，bot 会保存到 KV 的 `system_prompt`。之后所有 AI 对话都会把这段内容作为大前提传给模型。

```text
/mcp
```

配置 MCP 服务。管理员可以添加 MCP 服务并拉取工具列表。添加流程包含：

- 名称：用来区分不同 MCP 服务
- 类型：通过按钮选择 `HTTP` 或 `SSE`
- 地址：MCP 服务 URL
- 描述：告诉 LLM 这个服务能做什么
- 关键词：多个关键词用逗号分隔，匹配到关键词时优先使用该服务
- 自定义请求头：可选，每行一个，例如 `Authorization=Bearer xxx`

保存后，bot 会尝试对该 MCP 服务执行 `initialize` 和 `tools/list`，并把工具列表保存到 KV。工具列表页面每行显示：

```text
工具名称 / 启用状态
```

点击工具名称可查看工具详情，包括：

```text
工具描述 / Tool Description
输入参数 / Parameters
```

点击启用状态按钮可以切换该工具启用或关闭。

对话时的 MCP 调用规则：
- 如果用户消息命中某个 MCP 服务的关键词，bot 会优先让模型在该服务的启用工具中规划调用，并执行 `tools/call`
- 如果没有命中关键词，bot 会把所有已启用 MCP 服务的描述、工具描述和参数交给当前模型，由模型自主判断是否需要调用
- MCP 工具返回结果后，会作为上下文交给最终回答模型
- 如果工具调用失败，错误信息也会作为上下文提供给模型，让模型自然说明无法取得该部分信息
- 目前最多一次调用 3 个 MCP 工具

### 8.2 普通用户对话

私聊：普通用户不支持私聊，会收到私聊限制提示。管理员私聊仍可用于管理。

群组：满足任意一种条件会触发：

```text
@你的bot用户名 问题内容
```

或直接回复 bot 发出的消息。

也可以回复任意一条消息，并在回复内容里只写：

```text
@你的bot用户名
```

这种情况下，bot 会把你回复的那条消息当作问题。如果你在 `@bot` 后面继续写补充内容，bot 会同时参考被回复消息和你的补充内容。

普通群组消息触发后，bot 会先回复：

```text
哼，魔力加载中……不准催，再催吸干你哦！(＞﹏＜)
```

模型返回结果后，bot 会把这条提示消息编辑成最终回复。

访客模式：如果在 BotFather 中开启了 **Guest Chat Mode**，用户可以在未将 bot 入群的情况下，在消息开头输入：

```text
@你的bot用户名 问题内容
```

访客模式消息会通过 Telegram 的 `guest_message` 事件触发，bot 使用 `answerGuestQuery` 回复。访客模式接口不能先发"思考中"再编辑，因此会在模型完成后一次性返回结果。修改代码后需要在 Cloudflare Worker 中重新粘贴并部署最新的 `index.js`。

## 9. 添加第一个模型

1. 管理员给 bot 发送 `/pz`。
2. 点击 `🔴 添加模型`。
3. 按提示依次发送：
   - 提供商名称，例如 `OpenAI`
   - API Key
   - API Base URL，例如 `https://api.openai.com`
   - API 路径，例如 `/v1/chat/completions`
   - 模型名称，例如 `gpt-4o`
4. 添加完成后，bot 会自动写入 KV。
5. 如果之前没有激活模型，会自动设为当前模型。
6. 在模型详情页可以继续调整输入模态、输出模态和推理等级。

兼容 OpenAI Chat Completions 风格接口的示例：

```text
提供商名称：OpenAI
API Base URL：https://api.openai.com
API 路径：/v1/chat/completions
模型名称：gpt-4o
```

如果使用中转接口，通常只需要把 `API Base URL` 改成中转平台给你的地址。

Gemini 官方接口示例：

```text
提供商名称：Gemini
API Base URL：https://generativelanguage.googleapis.com
API 路径：/v1beta
模型名称：gemini-2.5-flash
```

> 注意：Gemini 的模型名称要填写 API model code，例如 `gemini-2.5-flash`，不要填写展示名，例如 `Gemini 3.5 Flash`。代码会自动调用 `/v1beta/models/{模型名称}:generateContent`。

## 10. KV 数据说明

bot 会自动在 KV 中使用这些键：

```text
models                         # 模型名数组
model:{模型名}                  # 单个模型配置
active_model                   # 当前激活模型名
bot_status                     # running 或 stopped
stats:today:{YYYY-MM-DD}       # 今日 token 用量
stats:total                    # 累计 token 用量
session:{user_id}              # 管理员编辑流程临时状态，5 分钟过期
telegram:me                    # bot 信息缓存
runtime:active_requests        # 当前模型请求并发记录，短时间自动过期
system_prompt                  # /tsc 设置的全局提示词
mcp_services                   # MCP 服务 id 列表
mcp:{id}                       # 单个 MCP 服务配置和工具列表
```

一般不需要手动改 KV。模型配置建议都在 Telegram 的 `/pz` 页面里修改。

## 11. 更新代码

如果你修改了 [index.js](index.js)，网页后台更新方式是：

1. 进入 Cloudflare 的 **Workers 和 Pages**。
2. 打开你的 Worker。
3. 点击 **编辑代码**。
4. 粘贴新的代码。
5. 点击 **保存并部署**。

如果只是通过 Telegram 的 `/pz` 修改模型配置，不需要重新部署 Worker。

## 12. 查看日志

Cloudflare 中文界面中：

1. 进入你的 Worker。
2. 打开 **日志** 或 **实时日志**。
3. 发送 Telegram 消息测试。
4. 如果模型调用失败，可以在这里看错误信息。

> 不同 Cloudflare 面板版本的名称可能略有不同，通常会显示为 **日志**、**实时日志**、**调用日志** 或类似名称。

## 13. 常见问题

### bot 在群里不回复

检查：

1. BotFather 的 `/setprivacy` 是否设置为 `Disable`。
2. 是否在消息中 `@bot_username`。
3. 是否回复的是 bot 自己发出的消息。
4. `/zt` 中状态是否为运行中。

### 访客模式不回复

检查：

1. BotFather 里 **Guest Chat Mode** 是否已经打开。
2. 消息是否以 `@你的bot用户名` 开头。
3. Cloudflare Worker 是否已经重新部署最新代码。
4. Webhook 是否正确设置到当前 Worker 地址。
5. Worker 日志里是否有 `Telegram`、`KV` 或模型调用错误。
6. 如果日志里只有 `POST ... status 200`，但没有模型调用错误，通常说明 Worker 代码仍是旧版，没有处理 `guest_message`。

### 管理员无法使用 `/pz`

检查 Cloudflare Worker 的环境变量：

```text
ADMIN_IDS
```

它必须是 Telegram 数字 user_id，不是用户名，也不是手机号。

### 提示 KV 错误或没有响应

检查 Worker 的 KV 绑定：

```text
变量名称：KV
```

必须是大写 `KV`。

### 模型调用失败

检查：

1. API Key 是否有效。
2. Base URL 是否不带最后的接口路径。
3. API 路径是否正确，例如 `/v1/chat/completions`。
4. 模型名称是否和接口支持的名称一致。
5. Worker 日志中的错误信息。

### 提示魔力通道挤满了

说明当前限流窗口内的模型请求数量达到了 `MAX_CONCURRENT_REQUESTS`。可以等待 `CONCURRENCY_WINDOW_SECONDS` 秒后再试，或者到 Cloudflare Worker 的 **设置** → **变量和机密** 中调大 `MAX_CONCURRENT_REQUESTS`。`CONCURRENCY_WINDOW_SECONDS` 最小按 60 秒处理。

## 14. Wrangler 命令行方式（可选）

如果你以后想用命令行部署，可以使用 [wrangler.toml](wrangler.toml)。

安装 Wrangler：

```bash
npm install -g wrangler
```

登录：

```bash
wrangler login
```

创建 KV：

```bash
wrangler kv namespace create KV
```

把输出的 `id` 填到 `wrangler.toml`，然后部署：

```bash
wrangler deploy
```
