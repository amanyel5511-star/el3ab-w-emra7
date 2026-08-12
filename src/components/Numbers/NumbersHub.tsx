import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, RefreshCw, ArrowRight } from 'lucide-react';
import { ARABIC_NUMBERS, NumberItem, generateRandomMathQuestion, MathQuestion } from '../../data/numbersData';
import { soundManager } from '../../utils/sound';
import { numbersAudio } from '../../utils/numbersAudio';

interface Props {
  onEarnStars: (amount: number, itemId?: string | number) => void;
}

export const NumbersHub: React.FC<Props> = ({ onEarnStars }) => {
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz'>('learn');

  // Learn Mode State
  const [selectedNumber, setSelectedNumber] = useState<NumberItem>(ARABIC_NUMBERS[1]);
  const [tappedCount, setTappedCount] = useState<number>(0);

  // Quiz Mode State
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion>(() => generateRandomMathQuestion());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const [userSequence, setUserSequence] = useState<string[]>([]);

  const playNumberAudio = (audioUrl?: string, fallbackText?: string) => {
    soundManager.playClick();
    if (audioUrl) {
      numbersAudio.playAudioUrl(audioUrl);
    } else if (fallbackText) {
      numbersAudio.playNumber(fallbackText);
    }
  };

  const handleNextQuestion = () => {
    soundManager.playClick();
    setCurrentQuestion(generateRandomMathQuestion());
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(false);
    setUserSequence([]);
  };

  const handleOptionClick = (option: string) => {
    if (isSubmitted) return;
    soundManager.playClick();
    setSelectedOption(option);

    const correct = option === currentQuestion.correctAnswer;
    setIsSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      soundManager.playCorrectFeedback();
      setScore(s => s + 1);
      onEarnStars(2, `math-${currentQuestion.id}`);
    } else {
      soundManager.playWrongFeedback();
    }
  };

  const handleSequenceClick = (numStr: string) => {
    if (isSubmitted) return;
    soundManager.playClick();
    const updated = [...userSequence, numStr];
    setUserSequence(updated);

    if (updated.length === currentQuestion.sequenceOrder?.length) {
      const resultStr = updated.join(' ');
      const correct = resultStr === currentQuestion.correctAnswer;
      setIsSubmitted(true);
      setIsCorrect(correct);

      if (correct) {
        soundManager.playCorrectFeedback();
        setScore(s => s + 1);
        onEarnStars(3, `math-${currentQuestion.id}`);
      } else {
        soundManager.playWrongFeedback();
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12 select-none dir-rtl" dir="rtl">
      
      {/* Top Banner Navigation */}
      <div className="bg-white p-5 rounded-[32px] border-4 border-teal-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-3xl shrink-0 text-teal-900">
            🔢
          </div>
          <div className="flex flex-col text-right">
            <h2 className="font-black text-2xl sm:text-3xl text-teal-950">الأرقام والرياضيات</h2>
            <p className="font-bold text-teal-800 text-xs sm:text-sm">تعلم الأرقام العربية ٠ - ١٠ واختبر ذكاءك في ألعاب العد والحساب!</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-teal-50 p-2 rounded-2xl border border-teal-200">
          <button
            onClick={() => { soundManager.playClick(); setActiveTab('learn'); }}
            className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-xs ${
              activeTab === 'learn' ? 'bg-teal-700 text-white shadow-md scale-105' : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100'
            }`}
          >
            <span>1. تعلم الأرقام 🔢</span>
          </button>

          <button
            onClick={() => { soundManager.playClick(); setActiveTab('quiz'); handleNextQuestion(); }}
            className={`px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-xs ${
              activeTab === 'quiz' ? 'bg-teal-700 text-white shadow-md scale-105' : 'bg-white text-teal-900 border border-teal-200 hover:bg-teal-100'
            }`}
          >
            <span>2. اختبر نفسك 🧠</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Learn Numbers 0..10 */}
      {activeTab === 'learn' && (
        <div className="flex flex-col gap-6">
          
          {/* Numbers Bar 0..10 */}
          <div className="bg-white p-4 rounded-3xl border-4 border-teal-200 shadow-sm">
            <span className="font-bold text-xs text-teal-800 block mb-3 text-right">اختر رقماً للتعلم:</span>
            <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
              {ARABIC_NUMBERS.map((num) => {
                const isSelected = selectedNumber.id === num.id;
                return (
                  <button
                    key={num.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedNumber(num);
                      setTappedCount(0);
                      playNumberAudio(num.audio);
                    }}
                    className={`h-12 rounded-2xl font-black text-2xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-md scale-110 z-10'
                        : 'bg-teal-50/40 hover:bg-teal-100/50 text-teal-950 border border-teal-200'
                    }`}
                  >
                    <span>{num.digit}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number Card Workbench */}
          <div className="bg-white rounded-[36px] border-4 border-teal-200 shadow-lg p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Number Visual Badge */}
            <div className="flex flex-col items-center justify-center bg-teal-50 p-8 rounded-[32px] border-2 border-teal-200 w-full md:w-1/2 text-center gap-4">
              <span className="text-9xl font-black text-teal-600 mb-1">{selectedNumber.digit}</span>
              <h3 className="font-black text-4xl text-teal-950">رقم {selectedNumber.word}</h3>

              <button
                onClick={() => playNumberAudio(selectedNumber.audio)}
                className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-base flex items-center gap-2 shadow-xs active:scale-95 transition-transform"
              >
                <Volume2 className="w-5 h-5 stroke-[2.5]" />
                <span>استمع لنطق الرقم 🔊</span>
              </button>
            </div>

            {/* Interactive Object Counting Area */}
            <div className="flex flex-col items-center justify-center bg-teal-50/70 p-6 rounded-[32px] border-2 border-teal-200 w-full md:w-1/2 text-center gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-teal-200 shadow-xs">
                <span className="font-bold text-sm text-teal-950">عد العناصر (انقر عليها): {tappedCount} / {selectedNumber.englishDigit}</span>
              </div>

              {selectedNumber.englishDigit === 0 ? (
                <div className="p-8 bg-white rounded-2xl border border-teal-200 text-center">
                  <span className="text-5xl block mb-2">🍃</span>
                  <p className="font-black text-base text-teal-950">الصفر يعني غصن خالي بدون عناصر!</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 flex-wrap p-4 bg-white rounded-2xl border border-teal-200 w-full min-h-[140px]">
                  {Array.from({ length: selectedNumber.englishDigit }).map((_, idx) => {
                    const isTapped = idx < tappedCount;
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          soundManager.playStar();
                          const nextVal = idx + 1;
                          setTappedCount(nextVal);
                          const numObj = ARABIC_NUMBERS[nextVal];
                          if (numObj?.audio) {
                            numbersAudio.playAudioUrl(numObj.audio);
                          }
                          if (nextVal === selectedNumber.englishDigit) {
                            onEarnStars(2, `num-${selectedNumber.id}`);
                          }
                        }}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-xs transition-all ${
                          isTapped ? 'bg-teal-300 scale-105 ring-2 ring-teal-500 text-teal-950' : 'bg-teal-50/50 hover:bg-teal-100/50'
                        }`}
                      >
                        {selectedNumber.icon}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Mode 2: Math Quiz */}
      {activeTab === 'quiz' && (
        <div className="bg-white rounded-[36px] border-4 border-teal-200 shadow-lg p-6 sm:p-10 flex flex-col gap-6">
          
          <div className="flex items-center justify-between border-b-2 border-teal-200 pb-4">
            <span className="px-4 py-1.5 bg-teal-100 text-teal-900 font-black text-sm rounded-2xl border border-teal-200">
              {currentQuestion.title}
            </span>

            <div className="flex items-center gap-3">
              <span className="font-black text-sm text-teal-950 bg-amber-100 px-3.5 py-1.5 rounded-2xl border border-amber-300">
                ⭐ النقاط: {score}
              </span>

              <button
                onClick={handleNextQuestion}
                className="px-4 py-1.5 bg-white hover:bg-teal-50 text-teal-950 rounded-2xl border border-teal-200 font-extrabold text-xs flex items-center gap-1 shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>سؤال جديد 🔄</span>
              </button>
            </div>
          </div>

          <div className="bg-teal-50/50 p-6 rounded-3xl border border-teal-200 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
            <h3 className="font-black text-2xl sm:text-3xl text-teal-950">{currentQuestion.promptText}</h3>

            {(currentQuestion.audioUrl || currentQuestion.audioSpeech) && (
              <button
                onClick={() => playNumberAudio(currentQuestion.audioUrl, currentQuestion.audioSpeech)}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-base flex items-center gap-2 shadow-xs active:scale-95"
              >
                <Volume2 className="w-5 h-5" />
                <span>استمع للصوت 🔊</span>
              </button>
            )}

            {currentQuestion.visualItems && (
              <div className="flex items-center justify-center gap-2 flex-wrap bg-white p-4 rounded-2xl border border-teal-200 my-2">
                {Array.from({ length: currentQuestion.visualItems.count }).map((_, idx) => (
                  <span key={idx} className="text-4xl animate-pulse">{currentQuestion.visualItems?.icon}</span>
                ))}
              </div>
            )}

            {currentQuestion.visualGroups && (
              <div className="flex items-center justify-center gap-4 flex-wrap bg-white p-4 rounded-2xl border border-teal-200 my-2">
                <div className="flex gap-1">
                  {Array.from({ length: currentQuestion.visualGroups.count1 }).map((_, idx) => (
                    <span key={idx} className="text-3xl">{currentQuestion.visualGroups?.icon}</span>
                  ))}
                </div>
                <span className="font-black text-3xl text-teal-950">{currentQuestion.visualGroups.op}</span>
                <div className="flex gap-1">
                  {Array.from({ length: currentQuestion.visualGroups.count2 }).map((_, idx) => (
                    <span key={idx} className="text-3xl">{currentQuestion.visualGroups?.icon}</span>
                  ))}
                </div>
              </div>
            )}

            {currentQuestion.sequence && (
              <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-2xl border border-teal-200 my-2">
                {currentQuestion.sequence.map((item, idx) => (
                  <span
                    key={idx}
                    className={`w-14 h-14 rounded-2xl border border-teal-200 font-black text-3xl flex items-center justify-center ${
                      item === '؟' ? 'bg-teal-600 text-white animate-bounce' : 'bg-teal-50 text-teal-950'
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}

            {currentQuestion.sequenceOrder && (
              <div className="flex flex-col items-center gap-3 w-full my-2">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {currentQuestion.sequenceOrder.map((num, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSequenceClick(ARABIC_NUMBERS[num].digit)}
                      className="w-16 h-16 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-3xl shadow-xs active:scale-95"
                    >
                      {ARABIC_NUMBERS[num].digit}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-2xl border border-teal-200 min-h-[50px] w-full max-w-md">
                  <span className="font-bold text-sm text-teal-950">ترتيبك الحالي:</span>
                  {userSequence.map((item, idx) => (
                    <span key={idx} className="font-black text-2xl text-teal-950 bg-teal-200 px-3 py-1 rounded-xl">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!currentQuestion.sequenceOrder && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentQuestion.options.map((option, idx) => {
                const isThisSelected = selectedOption === option;
                let btnStyle = 'bg-white hover:bg-teal-100 text-teal-950 border-2 border-teal-200';

                if (isSubmitted) {
                  if (option === currentQuestion.correctAnswer) {
                    btnStyle = 'bg-teal-600 text-white border-2 border-teal-700 scale-105 shadow-xs';
                  } else if (isThisSelected) {
                    btnStyle = 'bg-rose-400 text-white border-2 border-rose-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleOptionClick(option)}
                    className={`py-5 px-6 rounded-2xl font-black text-3xl flex items-center justify-center shadow-xs transition-all active:scale-95 ${btnStyle}`}
                  >
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs ${
                  isCorrect ? 'bg-teal-100 text-teal-950 border border-teal-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{isCorrect ? '🎉' : '💡'}</span>
                  <div className="flex flex-col text-right">
                    <h4 className="font-black text-2xl">
                      {isCorrect ? 'رائع! ممتاز!' : 'حاول مرة أخرى'}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-white hover:bg-teal-50 text-teal-950 rounded-2xl font-black text-base flex items-center gap-2 shadow-xs border border-teal-200"
                >
                  <span>السؤال التالي 🚀</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
};

export default NumbersHub;
