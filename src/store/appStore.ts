import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AppStoreState,
  LocalConfig,
  Subject,
  ActivityLog,
  StarRecord,
} from '../types';
import { STORAGE_KEYS, DEFAULT_WEEKLY_GOAL, SUBJECT_ICONS } from '../utils/constants';

// Helper: ISO date string for Monday of current week
function getMondayOfCurrentWeek(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

const defaultStars: StarRecord = {
  count: 0,
  weeklyGoal: DEFAULT_WEEKLY_GOAL,
  weekStartDate: getMondayOfCurrentWeek(),
  totalEarned: 0,
};

function persistConfig(config: LocalConfig) {
  AsyncStorage.setItem(STORAGE_KEYS.LOCAL_CONFIG, JSON.stringify(config));
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  // --- State ---
  localConfig: null,
  isLoading: false,
  lastError: null,
  stars: defaultStars,
  activityLogs: [],

  // --- Actions ---
  setLocalConfig: (config: LocalConfig) => {
    set({ localConfig: config, lastError: null });
    persistConfig(config);
  },

  addSubject: (subject: Subject) => {
    const { localConfig } = get();
    const base = localConfig ?? {
      subjects: [],
      weeklyGoal: DEFAULT_WEEKLY_GOAL,
      updatedAt: '',
    };
    const updated: LocalConfig = {
      ...base,
      subjects: [...base.subjects, subject],
      updatedAt: new Date().toISOString(),
    };
    set({ localConfig: updated });
    persistConfig(updated);
  },

  updateSubject: (subject: Subject) => {
    const { localConfig } = get();
    if (!localConfig) return;
    const updated: LocalConfig = {
      ...localConfig,
      subjects: localConfig.subjects.map((s) =>
        s.id === subject.id ? subject : s
      ),
      updatedAt: new Date().toISOString(),
    };
    set({ localConfig: updated });
    persistConfig(updated);
  },

  deleteSubject: (id: string) => {
    const { localConfig } = get();
    if (!localConfig) return;
    const updated: LocalConfig = {
      ...localConfig,
      subjects: localConfig.subjects.filter((s) => s.id !== id),
      updatedAt: new Date().toISOString(),
    };
    set({ localConfig: updated });
    persistConfig(updated);
  },

  setWeeklyGoal: (goal: number) => {
    const { localConfig, stars } = get();
    if (localConfig) {
      const updatedConfig: LocalConfig = {
        ...localConfig,
        weeklyGoal: goal,
        updatedAt: new Date().toISOString(),
      };
      set({ localConfig: updatedConfig });
      persistConfig(updatedConfig);
    }
    // Also update stars record
    const updatedStars: StarRecord = { ...stars, weeklyGoal: goal };
    set({ stars: updatedStars });
    AsyncStorage.setItem(STORAGE_KEYS.STARS, JSON.stringify(updatedStars));
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ lastError: error }),

  addStar: () => {
    const { stars } = get();
    const currentMonday = getMondayOfCurrentWeek();
    const isNewWeek = stars.weekStartDate !== currentMonday;

    const updated: StarRecord = isNewWeek
      ? {
          ...stars,
          count: 1,
          weekStartDate: currentMonday,
          totalEarned: stars.totalEarned + 1,
        }
      : {
          ...stars,
          count: stars.count + 1,
          totalEarned: stars.totalEarned + 1,
        };

    set({ stars: updated });
    AsyncStorage.setItem(STORAGE_KEYS.STARS, JSON.stringify(updated));
  },

  resetWeeklyStars: () => {
    const { stars } = get();
    const updated: StarRecord = {
      ...stars,
      count: 0,
      weekStartDate: getMondayOfCurrentWeek(),
    };
    set({ stars: updated });
    AsyncStorage.setItem(STORAGE_KEYS.STARS, JSON.stringify(updated));
  },

  addActivityLog: (log: ActivityLog) => {
    const { activityLogs } = get();
    const updated = [log, ...activityLogs].slice(0, 100);
    set({ activityLogs: updated });
    AsyncStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(updated));
  },

  clearLogs: () => {
    set({ activityLogs: [] });
    AsyncStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
  },
}));

// Hydrate store from AsyncStorage on app start
export async function hydrateAppStore(): Promise<void> {
  const [localConfigRaw, starsRaw, logsRaw] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.LOCAL_CONFIG),
    AsyncStorage.getItem(STORAGE_KEYS.STARS),
    AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS),
  ]);

  if (localConfigRaw) {
    try {
      const parsed: LocalConfig = JSON.parse(localConfigRaw);
      // Sanitize icons: replace any non-MaterialCommunityIcons values (old emojis)
      const validIconNames = new Set(SUBJECT_ICONS.map((i) => i.name));
      let needsResave = false;
      for (const subject of parsed.subjects) {
        if (!validIconNames.has(subject.icon)) {
          subject.icon = 'book-open-variant';
          needsResave = true;
        }
      }
      useAppStore.setState({ localConfig: parsed });
      if (needsResave) {
        AsyncStorage.setItem(STORAGE_KEYS.LOCAL_CONFIG, JSON.stringify(parsed));
      }
    } catch {
      // corrupted, ignore
    }
  } else {
    // Migration: try to convert legacy cached config
    await migrateLegacyConfig();
  }

  if (starsRaw) {
    try {
      const parsed: StarRecord = JSON.parse(starsRaw);
      const currentMonday = getMondayOfCurrentWeek();
      if (parsed.weekStartDate !== currentMonday) {
        useAppStore.setState({
          stars: { ...parsed, count: 0, weekStartDate: currentMonday },
        });
      } else {
        useAppStore.setState({ stars: parsed });
      }
    } catch {
      // use defaults
    }
  }

  if (logsRaw) {
    try {
      const parsed: ActivityLog[] = JSON.parse(logsRaw);
      useAppStore.setState({ activityLogs: parsed });
    } catch {
      // ignore
    }
  }
}

// One-time migration from old remote config format
async function migrateLegacyConfig(): Promise<void> {
  try {
    const legacyRaw = await AsyncStorage.getItem(
      STORAGE_KEYS.LEGACY_CACHED_CONFIG
    );
    if (!legacyRaw) return;

    const legacy = JSON.parse(legacyRaw);
    const subjects: Subject[] = (legacy.config?.subjects ?? []).map(
      (s: any) => ({
        id: s.id,
        title: s.title,
        duration_minutes: s.duration_minutes,
        schedule: s.schedule,
        audio: {
          t60: { type: 'default' as const },
          t30: { type: 'default' as const },
          t5: { type: 'default' as const },
          success: { type: 'default' as const },
        },
        meeting_url: s.meeting_url,
        icon: s.title.includes('قرآن') ? 'moon-waning-crescent' : 'book-open-variant',
      })
    );

    const localConfig: LocalConfig = {
      subjects,
      weeklyGoal: DEFAULT_WEEKLY_GOAL,
      updatedAt: new Date().toISOString(),
    };

    useAppStore.setState({ localConfig });
    await AsyncStorage.setItem(
      STORAGE_KEYS.LOCAL_CONFIG,
      JSON.stringify(localConfig)
    );

    // Clean up legacy keys
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.LEGACY_CACHED_CONFIG,
      STORAGE_KEYS.LEGACY_CONFIG_URL,
    ]);
  } catch {
    // migration failed, user starts fresh
  }
}
