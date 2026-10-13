# Pixel Studio 專案工作規則

## RESUME

- 重新開啟專案、RESUME 或接續工作時，先讀 `docs/work-memory.md` 與 `docs/pixel-studio-project-brief.md`，再確認 Git 狀態、遠端與未提交工作。
- 第一則進度訊息使用繁體中文 BRIEF：專案用途、已完成事項、版本／部署紀錄、待辦。區分已完成、規劃中與待驗證。
- 一般溝通使用繁體中文。
- 記憶裡的部署狀態是過去的確認結果；報告線上狀態前要重新查證。
- 完成工作後，更新 `docs/work-memory.md` 的重要決策、驗證結果與未完成事項。

## 版本管理

- GitHub：`https://github.com/leoleehr/pixel_studio`，正式分支 `main`。完成有意義的修改後 commit 並推送。
- `docs/` 只留在本機，不提交（見 `.gitignore`）。公開 repo 內的檔案一律視為公開內容。
- 不提交原始教材、分析報告、`.qa/` 暫存與私人備課文件。
- 四個 Lab 共用這一份 `.git`，不在子目錄另外 `git init`。

## 網站

- 對外發布內容放在 `site/`：`vocal/`、`guitar/`、`piano/`、`songwriting/`，共用資產在 `assets/`。
- 正式部署使用 Cloudflare（使用者設定），只發布 `site/`。路徑一律用相對路徑，網站放在網域根目錄或子路徑都要能運作。
- 舊站 `https://leoleehr.github.io/vocal_music/` 在新站驗證完成前持續可用，不切斷舊網址與 QR Code。

## 品牌識別

- 建置網站時使用既有品牌識別 CI v1.0，母檔在 `C:\Agent\UIUX\brand\pixel-studio\01-current\Pixel-Studio-CI-v1`。先讀該資料夾的 `README.md` 與 `03-guidelines/Pixel-Studio-CI-Guide.pdf`。
- 色彩參數取自 `03-guidelines/brand-tokens.css`／`brand-tokens.json`；標誌取自 `01-logos/` 的 SVG。只複製網站需要的發布資產到 `site/assets/`，不搬整個品牌資料夾。
- 標誌等比例縮放，不重排、不重打字標、不另加透明度；小尺寸用 `symbol-compact-color.svg`（至少 64 px）。正式 Slogan：We Perform the Pixel of Music。
