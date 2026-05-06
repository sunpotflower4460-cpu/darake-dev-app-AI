import { useEffect, useState } from 'react';
import { Check, Save, Shield } from 'lucide-react';
import type { DarakeSafetySettings } from '../utils/darakeSafetySettings';
import {
  FIXED_SAFETY_POLICY,
  buildDefaultSafetySettings,
  loadSafetySettings,
  saveSafetySettings,
} from '../utils/darakeSafetySettings';

export function DarakeSafetySettingsPanel() {
  const [settings, setSettings] = useState<DarakeSafetySettings>(buildDefaultSafetySettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSafetySettings());
  }, []);

  function handleToggle(key: keyof Pick<DarakeSafetySettings, 'batchGateMode' | 'autoIssueDraft' | 'autoPRCandidate' | 'autoMergeCandidate'>) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  function handleSave() {
    saveSafetySettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="phase18Panel">
      <div className="phase18Hero">
        <Shield />
        <div>
          <p className="eyebrow">Phase 18.6</p>
          <h3>Safety Settings / 安全設定</h3>
          <p>自動化レベルと安全方針を見える化します。一部の設定は固定で変更できません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>localStorageキー: darake.safetySettings.v1</strong>
      </div>

      <div className="phaseSafetyToggleFixed">
        <strong>🔒 App Store Submit Automation</strong>
        <span style={{ marginLeft: 'auto', fontWeight: 900, color: '#7e3436' }}>always-manual（変更不可）</span>
      </div>

      <div className="phaseSafetyToggleFixed">
        <strong>🔒 Secrets Handling</strong>
        <span style={{ marginLeft: 'auto', fontWeight: 900, color: '#7e3436' }}>never-store（変更不可）</span>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0' }}>
        固定ポリシー: appStoreSubmitAutomation = {FIXED_SAFETY_POLICY.appStoreSubmitAutomation} / secretsHandling = {FIXED_SAFETY_POLICY.secretsHandling}
      </p>

      <div style={{ display: 'grid', gap: '10px' }}>
        {([
          { key: 'batchGateMode', label: 'Batch Gate Mode', desc: '通知をバッチ処理でまとめる' },
          { key: 'autoIssueDraft', label: 'Auto Issue Draft', desc: 'Issue下書きを自動生成する（コピーのみ、自動作成なし）' },
          { key: 'autoPRCandidate', label: 'Auto PR Candidate', desc: 'PRを自動候補として出す（自動作成なし）' },
          { key: 'autoMergeCandidate', label: 'Auto Merge Candidate', desc: 'Mergeを自動候補として出す（自動実行なし）' },
        ] as const).map(({ key, label, desc }) => (
          <div key={key} className="phaseSafetyToggle">
            <div>
              <div className="phaseSafetyToggleLabel">{label}</div>
              <div className="phaseSafetyToggleDesc">{desc}</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: 'auto' }}>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={() => handleToggle(key)}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 900, color: settings[key] ? '#35513d' : 'var(--muted)' }}>
                {settings[key] ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>
        ))}

        <div className="phaseSafetyToggle">
          <div>
            <div className="phaseSafetyToggleLabel">Notification Mode</div>
            <div className="phaseSafetyToggleDesc">通知の詳細レベル</div>
          </div>
          <select
            value={settings.notificationMode}
            onChange={(e) => {
              setSettings((prev) => ({ ...prev, notificationMode: e.target.value as DarakeSafetySettings['notificationMode'] }));
              setSaved(false);
            }}
            style={{ marginLeft: 'auto', padding: '6px 10px', borderRadius: '10px', border: '1px solid rgba(76,124,85,0.25)', background: 'rgba(255,250,240,0.85)' }}
          >
            <option value="quiet">quiet</option>
            <option value="normal">normal</option>
            <option value="strict">strict</option>
          </select>
        </div>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={handleSave} className={saved ? 'phaseSavedBtn' : ''}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? '保存しました' : '保存'}
        </button>
      </div>
    </div>
  );
}
