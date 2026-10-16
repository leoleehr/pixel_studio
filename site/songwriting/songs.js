/* ===== Songwriting Lab 曲例與 YouTube 影片 =====
 * 歌單取自 2011 年「流行音樂學程：詞曲創作」講座教材的曲式結構分析範例（23 首），以及課綱提到的主題曲例。
 * 影片皆為官方頻道、唱片公司或 YouTube 官方音檔（Topic），2026-10-14 以 oEmbed 確認可嵌入。
 * kind 顯示在播放卡上：填詞與譜曲。課堂只放影片，歌詞僅摘錄分析所需的短句。
 */
window.PIXEL_SONGS = {
  // 曲式結構分析範例（原教材 01–23）
  '愛情轉移': { artist: '陳奕迅', id: 'RIq7Tz9nYD8', kind: '詞：林夕・曲：澤日生', src: '官方音檔' },
  '彩虹': { artist: '周杰倫', id: 'WxZvXPTBC0A', kind: '詞曲：周杰倫', src: '官方 Mv' },
  '當冬夜漸暖': { artist: '孫燕姿', id: 'pD2VWvz9ZCY', kind: '詞：藤井樹・曲：饒善強', src: '官方音檔' },
  '記得': { artist: '張惠妹', id: 'qm3wIQWnXxg', kind: '詞：易家揚・曲：林俊傑', src: '官方 Mv' },
  '青花瓷': { artist: '周杰倫', id: 'Z8Mqw0b9ADs', kind: '詞：方文山・曲：周杰倫', src: '官方 Mv' },
  '白色風車': { artist: '周杰倫', id: 'K9CbHZLXPIA', kind: '詞曲：周杰倫', src: '官方 Mv' },
  '十年': { artist: '陳奕迅', id: 'JM9rx_hN1Ko', kind: '詞：林夕・曲：陳小霞', src: '官方 Mv' },
  '想哭': { artist: '陳奕迅', id: 'RU6uKG6e3Gk', kind: '詞：林夕・曲：徐偉賢', src: '官方 Mv' },
  '流沙': { artist: '陶喆', id: '2xAmQ4y44eo', kind: '詞：娃娃・曲：陶喆（Reimagined 版）', src: '官方 Mv' },
  '天天': { artist: '陶喆', id: 'jFKXaWFw8FU', kind: '詞：娃娃・曲：陶喆', src: '官方 Mv' },
  '愛': { artist: '莫文蔚', id: '3vtYIj_qtwM', kind: '詞：李焯雄・曲：陳曉娟', src: '官方音檔' },
  '她說': { artist: '林俊傑', id: 'BocMPQv9brE', kind: '詞：孫燕姿・曲：林俊傑', src: '官方 Mv' },
  '分手快樂': { artist: '梁靜茹', id: 'lBNYpPmjH8M', kind: '詞：姚若龍・曲：郭文賢', src: '官方 Mv' },
  '我願意': { artist: '王菲', id: '4Ah5gsjXVgo', kind: '詞：姚謙・曲：黃國倫', src: '官方 Mv' },
  '我多麼羨慕你': { artist: '江美琪', id: '57boyq7doDE', kind: '詞：姚謙・曲：張洪量', src: '官方 Mv' },
  '婚禮的祝福': { artist: '陳奕迅', id: 'zwsQn7hcC6w', kind: '詞：許常德・曲：陳建寧、陳政卿', src: '官方音檔' },
  '原來你什麼都不要': { artist: '張惠妹', id: 'rT4FqOwn-rs', kind: '詞：鄔裕康・曲：郭子', src: '官方 Mv' },
  '我要快樂': { artist: '張惠妹', id: 'NilgON1msY8', kind: '詞：鄔裕康・曲：林倛玉', src: '官方 Mv' },
  '曲終人散': { artist: '張宇', id: 'OfpWrDHPAcA', kind: '詞：十一郎・曲：張宇', src: '官方 Mv' },
  '傘下': { artist: '張宇', id: 'aI_SszyOM2A', kind: '詞：十一郎・曲：張宇', src: '官方 Mv' },
  '聽海': { artist: '張惠妹', id: 'mLk61pfiHQ0', kind: '詞：林秋離・曲：涂惠源', src: '官方 Mv' },
  '剪愛': { artist: '張惠妹', id: 'ZH9k3643BH8', kind: '詞：林秋離・曲：涂惠源', src: '官方 Mv' },
  '我最親愛的': { artist: '張惠妹', id: 'TVjsnSJlULg', kind: '詞：林夕・曲：Russell Harris', src: '官方 Mv' },
  // 課綱主題曲例
  '早安，晨之美！': { artist: '盧廣仲', id: 'jAlWCr5cIjE', kind: '生活取材・詞曲：盧廣仲', src: '官方 Mv' },
  '朋友': { artist: '周華健', id: '6lbPgfKK7m4', kind: '友情訴求・詞：劉思銘・曲：劉志宏', src: '官方 Mv' },
  '月亮代表我的心': { artist: '鄧麗君', id: 'IgvDMB5fR-8', kind: '愛情訴求・詞：孫儀・曲：翁清溪', src: '官方音檔' },
  'With Or Without You': { artist: 'U2', id: 'ujNeHIo7oTE', kind: '議題擴大・U2', src: '官方 Mv' },
  "Knockin' On Heaven's Door": { artist: 'Bob Dylan', id: 'rm9coqlk8fY', kind: '議題擴大・Bob Dylan', src: '官方音檔' },
  '就是愛你': { artist: '陶喆', id: 'WVaOxR0ajw4', kind: '歌詞記憶點・詞：娃娃・曲：陶喆', src: '官方 Mv' },
  '橄欖樹': { artist: '齊豫', id: 'LZb8fJZFhlo', kind: '詞：三毛・曲：李泰祥', src: '官方歌詞影片' },
  // 旋律波動的範例曲（第五堂），2026-10-16 以 oEmbed 確認為官方頻道上傳
  '在這座城市遺失了你': { artist: '告五人', id: 'PlCbgZxonJs', kind: '詞曲：潘雲安', src: '官方 Mv' },
  '說了再見': { artist: '周杰倫', id: 'KKsioz-zaZY', kind: '詞：古小力、黃凌嘉・曲：周杰倫', src: '官方 Mv' },
  'APT.': { artist: 'ROSÉ & Bruno Mars', id: 'ekr2nIex040', kind: '詞曲：ROSÉ、Bruno Mars 等', src: '官方 Mv' }
};

// 講義每一堂開頭的曲例
window.PIXEL_LESSON_SONGS = {
  1: ['早安，晨之美！', '朋友', '月亮代表我的心', 'With Or Without You'],
  2: ['十年', '我願意', '分手快樂', '彩虹'],
  3: ['想哭', '青花瓷', '當冬夜漸暖', '流沙'],
  4: ['聽海', '天天', '婚禮的祝福', '愛'],
  5: ['我要快樂', '就是愛你', '白色風車', '她說'],
  6: ['橄欖樹', '我最親愛的', '記得', '傘下'],
  7: ['十年', '青花瓷', '原來你什麼都不要', '剪愛'],
  8: ['曲終人散', '我多麼羨慕你', '愛情轉移', '朋友']
};
