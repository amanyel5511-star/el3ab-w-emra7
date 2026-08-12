import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, Play, RefreshCw, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GAMES_LIST, GAME_CATEGORIES } from '../../data/gamesData';
import { ARABIC_ALPHABET } from '../../data/alphabetData';
import { GameDefinition, GameCategory } from '../../types';
import { soundManager } from '../../utils/sound';
import { alphabetAudio } from '../../utils/alphabetAudio';
import { createDisplayWord } from '../../utils/wordUtils';

interface Props {
  onEarnStars: (amount: number, gameId: number) => void;
  completedGameIds: number[];
}

export const GamesHub: React.FC<Props> = ({ onEarnStars, completedGameIds }) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('intelligence');
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);

  // Active Minigame Dynamic State
  const [gameState, setGameState] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const filteredGames = GAMES_LIST.filter((g) => g.category === selectedCategory);

  const FRUITS_DATA = [
    { name: 'تفاحة', icon: '🍎' },
    { name: 'موزة', icon: '🍌' },
    { name: 'برتقالة', icon: '🍊' },
    { name: 'فراولة', icon: '🍓' },
    { name: 'عنب', icon: '🍇' },
    { name: 'بطيخ', icon: '🍉' },
    { name: 'أناناس', icon: '🍍' },
    { name: 'كمثرى', icon: '🍐' },
    { name: 'كرز', icon: '🍒' },
  ];

  const ANIMALS_DATA = [
    { name: 'أسد', icon: '🦁' },
    { name: 'كلب', icon: '🐶' },
    { name: 'قطة', icon: '🐱' },
    { name: 'بقرة', icon: '🐮' },
    { name: 'أرنب', icon: '🐰' },
    { name: 'ثعلب', icon: '🦊' },
    { name: 'باندا', icon: '🐼' },
    { name: 'قرد', icon: '🐵' },
    { name: 'ضفدع', icon: '🐸' },
    { name: 'فيل', icon: '🐘' },
    { name: 'زرافة', icon: '🦒' },
    { name: 'دب', icon: '🐻' },
    { name: 'بطريق', icon: '🐧' },
    { name: 'بومة', icon: '🦉' },
    { name: 'نمر', icon: '🐯' },
  ];

  const SHAPES_DATA = [
    { name: 'دائرة', icon: '🔴' },
    { name: 'مربع أزرق', icon: '🟦' },
    { name: 'مثلث أحمر', icon: '🔺' },
    { name: 'نجمة ذهبية', icon: '⭐' },
    { name: 'مربع أخضر', icon: '🟩' },
    { name: 'مربع أصفر', icon: '🟨' },
    { name: 'قلب', icon: '💜' },
    { name: 'هلال', icon: '🌙' },
  ];

  const COLORS_DATA = [
    { name: 'أحمر', colorClass: 'bg-red-500', icon: '🔴' },
    { name: 'أزرق', colorClass: 'bg-blue-500', icon: '🔵' },
    { name: 'أصفر', colorClass: 'bg-amber-400', icon: '🟡' },
    { name: 'أخضر', colorClass: 'bg-emerald-500', icon: '🟢' },
    { name: 'برتقالي', colorClass: 'bg-orange-500', icon: '🍊' },
    { name: 'بنفسجي', colorClass: 'bg-purple-500', icon: '💜' },
  ];

  const MISSING_LETTER_WORDS = [
    { full: 'تفاحة', missing: 'ف', icon: '🍎' },
    { full: 'أسد', missing: 'د', icon: '🦁' },
    { full: 'فيل', missing: 'ي', icon: '🐘' },
    { full: 'قطة', missing: 'ط', icon: '🐱' },
    { full: 'أرنب', missing: 'ن', icon: '🐰' },
    { full: 'موز', missing: 'و', icon: '🍌' },
    { full: 'كلب', missing: 'ب', icon: '🐶' },
    { full: 'زرافة', missing: 'ا', icon: '🦒' },
    { full: 'شمس', missing: 'س', icon: '☀️' },
    { full: 'قمر', missing: 'ر', icon: '🌙' },
    { full: 'نجمة', missing: 'م', icon: '⭐' },
    { full: 'سيارة', missing: 'ا', icon: '🚗' },
    { full: 'حصان', missing: 'ا', icon: '🐎' },
    { full: 'خروف', missing: 'و', icon: '🐑' },
    { full: 'دب', missing: 'ب', icon: '🐻' },
    { full: 'زهرة', missing: 'ر', icon: '🌸' },
    { full: 'فراشة', missing: 'ا', icon: '🦋' },
    { full: 'عصفور', missing: 'ب', icon: '🐦' },
    { full: 'صاروخ', missing: 'ر', icon: '🚀' },
    { full: 'قلم', missing: 'ل', icon: '✏️' },
    { full: 'كتاب', missing: 'ت', icon: '📚' },
  ];

  const handleStartGame = (game: GameDefinition) => {
    soundManager.playClick();
    setActiveGame(game);
    setUserAnswer(null);
    setShowAnswer(false);
    setIsCorrect(false);
    setIsWon(false);
    setFeedbackMsg('');
    initMinigame(game.id);
  };

  const handleWin = () => {
    if (!activeGame) return;
    setIsWon(true);
    setFeedbackMsg('🌟 أحسنت! إجابة صحيحة! 🎉');
    soundManager.playCorrectFeedback();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    onEarnStars(3, activeGame.id);
  };

  const handleWrongAnswer = (label?: string) => {
    setFeedbackMsg(label ? `💡 الإجابة الصحيحة هي: (${label}) — 🌟 حاول مرة أخرى!` : '💡 إجابة غير صحيحة، حاول مرة أخرى!');
    soundManager.playWrongFeedback();
  };

  const handleSelectOption = (chosenValue: any, correctAnswer: any, displayLabel?: string) => {
    if (showAnswer) return;
    soundManager.playClick();

    setUserAnswer(chosenValue);
    setShowAnswer(true);

    const correct = (chosenValue === correctAnswer);
    setIsCorrect(correct);

    if (correct) {
      setIsWon(true);
      setFeedbackMsg('🌟 أحسنت! إجابة صحيحة! 🎉');
      soundManager.playCorrectFeedback();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      if (activeGame) {
        onEarnStars(3, activeGame.id);
      }
    } else {
      setIsWon(false);
      const label = displayLabel || String(correctAnswer);
      setFeedbackMsg(`💡 الإجابة الصحيحة هي: (${label}) — 🌟 لا بأس، حاول مرة أخرى في السؤال القادم!`);
      soundManager.playWrongFeedback();
    }
  };

  const initMinigame = (gameId: number) => {
    soundManager.playClick();
    setUserAnswer(null);
    setShowAnswer(false);
    setIsCorrect(false);
    setIsWon(false);
    setFeedbackMsg('');

    if (gameId === 1) {
      const target = SHAPES_DATA[Math.floor(Math.random() * SHAPES_DATA.length)];
      const distractors = SHAPES_DATA.filter(s => s.name !== target.name).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [target, ...distractors].sort(() => Math.random() - 0.5);
      setGameState({ target, options, prompt: `طابق الشكل (${target.name}) باختياره من الأشكال!` });

    } else if (gameId === 2) {
      const target = COLORS_DATA[Math.floor(Math.random() * COLORS_DATA.length)];
      const distractors = COLORS_DATA.filter(c => c.name !== target.name).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [target, ...distractors].sort(() => Math.random() - 0.5);
      setGameState({ target, options, prompt: `اختر اللون (${target.name}) ${target.icon}` });

    } else if (gameId === 3) {
      const target = ANIMALS_DATA[Math.floor(Math.random() * ANIMALS_DATA.length)];
      const distractors = ANIMALS_DATA.filter(a => a.name !== target.name).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [target, ...distractors].sort(() => Math.random() - 0.5);
      setGameState({ target, options, prompt: `أي الصور التالية هي صورة (${target.name})؟` });

    } else if (gameId === 4) {
      const pool = [...ANIMALS_DATA, ...FRUITS_DATA].sort(() => Math.random() - 0.5).slice(0, 4);
      const cards = pool.flatMap((item, idx) => [
        { id: idx * 2 + 1, icon: item.icon, pairId: idx, flipped: false, matched: false },
        { id: idx * 2 + 2, icon: item.icon, pairId: idx, flipped: false, matched: false },
      ]).sort(() => Math.random() - 0.5);

      setGameState({ cards, flippedIds: [], matchedCount: 0, prompt: 'افتح البطاقات وطابق الأشكال المماثلة 🧠' });

    } else if (gameId === 5) {
      const normal = FRUITS_DATA[Math.floor(Math.random() * FRUITS_DATA.length)];
      const odd = ANIMALS_DATA[Math.floor(Math.random() * ANIMALS_DATA.length)];
      const items = [
        { icon: normal.icon, isOdd: false },
        { icon: normal.icon, isOdd: false },
        { icon: odd.icon, isOdd: true },
        { icon: normal.icon, isOdd: false },
      ].sort(() => Math.random() - 0.5);

      setGameState({ items, prompt: 'اختر العنصر الغريب المختلف عن بقية المجموعة!' });

    } else if (gameId === 6) {
      const categoryType = ['stars', 'fruits', 'animals', 'shapes'][Math.floor(Math.random() * 4)];
      const count = Math.floor(Math.random() * 7) + 2;

      let itemIcon = '⭐';
      let itemName = 'النجوم الذهبية';

      if (categoryType === 'fruits') {
        const fruit = FRUITS_DATA[Math.floor(Math.random() * FRUITS_DATA.length)];
        itemIcon = fruit.icon;
        itemName = fruit.name;
      } else if (categoryType === 'animals') {
        const anim = ANIMALS_DATA[Math.floor(Math.random() * ANIMALS_DATA.length)];
        itemIcon = anim.icon;
        itemName = anim.name;
      } else if (categoryType === 'shapes') {
        const shp = SHAPES_DATA[Math.floor(Math.random() * SHAPES_DATA.length)];
        itemIcon = shp.icon;
        itemName = shp.name;
      }

      const items = Array(count).fill(itemIcon);
      const options = [count, count + 1, Math.max(1, count - 1), count + 2].sort(() => Math.random() - 0.5);

      setGameState({ items, options, correct: count, prompt: `احسب عدد العناصر الظاهرة أمامك (${itemName}) 🔢` });

    } else if (gameId === 8) {
      const targetLetter = ARABIC_ALPHABET[Math.floor(Math.random() * ARABIC_ALPHABET.length)];
      const otherLetters = ARABIC_ALPHABET.filter(l => l.letter !== targetLetter.letter).map(l => l.letter).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [targetLetter.letter, ...otherLetters].sort(() => Math.random() - 0.5);

      setGameState({
        item: targetLetter,
        options,
        correct: targetLetter.letter,
        prompt: `ما الحرف الأول المطابق لكلمة (${targetLetter.exampleWord}) ${targetLetter.exampleIcon}؟`
      });

    } else if (gameId === 9) {
      const targetLetter = ARABIC_ALPHABET[Math.floor(Math.random() * ARABIC_ALPHABET.length)];
      const otherLetters = ARABIC_ALPHABET.filter(l => l.letter !== targetLetter.letter).map(l => l.letter).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [targetLetter.letter, ...otherLetters].sort(() => Math.random() - 0.5);

      setGameState({
        targetLetter,
        options,
        correct: targetLetter.letter,
        prompt: `اضغط على زِر الصوت، استمع للحرف، ثم اختر الحرف الصحيح 🔊`
      });

    } else if (gameId === 10) {
      const patternPools = [
        { seq: ['🔴', '🔵', '🔴', '🔵', '❓'], correct: '🔴', options: ['🔴', '🔵', '🟢'] },
        { seq: ['⭐', '🔺', '⭐', '🔺', '❓'], correct: '⭐', options: ['⭐', '🔺', '🟦'] },
        { seq: ['🍎', '🍌', '🍎', '🍌', '❓'], correct: '🍎', options: ['🍎', '🍌', '🍇'] },
        { seq: ['🐶', '🐱', '🐶', '🐱', '❓'], correct: '🐶', options: ['🐶', '🐱', '🐰'] },
        { seq: ['1️⃣', '2️⃣', '1️⃣', '2️⃣', '❓'], correct: '1️⃣', options: ['1️⃣', '2️⃣', '3️⃣'] },
        { seq: ['🟩', '🟩', '🟨', '🟨', '🟩', '❓'], correct: '🟩', options: ['🟩', '🟨', '🟦'] },
      ];

      const p = patternPools[Math.floor(Math.random() * patternPools.length)];
      setGameState({
        sequence: p.seq,
        options: p.options.sort(() => Math.random() - 0.5),
        correct: p.correct,
        prompt: 'اكتشف تسلسل الرموز واختَر الشكل الصحيح لإكمال النمط المتتابع! 🌀'
      });

    } else if (gameId === 14) {
      const combinedPool = [...FRUITS_DATA, ...ANIMALS_DATA, ...SHAPES_DATA];
      const target = combinedPool[Math.floor(Math.random() * combinedPool.length)];

      const distractors = combinedPool.filter(i => i.name !== target.name).sort(() => Math.random() - 0.5).slice(0, 5);
      const grid = [
        { icon: target.icon, name: target.name, isTarget: true },
        ...distractors.map(d => ({ icon: d.icon, name: d.name, isTarget: false }))
      ].sort(() => Math.random() - 0.5);

      setGameState({ grid, target, prompt: `ابحث واضغط على (${target.name}) ${target.icon} بسرعة ودقة! 🎯` });

    } else if (gameId === 16) {
      const quiz = MISSING_LETTER_WORDS[Math.floor(Math.random() * MISSING_LETTER_WORDS.length)];
      const displayWord = createDisplayWord(quiz.full, quiz.missing);
      const distractors = ['ت', 'م', 'ر', 'س', 'ل', 'أ', 'ب', 'ن', 'ع', 'ف', 'ك'].filter(l => l !== quiz.missing).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [quiz.missing, ...distractors].sort(() => Math.random() - 0.5);

      setGameState({
        quiz: {
          ...quiz,
          displayWord
        },
        correct: quiz.missing,
        options,
        prompt: `اختر الحرف الناقص الصحيح لإكمال الكلمة! 🔠`
      });

    } else if (gameId === 18) {
      const isAdd = Math.random() > 0.5;
      const num1 = Math.floor(Math.random() * 5) + 1;
      const num2 = Math.floor(Math.random() * 4) + 1;
      const result = isAdd ? num1 + num2 : Math.max(num1, num2) - Math.min(num1, num2);
      const nA = isAdd ? num1 : Math.max(num1, num2);
      const nB = isAdd ? num2 : Math.min(num1, num2);

      const options = [result, result + 1, Math.max(0, result - 1), result + 2].filter((v, i, a) => a.indexOf(v) === i).sort(() => Math.random() - 0.5);

      setGameState({
        num1: nA,
        num2: nB,
        op: isAdd ? '+' : '-',
        correct: result,
        options,
        prompt: `احسب ناتج المسألة الحسابية: ${nA} ${isAdd ? '+' : '-'} ${nB} = ؟ 🧮`
      });
    }
  };

  const handleMemoryCardClick = (card: any) => {
    if (card.flipped || card.matched || gameState.flippedIds.length >= 2) return;
    soundManager.playClick();

    const newCards = gameState.cards.map((c: any) => c.id === card.id ? { ...c, flipped: true } : c);
    const newFlippedIds = [...gameState.flippedIds, card.id];

    if (newFlippedIds.length === 2) {
      const firstCard = newCards.find((c: any) => c.id === newFlippedIds[0]);
      const secondCard = newCards.find((c: any) => c.id === newFlippedIds[1]);

      if (firstCard.pairId === secondCard.pairId) {
        const matchedCards = newCards.map((c: any) => c.pairId === firstCard.pairId ? { ...c, matched: true } : c);
        const newMatchedCount = gameState.matchedCount + 1;

        if (newMatchedCount >= 4) {
          handleWin();
        } else {
          soundManager.playCorrectFeedback();
          setGameState({ ...gameState, cards: matchedCards, flippedIds: [], matchedCount: newMatchedCount });
        }
      } else {
        setGameState({ ...gameState, cards: newCards, flippedIds: newFlippedIds });
        soundManager.playWrongFeedback();
        setTimeout(() => {
          const resetCards = newCards.map((c: any) => newFlippedIds.includes(c.id) ? { ...c, flipped: false } : c);
          setGameState({ ...gameState, cards: resetCards, flippedIds: [] });
        }, 800);
      }
    } else {
      setGameState({ ...gameState, cards: newCards, flippedIds: newFlippedIds });
    }
  };

  const handleFoodClick = (item: any) => {
    if (item.selected) return;
    soundManager.playClick();

    if (item.isHealthy) {
      const updated = gameState.items.map((i: any) => i.id === item.id ? { ...i, selected: true } : i);
      const newHealthyCount = gameState.healthyCount + 1;
      if (newHealthyCount >= 2) {
        handleWin();
      } else {
        soundManager.playCorrectFeedback();
        setGameState({ ...gameState, items: updated, healthyCount: newHealthyCount });
      }
    } else {
      handleWrongAnswer();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12 select-none dir-rtl" dir="rtl">
      
      {/* Categories Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {GAME_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { soundManager.playClick(); setSelectedCategory(cat.id); setActiveGame(null); }}
              className={`p-3.5 rounded-2xl text-right flex flex-col gap-1 transition-all shadow-xs ${
                isSelected ? 'bg-teal-700 text-white font-black shadow-md scale-102' : 'bg-white hover:bg-teal-50 text-teal-950 border border-teal-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{cat.icon}</span>
                {isSelected && <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full">نشط</span>}
              </div>
              <span className="font-black text-sm mt-1">{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Directory or Active Game */}
      {!activeGame ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-white p-5 rounded-3xl border-4 border-teal-200 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{GAME_CATEGORIES.find(c => c.id === selectedCategory)?.icon}</span>
              <div>
                <h2 className="font-black text-xl text-teal-950">
                  {GAME_CATEGORIES.find(c => c.id === selectedCategory)?.title}
                </h2>
                <p className="text-xs font-bold text-teal-800">
                  {GAME_CATEGORIES.find(c => c.id === selectedCategory)?.description}
                </p>
              </div>
            </div>
            <div className="bg-teal-100 px-3.5 py-1.5 rounded-2xl font-black text-xs text-teal-900 border border-teal-200">
              <span>المكتمل: {completedGameIds.filter(id => GAMES_LIST.find(g => g.id === id)?.category === selectedCategory).length} / {filteredGames.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredGames.map((game) => {
              const isCompleted = completedGameIds.includes(game.id);
              return (
                <div
                  key={game.id}
                  className="bg-white rounded-3xl border-4 border-teal-200 p-5 shadow-sm flex flex-col justify-between gap-4 hover:translate-y-[-2px] transition-transform"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-3xl shrink-0 text-teal-900">
                      {game.icon}
                    </div>
                    
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-black text-lg text-teal-950">{game.title}</h3>
                        {isCompleted && (
                          <span className="px-2.5 py-0.5 bg-teal-100 text-teal-900 rounded-xl font-bold text-xs flex items-center gap-1 border border-teal-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مكتملة</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-teal-800 leading-relaxed">{game.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartGame(game)}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-transform"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>ابدأ اللعب الآن 🎮</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[36px] border-4 border-teal-200 shadow-lg p-6 flex flex-col gap-6 relative">
          
          <div className="flex items-center justify-between border-b-2 border-teal-100 pb-4">
            <button
              onClick={() => { soundManager.playClick(); setActiveGame(null); }}
              className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 rounded-xl font-black text-xs flex items-center gap-1 shadow-xs border border-teal-200"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للألعاب</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-3xl">{activeGame.icon}</span>
              <h3 className="font-black text-xl text-teal-950">{activeGame.title}</h3>
            </div>

            <button
              onClick={() => initMinigame(activeGame.id)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-black text-xs flex items-center gap-1 shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>سؤال جديد 🔄</span>
            </button>
          </div>

          <div className="bg-teal-50/80 p-4 rounded-2xl border border-teal-200 text-center font-black text-lg text-teal-950 shadow-xs">
            {gameState?.prompt}
          </div>

          {feedbackMsg && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`p-4 rounded-2xl text-center font-black text-xl shadow-xs ${
                isWon ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {feedbackMsg}
            </motion.div>
          )}

          {gameState && (
            <div className="flex flex-col items-center justify-center gap-6 py-4 min-h-[260px]">
              
              {activeGame.id === 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                  {gameState.options.map((shape: any, idx: number) => {
                    const isCorrectOption = shape.name === gameState.target.name;
                    const isChosen = userAnswer === shape.name;
                    let style = 'bg-white hover:bg-purple-50 text-slate-800 border-2 border-purple-100';
                    if (showAnswer) {
                      if (isCorrectOption) style = 'bg-emerald-400 text-slate-900 border-2 border-emerald-500 scale-105';
                      else if (isChosen) style = 'bg-rose-400 text-white border-2 border-rose-500';
                      else style = 'bg-slate-100 text-slate-400 opacity-40';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showAnswer}
                        onClick={() => handleSelectOption(shape.name, gameState.target.name, `${gameState.target.name} ${gameState.target.icon}`)}
                        className={`p-6 rounded-3xl text-5xl flex flex-col items-center gap-3 shadow-xs transition-transform active:scale-95 ${style}`}
                      >
                        <span>{shape.icon}</span>
                        <span className="text-sm font-black text-slate-800 flex items-center gap-1">
                          {shape.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeGame.id === 2 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                  {gameState.options.map((c: any, idx: number) => {
                    const isCorrectOption = c.name === gameState.target.name;
                    const isChosen = userAnswer === c.name;
                    let style = `${c.colorClass} hover:opacity-90 text-white`;
                    if (showAnswer) {
                      if (isCorrectOption) style = 'bg-emerald-400 text-slate-900 scale-105 font-black';
                      else if (isChosen) style = 'bg-rose-500 text-white font-black';
                      else style = 'opacity-30 bg-slate-300 text-slate-500';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showAnswer}
                        onClick={() => handleSelectOption(c.name, gameState.target.name, `${gameState.target.name} ${gameState.target.icon}`)}
                        className={`p-6 rounded-3xl text-4xl flex flex-col items-center gap-2 shadow-xs transition-transform active:scale-95 ${style}`}
                      >
                        <span>{c.icon}</span>
                        <span className="text-base font-black flex items-center gap-1">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeGame.id === 3 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                  {gameState.options.map((a: any, idx: number) => {
                    const isCorrectOption = a.name === gameState.target.name;
                    const isChosen = userAnswer === a.name;
                    let style = 'bg-white hover:bg-purple-50 text-slate-800 border-2 border-purple-100';
                    if (showAnswer) {
                      if (isCorrectOption) style = 'bg-emerald-400 text-slate-900 border-2 border-emerald-500 scale-105';
                      else if (isChosen) style = 'bg-rose-400 text-white border-2 border-rose-500';
                      else style = 'bg-slate-100 text-slate-400 opacity-40';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showAnswer}
                        onClick={() => handleSelectOption(a.name, gameState.target.name, `${gameState.target.name} ${gameState.target.icon}`)}
                        className={`p-6 rounded-3xl text-6xl flex flex-col items-center gap-3 shadow-xs transition-transform active:scale-95 ${style}`}
                      >
                        <span>{a.icon}</span>
                        <span className="text-sm font-black text-slate-800 flex items-center gap-1">
                          {a.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeGame.id === 4 && (
                <div className="grid grid-cols-4 gap-3 max-w-md w-full">
                  {gameState.cards.map((card: any) => (
                    <button
                      key={card.id}
                      onClick={() => handleMemoryCardClick(card)}
                      className={`h-24 rounded-2xl text-4xl flex items-center justify-center transition-all shadow-xs active:scale-95 ${
                        card.flipped || card.matched ? 'bg-amber-300 text-slate-900' : 'bg-purple-400 text-purple-400'
                      }`}
                    >
                      {card.flipped || card.matched ? card.icon : '❓'}
                    </button>
                  ))}
                </div>
              )}

              {activeGame.id === 5 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                  {gameState.items.map((item: any, idx: number) => {
                    const isCorrectOption = item.isOdd;
                    const isChosen = userAnswer === idx;
                    let style = 'bg-white hover:bg-purple-50 text-slate-800 border-2 border-purple-100';
                    if (showAnswer) {
                      if (isCorrectOption) style = 'bg-emerald-400 text-slate-900 border-2 border-emerald-500 scale-105';
                      else if (isChosen) style = 'bg-rose-400 text-white border-2 border-rose-500';
                      else style = 'bg-slate-100 text-slate-400 opacity-40';
                    }

                    const oddIcon = gameState.items.find((i: any) => i.isOdd)?.icon;

                    return (
                      <button
                        key={idx}
                        disabled={showAnswer}
                        onClick={() => handleSelectOption(idx, gameState.items.findIndex((i: any) => i.isOdd), `العنصر المختلف ${oddIcon}`)}
                        className={`p-8 rounded-3xl text-6xl flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 ${style}`}
                      >
                        <span>{item.icon}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeGame.id === 6 && (
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="flex items-center justify-center gap-3 text-5xl flex-wrap bg-white p-6 rounded-3xl border-2 border-purple-100 shadow-xs w-full">
                    {gameState.items.map((icon: string, i: number) => <span key={i}>{icon}</span>)}
                  </div>

                  <div className="flex items-center gap-4 flex-wrap justify-center">
                    {gameState.options.map((num: number, i: number) => {
                      const isCorrectOption = num === gameState.correct;
                      const isChosen = userAnswer === num;
                      let style = 'bg-amber-300 hover:bg-amber-400 text-slate-900';
                      if (showAnswer) {
                        if (isCorrectOption) style = 'bg-emerald-400 text-slate-900 scale-110 font-black';
                        else if (isChosen) style = 'bg-rose-400 text-white font-black';
                        else style = 'bg-slate-100 text-slate-400 opacity-40';
                      }

                      return (
                        <button
                          key={i}
                          disabled={showAnswer}
                          onClick={() => handleSelectOption(num, gameState.correct, String(gameState.correct))}
                          className={`w-20 h-20 rounded-2xl font-black text-3xl flex items-center justify-center gap-1 shadow-xs active:scale-90 ${style}`}
                        >
                          <span>{num}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeGame.id === 8 && (
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="p-6 bg-white rounded-3xl border-2 border-purple-100 flex flex-col items-center gap-2 shadow-xs">
                    <span className="text-7xl">{gameState.item.exampleIcon}</span>
                    <span className="font-black text-4xl text-slate-800">{gameState.item.exampleWord}</span>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap justify-center">
                    {gameState.options.map((lettr: string, i: number) => {
                      const isCorrectOption = lettr === gameState.correct;
                      const isChosen = userAnswer === lettr;
                      let style = 'bg-amber-300 hover:bg-amber-400 text-slate-900';
                      if (showAnswer) {
                        if (isCorrectOption) style = 'bg-emerald-400 text-slate-900 scale-110 font-black';
                        else if (isChosen) style = 'bg-rose-400 text-white font-black';
                        else style = 'bg-slate-100 text-slate-400 opacity-40';
                      }

                      return (
                        <button
                          key={i}
                          disabled={showAnswer}
                          onClick={() => handleSelectOption(lettr, gameState.correct, `حرف "${gameState.correct}"`)}
                          className={`w-20 h-20 rounded-2xl font-black text-3xl flex items-center justify-center gap-1 shadow-xs active:scale-90 ${style}`}
                        >
                          <span>{lettr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeGame.id === 9 && (
                <div className="flex flex-col items-center gap-6 w-full">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      alphabetAudio.playLetter(gameState.targetLetter);
                    }}
                    className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-2xl font-black text-xl flex items-center gap-2 shadow-md active:scale-95"
                  >
                    <Volume2 className="w-6 h-6" />
                    <span>اسمع نطق الحرف 🔊</span>
                  </button>

                  <div className="flex items-center gap-4 flex-wrap justify-center">
                    {gameState.options.map((lettr: string, i: number) => {
                      const isCorrectOption = lettr === gameState.correct;
                      const isChosen = userAnswer === lettr;
                      let style = 'bg-white hover:bg-purple-50 text-slate-800 border-2 border-purple-100';
                      if (showAnswer) {
                        if (isCorrectOption) style = 'bg-emerald-400 text-slate-900 scale-110 font-black';
                        else if (isChosen) style = 'bg-rose-400 text-white font-black';
                        else style = 'bg-slate-100 text-slate-400 opacity-40';
                      }

                      return (
                        <button
                          key={i}
                          disabled={showAnswer}
                          onClick={() => handleSelectOption(lettr, gameState.correct, `حرف "${gameState.correct}" (${gameState.targetLetter.name})`)}
                          className={`w-20 h-20 rounded-2xl font-black text-3xl flex items-center justify-center gap-1 shadow-xs active:scale-90 ${style}`}
                        >
                          <span>{lettr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeGame.id === 10 && (
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="flex items-center justify-center gap-4 text-5xl bg-white p-6 rounded-3xl border-2 border-purple-100 shadow-xs">
                    {gameState.sequence.map((icon: string, idx: number) => (
                      <span key={idx} className={icon === '❓' ? 'text-amber-500 font-black animate-bounce' : ''}>{icon}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 flex-wrap justify-center">
                    {gameState.options.map((icon: string, i: number) => {
                      const isCorrectOption = icon === gameState.correct;
                      const isChosen = userAnswer === icon;
                      let style = 'bg-amber-300 hover:bg-amber-400 text-slate-900';
                      if (showAnswer) {
                        if (isCorrectOption) style = 'bg-emerald-400 text-slate-900 scale-110 font-black';
                        else if (isChosen) style = 'bg-rose-400 text-white font-black';
                        else style = 'bg-slate-100 text-slate-400 opacity-40';
                      }

                      return (
                        <button
                          key={i}
                          disabled={showAnswer}
                          onClick={() => handleSelectOption(icon, gameState.correct, gameState.correct)}
                          className={`w-20 h-20 rounded-2xl text-4xl flex items-center justify-center gap-1 shadow-xs active:scale-90 ${style}`}
                        >
                          <span>{icon}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeGame.id === 14 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 w-full max-w-lg">
                  {gameState.grid.map((item: any, idx: number) => {
                    const isCorrectOption = item.isTarget;
                    const isChosen = userAnswer === idx;
                    let style = 'bg-white hover:bg-teal-50 text-teal-950 border-2 border-teal-200';
                    if (showAnswer) {
                      if (isCorrectOption) style = 'bg-teal-600 text-white border-2 border-teal-700 scale-105 shadow-md font-black';
                      else if (isChosen) style = 'bg-rose-400 text-white border-2 border-rose-500';
                      else style = 'bg-teal-50 text-teal-300 opacity-40';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showAnswer}
                        onClick={() => handleSelectOption(idx, gameState.grid.findIndex((i: any) => i.isTarget), `${gameState.target.name} ${gameState.target.icon}`)}
                        className={`p-5 sm:p-6 rounded-3xl text-5xl sm:text-6xl flex flex-col items-center gap-2 shadow-xs transition-transform active:scale-95 ${style}`}
                      >
                        <span>{item.icon}</span>
                        <span className="text-xs sm:text-sm font-black flex items-center gap-1">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeGame.id === 16 && (
                <div className="flex flex-col items-center gap-5 w-full max-w-md">
                  <div className="p-6 bg-white rounded-3xl border-2 border-teal-200 flex flex-col items-center gap-3 shadow-xs w-full">
                    <span className="text-6xl sm:text-7xl animate-bounce">{gameState.quiz.icon}</span>
                    <span className="font-black text-3xl sm:text-4xl text-teal-950 tracking-widest dir-rtl" dir="rtl">
                      {showAnswer ? `${gameState.quiz.full} ${gameState.quiz.icon}` : gameState.quiz.displayWord}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                    {gameState.options.map((lettr: string, i: number) => {
                      const isCorrectOption = lettr === gameState.correct;
                      const isChosen = userAnswer === lettr;
                      let style = 'bg-amber-300 hover:bg-amber-400 text-slate-900 border-2 border-amber-400';
                      if (showAnswer) {
                        if (isCorrectOption) style = 'bg-teal-600 text-white scale-110 font-black border-2 border-teal-700 shadow-md';
                        else if (isChosen) style = 'bg-rose-400 text-white font-black border-2 border-rose-500';
                        else style = 'bg-teal-50 text-teal-300 opacity-40';
                      }

                      return (
                        <button
                          key={i}
                          disabled={showAnswer}
                          onClick={() => handleSelectOption(lettr, gameState.correct, `حرف "${gameState.correct}" (${gameState.quiz.full})`)}
                          className={`h-16 sm:h-20 rounded-2xl font-black text-2xl sm:text-3xl flex items-center justify-center gap-1 shadow-xs active:scale-90 transition-transform ${style}`}
                        >
                          <span>{lettr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeGame.id === 18 && (
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="bg-white p-6 rounded-3xl border-2 border-purple-100 font-black text-4xl text-slate-800 shadow-xs">
                    {gameState.num1} {gameState.op} {gameState.num2} = ؟
                  </div>

                  <div className="flex items-center gap-4 flex-wrap justify-center">
                    {gameState.options.map((opt: number, i: number) => {
                      const isCorrectOption = opt === gameState.correct;
                      const isChosen = userAnswer === opt;
                      let style = 'bg-amber-300 hover:bg-amber-400 text-slate-900';
                      if (showAnswer) {
                        if (isCorrectOption) style = 'bg-emerald-400 text-slate-900 scale-110 font-black';
                        else if (isChosen) style = 'bg-rose-400 text-white font-black';
                        else style = 'bg-slate-100 text-slate-400 opacity-40';
                      }

                      return (
                        <button
                          key={i}
                          disabled={showAnswer}
                          onClick={() => handleSelectOption(opt, gameState.correct, String(gameState.correct))}
                          className={`w-20 h-20 rounded-2xl font-black text-3xl flex items-center justify-center gap-1 shadow-xs active:scale-90 ${style}`}
                        >
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default GamesHub;
