import { useState } from 'react';
import '../previewDeployStatus.css';
import { DarakePanelBadge } from './DarakePanelBadge';
import {
  buildDefaultPreviewDeployRecord,
  deployStatusLabel,
  deployStatusLevel,
  loadPreviewDeployRecord,
  savePreviewDeployRecord,
  sanitizePreviewUrl,
  type DeployStatus,
} from '../utils/previewDeployStatus';
import { extractFirstPreviewUrl } from '../utils/extractPreviewUrls';

const DEPLOY_OPTIONS: { value: DeployStatus; label: string }[] = [
  { value: 'deployed', label: '完了' },
  { value: 'deploying', label: 'デプロイ中' },
  { value: 'failed', label: '失敗' },
  { value: 'unknown', label: '未確認' },
];

export function PreviewDeployStatusPanel() {
  const stored = loadPreviewDeployRecord() ?? buildDefaultPreviewDeployRecord();
  const [record, setRecord] = useState(stored);
  const [phaseName, setPhaseName] = useState(stored.phaseName);
  const [previewUrl, setPreviewUrl] = useState(stored.previewUrl ?? '');
  const [deployStatus, setDeployStatus] = useState<DeployStatus>(stored.deployStatus);
  const [pasteText, setPasteText] = useState('');
  const [urlSource, setUrlSource] = useState<'manual' | 'extracted'>('manual');

  const level = deployStatusLevel(record.deployStatus);
  const safePreviewUrl = sanitizePreviewUrl(record.previewUrl);

  function save() {
    const next = {
      ...record,
      phaseName,
      previewUrl: sanitizePreviewUrl(previewUrl),
      deployStatus,
      deployedAt: deployStatus === 'deployed' ? new Date().toISOString() : record.deployedAt,
    };
    savePreviewDeployRecord(next);
    setRecord(next);
  }

  function reset() {
    const def = buildDefaultPreviewDeployRecord();
    savePreviewDeployRecord(def);
    setRecord(def);
    setPhaseName(def.phaseName);
    setPreviewUrl('');
    setDeployStatus('unknown');
    setPasteText('');
    setUrlSource('manual');
  }

  function extractUrl() {
    const found = extractFirstPreviewUrl(pasteText);
    if (found) {
      setPreviewUrl(found);
      setUrlSource('extracted');
    } else {
      setUrlSource('manual');
    }
  }

  const deployedAtFormatted = record.deployedAt
    ? new Date(record.deployedAt).toLocaleString('ja-JP')
    : null;

  return (
    <section className="previewDeploy" aria-label="Preview/Deploy 手動確認メモ">
      <DarakePanelBadge kinds={['manual-note']} />
      <span className="previewDeploy__eyebrow">Phase 97 · 手動メモ（実データ未連携）</span>
      <h2 className="previewDeploy__title">Preview/Deploy 手動確認メモ</h2>

      <div className={`previewDeploy__status previewDeploy__status--${level}`}>
        <span className="previewDeploy__dot" aria-hidden="true" />
        <div className="previewDeploy__statusBody">
          <div className="previewDeploy__statusLabel">
            {record.phaseName} — デプロイ: {deployStatusLabel(record.deployStatus)}
          </div>
          <div className="previewDeploy__statusSub">
            {deployedAtFormatted
              ? `反映完了: ${deployedAtFormatted}`
              : record.deployStatus === 'deploying'
                ? 'デプロイ中です。少し待ってください。'
                : record.deployStatus === 'failed'
                  ? 'デプロイが失敗しました。CIログを確認してください。'
                  : '表示中バージョンが確認できていません。'}
          </div>
        </div>
      </div>

      {safePreviewUrl ? (
        <a
          href={safePreviewUrl}
          target="_blank"
          rel="noreferrer"
          className="previewDeploy__openBtn"
        >
          Previewを開く
        </a>
      ) : null}

      <div className="previewDeploy__form">
        <div className="previewDeploy__field">
          <label className="previewDeploy__label" htmlFor="pd-phase">Phaseの名前</label>
          <input
            id="pd-phase"
            className="previewDeploy__input"
            value={phaseName}
            onChange={(e) => setPhaseName(e.target.value)}
            placeholder="Phase 97"
          />
        </div>

        <div className="previewDeploy__field">
          <label className="previewDeploy__label" htmlFor="pd-url">Preview URL</label>
          <div className="previewDeploy__urlRow">
            <input
              id="pd-url"
              className="previewDeploy__input"
              value={previewUrl}
              onChange={(e) => { setPreviewUrl(e.target.value); setUrlSource('manual'); }}
              placeholder="https://your-worker.your-subdomain.workers.dev"
            />
            {urlSource === 'extracted' ? (
              <span className="previewDeploy__urlBadge previewDeploy__urlBadge--real">実データ</span>
            ) : previewUrl ? (
              <span className="previewDeploy__urlBadge previewDeploy__urlBadge--manual">手動メモ</span>
            ) : null}
          </div>
        </div>

        <div className="previewDeploy__field">
          <label className="previewDeploy__label" htmlFor="pd-paste">PR/IssueコメントのURLを貼り付け</label>
          <textarea
            id="pd-paste"
            className="previewDeploy__textarea"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="PR/Issueのコメントや本文をここに貼り付けてください"
            rows={3}
          />
          <button type="button" className="previewDeploy__extractBtn" onClick={extractUrl}>
            URLを自動抽出
          </button>
          {pasteText && extractFirstPreviewUrl(pasteText) === null ? (
            <span className="previewDeploy__extractHint">URLが見つかりませんでした。手動で入力してください。</span>
          ) : null}
        </div>

        <div className="previewDeploy__field">
          <span className="previewDeploy__label">デプロイ状態</span>
          <div className="previewDeploy__row">
            {DEPLOY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`previewDeploy__setBtn${deployStatus === opt.value ? '' : ''}`}
                style={deployStatus === opt.value ? { background: '#16a34a' } : { background: '#6b7280' }}
                onClick={() => setDeployStatus(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="previewDeploy__row">
          <button type="button" className="previewDeploy__setBtn" onClick={save}>
            保存する
          </button>
          <button type="button" className="previewDeploy__resetBtn" onClick={reset}>
            リセット
          </button>
        </div>
      </div>

      <p className="previewDeploy__hint">
        「古い画面を見ているかも」と思ったら、ブラウザを再読み込みしてください。
      </p>
    </section>
  );
}
