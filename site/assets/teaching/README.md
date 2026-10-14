# 教學圖像

這批圖像供 Guitar、Piano、Vocal Lab 示範實物外觀與動作。

- WebP 圖像為 AI 製作的寫實教學示意，並非實際課堂拍攝紀錄。
- 指板、指法順序、鍵盤音位與動作箭頭使用可編輯 SVG。和弦位置以標示的弦序、格位與指號為準；照片輔助觀察手部姿態。
- 木色、筒身、內部構造與零件外觀會因製造商而異。
- `voice-anatomy.jpg` 取自美國 NIDCD 的 Taking Care of Your Voice 教育資料；`resonance.svg` 使用該圖加上中文教學說明。

## Vocal Lab 示範主角

人物示範圖以使用者提供的人像參考，透過 AI 編輯製作。原始參考照片不包含在發布資產中；示範動作與口型為教學重建。

## 參考來源

- [NIDCD：Taking Care of Your Voice](https://www.nidcd.nih.gov/health/taking-care-your-voice)
- [NIDCD：How does the human body produce voice and speech?](https://www.nidcd.nih.gov/news/multimedia/how-does-human-body-produce-voice-and-speech-text-version)
- [ASHA：Resonance Disorders](https://www.asha.org/practice-portal/clinical-topics/resonance-disorders/)
- [Tongue posture and vocal tract shape in singing](https://pmc.ncbi.nlm.nih.gov/articles/PMC7891883/)

33 組圖像的頁面、圖說與資料來源由 `tools/teaching_visuals_manifest.json` 管理。`tools/teaching_visuals.py` 安裝投影片入口與講義圖解；章節重建時會保留它們。

## 黑色品牌 T-shirt 圖像

`*-uniform.svg` 內嵌以 imagegen 重製的人物照片或插畫，再以原始 `horizontal-transparent.svg` 加入聲紋與彩色字標，保留官方向量比例與色彩。照片仍為 AI 教學重建。`tools/build_uniform_art.py` 與 `tools/uniform_art_manifest.json` 管理品牌應用圖，原始人像參考照不隨網站發布。
