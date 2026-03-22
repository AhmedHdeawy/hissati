import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/appStore';
import { useSessionStore } from '../src/store/sessionStore';
import { useActiveLesson } from '../src/hooks/useActiveLesson';
import { useStars } from '../src/hooks/useStars';
import { playAudio, resolveAudioUri } from '../src/services/audioService';
import { AnimatedBackground } from '../src/components/common/AnimatedBackground';
import { StarCounter } from '../src/components/common/StarCounter';
import { ConfettiOverlay } from '../src/components/common/ConfettiOverlay';
import { SubjectCard } from '../src/components/dashboard/SubjectCard';
import { NextLessonBanner } from '../src/components/dashboard/NextLessonBanner';
import { COLORS } from '../src/utils/constants';
import { findNextLesson } from '../src/utils/timeUtils';
import type { Subject, ActivityLog } from '../src/types';

export default function DashboardScreen() {
  const localConfig = useAppStore((s) => s.localConfig);
  const addActivityLog = useAppStore((s) => s.addActivityLog);

  const enterFocusMode = useSessionStore((s) => s.enterFocusMode);

  const activeLesson = useActiveLesson();
  const { stars, addStar, isGoalReached } = useStars();

  const [showConfetti, setShowConfetti] = useState(false);
  const [prevStarCount, setPrevStarCount] = useState(stars.count);

  // Trigger confetti when weekly goal is reached
  useEffect(() => {
    if (stars.count > prevStarCount && isGoalReached) {
      setShowConfetti(true);
    }
    setPrevStarCount(stars.count);
  }, [stars.count]);

  const handleJoinClass = useCallback(
    async (subject: Subject) => {
      // Play success audio
      const successUri = await resolveAudioUri(subject.audio.success, 'success');
      if (successUri) {
        await playAudio(successUri);
      }

      // Award star
      addStar();

      // Log activity
      const log: ActivityLog = {
        id: `${subject.id}_${Date.now()}`,
        subjectId: subject.id,
        subjectTitle: subject.title,
        joinedAt: new Date().toISOString(),
      };

      addActivityLog(log);

      // Open meeting URL
      if (subject.meeting_url) {
        try {
          await Linking.openURL(subject.meeting_url);
        } catch {
          Alert.alert(
            'تعذر فتح الرابط',
            'يرجى تثبيت Zoom او Google Meet للانضمام'
          );
        }
      }

      // Enter focus mode
      const endTime = new Date(Date.now() + subject.duration_minutes * 60_000);
      enterFocusMode(subject, endTime);
      router.push('/focus');
    },
    [addStar, addActivityLog, enterFocusMode]
  );

  const subjects = localConfig?.subjects ?? [];

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>اجتهدي يا مريم!</Text>
            <Text style={styles.subtitle}>هل أنتِ مستعدة للتعلم اليوم؟</Text>
          </View>
          <View style={styles.headerRight}>
            <StarCounter />
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => router.push('/(settings)')}
            >
              <MaterialCommunityIcons name="cog" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Next lesson banner */}
        <View style={styles.bannerRow}>
          <NextLessonBanner activeLesson={activeLesson} />
        </View>

        {/* Main content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {subjects.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={styles.cardsRow}>
              {subjects.map((subject) => {
                const isNextLesson = activeLesson?.subject.id === subject.id;
                const phase = isNextLesson ? activeLesson!.phase : 'idle';

                const subjectNext = findNextLesson([subject]);
                const minutesUntil = isNextLesson
                  ? activeLesson!.minutesUntil
                  : subjectNext?.minutesUntil ?? 9999;
                const sessionDate = isNextLesson
                  ? activeLesson!.sessionStartTime
                  : subjectNext?.sessionStart;

                return (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    phase={phase}
                    minutesUntil={minutesUntil}
                    sessionDate={sessionDate}
                    onJoin={() => handleJoinClass(subject)}
                    isActive={isNextLesson && phase !== 'idle'}
                  />
                );
              })}
            </View>
          )}

          {/* Weekly progress */}
          {subjects.length > 0 && (
            <WeeklyProgress
              count={stars.count}
              goal={stars.weeklyGoal}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Confetti overlay */}
      <ConfettiOverlay
        visible={showConfetti}
        message="مبروك! وصلتِ للهدف الأسبوعي!"
        onComplete={() => setShowConfetti(false)}
      />
    </AnimatedBackground>
  );
}

// ---- Sub-components ----

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="book-open" size={80} color="rgba(255,255,255,0.4)" />
      <Text style={styles.emptyTitle}>أهلاً يا مريم!</Text>
      <Text style={styles.emptySubtitle}>
        اطلبي من أحد والديكِ إعداد الدروس من الإعدادات
      </Text>
    </View>
  );
}

function WeeklyProgress({ count, goal }: { count: number; goal: number }) {
  const progress = Math.min(count / goal, 1);
  const starsRemaining = Math.max(goal - count, 0);

  return (
    <View style={styles.weeklyCard}>
      <Text style={styles.weeklyTitle}>التقدم الأسبوعي</Text>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.weeklySubtitle}>
        {count >= goal
          ? 'وصلتِ للهدف! أحسنتِ!'
          : `${starsRemaining} نجم${starsRemaining !== 1 ? '' : ''} للوصول إلى هدفكِ`}
      </Text>

      {/* Star dots */}
      <View style={styles.starDots}>
        {Array.from({ length: goal }, (_, i) => (
          <MaterialCommunityIcons
            key={i}
            name={i < count ? 'star' : 'star-outline'}
            size={28}
            color={i < count ? COLORS.star : 'rgba(255,255,255,0.3)'}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    maxWidth: 320,
  },
  weeklyCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    gap: 12,
  },
  weeklyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.star,
    borderRadius: 6,
  },
  weeklySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  starDots: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
