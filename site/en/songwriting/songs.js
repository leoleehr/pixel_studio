/* ===== Songwriting Lab 曲例與 YouTube 影片 =====
 * 歌單取自 2011 年「流行音樂學程：詞曲創作」講座教材的曲式結構分析範例（23 首），以及課綱提到的主題曲例。
 * 影片皆為官方頻道、唱片公司或 YouTube 官方音檔（Topic），2026-10-14 以 oEmbed 確認可嵌入。
 * kind 顯示在播放卡上：填詞與譜曲。課堂只放影片，歌詞僅摘錄分析所需的短句。
 */
window.PIXEL_SONGS = {
  // 曲式結構分析範例（原教材 01–23）
  '愛情轉移': { artist: 'Eason Chan', id: 'RIq7Tz9nYD8', kind: 'Lyrics: Lin Xi · Music: Christopher Chak', src: 'Official audio' },
  '彩虹': { artist: 'Jay Chou', id: 'WxZvXPTBC0A', kind: 'Lyrics & music: Jay Chou', src: 'Official MV' },
  '當冬夜漸暖': { artist: 'Stefanie Sun', id: 'pD2VWvz9ZCY', kind: 'Lyrics: Tengjingshu · Music: Jao Shan-chiang', src: 'Official audio' },
  '記得': { artist: 'A-Mei', id: 'qm3wIQWnXxg', kind: 'Lyrics: Yi Chia-yang · Music: JJ Lin', src: 'Official MV' },
  '青花瓷': { artist: 'Jay Chou', id: 'Z8Mqw0b9ADs', kind: 'Lyrics: Vincent Fang · Music: Jay Chou', src: 'Official MV' },
  '白色風車': { artist: 'Jay Chou', id: 'K9CbHZLXPIA', kind: 'Lyrics & music: Jay Chou', src: 'Official MV' },
  '十年': { artist: 'Eason Chan', id: 'JM9rx_hN1Ko', kind: 'Lyrics: Lin Xi · Music: Chen Hsiao-hsia', src: 'Official MV' },
  '想哭': { artist: 'Eason Chan', id: 'RU6uKG6e3Gk', kind: 'Lyrics: Lin Xi · Music: Hsu Wei-hsien', src: 'Official MV' },
  '流沙': { artist: '陶喆', id: '2xAmQ4y44eo', kind: 'Lyrics: Wawa · Music: David Tao (Reimagined version)', src: 'Official MV' },
  '天天': { artist: '陶喆', id: 'jFKXaWFw8FU', kind: 'Lyrics: Wawa · Music: David Tao', src: 'Official MV' },
  '愛': { artist: 'Karen Mok', id: '3vtYIj_qtwM', kind: 'Lyrics: Lee Cheuk-hung · Music: Chen Hsiao-chuan', src: 'Official audio' },
  '她說': { artist: 'JJ Lin', id: 'BocMPQv9brE', kind: 'Lyrics: Stefanie Sun · Music: JJ Lin', src: 'Official MV' },
  '分手快樂': { artist: 'Fish Leong', id: 'lBNYpPmjH8M', kind: 'Lyrics: Yao Jo-lung · Music: Kuo Wen-hsien', src: 'Official MV' },
  '我願意': { artist: 'Faye Wong', id: '4Ah5gsjXVgo', kind: 'Lyrics: Yao Chien · Music: Huang Kuo-lun', src: 'Official MV' },
  '我多麼羨慕你': { artist: 'Maggie Chiang', id: '57boyq7doDE', kind: 'Lyrics: Yao Chien · Music: Chang Hung-liang', src: 'Official MV' },
  '婚禮的祝福': { artist: 'Eason Chan', id: 'zwsQn7hcC6w', kind: 'Lyrics: Hsu Chang-te · Music: Chen Chien-ning, Chen Cheng-ching', src: 'Official audio' },
  '原來你什麼都不要': { artist: 'A-Mei', id: 'rT4FqOwn-rs', kind: 'Lyrics: Wu Yu-kang · Music: Kuo Tzu', src: 'Official MV' },
  '我要快樂': { artist: 'A-Mei', id: 'NilgON1msY8', kind: 'Lyrics: Wu Yu-kang · Music: Lin Chi-yu', src: 'Official MV' },
  '曲終人散': { artist: 'Phil Chang', id: 'OfpWrDHPAcA', kind: 'Lyrics: Shih Yi-lang · Music: Phil Chang', src: 'Official MV' },
  '傘下': { artist: 'Phil Chang', id: 'aI_SszyOM2A', kind: 'Lyrics: Shih Yi-lang · Music: Phil Chang', src: 'Official MV' },
  '聽海': { artist: 'A-Mei', id: 'mLk61pfiHQ0', kind: 'Lyrics: Lin Chiu-li · Music: Tu Hui-yuan', src: 'Official MV' },
  '剪愛': { artist: 'A-Mei', id: 'ZH9k3643BH8', kind: 'Lyrics: Lin Chiu-li · Music: Tu Hui-yuan', src: 'Official MV' },
  '我最親愛的': { artist: 'A-Mei', id: 'TVjsnSJlULg', kind: 'Lyrics: Lin Xi · Music: Russell Harris', src: 'Official MV' },
  // 課綱主題曲例
  '早安，晨之美！': { artist: 'Crowd Lu', id: 'jAlWCr5cIjE', kind: 'Everyday material · Lyrics & music: Crowd Lu', src: 'Official MV' },
  '朋友': { artist: 'Emil Wakin Chau', id: '6lbPgfKK7m4', kind: 'Appeal to friendship · Lyrics: Liu Szu-ming · Music: Liu Chih-hung', src: 'Official MV' },
  '月亮代表我的心': { artist: 'Teresa Teng', id: 'IgvDMB5fR-8', kind: 'Appeal to love · Lyrics: Sun Yi · Music: Weng Ching-hsi', src: 'Official audio' },
  'With Or Without You': { artist: 'U2', id: 'ujNeHIo7oTE', kind: 'Wider issues · U2', src: 'Official MV' },
  "Knockin' On Heaven's Door": { artist: 'Bob Dylan', id: 'rm9coqlk8fY', kind: 'Wider issues · Bob Dylan', src: 'Official audio' },
  '就是愛你': { artist: '陶喆', id: 'WVaOxR0ajw4', kind: 'Lyric hook · Lyrics: Wawa · Music: David Tao', src: 'Official MV' },
  '橄欖樹': { artist: 'Chyi Yu', id: 'LZb8fJZFhlo', kind: 'Lyrics: Sanmao · Music: Li Tai-hsiang', src: 'Official lyric video' },
  // 旋律波動的範例曲（第五堂），2026-10-16 以 oEmbed 確認為官方頻道上傳
  '在這座城市遺失了你': { artist: 'Accusefive', id: 'PlCbgZxonJs', kind: 'Lyrics & music: Pan Yun-an', src: 'Official MV' },
  '說了再見': { artist: 'Jay Chou', id: 'KKsioz-zaZY', kind: 'Lyrics: Gu Xiao-li, Huang Ling-jia · Music: Jay Chou', src: 'Official MV' },
  'APT.': { artist: 'ROSÉ & Bruno Mars', id: 'ekr2nIex040', kind: 'Lyrics & music: ROSÉ, Bruno Mars and others', src: 'Official MV' }
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
