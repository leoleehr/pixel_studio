/* ===== 問卷內容（與講義的課前問卷、課程回饋問卷一致） =====
 * 題型：single 單選、multi 複選、text 長文字、short 短文字、number 數字、scale 1–5 分、matrix 多項 1–5 分自評
 */
window.PIXEL_SURVEYS = [
  { id: 'pre-1', lesson: 1, title: 'Lesson 1 pre-class survey (joining the class)', intro: 'Tell us about your singing experience, what\'s bothering you now and what you hope for. The teacher will adjust the course based on your answers.', questions: [
    { q: 'Past singing experience', type: 'multi', options: ['None', 'Ktv', 'Choir', 'Band', 'Took singing lessons'] },
    { q: 'Current guitar level', type: 'single', options: ['Just starting', 'Can play simple chords', 'Can play and sing a whole song'] },
    { q: 'Your three favourite singers', type: 'short', placeholder: 'e.g. Crowd Lu, Hebe Tien, Mayday' },
    { q: 'The song you sing most often', type: 'short', hint: 'Bring the lyrics or chord chart of this song to Lesson 1' },
    { q: 'Rate yourself (1 to 5)', type: 'matrix', rows: ['Pitch', 'Rhythm', 'Breath', 'High notes', 'Diction', 'Stage presence'] },
    { q: 'Your biggest problem when singing', type: 'multi', options: ['High notes are a struggle', 'Voice cracks', 'Singing off pitch', 'Running out of breath', 'Sore throat after singing', 'Getting nervous easily'], other: true },
    { q: 'The one thing you most want to achieve by the end of the six lessons', type: 'text' },
    { q: 'Are you willing to sing solo in class?', type: 'single', options: ['Yes', 'I\'d rather sing with a partner', 'Not for now'] },
    { q: 'Health (optional)', type: 'text', optional: true, hint: 'Vocal nodules, allergic rhinitis, asthma or smoking. Only used by the teacher to adjust how hard you practise' }
  ] },
  { id: 'pre-2', lesson: 2, title: 'Lesson 2 pre-class survey', intro: 'How last week\'s practice went, and your breathing habits.', questions: [
    { q: 'How many of last week\'s five practice tasks you finished', type: 'single', options: ['0', '1', '2', '3', '4', '5'] },
    { q: 'When breaking down song form, which section was hardest to spot', type: 'single', options: ['Verse', 'Lead-in', 'Chorus', 'Bridge', 'Break line'] },
    { q: 'Where in a song you usually run out of breath', type: 'multi', options: ['Verse', 'Chorus', 'Long notes', 'Dense lyrics in fast songs'] },
    { q: 'How your throat feels an hour after singing', type: 'single', options: ['Comfortable', 'Dry', 'Tight', 'Sore', 'Hoarse'] },
    { q: 'Water you drink per day on average', type: 'number', unit: 'c.c.' },
    { q: 'Hours of sleep per day on average', type: 'number', unit: 'hours' },
    { q: 'Take a deep breath in front of a mirror. Do your shoulders rise?', type: 'single', options: ['They rise', 'They stay still', 'Not sure yet'] },
    { q: 'At home, breathe out on /s/ and time it. Your longest time in seconds', type: 'number', unit: ' s' }
  ] },
  { id: 'pre-3', lesson: 3, title: 'Lesson 3 pre-class survey', intro: 'Your breathing practice so far, and how you feel about your voice.', questions: [
    { q: 'Seven-day breathing log: starting /s/ exhale time in seconds', type: 'number', unit: ' s' },
    { q: 'Seven-day breathing log: improved time in seconds', type: 'number', unit: ' s' },
    { q: 'The hardest item to keep up in the breathing routine', type: 'short' },
    { q: 'Where you feel your body vibrate when you sing', type: 'multi', options: ['Chest', 'Throat', 'Bridge of the nose', 'Between the eyebrows', 'Top of the head', 'I don\'t feel it'] },
    { q: 'How your friends describe your voice', type: 'multi', options: ['Bright', 'Dull', 'Full', 'Thin', 'Nasal', 'Breathy'] },
    { q: 'How singing high notes feels', type: 'single', options: ['Squeezed', 'Like shouting', 'Cracks easily', 'Flips into falsetto on its own', 'Fairly easy'] },
    { q: 'How familiar you are with Taiwanese songs', type: 'single', options: ['I often listen to and sing them', 'I\'ve heard them but never sung one', 'Hardly ever come across them'] }
  ] },
  { id: 'pre-4', lesson: 4, title: 'Lesson 4 pre-class survey', intro: 'What you noticed in resonance practice, and your diction habits.', questions: [
    { q: 'Roughly which note last week\'s register break fell on (it\'s fine if you\'re not sure)', type: 'short', optional: true, placeholder: 'e.g. E4' },
    { q: 'Of the three resonances, the easiest to find was', type: 'single', options: ['Chest', 'Mouth', 'Head'] },
    { q: 'Of the three resonances, the hardest to find was', type: 'single', options: ['Chest', 'Mouth', 'Head'] },
    { q: 'Have you ever been told your lyrics aren\'t clear?', type: 'single', options: ['Often', 'Sometimes', 'Never'] },
    { q: 'Rate your diction (1 to 5)', type: 'matrix', rows: ['Flat-tongue vs. retroflex sounds', '-en vs. -eng endings'] },
    { q: 'Can you read numbered notation, or sing a melody in Do Re Mi?', type: 'single', options: ['Yes', 'A little', 'Not yet'] },
    { q: 'Do you use a metronome when practising guitar or singing?', type: 'single', options: ['Often', 'Sometimes', 'Never'] }
  ] },
  { id: 'pre-5', lesson: 5, title: 'Lesson 5 pre-class survey', intro: 'Your vocal exercise progress, a singer you\'d like to imitate, and first ideas for the final performance.', questions: [
    { q: 'Top speed in the staccato chord exercise', type: 'number', unit: 'Bpm' },
    { q: 'Which of the three learning steps helped most', type: 'single', options: ['Solfège', 'Vowel ', 'Lyrics'] },
    { q: 'The singer you\'d most like to imitate, and why', type: 'text' },
    { q: 'Do you think about what the lyrics mean when you sing?', type: 'single', options: ['Often', 'Sometimes', 'I mostly just watch the pitch'] },
    { q: 'How nervous you get singing in front of others', type: 'scale', low: 'Not at all', high: 'Very nervous' },
    { q: 'What you think is most distinctive about your voice', type: 'short' },
    { q: 'Preference for the Lesson 6 final performance', type: 'single', options: ['Solo', 'Duet', 'Group'] },
    { q: 'Will you play and sing in the final performance?', type: 'single', options: ['Play and sing', 'Just sing'] }
  ] },
  { id: 'pre-6', lesson: 6, title: 'Lesson 6 pre-class survey', intro: 'Measure your range at home first, and choose your song for the final performance.', questions: [
    { q: 'Usable range: lowest note', type: 'short', placeholder: 'e.g. A2' },
    { q: 'Usable range: highest note', type: 'short', placeholder: 'e.g. E4' },
    { q: 'Full range: lowest note', type: 'short', optional: true },
    { q: 'Full range: highest note', type: 'short', optional: true },
    { q: 'The singer from your imitation notes, and the one technique you most want to keep', type: 'text' },
    { q: 'What you gained most from in the six lessons', type: 'single', options: ['Breathing', 'Resonance', 'Phonation', 'Expression', 'Song form'] },
    { q: 'The problem that still bothers you most', type: 'text' },
    { q: 'Your final performance song and the key you plan to use', type: 'short' },
    { q: 'What accompaniment you need', type: 'single', options: ['The teacher or a classmate to accompany me', 'Play and sing', 'A backing track'] }
  ] },
  { id: 'feedback', lesson: 6, title: 'Course feedback survey', intro: 'Fill this in on the last day. Your feedback helps improve the next course.', questions: [
    { q: 'Satisfaction in each area (1 to 5)', type: 'matrix', hint: '1 is very dissatisfied, 5 is very satisfied', rows: ['Teaching method', 'Teaching content', 'Handbook content', 'Teacher\'s expertise', 'Teacher\'s attitude'] },
    { q: 'Overall satisfaction', type: 'scale', low: 'Dissatisfied', high: 'Very satisfied' },
    { q: 'The most helpful lesson', type: 'single', options: ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4', 'Lesson 5', 'Lesson 6'] },
    { q: 'Why', type: 'short', optional: true },
    { q: 'The pace of each 120-minute lesson', type: 'single', options: ['Too fast', 'About right', 'Too slow'] },
    { q: 'Amount of practice after class', type: 'single', options: ['Too much', 'About right', 'Too little'] },
    { q: 'Topics you\'d like an advanced class to cover', type: 'multi', options: ['High notes', 'Runs and riffs', 'Harmony singing', 'Stage performance', 'Play and sing', 'Lyric writing'], optional: true },
    { q: 'Anything you\'d like to say to the teacher', type: 'text', optional: true },
    { q: 'Rate what you learned in the six lessons (1 to 5)', type: 'matrix', hint: '1 means I can\'t do it at all, 5 means I can do it reliably', rows: [
      'Lesson 1: I can explain how sound is made and the three elements of singing, and break down a song\'s form',
      'Lesson 2: I can sing with chest-and-belly breathing and plan breath points in the lyrics',
      'Lesson 3: I can tell apart and use chest, mouth and head resonance',
      'Lesson 4: I can sing with correct vowel shapes and diction',
      'Lesson 5: I can use long notes, short notes, staccato and imitation to express feeling',
      'Lesson 6: I can measure my range and set a suitable key for a song'
    ] },
    { q: 'Your current longest /s/ exhale in seconds', type: 'number', unit: ' s' },
    { q: 'Your current usable range', type: 'number', unit: 'th', optional: true },
    { q: 'How much your singing has improved overall since Lesson 1', type: 'scale', low: 'No improvement', high: 'A lot' }
  ] }
];
