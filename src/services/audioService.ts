import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import type { AudioSource } from '../types';

let currentSound: Audio.Sound | null = null;

// Bundled default audio files
const BUNDLED_AUDIO = {
  t60: require('../../assets/sounds/notification_t60.mp3'),
  t30: require('../../assets/sounds/notification_t30.mp3'),
  t5: require('../../assets/sounds/notification_t5.mp3'),
  success: require('../../assets/sounds/notification_success.mp3'),
} as const;

/**
 * Resolve an AudioSource to a playable URI.
 * For 'default' sources, resolves the bundled asset.
 * For 'custom' sources, returns the stored URI directly.
 */
export async function resolveAudioUri(
  source: AudioSource,
  tier: keyof typeof BUNDLED_AUDIO
): Promise<string | null> {
  if (source.type === 'custom') return source.uri;
  try {
    const asset = Asset.fromModule(BUNDLED_AUDIO[tier]);
    await asset.downloadAsync();
    return asset.localUri;
  } catch {
    return null;
  }
}

/**
 * Configure audio session for playback (call once at app start).
 */
export async function configureAudio(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
  });
}

/**
 * Play an audio file from a local URI or remote URL.
 * Stops any currently playing sound first.
 */
export async function playAudio(uri: string | null): Promise<void> {
  if (!uri) return;

  try {
    // Stop existing sound
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, volume: 1.0 }
    );

    currentSound = sound;

    // Auto-cleanup when finished
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (currentSound === sound) {
          currentSound = null;
        }
      }
    });
  } catch (error) {
    console.warn('[AudioService] Failed to play audio:', uri, error);
  }
}

/**
 * Stop current playback.
 */
export async function stopAudio(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // ignore
    }
    currentSound = null;
  }
}
