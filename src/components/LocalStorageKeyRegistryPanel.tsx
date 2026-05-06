import { useState } from 'react';
import { Check, Copy, Database } from 'lucide-react';
import {
  LOCAL_STORAGE_KEY_REGISTRY,
  formatLocalStorageKeyRegistryMarkdown,
} from '../utils/localStorageKeyRegistry';

type CopyState = 'idle' | 'copied' | 'failed';

export function LocalStorageKeyRegistryPanel() {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [showSensitiveOnly, setShowSensitiveOnly] = useState(false);

  const items = showSensitiveOnly
    ? LOCAL_STORAGE_KEY_REGISTRY.filter((i) => i.containsSensitiveData)
    : LOCAL_STORAGE_KEY_REGISTRY;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatLocalStorageKeyRegistryMarkdown(LOCAL_STORAGE_KEY_REGISTRY));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  const sensitiveCount = LOCAL_STORAGE_KEY_REGISTRY.filter((i) => i.containsSensitiveData).length;

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <Database />
        <div>
          <p className="eyebrow">Phase 24.6</p>
          <h3>LocalStorage Key Registry</h3>
          <p>localStorageキーを一覧化してキー衝突・機密データ混入を防ぎます。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ secret / token / API key / webhook URL はlocalStorageに保存しない</strong>
      </div>

      <div className="phase24SummaryGrid">
        <section>
          <h4>Total keys</h4>
          <p>{LOCAL_STORAGE_KEY_REGISTRY.length}</p>
        </section>
        <section>
          <h4>Sensitive</h4>
          <p className={sensitiveCount > 0 ? 'warn' : ''}>{sensitiveCount}</p>
        </section>
      </div>

      {sensitiveCount === 0 && (
        <div className="phaseInfoBox">
          <strong>✅ 機密データ混入なし</strong>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            全 {LOCAL_STORAGE_KEY_REGISTRY.length} キーの containsSensitiveData は false です。
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <label style={{ fontSize: '0.82rem', display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showSensitiveOnly}
            onChange={(e) => setShowSensitiveOnly(e.target.checked)}
          />
          機密データのみ表示
        </label>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="phase24Table">
          <thead>
            <tr>
              <th>key</th>
              <th>owner</th>
              <th>phase</th>
              <th>purpose</th>
              <th>sensitive</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.key}>
                <td>
                  <code style={{ fontSize: '0.74rem', background: 'rgba(0,0,0,0.05)', padding: '2px 5px', borderRadius: 4 }}>
                    {item.key}
                  </code>
                </td>
                <td style={{ fontSize: '0.78rem' }}>{item.owner}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{item.phase}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{item.purpose}</td>
                <td>{item.containsSensitiveData ? '⚠️ YES' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="phaseInfoBox">
        <strong>新しいキーを追加する際のルール</strong>
        <ul>
          <li>このRegistryに登録する</li>
          <li>キー名は <code>darake.*.v1</code> 形式にする</li>
          <li>secret / token / API key / webhook URL は保存しない</li>
          <li>containsSensitiveData は原則 false</li>
        </ul>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
