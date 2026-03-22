import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS } from '../../utils/constants';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  message?: string;
  onComplete?: () => void;
}

export function ConfettiOverlay({
  visible,
  message = 'مبروك! وصلتِ للهدف الأسبوعي!',
  onComplete,
}: Props) {
  const confettiRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (visible) {
      confettiRef.current?.start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: width / 2, y: -10 }}
        fadeOut
        autoStart={false}
        onAnimationEnd={onComplete}
        colors={[
          COLORS.primary,
          COLORS.secondary,
          COLORS.accent,
          COLORS.warning,
          COLORS.success,
          COLORS.star,
        ]}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  message: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    writingDirection: 'rtl',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    paddingHorizontal: 24,
    marginTop: height * 0.15,
  },
});
