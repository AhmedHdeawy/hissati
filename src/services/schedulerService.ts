import * as Notifications from 'expo-notifications';
import type { Subject, NotificationData, Schedule } from '../types';
import { REMINDER_OFFSETS, APP_CONFIG } from '../utils/constants';
import { getNextOccurrence } from '../utils/timeUtils';

/**
 * Request notification permissions. Returns true if granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Set the default notification handler (show alert + play sound).
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Create or ensure the Android notification channels exist (one per phase).
 */
export async function ensureNotificationChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync(
    APP_CONFIG.NOTIFICATION_CHANNEL_ID,
    {
      name: 'تذكير الدروس',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
      sound: 'notification_t60.mp3',
    }
  );
  await Notifications.setNotificationChannelAsync('lesson_t30', {
    name: 'تذكير - ٣٠ دقيقة',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FFA500',
    sound: 'notification_t30.mp3',
  });
  await Notifications.setNotificationChannelAsync('lesson_t5', {
    name: 'تذكير - الحصة الآن',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 200, 500],
    lightColor: '#FF4444',
    sound: 'notification_t5.mp3',
  });
}

/**
 * Cancel all previously scheduled lesson reminders.
 */
export async function cancelAllLessonNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

interface ReminderInfo {
  title: string;
  body: string;
  phase: 't60' | 't30' | 't5';
}

const PHASE_SOUNDS: Record<'t60' | 't30' | 't5', string> = {
  t60: 'notification_t60.mp3',
  t30: 'notification_t30.mp3',
  t5: 'notification_t5.mp3',
};

const PHASE_CHANNELS: Record<'t60' | 't30' | 't5', string> = {
  t60: APP_CONFIG.NOTIFICATION_CHANNEL_ID,
  t30: 'lesson_t30',
  t5: 'lesson_t5',
};

function buildReminderInfo(
  subjectTitle: string,
  offsetMinutes: number
): ReminderInfo {
  if (offsetMinutes === REMINDER_OFFSETS.T60) {
    return {
      title: `${subjectTitle} - بعد ساعة`,
      body: 'استعدي يا مريم! درسك بعد ساعة 📚',
      phase: 't60',
    };
  }
  if (offsetMinutes === REMINDER_OFFSETS.T30) {
    return {
      title: `${subjectTitle} - بعد ٣٠ دقيقة`,
      body: 'جهّزي كتبك وماءك يا مريم! 🎒',
      phase: 't30',
    };
  }
  return {
    title: `${subjectTitle} - الحصة الآن! 🔔`,
    body: 'افتحي التطبيق وانضمي للحصة يا مريم!',
    phase: 't5',
  };
}

/**
 * Schedule all reminders for all subjects.
 * Schedules up to 4 weeks ahead for each subject/day combination.
 */
export async function scheduleAllReminders(subjects: Subject[]): Promise<void> {
  await cancelAllLessonNotifications();

  const granted = await requestNotificationPermissions();
  if (!granted) {
    console.warn('[Scheduler] Notification permissions not granted');
    return;
  }

  const offsets = [
    REMINDER_OFFSETS.T60,
    REMINDER_OFFSETS.T30,
    REMINDER_OFFSETS.T5,
  ] as const;

  for (const subject of subjects) {
    for (const schedule of subject.schedule) {
      for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        const sessionDate = getNextOccurrenceFromWeek(schedule, weekOffset);

        for (const offsetMinutes of offsets) {
          const triggerDate = new Date(
            sessionDate.getTime() - offsetMinutes * 60_000
          );

          if (triggerDate <= new Date()) continue;

          const info = buildReminderInfo(subject.title, offsetMinutes);
          const data: NotificationData = {
            subjectId: subject.id,
            phase: info.phase,
          };

          await Notifications.scheduleNotificationAsync({
            content: {
              title: info.title,
              body: info.body,
              data,
              sound: PHASE_SOUNDS[info.phase],
              channelId: PHASE_CHANNELS[info.phase],
            },
            trigger: { type: 'date', date: triggerDate },
          });
        }
      }
    }
  }
}

function getNextOccurrenceFromWeek(
  schedule: Schedule,
  weekOffset: number
): Date {
  const base = getNextOccurrence(schedule);
  base.setDate(base.getDate() + weekOffset * 7);
  return base;
}
