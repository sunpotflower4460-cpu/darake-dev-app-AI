import { useMemo, useState } from 'react';
import { Check, Copy, FileCode2, RefreshCcw } from 'lucide-react';
import { loadDryRunArtifactCheckRecord } from '../utils/dryRunArtifactCheckRecord';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotCaptureGate } from '../utils/screenshotCaptureGate';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import { buildScreenshotPlanExport } from '../utils/screenshotPlanExport';
import { buildScreenshotRunGate } from '../utils/screenshotRunGate';
import {
  buildRealCaptureWorkflowDraft,
  formatRealCaptureWorkflowDraft,
} from '../utils/screenshotRealCaptureWorkflowDraft';

export function RealCaptureWorkflowDraftPanel() {
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

    return buildRealCaptureWorkflowDraft(captureGate, plan);
  }, [reloadKey]);

  const formattedDraft = useMemo(() => formatRealCaptureWorkflowDraft(draft), [draft]);
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
    <div className="realCaptureWorkflowPanel">
      <div className={`realCaptureWorkflowHero real-capture-${draft.status}`}>
        <FileCode2 />
        <div>
          <p className="eyebrow">Phase 10.17</p>
          <h3>Real Capture Workflow Draft</h3>
          <p>{draft.message}</p>
        </div>
      </div>

      <div className="realCaptureWorkflowSafetyBox">
        <strong>まだ実撮影しません</strong>
        <p>この段階では、Playwright実撮影workflowの設計下書きだけを表示します。workflow実ファイル追加・dispatch・ブラウザ起動・スクショ撮影は行いません。</p>
      </div>

      <div className="realCaptureWorkflowControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 下書きを再生成
        </button>
        <button type="button" className={`realCaptureWorkflowCopyButton copy-${copyState}`} onClick={() => copyText(formattedDraft, setCopyState)}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && '全体をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '全体をコピー'}
        </button>
        <button type="button" className={`realCaptureWorkflowCopyButton copy-${yamlCopyState}`} onClick={() => copyText(draft.yamlSketch, setYamlCopyState)}>
          {yamlCopyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {yamlCopyState === 'copied' && 'YAMLスケッチをコピーしました'}
          {yamlCopyState === 'failed' && 'コピーできませんでした'}
          {yamlCopyState === 'idle' && 'YAMLスケッチだけコピー'}
        </button>
        <span>{draft.status}</span>
      </div>

      <div className="realCaptureWorkflowSummaryGrid">
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

      <div className="realCaptureWorkflowGrid">
        <section>
          <h4>Inputs</h4>
          {draft.inputs.map((input) => <span key={input.name}>{input.name}{input.defaultValue ? `=${input.defaultValue}` : ''}</span>)}
        </section>
        <section>
          <h4>Artifacts</h4>
          {draft.artifacts.map((artifact) => <span key={artifact.name}>{artifact.name}: {artifact.path}</span>)}
        </section>
        <section>
          <h4>Hard Stops</h4>
          {draft.hardStops.map((item) => <span key={item}>{item}</span>)}
        </section>
        <section>
          <h4>Manual Gate</h4>
          {draft.manualGateRequirements.map((item) => <span key={item}>{item}</span>)}
        </section>
      </div>

      <div className="realCaptureWorkflowJobsBox">
        <div>
          <strong>Workflow Jobs Draft</strong>
          <span>{draft.jobs.length} steps</span>
        </div>
        <div className="realCaptureWorkflowJobsList">
          {draft.jobs.map((job) => (
            <article className={`realCaptureWorkflowJob risk-${job.risk}`} key={job.id}>
              <div>
                <strong>{job.title}</strong>
                <span>{job.risk}</span>
              </div>
              <p>{job.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="realCaptureWorkflowYamlBox">
        <div>
          <strong>YAML Sketch</strong>
          <span>draft only</span>
        </div>
        <pre>{draft.yamlSketch}</pre>
      </div>

      <div className="realCaptureWorkflowNotesBox">
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
