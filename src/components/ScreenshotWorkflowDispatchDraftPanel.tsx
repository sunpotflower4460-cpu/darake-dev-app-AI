import { useMemo, useState } from 'react';
import { Check, Copy, FileCode2, RefreshCcw } from 'lucide-react';
import { loadPreviewUrlRecord } from '../utils/previewUrlStore';
import { buildScreenshotJobDraft } from '../utils/screenshotJobDraft';
import { buildScreenshotPlanExport } from '../utils/screenshotPlanExport';
import { buildScreenshotRunGate } from '../utils/screenshotRunGate';
import {
  buildScreenshotWorkflowDispatchDraft,
  formatScreenshotWorkflowDispatchDraft,
} from '../utils/screenshotWorkflowDispatchDraft';

export function ScreenshotWorkflowDispatchDraftPanel() {
  const [reloadKey, setReloadKey] = useState(0);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [yamlCopyState, setYamlCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [cliCopyState, setCliCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const draft = useMemo(() => {
    const previewRecord = loadPreviewUrlRecord();
    const screenshotDraft = buildScreenshotJobDraft(previewRecord);
    const plan = buildScreenshotPlanExport(screenshotDraft);
    const gate = buildScreenshotRunGate(plan);
    return buildScreenshotWorkflowDispatchDraft(plan, gate);
  }, [reloadKey]);

  const formattedDraft = useMemo(() => formatScreenshotWorkflowDispatchDraft(draft), [draft]);

  function handleReload() {
    setReloadKey((current) => current + 1);
    setCopyState('idle');
    setYamlCopyState('idle');
    setCliCopyState('idle');
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
    <div className="screenshotWorkflowDispatchPanel">
      <div className={`screenshotWorkflowHero dispatch-${draft.status}`}>
        <FileCode2 />
        <div>
          <p className="eyebrow">Phase 10.11</p>
          <h3>Workflow Dispatch Draft</h3>
          <p>{draft.message}</p>
        </div>
      </div>

      <div className="screenshotWorkflowSafetyBox">
        <strong>まだ実行しません</strong>
        <p>この段階では、GitHub Actionsへ渡すYAMLとCLI入力の下書きだけを作ります。workflowの作成・dispatch・スクショ撮影はまだ行いません。</p>
      </div>

      <div className="screenshotWorkflowControls">
        <button type="button" onClick={handleReload}>
          <RefreshCcw size={16} /> 下書きを再生成
        </button>
        <button type="button" className={`screenshotWorkflowCopyButton copy-${copyState}`} onClick={() => copyText(formattedDraft, setCopyState)}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' && '全体をコピーしました'}
          {copyState === 'failed' && 'コピーできませんでした'}
          {copyState === 'idle' && '全体をコピー'}
        </button>
        <button type="button" className={`screenshotWorkflowCopyButton copy-${yamlCopyState}`} onClick={() => copyText(draft.yamlDraft, setYamlCopyState)}>
          {yamlCopyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {yamlCopyState === 'copied' && 'YAMLをコピーしました'}
          {yamlCopyState === 'failed' && 'コピーできませんでした'}
          {yamlCopyState === 'idle' && 'YAMLだけコピー'}
        </button>
        <button type="button" className={`screenshotWorkflowCopyButton copy-${cliCopyState}`} onClick={() => copyText(draft.cliDraft, setCliCopyState)}>
          {cliCopyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {cliCopyState === 'copied' && 'CLIをコピーしました'}
          {cliCopyState === 'failed' && 'コピーできませんでした'}
          {cliCopyState === 'idle' && 'CLIだけコピー'}
        </button>
        <span>{draft.status}</span>
      </div>

      <div className="screenshotWorkflowSummaryGrid">
        <section>
          <h4>Workflow</h4>
          <p>{draft.workflowFileName}</p>
        </section>
        <section>
          <h4>dryRun</h4>
          <p>{draft.inputs.dryRun}</p>
        </section>
        <section>
          <h4>manualGate</h4>
          <p>{draft.inputs.requireManualGate}</p>
        </section>
        <section>
          <h4>Status</h4>
          <p>{draft.status}</p>
        </section>
      </div>

      <div className="screenshotWorkflowCodeGrid">
        <section>
          <div>
            <strong>YAML Draft</strong>
            <span>dry-run only</span>
          </div>
          <pre>{draft.yamlDraft}</pre>
        </section>
        <section>
          <div>
            <strong>GH CLI Draft</strong>
            <span>manual</span>
          </div>
          <pre>{draft.cliDraft}</pre>
        </section>
      </div>

      <div className="screenshotWorkflowNotesBox">
        <div>
          <strong>Safety Notes</strong>
          <span>no execution</span>
        </div>
        <ul>
          {draft.safetyNotes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      </div>
    </div>
  );
}
