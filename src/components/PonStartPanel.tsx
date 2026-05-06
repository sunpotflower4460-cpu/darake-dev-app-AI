import { useEffect, useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildPonStartPack, summarizePonStartPack } from '../utils/ponStartPack';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';

const INCLUDED_LABELS: Record<string, string> = {
  productBrief: 'アプリ概要',
  phasePlan: 'Phase計画',
  cloudAgentInstruction: 'Cloud Agent指示書',
  issueDraft: 'Issue下書き',
  safetyRules: '安全ルール',
  firstReviewChecklist: '最初のチェックリスト',
};

export function PonStartPanel() {
  const [revision, setRevision] = useState(0);
  const [copied, setCopied] = useState<'all' | 'agent' | 'issue' | null>(null);
  const pack = useMemo(() => buildPonStartPack(), [revision]);

  useEffect(() => subscribeDarakeRuntimeEvents(() => setRevision((v) => v + 1)), []);

  async function copyText(kind: 'all' | 'agent' | 'issue', text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
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
        {pack.status === 'ready-to-copy' ? '✅ これを貼れば始められます'
          : pack.status === 'needs-review' ? '🔍 要確認'
          : '🚫 未準備'}
      </span>

      {pack.blockers.length > 0 && <div className="ponWarnBox">{pack.blockers.map((b) => <div key={b}>🚫 {b}</div>)}</div>}
      {pack.warnings.length > 0 && <div className="ponWarnBox">{pack.warnings.map((w) => <div key={w}>⚠️ {w}</div>)}</div>}

      <div className="ponNextAction">
        次にやること：下の緑ボタンを押して、Cloud Agentのチャットに貼るだけです。
      </div>

      <div className="ponBtnRow">
        <button className="ponBtnPrimary" onClick={() => copyText('agent', pack.cloudAgentInstructionMarkdown)} disabled={pack.status === 'not-ready'}>
          {copied === 'agent' ? <><Check size={16} /> コピー済み</> : 'Cloud Agentに貼る指示をコピー'}
        </button>
        <button className="ponBtnSecondary" onClick={() => copyText('all', pack.allInOneMarkdown)} disabled={pack.status === 'not-ready'}>
          {copied === 'all' ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> 全部まとめてコピー</>}
        </button>
        <button className="ponBtnSecondary" onClick={() => copyText('issue', pack.issueDraftMarkdown)} disabled={pack.status === 'not-ready'}>
          {copied === 'issue' ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> Issue下書きだけコピー</>}
        </button>
      </div>

      <div className="ponIncludedList">
        <div className="ponIncludedTitle">中身</div>
        {(Object.entries(pack.included) as [keyof typeof pack.included, boolean][]).map(([key, val]) => (
          <div key={key} className="ponIncludedItem">
            <span className="ponIncludedIcon">{val ? '✅' : '⬜'}</span>
            <span>{INCLUDED_LABELS[key] ?? key}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 14, textAlign: 'center' }}>
        実行はしません。コピーだけです。
      </div>
    </div>
  );
}
