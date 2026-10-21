# 課程資料後台（Google 試算表 + Google Drive）

Pixel Studio 四個 Lab（Vocal、Guitar、Piano、Songwriting）網站上的問卷、課堂互動、出場券、練習紀錄與錄音，會送到老師的 Google 試算表，錄音檔存進 Google Drive。後台由 Google Apps Script 接收資料，不需要另外架伺服器。

## 會收到哪些資料

| 試算表分頁 | 內容 |
| --- | --- |
| 班級名單 | 可送出資料的 Gmail；學員第一次登入且課程代碼正確時自動加入並核准；老師改成「停用」或「待確認」即停止寫入（「待確認」可用選單「核准所有待確認學員」恢復） |
| 學員名單 | Gmail、姓名、學校科系／公司名稱、參與課程、首次登錄與最後活動時間、送出次數；以 Gmail 辨認同一位學員 |
| 「Vocal Lab｜第一堂課前問卷（入班問卷）」等 | 每份問卷一個分頁，分頁名稱以課程開頭；一列一位學員，一欄一題 |
| 互動紀錄 | 選擇題、排序遊戲、音準挑戰、吐氣測量、作業勾選、歌詞換氣標記、舉手計票、分組計分、歌手與歌曲調查等，含課程與堂次 |
| 出場券 | 3-2-1 出場券的三個回答 |
| 練習紀錄 | 七天練習紀錄表 |
| 錄音 | 錄音名稱、長度與 Drive 檔案連結（檔案存在「Pixel Studio_學員錄音／課程／第 N 堂」資料夾） |
| 歌詞 | 老師填寫的換氣練習歌詞：「代碼」欄填 `l2-name`（Vocal 第二堂《刻在我心底的名字》），「歌詞」欄貼上主歌與副歌。學員手機以課程代碼讀取，歌詞不會放進公開網站 |

學員第一次送出資料時，需要以 Google 帳戶登入（一般 Gmail 或學校的 Google 帳號都可以），並填寫姓名、學校科系／公司名稱與「課程代碼」。資料要同時通過三道確認才會寫入：

1. **Google 登入**：後台向 Google 確認登入憑證屬於這個網站、信箱已通過驗證，再發給學員一張 180 天有效的登入證明，學員不必每小時重新登入。
2. **課程代碼**：只存在 Apps Script 的設定裡，不在公開的網站原始碼中。四個 Lab 共用同一組代碼。
3. **班級名單**：Gmail 的狀態必須是「核准」。新學員登入時自動核准；狀態被改成「待確認」時，資料會先存在學員的瀏覽器，恢復核准之後自動補送，不會遺失。老師本人的 Gmail 免核准。

LINE、Facebook、Instagram 內建的瀏覽器無法使用 Google 登入；網站會提示學員改用 Chrome 或 Safari，LINE 另有「用預設瀏覽器開啟」按鈕。

## 安裝步驟（約 10 分鐘，只需做一次）

1. 建立或開啟一份 Google 試算表，例如「Pixel Studio｜課程資料後台」。
2. 點選單「擴充功能 → Apps Script」，開啟程式編輯器。
3. 刪除編輯器裡原本的內容，貼上 `apps-script/Code.gs` 全部內容（也可以開啟 https://raw.githubusercontent.com/leoleehr/pixel_studio/main/backend/apps-script/Code.gs 全選複製），按「儲存」。
4. 左側「專案設定」（齒輪）→ 勾選「在編輯器中顯示 appsscript.json 資訊清單檔案」，回到編輯器開啟 `appsscript.json`，貼上本資料夾的 `apps-script/appsscript.json`，儲存。這一步會將時區設為台北。
5. 在編輯器上方的函式選單選擇 `setup`，按「執行」。第一次執行會要求授權：選擇你的 Google 帳號 →「進階」→「前往（不安全）」→「允許」。程式需要寫入試算表與建立 Drive 資料夾，才會出現這個畫面。
6. 回到試算表重新整理，會看到各個分頁與新的「Pixel Studio 後台」選單；課程代碼預設為 `PIXEL2026`，可從「Pixel Studio 後台 → 設定課程代碼」修改。
7. 回到 Apps Script，點右上「部署 → 新增部署作業」：
   - 類型選「網頁應用程式」
   - 執行身分：「我」
   - 誰可以存取：「所有人」（不要選「擁有 Google 帳戶的所有人」，學員不必登入 Google）
   - 按「部署」，複製「網頁應用程式網址」（結尾是 `/exec`）
8. 測試網址：直接開啟應看到 `{"ok":true,"service":"Pixel Studio 課程資料後台"}`；網址後加 `?code=PIXEL2026` 應看到 `"valid":true`。
9. 將網址填進網站的 `site/assets/config.js`：

   ```js
   window.PIXEL_CONFIG = {
     endpoint: 'https://script.google.com/macros/s/……/exec',
     googleClientId: '……apps.googleusercontent.com'
   };
   ```

   推送並部署到 Cloudflare 後，網站就會開始將資料送進試算表。網址也可以直接交給 Claude 代為填入與部署。

## Google 登入設定（只需做一次）

1. 開啟 https://console.cloud.google.com/projectcreate ，建立專案「Pixel Studio」。
2. 「API 和服務 → OAuth 同意畫面」：應用程式名稱 Pixel Studio、目標對象「外部」，建立後在「目標對象」按「發布應用程式」。只使用信箱與姓名，不需要送審。
3. 「用戶端 → 建立用戶端」：類型「網頁應用程式」，已授權的 JavaScript 來源填網站網址（例如 `https://pixel-studio.musicallanding.workers.dev`，本機測試另加 `http://localhost:8780`）。
4. 將「用戶端 ID」同時填進 `Code.gs` 的 `GOOGLE_CLIENT_ID` 與網站 `site/assets/config.js` 的 `googleClientId`。用戶端 ID 是公開資訊；用戶端密碼用不到。
5. 在 Apps Script 執行一次 `setup`，授權新增的「連線到外部服務」權限，再部署新版本。

## 日後修改程式

修改 `Code.gs` 後，需要「部署 → 管理部署作業 → 編輯（鉛筆）→ 版本選『新版本』→ 部署」，網址不會改變。不要按「新增部署作業」，那會產生新網址。

舊版（流行歌唱班）試算表可以直接換上新版程式：表頭缺少的「課程」「參與課程」欄會自動補在最後，既有資料不會移動。

## 隱私與注意事項

- 試算表與錄音資料夾只有老師本人能開啟；錄音檔不會公開分享。
- 學員在網站上的資料（Gmail 登入證明、姓名、學校科系／公司名稱、課程代碼、尚未送出的紀錄）存在各自的瀏覽器。共用電腦時，可在「學員資料」視窗按「換人使用」清除。
- 停用某位學員：將「班級名單」的狀態改為「停用」，一分鐘內生效。
- 網路中斷或後台尚未設定時，資料會先存在學員的瀏覽器，連線後自動補送。
- Apps Script 每天有執行次數與總時間的免費額度，一般班級的使用量遠低於上限。
