import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';
import { scheduleAllReminders } from '../../src/services/schedulerService';
import { deleteCustomAudio } from '../../src/services/cacheService';
import { AnimatedBackground } from '../../src/components/common/AnimatedBackground';
import { COLORS, SUBJECT_ICONS } from '../../src/utils/constants';
import type { Subject } from '../../src/types';

const DAY_LABELS: Record<string, string> = {
  Sunday: 'احد',
  Monday: 'اثنين',
  Tuesday: 'ثلاثاء',
  Wednesday: 'اربعاء',
  Thursday: 'خميس',
  Friday: 'جمعة',
  Saturday: 'سبت',
};

function getIconName(icon: string): string {
  const found = SUBJECT_ICONS.find((i) => i.name === icon);
  return found ? found.name : 'book-open-variant';
}

export default function ManageScreen() {
  const localConfig = useAppStore((s) => s.localConfig);
  const deleteSubject = useAppStore((s) => s.deleteSubject);
  const activityLogs = useAppStore((s) => s.activityLogs);
  const clearLogs = useAppStore((s) => s.clearLogs);

  const subjects = localConfig?.subjects ?? [];

  const handleDelete = (subject: Subject) => {
    Alert.alert(
      'حذف المادة',
      `هل تريد حذف "${subject.title}"؟`,
      [
        { text: 'الغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            for (const tier of ['t60', 't30', 't5', 'success'] as const) {
              const source = subject.audio[tier];
              if (source.type === 'custom') {
                await deleteCustomAudio(source.uri);
              }
            }
            deleteSubject(subject.id);
            const remaining = subjects.filter((s) => s.id !== subject.id);
            await scheduleAllReminders(remaining);
          },
        },
      ]
    );
  };

  const handleClearLogs = () => {
    Alert.alert(
      'مسح سجل النشاط',
      'سيتم حذف كامل سجل النشاط. هل تريد المتابعة؟',
      [
        { text: 'الغاء', style: 'cancel' },
        { text: 'مسح', style: 'destructive', onPress: clearLogs },
      ]
    );
  };

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.replace('/')}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ادارة المواد</Text>
          <TouchableOpacity
            style={[styles.headerBtn, styles.addBtn]}
            onPress={() => router.push('/(settings)/subject')}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Subjects */}
          {subjects.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyCircle}>
                <MaterialCommunityIcons
                  name="book-plus"
                  size={48}
                  color="rgba(255,255,255,0.6)"
                />
              </View>
              <Text style={styles.emptyText}>لا توجد مواد بعد</Text>
              <Text style={styles.emptySubtext}>
                اضغط + لاضافة مادة جديدة
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                المواد ({subjects.length})
              </Text>
              {subjects.map((subject, index) => (
                <View
                  key={subject.id}
                  style={[
                    styles.subjectRow,
                    index < subjects.length - 1 && styles.subjectRowBorder,
                  ]}
                >
                  {/* Icon */}
                  <View style={[styles.subjectIconCircle, { backgroundColor: COLORS.primary }]}>
                    <MaterialCommunityIcons
                      name={getIconName(subject.icon) as any}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>

                  {/* Info */}
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectTitle}>{subject.title}</Text>
                    <Text style={styles.subjectMeta}>
                      {subject.duration_minutes} د |{' '}
                      {subject.schedule
                        .map((s) => `${DAY_LABELS[s.day]} ${s.time}`)
                        .join(' - ')}
                    </Text>
                  </View>

                  {/* Actions */}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      router.push(`/(settings)/subject?id=${subject.id}`)
                    }
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={18}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleDelete(subject)}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={18}
                      color={COLORS.secondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Activity Logs */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                سجل النشاط ({activityLogs.length})
              </Text>
              {activityLogs.length > 0 && (
                <TouchableOpacity onPress={handleClearLogs}>
                  <Text style={styles.clearText}>مسح</Text>
                </TouchableOpacity>
              )}
            </View>
            {activityLogs.length === 0 ? (
              <Text style={styles.emptyLogText}>لا يوجد نشاط بعد</Text>
            ) : (
              activityLogs.slice(0, 10).map((log, index) => (
                <View
                  key={log.id}
                  style={[
                    styles.logRow,
                    index < Math.min(activityLogs.length, 10) - 1 && styles.logRowBorder,
                  ]}
                >
                  <View style={styles.logDot} />
                  <View style={styles.logContent}>
                    <Text style={styles.logSubject}>{log.subjectTitle}</Text>
                    <Text style={styles.logTime}>
                      {new Date(log.joinedAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
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
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.3)',
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
    gap: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  subjectRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  subjectIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectInfo: {
    flex: 1,
    gap: 4,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  subjectMeta: {
    fontSize: 12,
    color: '#64748B',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(108,99,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyLogText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  logRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  logContent: {
    flex: 1,
  },
  logSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  logTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
