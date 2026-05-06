import { useState } from 'react';
import { CheckSquare, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { buildDarakeV1ReadinessGate } from '../utils/darakeV1ReadinessGate';

const gate = buildDarakeV1ReadinessGate();

const STATUS_EMOJI: Record<string, string> = {
  'ready-for-v1': '✅',
  'needs-review': '⚠️',
  blocked: '🚫',
};

const STATUS_LABEL: Record<string, string> = {
  'ready-for-v1': 'v1 準備完了',
  'needs-review': '要確認',
  blocked: 'ブロック中',
};

const REQ_EMOJI: Record<string, string> = {
  done: '✅',
  'needs-review': '⚠️',
  blocked: '🚫',
};

export function DarakeV1ReadinessPanel() {
  const [showAllReqs, setShowAllReqs] = useState(false);
  const [showHumanCheck, setShowHumanCheck] = useState(false);
  const [copied, setCopied] = useState(false);

  const visibleReqs = showAllReqs
    ? gate.requirements
    : gate.requirements.filter((r) => r.status !== 'done');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(gate.summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="phase44Panel">
      <div className="phase44Hero">
        <CheckSquare size={22} color="#555" />
        <div>
          <strong style={{ fontSize: '1rem' }}>だらけ管制室 v1 Readiness</strong>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Phase 44</div>
        </div>
      </div>

      <div className={`phase44StatusCard ${gate.status}`}>
        <div style={{ fontSize: '2rem', marginBottom: 6 }}>{STATUS_EMOJI[gate.status]}</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{STATUS_LABEL[gate.status]}</div>
        <div style={{ fontSize: '0.85rem', color: '#555', marginTop: 4 }}>
          完了: {gate.requirements.filter((r) => r.status === 'done').length} /
          全体: {gate.requirements.length}件
        </div>
      </div>

      {gate.blockers.length > 0 && (
        <>
          <div className="phase44SectionTitle" style={{ color: '#c62828' }}>🚫 ブロック中</div>
          <ul className="phase44BlockerList">
            {gate.blockers.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </>
      )}

      {gate.warnings.length > 0 && (
        <>
          <div className="phase44SectionTitle" style={{ color: '#e65100' }}>⚠️ 要確認</div>
          <ul className="phase44WarningList">
            {gate.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </>
      )}

      {visibleReqs.length > 0 && (
        <>
          <div className="phase44SectionTitle">
            {showAllReqs ? '全必須条件' : '未完了の条件'}
          </div>
          <ul className="phase44ReqList">
            {visibleReqs.map((req) => (
              <li key={req.id} className="phase44ReqItem">
                <span className="phase44ReqStatus">{REQ_EMOJI[req.status]}</span>
                <span className="phase44ReqLabel">{req.label}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="phase44BtnRow">
        <button className="phase44Btn" onClick={() => setShowAllReqs((v) => !v)}>
          {showAllReqs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showAllReqs ? '未完了のみ表示' : '全条件を表示'}
        </button>
        <button className="phase44Btn" onClick={() => setShowHumanCheck((v) => !v)}>
          {showHumanCheck ? '確認を閉じる' : '最後の人間確認'}
        </button>
        <button className="phase44Btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>

      {showHumanCheck && (
        <div style={{ marginTop: 12, background: '#fffde7', borderRadius: 14, padding: '12px 14px' }}>
          <div className="phase44SectionTitle">最後の人間確認</div>
          <ul className="phase44CheckList">
            {gate.finalHumanCheck.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
