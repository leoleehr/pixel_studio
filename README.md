# Pixel Studio 畫素音樂工作坊 互動教學平台

畫素音樂工作坊 Pixel Studio 的課程網站，下設四個課程：

| 課程 | 中文名稱 | 目錄 | 狀態 |
| --- | --- | --- | --- |
| Vocal Lab | 流行歌唱 | `site/vocal/` | 遷移中（目前內容仍在根目錄） |
| Guitar Lab | 民謠吉他 | `site/guitar/` | 12 章課綱；第 1 章投影片完成，問卷、講義與教案上線 |
| Piano Lab | 流行鋼琴 | `site/piano/` | 規劃中 |
| Songwriting Lab | 詞曲創作 | `site/songwriting/` | 規劃中 |

## 目錄

| 路徑 | 說明 |
| --- | --- |
| `site/` | 對外發布的網站內容，部署只發布這個資料夾 |
| `site/assets/` | 共用資產：沿用 Vocal Lab 的版面（site／studio／deck CSS）、投影片引擎（deck.js）、互動元件（interact.js）、後台（backend.js），以及品牌標誌 |
| `site/guitar/` | Guitar Lab：首頁、`ch01/` 等各章投影片、`survey.html`＋`surveys.js`、`handbook.html`＋`handbook.md`、`guitar.js`（插圖、和弦圖、調音器、練習器）、`theme.css`（主色 CI 綠） |
| `tools/` | 教材建置與驗證工具 |
| `backend/` | Google Apps Script 後台（見 `backend/README.md`） |

根目錄的 `index.html`、`handbook.html`、`slides/`、`assets/` 等是從 [vocal_music](https://github.com/leoleehr/vocal_music) 帶過來的 Vocal Lab，Git 歷史完整保留。第二階段會整理進 `site/vocal/`。

## 本機預覽

```bash
python -m http.server 8765 --directory site
```

## 部署

正式部署使用 Cloudflare，只發布 `site/`。舊站 https://leoleehr.github.io/vocal_music/ 在新站驗證完成前持續運作。

原始教材、講義原稿與歌曲和弦譜涉及第三方著作權，沒有放進這個 repo。
