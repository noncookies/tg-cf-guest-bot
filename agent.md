# Telegram Bot Agent 瑙勬牸鏂囨。

> 杩愯鐜锛欳loudflare Workers + KV  
> 浜や簰鍏ュ彛锛歍elegram Bot锛圵ebhook 妯″紡锛?
---

## 鐩綍

1. [椤圭洰缁撴瀯](#1-椤圭洰缁撴瀯)
2. [KV 鏁版嵁缁撴瀯](#2-kv-鏁版嵁缁撴瀯)
3. [绠＄悊鍛樼櫧鍚嶅崟](#3-绠＄悊鍛樼櫧鍚嶅崟)
4. [璁垮妯″紡锛堢兢缁?@ 瀵硅瘽锛塢(#4-璁垮妯″紡缇ょ粍--瀵硅瘽)
5. [鍏ㄥ眬鐘舵€佹満锛堜細璇濇祦绋嬶級](#5-鍏ㄥ眬鐘舵€佹満浼氳瘽娴佺▼)
6. [鍛戒护锛?pz 妯″瀷閰嶇疆](#6-鍛戒护pz-妯″瀷閰嶇疆)
7. [鍛戒护锛?yl 鐢ㄩ噺缁熻](#7-鍛戒护yl-鐢ㄩ噺缁熻)
8. [鍛戒护锛?zt 杩愯鐘舵€乚(#8-鍛戒护zt-杩愯鐘舵€?
9. [妯″瀷璋冪敤閫昏緫](#9-妯″瀷璋冪敤閫昏緫)
10. [Token 缁熻閫昏緫](#10-token-缁熻閫昏緫)
11. [鏉冮檺鏍￠獙閫昏緫](#11-鏉冮檺鏍￠獙閫昏緫)
12. [閿欒澶勭悊瑙勮寖](#12-閿欒澶勭悊瑙勮寖)

---

## 1. 椤圭洰缁撴瀯

```
.
├── index.js              # 鍞竴鍏ュ彛锛屽叏閮ㄩ€昏緫鍦ㄦ鏂囦欢
鈹溾攢鈹€ wrangler.toml          # CF Workers 閰嶇疆
鈹斺攢鈹€ agent.md              # 鏈枃妗?```

**wrangler.toml 蹇呰閰嶇疆锛?*

```toml
name = "tg-bot"
main = "index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "KV"
id = "<浣犵殑KV鍛藉悕绌洪棿ID>"

[vars]
BOT_TOKEN = "<浣犵殑BotToken>"        # 涔熷彲浠ョ敤 secret
```

**BotFather 蹇呴』寮€鍚殑璁剧疆锛?*
- `/setprivacy` 鈫?`Disable`锛堝厑璁歌鍙栫兢缁勬秷鎭級
- `/setjoingroups` 鈫?`Enable`锛堝厑璁稿姞鍏ョ兢缁勶級
- 鍦?Bot 璁剧疆涓紑鍚?**Inline Mode**锛堟敮鎸佽瀹?@ 鍔熻兘锛?
---

## 2. KV 鏁版嵁缁撴瀯

鎵€鏈夋暟鎹瓨鍌ㄥ湪缁戝畾鐨?KV namespace 涓紝閿悕瑙勮寖濡備笅锛?
### 2.1 妯″瀷閰嶇疆鍒楄〃

```
KEY:   "models"
VALUE: JSON 鏁扮粍锛屽厓绱犱负妯″瀷鍚嶇О瀛楃涓?绀轰緥:  ["gpt-4o", "claude-3-5-sonnet", "gemini-2.0-flash"]
```

### 2.2 鍗曚釜妯″瀷閰嶇疆

```
KEY:   "model:{妯″瀷鍚嶇О}"
VALUE: JSON 瀵硅薄

{
  "providerName": "OpenAI",           // 鎻愪緵鍟嗗悕绉?  "apiKey": "sk-xxxx",               // API Key
  "apiBaseUrl": "https://api.openai.com",  // Base URL锛堜笉鍚矾寰勶級
  "apiPath": "/v1/chat/completions", // API 璺緞
  "modelName": "gpt-4o",            // 妯″瀷鍚嶇О锛堜笌KEY涓竴鑷达級
  "inputModalities": {
    "text": true,                    // 鏄惁鎺ュ彈鏂囨湰杈撳叆
    "image": false                   // 鏄惁鎺ュ彈鍥剧墖杈撳叆锛坆ase64锛?  },
  "outputModalities": {
    "text": true,                    // 鏄惁杩斿洖鏂囨湰
    "image": false                   // 鏄惁杩斿洖鍥剧墖锛堝浘鐗囩敓鎴愭ā鍨嬶級
  },
  "reasoningLevel": "auto"           // 鎺ㄧ悊绛夌骇: "auto" | "low" | "medium" | "high"
}
```

### 2.3 褰撳墠閫変腑妯″瀷

```
KEY:   "active_model"
VALUE: 瀛楃涓诧紝褰撳墠婵€娲荤殑妯″瀷鍚嶇О
绀轰緥:  "gpt-4o"
```

### 2.4 Bot 杩愯鐘舵€?
```
KEY:   "bot_status"
VALUE: "running" | "stopped"
榛樿:  "running"
```

### 2.5 Token 鐢ㄩ噺缁熻

```
KEY:   "stats:today:{YYYY-MM-DD}"
VALUE: JSON 瀵硅薄
{
  "inputTokens": 12345,
  "outputTokens": 6789
}

KEY:   "stats:total"
VALUE: JSON 瀵硅薄
{
  "inputTokens": 99999,
  "outputTokens": 55555
}
```

### 2.6 鐢ㄦ埛浼氳瘽鐘舵€侊紙涓存椂锛孴TL 300s锛?
```
KEY:   "session:{user_id}"
VALUE: JSON 瀵硅薄

{
  "step": "edit_apiKey",         // 褰撳墠绛夊緟鐢ㄦ埛杈撳叆鐨勫瓧娈?  "targetModel": "gpt-4o",      // 鎿嶄綔鐨勭洰鏍囨ā鍨嬪悕绉?  "isNew": false,                // true=鏂板缓妯″瀷娴佺▼, false=淇敼宸叉湁妯″瀷
  "pendingData": {               // 鏂板缓娴佺▼涓殏瀛樼殑宸插～瀛楁
    "providerName": "OpenAI"
    // ...閫愭濉叆
  }
}

TTL: 300绉掞紙5鍒嗛挓鏃犳搷浣滆嚜鍔ㄦ竻闄わ級
```

---

## 3. 绠＄悊鍛樼櫧鍚嶅崟

**鍐欐鍦ㄤ唬鐮侀《閮ㄥ父閲忎腑锛屼笉瀛?KV锛?*

```javascript
const ADMIN_IDS = [
  123456789,   // 绠＄悊鍛?鐨?Telegram user_id锛堟暟瀛楋級
  987654321,   // 绠＄悊鍛?
];
```

> 淇敼鐧藉悕鍗曢渶閲嶆柊閮ㄧ讲 Worker銆?
---

## 4. 璁垮妯″紡锛堢兢缁?@ 瀵硅瘽锛?
### 4.1 瑙﹀彂鏉′欢

鍦ㄧ兢缁勪腑锛屼互涓嬫儏鍐佃Е鍙?bot 鍝嶅簲锛?- 娑堟伅涓寘鍚?`@bot_username`锛坢ention锛?- 娑堟伅鏄 bot 娑堟伅鐨勫洖澶嶏紙`reply_to_message.from.id === bot_id`锛?
绉佽亰涓細浠讳綍鏅€氭秷鎭潎瑙﹀彂鍝嶅簲銆?
### 4.2 澶勭悊娴佺▼

```
鏀跺埌娑堟伅
  鈫?妫€鏌?bot_status锛坰topped 鐘舵€佷笅闈炵鐞嗗憳鐩存帴蹇界暐锛?  鈫?鎻愬彇娑堟伅鏂囨湰锛堝幓闄?@mention 鍓嶇紑锛?  鈫?妫€鏌?inputModalities
      鈫?image=true 涓旀秷鎭惈鍥剧墖 鈫?涓嬭浇鍥剧墖 鈫?杞?base64 鈫?闄勫姞鍒拌姹?      鈫?text=true 鈫?姝ｅ父鏂囨湰
  鈫?璋冪敤褰撳墠婵€娲绘ā鍨?API
  鈫?妫€鏌?outputModalities
      鈫?image=true 涓旀ā鍨嬭繑鍥炲浘鐗嘦RL 鈫?鍙戦€佸浘鐗囨秷鎭?      鈫?text=true 鈫?鍙戦€佹枃鏈秷鎭?  鈫?绱姞 token 缁熻
```

### 4.3 鍥剧墖杈撳叆澶勭悊

```
1. 鍙栨秷鎭腑 photo 鏁扮粍鏈€鍚庝竴椤癸紙鏈€楂樺垎杈ㄧ巼锛?2. 璋冪敤 getFile API 鑾峰彇 file_path
3. 鎷兼帴涓嬭浇 URL锛歨ttps://api.telegram.org/file/bot{TOKEN}/{file_path}
4. fetch 涓嬭浇 鈫?ArrayBuffer 鈫?base64
5. 鏋勯€?content 鏁扮粍锛歔{type:"image_url", image_url:{url:"data:image/jpeg;base64,..."}}]
```

---

## 5. 鍏ㄥ眬鐘舵€佹満锛堜細璇濇祦绋嬶級

### 5.1 娑堟伅璺敱浼樺厛绾?
```
鏀跺埌 update
  鈫?鈶?callback_query锛堟寜閽偣鍑伙級鈫?璺敱鍒板搴?handler
  鈫?鈶?message.text 浠?"/" 寮€澶?鈫?鍛戒护璺敱
  鈫?鈶?session 瀛樺湪 鈫?瑙嗕负瀵逛笂涓€姝ラ鐨勬枃鏈洖澶嶏紝缁х画娴佺▼
  鈫?鈶?鏅€氭秷鎭?鈫?AI 瀵硅瘽閫昏緫
```

### 5.2 鏂板缓妯″瀷鐨勫姝ラ娴佺▼

```
姝ラ椤哄簭锛坕sNew=true 鏃朵緷娆¤繘琛岋級锛?  1. providerName    鈫?鎻愮ず锛?璇疯緭鍏ユ彁渚涘晢鍚嶇О锛堝 OpenAI銆丄nthropic锛?
  2. apiKey          鈫?鎻愮ず锛?璇疯緭鍏?API Key"
  3. apiBaseUrl      鈫?鎻愮ず锛?璇疯緭鍏?API Base URL锛堝 https://api.openai.com锛?
  4. apiPath         鈫?鎻愮ず锛?璇疯緭鍏?API 璺緞锛堝 /v1/chat/completions锛?
  5. modelName       鈫?鎻愮ず锛?璇疯緭鍏ユā鍨嬪悕绉帮紙濡?gpt-4o锛?
  6. inputModalities 鈫?鍙戦€佸嬀閫夐敭鐩橈紙瑙佷笅鏂癸級
  7. outputModalities 鈫?鍙戦€佸嬀閫夐敭鐩?  8. reasoningLevel  鈫?鍙戦€佸崟閫夐敭鐩?  鈫?瀹屾垚锛屽啓鍏?KV锛屾竻闄?session
```

### 5.3 淇敼妯″瀷娴佺▼

鐐瑰嚮鏌愪釜閰嶇疆椤规寜閽悗锛?- 鑻ヤ负鏂囨湰瀛楁 鈫?璁剧疆 session.step = 瀛楁鍚嶏紝绛夊緟涓嬩竴鏉℃枃鏈秷鎭洿鎺ュ啓鍏?- 鑻ヤ负妯℃€?绛夌骇 鈫?鐩存帴鍙戦€佸嬀閫夐敭鐩橈紝閫氳繃 callback_query 澶勭悊锛屾棤闇€ session

---

## 6. 鍛戒护锛?pz 妯″瀷閰嶇疆

### 6.1 鍏ュ彛鐣岄潰

鍙戦€佷竴鏉℃秷鎭紝鏂囨湰鍐呭锛?```
鈿欙笍 妯″瀷閰嶇疆

璇烽€夋嫨瑕侀厤缃殑妯″瀷锛屾垨娣诲姞鏂版ā鍨嬶細
```

**Inline Keyboard 缁撴瀯锛?*

```
[姣忎釜妯″瀷鍚嶇О涓€涓寜閽紝鐙崰涓€琛宂
  - 褰撳墠婵€娲绘ā鍨嬶細缁胯壊搴曡壊鏁堟灉 鈫?鎸夐挳鏂囨湰涓?"鉁?{妯″瀷鍚嶇О}"
  - 鍏朵粬妯″瀷 鈫?鎸夐挳鏂囨湰涓?"{妯″瀷鍚嶇О}"
  - callback_data: "pz_select:{妯″瀷鍚嶇О}"

[鏈€鍚庝竴琛岋紝鍥哄畾]
  - 鎸夐挳鏂囨湰锛氣灂 娣诲姞妯″瀷锛堢孩鑹查€氳繃 emoji 鏍囩ず锛孴G 涓嶆敮鎸佹寜閽儗鏅壊锛?  - callback_data: "pz_add_new"
```

> **娉ㄦ剰**锛歍elegram Inline Keyboard 鍘熺敓涓嶆敮鎸佹寜閽儗鏅壊銆? 
> 绾﹀畾鐢?emoji 鏇夸唬锛? 
> - 褰撳墠閫変腑妯″瀷 鈫?`鉁卄 鍓嶇紑  
> - 娣诲姞鎸夐挳 鈫?`馃敶 娣诲姞妯″瀷`

### 6.2 妯″瀷璇︽儏鐣岄潰

鐐瑰嚮鏌愭ā鍨嬪悗锛岀紪杈戝師娑堟伅涓猴細

```
馃搵 妯″瀷閰嶇疆璇︽儏

妯″瀷鍚嶇О锛?  gpt-4o
鎻愪緵鍟嗭細     OpenAI
API Key锛?   sk-****6789锛堣劚鏁忥紝浠呮樉绀哄悗4浣嶏級
Base URL锛?  https://api.openai.com
API 璺緞锛?  /v1/chat/completions
杈撳叆妯℃€侊細   鉁?鏂囨湰  鈽?鍥惧儚
杈撳嚭妯℃€侊細   鉁?鏂囨湰  鈽?鍥剧墖
鎺ㄧ悊绛夌骇锛?  鈼?鑷姩  鈼?浣? 鈼?涓? 鈼?楂?```

**Inline Keyboard锛?*

```
琛?: [鉁忥笍 鎻愪緵鍟嗗悕绉癩  callback: "pz_edit:{model}:providerName"
琛?: [鉁忥笍 API Key]     callback: "pz_edit:{model}:apiKey"
琛?: [鉁忥笍 Base URL]    callback: "pz_edit:{model}:apiBaseUrl"
琛?: [鉁忥笍 API 璺緞]    callback: "pz_edit:{model}:apiPath"
琛?: [鉁忥笍 妯″瀷鍚嶇О]    callback: "pz_edit:{model}:modelName"
琛?: [馃敳 杈撳叆妯℃€乚    callback: "pz_modal:{model}:input"
琛?: [馃敳 杈撳嚭妯℃€乚    callback: "pz_modal:{model}:output"
琛?: [馃帤锔?鎺ㄧ悊绛夌骇]   callback: "pz_modal:{model}:reasoning"
琛?: [鉁?璁句负褰撳墠妯″瀷] callback: "pz_activate:{model}"
琛?0:[馃棏锔?鍒犻櫎姝ゆā鍨媇  callback: "pz_delete:{model}"
琛?1:[鈼€锔?杩斿洖]        callback: "pz_back"
```

### 6.3 杈撳叆妯℃€佸嬀閫夐敭鐩?
缂栬緫娑堟伅涓哄嬀閫夌晫闈細

```
璇峰嬀閫夋妯″瀷鏀寔鐨勮緭鍏ユā鎬侊細

锛堝綋鍓嶏細鉁?鏂囨湰  鈽?鍥惧儚锛?```

**Inline Keyboard锛?*

```
[鉁?鏂囨湰]  callback: "pz_toggle:input:text"
[鈽?鍥惧儚]   callback: "pz_toggle:input:image"
[鉁旓笍 纭]  callback: "pz_modal_confirm:input:{model}"
[鈼€锔?杩斿洖]  callback: "pz_detail:{model}"
```

姣忔鐐瑰嚮 toggle 鎸夐挳鏃讹紝璇诲彇 KV 涓搴斿瓧娈碉紝鍙栧弽鍚庡啓鍥烇紝骞跺埛鏂版秷鎭腑鐨勫嬀閫夌姸鎬侊紙缂栬緫娑堟伅锛夈€?
### 6.4 杈撳嚭妯℃€佸嬀閫夐敭鐩?
缁撴瀯鍚岃緭鍏ユā鎬侊紝callback 涓?`input` 鏇挎崲涓?`output`锛屽瓧娈典负 `outputModalities`銆?
### 6.5 鎺ㄧ悊绛夌骇鍗曢€夐敭鐩?
```
璇烽€夋嫨姝ゆā鍨嬬殑鎺ㄧ悊绛夌骇锛?```

**Inline Keyboard锛?*

```
[鈼?鑷姩]  [鈼?浣嶿  [鈼?涓璢  [鈼?楂榏    锛堟í鎺掑洓涓紝褰撳墠閫変腑鐢?鈼?鏍囩ず锛?callback: "pz_reasoning:{model}:auto|low|medium|high"
[鈼€锔?杩斿洖]  callback: "pz_detail:{model}"
```

鐐瑰嚮鍚庣洿鎺ュ啓鍏ワ紝鍒锋柊褰撳墠鎸夐挳鐘舵€侊紝鏃犻渶纭姝ラ銆?
### 6.6 鏂囨湰瀛楁淇敼娴佺▼

鐐瑰嚮浠绘剰 `pz_edit:*` 鎸夐挳鍚庯細

1. 缂栬緫娑堟伅鏂囨湰涓猴細`鉁忥笍 璇风洿鎺ュ彂閫佹柊鐨勩€寋瀛楁涓枃鍚峿銆嶏細`
2. 鍦?KV 鍐欏叆 session锛歚{ step: "{field}", targetModel: "{model}", isNew: false }`
3. 鐢ㄦ埛鍙戦€佹枃鏈悗锛?   - 璇诲彇 session锛岀‘璁?step
   - 鏇存柊 KV 涓搴旀ā鍨嬮厤缃瓧娈?   - 娓呴櫎 session
   - 鍙戦€佹柊娑堟伅锛歚鉁?宸叉洿鏂般€寋瀛楁鍚峿銆峘锛屽苟閲嶆柊灞曠ず妯″瀷璇︽儏

> `modelName` 瀛楁淇敼鏃讹紝闇€鍚屾鏇存柊 models 鏁扮粍涓殑鍚嶇О锛屽苟杩佺Щ `model:{鏃у悕}` 鈫?`model:{鏂板悕}` 鐨?KV 閿€?
---

## 7. 鍛戒护锛?yl 鐢ㄩ噺缁熻

浠呯鐞嗗憳鍙敤銆傚彂閫佹秷鎭細

```
馃搳 Token 鐢ㄩ噺缁熻

馃搮 浠婃棩锛?025-01-15锛?  杈撳叆锛?2,345 tokens
  杈撳嚭锛?,789 tokens

馃摝 绱鎬婚噺
  杈撳叆锛?,234,567 tokens
  杈撳嚭锛?67,890 tokens
```

瀹炵幇锛?- 浠婃棩 key锛歚stats:today:{YYYY-MM-DD}`锛屾棩鏈熷彇 `new Date().toISOString().slice(0,10)`
- 鎬婚噺 key锛歚stats:total`
- 涓や釜 KV.get 骞惰鎵ц锛圥romise.all锛?- 鏁板瓧鏍煎紡鍖栫敤 `toLocaleString()` 鎴栨墜鍔ㄥ崈鍒嗕綅

---

## 8. 鍛戒护锛?zt 杩愯鐘舵€?
浠呯鐞嗗憳鍙敤銆傚彂閫佹秷鎭細

```
馃 Bot 杩愯鐘舵€?```

**Inline Keyboard锛堝崟琛屼袱涓寜閽級锛?*

```
褰撳墠涓?running 鐘舵€侊細
  [馃敶 鍋滄]锛堢孩鑹?emoji 鏍囩ず锛?callback: "zt_set:stopped"
  [鉁?鍚姩]锛堝綋鍓嶇姸鎬侊紝鍔犵矖鎻愮ず锛塩allback: "zt_noop"

褰撳墠涓?stopped 鐘舵€侊細
  [馃敶 鍋滄]锛堝綋鍓嶇姸鎬侊級callback: "zt_noop"
  [鉁?鍚姩]  callback: "zt_set:running"
```

> 鐢?emoji 鍓嶇紑 `馃敶`/`鉁卄 鍖哄垎褰撳墠鐘舵€佹寜閽€?
**callback 澶勭悊锛?*
- `zt_set:running` 鈫?`KV.put("bot_status", "running")` 鈫?缂栬緫娑堟伅鍒锋柊鎸夐挳鐘舵€?- `zt_set:stopped` 鈫?`KV.put("bot_status", "stopped")` 鈫?缂栬緫娑堟伅鍒锋柊鎸夐挳鐘舵€?- `zt_noop` 鈫?浠?`answerCallbackQuery`锛屼笉鍋氫换浣曟搷浣?
**stopped 鐘舵€佷笅鐨勮涓猴細**
- 闈炵鐞嗗憳鍙戦€佷换浣曟秷鎭?/ 鍛戒护 鈫?闈欓粯蹇界暐锛堜笉鍥炲锛?- 绠＄悊鍛樹緷鐒跺彲浠ヤ娇鐢?/pz銆?yl銆?zt
- 缇ょ粍涓殑 @ 娑堟伅 鈫?闈欓粯蹇界暐

---

## 9. 妯″瀷璋冪敤閫昏緫

### 9.1 鏋勯€犺姹?
```javascript
const model = await getActiveModel(); // 璇?active_model 鈫?璇?model:{name}

const url = model.apiBaseUrl + model.apiPath;

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${model.apiKey}`
};

const body = {
  model: model.modelName,
  messages: buildMessages(userMessage, imageBase64), // 瑙?9.2
};

// 闄勫姞鎺ㄧ悊绛夌骇鍙傛暟
if (model.reasoningLevel !== "auto") {
  body.reasoning_effort = model.reasoningLevel; // OpenAI 椋庢牸
  // 鑻?providerName === "Anthropic"锛屾敼涓?thinking 鍙傛暟锛堣 9.3锛?}
```

### 9.2 娑堟伅鏋勯€?
```javascript
function buildMessages(text, imageBase64) {
  if (imageBase64 && model.inputModalities.image) {
    return [{
      role: "user",
      content: [
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        { type: "text", text: text || "璇锋弿杩拌繖寮犲浘鐗? }
      ]
    }];
  }
  return [{ role: "user", content: text }];
}
```

### 9.3 鎻愪緵鍟嗗樊寮傚鐞?
```javascript
// 鎺ㄧ悊绛夌骇鍙傛暟鍚?if (model.providerName === "Anthropic") {
  const thinkingMap = { low: 1000, medium: 5000, high: 10000 };
  if (model.reasoningLevel !== "auto") {
    body.thinking = { type: "enabled", budget_tokens: thinkingMap[model.reasoningLevel] };
  }
} else {
  // OpenAI / 鍏煎鎺ュ彛
  if (model.reasoningLevel !== "auto") {
    body.reasoning_effort = model.reasoningLevel;
  }
}
```

### 9.4 鍥剧墖杈撳嚭澶勭悊

```javascript
// 鍝嶅簲澶勭悊
const data = await response.json();

if (model.outputModalities.image) {
  // 鍥剧墖鐢熸垚妯″瀷锛屽搷搴旂粨鏋勪笉鍚岋紙濡?DALL-E锛?  const imageUrl = data.data?.[0]?.url;
  if (imageUrl) {
    await sendPhoto(chatId, imageUrl, replyToMessageId);
    return;
  }
}

// 榛樿鏂囨湰杈撳嚭
const text = data.choices?.[0]?.message?.content ?? "锛堟棤鍝嶅簲锛?;
await sendMessage(chatId, text, replyToMessageId);
```

---

## 10. Token 缁熻閫昏緫

姣忔 API 璋冪敤鎴愬姛鍚庢墽琛岋細

```javascript
async function recordTokenUsage(inputTokens, outputTokens) {
  const today = new Date().toISOString().slice(0, 10); // "2025-01-15"

  // 鏇存柊浠婃棩缁熻
  const todayKey = `stats:today:${today}`;
  const todayRaw = await KV.get(todayKey);
  const todayStats = todayRaw ? JSON.parse(todayRaw) : { inputTokens: 0, outputTokens: 0 };
  todayStats.inputTokens += inputTokens;
  todayStats.outputTokens += outputTokens;
  await KV.put(todayKey, JSON.stringify(todayStats), { expirationTtl: 86400 * 7 }); // 淇濈暀7澶?
  // 鏇存柊鎬婚噺
  const totalRaw = await KV.get("stats:total");
  const totalStats = totalRaw ? JSON.parse(totalRaw) : { inputTokens: 0, outputTokens: 0 };
  totalStats.inputTokens += inputTokens;
  totalStats.outputTokens += outputTokens;
  await KV.put("stats:total", JSON.stringify(totalStats));
}

// token 鏉ユ簮锛?// OpenAI 椋庢牸锛歞ata.usage.prompt_tokens / data.usage.completion_tokens
// Anthropic锛歞ata.usage.input_tokens / data.usage.output_tokens
```

---

## 11. 鏉冮檺鏍￠獙閫昏緫

### 11.1 缁熶竴鏉冮檺妫€鏌ュ嚱鏁?
```javascript
function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

// 鍦ㄦ瘡涓渶瑕佹潈闄愮殑 handler 鍏ュ彛璋冪敤锛?async function requireAdmin(userId, chatId) {
  if (!isAdmin(userId)) {
    await sendMessage(chatId, "鉀?姝ゅ姛鑳戒粎绠＄悊鍛樺彲鐢ㄣ€?);
    return false;
  }
  return true;
}
```

### 11.2 鍚勫懡浠ゆ潈闄愯姹?
| 鍛戒护 / 鎿嶄綔 | 鏅€氱敤鎴?| 绠＄悊鍛?|
|---|---|---|
| AI 瀵硅瘽 | 鉁咃紙running 鐘舵€侊級 | 鉁?|
| /pz | 鉂?鈫?鎻愮ず鏃犳潈闄?| 鉁?|
| /yl | 鉂?鈫?鎻愮ず鏃犳潈闄?| 鉁?|
| /zt | 鉂?鈫?鎻愮ず鏃犳潈闄?| 鉁?|
| callback_query锛堥厤缃浉鍏筹級 | 鉂?鈫?answerCallbackQuery 鎻愮ず | 鉁?|

---

## 12. 閿欒澶勭悊瑙勮寖

### 12.1 API 璋冪敤澶辫触

```
鈫?鎹曡幏寮傚父鎴栭潪 200 鍝嶅簲
鈫?鍙戦€佹秷鎭細"鉂?妯″瀷璋冪敤澶辫触锛歿閿欒淇℃伅}"
鈫?涓嶈褰?token
鈫?涓嶄腑鏂?Worker锛堣繑鍥?200 缁?Telegram锛岄伩鍏嶉噸璇曪級
```

### 12.2 鏃犳縺娲绘ā鍨?
```
鈫?active_model 涓虹┖
鈫?鍙戦€佹秷鎭細"鈿狅笍 灏氭湭閰嶇疆鍙敤妯″瀷锛岃绠＄悊鍛樹娇鐢?/pz 娣诲姞妯″瀷銆?
```

### 12.3 Session 瓒呮椂

```
鈫?鐢ㄦ埛鍙戦€佹枃鏈絾 session 涓嶅瓨鍦紙宸茶繃鏈燂級
鈫?瑙嗕负鏅€?AI 瀵硅瘽娑堟伅澶勭悊
```

### 12.4 Webhook 鍝嶅簲瑙勮寖

```javascript
// Worker 濮嬬粓瀵?Telegram 杩斿洖 200
// 鍗充娇鍐呴儴鍑洪敊锛屼篃涓嶈繑鍥?4xx/5xx锛岄伩鍏?Telegram 閲嶅鎺ㄩ€?return new Response("OK", { status: 200 });
```

### 12.5 callback_query 蹇呴』搴旂瓟

```javascript
// 鎵€鏈?callback_query 蹇呴』璋冪敤 answerCallbackQuery锛屽惁鍒?TG 浼氫竴鐩存樉绀?loading
await answerCallbackQuery(callbackQueryId, optionalText);
```

---

## 闄勫綍锛歝allback_data 閫熸煡琛?
| callback_data | 鍚箟 |
|---|---|
| `pz_select:{model}` | 杩涘叆妯″瀷璇︽儏 |
| `pz_add_new` | 寮€濮嬫柊寤烘ā鍨嬫祦绋?|
| `pz_edit:{model}:{field}` | 缂栬緫鏌愭枃鏈瓧娈?|
| `pz_modal:{model}:input` | 鎵撳紑杈撳叆妯℃€佸嬀閫?|
| `pz_modal:{model}:output` | 鎵撳紑杈撳嚭妯℃€佸嬀閫?|
| `pz_modal:{model}:reasoning` | 鎵撳紑鎺ㄧ悊绛夌骇閫夋嫨 |
| `pz_toggle:input:{field}` | 鍒囨崲杈撳叆妯℃€佹煇椤?|
| `pz_toggle:output:{field}` | 鍒囨崲杈撳嚭妯℃€佹煇椤?|
| `pz_modal_confirm:input:{model}` | 纭杈撳叆妯℃€佷慨鏀?|
| `pz_modal_confirm:output:{model}` | 纭杈撳嚭妯℃€佷慨鏀?|
| `pz_reasoning:{model}:{level}` | 璁剧疆鎺ㄧ悊绛夌骇 |
| `pz_activate:{model}` | 璁句负褰撳墠婵€娲绘ā鍨?|
| `pz_delete:{model}` | 鍒犻櫎妯″瀷 |
| `pz_back` | 杩斿洖妯″瀷鍒楄〃 |
| `pz_detail:{model}` | 杩斿洖妯″瀷璇︽儏 |
| `zt_set:running` | 璁剧疆 bot 鐘舵€佷负杩愯 |
| `zt_set:stopped` | 璁剧疆 bot 鐘舵€佷负鍋滄 |
| `zt_noop` | 鏃犳搷浣滐紙褰撳墠鐘舵€佹寜閽級|

