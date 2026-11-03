/* ===== Piano Lab 問卷內容（與講義的課前問卷、課程回饋一致） =====
 * 題型：single 單選、multi 複選、text 長文字、short 短文字、number 數字、scale 1–5 分、matrix 多項 1–5 分自評
 */
window.PIXEL_SURVEYS = [
  { id: 'p-pre-1', lesson: 1, title: 'Lesson 1 pre-class survey (joining the class)', intro: 'Tell us about your musical experience, the instrument you have and what you\'re hoping for; the teacher will adjust the course based on your answers.', questions: [
    { q: 'Piano experience', type: 'single', options: ['Never learned one', 'Learned as a kid, then stopped', 'Learned classical, want to play pop', 'Can play a few pop songs'] },
    { q: 'Other instruments you play', type: 'multi', options: ['None', 'Guitar', 'Ukulele', 'Recorder', 'Wind instruments', 'String instruments', 'Drums'], other: true },
    { q: 'Instrument you practise on at home', type: 'single', options: ['Upright piano', 'Grand piano', 'Digital piano', 'Keyboard (61 keys or more)', 'Keyboard (fewer than 61 keys)', 'No instrument yet'] },
    { q: 'Music you can read', type: 'multi', options: ['Staff', 'Numbered notation', 'Chord charts', 'I can\'t read music yet'] },
    { q: 'Rate yourself (1 to 5)', type: 'matrix', rows: ['Sense of rhythm', 'Reading music', 'Hand coordination', 'Understanding chords', 'Play and sing'] },
    { q: 'Three songs you most want to play on piano', type: 'short', placeholder: 'For example: 月亮代表我的心, 小幸運, Canon' },
    { q: 'The one thing you most want to achieve by the end of the twelve lessons', type: 'text' },
    { q: 'Time you can practise each week', type: 'single', options: ['Under 1 hour', '1–3 hours', '3–5 hours', 'Over 5 hours'] }
  ] },
  { id: 'p-pre-2', lesson: 2, title: 'Lesson 2 pre-class survey', intro: 'How last lesson\'s practice went, and how comfortable you are reading music.', questions: [
    { q: 'Practice items completed since last lesson', type: 'single', options: ['0', '1', '2', '3', '4', '5'] },
    { q: 'In five-finger position, are all five notes equally loud?', type: 'scale', low: 'Very uneven', high: 'Very even' },
    { q: 'How sure you are of finding middle C with your eyes closed', type: 'scale', low: 'Can\'t find it', high: 'Find it straight away' },
    { q: 'Theory you most want to strengthen', type: 'multi', options: ['Note names and solfège', 'Staff', 'Time and rhythm', 'Key signature', 'Interval'] },
    { q: 'Where you feel tense when practising', type: 'multi', options: ['Shoulders', 'Wrists', 'Fingers', 'Back', 'No tension'] }
  ] },
  { id: 'p-pre-3', lesson: 3, title: 'Lesson 3 pre-class survey', intro: 'How your reading is going, before we start on fingering.', questions: [
    { q: 'Questions in a row you got right in the note-finding game (staff)', type: 'number', unit: 'questions' },
    { q: 'What you mix up most', type: 'single', options: ['Treble clef notes', 'Bass clef notes', 'Names of the black keys', 'Working out intervals', 'No problems so far'] },
    { q: 'Daily practice time', type: 'number', unit: 'Minutes' },
    { q: 'The hardest of your five fingers to control', type: 'single', options: ['Thumb', 'Index', 'Middle', 'Ring', 'Little'] },
    { q: 'How skilled your left hand is', type: 'scale', low: 'Barely moves', high: 'As nimble as the right' }
  ] },
  { id: 'p-pre-4', lesson: 4, title: 'Lesson 4 pre-class survey', intro: 'How your scales are going, before we meet chords.', questions: [
    { q: 'Your steadiest speed on the C major scale', type: 'number', unit: 'BPM' },
    { q: 'How smooth your thumb-unders and finger-overs are', type: 'scale', low: 'Keep getting stuck', high: 'Very smooth' },
    { q: 'Chords you can already play', type: 'multi', options: ['C', 'F', 'G', 'Am', 'Dm', 'Em', 'None yet'] },
    { q: 'Playing scales hands together', type: 'single', options: ['Yes', 'Only slowly', 'Haven\'t tried yet'] }
  ] },
  { id: 'p-pre-5', lesson: 5, title: 'Lesson 5 pre-class survey', intro: 'How your chords are going, before we play our first song.', questions: [
    { q: 'Number of chords you can play straight away', type: 'number', unit: ' extra' },
    { q: 'How C → F → G → C in inversions is going', type: 'single', options: ['Very smooth, no jumping', 'Sometimes need to look at the keys', 'Get stuck changing to G', 'Still memorising the chords'] },
    { q: 'How sure you are of telling major chords from minor', type: 'scale', low: 'Can\'t tell', high: 'Very clear' },
    { q: 'The song you most want to learn first', type: 'short', optional: true }
  ] },
  { id: 'p-pre-6', lesson: 6, title: 'Lesson 6 pre-class survey', intro: 'How your first song is going, before we add rhythm styles.', questions: [
    { q: 'How Twinkle Twinkle hands together is going', type: 'single', options: ['All the way through without stopping', 'Occasional pauses', 'Stop when changing chords', 'Still practising hands separately'] },
    { q: 'Your most comfortable left-hand pattern', type: 'single', options: ['Root', 'Fifths', 'Block chords'] },
    { q: 'How well your hands work together', type: 'scale', low: 'Very hard to do both at once', high: 'Very well coordinated' },
    { q: 'Experience with the sustain pedal', type: 'single', options: ['Use it often', 'Use it sometimes', 'Never used one', 'My instrument has no pedal'] }
  ] },
  { id: 'p-pre-7', lesson: 7, title: 'Lesson 7 pre-class survey', intro: 'How your rhythm styles are going, before we strengthen accompaniment.', questions: [
    { q: 'The slow soul accompaniment you know best', type: 'single', options: ['(1) Up and hold', '(2) Up and back down', '(3) Block chords', '(4) Pendulum', 'Not confident with any yet'] },
    { q: 'How comfortable you are with the waltz', type: 'scale', low: 'Still have to think', high: 'No thinking needed' },
    { q: 'The song you want to play and sing at mid-course', type: 'short', hint: 'Choose a song in C, in a single key' },
    { q: 'Format for the mid-course performance', type: 'single', options: ['Play and sing', 'Just playing, melody and accompaniment', 'A duo', 'Still deciding'] }
  ] },
  { id: 'p-pre-8', lesson: 8, title: 'Lesson 8 pre-class survey', intro: 'Getting ready for the mid-course performance.', questions: [
    { q: 'Mid-course song', type: 'short' },
    { q: 'Accompaniment patterns for the verse and chorus', type: 'short', placeholder: 'For example: verse 4 beats, chorus 8 beats two hands, two octaves (15th)' },
    { q: 'How well you know the accompaniment', type: 'scale', low: 'Still need the music', high: 'Memorised' },
    { q: 'The hardest part of playing and singing', type: 'multi', options: ['Hands and voice won\'t work separately', 'Breathing', 'The notes I sing are too high or too low', 'I lose the beat when I sing and play together', 'Haven\'t tried yet'] }
  ] },
  { id: 'p-pre-9', lesson: 9, title: 'Lesson 9 pre-class survey', intro: 'After mid-course, we move into the patterns of harmony.', questions: [
    { q: 'What you were happiest with in your mid-course performance', type: 'text' },
    { q: 'What you most want to improve from your mid-course performance', type: 'text' },
    { q: 'How familiar you are with "scale degrees" and "Ⅰ Ⅳ Ⅴ"', type: 'scale', low: 'First time hearing them', high: 'Very familiar' },
    { q: 'Why you\'d like to be able to transpose', type: 'multi', options: ['Songs are too high', 'Songs are too low', 'To play with friends', 'Don\'t need to transpose yet'] }
  ] },
  { id: 'p-pre-10', lesson: 10, title: 'Lesson 10 pre-class survey', intro: 'How your scale degrees are going, before we meet slash chords.', questions: [
    { q: 'Keys you can write the diatonic chords for', type: 'multi', options: ['C major', 'G major', 'F major', 'D major', 'Not confident with any yet'] },
    { q: 'How transposing your mid-course song is going', type: 'single', options: ['Transposed and playing it', 'Wrote out the degrees, haven\'t played it', 'Still working it out', 'Haven\'t tried yet'] },
    { q: 'Have you heard of the "Canon progression"?', type: 'single', options: ['Heard of it, and can play it', 'Heard of it, can\'t play it', 'Haven\'t heard of it'] },
    { q: 'Chords you\'ve noticed repeating in songs you love', type: 'short', optional: true }
  ] },
  { id: 'p-pre-11', lesson: 11, title: 'Lesson 11 pre-class survey', intro: 'How your progressions are going, before we learn more rhythm styles.', questions: [
    { q: 'How the Canon progression\'s descending bass line is going', type: 'single', options: ['Smoothly all the way', 'Sometimes find the wrong bass note', 'Only the plain bass so far', 'Still practising'] },
    { q: 'The progression you know best', type: 'single', options: ['1645', '1564', 'Canon progression', '4536', '2-5-1'] },
    { q: 'With your left hand spread, how many white keys from thumb to little finger?', type: 'number', unit: 'white keys' },
    { q: 'Music styles you\'d like to learn', type: 'multi', options: ['Classic ballads', 'Piano solos', 'Jazz', 'Bossa Nova', 'Rock', 'Classical arrangements'] }
  ] },
  { id: 'p-pre-12', lesson: 12, title: 'Lesson 12 pre-class survey', intro: 'Getting ready for the final performance.', questions: [
    { q: 'Final song', type: 'short' },
    { q: 'Key of your final song', type: 'single', options: ['C major', 'G major', 'A minor', 'Other key'] },
    { q: 'Accompaniment patterns used', type: 'multi', options: ['Slow Soul', '4 Beats', '8 Beats', 'Waltz', 'Slow Rock', 'Tenths', 'Two hands, two octaves (15th)'] },
    { q: 'How you feel before the performance', type: 'scale', low: 'Very nervous', high: 'Really looking forward to it' }
  ] },
  { id: 'p-feedback', lesson: 0, title: 'Course feedback survey', intro: 'That\'s all twelve lessons. Thank you for playing all the way here. Your feedback will make the next course even better.', questions: [
    { q: 'Overall satisfaction', type: 'scale', low: 'Dissatisfied', high: 'Very satisfied' },
    { q: 'What you got from each unit (1 to 5)', type: 'matrix', rows: ['Meeting the piano and theory', 'Scale fingering', 'Chords and inversions', 'Playing songs', 'Rhythm styles and accompaniment', 'Play and sing', 'Scale degrees and transposing', 'Progressions and slash chords', 'Major and minor, and G major'] },
    { q: 'Most helpful interactive tool', type: 'multi', options: ['Playable keyboard', 'Note-finding game', 'Scale fingering', 'Chord lab', 'Accompaniment player', 'Playing songs', 'Diatonic chords'] },
    { q: 'Pace of the course', type: 'single', options: ['Too slow', 'Just right', 'Too fast'] },
    { q: 'What you got most out of it', type: 'text' },
    { q: 'Anything you\'d like added or changed', type: 'text' },
    { q: 'Will you go on to the intermediate course?', type: 'single', options: ['Yes', 'Thinking about it', 'Not for now'] }
  ] }
];
