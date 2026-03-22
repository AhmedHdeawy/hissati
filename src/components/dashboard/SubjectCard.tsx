import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { formatMinutes } from '../../utils/timeUtils';
import type { Subject, LessonPhase } from '../../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min((width - 60) / 2, 320);

interface Props {
  subject: Subject;
  phase: LessonPhase;
  minutesUntil: number;
  sessionDate?: Date;
  onJoin: () => void;
  isActive: boolean;
}

function getSubjectColor(id: string): string {
  const key = id.toLowerCase();
  if (key.includes('quran')) return COLORS.quran;
  if (key.includes('eng')) return COLORS.english;
  return COLORS.primary;
}

function getSubjectIcon(id: string): string {
  const key = id.toLowerCase();
  if (key.includes('quran')) return 'book-open-variant';
  if (key.includes('eng')) return 'school';
  return 'book-education';
}

function getFloatingIconName(id: string): string {
  return id.toLowerCase().includes('quran') ? 'moon-outline' : 'book-outline';
}

// Sparkle positions radiating from button center
const SPARKLE_OFFSETS = [
  { dx: -20, dy: -20 },
  { dx: 20, dy: -20 },
  { dx: -20, dy: 20 },
  { dx: 20, dy: 20 },
];

function SparkleParticle({ dx, dy }: { dx: number; dy: number }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const op = useSharedValue(1);
  const sc = useSharedValue(0);

  useEffect(() => {
    tx.value = withTiming(dx, { duration: 600, easing: Easing.out(Easing.quad) });
    ty.value = withTiming(dy, { duration: 600, easing: Easing.out(Easing.quad) });
    op.value = withTiming(0, { duration: 600 });
    sc.value = withTiming(1, { duration: 300 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: sc.value }],
    opacity: op.value,
    position: 'absolute',
    left: 0,
    top: 0,
  }));

  return (
    <Animated.View style={style} pointerEvents="none">
      <Ionicons name="star" size={8} color="#FBBF24" />
    </Animated.View>
  );
}

function FloatingIcon({ iconName, color }: { iconName: string; color: string }) {
  const ty = useSharedValue(0);

  useEffect(() => {
    ty.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.35,
  }));

  return (
    <Animated.View style={style} pointerEvents="none">
      <Ionicons name={iconName as any} size={14} color={color} />
    </Animated.View>
  );
}

function CornerStar({ color, paused }: { color: string; paused: boolean }) {
  const sc = useSharedValue(1);

  useEffect(() => {
    if (paused) {
      cancelAnimation(sc);
      sc.value = withTiming(1, { duration: 300 });
    } else {
      sc.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [paused]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: sc.value }],
    position: 'absolute',
    top: -2,
    left: -2,
  }));

  return (
    <Animated.View style={style} pointerEvents="none">
      <Ionicons name="star-outline" size={10} color={color} />
    </Animated.View>
  );
}

export function SubjectCard({
  subject,
  phase,
  minutesUntil,
  sessionDate,
  onJoin,
  isActive,
}: Props) {
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const entranceX = useSharedValue(0);

  const [sparkling, setSparkling] = useState(false);

  const color = getSubjectColor(subject.id);
  const iconName = getSubjectIcon(subject.id);
  const floatingIconName = getFloatingIconName(subject.id);
  const isNearLesson = phase === 't5' || phase === 'active';
  const isJoinable = isNearLesson;

  // Entrance wiggle — once on mount
  useEffect(() => {
    entranceX.value = withSequence(
      withTiming(-4, { duration: 100, easing: Easing.inOut(Easing.ease) }),
      withTiming(4, { duration: 100, easing: Easing.inOut(Easing.ease) }),
      withTiming(-2, { duration: 120, easing: Easing.inOut(Easing.ease) }),
      withTiming(2, { duration: 120, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 150, easing: Easing.out(Easing.ease) }),
    );
  }, []);

  // Breathe + glow at T-5
  useEffect(() => {
    if (isNearLesson) {
      iconScale.value = withRepeat(
        withTiming(1.10, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withTiming(0.85, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      glowScale.value = withRepeat(
        withTiming(1.04, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      cancelAnimation(iconScale);
      cancelAnimation(glowOpacity);
      cancelAnimation(glowScale);
      iconScale.value = withSpring(1);
      glowOpacity.value = withTiming(0, { duration: 300 });
      glowScale.value = withSpring(1);
    }
  }, [phase]);

  const handlePressIn = () => { cardScale.value = withSpring(0.97); };
  const handlePressOut = () => { cardScale.value = withSpring(1); };

  const handleJoinPress = () => {
    setSparkling(true);
    setTimeout(() => setSparkling(false), 700);
    onJoin();
  };

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const cardAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }, { translateX: entranceX.value }],
  }));

  let timeLabel: string;
  if (minutesUntil <= 0) {
    timeLabel = 'الحصة بدأت!';
  } else if (minutesUntil <= 5) {
    timeLabel = 'تبدأ الآن!';
  } else if (minutesUntil > 24 * 60) {
    timeLabel = sessionDate ? `يوم ${formatMinutes(minutesUntil, sessionDate)}` : 'قريباً';
  } else {
    timeLabel = `بعد ${formatMinutes(minutesUntil)}`;
  }

  return (
    <Animated.View style={[styles.card, cardAnimStyle]}>
      {/* Glow ring — outside clip wrapper */}
      <Animated.View
        style={[styles.glowRing, { borderColor: color }, glowStyle]}
        pointerEvents="none"
      />

      {/* Clip wrapper for top stripe */}
      <View style={styles.cardClipWrapper}>
        <View style={[styles.topStripe, { backgroundColor: color }]} />

        <View style={styles.cardContentRow}>
          {/* Icon medallion */}
          <Animated.View
            style={[
              styles.iconOuter,
              { backgroundColor: color, shadowColor: color },
              iconAnimStyle,
            ]}
          >
            <View style={styles.iconInner}>
              <MaterialCommunityIcons
                name={(subject.icon || iconName) as any}
                size={44}
                color={color}
              />
            </View>
            <CornerStar color={color} paused={isNearLesson} />
          </Animated.View>

          {/* Info column */}
          <View style={styles.infoCol}>
            {!isNearLesson && (
              <FloatingIcon iconName={floatingIconName} color={color} />
            )}

            <Text style={styles.title}>{subject.title}</Text>

            {/* Time badge */}
            <View style={[
              styles.timeBadge,
              isJoinable
                ? [styles.timeBadgeActive, { backgroundColor: color, shadowColor: color }]
                : styles.timeBadgeIdle,
            ]}>
              <MaterialCommunityIcons
                name={isJoinable ? 'bell-ring' : 'clock-outline'}
                size={13}
                color={isJoinable ? 'rgba(255,255,255,0.85)' : '#94A3B8'}
              />
              <Text style={[styles.timeText, isJoinable ? styles.timeTextActive : styles.timeTextIdle]}>
                {timeLabel}
              </Text>
            </View>

            {/* Join button with sparkle burst */}
            <View style={styles.joinWrapper}>
              {sparkling && SPARKLE_OFFSETS.map((offset, i) => (
                <SparkleParticle key={i} dx={offset.dx} dy={offset.dy} />
              ))}
              <TouchableOpacity
                style={[
                  styles.joinButton,
                  isJoinable
                    ? [styles.joinButtonActive, { backgroundColor: color, shadowColor: color }]
                    : styles.joinButtonDisabled,
                ]}
                onPress={handleJoinPress}
                disabled={!isJoinable}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name={isJoinable ? 'video' : 'video-off'}
                  size={18}
                  color={isJoinable ? '#FFFFFF' : 'rgba(100,116,139,0.5)'}
                />
                <Text style={[styles.joinText, !isJoinable && styles.joinTextDisabled]}>
                  انضمي
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#3B1FA8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 14,
    overflow: 'visible',
  },
  glowRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 34,
    borderWidth: 3.5,
  },
  cardClipWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  topStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    gap: 14,
  },
  iconOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  iconInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // icon is now rendered via MaterialCommunityIcons directly
  infoCol: {
    flex: 1,
    gap: 8,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'right',
    writingDirection: 'rtl',
    letterSpacing: -0.3,
    lineHeight: 26,
    flexShrink: 1,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  timeBadgeActive: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  timeBadgeIdle: {
    backgroundColor: 'rgba(241,245,249,0.80)',
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.60)',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  timeTextActive: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timeTextIdle: {
    color: '#64748B',
  },
  joinWrapper: {
    alignSelf: 'flex-start',
    position: 'relative',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 16,
  },
  joinButtonActive: {
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  joinButtonDisabled: {
    backgroundColor: 'rgba(148,163,184,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(148,163,184,0.30)',
    elevation: 0,
  },
  joinText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    writingDirection: 'rtl',
  },
  joinTextDisabled: {
    fontWeight: '600',
    color: 'rgba(100,116,139,0.60)',
  },
});
