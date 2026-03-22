# حصتي (Hissati)

A lesson companion app for kids — helps children join their online classes on time with reminders, gamification, and parental controls.

Built with React Native + Expo for Android tablets.

## Features

- **Lesson Dashboard** — shows upcoming lessons with countdown timers and join buttons
- **Smart Reminders** — audio notifications at 60, 30, and 5 minutes before each lesson
- **Focus Mode** — timer screen during lessons with motivational messages
- **Star Rewards** — earn stars for joining lessons, track weekly progress
- **Parental Settings** — add/edit subjects, schedules, meeting URLs, and custom audio (locked behind a math gate)

## Screenshots

| Home | Empty State |
|------|------------|
| ![Home](screens/Home.png) | ![Empty Home](screens/Empty%20Home.png) |

| Parent Access | Manage Subjects |
|--------------|----------------|
| ![Parent Access](screens/Parent%20Access.png) | ![Manage Subject](screens/Manage%20Subject.png) |

| Add Subject |
|------------|
| ![Add Subject](screens/Add%20Subject.png) |

## Tech Stack

- **Expo SDK 55** / React Native 0.83
- **expo-router** — file-based navigation
- **expo-audio** — audio playback for reminders
- **expo-notifications** — scheduled push notifications
- **zustand** — state management with AsyncStorage persistence
- **react-native-reanimated** — animations

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npx expo start

# Build APK for testing
eas build --platform android --profile preview
```

## Project Structure

```
app/
  index.tsx              # Main dashboard
  focus.tsx              # Focus mode timer
  (settings)/
    index.tsx            # Math gate (parental lock)
    manage.tsx           # Subject list & activity logs
    subject.tsx          # Add/edit subject form
src/
  components/            # Reusable UI components
  hooks/                 # useActiveLesson, useStars
  services/              # Audio, notifications, file management
  store/                 # Zustand stores (app state, session)
  types/                 # TypeScript definitions
  utils/                 # Constants, time utilities
```
