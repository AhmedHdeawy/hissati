import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { useSessionStore } from '../store/sessionStore';
import { findNextLesson, getLessonPhase } from '../utils/timeUtils';
import { playAudio, resolveAudioUri } from '../services/audioService';
import type { ActiveLesson, LessonPhase } from '../types';
import { APP_CONFIG } from '../utils/constants';

/**
 * Polls every 30 seconds to determine the current lesson phase.
 * Automatically plays audio when transitioning into a new phase.
 * Updates sessionStore.activeLesson accordingly.
 */
export function useActiveLesson(): ActiveLesson | null {
  const localConfig = useAppStore((s) => s.localConfig);
  const setActiveLesson = useSessionStore((s) => s.setActiveLesson);
  const activeLesson = useSessionStore((s) => s.activeLesson);

  // Track last phase to avoid replaying audio on re-renders
  const lastPhaseRef = useRef<LessonPhase>('idle');
  const lastSubjectRef = useRef<string | null>(null);
  // On first tick we play audio if already in a reminder phase
  const isFirstTickRef = useRef(true);

  useEffect(() => {
    if (!localConfig) return;

    async function tick() {
      const result = findNextLesson(localConfig!.subjects);
      if (!result) {
        setActiveLesson(null);
        isFirstTickRef.current = false;
        return;
      }

      const { subject, sessionStart, minutesUntil } = result;
      const phase = getLessonPhase(minutesUntil, subject.duration_minutes);
      const sessionEnd = new Date(
        sessionStart.getTime() + subject.duration_minutes * 60_000
      );

      const lesson: ActiveLesson = {
        subject,
        phase,
        minutesUntil,
        sessionStartTime: sessionStart,
        sessionEndTime: sessionEnd,
      };

      setActiveLesson(lesson);

      const isNewSubject = lastSubjectRef.current !== subject.id;
      const isNewPhase = lastPhaseRef.current !== phase;

      // First tick: record current phase/subject and play audio if already in a reminder phase
      if (isFirstTickRef.current) {
        lastPhaseRef.current = phase;
        lastSubjectRef.current = subject.id;
        isFirstTickRef.current = false;

        if (phase !== 'idle' && phase !== 'active') {
          const uri = await resolveAudioUri(subject.audio[phase], phase);
          playAudio(uri);
        }
        return;
      }

      // Subsequent ticks: play audio only on real phase transitions
      if (isNewPhase || isNewSubject) {
        if (phase === 't60' || phase === 't30' || phase === 't5') {
          const uri = await resolveAudioUri(subject.audio[phase], phase);
          playAudio(uri);
        }

        lastPhaseRef.current = phase;
        lastSubjectRef.current = subject.id;
      }
    }

    tick(); // Run immediately
    const interval = setInterval(tick, APP_CONFIG.POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [localConfig, setActiveLesson]);

  return activeLesson;
}
