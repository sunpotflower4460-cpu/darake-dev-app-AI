import { useEffect, useMemo, useState } from 'react';
import { Check, PackageCheck, Rocket } from 'lucide-react';
import {
  allApproved,
  costSummary,
  itemsForPlatforms,
  loadGateState,
  saveGateState,
  type GateState,
  type SubmissionPlatform,
} from '../utils/submissionGate';
import { draftMetadata, submitPlatform, type MetadataDraft } from '../services/submissionService';

const PLATFORM_LABELS: Record<SubmissionPlatform, string> = {
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
};

export function SubmissionGatePanel() {
  const [projectId, setProjectId] = useState('manual');
  const [platforms, setPlatforms] = useState<SubmissionPlatform[]>(['web']);
  const [state, setState] = useState<GateState>(() => loadGateState('manual'));
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ text: string; error: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draft, setDraft] = useState<MetadataDraft | null>(null);
  const [draftMsg, setDraftMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [drafting, setDrafting] = useState(false);

  async function runDraft() {
    if (!projectId.trim() || projectId.trim() === 'manual') {
      setDraftMsg({ text: 'アプリ名 (プロジェクトID) を入れてください', error: true });
      return;
    }
    setDrafting(true);
    setDraftMsg(null);
    const res = await draftMetadata({ appName: projectId.trim() });
    setDrafting(false);
    if (res.ok) {
      setDraft(res.result);
      setDraftMsg({ text: 'AI下書きを生成しました。内容を確認して各項目を承認してください。', error: false });
    } else {
      setDraftMsg({ text: `[${res.code}] ${res.error}`, error: true });
    }
  }

  useEffect(() => {
    setState(loadGateState(projectId.trim() || 'manual'));
  }, [projectId]);

  const items = useMemo(() => itemsForPlatforms(platforms), [platforms]);
  const ready = allApproved(state, platforms);
  const costs = costSummary(platforms);

  function persist(next: GateState) {
    setState(next);
    saveGateState(projectId.trim() || 'manual', next);
  }

  function toggleApprove(id: string) {
    persist({ ...state, approved: { ...state.approved, [id]: !state.approved[id] } });
  }

  function setValue(id: string, value: string) {
    persist({ ...state, values: { ...state.values, [id]: value } });
  }

  function togglePlatform(p: SubmissionPlatform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function runSubmit() {
    setConfirming(false);
    setSubmitting(true);
    setResult(null);
    const messages: string[] = [];
    let hadError = false;
    for (const p of platforms) {
      const res = await submitPlatform(p, {
        projectId: projectId.trim() || 'manual',
        values: state.values,
      });
      if (res.ok) {
        messages.push(`${PLATFORM_LABELS[p]}: ${res.message}${res.externalUrl ? ` → ${res.externalUrl}` : ''}`);
      } else {
        hadError = true;
        messages.push(`${PLATFORM_LABELS[p]}: [${res.code}] ${res.error}`);
      }
    }
    setSubmitting(false);
    setResult({ text: messages.join('\n'), error: hadError });
  }

  return (
    <div className="submissionGatePanel">
      <div className="submissionGateHero">
        <PackageCheck />
        <div>
          <p className="eyebrow">Phase 104 / Submission Gate</p>
          <h3>申請前ゲート (1画面で一括承認)</h3>
          <p>
            課金・個人情報・法的に重要な項目をここに集約しました。すべて承認するまで提出は始まりません。
          </p>
        </div>
      </div>

      <label className="submissionGateProjectInput">
        プロジェクトID
        <input
          type="text"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="manual"
        />
      </label>

      <div className="submissionGatePlatforms">
        {(['web', 'ios', 'android'] as SubmissionPlatform[]).map((p) => (
          <button
            key={p}
            type="button"
            className={`submissionGatePlatformBtn ${platforms.includes(p) ? 'active' : ''}`}
            onClick={() => togglePlatform(p)}
          >
            {PLATFORM_LABELS[p]}
          </button>
        ))}
      </div>

      <div className="submissionGatePlatforms">
        <button
          type="button"
          className="submissionGatePlatformBtn"
          onClick={() => void runDraft()}
          disabled={drafting}
        >
          {drafting ? 'AI下書き生成中…' : 'プライバシーポリシー / 年齢区分をAIで下書き'}
        </button>
      </div>
      {draftMsg && (
        <div className={`submissionGateResult ${draftMsg.error ? 'err' : 'ok'}`}>{draftMsg.text}</div>
      )}
      {draft && (
        <div className="submissionGateCostBox" style={{ borderColor: 'rgba(76,124,85,0.4)', background: 'rgba(248,252,240,0.7)', color: '#35513d' }}>
          <strong>推奨年齢区分: {draft.ageRating.recommended || '未判定'}</strong>
          {draft.ageRating.answers.length > 0 && (
            <ul style={{ margin: '6px 0', paddingLeft: 20 }}>
              {draft.ageRating.answers.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
          {draft.reviewNotes && <p style={{ margin: '6px 0 0' }}>審査メモ: {draft.reviewNotes}</p>}
          <details style={{ marginTop: 8 }}>
            <summary style={{ cursor: 'pointer' }}>プライバシーポリシー本文 (コピーしてホスティング → URLを下に入力)</summary>
            <pre style={{ whiteSpace: 'pre-wrap', font: 'inherit', fontSize: '0.82rem', marginTop: 6 }}>
              {draft.privacyPolicyMarkdown}
            </pre>
          </details>
        </div>
      )}

      <div className="submissionGateList">
        {items.map((item) => {
          const approved = !!state.approved[item.id];
          return (
            <div key={item.id} className={`submissionGateItem ${approved ? 'approved' : ''}`}>
              <button
                type="button"
                className={`submissionGateCheck ${approved ? 'on' : ''}`}
                onClick={() => toggleApprove(item.id)}
                aria-label="承認"
              >
                {approved && <Check size={16} />}
              </button>
              <div>
                <h4>
                  {item.title}
                  {item.aiDrafted && <span className="aiBadge">AI下書き</span>}
                </h4>
                <div className="note">{item.note}</div>
                {item.cost && <span className="cost">{item.cost}</span>}
                {item.needsValue && (
                  <input
                    className="valueInput"
                    type="text"
                    value={state.values[item.id] ?? ''}
                    onChange={(e) => setValue(item.id, e.target.value)}
                    placeholder={item.valueLabel ?? '入力'}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {costs.length > 0 && (
        <div className="submissionGateCostBox">
          <strong>発生する費用:</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
            {costs.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="submissionGateFooter">
        {!confirming && (
          <button
            type="button"
            className="submissionGateSubmitBtn"
            disabled={!ready || submitting || platforms.length === 0}
            onClick={() => setConfirming(true)}
          >
            <Rocket size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {submitting ? '提出中…' : '全て承認して提出を開始'}
          </button>
        )}

        {confirming && (
          <div className="submissionGateConfirm">
            <h4>本当に提出しますか?</h4>
            <p style={{ margin: 0, fontSize: '0.86rem' }}>
              提出先: {platforms.map((p) => PLATFORM_LABELS[p]).join(' / ')}
            </p>
            {costs.length > 0 && (
              <p style={{ margin: 0, fontSize: '0.86rem' }}>
                費用が発生します: {costs.join(' / ')}
              </p>
            )}
            <div className="actions">
              <button type="button" className="go" onClick={() => void runSubmit()}>
                提出する
              </button>
              <button type="button" className="cancel" onClick={() => setConfirming(false)}>
                やめる
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className={`submissionGateResult ${result.error ? 'err' : 'ok'}`}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', font: 'inherit' }}>{result.text}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
