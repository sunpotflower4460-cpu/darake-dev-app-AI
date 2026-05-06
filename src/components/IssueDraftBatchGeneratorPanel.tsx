import { useState } from 'react';
import { Check, Copy, FileStack } from 'lucide-react';
import { APP_BLUEPRINT_TEMPLATES } from '../utils/appBlueprintTemplates';
import { generatePhasePlan } from '../utils/phasePlanGenerator';
import {
  generateIssueDraftBatch,
  formatIssueDraftBatchAllMarkdown,
} from '../utils/issueDraftBatchGenerator';

export function IssueDraftBatchGeneratorPanel() {
  const [appName, setAppName] = useState('');
  const [templateId, setTemplateId] = useState('simple-utility');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const template = APP_BLUEPRINT_TEMPLATES.find((t) => t.id === templateId) ?? APP_BLUEPRINT_TEMPLATES[0];
  const plan = generatePhasePlan(appName || 'MyApp', template);
  const batch = generateIssueDraftBatch(appName || 'MyApp', plan);

  async function handleCopyAll() {
    try {
      await navigator.clipboard.writeText(formatIssueDraftBatchAllMarkdown(batch));
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // ignore
    }
  }

  async function handleCopyOne(index: number, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div className="phase17Panel">
      <div className="phase17Hero">
        <FileStack />
        <div>
          <p className="eyebrow">Phase 17.5</p>
          <h3>Issue下書き 一括生成</h3>
          <p>PhaseごとのGitHub Issue下書きをまとめて生成します。自動作成はしません。コピーのみ。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>⚠️ GitHub Issue自動作成なし</strong>
        <p>コピーして手動で作成してください。</p>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>入力</legend>
          <label>アプリ名<input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="例: ねこ電卓" /></label>
          <label>
            テンプレート
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              {APP_BLUEPRINT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </label>
        </fieldset>
      </div>

      <div className="phasePlanList">
        {batch.issues.map((issue, i) => (
          <div key={issue.phaseId} className="phasePlanItem">
            <div className="phasePlanItemTitle">{issue.title}</div>
            <div className="phasePlanItemBody">
              <div className="phaseCodeBox" style={{ maxHeight: '120px', fontSize: '0.78rem' }}>{issue.body}</div>
            </div>
            <button
              type="button"
              style={{ fontSize: '0.82rem', padding: '4px 10px', borderRadius: '999px', border: '1px solid rgba(76,124,85,0.3)', background: 'transparent', cursor: 'pointer', color: '#35513d', marginTop: '6px', display: 'inline-flex', gap: '4px', alignItems: 'center' }}
              onClick={() => handleCopyOne(i, `${issue.title}\n\n${issue.body}`)}
            >
              {copiedIndex === i ? <Check size={12} /> : <Copy size={12} />}
              {copiedIndex === i ? 'コピー済み' : 'このIssueをコピー'}
            </button>
          </div>
        ))}
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copiedAll ? 'copied' : 'idle'}`} onClick={handleCopyAll}>
          {copiedAll ? <Check size={16} /> : <Copy size={16} />}
          {copiedAll ? 'コピー済み' : '全Issue一括コピー'}
        </button>
      </div>
    </div>
  );
}
