/* ===== Guitar Lab 問卷內容（與講義的課前問卷、課程回饋一致） =====
 * 題型：single 單選、multi 複選、text 長文字、short 短文字、number 數字、scale 1–5 分、matrix 多項 1–5 分自評
 */
window.PIXEL_SURVEYS = [
  { id: 'g-pre-1', lesson: 1, title: '第一章課前問卷（入班問卷）', intro: '了解你的音樂經驗、手上的吉他與期待，老師會依此調整課程。', questions: [
    { q: '學過哪些樂器', type: 'multi', options: ['沒有', '鋼琴', '烏克麗麗', '直笛', '管樂', '弦樂', '鼓'], other: true },
    { q: '吉他程度', type: 'single', options: ['完全沒碰過', '自學過一點', '會幾個和弦', '可以自彈自唱整首歌'] },
    { q: '你的吉他是哪一種', type: 'single', options: ['民謠吉他（鋼弦）', '古典吉他（尼龍弦）', '電吉他', '還沒有吉他'] },
    { q: '最想學會彈的三首歌', type: 'short', placeholder: '例如：小幸運、晴天、Perfect' },
    { q: '自評（1 到 5 分）', type: 'matrix', rows: ['節奏感', '看譜', '左手按弦', '右手刷弦', '自彈自唱'] },
    { q: '學吉他最擔心的事', type: 'multi', options: ['手指會痛', '和弦換不過去', '節奏跟不上', '看不懂譜', '沒時間練習'], other: true },
    { q: '十二章結束時，最希望達成的一件事', type: 'text' },
    { q: '每週可以練琴的時間', type: 'single', options: ['少於 1 小時', '1–3 小時', '3–5 小時', '5 小時以上'] }
  ] },
  { id: 'g-pre-2', lesson: 2, title: '第二章課前問卷', intro: '上一章的練習狀況，以及你對節奏與讀譜的熟悉度。', questions: [
    { q: '上一章的五項課後練習，完成幾項', type: 'single', options: ['0', '1', '2', '3', '4', '5'] },
    { q: '不看講義，你叫得出幾個吉他部位', type: 'number', unit: '個' },
    { q: '現在自己調好六條弦，大約要幾分鐘', type: 'number', unit: '分鐘' },
    { q: '看得懂哪些譜', type: 'multi', options: ['五線譜', '簡譜', '六線譜 TAB', '和弦譜', '都看不懂'] },
    { q: '空弦下刷跟節拍器，最穩可以到幾 BPM', type: 'number', unit: 'BPM' },
    { q: '練習時，手指或手腕哪裡會痠痛', type: 'multi', options: ['指尖', '左手手腕', '右手手腕', '肩膀', '都不會'] }
  ] },
  { id: 'g-pre-3', lesson: 3, title: '第三章課前問卷', intro: '爬格子的進度，準備開始壓第一組和弦。', questions: [
    { q: '爬格子練習最快到幾 BPM', type: 'number', unit: 'BPM' },
    { q: '四根手指中，哪一根最不聽話', type: 'single', options: ['食指', '中指', '無名指', '小指'] },
    { q: '看六線譜時，最容易搞混的是', type: 'single', options: ['哪一條是 1 弦', '數字代表的格數', '節奏長短', '都還好'] },
    { q: '已經會壓的和弦', type: 'multi', options: ['C', 'G', 'Am', 'F', 'Em', 'D', '都不會'] },
    { q: '指尖現在的狀態', type: 'single', options: ['很痛', '有點痛', '開始長繭', '不會痛'] }
  ] },
  { id: 'g-pre-4', lesson: 4, title: '第四章課前問卷', intro: '換和弦的進度，準備把右手的律動加進來。', questions: [
    { q: 'C → G → Am → F 每和弦 4 拍，最穩可以到幾 BPM', type: 'number', unit: 'BPM' },
    { q: '四個和弦中，最難壓響的是', type: 'single', options: ['C', 'G', 'Am', 'F'] },
    { q: '最卡的換和弦是', type: 'single', options: ['C → G', 'G → Am', 'Am → F', 'F → C', 'F → G'] },
    { q: '刷弦時最常遇到的狀況', type: 'multi', options: ['打到不該彈的弦', '彈片掉下來', '上刷沒聲音', '越刷越快', '還沒試過'] },
    { q: '平常聽歌時，會跟著拍子點頭或踏腳嗎', type: 'single', options: ['常常', '偶爾', '很少'] }
  ] },
  { id: 'g-pre-5', lesson: 5, title: '第五章課前問卷', intro: '刷奏的進度，以及你對三拍子歌曲的熟悉度。', questions: [
    { q: '8 Beats 配四大和弦，最穩幾 BPM', type: 'number', unit: 'BPM' },
    { q: '切分 Folk Rock 的熟練度', type: 'scale', low: '還在想', high: '不用想' },
    { q: '刷奏時，右手手腕會不會緊', type: 'single', options: ['會', '偶爾', '不會'] },
    { q: '想得到哪些三拍子的歌', type: 'short', optional: true, placeholder: '例如：生日快樂歌' },
    { q: '想學會用哪一種方式伴奏', type: 'multi', options: ['慢歌', '快歌', '華爾滋', '搖擺 Shuffle'] }
  ] },
  { id: 'g-pre-6', lesson: 6, title: '第六章課前問卷', intro: '準備期中彈唱：選歌、Capo 與段落。', questions: [
    { q: '期中想彈唱的歌', type: 'short', hint: '請先找好和弦譜，第六章會一起分析段落' },
    { q: '這首歌的原調你唱起來', type: 'single', options: ['剛好', '太高', '太低', '不確定'] },
    { q: '用過移調夾 Capo 嗎', type: 'single', options: ['有', '沒有', '沒有 Capo'] },
    { q: '分得出主歌、副歌、橋段嗎', type: 'scale', low: '分不出', high: '很清楚' },
    { q: '期中發表的形式', type: 'single', options: ['個人', '兩人一組', '小組'] }
  ] },
  { id: 'g-pre-7', lesson: 7, title: '第七章課前問卷', intro: '期中之後，進入指法與樂理。', questions: [
    { q: '期中發表最滿意的地方', type: 'text' },
    { q: '期中發表最想改進的地方', type: 'text' },
    { q: '聽過或練過指彈嗎', type: 'single', options: ['練過', '聽過沒練過', '沒聽過'] },
    { q: '對「音程」「三和弦」這些名詞的熟悉度', type: 'scale', low: '第一次聽到', high: '很熟悉' },
    { q: '右手有留指甲嗎', type: 'single', options: ['有', '沒有'] }
  ] },
  { id: 'g-pre-8', lesson: 8, title: '第八章課前問卷', intro: '指法的進度，準備挑戰封閉和弦。', questions: [
    { q: '分散和弦 T-1-2-3 的熟練度', type: 'scale', low: '還在想', high: '不用想' },
    { q: '試過壓完整的封閉 F 嗎', type: 'single', options: ['可以壓響', '有幾條弦悶掉', '完全壓不下去', '還沒試'] },
    { q: '左手食指平壓時哪裡最難', type: 'multi', options: ['2 弦悶掉', '3 弦悶掉', '手很痠', '虎口太用力', '還沒試'] },
    { q: '會的 G 大調歌曲', type: 'short', optional: true }
  ] },
  { id: 'g-pre-9', lesson: 9, title: '第九章課前問卷', intro: '封閉和弦的進度，準備讓低音動起來。', questions: [
    { q: 'F 與 Bm 封閉和弦的狀態', type: 'single', options: ['都能壓響', '只有 F 可以', '只有 Bm 可以', '都還不行'] },
    { q: '聽歌時，能聽出貝斯或低音的線條嗎', type: 'scale', low: '聽不出', high: '很清楚' },
    { q: '看過 C/G、G/B 這類寫法嗎', type: 'single', options: ['看過也會彈', '看過不會彈', '沒看過'] }
  ] },
  { id: 'g-pre-10', lesson: 10, title: '第十章課前問卷', intro: '低音變化的進度，準備理解和弦進行。', questions: [
    { q: '下行低音線（如 C → G/B → Am）彈得順嗎', type: 'scale', low: '不順', high: '很順' },
    { q: '有沒有發現很多歌的和弦都很像', type: 'single', options: ['有', '沒注意過'] },
    { q: '想學會自己替歌配和弦嗎', type: 'single', options: ['很想', '有點興趣', '還好'] },
    { q: '最近最常練的一首歌', type: 'short', optional: true }
  ] },
  { id: 'g-pre-11', lesson: 11, title: '第十一章課前問卷', intro: '和弦編排的進度，準備加入吉他技巧。', questions: [
    { q: '能用級數說出一首歌的和弦進行嗎', type: 'scale', low: '不行', high: '可以' },
    { q: '最想學的技巧', type: 'multi', options: ['搥弦', '勾弦', '滑弦', '悶音', '切音', '打板', '泛音', '推弦'] },
    { q: '欣賞的吉他手或演奏影片', type: 'short', optional: true }
  ] },
  { id: 'g-pre-12', lesson: 12, title: '第十二章課前問卷', intro: '最後一章：定調、創作與期末作品。', questions: [
    { q: '期末作品的形式', type: 'single', options: ['彈唱一首喜歡的歌', '改編一首歌', '自己寫的歌', '還在想'] },
    { q: '期末作品曲目或主題', type: 'short' },
    { q: '有沒有寫過歌詞或旋律', type: 'single', options: ['有完成的作品', '寫過片段', '沒有'] },
    { q: '自己最舒服的音域或調', type: 'short', optional: true, placeholder: '不確定也沒關係' }
  ] },
  { id: 'g-feedback', lesson: 0, title: '課程回饋問卷', intro: '十二章結束了，謝謝你一路彈到這裡。你的回饋會讓下一屆的課更好。', questions: [
    { q: '整體課程滿意度', type: 'scale', low: '不滿意', high: '非常滿意' },
    { q: '課程結束時的自評（1 到 5 分）', type: 'matrix', rows: ['節奏感', '看譜', '和弦', '刷奏', '指法', '自彈自唱'] },
    { q: '最有收穫的三章', type: 'multi', options: ['1 認識吉他', '2 讀譜熱手', '3 第一組和弦', '4 刷奏', '5 三拍子', '6 曲式', '7 指法', '8 封閉和弦', '9 低音', '10 級數', '11 技巧', '12 定調創作'] },
    { q: '最有幫助的網站工具', type: 'multi', options: ['互動投影片', '調音器', '換和弦練習器', '跟刷節拍器', '錄音', '練習紀錄'] },
    { q: '最想給老師的建議', type: 'text' },
    { q: '會繼續彈吉他嗎', type: 'single', options: ['一定會', '應該會', '不確定'] }
  ] }
];
