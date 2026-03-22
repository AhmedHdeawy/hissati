import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSessionStore } from '../src/store/sessionStore';
import { formatCountdown } from '../src/utils/timeUtils';
import { COLORS } from '../src/utils/constants';

const STUDY_MESSAGES = [
  'اجتهدي يا مريم!',
  'أنتِ رائعة!',
  'ركّزي وستنجحين!',
  'التعلم يجعلكِ أقوى!',
  'كل درس يجعلكِ أذكى!',
];

export default function FocusScreen() {
  const focusModeSubject = useSessionStore((s) => s.focusModeSubject);
  const focusModeEndTime = useSessionStore((s) => s.focusModeEndTime);
  const exitFocusMode = useSessionStore((s) => s.exitFocusMode);

  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!focusModeEndTime) return;

    function tick() {
      const remaining = Math.floor(
        (focusModeEndTime!.getTime() - Date.now()) / 1000
      );
      if (remaining <= 0) {
        setSecondsRemaining(0);
        setIsDone(true);
      } else {
        setSecondsRemaining(remaining);
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [focusModeEndTime]);

  // Rotate study messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % STUDY_MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExit = () => {
    exitFocusMode();
    router.back();
  };

  const totalSeconds = focusModeSubject
    ? focusModeSubject.duration_minutes * 60
    : 1;
  const progress = 1 - secondsRemaining / totalSeconds;

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Subject title */}
        <Text style={styles.subjectLabel}>
          {focusModeSubject?.title ?? 'Lesson'}
        </Text>

        {isDone ? (
          <DoneView onExit={handleExit} />
        ) : (
          <>
            {/* Countdown ring */}
            <View style={styles.timerContainer}>
              <View style={styles.timerRing}>
                <Text style={styles.timerText}>
                  {formatCountdown(secondsRemaining)}
                </Text>
                <Text style={styles.timerLabel}>متبقي</Text>
              </View>
            </View>

            {/* Study message */}
            <Text style={styles.studyMessage}>
              {STUDY_MESSAGES[messageIndex]}
            </Text>

            {/* Star earned notification */}
            <View style={styles.starEarned}>
              <MaterialCommunityIcons
                name="star"
                size={24}
                color={COLORS.star}
              />
              <Text style={styles.starText}>حصلتِ على نجمة!</Text>
            </View>

            {/* Exit button (subtle) */}
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleExit}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="exit-to-app"
                size={18}
                color="rgba(255,255,255,0.4)"
              />
              <Text style={styles.exitText}>الخروج من وضع التركيز</Text>
            </TouchableOpacity>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

function DoneView({ onExit }: { onExit: () => void }) {
  return (
    <View style={styles.doneContainer}>
      <MaterialCommunityIcons name="trophy" size={100} color={COLORS.star} />
      <Text style={styles.doneTitle}>أحسنتِ!</Text>
      <Text style={styles.doneSubtitle}>
        عمل رائع يا مريم! لقد أنهيتِ درسكِ!
      </Text>
      <TouchableOpacity style={styles.doneButton} onPress={onExit}>
        <Text style={styles.doneButtonText}>العودة للرئيسية</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 32,
  },
  subjectLabel: {
    fontSize: 28,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  timerText: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  studyMessage: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    writingDirection: 'rtl',
    opacity: 0.9,
  },
  starEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  starText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.star,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
  },
  exitText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  doneContainer: {
    alignItems: 'center',
    gap: 20,
  },
  doneTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  doneSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    writingDirection: 'rtl',
    maxWidth: 320,
  },
  doneButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
