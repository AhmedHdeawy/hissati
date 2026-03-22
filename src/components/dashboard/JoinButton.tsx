import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

interface Props {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
  color?: string;
}

export function JoinButton({
  onPress,
  disabled = false,
  label = 'انضمي للحصة الآن',
  color = COLORS.primary,
}: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: disabled ? '#CBD5E0' : color },
        ]}
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.94);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons
          name="video-plus"
          size={28}
          color={disabled ? '#A0AEC0' : '#FFFFFF'}
        />
        <Text style={[styles.text, disabled && styles.textDisabled]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  textDisabled: {
    color: '#A0AEC0',
  },
});
