/* ===== Guitar Lab 曲例與 YouTube 影片 =====
 * 歌單取自 2013 民謠吉他入門班講義（上、下冊）的曲例目錄，依章節主題分配。
 * 影片皆為官方頻道、唱片公司或 YouTube 官方音檔（Topic），2026-10-14 確認可嵌入。
 * kind 顯示在播放卡上：練習重點・原講義的調與 Capo。課堂只放影片，不附歌詞與和弦譜。
 */
window.PIXEL_SONGS = {
  // 第三章：四大和弦
  "I'm Yours": { artist: 'Jason Mraz', id: 'EkHTsc9PU2A', kind: 'Four main chords · original key B, play C shapes', src: 'Official MV' },
  'Just The Way You Are': { artist: 'Bruno Mars', id: 'LjhCEhWiKXk', kind: 'Four main chords · capo 5, play C', src: 'Official MV' },
  // 第四章：8 Beats、延音切分與 16 Beats
  '思念是一種病': { artist: 'A-Yue, Tanya Chua', id: '9ei1PUmDz98', kind: '8 beats · capo 2, play C', src: 'Official MV' },
  '愛你': { artist: 'Kimberley Chen', id: 'KGrulNiJ6Uc', kind: '8 beats · capo 9, play C', src: 'Official MV' },
  '好想對你說': { artist: 'Jam Hsiao', id: 'OjcYphaTWjQ', kind: '8 beats · capo 7, play C', src: 'Official MV' },
  '你不知道的事': { artist: 'Wang Leehom', id: 'zvUsOXNPVxo', kind: '8 beats · capo 1, play C', src: 'Official MV' },
  '朵朵': { artist: 'Beili', id: 'LF4iFpffsB0', kind: 'Tied syncopation · capo 4, play C', src: 'Artist channel' },
  '戀愛ing': { artist: 'Mayday', id: 'iSkRGgYSQfY', kind: 'Tied syncopation · key of C', src: 'Official MV' },
  '小手拉大手': { artist: 'Fish Leong', id: 'mh0uiWlr4RE', kind: 'Tied syncopation · key of C', src: 'Official audio' },
  '未填詞': { artist: 'A-Fu', id: '2HVoycTYk_A', kind: 'Tied syncopation · capo 3, play C', src: 'Official MV' },
  'Way Back Into Love': { artist: 'Hugh Grant, Drew Barrymore', id: '0bwWy67MsOU', kind: '16 beats · capo 3, play G', src: 'Official audio' },
  '環島旅行': { artist: 'Xiong Bao Bei Band', id: 'pEbhvqRJ5Po', kind: '16 beats · key of C', src: 'Official audio' },
  '是什麼讓我遇見這樣的你': { artist: 'Ann Bai', id: 'aVmZpcrQBU4', kind: '16 beats · capo 1, play C', src: 'Official MV' },
  // 第五章：三拍子系統
  'Moon River': { artist: 'Khalil Fong', id: 'RxiulkJYGRI', kind: '3/4 · capo 3, play C', src: 'Official audio' },
  'From The Inside': { artist: 'Linkin Park', id: 'YLHpvjrFpe0', kind: '6/8 · capo 4, play Am', src: 'Official MV' },
  '沒那麼簡單': { artist: 'Tiger Huang', id: 'rmPHuvQoh0g', kind: '12/8 · capo 6, play C', src: 'Official MV' },
  '聖誕結': { artist: 'Eason Chan', id: 'kDbdvD4jsTk', kind: '12/8 · key of C, up a semitone at the end', src: 'Official MV' },
  // 第六章：16 Beats 附點，期中選曲
  'Falling Slowly': { artist: 'Glen Hansard, Markéta Irglová', id: 'k8mtXwtapX4', kind: '16 beats dotted · key of C', src: 'Official MV' },
  "The Blower's Daughter": { artist: 'Damien Rice', id: '5YXVMCHG-Nk', kind: '16 beats dotted · capo 4, play C', src: 'Official MV' },
  "You're Beautiful": { artist: 'James Blunt', id: 'oofSnsGkops', kind: '16 beats dotted · capo 3, play C', src: 'Official MV' },
  'Wherever You Are': { artist: 'ONE OK ROCK', id: 'qs4Q4cQxyU4', kind: '16 beats dotted · capo 4, play C', src: 'Official audio' },
  '真實': { artist: 'io band', id: 'C33ISihZ0os', kind: '16 beats dotted · capo 9, play C', src: 'Official MV' },
  'Lucky': { artist: 'Jason Mraz, Colbie Caillat', id: 'acvIVA9-FMQ', kind: '16 beats dotted · key of C', src: 'Official MV' },
  'Love Story': { artist: 'Taylor Swift', id: '8xg3vE8Ie_E', kind: '16 beats dotted · capo 2, play C', src: 'Official MV' },
  '我的歌聲裡': { artist: 'Wanting Qu', id: 'w0dMz8RBG7g', kind: '16 beats dotted · capo 6, play C', src: 'Official MV' },
  // 第七章：分散和弦指法
  '旅行的意義': { artist: 'Cheer Chen', id: 'tv95k0zqnaA', kind: 'Fingerpicking · capo 2, play C', src: 'Official MV' },
  '我不會喜歡你': { artist: 'Chen Bolin', id: 'PTa1Z8Dk4P0', kind: 'Fingerpicking · key of F#m', src: 'Official MV' },
  // 第八章：G 大調
  '天后': { artist: 'Andrew Tan', id: 'cRVDT_MdLpY', kind: 'G major · capo 2, play G', src: 'Official audio' },
  '末班車': { artist: 'Ricky Hsiao', id: 'bDZ2pcn_V4c', kind: 'G major · capo 2, play Em', src: 'Official MV' },
  'Wake Me Up When September Ends': { artist: 'Green Day', id: 'NU9JoFKlaZ0', kind: 'G major · key of G', src: 'Official MV' },
  'Poker Face': { artist: 'Lady Gaga', id: 'bESGLojNYSo', kind: 'G major · capo 4, play Em', src: 'Official MV' },
  "Sweet Child O' Mine": { artist: "Guns N' Roses", id: '1w7OgIMMRc4', kind: 'G major · capo 7, play G', src: 'Official MV' },
  // 第九章：低音
  'With Or Without You': { artist: 'U2', id: 'ujNeHIo7oTE', kind: 'Bass line · key of D', src: 'Official MV' },
  '牛仔很忙': { artist: 'Jay Chou', id: '9o20U91aJdg', kind: 'Bass line · country folk · key of C', src: 'Official MV' },
  "Don't Cry": { artist: "Guns N' Roses", id: 'zRIbf6JqkNc', kind: 'Bass line · tuned down a semitone, play Am', src: 'Official MV' },
  'Yesterday': { artist: 'The Beatles', id: 'fCV9oqtwyVA', kind: 'Bass line · tuned down a whole tone, play G', src: 'Official audio' },
  // 第十章：和弦編排
  '如果有如果': { artist: 'A-Fu', id: 'EEDKy3rhZaw', kind: 'Chord arranging · capo 2, play C', src: 'Official MV' },
  '王妃': { artist: 'Jam Hsiao', id: 'qnDlH_S4Fak', kind: 'Chord arranging · capo 2, play Em', src: 'Official MV' },
  // 第十二章：其他調性與轉調
  '玫瑰色的你': { artist: 'Deserts Chang', id: 'CMH-VJ9cvG8', kind: 'D major / Bm · no capo', src: 'Official MV' },
  '晚安台灣': { artist: 'Fire EX.', id: 'MaJYdrJP3uw', kind: 'F major · capo 1, play F', src: 'Official MV' },
  '島嶼天光': { artist: 'Fire EX.', id: 'riNecvPcmTE', kind: 'Modulation · G to A', src: 'Official audio' },
  'We Are The World': { artist: 'USA for Africa', id: '182f6dTagkU', kind: 'Modulation · E to F', src: 'Official MV' }
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
