import { useState } from 'react';
import '../agentInstructionFormat.css';
import {
  agentTargetLabel,
  buildAgentInstructionFormat,
  type AgentTarget,
} from '../utils/agentInstructionFormat';
import { loadGentleAppStartForm } from '../utils/gentleAppStartForm';

const TARGETS: AgentTarget[] = ['cloud-agent', 'codex', 'copilot', 'generic'];

export function AgentInstructionFormatPanel() {
  const form = loadGentleAppStartForm();
  const [target, setTarget] = useState<AgentTarget>('cloud-agent');
  const [appName, setAppName] = useState(form?.appName?.trim() || '');
  const [phaseTitle, setPhaseTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [scope, setScope] = useState('');
  const [doneConditions, setDoneConditions] = useState('');
  const [result, setResult] = useState<ReturnType<typeof buildAgentInstructionFormat> | null>(null);
  const [copied, setCopied] = useState(false);

  function generate() {
    const inst = buildAgentInstructionFormat({
      target,
      appName: appName || '新しいアプリ',
      phaseTitle: phaseTitle || 'Phase実装',
      purpose: purpose || 'アプリを一段階進める',
      scope: scope || 'このPhaseのタスクを実装する',
      doneConditions: doneConditions
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    });
    setResult(inst);
  }

  function copyBody() {
    if (!result) return;
    const text = `PR: ${result.prTitle}\n\n${result.prBody}`;
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <section className="agentInstFmt" aria-label="AI指示フォーマット">
      <span className="agentInstFmt__eyebrow">Phase 94 · AI作業指示フォーマット</span>
      <h2 className="agentInstFmt__title">AIへの渡し方を統一する</h2>

      <div className="agentInstFmt__form">
        <div className="agentInstFmt__field">
          <span className="agentInstFmt__label">渡すAI</span>
          <div className="agentInstFmt__targetRow">
            {TARGETS.map((t) => (
              <button
                key={t}
                type="button"
                className={`agentInstFmt__targetBtn${target === t ? ' agentInstFmt__targetBtn--active' : ''}`}
                onClick={() => setTarget(t)}
              >
                {agentTargetLabel(t)}
              </button>
            ))}
          </div>
        </div>

        <div className="agentInstFmt__field">
          <label className="agentInstFmt__label" htmlFor="aif-appname">アプリ名</label>
          <input
            id="aif-appname"
            className="agentInstFmt__input"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="宝地図アプリ"
          />
        </div>

        <div className="agentInstFmt__field">
          <label className="agentInstFmt__label" htmlFor="aif-phase">Phaseタイトル</label>
          <input
            id="aif-phase"
            className="agentInstFmt__input"
            value={phaseTitle}
            onChange={(e) => setPhaseTitle(e.target.value)}
            placeholder="Phase 91: 設定状態診断"
          />
        </div>

        <div className="agentInstFmt__field">
          <label className="agentInstFmt__label" htmlFor="aif-purpose">目的（1〜2行）</label>
          <textarea
            id="aif-purpose"
            className="agentInstFmt__textarea"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="設定状態を診断して、足りない設定だけを教えるパネルを追加する"
            rows={2}
          />
        </div>

        <div className="agentInstFmt__field">
          <label className="agentInstFmt__label" htmlFor="aif-scope">作業範囲</label>
          <textarea
            id="aif-scope"
            className="agentInstFmt__textarea"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="src/utils/ と src/components/ のみ"
            rows={2}
          />
        </div>

        <div className="agentInstFmt__field">
          <label className="agentInstFmt__label" htmlFor="aif-done">完了条件（1行1つ）</label>
          <textarea
            id="aif-done"
            className="agentInstFmt__textarea"
            value={doneConditions}
            onChange={(e) => setDoneConditions(e.target.value)}
            placeholder={'typecheck が通る\nbuild が通る\nスマホ幅で崩れない'}
            rows={3}
          />
        </div>

        <button type="button" className="agentInstFmt__generate" onClick={generate}>
          指示書を生成する
        </button>
      </div>

      {result ? (
        <div className="agentInstFmt__result">
          <div className="agentInstFmt__prTitle">{result.prTitle}</div>
          <span className="agentInstFmt__bodyLabel">PR本文 / 指示書</span>
          <pre className="agentInstFmt__body">{result.prBody}</pre>
          <div className="agentInstFmt__actions">
            <button type="button" className="agentInstFmt__copy" onClick={copyBody}>
              {copied ? 'コピーしました' : '全文コピー'}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
