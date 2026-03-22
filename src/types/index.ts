// ============================================================
// Maryam's Lesson Companion - TypeScript Type Definitions
// ============================================================

// --- Schedule ---

export interface Schedule {
  day:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
  time: string; // "HH:MM" 24-hour format
}

// --- Audio ---

export type AudioSource =
  | { type: 'default' }
  | { type: 'custom'; uri: string };

export interface SubjectAudio {
  t60: AudioSource;
  t30: AudioSource;
  t5: AudioSource;
  success: AudioSource;
}

// --- Subject ---

export interface Subject {
  id: string;
  title: string;
  duration_minutes: number;
  schedule: Schedule[];
  audio: SubjectAudio;
  meeting_url: string;
  icon: string; // emoji character, e.g. "📖"
}

// --- Local Config (replaces remote AppConfig + CachedConfig) ---

export interface LocalConfig {
  subjects: Subject[];
  weeklyGoal: number;
  updatedAt: string; // ISO date string
}

// --- Gamification ---

export interface StarRecord {
  count: number;
  weeklyGoal: number;
  weekStartDate: string; // ISO date string (Monday of current week)
  totalEarned: number;
}

// --- Activity Logging ---

export interface ActivityLog {
  id: string;
  subjectId: string;
  subjectTitle: string;
  joinedAt: string; // ISO date string
}

// --- Lesson Phase State ---

export type LessonPhase = 'idle' | 't60' | 't30' | 't5' | 'active';

export interface ActiveLesson {
  subject: Subject;
  phase: LessonPhase;
  minutesUntil: number; // negative means lesson is ongoing
  sessionStartTime: Date;
  sessionEndTime: Date;
}

// --- App Store State ---

export interface AppStoreState {
  // Config
  localConfig: LocalConfig | null;
  isLoading: boolean;
  lastError: string | null;

  // Gamification
  stars: StarRecord;

  // Logs
  activityLogs: ActivityLog[];

  // Actions
  setLocalConfig: (config: LocalConfig) => void;
  addSubject: (subject: Subject) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  setWeeklyGoal: (goal: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addStar: () => void;
  resetWeeklyStars: () => void;
  addActivityLog: (log: ActivityLog) => void;
  clearLogs: () => void;
}

// --- Session Store State ---

export interface SessionStoreState {
  activeLesson: ActiveLesson | null;
  focusModeSubject: Subject | null;
  focusModeEndTime: Date | null;
  setActiveLesson: (lesson: ActiveLesson | null) => void;
  enterFocusMode: (subject: Subject, endTime: Date) => void;
  exitFocusMode: () => void;
}

// --- Notification Payload ---

export interface NotificationData {
  subjectId: string;
  phase: 't60' | 't30' | 't5';
}
