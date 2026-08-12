import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Plus, BarChart2 } from 'lucide-react';
import { KidProfile } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profiles: KidProfile[];
  activeProfile: KidProfile;
  onSelectProfile: (profile: KidProfile) => void;
  onCreateProfile: (name: string, age: number, avatar: string) => void;
}

const AVATARS = [
  { id: 'lion', icon: '🦁', name: 'الأسد الشجاع' },
  { id: 'bunny', icon: '🐰', name: 'الأرنب السريع' },
  { id: 'cat', icon: '🐱', name: 'القطة اللطيفة' },
  { id: 'bear', icon: '🐻', name: 'الدب المحبوب' },
  { id: 'fox', icon: '🦊', name: 'الثعلب الذكي' },
  { id: 'unicorn', icon: '🦄', name: 'الحصان السحري' },
];

export const ProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profiles,
  activeProfile,
  onSelectProfile,
  onCreateProfile
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState(5);
  const [newProfileAvatar, setNewProfileAvatar] = useState('lion');

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    soundManager.playSuccess();
    onCreateProfile(newProfileName.trim(), newProfileAge, newProfileAvatar);
    setIsCreating(false);
    setNewProfileName('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 select-none dir-rtl" dir="rtl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-xl max-h-[88vh] rounded-[32px] border-4 border-teal-200 p-6 shadow-xl flex flex-col gap-5 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-teal-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">👤</span>
              <h3 className="font-black text-2xl text-teal-950">ملف الطفل والتقدم</h3>
            </div>
            <button
              onClick={() => { soundManager.playClick(); onClose(); }}
              className="px-4 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-200 rounded-xl font-black text-sm shadow-xs"
            >
              إغلاق ✕
            </button>
          </div>

          {!isCreating ? (
            <div className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-2">
                <span className="font-black text-sm text-teal-950">اختر حساب الطفل الحالي:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profiles.map((p) => {
                    const isCurrent = p.id === activeProfile.id;
                    const avatarObj = AVATARS.find(a => a.id === p.avatar) || AVATARS[0];

                    return (
                      <button
                        key={p.id}
                        onClick={() => { soundManager.playClick(); onSelectProfile(p); }}
                        className={`p-3 rounded-2xl text-right flex items-center justify-between gap-3 transition-all shadow-xs active:scale-95 ${
                          isCurrent ? 'bg-teal-600 text-white font-black' : 'bg-white hover:bg-teal-50 text-teal-950 border border-teal-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{avatarObj.icon}</span>
                          <div>
                            <h4 className="font-black text-base">{p.name}</h4>
                            <span className={`text-xs font-bold ${isCurrent ? 'text-teal-100' : 'text-teal-800'}`}>العمر: {p.age} سنوات</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 font-black text-xs bg-white/90 text-teal-950 px-2.5 py-1 rounded-xl shadow-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{p.totalStars}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => { soundManager.playClick(); setIsCreating(true); }}
                  className="py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xs mt-1 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>إضافة طفل جديد</span>
                </button>
              </div>

              <div className="bg-teal-50 p-5 rounded-3xl border border-teal-200 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                  <h4 className="font-black text-lg text-teal-950 flex items-center gap-1.5">
                    <BarChart2 className="w-5 h-5 text-teal-700" />
                    <span>ملخص تقدم {activeProfile.name}:</span>
                  </h4>
                  <span className="px-3 py-1 bg-teal-100 text-teal-900 border border-teal-200 font-black text-xs rounded-xl">
                    مستوى: {activeProfile.level}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white rounded-2xl border border-teal-200">
                    <span className="font-black text-2xl text-teal-950">{activeProfile.totalStars}</span>
                    <p className="text-[11px] font-bold text-teal-800">النجوم المكتسبة ⭐</p>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-teal-200">
                    <span className="font-black text-2xl text-teal-950">{activeProfile.lettersLearned.length} / 28</span>
                    <p className="text-[11px] font-bold text-teal-800">حروف متقنة 🔤</p>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-teal-200">
                    <span className="font-black text-2xl text-teal-950">{activeProfile.gamesCompleted}</span>
                    <p className="text-[11px] font-bold text-teal-800">ألعاب مكتملة 🎮</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <h4 className="font-black text-xl text-teal-950">إنشاء ملف طفل جديد:</h4>

              <div className="flex flex-col gap-1 text-right">
                <label className="font-black text-sm text-teal-950">اسم الطفل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد، سارة..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="px-4 py-2.5 bg-teal-50/50 rounded-2xl border border-teal-200 font-black text-base text-teal-950 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex flex-col gap-1 text-right">
                <label className="font-black text-sm text-teal-950">العمر:</label>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={newProfileAge}
                  onChange={(e) => setNewProfileAge(Number(e.target.value))}
                  className="px-4 py-2.5 bg-teal-50/50 rounded-2xl border border-teal-200 font-black text-base text-teal-950 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="flex flex-col gap-1 text-right">
                <label className="font-black text-sm text-teal-950">اختر الشخصية الكرتونية المفضلة:</label>
                <div className="grid grid-cols-3 gap-2">
                  {AVATARS.map((a) => (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => { soundManager.playClick(); setNewProfileAvatar(a.id); }}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1 ${
                        newProfileAvatar === a.id ? 'bg-teal-600 text-white font-black border-teal-700 shadow-xs' : 'bg-white text-teal-950 border-teal-200'
                      }`}
                    >
                      <span className="text-3xl">{a.icon}</span>
                      <span className="text-xs font-black">{a.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-200 rounded-2xl font-black text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-sm shadow-xs active:scale-95"
                >
                  حفظ الحساب
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileModal;
