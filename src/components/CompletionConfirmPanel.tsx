import { useRef, useState } from 'react';
import { CheckCircle2, ImagePlus, PartyPopper, Wrench, X } from 'lucide-react';
import { fileToDesignAsset } from '../utils/appDesignInputClient';
import type { DesignAssetInput } from '../utils/designAsset';
import { postFinalCheck, type FinalCheckResult } from '../services/finalCheckService';

type StagedImage = DesignAssetInput & { previewUrl: string };

type Status =
  | { kind: 'idle' }
  | { kind: 'preparing' }
  | { kind: 'checking' }
  | { kind: 'done'; result: FinalCheckResult }
  | { kind: 'error'; message: string };

type Decision = 'complete' | 'fix' | null;

export function CompletionConfirmPanel() {
  const [projectId, setProjectId] = useState('manual');
  const [previewUrl, setPreviewUrl] = useState('');
  const [design, setDesign] = useState<StagedImage[]>([]);
  const [shots, setShots] = useState<StagedImage[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [decision, setDecision] = useState<Decision>(null);
  const [fixText, setFixText] = useState('');
  const designRef = useRef<HTMLInputElement>(null);
  const shotsRef = useRef<HTMLInputElement>(null);

  async function addFiles(
    list: FileList,
    setter: React.Dispatch<React.SetStateAction<StagedImage[]>>,
    current: StagedImage[],
  ) {
    setStatus({ kind: 'preparing' });
    const next: StagedImage[] = [];
    for (const file of Array.from(list).slice(0, 8 - current.length)) {
      const res = await fileToDesignAsset(file);
      if (!res.ok) {
        setStatus({ kind: 'error', message: `${file.name}: ${res.message}` });
        return;
      }
      next.push({ ...res.asset, previewUrl: `data:${res.asset.mediaType};base64,${res.asset.base64}` });
    }
    setter((prev) => [...prev, ...next]);
    setStatus({ kind: 'idle' });
  }

  async function runCheck() {
    if (design.length === 0 || shots.length === 0) {
      setStatus({ kind: 'error', message: '参照設計図とアプリ全体のスクショを両方追加してください' });
      return;
    }
    setStatus({ kind: 'checking' });
    setDecision(null);
    const res = await postFinalCheck({
      projectId: projectId.trim() || 'manual',
      previewUrl: previewUrl.trim() || undefined,
      designAssets: design.map((d) => ({ mediaType: d.mediaType, base64: d.base64, label: d.label })),
      capturedScreenshots: shots.map((s) => ({ mediaType: s.mediaType, base64: s.base64, label: s.label })),
    });
    if (res.ok) {
      setStatus({ kind: 'done', result: res.result });
    } else {
      setStatus({ kind: 'error', message: `[${res.code}] ${res.error}` });
    }
  }

  const result = status.kind === 'done' ? status.result : null;

  return (
    <div className="appDesignInputPanel">
      <div className="appDesignInputHero">
        <CheckCircle2 />
        <div>
          <p className="eyebrow">Phase 105 / Completion</p>
          <h3>完成判定 — 「本当にそうか?」</h3>
          <p>
            アプリ全体のスクショと設計図を2段階(厳格＋粗探し)で照合します。両方が通れば完成扱い、確認URLとともに「完成」か「修正」を選べます。
          </p>
        </div>
      </div>

      <div className="appDesignInputSafety">
        <strong>設定が必要:</strong> Worker Secret <code>ANTHROPIC_API_KEY</code> と wrangler変数{' '}
        <code>DARAKE_FINAL_CHECK_ENABLED=true</code>。
      </div>

      <label style={{ fontSize: '0.85rem', color: '#35513d' }}>
        プロジェクトID
        <input
          type="text"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="manual"
          style={inputStyle}
        />
      </label>
      <label style={{ fontSize: '0.85rem', color: '#35513d' }}>
        プレビューURL (任意)
        <input
          type="text"
          value={previewUrl}
          onChange={(e) => setPreviewUrl(e.target.value)}
          placeholder="https://....pages.dev"
          style={inputStyle}
        />
      </label>

      <div className="visionVerifyTwoCol">
        <fieldset>
          <legend>参照設計図</legend>
          <div className="visionVerifyDropZone" onClick={() => designRef.current?.click()} role="button" tabIndex={0}>
            <ImagePlus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> 設計図を追加
          </div>
          <input
            ref={designRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.length) {
                void addFiles(e.target.files, setDesign, design);
                e.target.value = '';
              }
            }}
          />
          <Thumbs images={design} onRemove={(i) => setDesign((p) => p.filter((_, idx) => idx !== i))} />
        </fieldset>
        <fieldset>
          <legend>アプリ全体スクショ</legend>
          <div className="visionVerifyDropZone" onClick={() => shotsRef.current?.click()} role="button" tabIndex={0}>
            <ImagePlus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> スクショを追加
          </div>
          <input
            ref={shotsRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.length) {
                void addFiles(e.target.files, setShots, shots);
                e.target.value = '';
              }
            }}
          />
          <Thumbs images={shots} onRemove={(i) => setShots((p) => p.filter((_, idx) => idx !== i))} />
        </fieldset>
      </div>

      <div className="appDesignInputControls">
        <button
          type="button"
          className="primary"
          onClick={runCheck}
          disabled={status.kind === 'checking' || status.kind === 'preparing'}
        >
          {status.kind === 'checking' ? '判定中…(2パス)' : '完成判定する'}
        </button>
        {status.kind === 'error' && (
          <span className="appDesignInputStatus error">{status.message}</span>
        )}
      </div>

      {result && (
        <div className="appDesignInputResult">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {result.complete ? (
              <span style={{ color: '#2c5238', fontWeight: 700, fontSize: '1.1rem' }}>
                <PartyPopper size={18} style={{ verticalAlign: 'middle' }} /> 完成と判定されました
              </span>
            ) : (
              <span style={{ color: '#813a1e', fontWeight: 700, fontSize: '1.1rem' }}>
                まだ完成していません (score {result.score})
              </span>
            )}
          </div>

          {result.previewUrl && (
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              確認URL:{' '}
              <a href={result.previewUrl} target="_blank" rel="noreferrer">
                {result.previewUrl}
              </a>
            </p>
          )}
          {result.notes && <p style={{ margin: 0, fontSize: '0.86rem', color: '#4c5b46' }}>{result.notes}</p>}

          {result.blockers.length > 0 && (
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#813a1e' }}>リリースを止める問題</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 20, fontSize: '0.85rem' }}>
                {result.blockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
          {result.reasonsNotDone.length > 0 && (
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#6a7765' }}>「本当に完成?」の指摘</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 20, fontSize: '0.85rem' }}>
                {result.reasonsNotDone.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="appDesignInputControls">
            <button type="button" className="primary" onClick={() => setDecision('complete')}>
              <CheckCircle2 size={14} /> これで完成
            </button>
            <button type="button" className="primary" onClick={() => setDecision('fix')}>
              <Wrench size={14} /> 修正したい
            </button>
          </div>

          {decision === 'complete' && (
            <div className="submissionGateResult ok">
              完成として確定しました。Submitグループの「申請前ゲート」に進んでください。
            </div>
          )}
          {decision === 'fix' && (
            <div style={{ display: 'grid', gap: 8 }}>
              <textarea
                rows={3}
                value={fixText}
                onChange={(e) => setFixText(e.target.value)}
                placeholder="直してほしい点を書いてください (例: トップのヘッダーをもっと大きく)"
                style={{ ...inputStyle, maxWidth: '100%' }}
              />
              <div className="submissionGateResult err">
                この修正依頼を新しいIssueとして@copilotに渡す処理は、autopilotのプロジェクト連携で実行されます。現時点では内容をコピーして手動Issue化してください。
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  marginTop: 4,
  display: 'block',
  width: '100%',
  maxWidth: 360,
  border: '1px solid rgba(76,124,85,0.25)',
  borderRadius: 10,
  padding: '8px 10px',
  font: 'inherit',
};

function Thumbs({ images, onRemove }: { images: StagedImage[]; onRemove: (idx: number) => void }) {
  if (images.length === 0) return null;
  return (
    <div className="visionVerifyThumbs">
      {images.map((img, idx) => (
        <div key={`${img.label}-${idx}`} className="visionVerifyThumb">
          <button type="button" onClick={() => onRemove(idx)} aria-label="削除">
            <X size={11} />
          </button>
          <img src={img.previewUrl} alt={img.label ?? `img-${idx}`} />
        </div>
      ))}
    </div>
  );
}
