import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Eye } from 'lucide-react';
import { actionPreviewItems } from '../data/actionPreview';
import { issueManualGuideSteps, issueManualGuideUrl } from '../data/issueManualGuide';
import { checkIssueDraft } from '../utils/checkIssueDraft';
import { loadDraft, subscribeDraftChanges } from '../utils/draftStore';
import { buildIssueActionPreview } from '../utils/issueActionPreview';
import { buildIssueFinalConfirm } from '../utils/issueFinalConfirm';

const modeLabel = {
  'preview-only': '表示のみ',
  'manual-confirm': '確認して停止',
  blocked: '必ず停止',
};

export function ActionPreviewPanel() {
  const [draft, setDraft] = useState(() => loadDraft());
  const issueChecks = useMemo(() => checkIssueDraft(draft), [draft]);
  const issuePreview = useMemo(() => buildIssueActionPreview(draft, issueChecks), [draft, issueChecks]);
  const finalConfirm = useMemo(() => buildIssueFinalConfirm(draft, issueChecks), [draft, issueChecks]);

  useEffect(() => {
    return subscribeDraftChanges(() => setDraft(loadDraft()));
  }, []);

  return (
    <div className="actionPreviewPanel">
      <div className="actionPreviewHero">
        <Eye />
        <div>
          <p className="eyebrow">Phase 7.4</p>
          <h3>実行前プレビュー</h3>
          <p>Issue作成、PR作成、マージなどの書き込み操作は、実行前に内容と安全条件を1枚で確認します。</p>
        </div>
      </div>

      <div className={`issueActionPreview issue-${issuePreview.status}`}>
        <div>
          <strong>{issuePreview.title}</strong>
          <span>確認 {issuePreview.careCount}</span>
        </div>
        <p>{issuePreview.message}</p>
        <ul>
          {issuePreview.previewLines.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </div>

      <div className={`issueFinalConfirm final-${finalConfirm.status}`}>
        <div>
          <strong>{finalConfirm.title}</strong>
          <span>{finalConfirm.gateLabel}</span>
        </div>
        <p>{finalConfirm.message}</p>
        <section>
          <h4>投稿するならこの内容</h4>
          <ul>{finalConfirm.finalLines.map((line) => <li key={line}>{line}</li>)}</ul>
        </section>
        <section>
          <h4>まだ止める理由</h4>
          <ul>{finalConfirm.stopReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        </section>
      </div>

      <div className="issueManualGuide">
        <div>
          <strong>Issue手動投稿ガイド</strong>
          <a href={issueManualGuideUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> GitHubでIssueを開く</a>
        </div>
        <p>自動投稿の前に、まずはGitHubの投稿画面まで安全に案内します。Submitは自分で押す前提です。</p>
        <div>
          {issueManualGuideSteps.map((step) => (
            <article key={step.id}>
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
            </article>
          ))}
        </div>
      </div>

      <div className="actionPreviewGrid">
        {actionPreviewItems.map((item) => (
          <article className={`actionPreviewCard preview-${item.mode}`} key={item.id}>
            <div>
              <strong>{item.label}</strong>
              <span>{modeLabel[item.mode]}</span>
            </div>
            <p>{item.summary}</p>
            <ul>
              {item.checks.map((check) => <li key={check}>{check}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
