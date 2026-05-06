import { useMemo, useState } from 'react';
import { Check, Copy, ClipboardList, RefreshCcw } from 'lucide-react';
import {
  buildCurrentIntegrationAudit,
  formatCurrentIntegrationAuditMarkdown,
} from '../utils/currentIntegrationAudit';
import type { IntegrationAuditItem } from '../utils/currentIntegrationAudit';

type CopyState = 'idle' | 'copied' | 'failed';

function safetyBadge(type: IntegrationAuditItem['safetyType']) {
  const map: Record<string, string> = {
    'copy-only': '📋',
    'manual-gate': '🚪',
    'local-record': '💾',
    'draft-only': '📝',
    'readiness-gate': '✅',
    'report-only': '📊',
  };
  return map[type] ?? type;
}

function statusBadge(status: IntegrationAuditItem['status']) {
  const map: Record<string, string> = {
    present: '✅',
    'needs-review': '⚠️',
    missing: '❌',
    unknown: '❓',
  };
  return map[status] ?? status;
}

export function CurrentIntegrationAuditPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const audit = useMemo(() => buildCurrentIntegrationAudit(), [reloadKey]);

  const groups = useMemo(() => {
    const gs = Array.from(new Set(audit.items.map((i) => i.group)));
    return ['all', ...gs];
  }, [audit]);

  const filteredItems = useMemo(
    () => (filterGroup === 'all' ? audit.items : audit.items.filter((i) => i.group === filterGroup)),
    [audit.items, filterGroup],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formatCurrentIntegrationAuditMarkdown(audit));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase24Panel">
      <div className="phase24Hero">
        <ClipboardList />
        <div>
          <p className="eyebrow">Phase 24.1</p>
          <h3>Current Integration Audit</h3>
          <p>Phase 1〜24の全パネル・helper・CSS・localStorageキー・安全方針を一覧化します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⛔ 外部API実行なし / GitHub API実行なし / secret保存なし</strong>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          className={`phase24StatusBadge ${audit.status}`}
        >
          {audit.status === 'healthy' ? '✅ healthy' : audit.status === 'needs-review' ? '⚠️ needs-review' : '🔴 blocked'}
        </span>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
          {audit.items.length}件のパネル
        </span>
      </div>

      <div className="phase24SummaryGrid">
        <section>
          <h4>Total</h4>
          <p>{audit.items.length}</p>
        </section>
        <section>
          <h4>present</h4>
          <p>{audit.items.filter((i) => i.status === 'present').length}</p>
        </section>
        <section>
          <h4>review</h4>
          <p>{audit.items.filter((i) => i.status === 'needs-review').length}</p>
        </section>
        <section>
          <h4>missing</h4>
          <p>{audit.items.filter((i) => i.status === 'missing').length}</p>
        </section>
      </div>

      <div>
        <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#35513d', marginBottom: 8 }}>
          グループで絞る
        </p>
        <div className="phase24GroupFilter">
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              className={`phase24GroupBtn${filterGroup === g ? ' active' : ''}`}
              onClick={() => setFilterGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="phase24Table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>Label</th>
              <th>Group</th>
              <th>Safety</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{item.phase}</td>
                <td>{item.label}</td>
                <td>{item.group}</td>
                <td title={item.safetyType}>{safetyBadge(item.safetyType)} {item.safetyType}</td>
                <td>{statusBadge(item.status)}</td>
                <td style={{ maxWidth: 160, color: 'var(--muted)' }}>{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {audit.warnings.length > 0 && (
        <div className="phaseWarningsBox">
          <strong>⚠️ Warnings</strong>
          <ul>{audit.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
      )}

      {audit.blockers.length > 0 && (
        <div className="phaseBlockersBox">
          <strong>🔴 Blockers</strong>
          <ul>{audit.blockers.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
      )}

      <div className="phaseInfoBox">
        <strong>次のアクション</strong>
        <ul>{audit.nextActions.map((a, i) => <li key={i}>{a}</li>)}</ul>
      </div>

      <div className="phaseControls">
        <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
          <RefreshCcw size={16} /> 再読み込み
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={handleCopy}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : 'Markdownコピー'}
        </button>
      </div>
    </div>
  );
}
