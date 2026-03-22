import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Asset } from 'expo-asset';
import type { AudioSource } from '../types';

let currentPlayer: ReturnType<typeof createAudioPlayer> | null = null;

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
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'duckOthers',
  });
}

/**
 * Play an audio file from a local URI or remote URL.
 * Stops any currently playing sound first.
 */
export async function playAudio(uri: string | null): Promise<void> {
  if (!uri) return;

  try {
    // Stop existing player
    if (currentPlayer) {
      currentPlayer.remove();
      currentPlayer = null;
    }

    const player = createAudioPlayer(uri);
    currentPlayer = player;

    // Auto-cleanup when finished
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        player.remove();
        if (currentPlayer === player) {
          currentPlayer = null;
        }
      }
    });

    player.play();
  } catch (error) {
    console.warn('[AudioService] Failed to play audio:', uri, error);
  }
}

/**
 * Stop current playback.
 */
export async function stopAudio(): Promise<void> {
  if (currentPlayer) {
    try {
      currentPlayer.remove();
    } catch {
      // ignore
    }
    currentPlayer = null;
  }
}
