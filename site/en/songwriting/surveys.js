/* ===== Songwriting Lab 問卷內容（與講義的課前問卷、課程回饋一致） =====
 * 題型：single 單選、multi 複選、text 長文字、short 短文字、number 數字、scale 1–5 分、matrix 多項 1–5 分自評
 */
window.PIXEL_SURVEYS = [
  { id: 'sw-pre-1', lesson: 1, title: 'Lesson 1 pre-class survey (joining the class)', intro: 'Tell us about your music experience, songwriting experience and hopes; the teacher will plan groups and lessons from the results.', questions: [
    { q: 'Instruments you play', type: 'multi', options: ['I\'ve never learned an instrument', 'Piano or keyboard', 'Guitar', 'Ukulele', 'Drums', 'Orchestral instruments'], other: true },
    { q: 'Songwriting experience', type: 'single', options: ['Never tried', 'I\'ve written lyrics', 'I\'ve hummed melodies', 'I\'ve finished a complete song'] },
    { q: 'Music you can read', type: 'multi', options: ['Numbered notation', 'Staff', 'Chord charts', 'Tab', 'I can\'t read music yet'] },
    { q: 'Rate yourself (1 to 5)', type: 'matrix', rows: ['Expressing myself in words', 'Sense of rhythm', 'Ear for pitch', 'Singing', 'Accompanying on an instrument'] },
    { q: 'The music you listen to most', type: 'multi', options: ['Mandarin pop', 'Taiwanese songs', 'Western pop', 'J-pop and K-pop', 'Rock bands', 'R&B and hip-hop', 'Folk', 'Electronic'], other: true },
    { q: 'Your three favourite singers or songwriters', type: 'short', placeholder: 'e.g. Lin Xi, Jay Chou, Cheer Chen' },
    { q: 'The kind of theme you most want to write about', type: 'single', options: ['Everyday material', 'Family', 'Friendship', 'Love', 'The crowd or social issues', 'National or world issues'] },
    { q: 'The one thing you most hope to achieve by the end of the eight lessons', type: 'text' }
  ] },
  { id: 'sw-pre-2', lesson: 2, title: 'Lesson 2 pre-class survey', intro: 'Your material bank\'s progress, and how familiar you are with music theory and song structure.', questions: [
    { q: 'Words and lines added to your material bank this week', type: 'number', unit: 'items' },
    { q: 'The theme your group agreed on', type: 'short', placeholder: 'e.g. a song about family, using grandma\'s kitchen as material' },
    { q: 'How familiar you are with numbered notation, time signatures and note values', type: 'scale', low: 'First time', high: 'Very familiar' },
    { q: 'Song sections you can tell apart', type: 'multi', options: ['Intro', 'Verse', 'Pre-chorus', 'Chorus', 'Interlude', 'Bridge', 'Outro', 'I can\'t tell any apart yet'] },
    { q: 'A song whose chorus you remembered after one listen', type: 'short', optional: true }
  ] },
  { id: 'sw-pre-3', lesson: 3, title: 'Lesson 3 pre-class survey', intro: 'Your song form chart\'s progress, ready to start writing lyrics.', questions: [
    { q: 'How complete your song\'s form chart is', type: 'single', options: ['Already saved to the planning card', 'Laid out, still adjusting', 'Only the chorus position is set', 'Haven\'t started yet'] },
    { q: 'The chorus\'s first line or hook', type: 'short', optional: true },
    { q: 'How often you read classical poetry', type: 'single', options: ['Often', 'Now and then', 'Only in school textbooks'] },
    { q: 'How confident you are with rhyme', type: 'scale', low: 'Not confident at all', high: 'Very confident' },
    { q: 'What worries you most when writing lyrics', type: 'multi', options: ['Not knowing where to start', 'Lines that aren\'t beautiful enough', 'Not finding a rhyme', 'Lines that read like a school essay', 'Not knowing how to end'], other: true }
  ] },
  { id: 'sw-pre-4', lesson: 4, title: 'Lesson 4 pre-class survey', intro: 'Your verse\'s progress, and how familiar you are with figures of speech.', questions: [
    { q: 'How complete your first verse draft is', type: 'single', options: ['All eight lines done and revised', 'All eight lines done', 'Half done', 'Haven\'t started yet'] },
    { q: 'The rhyme strategy your song uses', type: 'single', options: ['One rhyme throughout', 'Rhyme changes at breaks', 'Rhyme changes by section', 'Free rhyme', 'Not sure yet'] },
    { q: 'Figures of speech you already know', type: 'multi', options: ['Metaphor', 'Transference', 'Rhetorical question', 'Parallelism', 'Repetition', 'Antithesis', 'Contrast', 'Anadiplosis', 'None yet'] },
    { q: 'A lyric line that struck you, found before class', type: 'short', hint: 'Include the song title and lyricist' },
    { q: 'The Mandarin lyricist you\'d most like to learn about', type: 'short', optional: true }
  ] },
  { id: 'sw-pre-5', lesson: 5, title: 'Lesson 5 pre-class survey', intro: 'Your lyrics\' progress, ready to start writing the music.', questions: [
    { q: 'How complete your full lyrics are', type: 'single', options: ['Whole song done and revised', 'Whole song done', 'Chorus done, verse being revised', 'Only the verse is done'] },
    { q: 'How many figures of speech your lyrics use', type: 'number', unit: 'kinds' },
    { q: 'Experience humming a melody and recording it', type: 'single', options: ['I do it often', 'I\'ve tried now and then', 'Never tried'] },
    { q: 'How familiar you are with chords and chord progressions', type: 'scale', low: 'First time', high: 'I can play and sing' },
    { q: 'How your group handles writing the music', type: 'single', options: ['One member leads', 'Each person writes a section, then we combine them', 'The whole group hums together', 'Not decided yet'] }
  ] },
  { id: 'sw-pre-6', lesson: 6, title: 'Lesson 6 pre-class survey', intro: 'Your chorus melody\'s progress, ready to measure range and choose a key.', questions: [
    { q: 'How complete your chorus melody is', type: 'single', options: ['Recorded and written in numbered notation', 'Recorded', 'I can hum it, not recorded yet', 'Haven\'t started yet'] },
    { q: 'Your song\'s lead singer', type: 'short', placeholder: 'The lead singer\'s name, or "the whole group"' },
    { q: 'Does the lead singer know their range?', type: 'single', options: ['Knows their usable range', 'Only roughly', 'No idea at all'] },
    { q: 'The hardest part when singing the chorus', type: 'multi', options: ['The highest note', 'Lowest note', 'Breathing', 'Diction', 'No difficulty'] },
    { q: 'The composer you\'d most like to learn about', type: 'short', optional: true }
  ] },
  { id: 'sw-pre-7', lesson: 7, title: 'Lesson 7 pre-class survey', intro: 'Your melody and key\'s progress, ready to move on to arranging.', questions: [
    { q: 'How complete your full melody is', type: 'single', options: ['Whole song done and the key set', 'Whole song done, key not set yet', 'Only the chorus is done', 'Still revising'] },
    { q: 'Your song\'s final key and tempo', type: 'short', placeholder: 'e.g. A♭, 72 BPM' },
    { q: 'The arranging style you imagine', type: 'single', options: ['Piano ballad', 'Acoustic guitar folk', 'Band rock', 'R&B groove', 'Electropop'], other: true },
    { q: 'Instruments that can join the recording', type: 'multi', options: ['Piano or keyboard', 'Guitar', 'Bass', 'Drums', 'Percussion', 'Voice only'], other: true },
    { q: 'Recording or arranging software you\'ve used', type: 'short', optional: true, placeholder: 'e.g. GarageBand, BandLab' }
  ] },
  { id: 'sw-pre-8', lesson: 8, title: 'Lesson 8 pre-class survey', intro: 'Getting ready for the final showcase.', questions: [
    { q: 'How complete your song\'s demo is', type: 'single', options: ['Vocals and backing both done', 'Only the vocals are done', 'Only the backing is done', 'Still recording'] },
    { q: 'How you\'ll present it', type: 'single', options: ['Sing it live', 'Play the demo', 'Both'] },
    { q: 'What you\'re happiest with in your song', type: 'text' },
    { q: 'Where you most want suggestions in the workshop', type: 'text' },
    { q: 'How you feel before the performance', type: 'scale', low: 'Very nervous', high: 'Really looking forward to it' }
  ] },
  { id: 'sw-feedback', lesson: 0, title: 'Course feedback survey', intro: 'The eight lessons are over; thank you for writing all the way here. Your feedback will make the next course even better.', questions: [
    { q: 'Overall satisfaction', type: 'scale', low: 'Dissatisfied', high: 'Very satisfied' },
    { q: 'What you got from each unit (1 to 5)', type: 'matrix', rows: ['Settling theme and material', 'Song form', 'Rhymes and rhetoric', 'Melody and chords', 'Range and key', 'Arranging and production', 'Workshop and showcase'] },
    { q: 'Most helpful interactive tool', type: 'multi', options: ['Material bank', 'Topic dice', 'Song form blocks', 'Rhyme checker', 'Motif lab', 'Chord progression player', 'Arranging mixer', 'Song planning card'] },
    { q: 'Pace of the course', type: 'single', options: ['Too slow', 'Just right', 'Too fast'] },
    { q: 'What you got most out of it', type: 'text' },
    { q: 'Anything you\'d like added or changed', type: 'text' },
    { q: 'Will you keep writing?', type: 'single', options: ['Yes, I already have an idea for the next one', 'Yes, now and then', 'Not for now'] }
  ] }
];
