import type { Schedule, Subject } from '../types';

const DAY_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Parse "HH:MM" time string into { hours, minutes }
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { hours: h, minutes: m };
}

/**
 * Get the next occurrence of a schedule entry as a Date object.
 * If the session is happening now or in the future today, returns today.
 * Otherwise returns the next occurrence in the coming week.
 */
export function getNextOccurrence(schedule: Schedule, durationMinutes = 0): Date {
  const now = new Date();
  const targetDay = DAY_MAP[schedule.day];
  const { hours, minutes } = parseTime(schedule.time);

  for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + daysAhead);
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate.getDay() !== targetDay) continue;

    const sessionEnd = new Date(candidate.getTime() + durationMinutes * 60_000);

    // Return this occurrence if it hasn't ended yet (covers active + upcoming)
    if (sessionEnd > now || candidate > now) {
      return candidate;
    }
  }

  // Fallback: next week same day
  const fallback = new Date(now);
  const currentDay = now.getDay();
  const daysUntilTarget = ((targetDay - currentDay + 7) % 7) || 7;
  fallback.setDate(now.getDate() + daysUntilTarget);
  fallback.setHours(hours, minutes, 0, 0);
  return fallback;
}

/**
 * Find the next upcoming lesson across all subjects.
 * Returns { subject, sessionStart, minutesUntil }
 */
export function findNextLesson(subjects: Subject[]): {
  subject: Subject;
  sessionStart: Date;
  minutesUntil: number;
} | null {
  if (!subjects.length) return null;

  let closest: { subject: Subject; sessionStart: Date; minutesUntil: number } | null = null;

  for (const subject of subjects) {
    for (const schedule of subject.schedule) {
      const sessionStart = getNextOccurrence(schedule, subject.duration_minutes);
      const minutesUntil = Math.floor(
        (sessionStart.getTime() - Date.now()) / 60_000
      );

      if (!closest || minutesUntil < closest.minutesUntil) {
        closest = { subject, sessionStart, minutesUntil };
      }
    }
  }

  return closest;
}

/**
 * Determine the lesson phase based on minutes until session start.
 * Negative minutesUntil means session is ongoing.
 */
export function getLessonPhase(
  minutesUntil: number,
  durationMinutes: number
): 'idle' | 't60' | 't30' | 't5' | 'active' {
  if (minutesUntil <= 0 && minutesUntil >= -durationMinutes) {
    return 'active';
  }
  if (minutesUntil <= 5 && minutesUntil > 0) {
    return 't5';
  }
  if (minutesUntil <= 30 && minutesUntil > 5) {
    return 't30';
  }
  if (minutesUntil <= 60 && minutesUntil > 30) {
    return 't60';
  }
  return 'idle';
}

/**
 * Format a duration in seconds to MM:SS string.
 */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, seconds);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format minutes to a human-readable string.
 * Only shows countdown if lesson is today (< 24 hours away).
 * Otherwise returns the day name.
 */
export function formatMinutes(minutes: number, sessionDate?: Date): string {
  if (minutes <= 0) return 'الآن!';
  // More than 24 hours away — show day name instead of a confusing hour count
  if (minutes > 24 * 60) {
    if (sessionDate) {
      return getDayName(sessionDate);
    }
    return 'قريباً';
  }
  if (minutes < 60) return `${minutes} د`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} س ${m} د` : `${h} س`;
}

/**
 * Get the day name for a Date object (Arabic).
 */
export function getDayName(date: Date): string {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[date.getDay()];
}
