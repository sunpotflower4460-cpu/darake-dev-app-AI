import { useMemo, useState } from 'react';
import '../previewDeployStatus.css';
import { DarakePanelBadge } from './DarakePanelBadge';
import {
  buildDarakeWorkSession,
  loadCurrentWorkSession,
  saveCurrentWorkSession,
} from '../utils/darakeWorkSession';
import {
  buildDefaultPreviewDeployRecord,
  deployStatusLabel,
  deployStatusLevel,
  loadPreviewDeployRecord,
  savePreviewDeployRecord,
  sanitizePreviewUrl,
  type DeployStatus,
  type PreviewDeployRecord,
} from '../utils/previewDeployStatus';
import { extractPreviewUrls } from '../utils/previewUrlExtractor';
import { buildGitHubPrUrl, loadPrCiLastQuery } from '../utils/prCiStatusClient';

const DEPLOY_OPTIONS: { value: DeployStatus; label: string }[] = [
  { value: 'deployed', label: '完了' },
  { value: 'deploying', label: 'デプロイ中' },
  { value: 'failed', label: '失敗' },
  { value: 'unknown', label: '未確認' },
];

function buildNextRecord(
  current: PreviewDeployRecord,
  phaseName: string,
  previewUrl: string,
  deployStatus: DeployStatus,
): PreviewDeployRecord {
  return {
    ...current,
    phaseName,
    previewUrl: sanitizePreviewUrl(previewUrl),
    deployStatus,
    deployedAt: deployStatus === 'deployed' ? new Date().toISOString() : current.deployedAt,
  };
}

export function PreviewDeployStatusPanel() {
  const stored = loadPreviewDeployRecord() ?? buildDefaultPreviewDeployRecord();
  const lastQuery = loadPrCiLastQuery();
  const linkedPrUrl = useMemo(() => {
    const prNumber = Number.parseInt(lastQuery.prNumber, 10);
    return buildGitHubPrUrl(lastQuery.repoUrl, prNumber);
  }, [lastQuery.prNumber, lastQuery.repoUrl]);

  const [record, setRecord] = useState(stored);
  const [phaseName, setPhaseName] = useState(stored.phaseName);
  const [previewUrl, setPreviewUrl] = useState(stored.previewUrl ?? '');
  const [deployStatus, setDeployStatus] = useState<DeployStatus>(stored.deployStatus);
  const [pasteText, setPasteText] = useState('');
  const [urlSource, setUrlSource] = useState<'manual' | 'extracted'>('manual');
  const [detectedUrls, setDetectedUrls] = useState<string[]>([]);
  const [detectionAttempted, setDetectionAttempted] = useState(false);

  const level = deployStatusLevel(record.deployStatus);
  const safePreviewUrl = sanitizePreviewUrl(record.previewUrl);
  const detectedPreviewUrl = detectedUrls[0] ?? null;

  function persist(next: PreviewDeployRecord, nextSource: 'manual' | 'extracted') {
    savePreviewDeployRecord(next);
    const currentSession = loadCurrentWorkSession();
    if (currentSession) {
      saveCurrentWorkSession(
        buildDarakeWorkSession({
          ...currentSession,
          previewUrl: next.previewUrl,
          status: next.previewUrl ? 'preview-ready' : 'ci-checking',
          nextActionLabel: next.previewUrl ? 'Previewを見る' : 'Preview URLを探す',
        }),
      );
    }
    setRecord(next);
    setPhaseName(next.phaseName);
    setPreviewUrl(next.previewUrl ?? '');
    setDeployStatus(next.deployStatus);
    setUrlSource(nextSource);
  }

  function saveManualRecord() {
    persist(buildNextRecord(record, phaseName, previewUrl, deployStatus), 'manual');
  }

  function saveDetectedUrl() {
    if (!detectedPreviewUrl) return;
    persist(buildNextRecord(record, phaseName, detectedPreviewUrl, deployStatus), 'extracted');
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
    setDetectedUrls([]);
    setDetectionAttempted(false);
  }

  function findPreviewUrls() {
    setDetectedUrls(extractPreviewUrls(pasteText));
    setDetectionAttempted(true);
  }

  function insertLinkedPrUrl() {
    if (!linkedPrUrl) return;
    setPasteText((current) => (current.trim() ? `${linkedPrUrl}\n${current}` : linkedPrUrl));
  }

  const deployedAtFormatted = record.deployedAt ? new Date(record.deployedAt).toLocaleString('ja-JP') : null;

  return (
    <section className="previewDeploy" aria-label="Preview/Deploy 実データと手動メモ">
      <DarakePanelBadge kinds={['real-data', 'manual-note']} />
      <span className="previewDeploy__eyebrow">Phase 104 · 自動検出 / 手動メモ</span>
      <h2 className="previewDeploy__title">Preview/Deploy 確認</h2>

      <div className="previewDeploy__realSection">
        <div className="previewDeploy__sectionLabel">Preview URL自動検出</div>
        {linkedPrUrl ? (
          <div className="previewDeploy__linkedCard">
            <div className="previewDeploy__linkedText">
              PR/CI連携: 保存済みPR URL
              <a
                href={linkedPrUrl}
                target="_blank"
                rel="noreferrer"
                className="previewDeploy__inlineLink"
                aria-label="保存済みPR URLを新しいタブで開く"
              >
                {linkedPrUrl}
              </a>
            </div>
            <button type="button" className="previewDeploy__extractBtn" onClick={insertLinkedPrUrl}>
              PR URLを貼る
            </button>
          </div>
        ) : (
          <div className="previewDeploy__linkedHint">PR/CIパネルで保存したPR URLがあると、ここから再利用できます。</div>
        )}

        <div className="previewDeploy__field">
          <label className="previewDeploy__label" htmlFor="pd-paste">
            PR/Issue本文やコメントを貼る
          </label>
          <textarea
            id="pd-paste"
            className="previewDeploy__textarea"
            value={pasteText}
            onChange={(event) => setPasteText(event.target.value)}
            placeholder="PR/Issueの本文やコメントをここに貼り付けてください"
            rows={5}
          />
          <button type="button" className="previewDeploy__extractBtn" onClick={findPreviewUrls}>
            Preview URLを探す
          </button>
        </div>

        {detectedPreviewUrl ? (
          <div className="previewDeploy__detectedCard">
            <div className="previewDeploy__detectedBadge">自動検出</div>
            <div className="previewDeploy__detectedTitle">Preview URLを見つけました</div>
            <a
              href={detectedPreviewUrl}
              target="_blank"
              rel="noreferrer"
              className="previewDeploy__inlineLink"
              aria-label="検出したPreview URLを新しいタブで開く"
            >
              {detectedPreviewUrl}
            </a>
            <div className="previewDeploy__row">
              <a href={detectedPreviewUrl} target="_blank" rel="noreferrer" className="previewDeploy__openBtn">
                Previewを開く
              </a>
              <button type="button" className="previewDeploy__setBtn" onClick={saveDetectedUrl}>
                このURLを保存
              </button>
            </div>
          </div>
        ) : detectionAttempted ? (
          <div className="previewDeploy__extractHint">Preview URLは見つかりませんでした。手動で入力できます。</div>
        ) : null}
      </div>

      <div className="previewDeploy__manualSection">
        <div className="previewDeploy__sectionLabel">Preview/Deploy 手動メモ</div>

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
          <div className="previewDeploy__savedRow">
            <a href={safePreviewUrl} target="_blank" rel="noreferrer" className="previewDeploy__openBtn">
              Previewを開く
            </a>
            <span
              className={`previewDeploy__urlBadge ${
                urlSource === 'extracted' ? 'previewDeploy__urlBadge--real' : 'previewDeploy__urlBadge--manual'
              }`}
            >
              {urlSource === 'extracted' ? '自動検出' : '手動メモ'}
            </span>
          </div>
        ) : null}

        <div className="previewDeploy__form">
          <div className="previewDeploy__field">
            <label className="previewDeploy__label" htmlFor="pd-phase">
              Phaseの名前
            </label>
            <input
              id="pd-phase"
              className="previewDeploy__input"
              value={phaseName}
              onChange={(event) => setPhaseName(event.target.value)}
              placeholder="Phase 104"
            />
          </div>

          <div className="previewDeploy__field">
            <label className="previewDeploy__label" htmlFor="pd-url">
              Preview URL
            </label>
            <input
              id="pd-url"
              className="previewDeploy__input"
              value={previewUrl}
              onChange={(event) => {
                setPreviewUrl(event.target.value);
                setUrlSource('manual');
              }}
              placeholder="https://example.pages.dev"
            />
          </div>

          <div className="previewDeploy__field">
            <span className="previewDeploy__label">デプロイ状態</span>
            <div className="previewDeploy__row">
              {DEPLOY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`previewDeploy__setBtn${deployStatus === option.value ? ' previewDeploy__setBtn--active' : ''}`}
                  onClick={() => setDeployStatus(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="previewDeploy__row">
            <button type="button" className="previewDeploy__setBtn" onClick={saveManualRecord}>
              保存する
            </button>
            <button type="button" className="previewDeploy__resetBtn" onClick={reset}>
              リセット
            </button>
          </div>
        </div>
      </div>

      <p className="previewDeploy__hint">危険なURLは保存せず、Preview URLが取れない場合は手動入力へフォールバックします。</p>
    </section>
  );
}
