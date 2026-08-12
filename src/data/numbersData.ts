export interface NumberItem {
  id: number;
  digit: string;       // '٠', '١', '٢', ...
  word: string;        // 'صفر', 'واحد', 'اثنان', ...
  englishDigit: number; // 0, 1, 2, ...
  icon: string;        // '🍃', '🎈', '🦆', ...
  audio: string;       // '/audio/numbers/01_sifr.mp3', etc.
}

export const ARABIC_NUMBERS: NumberItem[] = [
  { id: 0, digit: '٠', word: 'صفر', englishDigit: 0, icon: '🍃', audio: '/audio/numbers/01_sifr.mp3' },
  { id: 1, digit: '١', word: 'واحد', englishDigit: 1, icon: '🎈', audio: '/audio/numbers/02_wahid.mp3' },
  { id: 2, digit: '٢', word: 'اثنان', englishDigit: 2, icon: '🦆', audio: '/audio/numbers/03_ithnan.mp3' },
  { id: 3, digit: '٣', word: 'ثلاثة', englishDigit: 3, icon: '🍎', audio: '/audio/numbers/04_thalatha.mp3' },
  { id: 4, digit: '٤', word: 'أربعة', englishDigit: 4, icon: '🚗', audio: '/audio/numbers/05_arbaa.mp3' },
  { id: 5, digit: '٥', word: 'خمسة', englishDigit: 5, icon: '⭐', audio: '/audio/numbers/06_khamsa.mp3' },
  { id: 6, digit: '٦', word: 'ستة', englishDigit: 6, icon: '🌸', audio: '/audio/numbers/07_sitta.mp3' },
  { id: 7, digit: '٧', word: 'سبعة', englishDigit: 7, icon: '🐥', audio: '/audio/numbers/08_sabaa.mp3' },
  { id: 8, digit: '٨', word: 'ثمانية', englishDigit: 8, icon: '🍓', audio: '/audio/numbers/09_thamaniya.mp3' },
  { id: 9, digit: '٩', word: 'تسعة', englishDigit: 9, icon: '🐝', audio: '/audio/numbers/10_tisaa.mp3' },
  { id: 10, digit: '١٠', word: 'عشرة', englishDigit: 10, icon: '🍊', audio: '/audio/numbers/11_ashara.mp3' },
];

export const ARABIC_DIGIT_MAP: Record<number, string> = {
  0: '٠', 1: '١', 2: '٢', 3: '٣', 4: '٤',
  5: '٥', 6: '٦', 7: '٧', 8: '٨', 9: '٩', 10: '١٠'
};

export const DIGIT_TO_WORD: Record<number, string> = {
  0: 'صفر', 1: 'واحد', 2: 'اثنان', 3: 'ثلاثة', 4: 'أربعة',
  5: 'خمسة', 6: 'ستة', 7: 'سبعة', 8: 'ثمانية', 9: 'تسعة', 10: 'عشرة'
};

export type MathQuestionType = 
  | 'addition'
  | 'subtraction'
  | 'count_items'
  | 'listen_number'
  | 'pick_number_for_items'
  | 'missing_number'
  | 'sequence_order';

export interface MathQuestion {
  id: string;
  type: MathQuestionType;
  title: string;
  promptText: string;
  audioSpeech?: string;
  audioUrl?: string;
  visualItems?: { icon: string; count: number };
  visualGroups?: { icon: string; count1: number; count2: number; op: '+' | '-' };
  sequence?: string[]; // e.g. ['١', '٢', '_', '٤']
  sequenceOrder?: number[]; // e.g. [4, 1, 3, 2] to order
  options: string[];
  correctAnswer: string;
}

// Helper to shuffle array randomly
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Dynamic Math Question Generator
export function generateRandomMathQuestion(): MathQuestion {
  const types: MathQuestionType[] = [
    'addition',
    'subtraction',
    'count_items',
    'listen_number',
    'pick_number_for_items',
    'missing_number',
    'sequence_order'
  ];

  const selectedType = types[Math.floor(Math.random() * types.length)];
  const itemIcons = ['🍎', '🍌', '🍓', '🍊', '⭐', '🐥', '🚗', '🌸', '🐝', '🎈'];
  const randomIcon = itemIcons[Math.floor(Math.random() * itemIcons.length)];

  const id = `math-q-${Date.now()}-${Math.random()}`;

  if (selectedType === 'addition') {
    const num1 = Math.floor(Math.random() * 5) + 1; // 1..5
    const num2 = Math.floor(Math.random() * 5) + 1; // 1..5
    const sum = num1 + num2; // 2..10

    const correct = ARABIC_DIGIT_MAP[sum];
    const wrong1 = ARABIC_DIGIT_MAP[sum + 1 <= 10 ? sum + 1 : sum - 1];
    const wrong2 = ARABIC_DIGIT_MAP[sum - 2 >= 0 ? sum - 2 : sum + 2];

    const options = shuffleArray([correct, wrong1, wrong2]);

    return {
      id,
      type: 'addition',
      title: 'مسألة جمع ➕',
      promptText: `ما ناتج: ${ARABIC_DIGIT_MAP[num1]} + ${ARABIC_DIGIT_MAP[num2]} = ؟`,
      visualGroups: { icon: randomIcon, count1: num1, count2: num2, op: '+' },
      options,
      correctAnswer: correct
    };
  }

  if (selectedType === 'subtraction') {
    const num1 = Math.floor(Math.random() * 6) + 3; // 3..8
    const num2 = Math.floor(Math.random() * num1) + 1; // 1..num1
    const diff = num1 - num2; // >= 0

    const correct = ARABIC_DIGIT_MAP[diff];
    const wrong1 = ARABIC_DIGIT_MAP[diff + 1];
    const wrong2 = ARABIC_DIGIT_MAP[diff - 1 >= 0 ? diff - 1 : diff + 2];

    const options = shuffleArray([correct, wrong1, wrong2]);

    return {
      id,
      type: 'subtraction',
      title: 'مسألة طرح ➖',
      promptText: `ما ناتج: ${ARABIC_DIGIT_MAP[num1]} - ${ARABIC_DIGIT_MAP[num2]} = ؟`,
      visualGroups: { icon: randomIcon, count1: num1, count2: num2, op: '-' },
      options,
      correctAnswer: correct
    };
  }

  if (selectedType === 'count_items') {
    const count = Math.floor(Math.random() * 9) + 1; // 1..9
    const correct = ARABIC_DIGIT_MAP[count];

    const wrong1 = ARABIC_DIGIT_MAP[count === 10 ? 8 : count + 1];
    const wrong2 = ARABIC_DIGIT_MAP[count <= 1 ? 3 : count - 1];

    const options = shuffleArray([correct, wrong1, wrong2]);

    return {
      id,
      type: 'count_items',
      title: 'عد العناصر 🔢',
      promptText: 'كم عنصر في الصورة التالية؟',
      visualItems: { icon: randomIcon, count },
      options,
      correctAnswer: correct
    };
  }

  if (selectedType === 'listen_number') {
    const num = Math.floor(Math.random() * 11); // 0..10
    const correct = ARABIC_DIGIT_MAP[num];
    const word = DIGIT_TO_WORD[num];
    const audioUrl = ARABIC_NUMBERS[num]?.audio;

    const wrong1 = ARABIC_DIGIT_MAP[num === 10 ? 8 : num + 1];
    const wrong2 = ARABIC_DIGIT_MAP[num <= 0 ? 3 : num - 1];

    const options = shuffleArray([correct, wrong1, wrong2]);

    return {
      id,
      type: 'listen_number',
      title: 'استمع للأرقام 🔊',
      promptText: 'اضغط زر الصوت واستمع للرقم ثم اختر الإجابة الصحيحة:',
      audioUrl,
      audioSpeech: word,
      options,
      correctAnswer: correct
    };
  }

  if (selectedType === 'pick_number_for_items') {
    const count = Math.floor(Math.random() * 7) + 2; // 2..8
    const correct = ARABIC_DIGIT_MAP[count];

    const wrong1 = ARABIC_DIGIT_MAP[count + 1];
    const wrong2 = ARABIC_DIGIT_MAP[count - 1];

    const options = shuffleArray([correct, wrong1, wrong2]);

    return {
      id,
      type: 'pick_number_for_items',
      title: 'اختر الرقم المناسب 🌟',
      promptText: 'اختر الرقم الذي يطابق عدد النجوم والعناصر:',
      visualItems: { icon: '⭐', count },
      options,
      correctAnswer: correct
    };
  }

  if (selectedType === 'missing_number') {
    const start = Math.floor(Math.random() * 6) + 1; // 1..6
    const missingIdx = Math.floor(Math.random() * 3) + 1; // index 1, 2, or 3
    
    const seqNums = [start, start + 1, start + 2, start + 3];
    const correctVal = seqNums[missingIdx];
    const correct = ARABIC_DIGIT_MAP[correctVal];

    const sequence = seqNums.map((val, idx) => idx === missingIdx ? '؟' : ARABIC_DIGIT_MAP[val]);

    const wrong1 = ARABIC_DIGIT_MAP[correctVal + 1 <= 10 ? correctVal + 1 : correctVal - 2];
    const wrong2 = ARABIC_DIGIT_MAP[correctVal - 1 >= 1 ? correctVal - 1 : correctVal + 2];

    const options = shuffleArray([correct, wrong1, wrong2]);

    return {
      id,
      type: 'missing_number',
      title: 'الرقم الناقص 🧩',
      promptText: 'ما هو الرقم الناقص لتكملة التسلسل؟',
      sequence,
      options,
      correctAnswer: correct
    };
  }

  // Sequence Order fallback
  const start = Math.floor(Math.random() * 5) + 1;
  const numArr = [start, start + 1, start + 2, start + 3];
  const correctOrder = [...numArr];
  const shuffledOrder = shuffleArray([...numArr]);

  return {
    id,
    type: 'sequence_order',
    title: 'ترتيب الأرقام 🔢',
    promptText: 'رتب الأرقام التالية من الأصغر إلى الأكبر بالتوالي:',
    sequenceOrder: shuffledOrder,
    options: numArr.map(n => ARABIC_DIGIT_MAP[n]),
    correctAnswer: correctOrder.map(n => ARABIC_DIGIT_MAP[n]).join(' ')
  };
}
