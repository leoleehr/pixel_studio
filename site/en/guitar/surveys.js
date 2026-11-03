/* ===== Guitar Lab 問卷內容（與講義的課前問卷、課程回饋一致） =====
 * 題型：single 單選、multi 複選、text 長文字、short 短文字、number 數字、scale 1–5 分、matrix 多項 1–5 分自評
 */
window.PIXEL_SURVEYS = [
  { id: 'g-pre-1', lesson: 1, title: 'Chapter 1 pre-class survey (joining survey)', intro: 'Tell us about your music experience, the guitar you have and what you hope for, and the teacher will adjust the course to fit.', questions: [
    { q: 'Instruments you\'ve learned', type: 'multi', options: ['Never learned one', 'Piano', 'Ukulele', 'Recorder', 'Wind instruments', 'String instruments', 'Drum kit'], other: true },
    { q: 'Current guitar level', type: 'single', options: ['Never touched one', 'Taught myself a little', 'I know a few chords', 'Can play and sing a whole song'] },
    { q: 'Your type of guitar', type: 'single', options: ['Folk guitar (steel strings)', 'Classical guitar (nylon strings)', 'Electric guitar', 'I don\'t have a guitar yet'] },
    { q: 'Three songs you most want to play', type: 'short', placeholder: 'For example: 小幸運, 晴天, Perfect' },
    { q: 'Rate yourself (1 to 5)', type: 'matrix', rows: ['Sense of rhythm', 'Reading music', 'Left-hand fretting', 'Right-hand strumming', 'Play and sing'] },
    { q: 'Your biggest worry about learning guitar', type: 'multi', options: ['Sore fingers', 'Can\'t change chords in time', 'Unsteady rhythm', 'Not used to reading music', 'Not enough practice time'], other: true },
    { q: 'The one thing you most want to achieve by the end of the twelve chapters', type: 'text' },
    { q: 'Time you can practise each week', type: 'single', options: ['Under 1 hour', '1–3 hours', '3–5 hours', 'Over 5 hours'] }
  ] },
  { id: 'g-pre-2', lesson: 2, title: 'Chapter 2 pre-class survey', intro: 'How last chapter\'s practice went, and how familiar you are with rhythm and reading music.', questions: [
    { q: 'How many of last chapter\'s five practice tasks you finished', type: 'single', options: ['0', '1', '2', '3', '4', '5'] },
    { q: 'How many guitar parts you can name without the handbook', type: 'number', unit: ' extra' },
    { q: 'Roughly how long it takes you to tune all six strings yourself', type: 'number', unit: 'Minutes' },
    { q: 'Kinds of music you can read', type: 'multi', options: ['Staff', 'Numbered notation', 'Tab', 'Chord charts', 'I can\'t read music yet'] },
    { q: 'Your steadiest tempo for open-string downstrokes with a metronome', type: 'number', unit: 'BPM' },
    { q: 'Where your fingers or wrists ache when you practise', type: 'multi', options: ['Fingertips', 'Left wrist', 'Right wrist', 'Shoulders', 'No aches'] }
  ] },
  { id: 'g-pre-3', lesson: 3, title: 'Chapter 3 pre-class survey', intro: 'How your finger crawls are going, as you get ready to press your first chords.', questions: [
    { q: 'Your fastest finger-crawl tempo', type: 'number', unit: 'BPM' },
    { q: 'The hardest of your four fingers to control', type: 'single', options: ['Index', 'Middle', 'Ring', 'Little'] },
    { q: 'What\'s easiest to mix up when reading tab', type: 'single', options: ['Which line is string 1', 'Which fret the numbers mean', 'Note lengths', 'No problems so far'] },
    { q: 'Chords you can already play', type: 'multi', options: ['C', 'G', 'Am', 'F', 'Em', 'D', 'None yet'] },
    { q: 'How your fingertips are now', type: 'single', options: ['Very sore', 'A little sore', 'Starting to form calluses', 'Not sore any more'] }
  ] },
  { id: 'g-pre-4', lesson: 4, title: 'Chapter 4 pre-class survey', intro: 'How your chord changes are going, as you get ready to add a right-hand groove.', questions: [
    { q: 'Your steadiest tempo for C → G → Am → F, 4 beats per chord', type: 'number', unit: 'BPM' },
    { q: 'The hardest of the four chords to make ring', type: 'single', options: ['C', 'G', 'Am', 'F'] },
    { q: 'Your least smooth chord change', type: 'single', options: ['C → G', 'G → Am', 'Am → F', 'F → C', 'F → G'] },
    { q: 'What happens most often when you strum', type: 'multi', options: ['Hitting extra strings', 'Dropping the pick', 'No sound on the upstroke', 'Speeding up as I go', 'Haven\'t tried yet'] },
    { q: 'How often you nod or tap your foot to the beat when listening to songs', type: 'single', options: ['Often', 'Sometimes', 'Rarely'] }
  ] },
  { id: 'g-pre-5', lesson: 5, title: 'Chapter 5 pre-class survey', intro: 'How your strumming is going, and how familiar you are with songs in triple time.', questions: [
    { q: 'Your steadiest tempo for 8 beats with the four main chords', type: 'number', unit: 'BPM' },
    { q: 'How well you know syncopated folk rock', type: 'scale', low: 'Still have to think', high: 'No thinking needed' },
    { q: 'How tense your right wrist gets when strumming', type: 'single', options: ['Often tense', 'Sometimes tense', 'Stays relaxed'] },
    { q: 'Songs in triple time you know', type: 'short', optional: true, placeholder: 'For example: Happy Birthday' },
    { q: 'Accompaniment styles you want to learn', type: 'multi', options: ['Slow songs', 'Fast songs', 'Waltz', 'Shuffle'] }
  ] },
  { id: 'g-pre-6', lesson: 6, title: 'Chapter 6 pre-class survey', intro: 'Getting ready for the mid-course performance: choosing a song, capo and sections.', questions: [
    { q: 'The song you want to play and sing at mid-course', type: 'short', hint: 'Find a chord chart first; we\'ll analyse the sections together in Chapter 6' },
    { q: 'How the song\'s original key feels when you sing it', type: 'single', options: ['About right', 'Too high', 'Too low', 'Not sure yet'] },
    { q: 'Experience with a capo', type: 'single', options: ['I\'ve used one', 'Never used one', 'I don\'t have a capo yet'] },
    { q: 'How sure you are at telling verse, chorus and bridge apart', type: 'scale', low: 'Can\'t tell', high: 'Very clear' },
    { q: 'Format for the mid-course performance', type: 'single', options: ['Solo', 'In pairs', 'Group'] }
  ] },
  { id: 'g-pre-7', lesson: 7, title: 'Chapter 7 pre-class survey', intro: 'After mid-course, we move on to fingerpicking and theory.', questions: [
    { q: 'What you were happiest with in your mid-course performance', type: 'text' },
    { q: 'What you most want to improve from your mid-course performance', type: 'text' },
    { q: 'Experience listening to or practising fingerstyle', type: 'single', options: ['I\'ve practised it', 'Heard it, haven\'t practised', 'Never heard it'] },
    { q: 'How familiar terms like "interval" and "triad" are to you', type: 'scale', low: 'First time hearing them', high: 'Very familiar' },
    { q: 'Your right-hand nails', type: 'single', options: ['Kept a little long', 'Cut short'] }
  ] },
  { id: 'g-pre-8', lesson: 8, title: 'Chapter 8 pre-class survey', intro: 'How your fingerpicking is going, as you get ready to take on barre chords.', questions: [
    { q: 'How well you know the T-1-2-3 arpeggio', type: 'scale', low: 'Still have to think', high: 'No thinking needed' },
    { q: 'How your full barre F is going', type: 'single', options: ['It rings', 'A few strings are muted', 'Can\'t press it down at all', 'Haven\'t tried yet'] },
    { q: 'The hardest part of laying your left index finger flat', type: 'multi', options: ['String 2 is muted', 'String 3 is muted', 'My hand aches', 'Squeezing too hard with my thumb', 'Haven\'t tried yet'] },
    { q: 'Songs in G major you can play', type: 'short', optional: true }
  ] },
  { id: 'g-pre-9', lesson: 9, title: 'Chapter 9 pre-class survey', intro: 'How your barre chords are going, as you get ready to get the bass moving.', questions: [
    { q: 'How your F and Bm barre chords are going', type: 'single', options: ['Both ring', 'Only F', 'Only Bm', 'Neither yet'] },
    { q: 'How well you can hear the bass line when listening to songs', type: 'scale', low: 'Can\'t tell', high: 'Very clear' },
    { q: 'How familiar chord names like C/G and G/B are to you', type: 'single', options: ['Seen them and can play them', 'Seen them, haven\'t learned', 'Never seen them'] }
  ] },
  { id: 'g-pre-10', lesson: 10, title: 'Chapter 10 pre-class survey', intro: 'How your bass movement is going, as you get ready to understand chord progressions.', questions: [
    { q: 'How smooth your descending bass lines are (for example C → G/B → Am)', type: 'scale', low: 'Still not smooth', high: 'Very smooth' },
    { q: 'Have you noticed that lots of songs use very similar chords?', type: 'single', options: ['Yes, I\'ve noticed', 'Never paid attention'] },
    { q: 'How much you want to learn to put chords to songs yourself', type: 'single', options: ['Really want to', 'A bit interested', 'Neutral'] },
    { q: 'The song you\'ve practised most lately', type: 'short', optional: true }
  ] },
  { id: 'g-pre-11', lesson: 11, title: 'Chapter 11 pre-class survey', intro: 'How your chord arranging is going, as you get ready to add guitar techniques.', questions: [
    { q: 'How sure you are naming a song\'s progression in scale degrees', type: 'scale', low: 'Not sure yet', high: 'Completely' },
    { q: 'Techniques you most want to learn', type: 'multi', options: ['Hammer-ons', 'Pull-offs', 'Slides', 'Palm muting', 'Chuck', 'Percussive slaps', 'Harmonics', 'Bends'] },
    { q: 'Guitarists or performance videos you admire', type: 'short', optional: true }
  ] },
  { id: 'g-pre-12', lesson: 12, title: 'Chapter 12 pre-class survey', intro: 'The last chapter: choosing a key, songwriting and your final project.', questions: [
    { q: 'Format of your final project', type: 'single', options: ['Play and sing a song I like', 'Arrange a song', 'A song I wrote', 'Still thinking'] },
    { q: 'The song or theme of your final project', type: 'short' },
    { q: 'Experience writing lyrics or melodies', type: 'single', options: ['I\'ve finished pieces', 'I\'ve written fragments', 'No experience yet'] },
    { q: 'Your most comfortable range or key', type: 'short', optional: true, placeholder: 'It\'s fine if you\'re not sure yet' }
  ] },
  { id: 'g-feedback', lesson: 0, title: 'Course feedback survey', intro: 'That\'s all twelve chapters. Thank you for playing all the way here. Your feedback will make the course better for the next class.', questions: [
    { q: 'Overall course satisfaction', type: 'scale', low: 'Dissatisfied', high: 'Very satisfied' },
    { q: 'Rate yourself at the end of the course (1 to 5)', type: 'matrix', rows: ['Sense of rhythm', 'Reading music', 'Chord', 'Strumming', 'Fingerpicking', 'Play and sing'] },
    { q: 'The three chapters you got the most from', type: 'multi', options: ['1 Meet the guitar', '2 Reading and warm-ups', '3 First chords', '4 Strumming', '5 Triple time', '6 Song form', '7 Fingerpicking', '8 Barre chords', '9 Bass', '10 Scale degrees', '11 Techniques', '12 Keys and songwriting'] },
    { q: 'The most helpful website tools', type: 'multi', options: ['Interactive slides', 'Tuner', 'Chord change trainer', 'Strum-along metronome', 'Recording', 'Practice log'] },
    { q: 'Your top suggestion for the teacher', type: 'text' },
    { q: 'How likely you are to keep playing guitar', type: 'single', options: ['Definitely', 'Probably', 'Not sure yet'] }
  ] }
];
