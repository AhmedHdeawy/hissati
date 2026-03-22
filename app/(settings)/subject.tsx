import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';
import { scheduleAllReminders } from '../../src/services/schedulerService';
import { pickAudioFile } from '../../src/services/audioPickerService';
import { deleteCustomAudio } from '../../src/services/cacheService';
import { AnimatedBackground } from '../../src/components/common/AnimatedBackground';
import { COLORS, SUBJECT_ICONS, DAYS_OF_WEEK, TIME_SLOTS } from '../../src/utils/constants';
import type { Subject, Schedule, SubjectAudio } from '../../src/types';

const DEFAULT_AUDIO: SubjectAudio = {
  t60: { type: 'default' },
  t30: { type: 'default' },
  t5: { type: 'default' },
  success: { type: 'default' },
};

const AUDIO_TIERS = [
  { key: 't60' as const, label: 'قبل 60 دقيقة' },
  { key: 't30' as const, label: 'قبل 30 دقيقة' },
  { key: 't5' as const, label: 'قبل 5 دقائق' },
  { key: 'success' as const, label: 'عند الانضمام' },
] as const;

export default function SubjectEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const localConfig = useAppStore((s) => s.localConfig);
  const addSubject = useAppStore((s) => s.addSubject);
  const updateSubject = useAppStore((s) => s.updateSubject);

  const existing = id
    ? localConfig?.subjects.find((s) => s.id === id) ?? null
    : null;
  const isEditing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? 'book-open-variant');
  const [duration, setDuration] = useState(
    existing ? String(existing.duration_minutes) : '45'
  );
  const [meetingUrl, setMeetingUrl] = useState(existing?.meeting_url ?? '');
  const [schedules, setSchedules] = useState<Schedule[]>(
    existing?.schedule ?? [{ day: 'Sunday', time: '09:00' }]
  );
  const [audio, setAudio] = useState<SubjectAudio>(
    existing?.audio ?? { ...DEFAULT_AUDIO }
  );

  // Which schedule index has its time picker expanded (null = none)
  const [expandedTimeIndex, setExpandedTimeIndex] = useState<number | null>(null);

  const handleAddSchedule = () => {
    setSchedules([...schedules, { day: 'Sunday', time: '09:00' }]);
  };

  const handleRemoveSchedule = (index: number) => {
    if (schedules.length <= 1) return;
    setExpandedTimeIndex(null);
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const handleScheduleDay = (index: number, day: Schedule['day']) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], day };
    setSchedules(updated);
  };

  const handleSelectTime = (index: number, time: string) => {
    const updated = [...schedules];
    updated[index] = { ...updated[index], time };
    setSchedules(updated);
    setExpandedTimeIndex(null);
  };

  const handlePickAudio = async (tier: keyof SubjectAudio) => {
    try {
      const uri = await pickAudioFile();
      if (uri) {
        const old = audio[tier];
        if (old.type === 'custom') {
          await deleteCustomAudio(old.uri);
        }
        setAudio({ ...audio, [tier]: { type: 'custom', uri } });
      }
    } catch {
      Alert.alert('خطا', 'تعذر اختيار الملف الصوتي');
    }
  };

  const handleResetAudio = async (tier: keyof SubjectAudio) => {
    const old = audio[tier];
    if (old.type === 'custom') {
      await deleteCustomAudio(old.uri);
    }
    setAudio({ ...audio, [tier]: { type: 'default' } });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('خطا', 'يرجى ادخال اسم المادة');
      return;
    }

    const dur = parseInt(duration, 10);
    if (!dur || dur <= 0) {
      Alert.alert('خطا', 'يرجى ادخال مدة صحيحة');
      return;
    }

    if (meetingUrl && !meetingUrl.startsWith('http')) {
      Alert.alert('خطا', 'يرجى ادخال رابط صحيح يبدا بـ http');
      return;
    }

    const subject: Subject = {
      id: existing?.id ?? Date.now().toString(),
      title: title.trim(),
      icon,
      duration_minutes: dur,
      schedule: schedules,
      audio,
      meeting_url: meetingUrl.trim(),
    };

    if (isEditing) {
      updateSubject(subject);
    } else {
      addSubject(subject);
    }

    const allSubjects = isEditing
      ? (localConfig?.subjects ?? []).map((s) =>
          s.id === subject.id ? subject : s
        )
      : [...(localConfig?.subjects ?? []), subject];
    await scheduleAllReminders(allSubjects);

    router.back();
  };

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'تعديل المادة' : 'اضافة مادة'}
          </Text>
          <TouchableOpacity
            style={[styles.headerBtn, styles.saveHeaderBtn]}
            onPress={handleSave}
          >
            <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>اسم المادة</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="مثال: القران الكريم"
              placeholderTextColor="#94A3B8"
              textAlign="right"
            />
          </View>

          {/* Icon */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>الايقونة</Text>
            <View style={styles.iconGrid}>
              {SUBJECT_ICONS.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.iconOption,
                    icon === item.name && styles.iconSelected,
                  ]}
                  onPress={() => setIcon(item.name)}
                >
                  <MaterialCommunityIcons
                    name={item.name as any}
                    size={24}
                    color={icon === item.name ? '#FFFFFF' : '#64748B'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>المدة (بالدقائق)</Text>
            <TextInput
              style={[styles.input, styles.shortInput]}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
              textAlign="center"
            />
          </View>

          {/* Meeting URL */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>رابط الاجتماع</Text>
            <TextInput
              style={[styles.input, styles.urlInput]}
              value={meetingUrl}
              onChangeText={setMeetingUrl}
              placeholder="https://zoom.us/j/..."
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="url"
              textAlign="left"
            />
          </View>

          {/* Schedule */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>المواعيد</Text>
              <TouchableOpacity
                style={styles.addScheduleBtn}
                onPress={handleAddSchedule}
              >
                <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {schedules.map((schedule, index) => (
              <View key={index} style={styles.scheduleBlock}>
                {/* Day chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dayChips}
                >
                  {[...DAYS_OF_WEEK].reverse().map(({ key, label }) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.dayChip,
                        schedule.day === key && styles.dayChipActive,
                      ]}
                      onPress={() => handleScheduleDay(index, key)}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          schedule.day === key && styles.dayChipTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Time picker button + delete */}
                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={styles.timePickerBtn}
                    onPress={() =>
                      setExpandedTimeIndex(
                        expandedTimeIndex === index ? null : index
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={18}
                      color={COLORS.primary}
                    />
                    <Text style={styles.timePickerText}>
                      {schedule.time || 'اختر الوقت'}
                    </Text>
                    <MaterialCommunityIcons
                      name={expandedTimeIndex === index ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                  {schedules.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeScheduleBtn}
                      onPress={() => handleRemoveSchedule(index)}
                    >
                      <MaterialCommunityIcons
                        name="minus-circle"
                        size={22}
                        color={COLORS.secondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Inline time grid (expanded) */}
                {expandedTimeIndex === index && (
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = schedule.time === slot;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[
                            styles.timeSlot,
                            isSelected && styles.timeSlotSelected,
                          ]}
                          onPress={() => handleSelectTime(index, slot)}
                        >
                          <Text
                            style={[
                              styles.timeSlotText,
                              isSelected && styles.timeSlotTextSelected,
                            ]}
                          >
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Audio */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>الاصوات</Text>
            {AUDIO_TIERS.map(({ key, label }) => (
              <View key={key} style={styles.audioRow}>
                <View style={styles.audioInfo}>
                  <Text style={styles.audioLabel}>{label}</Text>
                  <Text style={styles.audioStatus}>
                    {audio[key].type === 'default' ? 'افتراضي' : 'مخصص'}
                  </Text>
                </View>
                <View style={styles.audioActions}>
                  <TouchableOpacity
                    style={styles.audioBtn}
                    onPress={() => handlePickAudio(key)}
                  >
                    <MaterialCommunityIcons
                      name="file-music"
                      size={18}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                  {audio[key].type === 'custom' && (
                    <TouchableOpacity
                      style={styles.audioBtn}
                      onPress={() => handleResetAudio(key)}
                    >
                      <MaterialCommunityIcons
                        name="restore"
                        size={18}
                        color="#94A3B8"
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Save button */}
          <TouchableOpacity style={styles.saveBottomBtn} onPress={handleSave}>
            <MaterialCommunityIcons
              name="content-save"
              size={22}
              color={COLORS.primary}
            />
            <Text style={styles.saveBottomText}>
              {isEditing ? 'حفظ التعديلات' : 'اضافة المادة'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveHeaderBtn: {
    backgroundColor: COLORS.success,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    padding: 20,
    gap: 12,
    shadowColor: '#3B1FA8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 14,
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  shortInput: {
    width: 100,
    alignSelf: 'flex-start',
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  urlInput: {
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  iconGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  addScheduleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleBlock: {
    gap: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  dayChips: {
    gap: 6,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  dayChipActive: {
    backgroundColor: COLORS.primary,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  timeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  timePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  timePickerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    minWidth: 50,
    textAlign: 'center',
  },
  removeScheduleBtn: {
    padding: 4,
  },
  // Inline time grid
  timeGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
  },
  timeSlot: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeSlotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  audioRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  audioInfo: {
    flex: 1,
    gap: 2,
  },
  audioLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  audioStatus: {
    fontSize: 12,
    color: '#94A3B8',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  audioActions: {
    flexDirection: 'row',
    gap: 8,
  },
  audioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 4,
    shadowColor: '#3B1FA8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBottomText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '900',
  },
});
