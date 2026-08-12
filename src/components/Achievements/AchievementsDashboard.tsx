import React, { useState } from 'react';
import { Star, CheckCircle2, Circle, Settings } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HABIT_CATEGORIES, HABIT_TASKS } from '../../data/habitsData';
import { soundManager } from '../../utils/sound';
import { KidProfile } from '../../types';

interface Props {
  profile: KidProfile;
  onUpdateProfile: (updated: Partial<KidProfile>) => void;
  onEarnStars: (amount: number, itemId?: string | number) => void;
  totalStars?: number;
  completedTaskIds?: Record<string, boolean>;
  onToggleTask?: (taskId: string, rewardStars: number) => void;
  userLevel?: string;
  onOpenSettings?: () => void;
}

export const AchievementsDashboard: React.FC<Props> = ({
  profile,
  onUpdateProfile,
  onEarnStars,
  onOpenSettings,
  totalStars: propStars,
  completedTaskIds: propTasks,
  onToggleTask: propToggleTask,
  userLevel: propLevel
}: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('prayer');

  const currentStars = propStars ?? profile?.totalStars ?? 0;
  const currentTasks = propTasks ?? profile?.completedTasks ?? {};
  const currentLevel = propLevel ?? profile?.level ?? 'نجم اليوم ⭐';

  const handleToggleTask = (taskId: string, rewardStars: number) => {
    if (propToggleTask) {
      propToggleTask(taskId, rewardStars);
      return;
    }

    const isDone = !!currentTasks[taskId];
    const updatedTasks = { ...currentTasks, [taskId]: !isDone };

    const starDiff = !isDone ? rewardStars : -rewardStars;
    const newTotalStars = Math.max(0, currentStars + starDiff);

    let newLevel = currentLevel;
    if (newTotalStars > 100) newLevel = 'بطل التعلم المذهل 🏆';
    else if (newTotalStars > 60) newLevel = 'النجم الذهبي ⭐';
    else if (newTotalStars > 30) newLevel = 'نجم اليوم ⭐';

    if (onUpdateProfile) {
      onUpdateProfile({
        completedTasks: updatedTasks,
        totalStars: newTotalStars,
        level: newLevel
      });
    }
  };

  const filteredTasks = HABIT_TASKS.filter(t => t.category === selectedCategory);
  const totalTasksCompletedCount = Object.values(currentTasks).filter(Boolean).length;

  return (
    <div className="w-full flex flex-col gap-6 pb-12 select-none dir-rtl" dir="rtl">
      
      {/* Level & Stars Banner */}
      <div className="bg-white p-6 rounded-[32px] border-4 border-teal-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-4 text-teal-950">
          <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center text-4xl shadow-xs shrink-0 animate-bounce">
            🏆
          </div>
          <div>
            <span className="px-3 py-1 bg-teal-100 text-teal-900 rounded-full font-black text-xs border border-teal-200">
              مستواك الحالي: {currentLevel}
            </span>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <h2 className="font-black text-2xl sm:text-3xl text-teal-950">لوحة إنجازاتي اليومية ⭐</h2>
              {onOpenSettings && (
                <button
                  onClick={() => { soundManager.playClick(); onOpenSettings(); }}
                  className="p-1.5 sm:p-2 bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-xl sm:rounded-2xl border-2 border-teal-300 flex items-center justify-center shadow-xs transition-transform active:scale-90"
                  title="الإعدادات ⚙️"
                  aria-label="الإعدادات"
                >
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                </button>
              )}
            </div>
            <p className="font-bold text-teal-800 text-sm mt-1">
              حافظ على عاداتك اليومية وسجّل صلواتك ونظافتك وسلوكك الجميل لجمع النجوم!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-teal-50 p-4 rounded-2xl border border-teal-200 shadow-xs">
          <div className="flex flex-col items-center border-l border-teal-200 pl-4">
            <div className="flex items-center gap-1 text-amber-500 font-black text-3xl">
              <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
              <span>{currentStars}</span>
            </div>
            <span className="font-bold text-xs text-teal-800">مجموع النجوم</span>
          </div>

          <div className="flex flex-col items-center pr-2">
            <div className="flex items-center gap-1 text-teal-700 font-black text-3xl">
              <CheckCircle2 className="w-7 h-7" />
              <span>{totalTasksCompletedCount}</span>
            </div>
            <span className="font-bold text-xs text-teal-800">مهام مكتملة</span>
          </div>
        </div>

      </div>

      {/* Badges Milestones */}
      <div className="bg-white p-5 rounded-3xl border-4 border-teal-200 shadow-sm">
        <h3 className="font-black text-lg text-teal-950 mb-3 flex items-center gap-2">
          <span>🏅</span>
          <span>أوسمة الإنجاز والتميز:</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { stars: 10, title: '🥉 مبتدئ الاجتهاد', icon: '🥉' },
            { stars: 30, title: '🥈 بطل العادات', icon: '🥈' },
            { stars: 50, title: '🥇 بطل التعلم', icon: '🥇' },
            { stars: 100, title: '🏆 وسام الطفل المثالي', icon: '🏆' },
            { stars: 200, title: '🌟 نجم اليوم الساطع', icon: '🌟' }
          ].map((badge) => {
            const isUnlocked = currentStars >= badge.stars;
            return (
              <div
                key={badge.stars}
                className={`p-3 rounded-2xl flex flex-col items-center text-center gap-1 transition-all ${
                  isUnlocked
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 opacity-50 grayscale'
                }`}
              >
                <span className="text-3xl">{badge.icon}</span>
                <span className="font-black text-xs">{badge.title}</span>
                <span className={`text-[10px] font-bold ${isUnlocked ? 'text-teal-100' : 'text-slate-600'}`}>{badge.stars} نجمة</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories Horizontal Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {HABIT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { soundManager.playClick(); setSelectedCategory(cat.id); }}
              className={`px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all flex items-center gap-2 shadow-xs active:scale-95 ${
                isSelected
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'bg-white hover:bg-teal-100 text-teal-950 border border-teal-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tasks Grid */}
      <div className="bg-white rounded-[32px] border-4 border-teal-200 p-6 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between border-b-2 border-teal-200 pb-3">
          <h3 className="font-black text-xl text-teal-950">
            {HABIT_CATEGORIES.find(c => c.id === selectedCategory)?.title}
          </h3>
          <span className="text-xs font-bold text-teal-800">انقر لتسجيل أنك أديت المهمة اليوم بنجاح!</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const isDone = !!currentTasks[task.id];

            return (
              <button
                key={task.id}
                onClick={() => {
                  soundManager.playClick();
                  handleToggleTask(task.id, task.starsReward);
                  if (!isDone) {
                    soundManager.playStar();
                    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
                    soundManager.speakArabic(`ممتاز! أحسنت في ${task.title}! +${task.starsReward} نجوم! ⭐`);
                  }
                }}
                className={`p-4 rounded-2xl border text-right flex items-center justify-between gap-3 transition-all shadow-xs active:scale-95 ${
                  isDone
                    ? 'bg-teal-100 text-teal-950 border-teal-300'
                    : 'bg-white hover:bg-teal-50 text-teal-950 border-teal-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{task.icon}</span>
                  <div>
                    <h4 className="font-black text-base">{task.title}</h4>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>+{task.starsReward} نجوم</span>
                    </span>
                  </div>
                </div>

                <div>
                  {isDone ? (
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center">
                      <Circle className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AchievementsDashboard;
