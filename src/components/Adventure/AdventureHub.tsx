import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, MapPin, 
  RotateCcw, Sparkles, Play, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ADVENTURE_LEVELS, AdventureLevel, AdventureQuestion } from '../../data/adventureLevelsData';
import { AdventureProgress } from '../../types';
import { soundManager } from '../../utils/sound';

interface Props {
  onEarnStars: (amount: number, itemId?: string | number) => void;
  onGoHome: () => void;
}

export const AdventureHub: React.FC<Props> = ({ onEarnStars, onGoHome }) => {
  const [progress, setProgress] = useState<AdventureProgress>(() => {
    try {
      const saved = localStorage.getItem('hero_adventure_progress_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading hero_adventure_progress_v1:', e);
    }
    return {
      unlockedLevel: 1,
      completedLevels: {},
      unlockedBadges: []
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('hero_adventure_progress_v1', JSON.stringify(progress));
    } catch (e) {
      console.warn('Error saving hero_adventure_progress_v1:', e);
    }
  }, [progress]);

  const [viewMode, setViewMode] = useState<'map' | 'level'>('map');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isLevelFinished, setIsLevelFinished] = useState<boolean>(false);
  
  const [lockedToast, setLockedToast] = useState<string | null>(null);

  const mascotPhrases = [
    'هيا يا بطل! 🚀',
    'أنت تستطيع! 💪',
    'رائع! لنكمل المغامرة! ⭐',
    'المرحلة التالية في انتظارك! 🎉',
    'أنت ذكي ومميز جداً! 🦁'
  ];
  const [mascotQuoteIndex, setMascotQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMascotQuoteIndex(prev => (prev + 1) % mascotPhrases.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentLevel: AdventureLevel = ADVENTURE_LEVELS.find(l => l.id === activeLevelId) || ADVENTURE_LEVELS[0];
  const currentQuestion: AdventureQuestion = currentLevel.questions[questionIndex] || currentLevel.questions[0];

  const handleStartLevel = (levelId: number) => {
    if (levelId > progress.unlockedLevel) {
      soundManager.playClick();
      setLockedToast(`🔒 أكمل المرحلة ${levelId - 1} أولاً يا شجاع!`);
      setTimeout(() => setLockedToast(null), 3500);
      return;
    }

    soundManager.playClick();
    setActiveLevelId(levelId);
    setQuestionIndex(0);
    setSelectedOption(null);
    setCorrectAnswersCount(0);
    setIsQuestionAnswered(false);
    setIsAnswerCorrect(null);
    setIsLevelFinished(false);
    setViewMode('level');
  };

  const handleAnswerOption = (option: string) => {
    if (isQuestionAnswered) return;

    setSelectedOption(option);
    setIsQuestionAnswered(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      soundManager.playCorrectFeedback();
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      soundManager.playFeedbackNextQuestion();
    }
  };

  const handleNextQuestion = () => {
    soundManager.playClick();

    if (questionIndex < currentLevel.questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsQuestionAnswered(false);
      setIsAnswerCorrect(null);
    } else {
      finishLevel();
    }
  };

  const finishLevel = () => {
    setIsLevelFinished(true);
    soundManager.playSuccess();
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });

    let starsEarned = 1;
    if (correctAnswersCount >= 4) starsEarned = 3;
    else if (correctAnswersCount >= 3) starsEarned = 2;

    const newUnlockedLevel = Math.max(progress.unlockedLevel, activeLevelId + 1);
    
    const badgeTitle = currentLevel.rewardBadge.title;
    const newBadges = [...progress.unlockedBadges];
    if (!newBadges.includes(badgeTitle)) {
      newBadges.push(badgeTitle);
    }

    setProgress(prev => ({
      ...prev,
      unlockedLevel: newUnlockedLevel,
      completedLevels: {
        ...prev.completedLevels,
        [activeLevelId]: { stars: Math.max(prev.completedLevels[activeLevelId]?.stars || 0, starsEarned), completedAt: new Date().toISOString() }
      },
      unlockedBadges: newBadges
    }));

    onEarnStars(starsEarned * 3, `adventure-level-${activeLevelId}`);
  };

  const totalAdventureStars = Object.values(progress.completedLevels).reduce((acc: number, curr: { stars: number }) => acc + curr.stars, 0);

  return (
    <div className="w-full flex flex-col gap-6 pb-12 select-none dir-rtl" dir="rtl">

      {/* Mode 1: Map Screen */}
      {viewMode === 'map' && (
        <div className="flex flex-col gap-6">

          {/* Map Top Banner Header */}
          <div className="bg-white rounded-[32px] border-4 border-teal-200 p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex flex-col gap-3 text-center md:text-right">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-900 px-4 py-1.5 rounded-2xl font-black text-xs sm:text-sm self-center md:self-start border border-teal-200">
                <span>🏆 خريطة مغامرة الأبطال</span>
              </div>

              <h1 className="font-black text-3xl sm:text-4xl text-teal-950">
                خريطة المراحل التفاعلية 🗺️
              </h1>

              <div className="flex items-center gap-3 bg-teal-50 p-3.5 rounded-2xl border border-teal-200 shadow-xs mt-1">
                <div className="w-12 h-12 bg-teal-200 rounded-full flex items-center justify-center text-2xl shrink-0 animate-bounce">
                  🦁
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-bold text-xs text-teal-900">ليث البطل يقول:</span>
                  <p className="font-black text-sm text-teal-950">{mascotPhrases[mascotQuoteIndex]}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200 shadow-xs flex items-center justify-around gap-4 min-w-[220px]">
                <div className="flex flex-col items-center">
                  <span className="font-black text-lg text-teal-950 flex items-center gap-1">
                    <span>⭐</span>
                    <span>{totalAdventureStars}</span>
                  </span>
                  <span className="text-[11px] font-bold text-teal-800">نجوم المغامرة</span>
                </div>
                <div className="h-8 w-0.5 bg-teal-200" />
                <div className="flex flex-col items-center">
                  <span className="font-black text-lg text-teal-950 flex items-center gap-1">
                    <span>🏅</span>
                    <span>{progress.unlockedBadges.length}</span>
                  </span>
                  <span className="text-[11px] font-bold text-teal-800">الأوسمة</span>
                </div>
                <div className="h-8 w-0.5 bg-teal-200" />
                <div className="flex flex-col items-center">
                  <span className="font-black text-lg text-teal-950 flex items-center gap-1">
                    <span>🚩</span>
                    <span>{progress.unlockedLevel}/30</span>
                  </span>
                  <span className="text-[11px] font-bold text-teal-800">المستوى الحالي</span>
                </div>
              </div>

              <button
                onClick={() => { soundManager.playClick(); onGoHome(); }}
                className="w-full sm:w-auto px-5 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-transform"
              >
                <Home className="w-5 h-5" />
                <span>🏠 الرئيسية</span>
              </button>
            </div>

          </div>

          <AnimatePresence>
            {lockedToast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-rose-500 text-white font-black text-center py-3 px-6 rounded-2xl shadow-md self-center text-sm sm:text-base z-30"
              >
                {lockedToast}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Winding Levels Map Trail */}
          <div className="bg-emerald-50 rounded-[36px] border-4 border-emerald-100 p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col items-center">
            
            <div className="w-full max-w-4xl flex flex-col gap-6 relative z-10">
              <h2 className="font-black text-2xl sm:text-3xl text-slate-800 text-center mb-2 flex items-center justify-center gap-2">
                <span>🌳</span>
                <span>طريق أبطال العالم (30 مرحلة)</span>
                <span>✨</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
                {ADVENTURE_LEVELS.map((lvl) => {
                  const isUnlocked = lvl.id <= progress.unlockedLevel;
                  const isCurrentActive = lvl.id === progress.unlockedLevel;
                  const levelStars = progress.completedLevels[lvl.id]?.stars || 0;

                  return (
                    <motion.div
                      key={lvl.id}
                      whileHover={{ scale: isUnlocked ? 1.08 : 1.02 }}
                      whileTap={{ scale: isUnlocked ? 0.95 : 1 }}
                      className="relative flex flex-col items-center"
                    >
                      {isCurrentActive && (
                        <div className="absolute -top-7 z-20 bg-amber-400 text-slate-900 rounded-xl px-2.5 py-0.5 text-[10px] font-black shadow-xs animate-bounce flex items-center gap-1 whitespace-nowrap">
                          <span>🦁 أنت هنا!</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleStartLevel(lvl.id)}
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center relative transition-all shadow-md ${
                          isCurrentActive
                            ? 'bg-amber-300 ring-4 ring-amber-400 scale-105'
                            : isUnlocked
                            ? 'bg-white hover:bg-amber-50 cursor-pointer border-2 border-emerald-200'
                            : 'bg-slate-200 opacity-60 cursor-not-allowed border-2 border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xl sm:text-2xl">{isUnlocked ? lvl.icon : '🔒'}</span>
                          <span className="font-black text-xs sm:text-sm text-slate-800 mt-0.5">
                            مرحلة {lvl.id}
                          </span>
                        </div>

                        {isUnlocked && levelStars > 0 && (
                          <div className="absolute -bottom-2 bg-slate-900 text-white px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-0.5 shadow-xs">
                            {'⭐'.repeat(levelStars)}
                          </div>
                        )}
                      </button>

                      <span className="font-bold text-[11px] sm:text-xs text-slate-700 mt-2 text-center max-w-[90px] truncate bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs">
                        {lvl.name.split(':')[1] || lvl.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

            </div>

          </div>

          <div className="bg-white rounded-[32px] border-4 border-amber-100 p-6 shadow-xl flex flex-col gap-4">
            <h3 className="font-black text-2xl text-slate-800 flex items-center gap-2">
              <span>🏅</span>
              <span>أوسمة وتيجان المغامرة ({progress.unlockedBadges.length}):</span>
            </h3>

            {progress.unlockedBadges.length === 0 ? (
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center font-bold text-slate-600 text-sm">
                🎯 أكمل المرحلة الأولى لفتح أول وسام في رحلتك!
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                {progress.unlockedBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="bg-amber-300 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm text-slate-900 flex items-center gap-2 shadow-xs"
                  >
                    <span>🏅</span>
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Mode 2: Level Challenge Screen */}
      {viewMode === 'level' && (
        <div className="flex flex-col gap-6">

          <div className="bg-white p-4 rounded-3xl border-4 border-amber-100 shadow-xl flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { soundManager.playClick(); onGoHome(); }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-xs"
              >
                <Home className="w-4 h-4" />
                <span>🏠 الرئيسية</span>
              </button>

              <button
                onClick={() => { soundManager.playClick(); setViewMode('map'); }}
                className="px-4 py-2 bg-sky-300 hover:bg-sky-400 text-slate-900 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-xs"
              >
                <MapPin className="w-4 h-4" />
                <span>🗺️ خريطة المراحل</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentLevel.icon}</span>
              <div className="flex flex-col text-right">
                <h3 className="font-black text-base sm:text-lg text-slate-800">{currentLevel.name}</h3>
                <span className="font-bold text-xs text-slate-500">
                  السؤال {questionIndex + 1} من {currentLevel.questions.length}
                </span>
              </div>
            </div>
          </div>

          {!isLevelFinished ? (
            <div className="bg-white rounded-[36px] border-4 border-amber-100 p-6 sm:p-8 shadow-xl flex flex-col items-center gap-6 relative">
              
              <div className="w-full max-w-xl bg-amber-100 h-4 rounded-full overflow-hidden relative">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((questionIndex + 1) / currentLevel.questions.length) * 100}%` }}
                />
              </div>

              <div className="w-full max-w-2xl bg-amber-50 p-5 rounded-3xl border border-amber-200 shadow-xs flex items-center gap-4">
                <div className="w-16 h-16 bg-amber-300 rounded-full flex items-center justify-center text-3xl shrink-0 animate-bounce">
                  🦁
                </div>
                <div className="flex flex-col text-right flex-1">
                  <span className="font-bold text-xs text-amber-900">ليث البطل يقول:</span>
                  <h2 className="font-black text-xl sm:text-2xl text-slate-800 leading-snug mt-1">
                    {currentQuestion.prompt}
                  </h2>
                </div>
              </div>

              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQuestion.correctAnswer;

                  let optionStyle = 'bg-white hover:bg-amber-50 text-slate-800 border-2 border-amber-100';
                  if (isQuestionAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-400 text-slate-900 border-2 border-emerald-500 scale-102';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-400 text-white border-2 border-rose-500';
                    } else {
                      optionStyle = 'bg-slate-100 opacity-60 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerOption(opt)}
                      disabled={isQuestionAnswered}
                      className={`p-4 sm:p-5 rounded-2xl font-black text-lg sm:text-xl text-center transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {isQuestionAnswered && isCorrect && <span className="text-xl">✓</span>}
                      {isQuestionAnswered && isSelected && !isCorrect && <span className="text-xl">✗</span>}
                    </button>
                  );
                })}
              </div>

              {isQuestionAnswered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-2xl flex flex-col items-center gap-4 mt-4"
                >
                  <div className={`w-full p-4 rounded-2xl text-center font-black text-base flex items-center justify-center gap-2 shadow-xs ${
                    isAnswerCorrect ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    {isAnswerCorrect ? (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>رائع! إجابة صحيحة يا بطل! ⭐</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-5 h-5" />
                        <span>لا بأس! الإجابة الصحيحة هي: {currentQuestion.correctAnswer}</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-2xl font-black text-lg sm:text-xl flex items-center gap-2 shadow-md active:scale-95 transition-transform"
                  >
                    <span>{questionIndex < currentLevel.questions.length - 1 ? 'السؤال التالي ▶️' : 'رؤية النتيجة 🏆'}</span>
                  </button>
                </motion.div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-[40px] border-4 border-amber-100 p-8 shadow-xl flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 bg-amber-300 rounded-full flex items-center justify-center text-5xl shadow-md animate-bounce">
                🏆
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-xs bg-orange-100 text-orange-900 px-4 py-1 rounded-full self-center">
                  🎉 مبارك الفوز بالمرحلة!
                </span>
                <h2 className="font-black text-3xl sm:text-4xl text-slate-800">
                  لقد أكملت {currentLevel.name}!
                </h2>
                <p className="font-bold text-slate-600 text-sm sm:text-base">
                  أجبت بشكل صحيح على {correctAnswersCount} من 5 أسئلة!
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 bg-amber-50 p-4 rounded-3xl border border-amber-200 shadow-xs">
                {[1, 2, 3].map((starNum) => {
                  let starsEarned = 1;
                  if (correctAnswersCount >= 4) starsEarned = 3;
                  else if (correctAnswersCount >= 3) starsEarned = 2;

                  const isGold = starNum <= starsEarned;
                  return (
                    <span key={starNum} className={`text-4xl sm:text-5xl transition-transform ${isGold ? 'scale-110 drop-shadow-sm' : 'opacity-30 grayscale'}`}>
                      ⭐
                    </span>
                  );
                })}
              </div>

              <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-900 font-black text-sm sm:text-base flex items-center gap-2 shadow-xs">
                <span>🏅 وسام جديد:</span>
                <span>{currentLevel.rewardBadge.title}</span>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap mt-2">
                <button
                  onClick={() => { soundManager.playClick(); setViewMode('map'); }}
                  className="px-6 py-3.5 bg-sky-300 hover:bg-sky-400 text-slate-900 rounded-2xl font-black text-base flex items-center gap-2 shadow-xs"
                >
                  <MapPin className="w-5 h-5" />
                  <span>🗺️ خريطة المراحل</span>
                </button>

                {activeLevelId < 30 && (
                  <button
                    onClick={() => {
                      soundManager.playFeedbackNextStage();
                      handleStartLevel(activeLevelId + 1);
                    }}
                    className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-2xl font-black text-base flex items-center gap-2 shadow-md"
                  >
                    <Play className="w-5 h-5" />
                    <span>▶️ المرحلة التالية (مرحلة {activeLevelId + 1})</span>
                  </button>
                )}

                <button
                  onClick={() => handleStartLevel(activeLevelId)}
                  className="px-6 py-3.5 bg-white hover:bg-amber-50 text-slate-800 rounded-2xl border border-slate-200 font-black text-base flex items-center gap-2 shadow-xs"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>🔄 إعادة المرحلة</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AdventureHub;
