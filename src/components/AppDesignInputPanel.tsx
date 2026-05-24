import { useRef, useState } from 'react';
import { Check, Copy, ImagePlus, Sparkles, X } from 'lucide-react';
import {
  fileToDesignAsset,
  postGenerateBlueprintFromInput,
} from '../utils/appDesignInputClient';
import type { BlueprintGenerationResult, DesignAssetInput } from '../utils/designAsset';
import { formatPhasePlanMarkdown } from '../utils/phasePlanGenerator';
import {
  formatIssueDraftBatchAllMarkdown,
  generateIssueDraftBatch,
} from '../utils/issueDraftBatchGenerator';

type Status =
  | { kind: 'idle' }
  | { kind: 'preparing' }
  | { kind: 'submitting' }
  | { kind: 'done'; result: BlueprintGenerationResult; spendUsd?: number }
  | { kind: 'error'; message: string };

type StagedImage = DesignAssetInput & { previewUrl: string };

const MAX_IMAGES = 8;

export function AppDesignInputPanel() {
  const [appName, setAppName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<StagedImage[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [dragOver, setDragOver] = useState(false);
  const [copyTarget, setCopyTarget] = useState<'phases' | 'issues' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function addFiles(fileList: FileList | File[]) {
    setStatus({ kind: 'preparing' });
    const remaining = MAX_IMAGES - images.length;
    const incoming = Array.from(fileList).slice(0, remaining);
    const next: StagedImage[] = [];
    for (const file of incoming) {
      const res = await fileToDesignAsset(file);
      if (!res.ok) {
        setStatus({ kind: 'error', message: `${file.name}: ${res.message}` });
        return;
      }
      const dataUrl = `data:${res.asset.mediaType};base64,${res.asset.base64}`;
      next.push({ ...res.asset, previewUrl: dataUrl });
    }
    setImages((prev) => [...prev, ...next]);
    setStatus({ kind: 'idle' });
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      void addFiles(e.dataTransfer.files);
    }
  }

  async function handleGenerate() {
    if (!appName.trim()) {
      setStatus({ kind: 'error', message: 'アプリ名を入力してください' });
      return;
    }
    if (!description.trim() && images.length === 0) {
      setStatus({ kind: 'error', message: '説明文か画像を少なくとも1つ追加してください' });
      return;
    }
    setStatus({ kind: 'submitting' });
    const res = await postGenerateBlueprintFromInput({
      appName: appName.trim(),
      description: description.trim(),
      images: images.map((img) => ({
        mediaType: img.mediaType,
        base64: img.base64,
        label: img.label,
      })),
    });
    if (res.ok) {
      setStatus({ kind: 'done', result: res.result });
    } else {
      setStatus({ kind: 'error', message: `[${res.code}] ${res.error}` });
    }
  }

  async function handleCopy(text: string, target: 'phases' | 'issues') {
    try {
      await navigator.clipboard.writeText(text);
      setCopyTarget(target);
      window.setTimeout(() => setCopyTarget(null), 1800);
    } catch {
      /* ignore */
    }
  }

  const isBusy = status.kind === 'submitting' || status.kind === 'preparing';
  const result = status.kind === 'done' ? status.result : null;

  return (
    <div className="appDesignInputPanel">
      <div className="appDesignInputHero">
        <Sparkles />
        <div>
          <p className="eyebrow">Phase 101 / Design Input</p>
          <h3>設計図を投げて、あとは待つだけ</h3>
          <p>
            アプリ名・説明・参考画像を送ると、AIが各フェーズに分解した設計図を作ります。生成内容を確認して、Issue化に進めます。
          </p>
        </div>
      </div>

      <div className="appDesignInputSafety">
        <strong>設定が必要:</strong>{' '}
        Worker Secretに <code>ANTHROPIC_API_KEY</code> を設定し、wrangler変数{' '}
        <code>DARAKE_BLUEPRINT_AI_ENABLED=true</code> にしてください。未設定の場合はエラーが返ります。
      </div>

      <div className="appDesignInputForm">
        <fieldset>
          <legend>1. 基本情報</legend>
          <label>
            アプリ名
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="例: ねこ電卓"
              maxLength={80}
            />
          </label>
          <label>
            説明 / コンセプト
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="どんなアプリを作りたいか、できるだけ詳しく書いてください。ターゲットや雰囲気も歓迎です。"
              maxLength={4000}
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>2. 設計画像 (0〜{MAX_IMAGES}枚)</legend>
          <div
            className={`appDesignInputDropZone ${dragOver ? 'dragOver' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
          >
            <ImagePlus size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            画像をここにドロップ、またはクリックして選択 (PNG / JPEG / WebP、4MB以下)
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.length) {
                void addFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />
          {images.length > 0 && (
            <div className="appDesignInputThumbs">
              {images.map((img, idx) => (
                <div key={`${img.label}-${idx}`} className="appDesignInputThumb">
                  <button type="button" onClick={() => removeImage(idx)} aria-label="削除">
                    <X size={12} />
                  </button>
                  <img src={img.previewUrl} alt={img.label ?? `image-${idx + 1}`} />
                  <div className="label">{img.label ?? `image-${idx + 1}`}</div>
                </div>
              ))}
            </div>
          )}
        </fieldset>
      </div>

      <div className="appDesignInputControls">
        <button
          type="button"
          className="primary"
          onClick={handleGenerate}
          disabled={isBusy}
        >
          {status.kind === 'submitting' ? 'AI生成中…' : '設計図を生成'}
        </button>
        {status.kind === 'preparing' && (
          <span className="appDesignInputStatus">画像を準備しています…</span>
        )}
        {status.kind === 'error' && (
          <span className="appDesignInputStatus error">{status.message}</span>
        )}
      </div>

      {result && <ResultView result={result} onCopy={handleCopy} copyTarget={copyTarget} />}
    </div>
  );
}

function ResultView({
  result,
  onCopy,
  copyTarget,
}: {
  result: BlueprintGenerationResult;
  onCopy: (text: string, target: 'phases' | 'issues') => void;
  copyTarget: 'phases' | 'issues' | null;
}) {
  const issueBatch = generateIssueDraftBatch(result.plan.appName, result.plan);
  const phasesMarkdown = formatPhasePlanMarkdown(result.plan);
  const issuesMarkdown = formatIssueDraftBatchAllMarkdown(issueBatch);

  return (
    <div className="appDesignInputResult">
      <h4>生成された設計図</h4>
      <p style={{ margin: 0, color: '#4c5b46', fontSize: '0.9rem' }}>{result.designSummary}</p>

      {result.visualSpec.palette.length > 0 && (
        <div>
          <strong style={{ fontSize: '0.85rem', color: '#35513d' }}>パレット</strong>
          <div className="appDesignInputPaletteRow" style={{ marginTop: 6 }}>
            {result.visualSpec.palette.map((c) => (
              <span
                key={c}
                className="appDesignInputPaletteSwatch"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}

      {result.visualSpec.vibe && (
        <div className="appDesignInputResultMeta">
          <span>🎨 雰囲気: {result.visualSpec.vibe}</span>
          {result.visualSpec.typography.map((t) => (
            <span key={t}>🔤 {t}</span>
          ))}
        </div>
      )}

      <div>
        <strong style={{ fontSize: '0.9rem', color: '#35513d' }}>
          フェーズ ({result.plan.phases.length}個)
        </strong>
        <div className="appDesignInputPhasesList" style={{ marginTop: 8 }}>
          {result.plan.phases.map((p) => (
            <div key={p.id} className="appDesignInputPhaseCard">
              <h5>
                {p.id} — {p.title}
              </h5>
              <p>{p.purpose}</p>
              {p.tasks.length > 0 && (
                <ul>
                  {p.tasks.slice(0, 5).map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              )}
              {p.manualGates.length > 0 && (
                <p style={{ color: '#b9822e' }}>⚠️ {p.manualGates.join(' / ')}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="appDesignInputControls">
        <button
          type="button"
          className="primary"
          onClick={() => onCopy(phasesMarkdown, 'phases')}
        >
          {copyTarget === 'phases' ? <Check size={14} /> : <Copy size={14} />} Phase計画をコピー
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => onCopy(issuesMarkdown, 'issues')}
        >
          {copyTarget === 'issues' ? <Check size={14} /> : <Copy size={14} />} Issue下書きをコピー
        </button>
      </div>
    </div>
  );
}
