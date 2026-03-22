import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { formatMinutes } from '../../utils/timeUtils';
import type { ActiveLesson } from '../../types';

interface Props {
  activeLesson: ActiveLesson | null;
}

export function NextLessonBanner({ activeLesson }: Props) {
  if (!activeLesson || activeLesson.phase === 'idle') {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="calendar-check" size={20} color="rgba(255,255,255,0.8)" />
        <Text style={styles.text}>لا توجد دروس قادمة اليوم</Text>
      </View>
    );
  }

  if (activeLesson.phase === 'active') {
    return (
      <View style={[styles.container, styles.activeContainer]}>
        <MaterialCommunityIcons name="book-open" size={20} color={COLORS.success} />
        <Text style={[styles.text, styles.activeText]}>
          {activeLesson.subject.title} — الحصة بدأت!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="clock-outline" size={20} color="rgba(255,255,255,0.8)" />
      <Text style={styles.text}>
        الدرس القادم بعد{' '}
        <Text style={styles.highlight}>
          {formatMinutes(activeLesson.minutesUntil)}
        </Text>
        {' '}— {activeLesson.subject.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeContainer: {
    backgroundColor: 'rgba(6, 214, 160, 0.2)',
  },
  text: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  activeText: {
    color: COLORS.success,
    fontWeight: '700',
  },
  highlight: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
