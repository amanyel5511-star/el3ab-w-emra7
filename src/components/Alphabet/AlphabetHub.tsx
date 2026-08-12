import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, Mic, MicOff, Play, ChevronRight, ChevronLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { ARABIC_ALPHABET } from '../../data/alphabetData';
import { AlphabetItem } from '../../types';
import { soundManager } from '../../utils/sound';
import { alphabetAudio } from '../../utils/alphabetAudio';
import { generateRandomAlphabetQuestion, AlphabetQuizQuestion } from '../../data/alphabetQuizData';

interface Props {
  onEarnStars: (amount: number, letterId: string) => void;
  learnedLetters: string[];
}

export const AlphabetHub: React.FC<Props> = ({ onEarnStars, learnedLetters }) => {
  const [selectedLetter, setSelectedLetter] = useState<AlphabetItem>(ARABIC_ALPHABET[0]);
  const [activeTab, setActiveTab] = useState<'learn' | 'tashkeel' | 'recorder' | 'quiz'>('learn');

  // Voice Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingFeedback, setRecordingFeedback] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'success' | 'error'>('idle');
  const [recognizedText, setRecognizedText] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const recognizedTextRef = useRef<string>('');

  // Alphabet Quiz State
  const [quizQuestion, setQuizQuestion] = useState<AlphabetQuizQuestion>(() => generateRandomAlphabetQuestion());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const playLetterAudio = (text: string) => {
    soundManager.playClick();
    soundManager.speakArabic(text, 0.75);
  };

  useEffect(() => {
    setAudioBlob(null);
    setRecordingFeedback(null);
    setRecordingStatus('idle');
    setRecognizedText('');
    recognizedTextRef.current = '';
  }, [selectedLetter]);

  const normalizeArabicText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/ء/g, '')
      .replace(/[^\u0621-\u064A\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

  const getLetterVariations = (letterItem: AlphabetItem): string[] => {
    const vars = new Set<string>();
    const normL = normalizeArabicText(letterItem.letter);
    const normN = normalizeArabicText(letterItem.name);
    const normW = normalizeArabicText(letterItem.exampleWord);

    if (normL) vars.add(normL);
    if (normN) vars.add(normN);
    if (normW) vars.add(normW);

    if (letterItem.name.endsWith('اء')) {
      vars.add(normalizeArabicText(letterItem.name.slice(0, -1)));
    }

    if (letterItem.fatha?.word) vars.add(normalizeArabicText(letterItem.fatha.word));
    if (letterItem.damma?.word) vars.add(normalizeArabicText(letterItem.damma.word));
    if (letterItem.kasra?.word) vars.add(normalizeArabicText(letterItem.kasra.word));

    return Array.from(vars).filter(Boolean);
  };

  const evaluateSpokenText = (spoken: string) => {
    const rawNormalized = normalizeArabicText(spoken);

    if (!rawNormalized) {
      setRecordingStatus('error');
      soundManager.playFeedbackMicUnclear();
      setRecordingFeedback(`❌ لم نتمكن من سماع نطقك بوضوح. اضغط زر التسجيل ثم انطق الحرف مثل "${selectedLetter.name}" أو كلمة "${selectedLetter.exampleWord}"! 🎤`);
      return;
    }

    const words = rawNormalized.split(/\s+/);
    const cleanedSpokenWords = words.map(w => w.replace(/^ال/, '').replace(/^حرف/, '')).filter(Boolean);
    const cleanedText = cleanedSpokenWords.join(' ');
    const targetVariations = getLetterVariations(selectedLetter);

    const isCorrectMatch = targetVariations.some((v) => {
      if (!v) return false;
      return (
        rawNormalized === v ||
        cleanedText === v ||
        words.includes(v) ||
        cleanedSpokenWords.includes(v) ||
        (v.length >= 2 && (rawNormalized.includes(v) || cleanedText.includes(v)))
      );
    });

    if (isCorrectMatch) {
      setRecordingStatus('success');
      soundManager.playCorrectFeedback();
      setRecordingFeedback(`🌟 ممتاز! أحسنت، نطقك صحيح لحرف (${selectedLetter.letter} - ${selectedLetter.name})! 👏 (سمعنا: "${spoken}")`);
      onEarnStars(2, selectedLetter.id);
    } else {
      const detectedOtherLetter = ARABIC_ALPHABET.find((item) => {
        if (item.id === selectedLetter.id) return false;
        const otherVars = getLetterVariations(item);
        return otherVars.some((v) => rawNormalized.includes(v) || cleanedText.includes(v));
      });

      setRecordingStatus('error');
      soundManager.playWrongFeedback();

      if (detectedOtherLetter) {
        setRecordingFeedback(`❌ خطأ! لقد قلت "${spoken}" (نطق حرف ${detectedOtherLetter.name})، بينما الحرف المطلوب هو (${selectedLetter.letter} - ${selectedLetter.name}). حاول مرة أخرى! 🔄`);
      } else {
        setRecordingFeedback(`❌ خطأ! لقد قلت "${spoken}" وهو نطق غير مطابق لحرف (${selectedLetter.letter} - ${selectedLetter.name}). انطق الحرف بوضوح ثم أعد المحاولة! 🔄`);
      }
    }
  };

  const startRecording = async () => {
    soundManager.playClick();
    audioChunksRef.current = [];
    recognizedTextRef.current = '';
    setRecognizedText('');
    setRecordingStatus('recording');
    setRecordingFeedback('جاري الاستماع لنطقك الجميل... 🎙️');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript + ' ';
          }
          recognizedTextRef.current = current.trim();
          setRecognizedText(current.trim());
        };

        recognition.onerror = () => {};
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition error:', err);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setRecordingFeedback('يرجى السماح بالوصول للميكروفون لتسجيل صوتك 🎤');
      setRecordingStatus('idle');
    }
  };

  const stopRecording = () => {
    soundManager.playClick();
    setIsRecording(false);
    setRecordingFeedback('جاري تحليل وتدقيق نطقك الصوتي... ⏳');

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      } catch {}
    }

    setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      const spoken = recognizedTextRef.current.trim();
      evaluateSpokenText(spoken);
    }, 600);
  };

  const playRecordedAudio = () => {
    if (!audioBlob) return;
    soundManager.playClick();
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {});
    } catch {
      // ignore
    }
  };

  const handleNextQuizQuestion = () => {
    soundManager.playClick();
    setQuizQuestion(generateRandomAlphabetQuestion());
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(false);
  };

  const handleQuizOptionClick = (option: string) => {
    if (isSubmitted) return;
    soundManager.playClick();
    setSelectedOption(option);

    const correct = option === quizQuestion.correctAnswer;
    setIsSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      soundManager.playCorrectFeedback();
      setQuizScore(s => s + 1);
      onEarnStars(2, `alpha-quiz-${quizQuestion.id}`);
    } else {
      soundManager.playWrongFeedback();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12 select-none dir-rtl" dir="rtl">
      
      {/* 28 Letters Selector Card */}
      <div className="bg-white p-5 rounded-[32px] border-4 border-teal-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b-2 border-teal-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🔤</span>
            <h2 className="font-black text-xl text-teal-950">الحروف العربية الـ 28</h2>
          </div>
          <span className="bg-teal-100 text-teal-900 font-extrabold text-xs px-3.5 py-1.5 rounded-2xl border border-teal-200">
            تم التعلم: {learnedLetters.length} / 28
          </span>
        </div>

          {/* 28 Letters Grid */}
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
            {ARABIC_ALPHABET.map((item) => {
              const isSelected = selectedLetter.id === item.id;
              const isLearned = learnedLetters.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedLetter(item);
                    alphabetAudio.playLetter(item);
                  }}
                  className={`h-11 rounded-2xl font-black text-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-md scale-110 z-10'
                      : isLearned
                      ? 'bg-teal-100 text-teal-900 border border-teal-300'
                      : 'bg-teal-50/40 hover:bg-teal-100/50 text-teal-950 border border-teal-200'
                  }`}
                >
                  <span>{item.letter}</span>
                </button>
              );
            })}
          </div>
      </div>

      {/* Main Workbench */}
      <div className="bg-white rounded-[36px] border-4 border-teal-200 shadow-lg overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="bg-teal-50/80 border-b-2 border-teal-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currIdx = ARABIC_ALPHABET.findIndex(l => l.id === selectedLetter.id);
                const prevIdx = currIdx > 0 ? currIdx - 1 : ARABIC_ALPHABET.length - 1;
                const prevLetter = ARABIC_ALPHABET[prevIdx];
                setSelectedLetter(prevLetter);
                alphabetAudio.playLetter(prevLetter);
              }}
              className="p-2 bg-white hover:bg-teal-100 text-teal-900 rounded-xl border border-teal-200 shadow-xs"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-2xl border border-teal-200 font-black text-base text-teal-950 shadow-xs">
              <span className="text-2xl text-teal-600">{selectedLetter.letter}</span>
              <span>حرف {selectedLetter.name}</span>
            </div>

            <button
              onClick={() => {
                const currIdx = ARABIC_ALPHABET.findIndex(l => l.id === selectedLetter.id);
                const nextIdx = currIdx < ARABIC_ALPHABET.length - 1 ? currIdx + 1 : 0;
                const nextLetter = ARABIC_ALPHABET[nextIdx];
                setSelectedLetter(nextLetter);
                alphabetAudio.playLetter(nextLetter);
              }}
              className="p-2 bg-white hover:bg-teal-100 text-teal-900 rounded-xl border border-teal-200 shadow-xs"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <div className="text-xs font-black text-teal-900 bg-teal-100 px-3 py-1 rounded-xl border border-teal-200">
            قسم الحروف 🔤
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">

          {/* Feature Tabs Selector */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { id: 'learn', label: '1. النطق والكلمة 🗣️', activeColor: 'bg-teal-700 text-white' },
              { id: 'tashkeel', label: '2. الحركات الثلاث ✍️', activeColor: 'bg-teal-700 text-white' },
              { id: 'recorder', label: '3. سجّل نطقك 🎙️', activeColor: 'bg-teal-700 text-white' },
              { id: 'quiz', label: '4. اختبر نفسك 🧩', activeColor: 'bg-teal-700 text-white' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(tab.id as any);
                  if (tab.id === 'quiz') handleNextQuizQuestion();
                }}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-xs ${
                  activeTab === tab.id ? `${tab.activeColor} shadow-md scale-105` : 'bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Learn */}
          {activeTab === 'learn' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-teal-50/50 p-6 rounded-3xl border-2 border-teal-200">
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-xs border border-teal-200">
                <span className="text-8xl font-black text-teal-600 mb-3">{selectedLetter.letter}</span>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    alphabetAudio.playLetter(selectedLetter);
                  }}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-base flex items-center gap-2 shadow-xs active:scale-95 transition-transform"
                >
                  <Volume2 className="w-5 h-5 stroke-[2.5]" />
                  <span>انطق الحرف 🔊</span>
                </button>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl text-center gap-3 shadow-xs border border-teal-200">
                <span className="text-7xl animate-bounce">{selectedLetter.exampleIcon}</span>
                <h3 className="font-black text-3xl text-teal-950">{selectedLetter.exampleWord}</h3>
                <p className="font-bold text-teal-800 text-base">{selectedLetter.exampleTranslation}</p>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    alphabetAudio.playWord(selectedLetter);
                  }}
                  className="mt-1 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-black text-sm flex items-center gap-1.5 shadow-xs"
                >
                  <Volume2 className="w-4 h-4 stroke-[2.5]" />
                  <span>انطق الكلمة 🗣️</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Tashkeel */}
          {activeTab === 'tashkeel' && (
            <div className="flex flex-col gap-6 bg-teal-50/50 p-6 rounded-3xl border-2 border-teal-200">
              <h3 className="font-black text-2xl text-teal-950 text-center">
                نطق حرف ({selectedLetter.letter}) بالحركات الثلاث ✍️
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-white rounded-2xl border-2 border-teal-200 flex flex-col items-center gap-3 shadow-xs">
                  <span className="px-3 py-1 bg-teal-100 text-teal-900 font-extrabold text-xs rounded-full border border-teal-200">الفتحة</span>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      alphabetAudio.playFatha(selectedLetter);
                    }}
                    className="text-6xl font-black text-teal-600 my-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    title="استمع لصوت الفتحة"
                  >
                    {selectedLetter.fatha.text}
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      alphabetAudio.playWord(selectedLetter.fatha.word);
                    }}
                    className="w-full py-2 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl font-black text-lg text-teal-950 hover:scale-102 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                    title="استمع لنطق الكلمة"
                  >
                    <Volume2 className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                    <span>{selectedLetter.fatha.word}</span>
                  </button>
                </div>

                <div className="p-5 bg-white rounded-2xl border-2 border-teal-200 flex flex-col items-center gap-3 shadow-xs">
                  <span className="px-3 py-1 bg-teal-100 text-teal-900 font-extrabold text-xs rounded-full border border-teal-200">الضمة</span>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      alphabetAudio.playDamma(selectedLetter);
                    }}
                    className="text-6xl font-black text-teal-600 my-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    title="استمع لصوت الضمة"
                  >
                    {selectedLetter.damma.text}
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      alphabetAudio.playWord(selectedLetter.damma.word);
                    }}
                    className="w-full py-2 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl font-black text-lg text-teal-950 hover:scale-102 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                    title="استمع لنطق الكلمة"
                  >
                    <Volume2 className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                    <span>{selectedLetter.damma.word}</span>
                  </button>
                </div>

                <div className="p-5 bg-white rounded-2xl border-2 border-teal-200 flex flex-col items-center gap-3 shadow-xs">
                  <span className="px-3 py-1 bg-teal-100 text-teal-900 font-extrabold text-xs rounded-full border border-teal-200">الكسرة</span>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      alphabetAudio.playKasra(selectedLetter);
                    }}
                    className="text-6xl font-black text-teal-600 my-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                    title="استمع لصوت الكسرة"
                  >
                    {selectedLetter.kasra.text}
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      alphabetAudio.playWord(selectedLetter.kasra.word);
                    }}
                    className="w-full py-2 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl font-black text-lg text-teal-950 hover:scale-102 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                    title="استمع لنطق الكلمة"
                  >
                    <Volume2 className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                    <span>{selectedLetter.kasra.word}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Recorder */}
          {activeTab === 'recorder' && (
            <div className="flex flex-col items-center justify-center p-6 bg-teal-50/50 rounded-3xl border-2 border-teal-200 text-center gap-5 shadow-xs">
              <span className="text-5xl">🎙️</span>
              <h4 className="font-black text-2xl text-teal-950">
                سجّل نطقك لحرف ({selectedLetter.letter} - {selectedLetter.name})
              </h4>

              {recognizedText && (
                <div className="bg-teal-100 px-4 py-2 rounded-xl border border-teal-200 font-bold text-xs text-teal-900">
                  🎙️ النص المسموع: "{recognizedText}"
                </div>
              )}

              <div className="flex items-center gap-3 my-2 flex-wrap justify-center">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-base flex items-center gap-2 shadow-xs animate-pulse active:scale-95"
                  >
                    <Mic className="w-5 h-5" />
                    <span>ابدأ التسجيل 🎙️</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-8 py-3.5 bg-teal-950 text-white rounded-2xl font-black text-base flex items-center gap-2 shadow-xs active:scale-95"
                  >
                    <MicOff className="w-5 h-5 text-rose-300" />
                    <span>إيقاف التسجيل ⏹️</span>
                  </button>
                )}

                {audioBlob && (
                  <button
                    onClick={playRecordedAudio}
                    className="px-6 py-3.5 bg-teal-700 hover:bg-teal-600 text-white rounded-2xl font-black text-base flex items-center gap-2 shadow-xs active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>استمع لصوتك 🔊</span>
                  </button>
                )}
              </div>

              {recordingFeedback && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-4 rounded-2xl font-bold text-base shadow-xs w-full max-w-lg ${
                    recordingStatus === 'error'
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : recordingStatus === 'success'
                      ? 'bg-teal-100 text-teal-950 border border-teal-300'
                      : 'bg-white text-teal-950 border border-teal-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {recordingStatus === 'error' && <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}
                    {recordingStatus === 'success' && <CheckCircle className="w-6 h-6 text-teal-700 shrink-0" />}
                    <span>{recordingFeedback}</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Tab 4: Quiz */}
          {activeTab === 'quiz' && (
            <div className="flex flex-col gap-6 bg-teal-50/50 p-6 rounded-3xl border-2 border-teal-200">
              
              <div className="flex items-center justify-between border-b-2 border-teal-200 pb-3">
                <span className="px-4 py-1.5 bg-teal-100 text-teal-900 font-black text-xs sm:text-sm rounded-2xl border border-teal-200">
                  {quizQuestion.title}
                </span>

                <div className="flex items-center gap-3">
                  <span className="font-black text-xs sm:text-sm text-teal-950 bg-amber-100 px-3.5 py-1.5 rounded-2xl border border-amber-300">
                    ⭐ النقاط: {quizScore}
                  </span>

                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-3.5 py-1.5 bg-white text-teal-900 hover:bg-teal-100 rounded-xl font-extrabold text-xs flex items-center gap-1 border border-teal-200 shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>سؤال جديد 🔄</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl text-center flex flex-col items-center gap-4 shadow-xs border border-teal-200">
                <h3 className="font-black text-2xl text-teal-950">{quizQuestion.promptText}</h3>

                {quizQuestion.displayWord && (
                  <span className="text-5xl font-black text-teal-600 tracking-widest my-2">
                    {isSubmitted && isCorrect && quizQuestion.fullWordInfo ? quizQuestion.fullWordInfo : quizQuestion.displayWord}
                  </span>
                )}

                {quizQuestion.imageEmoji && (
                  <span className="text-7xl animate-bounce my-2">{quizQuestion.imageEmoji}</span>
                )}

                {quizQuestion.letterTarget && (
                  <span className="text-6xl font-black text-white bg-teal-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xs my-2">
                    {quizQuestion.letterTarget}
                  </span>
                )}

                {(quizQuestion.audioUrl || quizQuestion.audioSpeech) && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      if (quizQuestion.audioUrl) {
                        alphabetAudio.playAudioUrl(quizQuestion.audioUrl);
                      } else if (quizQuestion.audioSpeech) {
                        soundManager.speakArabic(quizQuestion.audioSpeech);
                      }
                    }}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-base flex items-center gap-2 shadow-xs active:scale-95"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span>استمع للصوت 🔊</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quizQuestion.options.map((option, idx) => {
                  const isThisSelected = selectedOption === option;
                  let btnStyle = 'bg-white hover:bg-teal-100/50 text-teal-950 border-2 border-teal-200';

                  if (isSubmitted) {
                    if (option === quizQuestion.correctAnswer) {
                      btnStyle = 'bg-teal-600 text-white border-2 border-teal-700 scale-105 shadow-xs';
                    } else if (isThisSelected) {
                      btnStyle = 'bg-rose-400 text-white border-2 border-rose-500';
                    } else {
                      btnStyle = 'bg-teal-50 text-teal-400 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => handleQuizOptionClick(option)}
                      className={`py-4 px-6 rounded-2xl font-black text-2xl flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isSubmitted && option === quizQuestion.correctAnswer && <span>✅</span>}
                      {isSubmitted && isThisSelected && !isCorrect && <span>❌</span>}
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <div className="flex flex-col items-center gap-4 mt-2">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={`p-4 rounded-2xl text-center font-black text-lg w-full ${
                      isCorrect ? 'bg-teal-100 text-teal-950 border border-teal-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {isCorrect ? (
                      <span>🌟 أحسنت! إجابة صحيحة! 🎉</span>
                    ) : (
                      <span>💡 الإجابة الصحيحة هي: <strong className="text-2xl underline px-2">{quizQuestion.correctAnswer}</strong> — حاول مرة أخرى!</span>
                    )}
                  </motion.div>

                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-8 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-base flex items-center gap-2 shadow-xs active:scale-95"
                  >
                    <span>السؤال التالي ➡️</span>
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default AlphabetHub;
