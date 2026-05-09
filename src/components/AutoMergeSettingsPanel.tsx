import { useState } from 'react';
import {
  loadAutoMergeSettings,
  saveAutoMergeSettings,
  resetAutoMergeSettings,
} from '../utils/autoMergeSettings';
import type { AutoMergeMode, AutoMergeSettings } from '../utils/autoMergeSettings';

const MODE_LABELS: Record<AutoMergeMode, string> = {
  disabled: '無効（初期値）',
  'manual-candidate-only': '候補表示のみ',
  'low-risk-only': '低リスク自動マージ',
};

const MODE_NOTES: Record<AutoMergeMode, string> = {
  disabled: '自動マージ機能をすべてOFFにします。',
  'manual-candidate-only': '安全なPRを「マージ候補」として表示します。自動マージはしません。',
  'low-risk-only': '低リスク条件を満たすPRのみ自動マージします。危険変更は必ず止めます。',
};

export function AutoMergeSettingsPanel() {
  const [settings, setSettings] = useState<AutoMergeSettings>(loadAutoMergeSettings);
  const [saved, setSaved] = useState(false);

  function handleModeSelect(mode: AutoMergeMode) {
    const updated = { ...settings, mode };
    setSettings(updated);
    saveAutoMergeSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function handleReset() {
    setSettings(resetAutoMergeSettings());
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="autoMergeSettingsPanel">
      <div className="autoMergeSettingsPanel__title">自動マージ設定</div>

      <div className="autoMergeSettingsPanel__mode">
        {(Object.keys(MODE_LABELS) as AutoMergeMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={`autoMergeSettingsPanel__modeBtn${settings.mode === mode ? ' autoMergeSettingsPanel__modeBtn--active' : ''}`}
            onClick={() => handleModeSelect(mode)}
          >
            {MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      <div className="autoMergeSettingsPanel__note">{MODE_NOTES[settings.mode]}</div>

      <div className="autoMergeSettingsPanel__note" style={{ marginTop: 8 }}>
        上限：変更ファイル {settings.maxChangedFiles} 件 / 追加 {settings.maxAdditions} 行 / 削除 {settings.maxDeletions} 行
      </div>

      <div className="autoMergeSettingsPanel__note" style={{ marginTop: 4 }}>
        ※ secret / token / 認証 / 課金 / App Store / Worker Secret 周りは絶対に自動マージしません
      </div>

      <button
        type="button"
        className="autoMergeSettingsPanel__modeBtn"
        style={{ marginTop: 10 }}
        onClick={handleReset}
      >
        初期値に戻す
      </button>

      {saved && <div className="autoMergeSettingsPanel__saved">✅ 保存しました</div>}
    </div>
  );
}
