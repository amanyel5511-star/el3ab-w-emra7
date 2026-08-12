import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Star, Play, ArrowLeft, User, Heart, Gamepad2, BookOpen, Hash, Compass, Award } from 'lucide-react';
import { KidProfile, AppTab } from '../types';
import { soundManager } from '../utils/sound';

interface Props {
  profile: KidProfile;
  onUpdateProfile: (updated: Partial<KidProfile>) => void;
  onSelectTab: (tab: AppTab) => void;
  onOpenSettings?: () => void;
}

export const HomeScreen: React.FC<Props> = ({ profile, onUpdateProfile, onSelectTab, onOpenSettings }) => {
  const avatars = ['👦', '👧', '🦁', '🐰', '🐼', '🦊', '🐱', '🦄', '🚀', '🤖', '🦸', '👑'];

  const sectionsList: {
    id: AppTab;
    title: string;
    subtitle: string;
    icon: string;
    badgeText: string;
  }[] = [
    {
      id: 'alphabet',
      title: 'الحروف العربية 🔤',
      subtitle: 'تعلم 28 حرفاً مع النطق، التتبع، والكلمات التفاعلية بصوت واضح!',
      icon: '🔤',
      badgeText: '28 حرفاً 📚',
    },
    {
      id: 'numbers',
      title: 'الأرقام والرياضيات 🔢',
      subtitle: 'تعلم الأرقام ٠ - ١٠ مع العد الممتع ومسائل الجمع والطرح اللطيفة!',
      icon: '🔢',
      badgeText: 'الأرقام ٠-١٠ 🧮',
    },
    {
      id: 'games',
      title: 'الألعاب والذكاء 🎮',
      subtitle: '20 لعبة تفاعلية مشوقة للذاكرة، الذكاء، الحساب، وسرعة البديهة!',
      icon: '🎮',
      badgeText: '20 لعبة 🏆',
    },
    {
      id: 'adventure',
      title: 'مغامرة الأبطال 🗺️',
      subtitle: '30 مرحلة متتالية تفتح تدريجياً مع خريطة تفاعلية وألغاز وتحديات!',
      icon: '🗺️',
      badgeText: '30 مرحلة 🏆',
    },
    {
      id: 'achievements',
      title: 'إنجازاتي اليومية 🌟',
      subtitle: 'جدول العادات اليومية الصالحة: الصلاة، القرآن، الرياضة، والنظافة!',
      icon: '🌟',
      badgeText: 'مهام يومية 👑',
    }
  ];

  return (
    <div className="w-full flex flex-col gap-8 pb-16 select-none dir-rtl" dir="rtl">
      
      {/* Playful Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-100 via-teal-50 to-teal-100 rounded-[36px] sm:rounded-[48px] p-6 sm:p-10 shadow-xl shadow-teal-100/50 border-4 border-teal-300 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Floating Background Stars & Clouds */}
        <div className="absolute top-3 left-6 text-2xl opacity-50 animate-float pointer-events-none">☁️</div>
        <div className="absolute bottom-4 right-12 text-2xl opacity-50 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}>🎈</div>

        <div className="flex flex-col gap-4 text-center md:text-right max-w-xl z-10">
          
          {/* Cartoon Mascot Guide Speech Bubble */}
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-teal-300 shadow-xs self-center md:self-start">
            <div className="w-12 h-12 bg-teal-200 text-teal-900 rounded-full flex items-center justify-center text-3xl shrink-0 animate-wiggle">
              🐰
            </div>
            <div className="flex flex-col text-right">
              <span className="font-black text-xs text-teal-900">مرشدك سمسم 🐰:</span>
              <p className="font-bold text-xs sm:text-sm text-teal-950">
                مرحبًا يا بطل! 👋 تعال لنلعب ونتعلم معًا أمتع الأنشطة!
              </p>
            </div>
          </div>

          <h1 className="font-black text-3xl sm:text-5xl text-teal-950 leading-tight">
            🎈 ألعب وأمرح
            <span className="block text-xl sm:text-2xl text-teal-800 font-extrabold mt-1">
              كتاب تفاعلي للأطفال
            </span>
          </h1>

          <p className="font-bold text-teal-900/90 text-sm sm:text-base leading-relaxed">
            عالم كامل مليء بألعاب الذكاء والذاكرة، الحروف الناطقة، والأرقام التفاعلية!
          </p>

          <div className="flex items-center justify-center md:justify-start gap-3 mt-1 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { soundManager.playClick(); onSelectTab('games'); }}
              className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-base flex items-center gap-2 shadow-md border-2 border-teal-400"
            >
              <Play className="w-5 h-5 fill-white stroke-[2]" />
              <span>أبدأ رحلة اللعب والتعلم 🎮</span>
            </motion.button>
          </div>
        </div>

        {/* Kid Profile Badge Card */}
        <div className="bg-white p-6 rounded-[32px] border-4 border-teal-200 shadow-lg flex flex-col items-center text-center gap-3 w-full md:w-auto min-w-[270px] relative">
          <div className="relative">
            <div className="w-22 h-22 bg-teal-100 rounded-full border-4 border-teal-300 flex items-center justify-center text-5xl shadow-md overflow-hidden">
              {profile.customPhoto ? (
                <img src={profile.customPhoto} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile.avatar}</span>
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 font-black text-xs px-2 py-0.5 rounded-full border border-white shadow-xs">
              ⭐
            </span>
          </div>

          <div className="flex flex-col">
            <h3 className="font-black text-xl text-teal-950">{profile.name}</h3>
            <span className="font-extrabold text-xs bg-teal-100 text-teal-900 px-3 py-1 rounded-full mt-1 border border-teal-200">
              🏆 {profile.level}
            </span>
          </div>

          <div className="w-full flex items-center justify-around bg-teal-50/80 p-3 rounded-2xl border border-teal-200">
            <div className="flex flex-col items-center">
              <span className="font-black text-base text-amber-500">⭐ {profile.totalStars}</span>
              <span className="text-[11px] font-bold text-teal-800">النجوم</span>
            </div>
            <div className="h-7 w-0.5 bg-teal-200" />
            <div className="flex flex-col items-center">
              <span className="font-black text-base text-teal-800">🔥 {profile.streakDays}</span>
              <span className="text-[11px] font-bold text-teal-700">أيام متتالية</span>
            </div>
          </div>

          <button
            onClick={() => { soundManager.playClick(); onOpenSettings?.(); }}
            className="w-full py-2.5 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>تحديث اسم الطفل والصورة ⚙️</span>
          </button>

          {/* Avatar Quick Switcher */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center mt-0.5">
            <span className="text-[11px] font-bold text-teal-800 w-full">اختر شخصيتك:</span>
            {avatars.slice(0, 6).map((av) => (
              <button
                key={av}
                onClick={() => { soundManager.playClick(); onUpdateProfile({ avatar: av, customPhoto: undefined }); }}
                className={`w-7 h-7 rounded-xl border text-sm flex items-center justify-center transition-transform active:scale-90 ${
                  profile.avatar === av && !profile.customPhoto ? 'bg-teal-300 border-teal-400 scale-110 shadow-xs' : 'bg-teal-50/50 border-teal-200'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Activity Sections */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-black text-2xl sm:text-3xl text-teal-950 flex items-center gap-2">
            <span>📚</span>
            <span>أقسام كتاب الأنشطة التفاعلي:</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionsList.map((sec) => (
            <motion.div
              key={sec.id}
              whileHover={{ y: -6, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-[32px] border-4 border-teal-200 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-16 h-16 bg-teal-500 rounded-2xl border-2 border-teal-300 flex items-center justify-center text-3xl text-white shadow-sm">
                  {sec.icon}
                </div>
                <span className="px-3 py-1 font-black text-xs rounded-xl bg-teal-100 text-teal-900 border border-teal-200">
                  {sec.badgeText}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-right">
                <h3 className="font-black text-2xl text-teal-950">{sec.title}</h3>
                <p className="font-bold text-teal-800 text-xs sm:text-sm leading-relaxed">{sec.subtitle}</p>
              </div>

              <button
                onClick={() => { soundManager.playClick(); onSelectTab(sec.id); }}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
              >
                <span>دخول القسم 🚀</span>
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomeScreen;
