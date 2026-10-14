# Pixel Studio 畫素音樂工作坊 互動教學平台

畫素音樂工作坊 Pixel Studio 的課程網站，下設四個課程：

| 課程 | 中文名稱 | 目錄 | 狀態 |
| --- | --- | --- | --- |
| Vocal Lab | 流行歌唱 | `site/vocal/` | 六堂課投影片、講義與教案、課前問卷，已移入新平台 |
| Guitar Lab | 民謠吉他 | `site/guitar/` | 12 章投影片、講義與教案、課前問卷全部完成 |
| Piano Lab | 流行鋼琴 | `site/piano/` | 規劃中 |
| Songwriting Lab | 詞曲創作 | `site/songwriting/` | 規劃中 |

## 目錄

| 路徑 | 說明 |
| --- | --- |
| `site/` | 對外發布的網站內容，部署只發布這個資料夾 |
| `site/assets/` | 共用資產：沿用 Vocal Lab 的版面（site／studio／deck CSS）、投影片引擎（deck.js）、互動元件（interact.js）、後台（backend.js），以及品牌標誌 |
| `site/vocal/` | Vocal Lab：首頁、`slides/lesson-01/` 到 `lesson-06/` 投影片、`survey.html`＋`surveys.js`、`handbook.html`＋`course-handbook.md`、`handbook-print.html`＋`vocal-class-handbook.pdf`、`songs.js`、`og-image.png`。沿用舊站的 `pixel:*` 儲存鍵，學員在舊站留下的資料在同網域下可直接沿用 |
| `site/guitar/` | Guitar Lab：首頁、`ch01/` 等各章投影片、`survey.html`＋`surveys.js`、`handbook.html`＋`handbook.md`、`guitar.js`（插圖、和弦圖、調音器、練習器）、`theme.css`（主色 CI 綠） |
| `tools/` | 教材建置與驗證工具 |
| `backend/` | Google Apps Script 後台（見 `backend/README.md`） |
| `tools/decks/` | Guitar Lab 各章投影片原稿；`python -X utf8 tools/mkdeck.py 1 2 …` 產生 `site/guitar/chNN/` |
| `tools/build_handbook.py` | 由投影片原稿產生第 2–12 章講義與教案（`site/guitar/handbook.md`） |
| `tools/ready.py` | 更新 Guitar Lab 首頁與講義的投影片連結 |
| `site/guitar/songs.js` | 原講義曲例與 YouTube 影片（講義、列印版與投影片共用） |
| `site/guitar/handbook-print.html` | A4 列印版；以 Chrome 無頭模式輸出 `guitar-handbook.pdf`（改講義後需重新產生） |

Vocal Lab 從 [vocal_music](https://github.com/leoleehr/vocal_music) 匯入，Git 歷史完整保留（`git log --follow site/vocal/index.html`）。

## 本機預覽

```bash
python -m http.server 8765 --directory site
```

## 部署

正式部署使用 Cloudflare，只發布 `site/`。舊站 https://leoleehr.github.io/vocal_music/ 在新站驗證完成前持續運作。

原始教材、講義原稿與歌曲和弦譜涉及第三方著作權，沒有放進這個 repo。
