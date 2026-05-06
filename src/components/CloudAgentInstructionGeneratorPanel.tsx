import { useState } from 'react';
import { Check, Copy, List } from 'lucide-react';
import { APP_BLUEPRINT_TEMPLATES } from '../utils/appBlueprintTemplates';
import { generatePhasePlan, formatPhasePlanMarkdown } from '../utils/phasePlanGenerator';

type CopyState = 'idle' | 'copied' | 'failed';

export function CloudAgentInstructionGeneratorPanel() {
  const [appName, setAppName] = useState('');
  const [templateId, setTemplateId] = useState('simple-utility');
  const [copyState, setCopyState] = useState<CopyState>('idle');

  const template = APP_BLUEPRINT_TEMPLATES.find((t) => t.id === templateId) ?? APP_BLUEPRINT_TEMPLATES[0];
  const plan = generatePhasePlan(appName || 'MyApp', template);

  const allInstructions = plan.phases
    .map((phase) => {
      return [
        `# Cloud Agent 指示書: ${appName || 'MyApp'} / ${phase.title}`,
        '',
        `## タスク`,
        phase.purpose,
        '',
        `## 実装内容`,
        ...phase.tasks.map((t) => `- ${t}`),
        '',
        `## 完了条件`,
        ...phase.doneConditions.map((d) => `- ${d}`),
        '',
        phase.manualGates.length > 0
          ? `## ⚠️ Manual Gate\n${phase.manualGates.map((g) => `- ${g}`).join('\n')}`
          : '',
        `## 禁止事項`,
        `- App Store / Google Play への本番操作を自動実行しない`,
        `- secret / token / API key を保存しない`,
        `- GitHub Issueを自動作成しない（下書きコピーのみ）`,
      ].join('\n');
    })
    .join('\n\n---\n\n');

  const prTemplate = [
    `## 概要`,
    `${appName || 'MyApp'} の機能を追加しました。`,
    '',
    `## 安全方針`,
    `- 外部APIは呼びません`,
    `- secret / token / API key は保存しません`,
    `- GitHub / App Store / deploy の本番操作は自動実行しません`,
    `- manual gateが必要な操作は候補表示とコピーだけにします`,
    '',
    `## 確認ポイント`,
    `- npm run typecheck`,
    `- npm run build`,
    `- スマホ幅表示`,
    `- コピー機能`,
  ].join('\n');

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 2400);
    }
  }

  return (
    <div className="phase17Panel">
      <div className="phase17Hero">
        <List />
        <div>
          <p className="eyebrow">Phase 17.4</p>
          <h3>Cloud Agent 指示書ジェネレーター</h3>
          <p>PhaseごとのCloud Agent指示書を生成します。GitHub Issue自動作成はしません。</p>
        </div>
      </div>

      <div className="phaseSafetyBox">
        <strong>外部API連携なし・本番操作なし</strong>
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

      <div>
        <strong style={{ fontSize: '0.88rem', color: '#35513d', display: 'block', marginBottom: '8px' }}>Phase計画</strong>
        <div className="phaseCodeBox">{formatPhasePlanMarkdown(plan)}</div>
      </div>

      <div>
        <strong style={{ fontSize: '0.88rem', color: '#35513d', display: 'block', marginBottom: '8px' }}>Cloud Agent 指示書（全Phase）</strong>
        <div className="phaseCodeBox">{allInstructions}</div>
      </div>

      <div>
        <strong style={{ fontSize: '0.88rem', color: '#35513d', display: 'block', marginBottom: '8px' }}>PR本文テンプレート</strong>
        <div className="phaseCodeBox">{prTemplate}</div>
      </div>

      <div className="phaseControls">
        <button type="button" className={`phaseCopyBtn copy-${copyState}`} onClick={() => handleCopy(allInstructions)}>
          {copyState === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyState === 'copied' ? 'コピー済み' : '全指示書コピー'}
        </button>
        <button type="button" className={`phaseCopyBtn copy-idle`} onClick={() => handleCopy(prTemplate)}>
          <Copy size={16} /> PR本文コピー
        </button>
      </div>
    </div>
  );
}
