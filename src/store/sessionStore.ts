import { create } from 'zustand';
import type { SessionStoreState, ActiveLesson, Subject } from '../types';

export const useSessionStore = create<SessionStoreState>((set) => ({
  activeLesson: null,
  focusModeSubject: null,
  focusModeEndTime: null,

  setActiveLesson: (lesson: ActiveLesson | null) =>
    set({ activeLesson: lesson }),

  enterFocusMode: (subject: Subject, endTime: Date) =>
    set({ focusModeSubject: subject, focusModeEndTime: endTime }),

  exitFocusMode: () =>
    set({ focusModeSubject: null, focusModeEndTime: null }),
}));
