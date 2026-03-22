import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';
import { useStars } from '../../hooks/useStars';

export function StarCounter() {
  const { stars } = useStars();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="star" size={22} color={COLORS.star} />
      <Text style={styles.count}>{stars.count}</Text>
      <Text style={styles.separator}>/</Text>
      <Text style={styles.goal}>{stars.weeklyGoal}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  count: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.star,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  separator: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  goal: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
});
