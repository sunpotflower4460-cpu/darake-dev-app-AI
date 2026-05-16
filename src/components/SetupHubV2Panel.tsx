import { useEffect, useState } from 'react';
import '../setupHubV2.css';
import { DARAKE_SETUP_LINKS } from '../utils/darakeSetupLinks';
import { fetchSetupStatus } from '../utils/setupStatusClient';
import {
  buildSettingsDiagnosticReport,
  buildFallbackDiagnosticReport,
  type SettingsDiagnosticReport,
} from '../utils/settingsDiagnosticReport';

type StepId = 'cloudflare-key' | 'github-key' | 'github-register' | 'auto-setup' | 'recheck';

type Step = {
  id: StepId;
  num: number;
  label: string;
  note: string;
  openUrl?: string;
  copyName?: string;
};

const STEPS: Step[] = [
  {
    id: 'cloudflare-key',
    num: 1,
    label: 'Cloudflareの鍵を作る',
    note: 'Cloudflare API Token を発行します',
    openUrl: DARAKE_SETUP_LINKS.cloudflareApiTokens,
  },
  {
    id: 'github-key',
    num: 2,
    label: 'GitHubの鍵を作る',
    note: 'Fine-grained Personal Access Token を発行します',
    openUrl: DARAKE_SETUP_LINKS.githubFineGrainedTokens,
  },
  {
    id: 'github-register',
    num: 3,
    label: 'GitHubに登録する',
    note: 'WORKER_GITHUB_TOKEN という名前で登録します',
    openUrl: DARAKE_SETUP_LINKS.githubNewSecret,
    copyName: 'WORKER_GITHUB_TOKEN',
  },
  {
    id: 'auto-setup',
    num: 4,
    label: '自動設定を実行する',
    note: 'Cloudflare Setup Workflowを起動します',
    openUrl: DARAKE_SETUP_LINKS.cloudflareSetupWorkflow,
  },
  {
    id: 'recheck',
    num: 5,
    label: '設定したので再チェック',
    note: '「設定状態を確認する」パネルで確認します',
  },
];

const DONE_STEPS_STORAGE_KEY = 'darake.setupHubV2.doneSteps.v1';

function loadDoneSteps(): Set<StepId> {
  try {
    const raw = localStorage.getItem(DONE_STEPS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    const validIds = new Set<string>(STEPS.map((step) => step.id));
    return new Set(parsed.filter((value): value is StepId => typeof value === 'string' && validIds.has(value)));
  } catch {
    return new Set();
  }
}

function persistDoneSteps(done: Set<StepId>): void {
  try {
    localStorage.setItem(DONE_STEPS_STORAGE_KEY, JSON.stringify([...done]));
  } catch {
    // ignore
  }
}

function copyToClipboard(text: string, onCopied: () => void) {
  if (navigator.clipboard) {
    void navigator.clipboard.writeText(text).then(onCopied);
  }
}

export function SetupHubV2Panel() {
  const [done, setDone] = useState<Set<StepId>>(() => loadDoneSteps());
  const [copiedId, setCopiedId] = useState<StepId | null>(null);
  const [diagnostic, setDiagnostic] = useState<SettingsDiagnosticReport | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  useEffect(() => {
    setDiagLoading(true);
    fetchSetupStatus()
      .then((status) => setDiagnostic(buildSettingsDiagnosticReport(status)))
      .catch(() => setDiagnostic(buildFallbackDiagnosticReport()))
      .finally(() => setDiagLoading(false));
  }, []);

  function toggleDone(id: StepId) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      persistDoneSteps(next);
      return next;
    });
  }

  function resetDone() {
    const next = new Set<StepId>();
    persistDoneSteps(next);
    setDone(next);
  }

  function handleCopy(id: StepId, name: string) {
    copyToClipboard(name, () => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((v) => (v === id ? null : v)), 2000);
    });
  }

  const allDone = done.size >= STEPS.length;

  const diagItemMap = diagnostic
    ? new Map(diagnostic.items.map((i) => [i.id, i]))
    : null;
  const githubOk = diagItemMap?.get('github-token')?.level === 'ok';
  const issueOk = diagItemMap?.get('issue-create')?.level === 'ok';
  const kvOk = diagItemMap?.get('run-registry')?.level === 'ok';
  const optionalMissing = diagnostic ? diagnostic.optionalMissingCount > 0 : false;

  return (
    <section className="setupHubV2" aria-label="初期設定ここだけ v2">
      <div className="setupHubV2__header">
        <span className="setupHubV2__eyebrow">Phase 92 · 初期設定ここだけ</span>
        <h2 className="setupHubV2__title">上から押すだけで完了します</h2>
        <p className="setupHubV2__lead">読まずに押してコピーして進める画面です。</p>
      </div>

      <div className={`setupHubV2__diag setupHubV2__diag--${diagnostic?.overall ?? 'loading'}`}>
        {diagLoading ? (
          <span className="setupHubV2__diagLoading">設定を確認中…</span>
        ) : diagnostic ? (
          <>
            <div className="setupHubV2__diagRow">
              <span className={`setupHubV2__diagItem setupHubV2__diagItem--${githubOk ? 'ok' : 'ng'}`}>
                基本設定: {githubOk ? 'OK' : 'NG'}
              </span>
              <span className={`setupHubV2__diagItem setupHubV2__diagItem--${!optionalMissing ? 'ok' : 'optional'}`}>
                任意設定: {!optionalMissing ? 'OK' : 'あとでOK'}
              </span>
            </div>
            <div className="setupHubV2__diagRow">
              <span className={`setupHubV2__diagItem setupHubV2__diagItem--${issueOk ? 'ok' : 'ng'}`}>
                Issue作成: {issueOk ? 'OK' : 'NG'}
              </span>
              <span className={`setupHubV2__diagItem setupHubV2__diagItem--${kvOk ? 'ok' : 'ng'}`}>
                Cloudflare KV: {kvOk ? 'OK' : 'NG'}
              </span>
            </div>
            {diagnostic.overall !== 'not-ready' ? (
              <div className="setupHubV2__diagReady">✅ 始められます</div>
            ) : (
              <div className="setupHubV2__diagNotReady">⚠️ {diagnostic.footerMessage}</div>
            )}
          </>
        ) : null}
      </div>

      <ul className="setupHubV2__steps">
        {STEPS.map((step) => {
          const isDone = done.has(step.id);
          return (
            <li key={step.id} className={`setupHubV2__step${isDone ? ' setupHubV2__step--done' : ''}`}>
              <span className="setupHubV2__stepNum">{isDone ? '✓' : step.num}</span>
              <div className="setupHubV2__stepBody">
                <div className="setupHubV2__stepLabel">{step.label}</div>
                <div className="setupHubV2__stepNote">{step.note}</div>
              </div>
              <div className="setupHubV2__stepActions">
                {step.openUrl ? (
                  <a
                    href={step.openUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="setupHubV2__open"
                  >
                    開く
                  </a>
                ) : null}
                {step.copyName ? (
                  <>
                    <button
                      type="button"
                      className="setupHubV2__copy"
                      onClick={() => handleCopy(step.id, step.copyName!)}
                    >
                      コピー
                    </button>
                    {copiedId === step.id ? (
                      <span className="setupHubV2__copiedMsg">コピーしました</span>
                    ) : null}
                  </>
                ) : null}
                <button
                  type="button"
                  className={`setupHubV2__done${isDone ? ' setupHubV2__done--undo' : ''}`}
                  onClick={() => toggleDone(step.id)}
                >
                  {isDone ? '戻す' : '終わった'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <hr className="setupHubV2__divider" />

      <div className="setupHubV2__copySection">
        <span className="setupHubV2__copyLabel">GitHubに登録する名前（コピー用）</span>
        <div className="setupHubV2__copyList">
          {['WORKER_GITHUB_TOKEN', 'CLOUDFLARE_API_TOKEN'].map((name) => (
            <button
              key={name}
              type="button"
              className="setupHubV2__copyBtn"
              onClick={() => copyToClipboard(name, () => {})}
            >
              {name}
              <span className="setupHubV2__copyBtnTag">コピー</span>
            </button>
          ))}
        </div>
      </div>

      {allDone ? (
        <p className="setupHubV2__footer">
          全ステップ完了です。「設定状態を確認する」パネルで最終確認してください。
        </p>
      ) : (
        <p className="setupHubV2__footer">
          CloudflareにGITHUB_TOKENを直接入れなくてOKです。GitHubに <strong>WORKER_GITHUB_TOKEN</strong> として登録してから自動設定を実行します。
        </p>
      )}
      <button type="button" className="setupHubV2__done setupHubV2__done--undo" onClick={resetDone}>
        完了状態をリセット
      </button>
    </section>
  );
}
