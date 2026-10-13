/* ===== Guitar Lab 曲例與 YouTube 影片 =====
 * 歌單取自 2013 民謠吉他入門班講義（上、下冊）的曲例目錄，依章節主題分配。
 * 影片皆為官方頻道、唱片公司或 YouTube 官方音檔（Topic），2026-10-14 確認可嵌入。
 * kind 顯示在播放卡上：練習重點・原講義的調與 Capo。課堂只放影片，不附歌詞與和弦譜。
 */
window.PIXEL_SONGS = {
  // 第三章：四大和弦
  "I'm Yours": { artist: 'Jason Mraz', id: 'EkHTsc9PU2A', kind: '四大和弦・原調 B，彈 C 指型', src: '官方 Mv' },
  'Just The Way You Are': { artist: 'Bruno Mars', id: 'LjhCEhWiKXk', kind: '四大和弦・Capo 5 彈 C', src: '官方 Mv' },
  // 第四章：8 Beats、延音切分與 16 Beats
  '思念是一種病': { artist: '張震嶽、蔡健雅', id: '9ei1PUmDz98', kind: '8 Beats・Capo 2 彈 C', src: '官方 Mv' },
  '愛你': { artist: '陳芳語', id: 'KGrulNiJ6Uc', kind: '8 Beats・Capo 9 彈 C', src: '官方 Mv' },
  '好想對你說': { artist: '蕭敬騰', id: 'OjcYphaTWjQ', kind: '8 Beats・Capo 7 彈 C', src: '官方 Mv' },
  '你不知道的事': { artist: '王力宏', id: 'zvUsOXNPVxo', kind: '8 Beats・Capo 1 彈 C', src: '官方 Mv' },
  '朵朵': { artist: '蓓麗', id: 'LF4iFpffsB0', kind: '延音切分・Capo 4 彈 C', src: '歌手頻道' },
  '戀愛ing': { artist: '五月天', id: 'iSkRGgYSQfY', kind: '延音切分・C 調', src: '官方 Mv' },
  '小手拉大手': { artist: '梁靜茹', id: 'mh0uiWlr4RE', kind: '延音切分・C 調', src: '官方音檔' },
  '未填詞': { artist: '鄧福如', id: '2HVoycTYk_A', kind: '延音切分・Capo 3 彈 C', src: '官方 Mv' },
  'Way Back Into Love': { artist: 'Hugh Grant、Drew Barrymore', id: '0bwWy67MsOU', kind: '16 Beats・Capo 3 彈 G', src: '官方音檔' },
  '環島旅行': { artist: '熊寶貝樂團', id: 'pEbhvqRJ5Po', kind: '16 Beats・C 調', src: '官方音檔' },
  '是什麼讓我遇見這樣的你': { artist: '白安', id: 'aVmZpcrQBU4', kind: '16 Beats・Capo 1 彈 C', src: '官方 Mv' },
  // 第五章：三拍子系統
  'Moon River': { artist: '方大同', id: 'RxiulkJYGRI', kind: '3/4・Capo 3 彈 C', src: '官方音檔' },
  'From The Inside': { artist: 'Linkin Park', id: 'YLHpvjrFpe0', kind: '6/8・Capo 4 彈 Am', src: '官方 Mv' },
  '沒那麼簡單': { artist: '黃小琥', id: 'rmPHuvQoh0g', kind: '12/8・Capo 6 彈 C', src: '官方 Mv' },
  '聖誕結': { artist: '陳奕迅', id: 'kDbdvD4jsTk', kind: '12/8・C 調，尾段升半音', src: '官方 Mv' },
  // 第六章：16 Beats 附點，期中選曲
  'Falling Slowly': { artist: 'Glen Hansard、Markéta Irglová', id: 'k8mtXwtapX4', kind: '16 Beats 附點・C 調', src: '官方 Mv' },
  "The Blower's Daughter": { artist: 'Damien Rice', id: '5YXVMCHG-Nk', kind: '16 Beats 附點・Capo 4 彈 C', src: '官方 Mv' },
  "You're Beautiful": { artist: 'James Blunt', id: 'oofSnsGkops', kind: '16 Beats 附點・Capo 3 彈 C', src: '官方 Mv' },
  'Wherever You Are': { artist: 'ONE OK ROCK', id: 'qs4Q4cQxyU4', kind: '16 Beats 附點・Capo 4 彈 C', src: '官方音檔' },
  '真實': { artist: 'io 樂團', id: 'C33ISihZ0os', kind: '16 Beats 附點・Capo 9 彈 C', src: '官方 Mv' },
  'Lucky': { artist: 'Jason Mraz、Colbie Caillat', id: 'acvIVA9-FMQ', kind: '16 Beats 附點・C 調', src: '官方 Mv' },
  'Love Story': { artist: 'Taylor Swift', id: '8xg3vE8Ie_E', kind: '16 Beats 附點・Capo 2 彈 C', src: '官方 Mv' },
  '我的歌聲裡': { artist: '曲婉婷', id: 'w0dMz8RBG7g', kind: '16 Beats 附點・Capo 6 彈 C', src: '官方 Mv' },
  // 第七章：分散和弦指法
  '旅行的意義': { artist: '陳綺貞', id: 'tv95k0zqnaA', kind: '指法・Capo 2 彈 C', src: '官方 Mv' },
  '我不會喜歡你': { artist: '陳柏霖', id: 'PTa1Z8Dk4P0', kind: '指法・F#m 調', src: '官方 Mv' },
  // 第八章：G 大調
  '天后': { artist: '陳勢安', id: 'cRVDT_MdLpY', kind: 'G 大調・Capo 2 彈 G', src: '官方音檔' },
  '末班車': { artist: '蕭煌奇', id: 'bDZ2pcn_V4c', kind: 'G 大調・Capo 2 彈 Em', src: '官方 Mv' },
  'Wake Me Up When September Ends': { artist: 'Green Day', id: 'NU9JoFKlaZ0', kind: 'G 大調・G 調', src: '官方 Mv' },
  'Poker Face': { artist: 'Lady Gaga', id: 'bESGLojNYSo', kind: 'G 大調・Capo 4 彈 Em', src: '官方 Mv' },
  "Sweet Child O' Mine": { artist: "Guns N' Roses", id: '1w7OgIMMRc4', kind: 'G 大調・Capo 7 彈 G', src: '官方 Mv' },
  // 第九章：低音
  'With Or Without You': { artist: 'U2', id: 'ujNeHIo7oTE', kind: '低音線・D 調', src: '官方 Mv' },
  '牛仔很忙': { artist: '周杰倫', id: '9o20U91aJdg', kind: '低音線・Country Folk・C 調', src: '官方 Mv' },
  "Don't Cry": { artist: "Guns N' Roses", id: 'zRIbf6JqkNc', kind: '低音線・降半音彈 Am', src: '官方 Mv' },
  'Yesterday': { artist: 'The Beatles', id: 'fCV9oqtwyVA', kind: '低音線・降全音彈 G', src: '官方音檔' },
  // 第十章：和弦編排
  '如果有如果': { artist: '鄧福如', id: 'EEDKy3rhZaw', kind: '和弦編排・Capo 2 彈 C', src: '官方 Mv' },
  '王妃': { artist: '蕭敬騰', id: 'qnDlH_S4Fak', kind: '和弦編排・Capo 2 彈 Em', src: '官方 Mv' },
  // 第十二章：其他調性與轉調
  '玫瑰色的你': { artist: '張懸', id: 'CMH-VJ9cvG8', kind: 'D 大調／Bm・不夾 Capo', src: '官方 Mv' },
  '晚安台灣': { artist: '滅火器', id: 'MaJYdrJP3uw', kind: 'F 大調・Capo 1 彈 F', src: '官方 Mv' },
  '島嶼天光': { artist: '滅火器', id: 'riNecvPcmTE', kind: '轉調・G 轉 A', src: '官方音檔' },
  'We Are The World': { artist: 'USA for Africa', id: '182f6dTagkU', kind: '轉調・E 轉 F', src: '官方 Mv' }
};
window.PIXEL_LESSON_SONGS = {
  3: ["I'm Yours", 'Just The Way You Are'],
  4: ['思念是一種病', '好想對你說', '戀愛ing', '是什麼讓我遇見這樣的你', '愛你', '你不知道的事', '朵朵', '小手拉大手', '未填詞', 'Way Back Into Love', '環島旅行'],
  5: ['Moon River', 'From The Inside', '沒那麼簡單', '聖誕結'],
  6: ['Falling Slowly', "You're Beautiful", 'Lucky', '我的歌聲裡', "The Blower's Daughter", 'Wherever You Are', '真實', 'Love Story'],
  7: ['旅行的意義', '我不會喜歡你'],
  8: ['天后', '末班車', 'Wake Me Up When September Ends', 'Poker Face', "Sweet Child O' Mine"],
  9: ['With Or Without You', '牛仔很忙', "Don't Cry", 'Yesterday'],
  10: ['如果有如果', '王妃'],
  12: ['玫瑰色的你', '晚安台灣', '島嶼天光', 'We Are The World']
};
