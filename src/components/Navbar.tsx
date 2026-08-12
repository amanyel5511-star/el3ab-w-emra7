import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Star, Settings, Home, Gamepad2, BookOpen, Compass, Award, Hash } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { AppTab } from '../types';

interface Props {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  totalStars: number;
  level: string;
  kidName?: string;
  kidAvatar?: string;
  kidPhoto?: string;
  progressPercent?: number;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  totalStars,
  level,
  kidName = 'بطل التعلم الصغير 🎈',
  kidAvatar = '🧒',
  kidPhoto,
  progressPercent = 65,
  onOpenSettings
}) => {
  const navItems: {
    id: AppTab;
    title: string;
    icon: string;
    lucideIcon: React.ReactNode;
  }[] = [
    { id: 'home', title: 'الرئيسية', icon: '🏠', lucideIcon: <Home className="w-5 h-5" /> },
    { id: 'alphabet', title: 'الحروف', icon: '🔤', lucideIcon: <BookOpen className="w-5 h-5" /> },
    { id: 'numbers', title: 'الأرقام', icon: '🔢', lucideIcon: <Hash className="w-5 h-5" /> },
    { id: 'games', title: 'الألعاب', icon: '🎮', lucideIcon: <Gamepad2 className="w-5 h-5" /> },
    { id: 'adventure', title: 'المغامرة', icon: '🗺️', lucideIcon: <Compass className="w-5 h-5" /> },
    { id: 'achievements', title: 'الإنجازات', icon: '🏆', lucideIcon: <Award className="w-5 h-5" /> },
  ];

  const handleTabClick = (tabId: AppTab) => {
    soundManager.playClick();
    onSelectTab(tabId);
  };

  return (
    <header className="w-full bg-teal-50/90 backdrop-blur-md border-b-4 border-teal-200 sticky top-0 z-50 shadow-xs dir-rtl" dir="rtl">
      
      {/* Decorative Floating Clouds & Stars */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute top-1 right-8 text-xl opacity-50 pointer-events-none select-none animate-float">☁️</div>
        <div className="absolute top-2 left-12 text-xl opacity-50 pointer-events-none select-none animate-float" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute top-3 left-1/3 text-lg opacity-60 pointer-events-none select-none animate-star">✨</div>

        {/* Top Header Bar: Logo & Kid Profile Badge */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 w-full">
          
          {/* Logo & Brand */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-2 sm:gap-3 text-right group focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-tr from-teal-600 via-teal-500 to-teal-400 rounded-xl sm:rounded-2xl border-2 sm:border-3 border-teal-300 shadow-xs flex items-center justify-center text-xl sm:text-3xl group-hover:rotate-6 transition-transform text-white shrink-0">
              🎈
            </div>
            <div className="flex flex-col text-right">
              <h1 className="font-black text-lg sm:text-3xl text-teal-950 leading-tight flex items-center gap-1">
                <span>🎈 ألعب وأمرح</span>
                <Sparkles className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-teal-500 fill-teal-400 animate-pulse" />
              </h1>
              <span className="font-bold text-[10px] sm:text-xs text-teal-700 -mt-0.5 hidden xs:block">
                كتاب تفاعلي للأطفال
              </span>
            </div>
          </motion.button>

          {/* Kid Profile Badge Card + Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { soundManager.playClick(); onOpenSettings?.(); }}
              className="bg-white hover:bg-teal-100/60 p-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl border-2 border-teal-200 shadow-xs flex items-center gap-1.5 sm:gap-2.5 text-right focus:outline-none transition-colors"
              title="اضغط لتغيير الاسم أو الصورة الشخصية"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-lg sm:rounded-xl border border-teal-300 flex items-center justify-center text-base sm:text-xl shadow-inner shrink-0 overflow-hidden">
                {kidPhoto ? (
                  <img src={kidPhoto} alt="طفلنا" className="w-full h-full object-cover" />
                ) : (
                  <span>{kidAvatar}</span>
                )}
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-black text-[11px] sm:text-sm text-teal-950 truncate max-w-[65px] xs:max-w-[90px] sm:max-w-[120px]">
                    {kidName}
                  </span>
                  <span className="font-extrabold text-[9px] sm:text-[10px] bg-teal-100 text-teal-900 px-1 py-0.5 rounded-md shrink-0 border border-teal-200 hidden sm:inline">
                    🏆 {level}
                  </span>
                </div>

                {/* Progress & Stars */}
                <div className="flex items-center gap-1">
                  <div className="w-10 sm:w-20 bg-teal-100 h-2 sm:h-2.5 rounded-full overflow-hidden hidden xs:block">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(12, progressPercent))}%` }}
                    />
                  </div>

                  <div className="bg-amber-400 px-1.5 py-0.5 rounded-md sm:rounded-lg font-black text-[10px] sm:text-xs text-slate-900 flex items-center gap-0.5 shadow-xs shrink-0">
                    <span>⭐</span>
                    <span>{totalStars}</span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Quick Settings Icon */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => { soundManager.playClick(); onOpenSettings?.(); }}
              className="w-8 h-8 sm:w-11 sm:h-11 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-xl sm:rounded-2xl border-2 border-teal-200 flex items-center justify-center shadow-xs shrink-0"
              title="إعدادات الملف والتنبيهات"
              aria-label="الإعدادات"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </motion.button>
          </div>

        </div>

        {/* Desktop Navbar Row */}
        <nav className="hidden md:flex items-center justify-center gap-2 pt-1">
          {navItems.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => handleTabClick(item.id)}
                className={`relative px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs ${
                  isSelected 
                    ? 'bg-teal-700 text-white shadow-md ring-2 ring-teal-300 scale-105' 
                    : 'bg-white hover:bg-teal-100/80 text-teal-900 border border-teal-200/90'
                }`}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                <span>{item.title}</span>

                {isSelected && (
                  <motion.span
                    layoutId="activeTabBadge"
                    className="absolute -top-1 -right-1 w-3 h-3 bg-teal-300 rounded-full border-2 border-teal-800 animate-pulse"
                  />
                )}
              </motion.button>
            );
          })}

          {/* Settings Gear Icon next to Achievements */}
          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => { soundManager.playClick(); onOpenSettings?.(); }}
            className="px-3 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 bg-white hover:bg-teal-100 text-teal-900 border border-teal-200/90 shadow-xs transition-all"
            title="الإعدادات ⚙️"
            aria-label="الإعدادات"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            <span className="hidden lg:inline">الإعدادات</span>
          </motion.button>
        </nav>

      </div>

      {/* Mobile Bottom Sticky Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-teal-200 px-2 py-1.5 flex items-center justify-around gap-1 shadow-lg overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const isSelected = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleTabClick(item.id)}
              className={`p-2 rounded-2xl font-extrabold text-[11px] flex flex-col items-center gap-0.5 whitespace-nowrap min-w-[48px] transition-all ${
                isSelected 
                  ? 'bg-teal-700 text-white shadow-xs font-black' 
                  : 'bg-transparent text-teal-800'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="leading-tight text-[10px]">{item.title}</span>
            </motion.button>
          );
        })}

        {/* Mobile Settings Gear Icon Button next to Achievements */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => { soundManager.playClick(); onOpenSettings?.(); }}
          className="p-2 rounded-2xl font-extrabold text-[11px] flex flex-col items-center gap-0.5 whitespace-nowrap min-w-[48px] bg-teal-50 text-teal-800 border border-teal-200 shrink-0"
          title="الإعدادات"
        >
          <Settings className="w-5 h-5 stroke-[2.5]" />
          <span className="leading-tight text-[10px]">الإعدادات</span>
        </motion.button>
      </div>

    </header>
  );
};

export default Navbar;
