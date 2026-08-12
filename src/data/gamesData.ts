import { GameDefinition, GameCategory } from '../types';

export const GAME_CATEGORIES: { id: GameCategory; title: string; icon: string; description: string; color: string }[] = [
  { id: 'intelligence', title: 'ألعاب الذكاء والتفكير', icon: '🧠', description: 'ترتيب، أنماط، ومتاهات وتفكير منطقي', color: 'bg-purple-500' },
  { id: 'focus', title: 'ألعاب التركيز والانتباه', icon: '👀', description: 'الذاكرة، الملاحظة، واكتشاف الاختلافات', color: 'bg-blue-500' },
  { id: 'math', title: 'ألعاب الحساب والرياضيات', icon: '🔢', description: 'عد العناصر، الجمع، الطرح، والمقارنة', color: 'bg-emerald-500' },
  { id: 'language', title: 'ألعاب اللغة والحروف', icon: '🔤', description: 'مطابقة الحروف، الحرف الأول، والكلمات', color: 'bg-amber-500' },
  { id: 'skills', title: 'ألعاب المهارات والتصنيف', icon: '🎯', description: 'الأشكال، الألوان، الأطعمة، والتوصيل', color: 'bg-rose-500' },
];

export const GAMES_LIST: GameDefinition[] = [
  // 1. Skills Category
  { id: 1, category: 'skills', categoryTitle: 'ألعاب المهارات والتصنيف', title: 'مطابقة الأشكال', description: 'طابق كل شكل هندسي ملون مع مكانه واسمه الصحيح', icon: '🧩', difficulty: 'easy' },
  { id: 2, category: 'skills', categoryTitle: 'ألعاب المهارات والتصنيف', title: 'مطابقة الألوان', description: 'اختر اللون المماثل والمطلوب من بين الألوان الملونة', icon: '🎨', difficulty: 'easy' },
  { id: 3, category: 'skills', categoryTitle: 'ألعاب المهارات والتصنيف', title: 'مطابقة صورة الحيوان', description: 'طابق اسم وصورة الحيوان الكرتوني الصحيح من بين خيارات متجددة', icon: '🐶', difficulty: 'easy' },

  // 2. Focus Category
  { id: 4, category: 'focus', categoryTitle: 'ألعاب التركيز', title: 'لعبة الذاكرة والبطاقات', description: 'افتح البطاقات وطابق الصور المماثلة لاكتشاف الأزواج', icon: '🧠', difficulty: 'medium' },
  { id: 14, category: 'focus', categoryTitle: 'ألعاب التركيز', title: 'اضغط على العنصر المطلوب', description: 'انقر على العنصر أو الفاكهة أو الحيوان المطلوب بسرعة ودقة', icon: '🎯', difficulty: 'easy' },

  // 3. Intelligence Category
  { id: 5, category: 'intelligence', categoryTitle: 'ألعاب الذكاء والتفكير', title: 'اكتشف العنصر المختلف', description: 'ابحث عن العنصر الفريد الذي لا ينتمي للمجموعة', icon: '🔎', difficulty: 'easy' },
  { id: 10, category: 'intelligence', categoryTitle: 'ألعاب الذكاء والتفكير', title: 'أكمل النمط المتتابع', description: 'اكتشف تسلسل الألوان والأشكال والرموز وأكمل النمط المتجدد', icon: '🌀', difficulty: 'medium' },

  // 4. Math Category
  { id: 6, category: 'math', categoryTitle: 'ألعاب الحساب والرياضيات', title: 'عد الأشياء والفواكه والنجوم', description: 'احسب عدد الفواكه أو النجوم الملونة المعروضة اختر العدد الصحيح', icon: '🔢', difficulty: 'easy' },
  { id: 18, category: 'math', categoryTitle: 'ألعاب الحساب والرياضيات', title: 'الجمع والطرح البسيط', description: 'حساب ناتج جمع وطرح الأعداد البسيطة حتى 10', icon: '🧮', difficulty: 'medium' },

  // 5. Language Category
  { id: 8, category: 'language', categoryTitle: 'ألعاب اللغة والحروف', title: 'اختر الحرف الأول', description: 'حدد الحرف الأول للكلمة المعروضة مع الصورة', icon: '🔤', difficulty: 'easy' },
  { id: 9, category: 'language', categoryTitle: 'ألعاب اللغة والحروف', title: 'اسمع الحرف واختره', description: 'استمع لنطق الحرف بصوت واضح ثم اختر الحرف الصحيح', icon: '🔊', difficulty: 'medium' },
  { id: 16, category: 'language', categoryTitle: 'ألعاب اللغة والحروف', title: 'أكمل الحرف الناقص', description: 'اكتشف الحرف الناقص لإكمال الكلمة بالشكل الصحيح ورؤيتها كاملة', icon: '🔠', difficulty: 'medium' },
];
