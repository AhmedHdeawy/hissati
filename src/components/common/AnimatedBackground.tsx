import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../utils/constants';

interface Props {
  children: React.ReactNode;
  style?: object;
}

export function AnimatedBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={['#6C63FF', '#FF6584', '#43D9AD']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {/* Decorative circles */}
      <View style={[styles.bubble, styles.bubble1]} />
      <View style={[styles.bubble, styles.bubble2]} />
      <View style={[styles.bubble, styles.bubble3]} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
    backgroundColor: '#FFFFFF',
  },
  bubble1: {
    width: 300,
    height: 300,
    top: -80,
    left: -80,
  },
  bubble2: {
    width: 200,
    height: 200,
    bottom: 40,
    right: -60,
  },
  bubble3: {
    width: 150,
    height: 150,
    bottom: 100,
    left: '30%',
  },
});
