# Maryam's Lesson Companion - Technical Architecture

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 51 (Managed Workflow) |
| Language | TypeScript (strict mode) |
| State | Zustand |
| Navigation | Expo Router (file-based) |
| Audio | expo-av |
| File Caching | expo-file-system |
| Notifications | expo-notifications (background scheduling) |
| Storage | @react-native-async-storage/async-storage |
| Animations | react-native-reanimated + moti |
| Confetti | react-native-confetti-cannon |
| Gradients | expo-linear-gradient |
| Icons | @expo/vector-icons |
| HTTP | fetch (built-in) |

## 2. Folder Structure

```
lesson-companion/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout, notification setup
│   ├── index.tsx               # Dashboard (main screen)
│   ├── settings.tsx            # Parental config URL input
│   └── focus.tsx               # Focus mode (post-join countdown)
├── src/
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces
│   ├── store/
│   │   ├── appStore.ts         # Zustand: config, stars, logs
│   │   └── sessionStore.ts     # Zustand: active session state
│   ├── services/
│   │   ├── configService.ts    # Fetch + cache remote config.json
│   │   ├── audioService.ts     # Download + play audio clips
│   │   ├── schedulerService.ts # Schedule expo-notifications
│   │   ├── webhookService.ts   # POST to parental webhook
│   │   └── cacheService.ts     # expo-file-system helpers
│   ├── hooks/
│   │   ├── useScheduler.ts     # Returns next lesson + countdown
│   │   ├── useStars.ts         # Star counter logic
│   │   └── useActiveLesson.ts  # Determine current T-minute state
│   ├── components/
│   │   ├── common/
│   │   │   ├── StarCounter.tsx
│   │   │   ├── ConfettiOverlay.tsx
│   │   │   └── AnimatedBackground.tsx
│   │   └── dashboard/
│   │       ├── SubjectCard.tsx  # Icon + shake/pulse animation
│   │       ├── NextLessonBanner.tsx
│   │       └── JoinButton.tsx
│   └── utils/
│       ├── timeUtils.ts        # Day/time parsing, countdown math
│       └── constants.ts        # Reminder offsets, storage keys
└── assets/
    ├── icons/                  # Cached subject icons
    └── audio/                  # Cached audio files
```

## 3. Data Flow

```
Remote config.json
       │
       ▼
 configService.fetchAndCache()
       │ downloads JSON + assets → expo-file-system cache
       ▼
   appStore (Zustand)
   ├── config: AppConfig
   ├── stars: number
   ├── weeklyGoal: number
   └── activityLogs: ActivityLog[]
       │
       ▼
 schedulerService.scheduleAll()
   → creates expo-notifications at T-60, T-30, T-5 for every lesson
       │
       ▼
 useActiveLesson() hook  (polls every 30s via setInterval)
   → returns: { subject, minutesUntil, phase: 'idle'|'t60'|'t30'|'t5'|'active' }
       │
       ▼
 Dashboard renders SubjectCard per subject
   → phase='t5' triggers shake+pulse animation + audioService.play(audio_5)
   → JoinButton becomes active at phase='t5'
       │
       ▼
 User taps JoinButton
   → Linking.openURL(meeting_url)
   → audioService.play(audio_success)
   → appStore.addStar()
   → webhookService.notify()
   → appStore.logActivity()
   → navigate to focus.tsx (countdown timer)
```

## 4. Scheduling Strategy

expo-notifications is used to trigger background audio reminders.

- On every config sync, `schedulerService.scheduleAll()` cancels existing notifications and re-schedules fresh ones.
- Three notification triggers per subject per scheduled day: T-60, T-30, T-5.
- Notification `data` payload carries `{ subjectId, phase }`.
- `_layout.tsx` registers a `notifications.addNotificationResponseReceivedListener` to handle foreground responses.
- For foreground audio (app is open), `useActiveLesson()` hook detects the phase and plays audio directly via `expo-av`.

## 5. Offline-First Strategy

1. On first launch, user enters config URL in Settings.
2. App fetches config.json and caches all assets (icons as `FileSystem.documentDirectory/icons/`, audio as `FileSystem.documentDirectory/audio/`).
3. Subsequent launches read from local cache. Network is only needed for manual "Update" action.
4. Reminders and join functionality work 100% offline after initial sync.

## 6. TypeScript Data Models

See `src/types/index.ts` for all interfaces.

## 7. Key Design Decisions

- **Zustand over Redux**: Simpler boilerplate, works well with Expo managed workflow.
- **expo-notifications for background**: Guarantees reminders fire even when app is backgrounded.
- **Foreground audio via expo-av**: Richer audio experience when app is in focus.
- **expo-file-system for caching**: Persists assets across sessions without network.
- **Expo Router**: Modern file-based routing, simplifies deep linking and navigation.
