import { useEffect, useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildPonStartPack, summarizePonStartPack } from '../utils/ponStartPack';
import { subscribeDarakeRuntimeEvents } from '../utils/darakeRuntimeEvents';
import { releaseFirstStartMinimalMode } from '../utils/firstStartMinimalMode';
import { loadGentleAppStartForm } from '../utils/gentleAppStartForm';
import { createCockpitSeedFromFirstStartForm } from '../utils/firstStartCockpitSeed';

const INCLUDED_LABELS: Record<string, string> = {
  productBrief: 'アプリ概要',
  phasePlan: '作る順番',
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

  function shouldSeedCockpitData(kind: 'all' | 'agent' | 'issue'): boolean {
    return kind === 'all' || kind === 'agent';
  }

  function handleOpenControlRoom() {
    releaseFirstStartMinimalMode();
  }

  async function copyText(kind: 'all' | 'agent' | 'issue', text: string) {
    if (shouldSeedCockpitData(kind)) {
      createCockpitSeedFromFirstStartForm(loadGentleAppStartForm());
    }
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
      <span className="ponPhaseTag">ぽん開始</span>
      <div className="ponTitle">だらけ管制室ですぐ進められます</div>
      <div className="ponSub">{summarizePonStartPack(pack)}</div>

      <div className="ponCockpitSummary">
        あなたのアプリ案を、設計図 / タスクキュー / 今夜進める候補 / 朝レポート導線 / Cloud Agent指示（任意）に変換できます。
      </div>

      <span className={`ponStatusBadge ${pack.status}`}>
        {pack.status === 'ready-to-copy' ? '✅ 管制室で進めつつ、必要なら手動でCloud Agentに渡せます'
          : pack.status === 'needs-review' ? '🔍 要確認'
          : '🚫 未準備'}
      </span>

      <div className="ponModeSelect">
        <div className="ponModeSelectTitle">進め方を選ぶ</div>
        <button type="button" className="ponModeCard ponModeCard--primary" onClick={handleOpenControlRoom}>
          だらけ管制室で進める
        </button>
        <button
          type="button"
          className="ponModeCard ponModeCard--button"
          onClick={() => copyText('agent', pack.cloudAgentInstructionMarkdown)}
          disabled={pack.status === 'not-ready'}
        >
          Cloud Agentへ貼る指示だけコピー
        </button>
        <button type="button" className="ponModeCard ponModeCard--button" onClick={handleOpenControlRoom}>
          実地リハーサルで確認する
        </button>
        <button type="button" className="ponModeCard ponModeCard--button" onClick={handleOpenControlRoom}>
          詳細な管制室を開く
        </button>
      </div>

      {pack.blockers.length > 0 && <div className="ponWarnBox">{pack.blockers.map((b) => <div key={b}>🚫 {b}</div>)}</div>}
      {pack.warnings.length > 0 && <div className="ponWarnBox">{pack.warnings.map((w) => <div key={w}>⚠️ {w}</div>)}</div>}

      <div className="ponNextAction">
        手動でCloud Agentに渡す場合は、下のボタンで貼り付け文をコピーできます。だらけ管制室側には設計図とタスク候補も保存します。
      </div>

      <div className="ponBtnRow">
        <button type="button" className="ponBtnPrimary" onClick={() => copyText('agent', pack.cloudAgentInstructionMarkdown)} disabled={pack.status === 'not-ready'}>
          {copied === 'agent' ? <><Check size={16} /> コピー済み</> : 'Cloud Agentに貼る指示をコピー'}
        </button>
        <button type="button" className="ponBtnSecondary" onClick={() => copyText('all', pack.allInOneMarkdown)} disabled={pack.status === 'not-ready'}>
          {copied === 'all' ? <><Check size={14} /> コピー済み</> : <><Copy size={14} /> 全部まとめてコピー</>}
        </button>
        <button type="button" className="ponBtnSecondary" onClick={() => copyText('issue', pack.issueDraftMarkdown)} disabled={pack.status === 'not-ready'}>
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
