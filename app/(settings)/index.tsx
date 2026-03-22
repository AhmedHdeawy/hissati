import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedBackground } from '../../src/components/common/AnimatedBackground';
import { COLORS } from '../../src/utils/constants';

function newQuestion() {
  const a = Math.floor(Math.random() * 15) + 1;
  const b = Math.floor(Math.random() * 15) + 1;
  return { a, b };
}

export default function MathGateScreen() {
  const [question, setQuestion] = useState(newQuestion);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handleSubmit = () => {
    const parsed = parseInt(answer, 10);
    if (parsed === question.a + question.b) {
      router.replace('/(settings)/manage');
    } else {
      setError(true);
      setAnswer('');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start(() => {
        setQuestion(newQuestion());
        setError(false);
      });
    }
  };

  return (
    <AnimatedBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>اعدادات ولي الامر</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.lockCircle}>
            <MaterialCommunityIcons name="lock" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>للوالدين فقط</Text>
          <Text style={styles.subtitle}>حل المسالة للدخول</Text>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>
              {question.a} + {question.b} = ?
            </Text>
          </View>

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={answer}
              onChangeText={(text) => {
                setAnswer(text);
                setError(false);
              }}
              placeholder="..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="number-pad"
              textAlign="center"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              autoFocus
            />
          </Animated.View>

          {error && (
            <Text style={styles.errorText}>اجابة خاطئة، حاول مرة اخرى</Text>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <MaterialCommunityIcons name="arrow-left-circle" size={22} color={COLORS.primary} />
            <Text style={styles.submitText}>دخول</Text>
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
    gap: 16,
  },
  lockCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 48,
    marginVertical: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  questionText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    width: 160,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#FF6584',
    backgroundColor: 'rgba(255,101,132,0.15)',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(255,101,132,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  submitText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '900',
  },
});
