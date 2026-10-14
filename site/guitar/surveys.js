/* ===== Guitar Lab 問卷內容（與講義的課前問卷、課程回饋一致） =====
 * 題型：single 單選、multi 複選、text 長文字、short 短文字、number 數字、scale 1–5 分、matrix 多項 1–5 分自評
 */
window.PIXEL_SURVEYS = [
  { id: 'g-pre-1', lesson: 1, title: '第一章課前問卷（入班問卷）', intro: '瞭解你的音樂經驗、手上的吉他與期待，老師會依照結果調整課程。', questions: [
    { q: '學過的樂器', type: 'multi', options: ['從未學過', '鋼琴', '烏克麗麗', '直笛', '管樂', '弦樂', '爵士鼓'], other: true },
    { q: '目前的吉他程度', type: 'single', options: ['完全沒有接觸過', '自學過一點', '會幾個和弦', '可以自彈自唱整首歌'] },
    { q: '你的吉他種類', type: 'single', options: ['民謠吉他（鋼弦）', '古典吉他（尼龍弦）', '電吉他', '尚未擁有吉他'] },
    { q: '最想學會彈奏的三首歌', type: 'short', placeholder: '例如：小幸運、晴天、Perfect' },
    { q: '自我評分（1 到 5 分）', type: 'matrix', rows: ['節奏感', '讀譜', '左手按弦', '右手刷弦', '自彈自唱'] },
    { q: '學習吉他最擔心的事', type: 'multi', options: ['手指疼痛', '和弦換不過去', '節奏跟不上', '不熟悉讀譜', '練習時間不足'], other: true },
    { q: '十二章結束時，最希望達成的一件事', type: 'text' },
    { q: '每週可以練琴的時間', type: 'single', options: ['少於 1 小時', '1–3 小時', '3–5 小時', '5 小時以上'] }
  ] },
  { id: 'g-pre-2', lesson: 2, title: '第二章課前問卷', intro: '上一章的練習狀況，以及你對節奏與讀譜的熟悉程度。', questions: [
    { q: '上一章的五項課後練習，完成的項數', type: 'single', options: ['0', '1', '2', '3', '4', '5'] },
    { q: '不翻講義，能說出名稱的吉他部位數量', type: 'number', unit: '個' },
    { q: '目前自己調準六條琴弦，大約需要的時間', type: 'number', unit: '分鐘' },
    { q: '能夠閱讀的樂譜種類', type: 'multi', options: ['五線譜', '簡譜', '六線譜 TAB', '和弦譜', '目前尚未學會讀譜'] },
    { q: '空弦下刷跟著節拍器，最穩定的速度', type: 'number', unit: 'BPM' },
    { q: '練習時，手指或手腕感到痠痛的位置', type: 'multi', options: ['指尖', '左手手腕', '右手手腕', '肩膀', '沒有痠痛'] }
  ] },
  { id: 'g-pre-3', lesson: 3, title: '第三章課前問卷', intro: '爬格子的進度，準備開始按壓第一組和弦。', questions: [
    { q: '爬格子練習最快的速度', type: 'number', unit: 'BPM' },
    { q: '四根手指中，最難控制的一根', type: 'single', options: ['食指', '中指', '無名指', '小指'] },
    { q: '閱讀六線譜時，最容易混淆的地方', type: 'single', options: ['哪一條是 1 弦', '數字代表的格數', '節奏長短', '目前都沒有問題'] },
    { q: '已經會按的和弦', type: 'multi', options: ['C', 'G', 'Am', 'F', 'Em', 'D', '目前都還不會'] },
    { q: '指尖目前的狀態', type: 'single', options: ['非常疼痛', '有點疼痛', '開始長繭', '已經不痛'] }
  ] },
  { id: 'g-pre-4', lesson: 4, title: '第四章課前問卷', intro: '換和弦的進度，準備加入右手的律動。', questions: [
    { q: 'C → G → Am → F 每個和弦 4 拍，最穩定的速度', type: 'number', unit: 'BPM' },
    { q: '四個和弦中，最難按響的和弦', type: 'single', options: ['C', 'G', 'Am', 'F'] },
    { q: '最不順暢的換和弦', type: 'single', options: ['C → G', 'G → Am', 'Am → F', 'F → C', 'F → G'] },
    { q: '刷弦時最常遇到的狀況', type: 'multi', options: ['刷到多餘的琴弦', '彈片掉落', '上刷沒有聲音', '越刷越快', '尚未嘗試'] },
    { q: '平常聆聽歌曲時，跟著拍子點頭或踏腳的頻率', type: 'single', options: ['經常', '偶爾', '很少'] }
  ] },
  { id: 'g-pre-5', lesson: 5, title: '第五章課前問卷', intro: '刷奏的進度，以及你對三拍子歌曲的熟悉程度。', questions: [
    { q: '8 Beats 搭配四大和弦，最穩定的速度', type: 'number', unit: 'BPM' },
    { q: '切分 Folk Rock 的熟練程度', type: 'scale', low: '仍需思考', high: '無需思考' },
    { q: '刷奏時，右手手腕緊繃的程度', type: 'single', options: ['經常緊繃', '偶爾緊繃', '保持放鬆'] },
    { q: '你知道的三拍子歌曲', type: 'short', optional: true, placeholder: '例如：生日快樂歌' },
    { q: '想學會的伴奏方式', type: 'multi', options: ['慢歌', '快歌', '華爾滋', '搖擺 Shuffle'] }
  ] },
  { id: 'g-pre-6', lesson: 6, title: '第六章課前問卷', intro: '準備期中彈唱：選歌、Capo 與段落。', questions: [
    { q: '期中想彈唱的歌曲', type: 'short', hint: '請先找好和弦譜，第六章會一起分析段落' },
    { q: '這首歌的原調，你唱起來的感覺', type: 'single', options: ['剛好合適', '太高', '太低', '尚不確定'] },
    { q: '使用移調夾 Capo 的經驗', type: 'single', options: ['使用過', '從未使用', '尚未擁有 Capo'] },
    { q: '分辨主歌、副歌、橋段的把握', type: 'scale', low: '無法分辨', high: '非常清楚' },
    { q: '期中發表的形式', type: 'single', options: ['個人', '兩人一組', '小組'] }
  ] },
  { id: 'g-pre-7', lesson: 7, title: '第七章課前問卷', intro: '期中之後，進入指法與樂理。', questions: [
    { q: '期中發表最滿意的地方', type: 'text' },
    { q: '期中發表最想改進的地方', type: 'text' },
    { q: '聆聽或練習指彈的經驗', type: 'single', options: ['練習過', '聽過、尚未練習', '從未聽過'] },
    { q: '對「音程」「三和弦」這些名詞的熟悉程度', type: 'scale', low: '第一次聽到', high: '非常熟悉' },
    { q: '右手留指甲的情況', type: 'single', options: ['有留指甲', '指甲剪短'] }
  ] },
  { id: 'g-pre-8', lesson: 8, title: '第八章課前問卷', intro: '指法的進度，準備挑戰封閉和弦。', questions: [
    { q: '分散和弦 T-1-2-3 的熟練程度', type: 'scale', low: '仍需思考', high: '無需思考' },
    { q: '按壓完整封閉 F 的狀態', type: 'single', options: ['可以按響', '有幾條琴弦悶住', '完全壓不下去', '尚未嘗試'] },
    { q: '左手食指平壓時，最困難的地方', type: 'multi', options: ['2 弦悶住', '3 弦悶住', '手很痠', '虎口太用力', '尚未嘗試'] },
    { q: '會彈奏的 G 大調歌曲', type: 'short', optional: true }
  ] },
  { id: 'g-pre-9', lesson: 9, title: '第九章課前問卷', intro: '封閉和弦的進度，準備讓低音開始行進。', questions: [
    { q: 'F 與 Bm 封閉和弦的狀態', type: 'single', options: ['兩個都能按響', '只有 F 可以', '只有 Bm 可以', '兩個都還不行'] },
    { q: '聆聽歌曲時，聽出貝斯或低音線條的程度', type: 'scale', low: '無法分辨', high: '非常清楚' },
    { q: '對 C/G、G/B 這類寫法的熟悉程度', type: 'single', options: ['看過也會彈奏', '看過、尚未學會', '從未看過'] }
  ] },
  { id: 'g-pre-10', lesson: 10, title: '第十章課前問卷', intro: '低音變化的進度，準備理解和弦進行。', questions: [
    { q: '下行低音線（例如 C → G/B → Am）的流暢程度', type: 'scale', low: '仍不順暢', high: '非常順暢' },
    { q: '是否察覺許多歌曲的和弦都很相似', type: 'single', options: ['已經察覺', '從未留意'] },
    { q: '想學會自己為歌曲配和弦的程度', type: 'single', options: ['非常想學', '有點興趣', '普通'] },
    { q: '最近最常練習的一首歌', type: 'short', optional: true }
  ] },
  { id: 'g-pre-11', lesson: 11, title: '第十一章課前問卷', intro: '和弦編排的進度，準備加入吉他技巧。', questions: [
    { q: '以級數說出一首歌和弦進行的把握', type: 'scale', low: '尚無把握', high: '完全可以' },
    { q: '最想學習的技巧', type: 'multi', options: ['搥弦', '勾弦', '滑弦', '悶音', '切音', '打板', '泛音', '推弦'] },
    { q: '欣賞的吉他手或演奏影片', type: 'short', optional: true }
  ] },
  { id: 'g-pre-12', lesson: 12, title: '第十二章課前問卷', intro: '最後一章：定調、創作與期末作品。', questions: [
    { q: '期末作品的形式', type: 'single', options: ['彈唱一首喜歡的歌', '改編一首歌', '自己創作的歌', '仍在構思'] },
    { q: '期末作品的曲目或主題', type: 'short' },
    { q: '創作歌詞或旋律的經驗', type: 'single', options: ['有完成的作品', '寫過片段', '尚無經驗'] },
    { q: '自己最舒服的音域或調性', type: 'short', optional: true, placeholder: '尚不確定也沒有關係' }
  ] },
  { id: 'g-feedback', lesson: 0, title: '課程回饋問卷', intro: '十二章結束了，謝謝你一路彈奏到這裡。你的回饋會讓下一屆的課程更加完善。', questions: [
    { q: '整體課程滿意度', type: 'scale', low: '不滿意', high: '非常滿意' },
    { q: '課程結束時的自我評分（1 到 5 分）', type: 'matrix', rows: ['節奏感', '讀譜', '和弦', '刷奏', '指法', '自彈自唱'] },
    { q: '最有收穫的三章', type: 'multi', options: ['1 認識吉他', '2 讀譜熱手', '3 第一組和弦', '4 刷奏', '5 三拍子', '6 曲式', '7 指法', '8 封閉和弦', '9 低音', '10 級數', '11 技巧', '12 定調創作'] },
    { q: '最有幫助的網站工具', type: 'multi', options: ['互動投影片', '調音器', '換和弦練習器', '跟刷節拍器', '錄音', '練習紀錄'] },
    { q: '最想給老師的建議', type: 'text' },
    { q: '繼續彈奏吉他的意願', type: 'single', options: ['一定繼續', '應該會繼續', '尚不確定'] }
  ] }
];
