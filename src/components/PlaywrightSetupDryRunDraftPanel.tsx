import { useMemo, useState } from 'react';
import { Check, Copy, MonitorCog, RefreshCcw } from 'lucide-react';
import { loadDryRunArtifactCheckRecord } from '../utils/dryRunArtifactCheckRecord';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import { buildPlaywrightSetupDryRunDraft, formatPlaywrightSetupDryRunDraft } from '../utils/playwrightSetupDryRunDraft';
import { buildScreenshotCaptureGate } from '../utils/screenshotCaptureGate';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import { buildScreenshotPlanExport } from '../utils/screenshotPlanExport';
import { buildScreenshotRunGate } from '../utils/screenshotRunGate';

export function PlaywrightSetupDryRunDraftPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [yamlCopyState, setYamlCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const draft = useMemo(() => {
    const artifactRecord = loadDryRunArtifactCheckRecord();
    const previewRecord = loadPreviewUrlRecord();
    const screenshotDraft = buildScreenshotJobDraft(previewRecord);
    const plan = buildScreenshotPlanExport(screenshotDraft);
    const runGate = buildScreenshotRunGate(plan);
    const captureGate = buildScreenshotCaptureGate(artifactRecord, plan, runGate);

    return buildPlaywrightSetupDryRunDraft(captureGate);
  }, [reloadKey]);

  const formattedDraft = useMemo(() => formatPlaywrightSetupDryRunDraft(draft), [draft]);
  const lowCount = draft.jobs.filter((job) => job.risk === 'low').length;
  const mediumCount = draft.jobs.filter((job) => job.risk === 'medium').length;

  function handleReload() {
    setReloadKey((current) => current + 1);
    setCopyState('idle');
    setYamlCopyState('idle');
  }

  async function copyText(value: string, setState: (state: 'idle' | 'copied' | 'failed') => void) {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
      window.setTimeout(() => setState('idle'), 1800);
    } catch {
      setState('failed');
      window.setTimeout(() => setState('idle'), 2400);
    }
  }

  return (
    <div className="playwrightSetupPanel">
      <div className={`playwrightSetupHero playwright-setup-${draft.status}`}>
        <MonitorCog />
        <div>
          <p className="eyebrow">Phase 10.18</p>
          <h3>Playwright Setup Dry-run Draft</h3>
          <p>{draft.message}</p>
        </div>
      </div>

      <div className="playwrightSetupSafetyBox">
        <strong>まだブラウザを起動しません</strong>
        <p>この段階ではPlaywright/Chromium環境確認workflowの設計下書きだけです。URLアクセス・スクショ撮影・workflow実ファイル追加は行いません。</p>
      </div>

      <div className="playwrightSetupControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 下書きを再生成
        </button>
        <button type="button" className={`playwrightSetupCopyButton copy-${copyState}`} onClick={() => copyText(formattedDraft, setCopyState)}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && '全体をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '全体をコピー'}
        </button>
        <button type="button" className={`playwrightSetupCopyButton copy-${yamlCopyState}`} onClick={() => copyText(draft.yamlSketch, setYamlCopyState)}>
          {yamlCopyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {yamlCopyState === 'copied' && 'YAMLスケッチをコピーしました'}
          {yamlCopyState === 'failed' && 'コピーできませんでした'}
          {yamlCopyState === 'idle' && 'YAMLスケッチだけコピー'}
        </button>
        <span>{draft.status}</span>
      </div>

      <div className="playwrightSetupSummaryGrid">
        <section>
          <h4>Workflow</h4>
          <p>{draft.proposedWorkflowFileName}</p>
        </section>
        <section>
          <h4>Jobs</h4>
          <p>{draft.jobs.length}</p>
        </section>
        <section>
          <h4>Low</h4>
          <p>{lowCount}</p>
        </section>
        <section>
          <h4>Medium</h4>
          <p>{mediumCount}</p>
        </section>
      </div>

      <div className="playwrightSetupGrid">
        <section>
          <h4>Inputs</h4>
          {draft.inputs.map((input) => <span key={input.name}>{input.name}{input.defaultValue ? `=${input.defaultValue}` : ''}</span>)}
        </section>
        <section>
          <h4>Artifacts</h4>
          {draft.artifacts.map((artifact) => <span key={artifact.name}>{artifact.name}: {artifact.path}</span>)}
        </section>
        <section>
          <h4>Success Conditions</h4>
          {draft.successConditions.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Hard Stops</h4>
          {draft.hardStops.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>

      <div className="playwrightSetupJobsBox">
        <div>
          <strong>Setup Jobs Draft</strong>
          <span>{draft.jobs.length} steps</span>
        </div>
        <div className="playwrightSetupJobsList">
          {draft.jobs.map((job) => (
            <article className={`playwrightSetupJob setup-risk-${job.risk}`} key={job.id}>
              <div>
                <strong>{job.title}</strong>
                <span>{job.risk}</span>
              </div>
              <p>{job.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="playwrightSetupYamlBox">
        <div>
          <strong>YAML Sketch</strong>
          <span>draft only</span>
        </div>
        <pre>{draft.yamlSketch}</pre>
      </div>

      <div className="playwrightSetupNotesBox">
        <div>
          <strong>Safety Notes</strong>
          <span>no browser launch</span>
        </div>
        <div>
          {draft.safetyNotes.map((note) => <span key={note}>{note}</span>)}
        </div>
      </div>
    </div>
  );
}
