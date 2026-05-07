import { loadGentleAppStartForm } from './gentleAppStartForm';
import { loadGitHubIssueRecord } from './githubIssueRecord';
import { loadOmakaseStartState } from './omakaseStartState';
import { buildGentleFormToBlueprintBridge } from './gentleFormToBlueprintBridge';

export type DarakeNowPhase =
  | 'not-started'
  | 'form-filled'
  | 'template-selected'
  | 'issue-created'
  | 'cloud-agent-ready'
  | 'cloud-agent-working';

export type DarakeNowStep = {
  label: string;
  done: boolean;
  inProgress?: boolean;
};

export type DarakeNowState = {
  phase: DarakeNowPhase;
  steps: DarakeNowStep[];
  nextActionLabel: string;
  nextActionDetail: string;
  isAllDone: boolean;
};

export function computeDarakeNowState(): DarakeNowState {
  const form = loadGentleAppStartForm();
  const bridge = form ? buildGentleFormToBlueprintBridge(form) : null;
  const issueRecord = loadGitHubIssueRecord();
  const omakase = loadOmakaseStartState();

  const formFilled = !!(form?.appName && form?.oneLineIdea);
  const templateSelected = formFilled && form?.uiTemplate !== 'not-sure';
  const issueCreated = !!(
    issueRecord ||
    omakase?.issueUrl ||
    omakase?.status === 'issue-created' ||
    omakase?.status === 'cloud-agent-ready'
  );
  const cloudAgentReady = issueCreated && !!(
    omakase?.cloudAgentInstruction ||
    omakase?.status === 'cloud-agent-ready'
  );
  const cloudAgentWorking = cloudAgentReady;

  const steps: DarakeNowStep[] = [
    { label: 'アプリ内容を入力しました', done: formFilled },
    { label: '見た目を選びました', done: templateSelected },
    { label: 'Issueを作成', done: issueCreated, inProgress: omakase?.status === 'preparing' },
    { label: 'Cloud Agentに貼る', done: cloudAgentReady },
  ];

  let phase: DarakeNowPhase = 'not-started';
  let nextActionLabel = '「この内容で作り始める」を押してください。';
  let nextActionDetail = 'フォームに入力したら、ボタンを押すだけです。';
  let isAllDone = false;

  if (!formFilled) {
    phase = 'not-started';
    nextActionLabel = 'フォームに入力してください。';
    nextActionDetail = 'アプリ名とどんなアプリかを入れてください。';
  } else if (!issueCreated) {
    phase = templateSelected ? 'template-selected' : 'form-filled';
    nextActionLabel = '「この内容で作り始める」を押してください。';
    nextActionDetail = bridge?.warnings?.length
      ? `確認点: ${bridge.warnings.join('、')}`
      : 'Issueを作成してCloud Agent指示を準備します。';
  } else if (!cloudAgentReady) {
    phase = 'issue-created';
    nextActionLabel = 'Cloud Agentに貼る指示をコピーしてください。';
    nextActionDetail = 'Cloud Agentのチャットに貼るだけです。';
  } else if (cloudAgentWorking) {
    phase = 'cloud-agent-working';
    nextActionLabel = '何もしなくてOK';
    nextActionDetail = 'Cloud Agentが作業中です。失敗した時だけ通知されます。';
    isAllDone = true;
  }

  return { phase, steps, nextActionLabel, nextActionDetail, isAllDone };
}
