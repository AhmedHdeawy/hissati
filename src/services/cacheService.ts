import * as FileSystem from 'expo-file-system';

const AUDIO_DIR = `${FileSystem.documentDirectory}mlc/audio/`;

async function ensureDir(dir: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

/**
 * Copy a picked audio file to app's document directory.
 * Returns the local URI of the copied file.
 */
export async function copyAudioToLocal(sourceUri: string, filename: string): Promise<string> {
  await ensureDir(AUDIO_DIR);
  const destUri = `${AUDIO_DIR}${filename}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

/**
 * Delete a custom audio file from local storage.
 */
export async function deleteCustomAudio(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // ignore
  }
}

/**
 * Delete all cached assets (audio directory).
 */
export async function clearAllCachedAssets(): Promise<void> {
  const info = await FileSystem.getInfoAsync(AUDIO_DIR);
  if (info.exists) {
    await FileSystem.deleteAsync(AUDIO_DIR, { idempotent: true });
  }
}

/**
 * Check if a local URI exists on disk.
 */
export async function localFileExists(uri: string): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists;
}
