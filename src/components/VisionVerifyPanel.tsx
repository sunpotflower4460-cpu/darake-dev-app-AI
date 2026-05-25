import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Eye, ImagePlus, RefreshCw, X } from 'lucide-react';
import { fileToDesignAsset } from '../utils/appDesignInputClient';
import type { DesignAssetInput } from '../utils/designAsset';
import type { VisionCompareResult } from '../utils/visionResult';
import { listVisionResults, postCompareScreenshots } from '../services/visionResultService';

type StagedImage = DesignAssetInput & { previewUrl: string };

type Status =
  | { kind: 'idle' }
  | { kind: 'preparing' }
  | { kind: 'submitting' }
  | { kind: 'done'; result: VisionCompareResult }
  | { kind: 'error'; message: string };

const MAX_PER_SIDE = 6;

export function VisionVerifyPanel() {
  const [projectId, setProjectId] = useState('manual');
  const [focusHint, setFocusHint] = useState('');
  const [design, setDesign] = useState<StagedImage[]>([]);
  const [shots, setShots] = useState<StagedImage[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<VisionCompareResult[]>([]);
  const [historyMsg, setHistoryMsg] = useState('');

  const designInputRef = useRef<HTMLInputElement>(null);
  const shotsInputRef = useRef<HTMLInputElement>(null);

  async function addFiles(
    fileList: FileList | File[],
    setter: React.Dispatch<React.SetStateAction<StagedImage[]>>,
    current: StagedImage[],
  ) {
    setStatus({ kind: 'preparing' });
    const remaining = MAX_PER_SIDE - current.length;
    const incoming = Array.from(fileList).slice(0, remaining);
    const next: StagedImage[] = [];
    for (const file of incoming) {
      const res = await fileToDesignAsset(file);
      if (!res.ok) {
        setStatus({ kind: 'error', message: `${file.name}: ${res.message}` });
        return;
      }
      next.push({
        ...res.asset,
        previewUrl: `data:${res.asset.mediaType};base64,${res.asset.base64}`,
      });
    }
    setter((prev) => [...prev, ...next]);
    setStatus({ kind: 'idle' });
  }

  async function handleCompare() {
    if (design.length === 0 || shots.length === 0) {
      setStatus({ kind: 'error', message: '参照設計図とスクリーンショットを両方追加してください' });
      return;
    }
    setStatus({ kind: 'submitting' });
    const res = await postCompareScreenshots({
      projectId: projectId.trim() || 'manual',
      capturedScreenshots: shots.map((s) => ({
        mediaType: s.mediaType,
        base64: s.base64,
        label: s.label,
      })),
      designAssets: design.map((d) => ({
        mediaType: d.mediaType,
        base64: d.base64,
        label: d.label,
      })),
      focusHint: focusHint.trim() || undefined,
    });
    if (res.ok) {
      setStatus({ kind: 'done', result: res.result });
      void loadHistory();
    } else {
      setStatus({ kind: 'error', message: `[${res.code}] ${res.error}` });
    }
  }

  async function loadHistory() {
    const res = await listVisionResults(projectId.trim() || 'manual', 20);
    if (res.ok) {
      setHistory(res.results);
      setHistoryMsg(res.results.length === 0 ? '履歴はまだありません' : '');
    } else {
      setHistoryMsg(`履歴取得失敗: [${res.code}] ${res.error}`);
    }
  }

  useEffect(() => {
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCopyComment(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const isBusy = status.kind === 'submitting' || status.kind === 'preparing';
  const result = status.kind === 'done' ? status.result : null;

  return (
    <div className="visionVerifyPanel">
      <div className="visionVerifyHero">
        <Eye />
        <div>
          <p className="eyebrow">Phase 102 / Vision Verify</p>
          <h3>スクショ vs 設計図 を判定する</h3>
          <p>
            現在のスクリーンショットと参照設計図を渡すと、AIが一致度を採点し、差分があれば@copilot向けの修正リクエストを生成します。
          </p>
        </div>
      </div>

      <div className="appDesignInputSafety">
        <strong>設定が必要:</strong> Worker Secretに <code>ANTHROPIC_API_KEY</code>、wrangler変数{' '}
        <code>DARAKE_VISION_VERIFY_ENABLED=true</code>。履歴保存には <code>RUN_REGISTRY_KV</code> が必要です。
      </div>

      <label style={{ fontSize: '0.85rem', color: '#35513d' }}>
        プロジェクトID (履歴のグルーピング用)
        <input
          type="text"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="manual"
          style={{
            marginTop: 4,
            display: 'block',
            width: '100%',
            maxWidth: 320,
            border: '1px solid rgba(76,124,85,0.25)',
            borderRadius: 10,
            padding: '8px 10px',
            font: 'inherit',
          }}
        />
      </label>

      <div className="visionVerifyTwoCol">
        <fieldset>
          <legend>参照設計図 (0〜{MAX_PER_SIDE})</legend>
          <div
            className="visionVerifyDropZone"
            onClick={() => designInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <ImagePlus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            設計図を追加
          </div>
          <input
            ref={designInputRef}
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
          <ThumbGrid images={design} onRemove={(i) => setDesign((p) => p.filter((_, idx) => idx !== i))} />
        </fieldset>

        <fieldset>
          <legend>現在のスクリーンショット (0〜{MAX_PER_SIDE})</legend>
          <div
            className="visionVerifyDropZone"
            onClick={() => shotsInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <ImagePlus size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            スクショを追加
          </div>
          <input
            ref={shotsInputRef}
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
          <ThumbGrid images={shots} onRemove={(i) => setShots((p) => p.filter((_, idx) => idx !== i))} />
        </fieldset>
      </div>

      <label style={{ fontSize: '0.85rem', color: '#35513d' }}>
        重点的に見てほしいポイント (任意)
        <input
          type="text"
          value={focusHint}
          onChange={(e) => setFocusHint(e.target.value)}
          placeholder="例: ヘッダーの配色とボタンの角丸"
          style={{
            marginTop: 4,
            display: 'block',
            width: '100%',
            border: '1px solid rgba(76,124,85,0.25)',
            borderRadius: 10,
            padding: '8px 10px',
            font: 'inherit',
          }}
        />
      </label>

      <div className="visionVerifyControls">
        <button type="button" className="primary" onClick={handleCompare} disabled={isBusy}>
          {status.kind === 'submitting' ? '判定中…' : '判定する'}
        </button>
        {status.kind === 'preparing' && <span style={{ fontSize: '0.85rem' }}>画像を準備中…</span>}
        {status.kind === 'error' && (
          <span style={{ fontSize: '0.85rem', color: '#b94c2e' }}>{status.message}</span>
        )}
      </div>

      {result && <ResultView result={result} copied={copied} onCopy={handleCopyComment} />}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <strong style={{ fontSize: '0.9rem', color: '#35513d' }}>判定履歴</strong>
          <button
            type="button"
            onClick={() => void loadHistory()}
            style={{
              border: '1px solid rgba(76,124,85,0.25)',
              borderRadius: 8,
              padding: '4px 8px',
              background: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.8rem',
            }}
          >
            <RefreshCw size={12} /> 更新
          </button>
        </div>
        {historyMsg && <p style={{ fontSize: '0.82rem', color: '#6a7765' }}>{historyMsg}</p>}
        <div className="visionVerifyHistory">
          {history.map((h) => (
            <div key={h.resultId} className="visionVerifyHistoryItem">
              <span className={`badge ${h.pass ? 'pass' : 'fail'}`} style={{ padding: '2px 8px', borderRadius: 999, fontSize: '0.78rem' }}>
                {h.pass ? 'PASS' : 'FAIL'}
              </span>
              <span>
                score {h.score} / 差分 {h.divergences.length}
                {h.phaseId ? ` / ${h.phaseId}` : ''}
              </span>
              <span className="ts">{new Date(h.createdAt).toLocaleString('ja-JP')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThumbGrid({
  images,
  onRemove,
}: {
  images: StagedImage[];
  onRemove: (idx: number) => void;
}) {
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

function ResultView({
  result,
  copied,
  onCopy,
}: {
  result: VisionCompareResult;
  copied: boolean;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="visionVerifyResult">
      <div className="visionVerifyVerdict">
        <span className={`badge ${result.pass ? 'pass' : 'fail'}`}>
          {result.pass ? '✓ 一致' : '✗ 要修正'}
        </span>
        <span>スコア {result.score} / 100</span>
      </div>

      {result.divergences.length > 0 && (
        <div style={{ display: 'grid', gap: 6 }}>
          {result.divergences.map((d, i) => (
            <div key={i} className={`visionVerifyDiv ${d.severity}`}>
              <span className="area">[{d.severity.toUpperCase()}] {d.area}</span>
              <div>{d.fixHint}</div>
            </div>
          ))}
        </div>
      )}

      {result.fixInstructions && (
        <div>
          <strong style={{ fontSize: '0.85rem', color: '#35513d' }}>修正方針</strong>
          <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#4c5b46' }}>
            {result.fixInstructions}
          </p>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <strong style={{ fontSize: '0.85rem', color: '#35513d' }}>
            @copilot 修正リクエスト (コピーしてPRに貼り付け)
          </strong>
          <button
            type="button"
            onClick={() => onCopy(result.fixRequestComment)}
            style={{
              border: '1px solid rgba(76,124,85,0.25)',
              borderRadius: 8,
              padding: '4px 8px',
              background: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.8rem',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />} コピー
          </button>
        </div>
        <div className="visionVerifyCommentBox">{result.fixRequestComment}</div>
      </div>
    </div>
  );
}
