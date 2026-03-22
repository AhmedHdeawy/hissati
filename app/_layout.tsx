import React, { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { hydrateAppStore } from '../src/store/appStore';
import { configureAudio } from '../src/services/audioService';
import {
  configureNotificationHandler,
  ensureNotificationChannel,
} from '../src/services/schedulerService';

I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const onReady = useCallback(async () => {
    // Hydrate persisted state
    await hydrateAppStore();
    // Configure audio session
    await configureAudio();
    // Configure notifications
    configureNotificationHandler();
    await ensureNotificationChannel();
    // Hide splash
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    // Handle notification taps (background -> foreground)
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as any;
        if (data?.subjectId) {
          console.log('[Notification] Tapped:', data);
        }
      }
    );
    return () => sub.remove();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(settings)" options={{ headerShown: false }} />
        <Stack.Screen
          name="focus"
          options={{
            animation: 'slide_from_bottom',
            gestureEnabled: false,
          }}
        />
      </Stack>
    </>
  );
}
