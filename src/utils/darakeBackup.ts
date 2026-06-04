import { emitDarakeRuntimeEvent, DARAKE_GENTLE_FORM_UPDATED_EVENT } from './darakeRuntimeEvents';

/**
 * Keys included in the backup snapshot.
 * Only user-facing form/state data is included — no tokens, secrets, or internal counters.
 */
export const BACKUP_TARGET_KEYS = [
  'darake.gentleAppStartForm.v1',
  'darake.omakaseStartState.v1',
  'darake.issueDraft.v1',
] as const;

export type BackupTargetKey = (typeof BACKUP_TARGET_KEYS)[number];

export type DarakeBackupData = {
  version: 1;
  exportedAt: string;
  data: Partial<Record<BackupTargetKey, unknown>>;
};

/**
 * Create a JSON-serialisable snapshot of the backup target keys from localStorage.
 * Keys not present in localStorage are omitted from the snapshot.
 */
export function exportDarakeBackup(): DarakeBackupData {
  const data: Partial<Record<BackupTargetKey, unknown>> = {};
  for (const key of BACKUP_TARGET_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        data[key] = JSON.parse(raw) as unknown;
      }
    } catch {
      // Silently skip a key that cannot be read or parsed
    }
  }
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export type ImportResult =
  | { success: true; restoredKeys: BackupTargetKey[] }
  | { success: false; error: string };

/**
 * Parse a JSON string produced by {@link exportDarakeBackup} and restore the
 * contained values to localStorage. Only keys in BACKUP_TARGET_KEYS are written;
 * any extra keys in the JSON are silently ignored.
 *
 * - On success, same-tab components are notified via the runtime event system.
 * - On any failure the app state is left unchanged and an error message is returned.
 * - Never throws — all errors are returned as `{ success: false }`.
 */
export function importDarakeBackup(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { success: false, error: 'JSONの解析に失敗しました。テキストを確認してください。' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { success: false, error: 'JSONの形式が正しくありません（オブジェクトが必要です）。' };
  }

  const obj = parsed as Record<string, unknown>;

  if (obj['version'] !== 1) {
    return {
      success: false,
      error: `バージョン "${String(obj['version'])}" はサポートされていません（version: 1 が必要です）。`,
    };
  }

  if (!obj['data'] || typeof obj['data'] !== 'object' || Array.isArray(obj['data'])) {
    return { success: false, error: 'バックアップデータが見つかりません（"data" キーが必要です）。' };
  }

  const dataObj = obj['data'] as Record<string, unknown>;
  const restoredKeys: BackupTargetKey[] = [];

  for (const key of BACKUP_TARGET_KEYS) {
    if (!(key in dataObj)) continue;
    try {
      localStorage.setItem(key, JSON.stringify(dataObj[key]));
      restoredKeys.push(key);
    } catch {
      // Storage might be full; continue with remaining keys
    }
  }

  // Notify same-tab components to re-read from localStorage
  if (typeof window !== 'undefined') {
    emitDarakeRuntimeEvent(DARAKE_GENTLE_FORM_UPDATED_EVENT);
  }

  return { success: true, restoredKeys };
}

/**
 * Trigger a JSON file download of the current backup snapshot.
 */
export function downloadDarakeBackupFile(): void {
  const backup = exportDarakeBackup();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  a.href = url;
  a.download = `darake-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
