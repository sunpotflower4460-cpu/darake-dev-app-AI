import { useMemo, useState } from 'react';
import { Camera, Check, Copy, RefreshCcw } from 'lucide-react';
import { loadDryRunArtifactCheckRecord } from '../utils/dryRunArtifactCheckRecord';
import { loadPlaywrightSetupReportRecord } from '../utils/playwrightSetupReportRecord';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotCaptureGate } from '../utils/screenshotCaptureGate';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import { buildScreenshotPlanExport } from '../utils/screenshotPlanExport';
import { buildScreenshotRunGate } from '../utils/screenshotRunGate';
import {
  buildLimitedScreenshotCaptureWorkflowDraft,
  formatLimitedScreenshotCaptureWorkflowDraft,
} from '../utils/limitedScreenshotCaptureWorkflowDraft';

export function LimitedScreenshotCaptureWorkflowDraftPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [yamlCopyState, setYamlCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const draft = useMemo(() => {
    const artifactRecord = loadDryRunArtifactCheckRecord();
    const setupRecord = loadPlaywrightSetupReportRecord();
    const previewRecord = loadPreviewUrlRecord();
    const screenshotDraft = buildScreenshotJobDraft(previewRecord);
    const plan = buildScreenshotPlanExport(screenshotDraft);
    const runGate = buildScreenshotRunGate(plan);
    const captureGate = buildScreenshotCaptureGate(artifactRecord, plan, runGate);

    return buildLimitedScreenshotCaptureWorkflowDraft(captureGate, setupRecord, plan);
  }, [reloadKey]);

  const formattedDraft = useMemo(() => formatLimitedScreenshotCaptureWorkflowDraft(draft), [draft]);
  const lowCount = draft.jobs.filter((job) => job.risk === 'low').length;
  const mediumCount = draft.jobs.filter((job) => job.risk === 'medium').length;
  const highCount = draft.jobs.filter((job) => job.risk === 'high').length;

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
    <div className="limitedCaptureWorkflowPanel">
      <div className={`limitedCaptureWorkflowHero limited-capture-${draft.status}`}>
        <Camera />
        <div>
          <p className="eyebrow">Phase 10.22</p>
          <h3>Limited Screenshot Capture Workflow Draft</h3>
          <p>{draft.message}</p>
        </div>
      </div>

      <div className="limitedCaptureWorkflowSafetyBox">
        <strong>まだ実撮影しません</strong>
        <p>この段階では、1〜2件だけ安全に撮るためのworkflow設計下書きです。workflow実ファイル追加・URLアクセス・スクショ撮影は行いません。</p>
      </div>

      <div className="limitedCaptureWorkflowControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 下書きを再生成
        </button>
        <button type="button" className={`limitedCaptureWorkflowCopyButton copy-${copyState}`} onClick={() => copyText(formattedDraft, setCopyState)}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && '全体をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '全体をコピー'}
        </button>
        <button type="button" className={`limitedCaptureWorkflowCopyButton copy-${yamlCopyState}`} onClick={() => copyText(draft.yamlSketch, setYamlCopyState)}>
          {yamlCopyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {yamlCopyState === 'copied' && 'YAMLスケッチをコピーしました'}
          {yamlCopyState === 'failed' && 'コピーできませんでした'}
          {yamlCopyState === 'idle' && 'YAMLスケッチだけコピー'}
        </button>
        <span>{draft.status}</span>
      </div>

      <div className="limitedCaptureWorkflowSummaryGrid">
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
        <section>
          <h4>High</h4>
          <p>{highCount}</p>
        </section>
      </div>

      <div className="limitedCaptureWorkflowGrid">
        <section>
          <h4>Inputs</h4>
          {draft.inputs.map((input) => <span key={input.name}>{input.name}{input.defaultValue ? `=${input.defaultValue}` : ''}</span>)}
        </section>
        <section>
          <h4>Artifacts</h4>
          {draft.artifacts.map((artifact) => <span key={artifact.name}>{artifact.name}: {artifact.path}</span>)}
        </section>
        <section>
          <h4>Preflight</h4>
          {draft.preflightChecks.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Hard Stops</h4>
          {draft.hardStops.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Manifest Fields</h4>
          {draft.manifestFields.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>

      <div className="limitedCaptureWorkflowJobsBox">
        <div>
          <strong>Workflow Jobs Draft</strong>
          <span>{draft.jobs.length} steps</span>
        </div>
        <div className="limitedCaptureWorkflowJobsList">
          {draft.jobs.map((job) => (
            <article className={`limitedCaptureWorkflowJob risk-${job.risk}`} key={job.id}>
              <div>
                <strong>{job.title}</strong>
                <span>{job.risk}</span>
              </div>
              <p>{job.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="limitedCaptureWorkflowYamlBox">
        <div>
          <strong>YAML Sketch</strong>
          <span>draft only</span>
        </div>
        <pre>{draft.yamlSketch}</pre>
      </div>

      <div className="limitedCaptureWorkflowNotesBox">
        <div>
          <strong>Safety Notes</strong>
          <span>no capture</span>
        </div>
        <div>
          {draft.safetyNotes.map((note) => <span key={note}>{note}</span>)}
        </div>
      </div>
    </div>
  );
}
