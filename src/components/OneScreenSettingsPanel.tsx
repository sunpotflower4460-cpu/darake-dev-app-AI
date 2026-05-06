import { useState } from 'react';
import { Settings, Copy, Check } from 'lucide-react';
import {
  loadOneScreenSettings,
  saveOneScreenSettings,
  formatOneScreenSettingsMarkdown,
} from '../utils/oneScreenSettings';
import type { OneScreenSettings } from '../utils/oneScreenSettings';

type CopyState = 'idle' | 'copied' | 'failed';

type BooleanSettingKey = {
  [K in keyof OneScreenSettings]: OneScreenSettings[K] extends boolean ? K : never;
}[keyof OneScreenSettings];

const SETTING_LABELS: Record<BooleanSettingKey, string> = {
  defaultToOneScreen: 'デフォルトで1画面モード',
  hideCompletedPanels: '完了パネルを非表示',
  hideLowWarnings: '低優先warningを非表示',
  showBlockedImmediately: 'blockedはすぐ表示',
  showManualGateInInboxOnly: 'manual gateはInboxのみ',
  showCompletionFirst: '完成ファーストを最初に表示',
  allowAllDetailsView: '「全詳細表示」ボタンを許可',
};

const BOOLEAN_KEYS: BooleanSettingKey[] = [
  'defaultToOneScreen',
  'hideCompletedPanels',
  'hideLowWarnings',
  'showBlockedImmediately',
  'showManualGateInInboxOnly',
  'showCompletionFirst',
  'allowAllDetailsView',
];

export function OneScreenSettingsPanel() {
  const [settings, setSettings] = useState(() => loadOneScreenSettings());
  const [copyState, setCopyState] = useState<CopyState>('idle');

  function handleToggle(key: BooleanSettingKey) {
    const updated: OneScreenSettings = { ...settings, [key]: !settings[key] };
    saveOneScreenSettings(updated);
    setSettings(updated);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatOneScreenSettingsMarkdown(settings));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase38sPanel">
      <div className="phase38sHero">
        <Settings />
        <div>
          <p className="eyebrow">Phase 38.4</p>
          <h3>One Screen Settings</h3>
          <p>1画面モードの設定を管理します。安全モードは変更できません。</p>
        </div>
      </div>

      <div className="phase38sSection">
        <h4>表示設定</h4>
        <div style={{ display: 'grid', gap: 8 }}>
          {BOOLEAN_KEYS.map((key) => (
            <div key={key} className="phase38sSettingRow">
              <span style={{ fontSize: '0.84rem', color: '#222' }}>
                {SETTING_LABELS[key]}
              </span>
              <input
                type="checkbox"
                className="phase38sToggle"
                checked={settings[key]}
                onChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="phase38sSection">
        <h4>安全モード（変更不可）</h4>
        <div className="phase38sSettingRow">
          <span style={{ fontSize: '0.84rem', color: '#222' }}>
            fixedSafetyMode
          </span>
          <span className="phase38sFixedBadge">
            🔒 {settings.fixedSafetyMode}
          </span>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
          blocked / secret / production / App Store Submit は常に表示されます。
        </p>
      </div>

      <div className="phase38sBtnRow">
        <button className={`phase38sSmallBtn ${copyState}`} onClick={() => void handleCopy()}>
          {copyState === 'copied' ? <Check size={13} /> : <Copy size={13} />} 設定をコピー
        </button>
      </div>
    </div>
  );
}
