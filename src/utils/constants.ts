// Storage Keys
export const STORAGE_KEYS = {
  LOCAL_CONFIG: 'mlc_local_config',
  STARS: 'mlc_stars',
  ACTIVITY_LOGS: 'mlc_activity_logs',
  // Legacy keys (for migration)
  LEGACY_CACHED_CONFIG: 'mlc_cached_config',
  LEGACY_CONFIG_URL: 'mlc_config_url',
} as const;

// Reminder offsets (minutes before lesson)
export const REMINDER_OFFSETS = {
  T60: 60,
  T30: 30,
  T5: 5,
} as const;

// Gamification
export const DEFAULT_WEEKLY_GOAL = 5;

// Colors - Child-friendly palette
export const COLORS = {
  primary: '#6C63FF',     // Purple
  secondary: '#FF6584',   // Pink
  accent: '#43D9AD',      // Mint green
  warning: '#FFAA00',     // Saturated golden yellow
  success: '#06D6A0',     // Green
  background: '#F8F7FF',  // Off-white lavender
  cardBg: '#FFFFFF',
  textPrimary: '#2D3748',
  textSecondary: '#718096',
  quran: '#C084FC',       // Soft purple for Quran
  english: '#60A5FA',     // Soft blue for English
  star: '#FFAA00',        // Saturated gold
  gradient: {
    start: '#6C63FF',
    end: '#FF6584',
  },
} as const;

// Animation durations (ms)
export const ANIMATION = {
  SHAKE_DURATION: 500,
  PULSE_DURATION: 1000,
  CONFETTI_DURATION: 4000,
} as const;

// App config
export const APP_CONFIG = {
  POLL_INTERVAL_MS: 30_000,   // 30 seconds for active lesson check
  MAX_LOGS: 100,
  NOTIFICATION_CHANNEL_ID: 'lesson-reminders',
} as const;

// Predefined subject icons using MaterialCommunityIcons names + display label
export const SUBJECT_ICONS = [
  { name: 'book-open-variant', label: 'كتاب' },
  { name: 'pencil', label: 'قلم' },
  { name: 'calculator', label: 'حساب' },
  { name: 'earth', label: 'جغرافيا' },
  { name: 'palette', label: 'فنون' },
  { name: 'music', label: 'موسيقى' },
  { name: 'flask', label: 'علوم' },
  { name: 'ruler-square', label: 'هندسة' },
  { name: 'school', label: 'مدرسة' },
  { name: 'laptop', label: 'حاسوب' },
  { name: 'bookshelf', label: 'مكتبة' },
  { name: 'moon-waning-crescent', label: 'قرآن' },
  { name: 'star-four-points', label: 'نجمة' },
  { name: 'target', label: 'هدف' },
  { name: 'test-tube', label: 'مختبر' },
  { name: 'trophy', label: 'كأس' },
  { name: 'translate', label: 'لغات' },
  { name: 'head-lightbulb', label: 'تفكير' },
] as const;

// Days of the week
export const DAYS_OF_WEEK = [
  { key: 'Sunday' as const, label: 'الأحد' },
  { key: 'Monday' as const, label: 'الإثنين' },
  { key: 'Tuesday' as const, label: 'الثلاثاء' },
  { key: 'Wednesday' as const, label: 'الأربعاء' },
  { key: 'Thursday' as const, label: 'الخميس' },
  { key: 'Friday' as const, label: 'الجمعة' },
  { key: 'Saturday' as const, label: 'السبت' },
] as const;

// Time slots for dropdown (every 30 minutes)
export const TIME_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_SLOTS.push(
      `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    );
  }
}
