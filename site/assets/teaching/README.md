# 教學圖像

這批圖像供 Guitar、Piano、Vocal Lab 示範實物外觀與動作。

- WebP 圖像為 AI 製作的寫實教學示意，並非實際課堂拍攝紀錄。
- 指板、指法順序、鍵盤音位與動作箭頭使用可編輯 SVG。和弦位置以標示的弦序、格位與指號為準；照片輔助觀察手部姿態。
- 木色、筒身、內部構造與零件外觀會因製造商而異。
- `tongue-anatomy.branded.svg` 為 AI 重繪的口腔剖面示意，呈現舌尖靠前與稍向後的構形；`tongue.branded.svg` 保留可編輯的大字中文標示，並非個人的醫療影像。
- `voice-anatomy.branded.svg?v=20261015faces2` 依美國 NIDCD 的 Taking Care of Your Voice 教育資料重繪，採繁體中文標示，呈現發聲構造及吞嚥、發聲、安靜呼吸三種聲帶狀態；屬 AI 教學示意。`resonance.branded.svg?v=20261015faces2` 使用該重繪圖加上中文教學說明。

## Vocal Lab 示範主角

人物示範圖以使用者提供的人像參考，透過 AI 編輯製作。原始參考照片不包含在發布資產中；示範動作與口型為教學重建。

## 參考來源

- [NIDCD：Taking Care of Your Voice](https://www.nidcd.nih.gov/health/taking-care-your-voice)
- [NIDCD：How does the human body produce voice and speech?](https://www.nidcd.nih.gov/news/multimedia/how-does-human-body-produce-voice-and-speech-text-version)
- [ASHA：Resonance Disorders](https://www.asha.org/practice-portal/clinical-topics/resonance-disorders/)
- [Tongue posture and vocal tract shape in singing](https://pmc.ncbi.nlm.nih.gov/articles/PMC7891883/)

33 組圖像的頁面、圖說與資料來源由 `tools/teaching_visuals_manifest.json` 管理。`tools/teaching_visuals.py` 安裝投影片入口與講義圖解；章節重建時會保留它們。

## 白色聲紋印花 T-shirt

`*-white.webp` 為以 imagegen 重製的人物圖。白色棉質服裝與彩色聲紋印花整合於影像內，印花依衣料的摺痕、光影及視角呈現；衣服上僅使用聲紋圖形。圖像仍為 AI 教學重建，原始人像參考照不隨網站發布。

## Corner identification

Website artwork uses `.branded.svg` derivatives, with the original image embedded unchanged and an official monochrome horizontal logo. Run `python -X utf8 tools/brand_artwork.py` after rebuilding original artwork, then prerender handbooks and regenerate PDFs. Layout decisions are recorded in `tools/artwork_branding_manifest.json`; source artwork and the full-resolution official PNG logos are retained.
