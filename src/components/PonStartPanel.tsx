import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildPonStartPack, summarizePonStartPack } from '../utils/ponStartPack';

const INCLUDED_LABELS: Record<string, string> = {
  productBrief: 'アプリ概要',
  phasePlan: 'Phase計画',
  cloudAgentInstruction: 'Cloud Agent指示書',
  issueDraft: 'Issue下書き',
  safetyRules: '安全ルール',
  firstReviewChecklist: '最初のチェックリスト',
};

export function PonStartPanel() {
  const [pack] = useState(() => buildPonStartPack());
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedAgent, setCopiedAgent] = useState(false);
  const [copiedIssue, setCopiedIssue] = useState(false);

  async function handleCopyAll() {
    try {
      await navigator.clipboard.writeText(pack.allInOneMarkdown);
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // ignore
    }
  }

  async function handleCopyAgent() {
    try {
      await navigator.clipboard.writeText(pack.cloudAgentInstructionMarkdown);
      setCopiedAgent(true);
      window.setTimeout(() => setCopiedAgent(false), 1800);
    } catch {
      // ignore
    }
  }

  async function handleCopyIssue() {
    try {
      await navigator.clipboard.writeText(pack.issueDraftMarkdown);
      setCopiedIssue(true);
      window.setTimeout(() => setCopiedIssue(false), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="ponPanel">
      <span className="ponPhaseTag">Phase 47</span>
      <div className="ponTitle">ぽん開始パック</div>
      <div className="ponSub">{summarizePonStartPack(pack)}</div>

      <span className={`ponStatusBadge ${pack.status}`}>
        {pack.status === 'ready-to-copy' ? '✅ コピー準備OK'
          : pack.status === 'needs-review' ? '🔍 要確認'
          : '🚫 未準備'}
      </span>

      {pack.blockers.length > 0 && (
        <div className="ponWarnBox">
          {pack.blockers.map((b, i) => <div key={i}>🚫 {b}</div>)}
        </div>
      )}
      {pack.warnings.length > 0 && (
        <div className="ponWarnBox">
          {pack.warnings.map((w, i) => <div key={i}>⚠️ {w}</div>)}
        </div>
      )}

      {/* Included items */}
      <div className="ponIncludedList">
        <div className="ponIncludedTitle">入っているもの</div>
        {(Object.entries(pack.included) as [keyof typeof pack.included, boolean][]).map(([key, val]) => (
          <div key={key} className="ponIncludedItem">
            <span className="ponIncludedIcon">{val ? '✅' : '⬜'}</span>
            <span>{INCLUDED_LABELS[key] ?? key}</span>
          </div>
        ))}
      </div>

      {/* Next action */}
      <div className="ponNextAction">
        次にやること：{pack.nextHumanAction}
      </div>

      {/* Buttons */}
      <div className="ponBtnRow">
        <button
          className="ponBtnPrimary"
          onClick={handleCopyAll}
          disabled={pack.status === 'not-ready'}
        >
          {copiedAll ? <><Check size={16} /> コピー済み</> : '全部コピー'}
        </button>
        <button
          className="ponBtnSecondary"
          onClick={handleCopyAgent}
          disabled={pack.status === 'not-ready'}
        >
          {copiedAgent ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> Cloud Agent指示だけコピー</>}
        </button>
        <button
          className="ponBtnSecondary"
          onClick={handleCopyIssue}
          disabled={pack.status === 'not-ready'}
        >
          {copiedIssue ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> Issue下書きだけコピー</>}
        </button>
      </div>

      <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 14, textAlign: 'center' }}>
        実行はしません。コピーだけです。
      </div>
    </div>
  );
}
