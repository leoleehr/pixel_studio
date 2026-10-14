/* ===== Songwriting Lab 問卷內容（與講義的課前問卷、課程回饋一致） =====
 * 題型：single 單選、multi 複選、text 長文字、short 短文字、number 數字、scale 1–5 分、matrix 多項 1–5 分自評
 */
window.PIXEL_SURVEYS = [
  { id: 'sw-pre-1', lesson: 1, title: '第一堂課前問卷（入班問卷）', intro: '瞭解你的音樂經驗、創作經驗與期待，老師會依照結果安排分組與課程。', questions: [
    { q: '會演奏的樂器', type: 'multi', options: ['從未學過樂器', '鋼琴或鍵盤', '吉他', '烏克麗麗', '鼓', '管弦樂器'], other: true },
    { q: '創作歌曲的經驗', type: 'single', options: ['從未嘗試', '創作過歌詞', '哼唱過旋律', '完成過一首完整的歌'] },
    { q: '能夠閱讀的樂譜', type: 'multi', options: ['簡譜', '五線譜', '和弦譜', '六線譜', '目前尚未學會讀譜'] },
    { q: '自我評分（1 到 5 分）', type: 'matrix', rows: ['文字表達', '節奏感', '音感', '演唱', '樂器伴奏'] },
    { q: '最常聆聽的音樂類型', type: 'multi', options: ['華語流行', '台語歌曲', '西洋流行', '日韓流行', '搖滾樂團', 'R&B 與嘻哈', '民謠', '電子音樂'], other: true },
    { q: '最喜愛的三位歌手或創作者', type: 'short', placeholder: '例如：林夕、周杰倫、陳綺貞' },
    { q: '最想創作的主題方向', type: 'single', options: ['生活取材', '親情', '友情', '愛情', '群眾或社會議題', '國家或世界議題'] },
    { q: '八堂課結束時，最希望達成的一件事', type: 'text' }
  ] },
  { id: 'sw-pre-2', lesson: 2, title: '第二堂課前問卷', intro: '素材庫的進度，以及你對樂理與歌曲結構的熟悉程度。', questions: [
    { q: '這一週，素材庫累積的詞語與句子', type: 'number', unit: '筆' },
    { q: '組內確認的主題方向', type: 'short', placeholder: '例如：以外婆的廚房為素材，創作一首親情的歌' },
    { q: '對簡譜、拍號與拍值的熟悉程度', type: 'scale', low: '第一次接觸', high: '非常熟悉' },
    { q: '能夠分辨的歌曲段落', type: 'multi', options: ['前奏', '主歌', '前副歌', '副歌', '間奏', '橋段', '尾奏', '目前都無法分辨'] },
    { q: '一首讓你聆聽一次就記住副歌的歌曲', type: 'short', optional: true }
  ] },
  { id: 'sw-pre-3', lesson: 3, title: '第三堂課前問卷', intro: '曲式圖的進度，準備開始作詞。', questions: [
    { q: '作品的曲式圖完成程度', type: 'single', options: ['已經寫入範本卡', '排好了，還在調整', '只確定副歌的位置', '還沒有開始'] },
    { q: '副歌的第一句或 Hook', type: 'short', optional: true },
    { q: '閱讀古典詩詞的習慣', type: 'single', options: ['經常閱讀', '偶爾閱讀', '只在課本裡讀過'] },
    { q: '對「押韻」的把握', type: 'scale', low: '完全沒有把握', high: '非常有把握' },
    { q: '作詞時最擔心的事', type: 'multi', options: ['不知道從何下筆', '句子不夠美', '押不到韻', '完成的句子像作文', '不知道如何收尾'], other: true }
  ] },
  { id: 'sw-pre-4', lesson: 4, title: '第四堂課前問卷', intro: '主歌的進度，以及你對修辭法的熟悉程度。', questions: [
    { q: '主歌初稿的完成程度', type: 'single', options: ['八句完成並修改過', '八句完成', '完成一半', '還沒有開始'] },
    { q: '作品使用的押韻策略', type: 'single', options: ['一韻到底', '斷句換韻', '段落換韻', '自由換韻', '尚不確定'] },
    { q: '已經熟悉的修辭法', type: 'multi', options: ['譬喻', '轉化', '設問', '排比', '類疊', '對偶', '映襯', '頂真', '目前都不熟悉'] },
    { q: '課前找到的一句印象深刻的歌詞', type: 'short', hint: '附上歌名與作詞人' },
    { q: '最想認識的華語作詞家', type: 'short', optional: true }
  ] },
  { id: 'sw-pre-5', lesson: 5, title: '第五堂課前問卷', intro: '歌詞的進度，準備開始譜曲。', questions: [
    { q: '整首歌詞的完成程度', type: 'single', options: ['全曲完成並修理過', '全曲完成', '副歌完成，主歌修改中', '只完成主歌'] },
    { q: '歌詞使用的修辭法數量', type: 'number', unit: '種' },
    { q: '哼唱旋律並錄音的經驗', type: 'single', options: ['經常這樣做', '偶爾嘗試', '從未嘗試'] },
    { q: '對和弦與和弦進行的熟悉程度', type: 'scale', low: '第一次接觸', high: '能夠自彈自唱' },
    { q: '組內負責譜曲的方式', type: 'single', options: ['一位組員主導', '每人負責一段再合併', '全組一起哼唱', '尚未決定'] }
  ] },
  { id: 'sw-pre-6', lesson: 6, title: '第六堂課前問卷', intro: '副歌旋律的進度，準備測量音域與定調。', questions: [
    { q: '副歌旋律的完成程度', type: 'single', options: ['已經錄音，寫成簡譜', '已經錄音', '能夠哼唱，還沒錄音', '還沒有開始'] },
    { q: '作品的主唱', type: 'short', placeholder: '主唱的名字，或「全組合唱」' },
    { q: '主唱知道自己的音域嗎？', type: 'single', options: ['知道可用音域', '只知道大概', '完全不知道'] },
    { q: '演唱副歌時，最吃力的地方', type: 'multi', options: ['最高音', '最低音', '換氣', '咬字', '沒有困難'] },
    { q: '最想認識的作曲家', type: 'short', optional: true }
  ] },
  { id: 'sw-pre-7', lesson: 7, title: '第七堂課前問卷', intro: '旋律與定調的進度，準備進入編曲。', questions: [
    { q: '整首旋律的完成程度', type: 'single', options: ['全曲完成並定調', '全曲完成，尚未定調', '只完成副歌', '還在修改'] },
    { q: '作品正式的調與速度', type: 'short', placeholder: '例如：A♭ 調、72 BPM' },
    { q: '想像中的編曲風格', type: 'single', options: ['鋼琴抒情', '木吉他民謠', '樂團搖滾', 'R&B 律動', '電子流行'], other: true },
    { q: '可以參與錄音的樂器', type: 'multi', options: ['鋼琴或鍵盤', '吉他', '貝斯', '鼓', '打擊樂器', '只有人聲'], other: true },
    { q: '使用過的錄音或編曲軟體', type: 'short', optional: true, placeholder: '例如：GarageBand、BandLab' }
  ] },
  { id: 'sw-pre-8', lesson: 8, title: '第八堂課前問卷', intro: '準備成果發表。', questions: [
    { q: '作品 Demo 的完成程度', type: 'single', options: ['人聲與伴奏都完成', '只完成人聲', '只完成伴奏', '還在錄製中'] },
    { q: '發表的形式', type: 'single', options: ['現場演唱', '播放 Demo', '兩者並用'] },
    { q: '作品最滿意的地方', type: 'text' },
    { q: '最希望在研討時獲得建議的地方', type: 'text' },
    { q: '發表前的心情', type: 'scale', low: '非常緊張', high: '非常期待' }
  ] },
  { id: 'sw-feedback', lesson: 0, title: '課程回饋問卷', intro: '八堂課結束了，謝謝你一路創作到這裡。你的回饋會讓下一屆的課程更加完善。', questions: [
    { q: '整體滿意度', type: 'scale', low: '不滿意', high: '非常滿意' },
    { q: '各單元的收穫（1 到 5 分）', type: 'matrix', rows: ['確立主題與素材', '曲式結構', '韻腳與修辭', '旋律與和弦', '音域與定調', '編曲與製作', '研討與發表'] },
    { q: '最有幫助的互動工具', type: 'multi', options: ['素材庫', '主題骰子', '曲式積木', '韻腳檢查器', '動機實驗室', '和弦進行播放器', '編曲混音台', '創作範本卡'] },
    { q: '課程的節奏', type: 'single', options: ['太慢', '剛好', '太快'] },
    { q: '最大的收穫', type: 'text' },
    { q: '希望增加或調整的內容', type: 'text' },
    { q: '是否會繼續創作', type: 'single', options: ['會，已經有下一首的想法', '會，偶爾創作', '暫時不會'] }
  ] }
];
