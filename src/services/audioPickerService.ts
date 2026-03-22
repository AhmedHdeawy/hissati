import * as DocumentPicker from 'expo-document-picker';
import { copyAudioToLocal } from './cacheService';

/**
 * Let the user pick an audio file and copy it to local storage.
 * Returns the local file URI, or null if cancelled.
 */
export async function pickAudioFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'audio/*',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const ext = asset.name.split('.').pop() ?? 'mp3';
  const filename = `custom_${Date.now()}.${ext}`;

  return copyAudioToLocal(asset.uri, filename);
}
