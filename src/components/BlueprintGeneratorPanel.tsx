import { useMemo, useState } from 'react';
import { Check, Copy, Factory } from 'lucide-react';
import { APP_BLUEPRINT_TEMPLATES } from '../utils/appBlueprintTemplates';
import { generatePhasePlan, formatPhasePlanMarkdown } from '../utils/phasePlanGenerator';
import {
  generateAllCloudAgentInstructions,
} from '../utils/cloudAgentInstructionGenerator';
import { generateIssueDraftBatch, formatIssueDraftBatchAllMarkdown } from '../utils/issueDraftBatchGenerator';
import {
  loadSavedBlueprints,
  saveSavedBlueprints,
  addSavedBlueprint,
} from '../utils/savedBlueprints';

type CopyTarget = 'brief' | 'phases' | 'agent' | 'issues' | null;

export function BlueprintGeneratorPanel() {
  const [appName, setAppName] = useState('');
  const [soul, setSoul] = useState('');
  const [platform, setPlatform] = useState('ios');
  const [templateId, setTemplateId] = useState('simple-utility');
  const [complexity, setComplexity] = useState('medium');
  const [copyTarget, setCopyTarget] = useState<CopyTarget>(null);
  const [saveMsg, setSaveMsg] = useState('');

  const template = APP_BLUEPRINT_TEMPLATES.find((t) => t.id === templateId) ?? APP_BLUEPRINT_TEMPLATES[0];

  const plan = useMemo(() => generatePhasePlan(appName || 'MyApp', template), [appName, template]);
  const instructions = useMemo(() => generateAllCloudAgentInstructions(appName || 'MyApp', plan.phases), [appName, plan]);
  const issueBatch = useMemo(() => generateIssueDraftBatch(appName || 'MyApp', plan), [appName, plan]);

  const productBrief = [
    `# ${appName || 'MyApp'} 設計書`,
    '',
    `- **テンプレ**: ${template.label}`,
    `- **コンセプト/ソウル**: ${soul || '（未入力）'}`,
    `- **プラットフォーム**: ${platform}`,
    `- **複雑度**: ${complexity}`,
    '',
    '## MVP',
    ...template.mvpChecklist.map((m) => `- [ ] ${m}`),
    '',
    '## やらないこと',
    ...template.doNotBuild.map((d) => `- ${d}`),
    '',
    '## リスク',
    ...template.riskNotes.map((r) => `- ${r}`),
    '',
    '## ストア戦略ヒント',
    ...template.storePositioningHints.map((h) => `- ${h}`),
    '',
    '## Safety Note',
    '- App Store / Google Play への自動操作はしません',
    '- secret / token は保存しません',
  ].join('\n');

  async function handleCopy(text: string, target: CopyTarget) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyTarget(target);
      window.setTimeout(() => setCopyTarget(null), 1800);
    } catch {
      // ignore
    }
  }

  function handleSave() {
    const blueprints = loadSavedBlueprints();
    const newBlueprint = {
      id: `blueprint-${Date.now()}`,
      appName: appName || 'MyApp',
      templateId: template.id,
      templateLabel: template.label,
      soul,
      platform,
      complexity,
      plan,
      createdAt: new Date().toISOString(),
    };
    saveSavedBlueprints(addSavedBlueprint(blueprints, newBlueprint));
    setSaveMsg('保存しました');
    window.setTimeout(() => setSaveMsg(''), 2000);
  }

  return (
    <div className="phase17Panel">
      <div className="phase17Hero">
        <Factory />
        <div>
          <p className="eyebrow">Phase 17.2</p>
          <h3>設計書ジェネレーター / Blueprint Generator</h3>
          <p>アプリの種から設計書・Phase計画・Cloud Agent指示書・Issue下書きを生成します。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし・GitHub Issue自動作成なし</strong>
      </div>

      <div className="phaseForm">
        <fieldset>
          <legend>基本情報</legend>
          <label>アプリ名<input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="例: ねこ電卓" /></label>
          <label>コンセプト / ソウル<textarea rows={3} value={soul} onChange={(e) => setSoul(e.target.value)} placeholder="例: 眠そうなねこが計算してくれる。癒し系。" /></label>
          <label>
            プラットフォーム
            <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
              <option value="web">Web</option>
              <option value="desktop">Desktop</option>
            </select>
          </label>
          <label>
            複雑度
            <select value={complexity} onChange={(e) => setComplexity(e.target.value)}>
              <option value="simple">シンプル</option>
              <option value="medium">中程度</option>
              <option value="complex">複雑</option>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>テンプレートを選ぶ</legend>
          <div className="templateSelector">
            {APP_BLUEPRINT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`templateSelectorBtn ${templateId === t.id ? 'active' : ''}`}
                onClick={() => setTemplateId(t.id)}
              >
                <span className="templateSelectorBtnLabel">{t.label}</span>
                <span className="templateSelectorBtnSub">{t.suitableFor.slice(0, 2).join(' / ')}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <strong style={{ fontSize: '0.88rem', color: '#35513d', display: 'block', marginBottom: '8px' }}>プロダクト概要</strong>
        <div className="phaseCodeBox">{productBrief}</div>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyTarget === 'brief' ? 'copied' : 'idle'}`} onClick={() => handleCopy(productBrief, 'brief')}>
          {copyTarget === 'brief' ? <Check size={16} /> : <Copy size={16} />}
          概要コピー
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyTarget === 'phases' ? 'copied' : 'idle'}`} onClick={() => handleCopy(formatPhasePlanMarkdown(plan), 'phases')}>
          {copyTarget === 'phases' ? <Check size={16} /> : <Copy size={16} />}
          Phase計画コピー
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyTarget === 'agent' ? 'copied' : 'idle'}`} onClick={() => handleCopy(instructions.map((i) => i.instruction).join('\n\n---\n\n'), 'agent')}>
          {copyTarget === 'agent' ? <Check size={16} /> : <Copy size={16} />}
          Agent指示書コピー
        </button>
        <button type="button" className={`phaseCopyBtn copy-${copyTarget === 'issues' ? 'copied' : 'idle'}`} onClick={() => handleCopy(formatIssueDraftBatchAllMarkdown(issueBatch), 'issues')}>
          {copyTarget === 'issues' ? <Check size={16} /> : <Copy size={16} />}
          Issue下書き一括コピー
        </button>
        <button type="button" onClick={handleSave} className={saveMsg ? 'phaseSavedBtn' : ''}>
          {saveMsg ? <Check size={16} /> : null}
          {saveMsg || '設計書を保存'}
        </button>
      </div>
    </div>
  );
}
