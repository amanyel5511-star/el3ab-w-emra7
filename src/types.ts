export interface AdventureProgress {
  unlockedLevel: number; // Highest level unlocked (default 1)
  completedLevels: Record<number, { stars: number; completedAt: string }>;
  unlockedBadges: string[];
}

export type AppTab = 'home' | 'alphabet' | 'numbers' | 'games' | 'adventure' | 'achievements';

export interface KidProfile {
  id: string;
  name: string;
  age: number;
  avatar: string; // avatar key/emoji
  customPhoto?: string; // uploaded photo base64/dataURL
  totalStars: number;
  points: number;
  level: string; // 'مبتدئ' | 'متقدم' | 'بطل' | 'بطل التعلم' | 'نجم اليوم'
  gamesCompleted: number;
  lettersLearned: string[]; // list of letters completed
  coloringCompleted?: string[]; // list of page IDs completed
  streakDays: number;
  completedTasks: Record<string, boolean>; // taskId -> boolean for today
  notificationSettings?: {
    enabled: boolean;
    reminderTime: string; // e.g. "17:00"
    notifyOnInactivity: boolean;
  };
}

export interface AlphabetItem {
  id: string;
  letter: string;
  name: string;
  exampleWord: string;
  exampleTranslation: string;
  exampleIcon: string;
  letterAudio: string;
  wordAudio: string;
  fatha: { text: string; word: string; audio: string; wordAudio: string };
  damma: { text: string; word: string; audio: string; wordAudio: string };
  kasra: { text: string; word: string; audio: string; wordAudio: string };
  tracingPoints?: { x: number; y: number }[];
  svgPath?: string;
}

export type GameCategory = 'intelligence' | 'focus' | 'math' | 'language' | 'skills';

export interface GameDefinition {
  id: number;
  category: GameCategory;
  categoryTitle: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface HabitTask {
  id: string;
  title: string;
  category: 'prayer' | 'quran' | 'food' | 'sports' | 'sleep' | 'hygiene' | 'study' | 'responsibilities' | 'behavior';
  categoryTitle: string;
  icon: string;
  starsReward: number;
}

export interface SongItem {
  id: string;
  title: string;
  coverEmoji: string;
  audioUrl?: string; // Optional audio file/data URL
  lyricsSummary?: string;
  lyrics?: string; // Full song lyrics for singing along
  category?: string;
  isDefault?: boolean;
}
