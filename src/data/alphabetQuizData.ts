import { ARABIC_ALPHABET } from './alphabetData';
import { shuffleArray } from './numbersData';
import { createDisplayWord } from '../utils/wordUtils';

export type AlphabetQuizType = 
  | 'missing_letter'
  | 'first_letter_image'
  | 'listen_letter'
  | 'match_letter_word'
  | 'tashkeel_sound';

export interface AlphabetQuizQuestion {
  id: string;
  type: AlphabetQuizType;
  title: string;
  promptText: string;
  audioSpeech?: string;
  audioUrl?: string;
  displayWord?: string; // e.g., "م _ ز"
  imageEmoji?: string;  // e.g., "🍌"
  letterTarget?: string; // e.g., "و"
  fullWordInfo?: string; // e.g., "مَوْز 🍌"
  options: string[];
  correctAnswer: string;
}

const MISSING_LETTER_POOL = [
  { fullWord: 'أَسَد', missingLetter: 'س', displayWord: 'أَ _ د', icon: '🦁' },
  { fullWord: 'بَطَّة', missingLetter: 'ط', displayWord: 'بَ _ َة', icon: '🦆' },
  { fullWord: 'تُفَّاحَة', missingLetter: 'ف', displayWord: 'تُ _ َّاحَة', icon: '🍎' },
  { fullWord: 'ثَعْلَب', missingLetter: 'ع', displayWord: 'ثَ _ لَب', icon: '🦊' },
  { fullWord: 'جَمَل', missingLetter: 'م', displayWord: 'جَ _ ل', icon: '🐪' },
  { fullWord: 'حِصَان', missingLetter: 'ص', displayWord: 'حِ _ َان', icon: '🐎' },
  { fullWord: 'خَرُوف', missingLetter: 'و', displayWord: 'خَ _ ُوف', icon: '🐑' },
  { fullWord: 'دُبّ', missingLetter: 'ب', displayWord: 'دُ _ ', icon: '🐻' },
  { fullWord: 'رَجُل', missingLetter: 'ج', displayWord: 'رَ _ ُل', icon: '👨' },
  { fullWord: 'زَهْرَة', missingLetter: 'هـ', displayWord: 'زَ _ رَة', icon: '🌸' },
  { fullWord: 'سَيَّارَة', missingLetter: 'ي', displayWord: 'سَ _ َّارَة', icon: '🚗' },
  { fullWord: 'شَمْس', missingLetter: 'م', displayWord: 'شَ _ س', icon: '☀️' },
  { fullWord: 'صَارُوخ', missingLetter: 'ر', displayWord: 'صَا _ ُوخ', icon: '🚀' },
  { fullWord: 'عَيْن', missingLetter: 'ي', displayWord: 'عَ _ ن', icon: '👁️' },
  { fullWord: 'فِيل', missingLetter: 'ي', displayWord: 'فِ _ ل', icon: '🐘' },
  { fullWord: 'قِطَّة', missingLetter: 'ط', displayWord: 'قِ _ َّة', icon: '🐱' },
  { fullWord: 'كَلْب', missingLetter: 'ل', displayWord: 'كَ _ ب', icon: '🐶' },
  { fullWord: 'لَيْمُون', missingLetter: 'م', displayWord: 'لَ _ ُمون', icon: '🍋' },
  { fullWord: 'مَوْز', missingLetter: 'و', displayWord: 'مَ _ ز', icon: '🍌' },
  { fullWord: 'نَجْمَة', missingLetter: 'ج', displayWord: 'نَ _ مَة', icon: '⭐' },
  { fullWord: 'وَرْدَة', missingLetter: 'ر', displayWord: 'وَ _ دَة', icon: '🌹' },
];

export function generateRandomAlphabetQuestion(): AlphabetQuizQuestion {
  const types: AlphabetQuizType[] = [
    'missing_letter',
    'first_letter_image',
    'listen_letter',
    'match_letter_word',
    'tashkeel_sound'
  ];

  const selectedType = types[Math.floor(Math.random() * types.length)];
  const id = `alphabet-q-${Date.now()}-${Math.random()}`;

  // Helper to pick wrong letters from ARABIC_ALPHABET
  const getWrongLetters = (correctLetter: string): string[] => {
    const pool = ARABIC_ALPHABET.map(a => a.letter).filter(l => l !== correctLetter);
    const shuffled = shuffleArray(pool);
    return [shuffled[0], shuffled[1]];
  };

  if (selectedType === 'missing_letter') {
    const item = MISSING_LETTER_POOL[Math.floor(Math.random() * MISSING_LETTER_POOL.length)];
    const correct = item.missingLetter;
    const [w1, w2] = getWrongLetters(correct);
    const options = shuffleArray([correct, w1, w2]);

    return {
      id,
      type: 'missing_letter',
      title: 'الحرف الناقص 🧩',
      promptText: `اختر الحرف المناسب لتكملة الكلمة التالية:`,
      displayWord: item.displayWord,
      imageEmoji: item.icon,
      fullWordInfo: `${item.fullWord} ${item.icon}`,
      options,
      correctAnswer: correct
    };
  }

  if (selectedType === 'first_letter_image') {
    const item = ARABIC_ALPHABET[Math.floor(Math.random() * ARABIC_ALPHABET.length)];
    const correct = item.letter;
    const [w1, w2] = getWrongLetters(correct);
    const options = shuffleArray([correct, w1, w2]);

    return {
      id,
      type: 'first_letter_image',
      title: 'ما الحرف الأول؟ 🖼️',
      promptText: `ما الحرف الذي تبدأ به الكلمة (${item.exampleWord})؟`,
      imageEmoji: item.exampleIcon,
      fullWordInfo: `تبدأ كلمة (${item.exampleWord}) بحرف (${item.letter} - ${item.name}) ${item.exampleIcon}`,
      options,
      correctAnswer: correct
    };
  }

  if (selectedType === 'listen_letter') {
    const item = ARABIC_ALPHABET[Math.floor(Math.random() * ARABIC_ALPHABET.length)];
    const correct = item.letter;
    const [w1, w2] = getWrongLetters(correct);
    const options = shuffleArray([correct, w1, w2]);

    return {
      id,
      type: 'listen_letter',
      title: 'استمع واختر الحرف 🔊',
      promptText: 'اضغط على زر الصوت واستمع، ثم اختر الحرف الصحيح:',
      audioSpeech: `حرف ${item.name}`,
      audioUrl: item.letterAudio,
      fullWordInfo: `حرف (${item.letter} - ${item.name}) : ${item.exampleWord} ${item.exampleIcon}`,
      options,
      correctAnswer: correct
    };
  }

  if (selectedType === 'match_letter_word') {
    const item = ARABIC_ALPHABET[Math.floor(Math.random() * ARABIC_ALPHABET.length)];
    const correctLetter = item.letter;
    const correctOption = `${item.exampleIcon} ${item.exampleWord}`;

    // Pick 2 wrong items
    const wrongItems = ARABIC_ALPHABET.filter(i => i.letter !== correctLetter);
    const shuffledWrong = shuffleArray(wrongItems);
    const w1 = `${shuffledWrong[0].exampleIcon} ${shuffledWrong[0].exampleWord}`;
    const w2 = `${shuffledWrong[1].exampleIcon} ${shuffledWrong[1].exampleWord}`;

    const options = shuffleArray([correctOption, w1, w2]);

    return {
      id,
      type: 'match_letter_word',
      title: 'طابق الحرف مع الكلمة 🎯',
      promptText: `اختر الصورة والكلمة التي تبدأ بحرف (${correctLetter}):`,
      letterTarget: correctLetter,
      fullWordInfo: `${item.exampleWord} ${item.exampleIcon}`,
      options,
      correctAnswer: correctOption
    };
  }

  // Tashkeel sound question
  const item = ARABIC_ALPHABET[Math.floor(Math.random() * ARABIC_ALPHABET.length)];
  const tashkeels = [
    { text: item.fatha.text, word: item.fatha.word, audio: item.fatha.audio, name: 'الفتحة' },
    { text: item.damma.text, word: item.damma.word, audio: item.damma.audio, name: 'الضمة' },
    { text: item.kasra.text, word: item.kasra.word, audio: item.kasra.audio, name: 'الكسرة' }
  ];

  const picked = tashkeels[Math.floor(Math.random() * tashkeels.length)];
  const correct = picked.text;
  const options = shuffleArray([item.fatha.text, item.damma.text, item.kasra.text]);

  return {
    id,
    type: 'tashkeel_sound',
    title: 'الحرف مع الحركة ✍️',
    promptText: `استمع لصوت الحرف مع الحركة واختر الشكل الصحيح:`,
    audioSpeech: picked.text,
    audioUrl: picked.audio,
    fullWordInfo: `${picked.word} (${picked.text})`,
    options,
    correctAnswer: correct
  };
}

