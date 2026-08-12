import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { AlphabetHub } from './components/Alphabet/AlphabetHub';
import { NumbersHub } from './components/Numbers/NumbersHub';
import { GamesHub } from './components/Games/GamesHub';
import { AchievementsDashboard } from './components/Achievements/AchievementsDashboard';
import { AdventureHub } from './components/Adventure/AdventureHub';
import { ProfileAndSettingsModal } from './components/ProfileAndSettingsModal';
import { KidProfile, AppTab } from './types';
import { bgMusicManager } from './utils/bgMusicManager';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    bgMusicManager.start();
  }, []);

  // Initial Kid Profile State with LocalStorage Persistence
  const [profile, setProfile] = useState<KidProfile>(() => {
    try {
      const saved = localStorage.getItem('kid_profile_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      id: 'kid-1',
      name: 'بطل التعلم الصغير 🎈',
      age: 6,
      avatar: '🧒',
      totalStars: 25,
      points: 120,
      level: 'نجم اليوم ⭐',
      gamesCompleted: 3,
      lettersLearned: ['أ', 'ب', 'ت'],
      coloringCompleted: ['lion-cute'],
      streakDays: 4,
      completedTasks: {},
      notificationSettings: {
        enabled: true,
        reminderTime: '17:00',
        notifyOnInactivity: true
      }
    };
  });

  // Completed Games list state
  const [completedGameIds, setCompletedGameIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('completed_game_ids');
      return saved ? JSON.parse(saved) : [1, 2];
    } catch {
      return [1, 2];
    }
  });

  // Save profile to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem('kid_profile_v2', JSON.stringify(profile));
    } catch (err) {
      console.warn('LocalStorage save error (profile):', err);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('completed_game_ids', JSON.stringify(completedGameIds));
    } catch (err) {
      console.warn('LocalStorage save error (completedGameIds):', err);
    }
  }, [completedGameIds]);

  // Update Profile helper
  const handleUpdateProfile = (updated: Partial<KidProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  // Star Reward Handler
  const handleEarnStars = (amount: number, itemId?: string | number) => {
    setProfile(prev => {
      const newStars = prev.totalStars + amount;
      let newLevel = prev.level;

      if (newStars > 100) newLevel = 'بطل التعلم المذهل 🏆';
      else if (newStars > 60) newLevel = 'النجم الذهبي ⭐';
      else if (newStars > 30) newLevel = 'نجم اليوم ⭐';

      return {
        ...prev,
        totalStars: newStars,
        level: newLevel
      };
    });

    if (typeof itemId === 'number' && !completedGameIds.includes(itemId)) {
      setCompletedGameIds(prev => [...prev, itemId]);
    }
  };

  const progressPercent = Math.min(100, Math.round((profile.totalStars / 120) * 100));

  return (
    <div className="min-h-screen bg-[#f0fdfa] flex flex-col font-sans text-teal-950 dir-rtl select-none" dir="rtl">
      
      {/* Top Playful Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        totalStars={profile.totalStars}
        level={profile.level}
        kidName={profile.name}
        kidAvatar={profile.avatar}
        kidPhoto={profile.customPhoto}
        progressPercent={progressPercent}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Activity Book Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-24 md:pb-8">
        {activeTab === 'home' && (
          <HomeScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onSelectTab={setActiveTab}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'alphabet' && (
          <AlphabetHub
            learnedLetters={profile.lettersLearned}
            onEarnStars={handleEarnStars}
          />
        )}

        {activeTab === 'numbers' && (
          <NumbersHub
            onEarnStars={handleEarnStars}
          />
        )}

        {activeTab === 'games' && (
          <GamesHub
            completedGameIds={completedGameIds}
            onEarnStars={handleEarnStars}
          />
        )}

        {activeTab === 'adventure' && (
          <AdventureHub
            onEarnStars={handleEarnStars}
            onGoHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsDashboard
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onEarnStars={handleEarnStars}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* Profile & Android Settings Modal */}
      <ProfileAndSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Footer */}
      <footer className="w-full bg-white/90 border-t-2 border-teal-200 py-4 text-center text-xs font-bold text-teal-800">
        🎈 ألعب وأمرح - أنشطة تفاعلية للأطفال By Amany Elbadry © {new Date().getFullYear()}
      </footer>

    </div>
  );
}

export default App;
