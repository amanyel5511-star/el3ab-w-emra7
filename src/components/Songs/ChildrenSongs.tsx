import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Plus, Trash2, Volume2, X, Check, Upload, FileAudio, Save } from 'lucide-react';
import { SongItem } from '../../types';
import { soundManager } from '../../utils/sound';
import { songMusicEngine } from '../../utils/songMusicEngine';

interface Props {
  songs: SongItem[];
  onAddSong: (song: SongItem) => void;
  onDeleteSong: (id: string) => void;
}

export const ChildrenSongs: React.FC<Props> = ({ songs, onAddSong, onDeleteSong }) => {
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0); // 0 to 100%
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<any>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  // Expanded lyrics song ID
  const [expandedLyricsId, setExpandedLyricsId] = useState<string | null>(null);

  // New Song Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newEmoji, setNewEmoji] = useState<string>('🎵');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileAudioData, setFileAudioData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const emojiOptions = ['🕷️', '🎵', '🎈', '🐣', '🦁', '🐱', '🍎', '⭐', '🚀', '🎨', '🌸', '🎶', '📻', '🎸'];

  const categoriesList = [
    'الكل',
    'أغاني مصرية تراثية',
    'أغاني حركية ومرحة',
    'أغاني الحيوانات والطبيعة',
    'أغاني تعليمية',
    'أغاني التشجيع والسلوك'
  ];

  const filteredSongs = selectedCategory === 'الكل'
    ? songs
    : songs.filter(s => s.category === selectedCategory);

  // Handle Play / Pause
  const togglePlaySong = (song: SongItem) => {
    soundManager.playClick();

    if (playingSongId === song.id) {
      songMusicEngine.stopAll();
      setPlayingSongId(null);
      setProgress(0);
    } else {
      songMusicEngine.stopAll();
      setPlayingSongId(song.id);
      setProgress(0);

      songMusicEngine.playSong(
        song,
        (currentProgress) => {
          setProgress(currentProgress);
        },
        () => {
          setPlayingSongId(null);
          setProgress(0);
        }
      );
    }
  };

  useEffect(() => {
    return () => {
      songMusicEngine.stopAll();
    };
  }, []);

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      // Auto fill title if empty
      if (!newTitle.trim()) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setNewTitle(nameWithoutExt);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFileAudioData(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    soundManager.playSuccess();
    const newSong: SongItem = {
      id: `song-${Date.now()}`,
      title: newTitle.trim(),
      coverEmoji: newEmoji,
      audioUrl: fileAudioData || undefined,
      isDefault: false
    };

    onAddSong(newSong);
    setNewTitle('');
    setNewEmoji('🎵');
    setSelectedFileName(null);
    setFileAudioData('');
    setIsAddModalOpen(false);
    soundManager.speakArabic('تمت إضافة الأغنية بنجاح! 🎉');
  };

  const confirmDelete = () => {
    if (deletingSongId) {
      soundManager.playClick();
      onDeleteSong(deletingSongId);
      if (playingSongId === deletingSongId) {
        if (audioRef.current) audioRef.current.pause();
        setPlayingSongId(null);
      }
      setDeletingSongId(null);
      soundManager.speakArabic('تم حذف الأغنية');
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-12 select-none">
      
      {/* Header Banner */}
      <div className="bg-teal-600 p-6 sm:p-8 rounded-[36px] border-4 border-teal-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-white">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl border-2 border-teal-200 flex items-center justify-center text-4xl shadow-xs animate-bounce text-teal-900">
            🎵
          </div>
          <div>
            <h2 className="font-black text-3xl sm:text-4xl text-white">أغاني الأطفال المصرية 🎶</h2>
            <p className="font-bold text-teal-100 text-sm mt-1">
              استمع لأجمل الأغاني والأناشيد التراثية والتعليمية للأطفال بدون حقوق نشر 🇪🇬
            </p>
          </div>
        </div>

        {/* Add Song Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            setNewTitle('');
            setSelectedFileName(null);
            setFileAudioData('');
            setIsAddModalOpen(true);
          }}
          className="px-6 py-3 bg-teal-800 hover:bg-teal-700 text-white rounded-2xl border-2 border-teal-400 font-black text-sm sm:text-base flex items-center gap-2 shadow-xs active:scale-95 shrink-0"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
          <span>إضافة أغنية جديدة 📁</span>
        </button>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {categoriesList.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-4 py-2.5 rounded-2xl border-2 border-teal-200 font-black text-sm whitespace-nowrap shadow-xs transition-transform active:scale-95 ${
                isSelected
                  ? 'bg-teal-700 text-white scale-105'
                  : 'bg-white text-teal-950 hover:bg-teal-100'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Songs Cards Grid */}
      {filteredSongs.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border-4 border-teal-200 text-center shadow-sm">
          <span className="text-5xl">🎵</span>
          <p className="font-black text-xl text-teal-950 mt-2">لا توجد أغاني في هذا القسم حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSongs.map((song) => {
            const isPlaying = playingSongId === song.id;
            const isLyricsExpanded = expandedLyricsId === song.id;

            return (
              <motion.div
                key={song.id}
                whileHover={{ y: -4 }}
                className={`bg-white rounded-3xl border-4 border-teal-200 p-6 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden transition-all ${
                  isPlaying ? 'ring-4 ring-teal-400 bg-teal-50/50' : ''
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-16 h-16 bg-teal-100 rounded-2xl border-2 border-teal-200 flex items-center justify-center text-3xl shadow-xs shrink-0 text-teal-900">
                    {song.coverEmoji}
                  </div>

                  <div className="flex-1 text-right">
                    <h3 className="font-black text-xl text-teal-950 line-clamp-1">{song.title}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      <span className="text-[11px] font-black bg-teal-100 text-teal-900 px-2 py-0.5 rounded-lg border border-teal-200">
                        بدون حقوق نشر 🇪🇬
                      </span>
                      {song.category && (
                        <span className="text-[11px] font-bold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-lg border border-teal-200">
                          {song.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => { soundManager.playClick(); setDeletingSongId(song.id); }}
                    title="حذف الأغنية"
                    className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl border border-rose-300 shadow-xs active:scale-95 shrink-0"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Lyrics Summary Preview */}
                {song.lyricsSummary && (
                  <div className="bg-teal-50 p-3 rounded-2xl border border-teal-200 text-right">
                    <p className="font-bold text-xs text-teal-950 leading-relaxed">
                      💬 {song.lyricsSummary}
                    </p>
                  </div>
                )}

                {/* Lyrics Toggle & Lyrics View */}
                {song.lyrics && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setExpandedLyricsId(isLyricsExpanded ? null : song.id);
                      }}
                      className="text-xs font-black text-teal-700 hover:text-teal-900 underline flex items-center gap-1 justify-end"
                    >
                      <span>{isLyricsExpanded ? 'إخفاء كلمات الأغنية 📜' : 'عرض كلمات الأغنية الكاملة 📜'}</span>
                    </button>

                    <AnimatePresence>
                      {isLyricsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-teal-50 p-3.5 rounded-2xl border border-teal-200 text-right whitespace-pre-line font-bold text-xs text-teal-950 leading-relaxed shadow-xs"
                        >
                          {song.lyrics}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="w-full h-3.5 bg-teal-50 rounded-full border border-teal-200 overflow-hidden p-0.5">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-200"
                      style={{ width: isPlaying ? `${progress}%` : '0%' }}
                    />
                  </div>
                </div>

                {/* Action Play/Pause Control */}
                <button
                  onClick={() => togglePlaySong(song)}
                  className={`w-full py-3 rounded-2xl border border-teal-300 font-black text-base flex items-center justify-center gap-2 shadow-xs active:scale-95 ${
                    isPlaying ? 'bg-rose-500 text-white' : 'bg-teal-600 text-white hover:bg-teal-500'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-white stroke-[2]" />
                      <span>إيقاف الأغنية ⏸️</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-white stroke-[2]" />
                      <span>تشغيل الأغنية ▶️</span>
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Song Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl border-4 border-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b-3 border-black pb-3">
                <h3 className="font-black text-xl text-black flex items-center gap-2">
                  <span>➕</span>
                  <span>إضافة أغنية من جهازك</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg border-2 border-black font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSong} className="flex flex-col gap-4">
                
                {/* Save Song Button AT THE TOP */}
                <div className="flex items-center gap-2 bg-[#FFFBEB] p-2.5 rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4ADE80] hover:bg-emerald-400 text-black rounded-xl border-3 border-black font-black text-base flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <Save className="w-5 h-5 stroke-[2.5]" />
                    <span>حفظ الأغنية 💾</span>
                  </button>
                </div>

                {/* File Upload Section */}
                <div className="flex flex-col gap-2 text-right">
                  <label className="font-black text-sm text-black">اختر الملف الصوتي من جهازك (MP3, WAV, M4A, OGG):</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 bg-sky-50 hover:bg-sky-100 border-3 border-dashed border-sky-400 rounded-2xl font-black text-sm text-sky-800 flex flex-col items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <Upload className="w-8 h-8 text-sky-600 stroke-[2.5] animate-bounce" />
                    <span>اضغط هنا لاختيار ملف صوتي من الجهاز 🎵</span>
                    <span className="text-xs text-slate-500 font-normal">يدعم جميع صيغ الصوت</span>
                  </button>

                  {selectedFileName && (
                    <div className="flex items-center gap-2 bg-[#4ADE80]/20 p-3 rounded-xl border-2 border-black text-emerald-900 font-bold text-xs">
                      <FileAudio className="w-5 h-5 text-emerald-700 shrink-0" />
                      <span className="truncate flex-1">تم اختيار: {selectedFileName}</span>
                      <Check className="w-4 h-4 text-emerald-700" />
                    </div>
                  )}
                </div>

                {/* Song Title Input */}
                <div className="flex flex-col gap-1 text-right">
                  <label className="font-black text-sm text-black">اسم الأغنية:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أغنية ماما زمانها جاية"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="p-3 bg-slate-50 rounded-xl border-3 border-black font-bold text-sm text-black focus:outline-none focus:bg-amber-50"
                  />
                </div>

                {/* Choose Icon Emoji */}
                <div className="flex flex-col gap-1 text-right">
                  <label className="font-black text-sm text-black">صورة الغلاف (رمز تعبيري):</label>
                  <div className="flex items-center gap-2 flex-wrap bg-amber-50 p-2.5 rounded-xl border-2 border-black">
                    {emojiOptions.map((emo) => (
                      <button
                        type="button"
                        key={emo}
                        onClick={() => setNewEmoji(emo)}
                        className={`w-9 h-9 rounded-lg border-2 border-black text-xl flex items-center justify-center ${
                          newEmoji === emo ? 'bg-[#FFD93D] scale-110' : 'bg-white'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-black rounded-xl border-3 border-black font-black text-sm"
                  >
                    إلغاء ❌
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingSongId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col text-center gap-4"
            >
              <span className="text-5xl">🗑️</span>
              <h3 className="font-black text-2xl text-black">هل تريد حذف الأغنية؟</h3>
              <p className="font-bold text-slate-800 text-xs">سيتم حذف هذه الأغنية بشكل نهائي من قائمة الأغاني.</p>

              <div className="flex items-center gap-3 justify-center mt-2">
                <button
                  onClick={() => setDeletingSongId(null)}
                  className="px-5 py-2.5 bg-slate-200 text-black rounded-2xl border-3 border-black font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  ❌ إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-5 py-2.5 bg-[#FF6B6B] text-black rounded-2xl border-3 border-black font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  ✅ حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
