import { HabitTask } from '../types';

export const HABIT_CATEGORIES = [
  { id: 'prayer', title: '🕌 الصلاة والمحافظة عليها', icon: '🕌', color: 'bg-emerald-500' },
  { id: 'quran', title: '📖 الورد اليومي والذكر', icon: '📖', color: 'bg-sky-500' },
  { id: 'food', title: '🍎 الطعام الصحي والغذاء', icon: '🍎', color: 'bg-amber-500' },
  { id: 'sports', title: '🏃 الرياضة والنشاط البدني', icon: '🏃', color: 'bg-rose-500' },
  { id: 'sleep', title: '😴 النوم والاستيقاظ المبكر', icon: '😴', color: 'bg-indigo-500' },
  { id: 'hygiene', title: '🧼 النظافة الشخصية والترتيب', icon: '🧼', color: 'bg-cyan-500' },
  { id: 'study', title: '📚 الدراسة وحل الواجبات', icon: '📚', color: 'bg-violet-500' },
  { id: 'responsibilities', title: '🏠 المسؤوليات والمساعدة بالبيت', icon: '🏠', color: 'bg-orange-500' },
  { id: 'behavior', title: '💖 السلوكيات الإيجابية والأخلاق', icon: '💖', color: 'bg-pink-500' },
];

export const HABIT_TASKS: HabitTask[] = [
  // 1. Prayer
  { id: 'p-fajr', title: 'صلاة الفجر', category: 'prayer', categoryTitle: 'الصلاة', icon: '🌅', starsReward: 5 },
  { id: 'p-dhuhr', title: 'صلاة الظهر', category: 'prayer', categoryTitle: 'الصلاة', icon: '☀️', starsReward: 5 },
  { id: 'p-asr', title: 'صلاة العصر', category: 'prayer', categoryTitle: 'الصلاة', icon: '🌤️', starsReward: 5 },
  { id: 'p-maghrib', title: 'صلاة المغرب', category: 'prayer', categoryTitle: 'الصلاة', icon: '🌆', starsReward: 5 },
  { id: 'p-isha', title: 'صلاة العشاء', category: 'prayer', categoryTitle: 'الصلاة', icon: '🌙', starsReward: 5 },

  // 2. Daily Quran & Azkar
  { id: 'q-read', title: 'قراءة القرآن الكريم', category: 'quran', categoryTitle: 'الورد اليومي', icon: '📖', starsReward: 4 },
  { id: 'q-memorize', title: 'حفظ آيات جديدة', category: 'quran', categoryTitle: 'الورد اليومي', icon: '✨', starsReward: 5 },
  { id: 'q-azkar', title: 'أذكار الصباح والمساء', category: 'quran', categoryTitle: 'الورد اليومي', icon: '🤲', starsReward: 3 },
  { id: 'q-story', title: 'قراءة قصة مفيدة', category: 'quran', categoryTitle: 'الورد اليومي', icon: '📚', starsReward: 3 },
  { id: 'q-review', title: 'مراجعة الحروف والكلمات', category: 'quran', categoryTitle: 'الورد اليومي', icon: '🔤', starsReward: 3 },

  // 3. Healthy Food
  { id: 'f-fruit', title: 'تناول فاكهة طازجة', category: 'food', categoryTitle: 'الطعام الصحي', icon: '🍎', starsReward: 3 },
  { id: 'f-veggie', title: 'تناول الخضروات المفيدة', category: 'food', categoryTitle: 'الطعام الصحي', icon: '🥦', starsReward: 3 },
  { id: 'f-water', title: 'شرب الماء الكافي اليوم', category: 'food', categoryTitle: 'الطعام الصحي', icon: '💧', starsReward: 2 },
  { id: 'f-breakfast', title: 'تناول وجبة الإفطار الصحي', category: 'food', categoryTitle: 'الطعام الصحي', icon: '🍳', starsReward: 3 },
  { id: 'f-sweets', title: 'تجنب الإكثار من الحلويات', category: 'food', categoryTitle: 'الطعام الصحي', icon: '🛑', starsReward: 4 },

  // 4. Sports & Exercise
  { id: 's-walk', title: 'المشي في الهواء الطلق', category: 'sports', categoryTitle: 'الرياضة', icon: '🚶', starsReward: 3 },
  { id: 's-run', title: 'الجري والتمرين اللطيف', category: 'sports', categoryTitle: 'الرياضة', icon: '🏃', starsReward: 3 },
  { id: 's-exercises', title: 'تمارين رياضية بسيطة', category: 'sports', categoryTitle: 'الرياضة', icon: '🤸', starsReward: 3 },
  { id: 's-play', title: 'اللعب والحركة بانتظام', category: 'sports', categoryTitle: 'الرياضة', icon: '⚽', starsReward: 3 },

  // 5. Sleep & Routine
  { id: 'sl-time', title: 'النوم في الوقت المناسب', category: 'sleep', categoryTitle: 'النوم', icon: '🌙', starsReward: 4 },
  { id: 'sl-wake', title: 'الاستيقاظ نشيطاً وبباكر', category: 'sleep', categoryTitle: 'النوم', icon: '⏰', starsReward: 4 },
  { id: 'sl-prep', title: 'تجهيز السرير والنوم الهادئ', category: 'sleep', categoryTitle: 'النوم', icon: '🛏️', starsReward: 3 },

  // 6. Hygiene
  { id: 'h-teeth', title: 'غسل الأسنان بالفرشاة والمعجون', category: 'hygiene', categoryTitle: 'النظافة', icon: '🪥', starsReward: 3 },
  { id: 'h-hands', title: 'غسل اليدين بانتظام', category: 'hygiene', categoryTitle: 'النظافة', icon: '🧼', starsReward: 2 },
  { id: 'h-shower', title: 'الاستحمام والانتعاش', category: 'hygiene', categoryTitle: 'النظافة', icon: '🚿', starsReward: 4 },
  { id: 'h-clothes', title: 'ترتيب الملابس والنظافة', category: 'hygiene', categoryTitle: 'النظافة', icon: '👕', starsReward: 3 },
  { id: 'h-room', title: 'ترتيب الغرفة الخاصة', category: 'hygiene', categoryTitle: 'النظافة', icon: '🧹', starsReward: 4 },
  { id: 'h-nails', title: 'قص الأظافر والعناية بها', category: 'hygiene', categoryTitle: 'النظافة', icon: '💅', starsReward: 2 },

  // 7. Study
  { id: 'st-homework', title: 'حل الواجبات المدرسية', category: 'study', categoryTitle: 'الدراسة والتعلم', icon: '✍️', starsReward: 5 },
  { id: 'st-readbook', title: 'قراءة كتاب أو قصة قصيرة', category: 'study', categoryTitle: 'الدراسة والتعلم', icon: '📖', starsReward: 4 },
  { id: 'st-letter', title: 'تعلم حرف عربي جديد', category: 'study', categoryTitle: 'الدراسة والتعلم', icon: '🔤', starsReward: 3 },
  { id: 'st-number', title: 'تعلم رقم رياضيات جديد', category: 'study', categoryTitle: 'الدراسة والتعلم', icon: '🔢', starsReward: 3 },
  { id: 'st-game', title: 'حل لعبة تعليمية وتفكير', category: 'study', categoryTitle: 'الدراسة والتعلم', icon: '🎮', starsReward: 3 },

  // 8. Responsibilities
  { id: 'r-toys', title: 'ترتيب الألعاب بعد الانتهاء', category: 'responsibilities', categoryTitle: 'المسؤوليات', icon: '🧸', starsReward: 3 },
  { id: 'r-bed', title: 'ترتيب السرير بعد الاستيقاظ', category: 'responsibilities', categoryTitle: 'المسؤوليات', icon: '🛏️', starsReward: 3 },
  { id: 'r-parents', title: 'مساعدة الوالدين في البيت', category: 'responsibilities', categoryTitle: 'المسؤوليات', icon: '🤝', starsReward: 5 },
  { id: 'r-place', title: 'وضع الأشياء في مكانها الصحيح', category: 'responsibilities', categoryTitle: 'المسؤوليات', icon: '📦', starsReward: 3 },

  // 9. Positive Behavior
  { id: 'b-please', title: 'قول "من فضلك" عند الطلب', category: 'behavior', categoryTitle: 'السلوكيات الإيجابية', icon: '💬', starsReward: 3 },
  { id: 'b-thanks', title: 'قول "شكرًا" لِمَن يقدم مساعدة', category: 'behavior', categoryTitle: 'السلوكيات الإيجابية', icon: '🙏', starsReward: 3 },
  { id: 'b-help', title: 'مساعدة الآخرين والرفق بهم', category: 'behavior', categoryTitle: 'السلوكيات الإيجابية', icon: '❤️', starsReward: 4 },
  { id: 'b-respect', title: 'احترام الوالدين والكبار', category: 'behavior', categoryTitle: 'السلوكيات الإيجابية', icon: '🌟', starsReward: 5 },
  { id: 'b-share', title: 'مشاركة الألعاب مع الأصدقاء', category: 'behavior', categoryTitle: 'السلوكيات الإيجابية', icon: '🎁', starsReward: 4 },
  { id: 'b-truth', title: 'الصدق والأمانة في القول والعمل', category: 'behavior', categoryTitle: 'السلوكيات الإيجابية', icon: '💎', starsReward: 5 },
  { id: 'b-apologize', title: 'الاعتذار عند ارتكاب خطأ', category: 'behavior', categoryTitle: 'السلوكيات الإيجابية', icon: '🌷', starsReward: 4 },
  { id: 'b-soft', title: 'الكلام بلطف والتحدث بهدوء', category: 'behavior', categoryTitle: 'السلوكيات الإيجابية', icon: '🗣️', starsReward: 3 },
];
