import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Bell, Check, User, Upload, Trash2, Volume2 } from 'lucide-react';
import { KidProfile } from '../types';
import { soundManager } from '../utils/sound';
import { bgMusicManager } from '../utils/bgMusicManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: KidProfile;
  onUpdateProfile: (updated: Partial<KidProfile>) => void;
}

export const ProfileAndSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'music' | 'notifications'>('profile');
  const [nameInput, setNameInput] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [customPhoto, setCustomPhoto] = useState<string | undefined>(profile.customPhoto);
  const [notifEnabled, setNotifEnabled] = useState(profile.notificationSettings?.enabled ?? true);
  const [notifInactivity, setNotifInactivity] = useState(profile.notificationSettings?.notifyOnInactivity ?? true);

  const [bgMusicOn, setBgMusicOn] = useState<boolean>(() => bgMusicManager.isEnabled());
  const [bgMusicVol, setBgMusicVol] = useState<number>(() => bgMusicManager.getVolume());
  const [sfxOn, setSfxOn] = useState<boolean>(() => soundManager.soundEnabled);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cartoonAvatars = ['👦', '👧', '🦁', '🐰', '🐼', '🦊', '🐱', '🦅', '🦕', '🦄', '🚀', '🤖', '🦸', '👑'];

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomPhoto(result);
        soundManager.playSuccess();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setCustomPhoto(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    soundManager.playClick();
  };

  const handleSave = () => {
    soundManager.playSuccess();
    onUpdateProfile({
      name: nameInput.trim() || 'بطل التعلم الصغير 🎈',
      avatar: selectedAvatar,
      customPhoto: customPhoto,
      notificationSettings: {
        enabled: notifEnabled,
        reminderTime: 'auto',
        notifyOnInactivity: notifInactivity
      }
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm dir-rtl" dir="rtl">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[32px] border-4 border-amber-100 p-6 sm:p-8 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={() => { soundManager.playClick(); onClose(); }}
            className="absolute top-4 left-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black flex items-center justify-center shadow-xs active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Banner */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-300 rounded-2xl flex items-center justify-center text-2xl shadow-xs">
              ⚙️
            </div>
            <div>
              <h2 className="font-black text-2xl sm:text-3xl text-slate-800">ملف الطفل والإعدادات</h2>
              <p className="font-bold text-xs sm:text-sm text-slate-500">تعديل اسم الطفل والشخصية والصوت والإشعارات</p>
            </div>
          </div>

          {/* Subtabs Selector */}
          <div className="flex items-center gap-1.5 mb-6 bg-amber-50 p-1.5 rounded-2xl border border-amber-100">
            <button
              onClick={() => { soundManager.playClick(); setActiveSubTab('profile'); }}
              className={`flex-1 py-2 px-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                activeSubTab === 'profile' ? 'bg-amber-300 text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-amber-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>الشخصية</span>
            </button>

            <button
              onClick={() => { soundManager.playClick(); setActiveSubTab('music'); }}
              className={`flex-1 py-2 px-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                activeSubTab === 'music' ? 'bg-amber-300 text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-amber-100'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>الصوت 🔊</span>
            </button>

            <button
              onClick={() => { soundManager.playClick(); setActiveSubTab('notifications'); }}
              className={`flex-1 py-2 px-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                activeSubTab === 'notifications' ? 'bg-amber-300 text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-amber-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>الإشعارات 📱</span>
            </button>
          </div>

          {/* TAB 1: Profile & Character Settings */}
          {activeSubTab === 'profile' && (
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col items-center gap-3 bg-amber-50 p-5 rounded-3xl border border-amber-100 shadow-xs">
                <div className="relative">
                  <div className="w-28 h-28 bg-amber-300 rounded-full flex items-center justify-center text-6xl shadow-md overflow-hidden">
                    {customPhoto ? (
                      <img src={customPhoto} alt="صورة الطفل" className="w-full h-full object-cover" />
                    ) : (
                      <span>{selectedAvatar}</span>
                    )}
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-400 text-slate-900 rounded-full flex items-center justify-center shadow-xs active:scale-90"
                    title="تحميل صورة من الجهاز"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-900 rounded-xl font-black text-xs flex items-center gap-2 shadow-xs active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>تحميل صورة شخصية</span>
                  </button>

                  {customPhoto && (
                    <button
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 bg-rose-400 hover:bg-rose-500 text-white rounded-xl font-black text-xs flex items-center gap-1 shadow-xs active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-black text-sm text-slate-800 flex items-center gap-1">
                  <span>اسم الطفل أو البطل الصغير:</span>
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="اكتب اسم الطفل هنا..."
                  className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 font-black text-lg text-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-black text-sm text-slate-800">اختر الشخصية الكرتونية المفضلة:</label>
                <div className="grid grid-cols-7 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {cartoonAvatars.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedAvatar(av);
                        setCustomPhoto(undefined);
                      }}
                      className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center transition-transform active:scale-90 ${
                        selectedAvatar === av && !customPhoto
                          ? 'bg-amber-300 scale-110 shadow-xs'
                          : 'bg-white hover:bg-amber-50 border border-slate-200'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Sound & Background Music Settings */}
          {activeSubTab === 'music' && (
            <div className="flex flex-col gap-5">
              
              <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 flex items-start gap-3">
                <div className="w-12 h-12 bg-emerald-200 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                  🎵
                </div>
                <div className="flex flex-col text-right">
                  <h4 className="font-black text-base text-slate-800">🔊 الصوت والموسيقى</h4>
                  <p className="font-bold text-xs text-slate-600 leading-relaxed mt-0.5">
                    تحكم في تشغيل موسيقى الخلفية الهادئة ومستوى الصوت والأصوات التفاعلية للألعاب.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col text-right">
                  <span className="font-black text-base text-slate-800">
                    🎵 موسيقى مرحة للتعلم
                  </span>
                  <span className="font-bold text-xs text-slate-500 mt-1">
                    نغمات بسيطة وناعمة بدون غناء تعمل في الخلفية
                  </span>
                </div>

                <button
                  onClick={() => {
                    const next = !bgMusicOn;
                    setBgMusicOn(next);
                    bgMusicManager.setEnabled(next);
                    soundManager.playClick();
                  }}
                  className={`px-5 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 ${
                    bgMusicOn ? 'bg-emerald-400 text-slate-900' : 'bg-rose-400 text-white'
                  }`}
                >
                  {bgMusicOn ? <span>🟢 الموسيقى: تشغيل</span> : <span>🔴 الموسيقى: إيقاف</span>}
                </button>
              </div>

              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-800">
                    🔉 مستوى صوت الموسيقى
                  </span>
                  <span className="font-black text-sm bg-amber-300 px-3 py-1 rounded-xl">
                    {Math.round(bgMusicVol * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">🔈</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgMusicVol}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setBgMusicVol(val);
                      bgMusicManager.setVolume(val);
                    }}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-2xl select-none">🔊</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex flex-col text-right">
                  <span className="font-black text-sm sm:text-base text-slate-800">🔊 الأصوات التفاعلية ونطق الحروف</span>
                  <span className="font-bold text-xs text-slate-500 mt-0.5">نطق الكلمات الحروف والمؤثرات الصوتية</span>
                </div>
                <button
                  onClick={() => {
                    const res = soundManager.toggleMute();
                    setSfxOn(res);
                  }}
                  className={`w-14 h-8 rounded-full p-1 transition-colors relative shadow-xs ${
                    sfxOn ? 'bg-emerald-400' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      sfxOn ? 'translate-x-[-22px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: Android Notifications Settings */}
          {activeSubTab === 'notifications' && (
            <div className="flex flex-col gap-5">
              
              <div className="bg-sky-50 p-4 rounded-3xl border border-sky-100 flex items-start gap-3">
                <div className="w-12 h-12 bg-sky-200 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                  📱
                </div>
                <div className="flex flex-col text-right">
                  <h4 className="font-black text-base text-slate-800">تطبيق أندرويد وتنبيهات الغياب 🔔</h4>
                  <p className="font-bold text-xs text-slate-600 leading-relaxed mt-0.5">
                    يقوم هذا القسم بإرسال إشعارات وتنبيهات يومية للطفل في حال توقفه أو غيابه عن اللعب والتعلم.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-black text-sm text-slate-800">تفعيل إشعارات التذكير اليومية 🔔</span>
                  <span className="font-bold text-xs text-slate-500">تلقي إشعارات يومية</span>
                </div>
                <button
                  onClick={() => { soundManager.playClick(); setNotifEnabled(!notifEnabled); }}
                  className={`w-14 h-8 rounded-full p-1 transition-colors relative shadow-xs ${
                    notifEnabled ? 'bg-emerald-400' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      notifEnabled ? 'translate-x-[-22px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-black text-sm text-slate-800">تنبيه الغياب والتوقف 📅</span>
                  <span className="font-bold text-xs text-slate-500">إرسال إشعار تشجيعي عند الغياب</span>
                </div>
                <button
                  onClick={() => { soundManager.playClick(); setNotifInactivity(!notifInactivity); }}
                  className={`w-14 h-8 rounded-full p-1 transition-colors relative shadow-xs ${
                    notifInactivity ? 'bg-emerald-400' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      notifInactivity ? 'translate-x-[-22px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>
          )}

          {/* Save Action Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              onClick={() => { soundManager.playClick(); onClose(); }}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm shadow-xs"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-2xl font-black text-base flex items-center gap-2 shadow-md active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>حفظ التعديلات ✨</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileAndSettingsModal;
