/* ===== Piano Lab 問卷內容（與講義的課前問卷、課程回饋一致） =====
 * 題型：single 單選、multi 複選、text 長文字、short 短文字、number 數字、scale 1–5 分、matrix 多項 1–5 分自評
 */
window.PIXEL_SURVEYS = [
  { id: 'p-pre-1', lesson: 1, title: '第一堂課前問卷（入班問卷）', intro: '瞭解你的音樂經驗、手邊的樂器與期待，老師會依照結果調整課程。', questions: [
    { q: '學習鋼琴的經驗', type: 'single', options: ['從未學過', '小時候學過，已經放下', '學過古典，想改彈流行', '會彈一些流行歌曲'] },
    { q: '其他會演奏的樂器', type: 'multi', options: ['沒有', '吉他', '烏克麗麗', '直笛', '管樂器', '弦樂器', '鼓'], other: true },
    { q: '家中練習用的樂器', type: 'single', options: ['直立鋼琴', '平台鋼琴', '數位鋼琴', '電子琴（61 鍵以上）', '電子琴（少於 61 鍵）', '尚未擁有樂器'] },
    { q: '能夠閱讀的樂譜', type: 'multi', options: ['五線譜', '簡譜', '和弦譜', '目前尚未學會讀譜'] },
    { q: '自我評分（1 到 5 分）', type: 'matrix', rows: ['節奏感', '讀譜', '左右手協調', '和弦概念', '自彈自唱'] },
    { q: '最想用鋼琴彈奏的三首歌', type: 'short', placeholder: '例如：月亮代表我的心、小幸運、卡農' },
    { q: '十二堂課結束時，最希望達成的一件事', type: 'text' },
    { q: '每週可以練琴的時間', type: 'single', options: ['少於 1 小時', '1–3 小時', '3–5 小時', '5 小時以上'] }
  ] },
  { id: 'p-pre-2', lesson: 2, title: '第二堂課前問卷', intro: '上一堂的練習狀況，以及你對樂譜的熟悉程度。', questions: [
    { q: '上一堂的課後練習，完成的項數', type: 'single', options: ['0', '1', '2', '3', '4', '5'] },
    { q: '五指位置彈奏時，五個音的音量是否平均', type: 'scale', low: '很不平均', high: '非常平均' },
    { q: '閉上眼睛找到中央 C 的把握', type: 'scale', low: '找不到', high: '立刻找到' },
    { q: '最想加強的樂理', type: 'multi', options: ['音名與唱名', '五線譜', '拍子與節奏', '升降記號', '音程'] },
    { q: '練琴時感到緊繃的部位', type: 'multi', options: ['肩膀', '手腕', '手指', '背部', '沒有緊繃'] }
  ] },
  { id: 'p-pre-3', lesson: 3, title: '第三堂課前問卷', intro: '識譜的進度，準備開始運指。', questions: [
    { q: '找音遊戲（五線譜）連續答對的題數', type: 'number', unit: '題' },
    { q: '最容易混淆的部分', type: 'single', options: ['高音譜號的音', '低音譜號的音', '黑鍵的名稱', '音程的計算', '目前都沒有問題'] },
    { q: '每天練琴的時間', type: 'number', unit: '分鐘' },
    { q: '五根手指中，最難控制的一根', type: 'single', options: ['拇指', '食指', '中指', '無名指', '小指'] },
    { q: '左手的熟練程度', type: 'scale', low: '幾乎不會動', high: '和右手一樣靈活' }
  ] },
  { id: 'p-pre-4', lesson: 4, title: '第四堂課前問卷', intro: '音階的進度，準備認識和弦。', questions: [
    { q: 'C 大調音階最穩定的速度', type: 'number', unit: 'BPM' },
    { q: '穿指與跨指的順暢程度', type: 'scale', low: '一直卡住', high: '非常順暢' },
    { q: '已經會按的和弦', type: 'multi', options: ['C', 'F', 'G', 'Am', 'Dm', 'Em', '目前都還不會'] },
    { q: '雙手同時彈奏音階', type: 'single', options: ['可以', '只能慢速', '還沒嘗試'] }
  ] },
  { id: 'p-pre-5', lesson: 5, title: '第五堂課前問卷', intro: '和弦的進度，準備彈奏第一首歌。', questions: [
    { q: '能夠立刻彈出的和弦數量', type: 'number', unit: '個' },
    { q: '以轉位彈奏 C → F → G → C 的狀態', type: 'single', options: ['手不跳動，非常順暢', '偶爾需要看鍵盤', '換到 G 會卡住', '還在熟記和弦'] },
    { q: '分辨大和弦與小和弦的把握', type: 'scale', low: '聽不出差別', high: '非常清楚' },
    { q: '最想先學會的一首歌', type: 'short', optional: true }
  ] },
  { id: 'p-pre-6', lesson: 6, title: '第六堂課前問卷', intro: '第一首歌的進度，準備加入節奏型態。', questions: [
    { q: '雙手彈奏〈小星星〉的狀態', type: 'single', options: ['不中斷完成', '偶爾停頓', '換和弦時會停', '還在分手練習'] },
    { q: '左手最習慣的彈法', type: 'single', options: ['根音', '五度音', '柱式和弦'] },
    { q: '雙手協調的程度', type: 'scale', low: '很難同時進行', high: '非常協調' },
    { q: '使用延音踏板的經驗', type: 'single', options: ['經常使用', '偶爾使用', '從未使用', '樂器沒有踏板'] }
  ] },
  { id: 'p-pre-7', lesson: 7, title: '第七堂課前問卷', intro: '節奏型態的進度，準備強化伴奏技巧。', questions: [
    { q: '最熟練的 Slow Soul 伴奏', type: 'single', options: ['（一）上行延長', '（二）上行再下行', '（三）柱式和弦', '（四）鐘擺來回', '都還不熟'] },
    { q: '華爾滋的熟練程度', type: 'scale', low: '仍需思考', high: '無需思考' },
    { q: '期中想彈唱的歌曲', type: 'short', hint: '請選擇 C 調、單一調性的歌曲' },
    { q: '期中發表的形式', type: 'single', options: ['自彈自唱', '只彈奏，旋律加伴奏', '兩人合作', '還在決定'] }
  ] },
  { id: 'p-pre-8', lesson: 8, title: '第八堂課前問卷', intro: '準備期中發表。', questions: [
    { q: '期中曲目', type: 'short' },
    { q: '主歌與副歌使用的伴奏型', type: 'short', placeholder: '例如：主歌 4 Beats、副歌 8 Beats 雙手 16 度' },
    { q: '伴奏的熟練程度', type: 'scale', low: '還需要看譜', high: '已經背熟' },
    { q: '自彈自唱最困難的地方', type: 'multi', options: ['手和嘴巴無法分工', '換氣', '唱的音太高或太低', '一邊唱一邊彈會亂拍', '還沒有嘗試'] }
  ] },
  { id: 'p-pre-9', lesson: 9, title: '第九堂課前問卷', intro: '期中之後，進入和聲的規律。', questions: [
    { q: '期中發表最滿意的地方', type: 'text' },
    { q: '期中發表最想改進的地方', type: 'text' },
    { q: '對「級數」「Ⅰ Ⅳ Ⅴ」的熟悉程度', type: 'scale', low: '第一次聽到', high: '非常熟悉' },
    { q: '希望能夠移調的原因', type: 'multi', options: ['歌曲太高', '歌曲太低', '和朋友合奏', '還不需要移調'] }
  ] },
  { id: 'p-pre-10', lesson: 10, title: '第十堂課前問卷', intro: '級數的進度，準備認識複合和弦。', questions: [
    { q: '能夠寫出順階和弦的調性', type: 'multi', options: ['C 大調', 'G 大調', 'F 大調', 'D 大調', '都還不熟'] },
    { q: '期中曲目移調的進度', type: 'single', options: ['已經移調並彈奏', '寫好級數，還沒彈', '還在計算', '還沒嘗試'] },
    { q: '聽過「卡農進行」嗎', type: 'single', options: ['聽過，也會彈', '聽過，不會彈', '沒有聽過'] },
    { q: '喜愛的歌曲中，你注意到重複出現的和弦', type: 'short', optional: true }
  ] },
  { id: 'p-pre-11', lesson: 11, title: '第十一堂課前問卷', intro: '和弦進行的進度，準備學習更多節奏型態。', questions: [
    { q: '卡農進行下行低音線的狀態', type: 'single', options: ['流暢完成', '偶爾找錯低音', '只會一般低音', '還在練習'] },
    { q: '最熟練的和弦進行', type: 'single', options: ['1645', '1564', '卡農進行', '4536', '2-5-1'] },
    { q: '左手張開，拇指到小指能跨幾個白鍵', type: 'number', unit: '個白鍵' },
    { q: '想學習的音樂風格', type: 'multi', options: ['抒情老歌', '鋼琴演奏曲', '爵士', 'Bossa Nova', '搖滾', '古典改編'] }
  ] },
  { id: 'p-pre-12', lesson: 12, title: '第十二堂課前問卷', intro: '準備期末發表。', questions: [
    { q: '期末曲目', type: 'short' },
    { q: '期末曲目的調性', type: 'single', options: ['C 大調', 'G 大調', 'A 小調', '其他調性'] },
    { q: '使用的伴奏型', type: 'multi', options: ['Slow Soul', '4 Beats', '8 Beats', '華爾滋', 'Slow Rock', '十度音', '雙手 16 度'] },
    { q: '發表前的心情', type: 'scale', low: '非常緊張', high: '非常期待' }
  ] },
  { id: 'p-feedback', lesson: 0, title: '課程回饋問卷', intro: '十二堂課結束了，謝謝你一路彈奏到這裡。你的回饋會讓下一屆的課程更加完善。', questions: [
    { q: '整體滿意度', type: 'scale', low: '不滿意', high: '非常滿意' },
    { q: '各單元的收穫（1 到 5 分）', type: 'matrix', rows: ['認識鋼琴與樂理', '音階運指', '和弦與轉位', '歌曲彈奏', '節奏型態與伴奏', '自彈自唱', '級數與移調', '和弦進行與複合和弦', '大小調與 G 大調'] },
    { q: '最有幫助的互動工具', type: 'multi', options: ['可彈奏的鍵盤', '找音遊戲', '音階運指', '和弦實驗室', '伴奏型播放器', '歌曲彈奏', '順階和弦'] },
    { q: '課程的節奏', type: 'single', options: ['太慢', '剛好', '太快'] },
    { q: '最大的收穫', type: 'text' },
    { q: '希望增加或調整的內容', type: 'text' },
    { q: '是否會繼續學習中級課程', type: 'single', options: ['會', '考慮中', '暫時不會'] }
  ] }
];
