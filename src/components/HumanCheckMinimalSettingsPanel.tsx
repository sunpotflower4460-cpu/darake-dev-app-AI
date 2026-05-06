import { useState } from 'react';
import { Settings } from 'lucide-react';
import {
  loadHumanCheckMinimalSettings,
  saveHumanCheckMinimalSettings,
} from '../utils/humanCheckMinimalSettings';
import type { HumanCheckMinimalSettings } from '../utils/humanCheckMinimalSettings';

export function HumanCheckMinimalSettingsPanel() {
  const [settings, setSettings] = useState(() => loadHumanCheckMinimalSettings());

  function update(changes: Partial<Omit<HumanCheckMinimalSettings, 'fixedSafetyMode'>>) {
    const updated: HumanCheckMinimalSettings = {
      ...settings,
      ...changes,
      fixedSafetyMode: 'strict-manual-gate',
    };
    saveHumanCheckMinimalSettings(updated);
    setSettings(updated);
  }

  return (
    <div className="phase31Panel">
      <div className="phase31Hero">
        <Settings />
        <div>
          <p className="eyebrow">Phase 31.4</p>
          <h3>Human Check Minimal Settings</h3>
          <p>Minimal Mode の表示設定です。安全設定は変更できません。</p>
        </div>
      </div>

      <div className="phase31SafetyBox">
        🔒 fixedSafetyMode は変更できません。manual gate を弱める設定はありません。
      </div>

      <div className="phase31Section">
        <h4>表示モード</h4>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['minimal', 'normal'] as const).map((mode) => (
            <button
              key={mode}
              className={`phase31SmallBtn ${settings.defaultMode === mode ? 'copied' : ''}`}
              onClick={() => update({ defaultMode: mode })}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="phase31Section">
        <h4>表示設定</h4>
        <div style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem' }}>
            <input
              type="checkbox"
              checked={settings.showOnlyOneAction}
              onChange={(e) => update({ showOnlyOneAction: e.target.checked })}
            />
            1件だけ強調表示する
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem' }}>
            <input
              type="checkbox"
              checked={settings.hideLowPriorityWarnings}
              onChange={(e) => update({ hideLowPriorityWarnings: e.target.checked })}
            />
            低優先度のWarningを隠す
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem' }}>
            <input
              type="checkbox"
              checked={settings.requireReasonOnStop}
              onChange={(e) => update({ requireReasonOnStop: e.target.checked })}
            />
            止める時に理由を必須にする
          </label>
        </div>
      </div>

      <div className="phase31Section">
        <h4>あとでのスヌーズ単位</h4>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['today', 'tomorrow', 'next-session'] as const).map((label) => (
            <button
              key={label}
              className={`phase31SmallBtn ${settings.laterSnoozeLabel === label ? 'copied' : ''}`}
              onClick={() => update({ laterSnoozeLabel: label })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="phase31Section">
        <h4>安全設定（変更不可）</h4>
        <p style={{ margin: 0, fontSize: '0.84rem' }}>
          🔒 fixedSafetyMode: <strong>{settings.fixedSafetyMode}</strong>
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>
          manual gate を弱める設定は作りません。
        </p>
      </div>
    </div>
  );
}
