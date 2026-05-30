# Telegram 璁垮 Bot 浣跨敤璇存槑锛圕loudflare 涓枃缃戦〉鍚庡彴鐗堬級

鏈」鐩槸涓€涓熀浜?**Cloudflare Workers + KV** 鐨?Telegram webhook bot銆備綘鍙互涓嶄娇鐢?Wrangler锛岀洿鎺ュ湪 Cloudflare 涓枃缃戦〉鍚庡彴瀹屾垚鍒涘缓銆侀厤缃拰閮ㄧ讲銆?
鏅€氱敤鎴峰彲浠ュ湪绉佽亰涓洿鎺ュ璇濓紝涔熷彲浠ュ湪缇ょ粍閲岄€氳繃 `@bot_username` 鎴栧洖澶?bot 娑堟伅瑙﹀彂 AI銆傜鐞嗗憳鍙互鍦?Telegram 閲屼娇鐢ㄦ寜閽厤缃ā鍨嬨€佹煡鐪嬬敤閲忓拰寮€鍏?bot銆?
## 1. 椤圭洰鏂囦欢

```text
.
├── index.js              # 鍞竴鍏ュ彛锛屽叏閮ㄩ€昏緫鍦ㄦ鏂囦欢
鈹?  鈹斺攢鈹€ index.js          # Worker 涓荤▼搴忥紝澶嶅埗鍒?Cloudflare 缃戦〉缂栬緫鍣?鈹溾攢鈹€ wrangler.toml         # 鍛戒护琛岄儴缃叉椂浣跨敤锛岀綉椤甸厤缃彲蹇界暐
鈹溾攢鈹€ agent.md              # 鍘熷闇€姹傛枃妗?鈹斺攢鈹€ 浣跨敤璇存槑.md           # 鏈鏄?```

## 2. 鍒涘缓 Telegram Bot

1. 鎵撳紑 Telegram锛屾悳绱?`@BotFather`銆?2. 鍙戦€?`/newbot`锛屾寜鎻愮ず鍒涘缓 bot銆?3. 澶嶅埗 BotFather 杩斿洖鐨?`BOT_TOKEN`锛屽悗闈㈣濉埌 Cloudflare 鐜鍙橀噺閲屻€?4. 鍙戦€?`/setprivacy`锛岄€夋嫨浣犵殑 bot锛岀劧鍚庨€夋嫨 `Disable`銆?5. 鍙戦€?`/setjoingroups`锛岄€夋嫨浣犵殑 bot锛岀劧鍚庨€夋嫨 `Enable`銆?6. 濡傞渶鏀寔 Inline Mode锛屽彂閫?`/setinline` 骞舵寜鎻愮ず寮€鍚€?
缇ょ粍閲岃璁?bot 鐪嬪埌 `@bot_username` 娑堟伅锛宍/setprivacy` 蹇呴』鏄?`Disable`銆?
## 3. 鑾峰彇绠＄悊鍛?ID

绠＄悊鍛?ID 鏄?Telegram 鐨勬暟瀛?user_id锛屼笉鏄敤鎴峰悕銆?
鎺ㄨ崘鏂规硶锛?
1. 鍦?Telegram 鎼滅储 `@userinfobot`銆?2. 缁欏畠鍙戦€佷换鎰忔秷鎭€?3. 澶嶅埗杩斿洖鐨勬暟瀛?ID銆?
澶氫釜绠＄悊鍛樺彲浠ョ敤鑻辨枃閫楀彿鍒嗛殧锛屼緥濡傦細

```text
123456789,987654321
```

## 4. Cloudflare 涓枃缃戦〉鍚庡彴閰嶇疆

### 4.1 鍒涘缓 KV 鍛藉悕绌洪棿

1. 鐧诲綍 Cloudflare 鎺у埗鍙般€?2. 宸︿晶鑿滃崟杩涘叆 **Workers 鍜?Pages**銆?3. 鎵惧埌 **KV** 鎴?**Workers KV**銆?4. 鐐瑰嚮 **鍒涘缓鍛藉悕绌洪棿**銆?5. 鍚嶇О鍙互濉細

```text
tg-visitor-bot-kv
```

6. 鍒涘缓瀹屾垚鍚庡厛涓嶇敤鎵嬪姩鍐欐暟鎹紝bot 浼氳嚜鍔ㄥ啓鍏ユā鍨嬮厤缃€佺姸鎬佸拰缁熻鏁版嵁銆?
### 4.2 鍒涘缓 Worker

1. 宸︿晶鑿滃崟杩涘叆 **Workers 鍜?Pages**銆?2. 鐐瑰嚮 **鍒涘缓搴旂敤绋嬪簭**銆?3. 閫夋嫨 **鍒涘缓 Worker**銆?4. Worker 鍚嶇О寤鸿濉啓锛?
```text
tg-visitor-bot
```

5. 鐐瑰嚮 **閮ㄧ讲** 鎴?**鍒涘缓**銆?6. 鍒涘缓瀹屾垚鍚庤繘鍏ヨ繖涓?Worker銆?
### 4.3 绮樿创浠ｇ爜

1. 鍦?Worker 椤甸潰鐐瑰嚮 **缂栬緫浠ｇ爜**銆?2. 鍒犻櫎榛樿绀轰緥浠ｇ爜銆?3. 鎵撳紑鏈」鐩殑 [index.js](D:/Code/sbb/璁垮bot/index.js)銆?4. 澶嶅埗鍏ㄩ儴鍐呭锛岀矘璐村埌 Cloudflare 缃戦〉缂栬緫鍣ㄣ€?5. 鐐瑰嚮 **淇濆瓨骞堕儴缃?*銆?
### 4.4 娣诲姞鐜鍙橀噺

1. 杩涘叆 Worker 椤甸潰銆?2. 鐐瑰嚮 **璁剧疆**銆?3. 鎵惧埌 **鍙橀噺鍜屾満瀵?*銆?4. 鍦?**鐜鍙橀噺** 閲屾坊鍔狅細

```text
鍙橀噺鍚嶇О锛欱OT_TOKEN
鍊硷細浣犵殑 Telegram Bot Token
```

鍐嶆坊鍔狅細

```text
鍙橀噺鍚嶇О锛欰DMIN_IDS
鍊硷細浣犵殑 Telegram 鏁板瓧 user_id
```

澶氫釜绠＄悊鍛樼ず渚嬶細

```text
123456789,987654321
```

鍙€夛細娣诲姞骞跺彂闄愬埗鍙橀噺銆?
```text
鍙橀噺鍚嶇О锛歁AX_CONCURRENT_REQUESTS
鍊硷細2
```

鍚箟锛氶檺鍒朵竴涓椂闂寸獥鍙ｅ唴鏈€澶氬厑璁稿灏戜釜妯″瀷璇锋眰銆傚～ `0` 鎴栦笉娣诲姞杩欎釜鍙橀噺琛ㄧず涓嶉檺鍒躲€傝繖涓檺鍒朵細鍚屾椂浣滅敤浜庢櫘閫氱兢缁勬秷鎭拰璁垮妯″紡娑堟伅銆?
鍙€夛細娣诲姞骞跺彂鏃堕棿绐楀彛鍙橀噺銆?
```text
鍙橀噺鍚嶇О锛欳ONCURRENCY_WINDOW_SECONDS
鍊硷細60
```

鍚箟锛氳缃檺娴佺獥鍙ｇ鏁般€備緥濡?`MAX_CONCURRENT_REQUESTS=1` 涓?`CONCURRENCY_WINDOW_SECONDS=60` 鏃讹紝60 绉掑唴绗?1 涓Е鍙戜細杩涘叆妯″瀷锛岀 2 涓Е鍙戜細鏀跺埌绻佸繖鎻愮ず銆?
娉ㄦ剰锛欳loudflare KV 鐨勮繃鏈熸椂闂存渶灏忔槸 60 绉掞紝鍥犳浠ｇ爜浼氭妸灏忎簬 60 鐨勭獥鍙ｅ€艰嚜鍔ㄦ寜 60 绉掑鐞嗐€?
淇濆瓨鍚庡椤甸潰鎻愮ず閲嶆柊閮ㄧ讲锛岀偣鍑婚噸鏂伴儴缃层€?
### 4.5 缁戝畾 KV

1. 杩涘叆 Worker 椤甸潰銆?2. 鐐瑰嚮 **璁剧疆**銆?3. 鎵惧埌 **缁戝畾**銆?4. 鐐瑰嚮 **娣诲姞缁戝畾**銆?5. 绫诲瀷閫夋嫨 **KV 鍛藉悕绌洪棿**銆?6. 鍙橀噺鍚嶇О蹇呴』濉啓锛?
```text
KV
```

7. KV 鍛藉悕绌洪棿閫夋嫨鍒氭墠鍒涘缓鐨?`tg-visitor-bot-kv`銆?8. 淇濆瓨骞堕噸鏂伴儴缃层€?
娉ㄦ剰锛氬彉閲忓悕绉板繀椤绘槸 `KV`锛屽洜涓轰唬鐮侀噷浣跨敤鐨勬槸 `env.KV`銆?
## 5. 鑾峰彇 Worker 鍦板潃

Worker 閮ㄧ讲鍚庯紝Cloudflare 浼氭樉绀轰竴涓闂湴鍧€锛岀被浼硷細

```text
https://tg-visitor-bot.xxx.workers.dev
```

鎵撳紑杩欎釜鍦板潃锛屽鏋滅湅鍒帮細

```text
Telegram bot worker is running.
```

璇存槑 Worker 宸茬粡鍙互璁块棶銆?
## 6. 璁剧疆 Telegram Webhook

鎶婁笅闈㈤摼鎺ヤ腑鐨勪袱澶勬浛鎹㈡垚浣犺嚜宸辩殑鍊硷紝鐒跺悗鐩存帴澶嶅埗鍒版祻瑙堝櫒鍦板潃鏍忔墦寮€锛?
```text
https://api.telegram.org/bot浣犵殑BOT_TOKEN/setWebhook?url=浣犵殑Worker鍦板潃
```

绀轰緥锛?
```text
https://api.telegram.org/bot123456:ABC/setWebhook?url=https://tg-visitor-bot.xxx.workers.dev
```

鎴愬姛鏃朵細鐪嬪埌绫讳技杩斿洖锛?
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

妫€鏌?webhook 鐘舵€侊細

```text
https://api.telegram.org/bot浣犵殑BOT_TOKEN/getWebhookInfo
```

杩斿洖鍐呭閲屽簲鍖呭惈浣犵殑 Worker 鍦板潃锛屽苟涓?`last_error_message` 涓虹┖銆?
## 7. BotFather 椤甸潰璧勬枡淇敼

杩欎簺鎿嶄綔閮藉湪 Telegram 鐨?`@BotFather` 涓畬鎴愩€?
### 7.1 淇敼 bot 鏄剧ず鍚嶇О

```text
/setname
```

閫夋嫨浣犵殑 bot锛岀劧鍚庤緭鍏ユ柊鐨勬樉绀哄悕绉般€?
### 7.2 淇敼 bot 鐢ㄦ埛鍚?
```text
/setusername
```

鐢ㄦ埛鍚嶅繀椤讳互 `bot` 缁撳熬锛屼緥濡傦細

```text
my_visitor_ai_bot
```

### 7.3 淇敼绠€浠?
```text
/setdescription
```

杩欐槸 bot 鍒楄〃鍜岃祫鏂欓〉鏄剧ず鐨勭畝浠嬨€?
### 7.4 淇敼 About 鏂囨

```text
/setabouttext
```

杩欐槸璧勬枡椤甸噷鐨?About 鏂囨銆?
### 7.5 淇敼澶村儚

```text
/setuserpic
```

閫夋嫨 bot 鍚庝笂浼犲ご鍍忓浘鐗囥€?
### 7.6 璁剧疆鍛戒护鑿滃崟

```text
/setcommands
```

寤鸿濉啓锛?
```text
pz - 妯″瀷閰嶇疆
yl - Token 鐢ㄩ噺缁熻
zt - Bot 杩愯鐘舵€?tsc - 璁剧疆鍏ㄥ眬鎻愮ず璇?mcp - MCP 鏈嶅姟閰嶇疆
help - 浣跨敤甯姪
```

## 8. Telegram 鍐呬娇鐢ㄦ柟寮?
### 8.1 绠＄悊鍛樺懡浠?
```text
/pz
```

鎵撳紑妯″瀷閰嶇疆椤甸潰銆傚彲浠ユ坊鍔犳ā鍨嬨€佷慨鏀?API Key銆丅ase URL銆丄PI 璺緞銆佹ā鍨嬪悕绉般€佽緭鍏ヨ緭鍑烘ā鎬併€佹帹鐞嗙瓑绾э紝涔熷彲浠ヨ缃綋鍓嶆縺娲绘ā鍨嬪拰鍒犻櫎妯″瀷銆?
```text
/yl
```

鏌ョ湅浠婃棩鍜岀疮璁?Token 鐢ㄩ噺銆?
```text
/zt
```

鏌ョ湅鍜屽垏鎹?bot 杩愯鐘舵€併€傚仠姝㈠悗锛屾櫘閫氱敤鎴烽€氳繃缇ょ粍 @ 鎴栬瀹㈡ā寮忚Е鍙?bot 鏃讹紝浼氭敹鍒板叧闂彁绀猴紱绠＄悊鍛樼鑱?bot 鏃朵細鐩存帴鏄剧ず `/zt` 鐘舵€侀潰鏉匡紝鏂逛究閲嶆柊鍚姩銆?
```text
/tsc
```

璁剧疆鍏ㄥ眬鎻愮ず璇嶃€傜鐞嗗憳鍙戦€?`/tsc` 鍚庯紝鍐嶅彂閫佷竴娈垫彁绀鸿瘝锛宐ot 浼氫繚瀛樺埌 KV 鐨?`system_prompt`銆備箣鍚庢墍鏈?AI 瀵硅瘽閮戒細鎶婅繖娈靛唴瀹逛綔涓哄ぇ鍓嶆彁浼犵粰妯″瀷銆?
```text
/mcp
```

閰嶇疆 MCP 鏈嶅姟銆傜鐞嗗憳鍙互娣诲姞 MCP 鏈嶅姟骞舵媺鍙栧伐鍏峰垪琛ㄣ€傛坊鍔犳祦绋嬪寘鍚細

- 鍚嶇О锛氱敤鏉ュ尯鍒嗕笉鍚?MCP 鏈嶅姟
- 绫诲瀷锛氶€氳繃鎸夐挳閫夋嫨 `HTTP` 鎴?`SSE`
- 鍦板潃锛歁CP 鏈嶅姟 URL
- 鎻忚堪锛氬憡璇?LLM 杩欎釜鏈嶅姟鑳藉仛浠€涔?- 鍏抽敭璇嶏細澶氫釜鍏抽敭璇嶇敤閫楀彿鍒嗛殧锛屽尮閰嶅埌鍏抽敭璇嶆椂浼樺厛浣跨敤璇ユ湇鍔?- 鑷畾涔夎姹傚ご锛氬彲閫夛紝姣忚涓€涓紝渚嬪 `Authorization=Bearer xxx`

淇濆瓨鍚庯紝bot 浼氬皾璇曞璇?MCP 鏈嶅姟鎵ц `initialize` 鍜?`tools/list`锛屽苟鎶婂伐鍏峰垪琛ㄤ繚瀛樺埌 KV銆傚伐鍏峰垪琛ㄩ〉闈㈡瘡琛屾樉绀猴細

```text
宸ュ叿鍚嶇О / 鍚敤鐘舵€?```

鐐瑰嚮宸ュ叿鍚嶇О鍙煡鐪嬪伐鍏疯鎯咃紝鍖呮嫭锛?
```text
宸ュ叿鎻忚堪 / Tool Description
杈撳叆鍙傛暟 / Parameters
```

鐐瑰嚮鍚敤鐘舵€佹寜閽彲浠ュ垏鎹㈣宸ュ叿鍚敤鎴栧叧闂€?
瀵硅瘽鏃剁殑 MCP 璋冪敤瑙勫垯锛?
- 濡傛灉鐢ㄦ埛娑堟伅鍛戒腑鏌愪釜 MCP 鏈嶅姟鐨勫叧閿瘝锛宐ot 浼氫紭鍏堣妯″瀷鍦ㄨ鏈嶅姟鐨勫惎鐢ㄥ伐鍏蜂腑瑙勫垝璋冪敤锛屽苟鎵ц `tools/call`
- 濡傛灉娌℃湁鍛戒腑鍏抽敭璇嶏紝bot 浼氭妸鎵€鏈夊凡鍚敤 MCP 鏈嶅姟鐨勬弿杩般€佸伐鍏锋弿杩板拰鍙傛暟浜ょ粰褰撳墠妯″瀷锛岃妯″瀷鑷鍒ゆ柇鏄惁闇€瑕佽皟鐢?- MCP 宸ュ叿杩斿洖缁撴灉鍚庯紝浼氫綔涓轰笂涓嬫枃浜ょ粰鏈€缁堝洖绛旀ā鍨?- 濡傛灉宸ュ叿璋冪敤澶辫触锛岄敊璇俊鎭篃浼氫綔涓轰笂涓嬫枃鎻愪緵缁欐ā鍨嬶紝璁╂ā鍨嬭嚜鐒惰鏄庢棤娉曞彇寰楄閮ㄥ垎淇℃伅
- 鐩墠鏈€澶氫竴娆¤鍒?3 涓?MCP 宸ュ叿璋冪敤

### 8.2 鏅€氱敤鎴峰璇?
绉佽亰锛氭櫘閫氱敤鎴蜂笉鏀寔绉佽亰锛屼細鏀跺埌绉佽亰闄愬埗鎻愮ず銆傜鐞嗗憳绉佽亰浠嶅彲鐢ㄤ簬绠＄悊锛涘綋 bot 澶勪簬鍏抽棴鐘舵€佹椂锛岀鐞嗗憳绉佽亰浼氱洿鎺ユ樉绀鸿繍琛岀姸鎬佸紑鍏抽〉闈€?
缇ょ粍锛氭弧瓒充换鎰忎竴绉嶆潯浠朵細瑙﹀彂锛?
```text
@浣犵殑bot鐢ㄦ埛鍚?闂鍐呭
```

鎴栫洿鎺ュ洖澶?bot 鍙戝嚭鐨勬秷鎭€?
涔熷彲浠ュ洖澶嶄换鎰忎竴鏉℃秷鎭紝骞跺湪鍥炲鍐呭閲屽彧鍐欙細

```text
@浣犵殑bot鐢ㄦ埛鍚?```

杩欑鎯呭喌涓嬶紝bot 浼氭妸浣犲洖澶嶇殑閭ｆ潯娑堟伅褰撲綔闂銆傚鏋滀綘鍦?`@bot` 鍚庨潰缁х画鍐欒ˉ鍏呭唴瀹癸紝bot 浼氬悓鏃跺弬鑰冭鍥炲娑堟伅鍜屼綘鐨勮ˉ鍏呭唴瀹广€?
鏅€氱兢缁勬秷鎭Е鍙戝悗锛宐ot 浼氬厛鍥炲锛?
```text
鍝硷紝榄斿姏鍔犺浇涓€︹€︿笉鍑嗗偓锛屽啀鍌惛骞蹭綘鍝︼紒(锛烇箯锛?
```

妯″瀷杩斿洖缁撴灉鍚庯紝bot 浼氭妸杩欐潯鎻愮ず娑堟伅缂栬緫鎴愭渶缁堝洖澶嶃€?
璁垮妯″紡锛氬鏋滃湪 BotFather 涓紑鍚簡 **Guest Chat Mode**锛岀敤鎴峰彲浠ュ湪鏈個璇?bot 鍏ョ兢鐨勬儏鍐典笅锛屽湪娑堟伅寮€澶磋緭鍏ワ細

```text
@浣犵殑bot鐢ㄦ埛鍚?闂鍐呭
```

璁垮妯″紡娑堟伅浼氶€氳繃 Telegram 鐨?`guest_message` 浜嬩欢瑙﹀彂锛宐ot 浼氫娇鐢?`answerGuestQuery` 鍥炲銆傝瀹㈡ā寮忔帴鍙ｄ笉鑳藉厛鍙戔€滄鍦ㄦ€濊€冣€濆啀缂栬緫锛屽洜姝や細鍦ㄦā鍨嬪畬鎴愬悗涓€娆℃€ц繑鍥炵粨鏋溿€備慨鏀逛唬鐮佸悗闇€瑕佸湪 Cloudflare Worker 涓噸鏂扮矘璐村苟閮ㄧ讲鏈€鏂扮殑 `index.js`銆?
## 9. 娣诲姞绗竴涓ā鍨?
1. 绠＄悊鍛樼粰 bot 鍙戦€?`/pz`銆?2. 鐐瑰嚮 `馃敶 娣诲姞妯″瀷`銆?3. 鎸夋彁绀轰緷娆″彂閫侊細
   - 鎻愪緵鍟嗗悕绉帮紝渚嬪 `OpenAI`
   - API Key
   - API Base URL锛屼緥濡?`https://api.openai.com`
   - API 璺緞锛屼緥濡?`/v1/chat/completions`
   - 妯″瀷鍚嶇О锛屼緥濡?`gpt-4o`
4. 娣诲姞瀹屾垚鍚庯紝bot 浼氳嚜鍔ㄥ啓鍏?KV銆?5. 濡傛灉涔嬪墠娌℃湁婵€娲绘ā鍨嬶紝浼氳嚜鍔ㄨ涓哄綋鍓嶆ā鍨嬨€?6. 鍦ㄦā鍨嬭鎯呴〉鍙互缁х画璋冩暣杈撳叆妯℃€併€佽緭鍑烘ā鎬佸拰鎺ㄧ悊绛夌骇銆?
鍏煎 OpenAI Chat Completions 椋庢牸鎺ュ彛鐨勭ず渚嬶細

```text
鎻愪緵鍟嗗悕绉帮細OpenAI
API Base URL锛歨ttps://api.openai.com
API 璺緞锛?v1/chat/completions
妯″瀷鍚嶇О锛歡pt-4o
```

濡傛灉浣跨敤涓浆鎺ュ彛锛岄€氬父鍙渶瑕佹妸 `API Base URL` 鏀规垚涓浆骞冲彴缁欎綘鐨勫湴鍧€銆?
Gemini 瀹樻柟鎺ュ彛绀轰緥锛?
```text
鎻愪緵鍟嗗悕绉帮細Gemini
API Base URL锛歨ttps://generativelanguage.googleapis.com
API 璺緞锛?v1beta
妯″瀷鍚嶇О锛歡emini-2.5-flash
```

娉ㄦ剰锛欸emini 鐨勬ā鍨嬪悕绉拌濉啓 API model code锛屼緥濡?`gemini-2.5-flash`锛屼笉瑕佸～鍐欏睍绀哄悕锛屼緥濡?`Gemini 3.5 Flash`銆備唬鐮佷細鑷姩璋冪敤 `/v1beta/models/{妯″瀷鍚嶇О}:generateContent`銆?
## 10. KV 鏁版嵁璇存槑

bot 浼氳嚜鍔ㄥ湪 KV 涓娇鐢ㄨ繖浜涢敭锛?
```text
models                         # 妯″瀷鍚嶆暟缁?model:{妯″瀷鍚峿                  # 鍗曚釜妯″瀷閰嶇疆
active_model                   # 褰撳墠婵€娲绘ā鍨嬪悕
bot_status                     # running 鎴?stopped
stats:today:{YYYY-MM-DD}       # 浠婃棩 token 鐢ㄩ噺
stats:total                    # 绱 token 鐢ㄩ噺
session:{user_id}              # 绠＄悊鍛樼紪杈戞祦绋嬩复鏃剁姸鎬侊紝5 鍒嗛挓杩囨湡
telegram:me                    # bot 淇℃伅缂撳瓨
runtime:active_requests        # 褰撳墠妯″瀷璇锋眰骞跺彂璁板綍锛岀煭鏃堕棿鑷姩杩囨湡
system_prompt                  # /tsc 璁剧疆鐨勫叏灞€鎻愮ず璇?mcp_services                   # MCP 鏈嶅姟 id 鍒楄〃
mcp:{id}                       # 鍗曚釜 MCP 鏈嶅姟閰嶇疆鍜屽伐鍏峰垪琛?```

涓€鑸笉闇€瑕佹墜鍔ㄦ敼 KV銆傛ā鍨嬮厤缃缓璁兘鍦?Telegram 鐨?`/pz` 椤甸潰閲屼慨鏀广€?
## 11. 鏇存柊浠ｇ爜

濡傛灉浣犱慨鏀逛簡 [index.js](D:/Code/sbb/璁垮bot/index.js)锛岀綉椤靛悗鍙版洿鏂版柟寮忔槸锛?
1. 杩涘叆 Cloudflare 鐨?**Workers 鍜?Pages**銆?2. 鎵撳紑浣犵殑 Worker銆?3. 鐐瑰嚮 **缂栬緫浠ｇ爜**銆?4. 绮樿创鏂扮殑浠ｇ爜銆?5. 鐐瑰嚮 **淇濆瓨骞堕儴缃?*銆?
濡傛灉鍙槸閫氳繃 Telegram 鐨?`/pz` 淇敼妯″瀷閰嶇疆锛屼笉闇€瑕侀噸鏂伴儴缃?Worker銆?
## 12. 鏌ョ湅鏃ュ織

Cloudflare 涓枃鐣岄潰涓細

1. 杩涘叆浣犵殑 Worker銆?2. 鎵撳紑 **鏃ュ織** 鎴?**瀹炴椂鏃ュ織**銆?3. 鍙戦€?Telegram 娑堟伅娴嬭瘯銆?4. 濡傛灉妯″瀷璋冪敤澶辫触锛屽彲浠ュ湪杩欓噷鐪嬮敊璇俊鎭€?
涓嶅悓 Cloudflare 闈㈡澘鐗堟湰鐨勫悕绉板彲鑳界暐鏈変笉鍚岋紝閫氬父浼氭樉绀轰负 **鏃ュ織**銆?*瀹炴椂鏃ュ織**銆?*璋冪敤鏃ュ織** 鎴栫被浼煎悕绉般€?
## 13. 甯歌闂

### bot 鍦ㄧ兢閲屼笉鍥炲

妫€鏌ワ細

1. BotFather 鐨?`/setprivacy` 鏄惁璁剧疆涓?`Disable`銆?2. 鏄惁鍦ㄦ秷鎭腑 `@bot_username`銆?3. 鏄惁鍥炲鐨勬槸 bot 鑷繁鍙戝嚭鐨勬秷鎭€?4. `/zt` 涓姸鎬佹槸鍚︿负杩愯涓€?
### 璁垮妯″紡涓嶅洖澶?
妫€鏌ワ細

1. BotFather 閲?**Guest Chat Mode** 鏄惁宸茬粡鎵撳紑銆?2. 娑堟伅鏄惁浠?`@浣犵殑bot鐢ㄦ埛鍚峘 寮€澶淬€?3. Cloudflare Worker 鏄惁宸茬粡閲嶆柊閮ㄧ讲鏈€鏂颁唬鐮併€?4. Webhook 鏄惁姝ｇ‘璁剧疆鍒板綋鍓?Worker 鍦板潃銆?5. Worker 鏃ュ織閲屾槸鍚︽湁 `Telegram`銆乣KV` 鎴栨ā鍨嬭皟鐢ㄩ敊璇€?6. 濡傛灉鏃ュ織閲屽彧鏈?`POST ... status 200`锛屼絾娌℃湁妯″瀷璋冪敤閿欒锛岄€氬父璇存槑 Worker 浠ｇ爜浠嶆槸鏃х増锛屾病鏈夊鐞?`guest_message`銆?
### 绠＄悊鍛樻棤娉曚娇鐢?`/pz`

妫€鏌?Cloudflare Worker 鐨勭幆澧冨彉閲忥細

```text
ADMIN_IDS
```

瀹冨繀椤绘槸 Telegram 鏁板瓧 user_id锛屼笉鏄敤鎴峰悕锛屼篃涓嶆槸鎵嬫満鍙枫€?
### 鎻愮ず KV 閿欒鎴栨病鏈夊搷搴?
妫€鏌?Worker 鐨?KV 缁戝畾锛?
```text
鍙橀噺鍚嶇О锛欿V
```

蹇呴』鏄ぇ鍐?`KV`銆?
### 妯″瀷璋冪敤澶辫触

妫€鏌ワ細

1. API Key 鏄惁鏈夋晥銆?2. Base URL 鏄惁涓嶅甫鏈€鍚庣殑鎺ュ彛璺緞銆?3. API 璺緞鏄惁姝ｇ‘锛屼緥濡?`/v1/chat/completions`銆?4. 妯″瀷鍚嶇О鏄惁鍜屾帴鍙ｆ敮鎸佺殑鍚嶇О涓€鑷淬€?5. Worker 鏃ュ織涓殑閿欒淇℃伅銆?
### 鎻愮ず榄斿姏閫氶亾鎸ゆ弧

璇存槑褰撳墠闄愭祦绐楀彛鍐呯殑妯″瀷璇锋眰鏁伴噺杈惧埌浜?`MAX_CONCURRENT_REQUESTS`銆傚彲浠ョ瓑寰?`CONCURRENCY_WINDOW_SECONDS` 绉掑悗鍐嶈瘯锛屾垨鑰呭埌 Cloudflare Worker 鐨?**璁剧疆** 鈫?**鍙橀噺鍜屾満瀵?* 涓皟澶?`MAX_CONCURRENT_REQUESTS`銆俙CONCURRENCY_WINDOW_SECONDS` 鏈€灏忔寜 60 绉掑鐞嗐€?
## 14. Wrangler 鍛戒护琛屾柟寮忥紙鍙€夛級

濡傛灉浣犱互鍚庢兂鐢ㄥ懡浠よ閮ㄧ讲锛屽彲浠ヤ娇鐢?[wrangler.toml](D:/Code/sbb/璁垮bot/wrangler.toml)銆?
瀹夎 Wrangler锛?
```bash
npm install -g wrangler
```

鐧诲綍锛?
```bash
wrangler login
```

鍒涘缓 KV锛?
```bash
wrangler kv namespace create KV
```

鎶婅緭鍑虹殑 `id` 濉埌 `wrangler.toml`锛岀劧鍚庨儴缃诧細

```bash
wrangler deploy
```


