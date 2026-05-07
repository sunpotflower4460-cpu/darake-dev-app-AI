import {
  loadDarakeAutopilotState,
  saveDarakeAutopilotState,
  INITIAL_AUTOPILOT_STATE,
} from './darakeAutopilotState';
import type { DarakeAutopilotState } from './darakeAutopilotState';
import { addToWakeQueue } from './darakeWakeQueue';
import { loadGentleAppStartForm } from './gentleAppStartForm';
import { loadGitHubStartSettings } from './githubStartSettings';
import { loadGitHubIssueCreateState } from './githubIssueCreateState';
import { createGitHubIssue } from './githubIssueCreateClient';
import { saveGitHubIssueRecord } from './githubIssueRecord';
import { buildGentleFormToBlueprintBridge } from './gentleFormToBlueprintBridge';
import { buildCloudAgentStartInstruction } from './cloudAgentStartInstruction';
import { assignAgentToIssue, findPrByIssue } from './githubAgentClient';
import { saveAgentRunState, loadAgentRunState } from './agentRunState';
import { getPrHealth } from './githubAgentClient';
import { parsePrHealthFromApi } from './prHealthSummary';
import { buildAgentFixInstruction } from './buildAgentFixInstruction';
import { buildFailureSummaryFromPrHealth } from './failureSummary';
import { createPrComment } from './githubAgentClient';

function save(state: Omit<DarakeAutopilotState, 'updatedAt'>): DarakeAutopilotState {
  saveDarakeAutopilotState(state);
  return { ...state, updatedAt: new Date().toISOString() };
}

/**
 * Run one step of the darake autopilot.
 * Reads current state and advances to the next step.
 * Never performs dangerous operations (merge, approve, push to main).
 */
export async function runDarakeAutopilot(): Promise<DarakeAutopilotState> {
  const current = loadDarakeAutopilotState() ?? {
    ...INITIAL_AUTOPILOT_STATE,
    updatedAt: new Date().toISOString(),
  };

  if (!current.enabled || current.status === 'off') {
    return current;
  }

  switch (current.status) {
    case 'idle':
    case 'starting':
      return handleIdle(current);

    case 'issue-creating':
      return handleIssueCreating(current);

    case 'agent-working':
      return handleAgentWorking(current);

    case 'watching-pr':
      return handleWatchingPr(current);

    case 'waiting-for-checks':
      return handleWaitingForChecks(current);

    case 'auto-fixing':
      return handleAutoFixing(current);

    case 'merge-candidate':
    case 'needs-human':
    case 'blocked':
    case 'done':
    case 'failed':
      // Terminal or human-required states: do nothing automatically
      return current;

    default:
      return current;
  }
}

async function handleIdle(
  current: DarakeAutopilotState,
): Promise<DarakeAutopilotState> {
  const form = loadGentleAppStartForm();
  const repoUrl =
    loadGitHubIssueCreateState()?.repoUrl ??
    loadGitHubStartSettings()?.repoUrl ??
    current.repoUrl ??
    '';

  if (!form || !form.appName || !form.oneLineIdea) {
    return save({
      ...current,
      status: 'needs-human',
      repoUrl,
      userMessage: 'アプリ情報が不足しています。フォームに入力してください。',
      nextActionLabel: 'フォームを入力する',
      shouldWakeUser: true,
      wakeReason: 'フォームへの入力が必要です',
    });
  }

  if (!repoUrl) {
    return save({
      ...current,
      status: 'needs-human',
      userMessage: 'GitHubリポジトリURLを入力してください。',
      nextActionLabel: 'リポジトリURLを確認する',
      shouldWakeUser: true,
      wakeReason: 'リポジトリURLが未設定です',
    });
  }

  // Check if issue was already created
  const agentState = loadAgentRunState();
  if (
    agentState &&
    agentState.issueUrl &&
    agentState.status !== 'idle' &&
    agentState.status !== 'failed'
  ) {
    return save({
      ...current,
      status: 'agent-working',
      appName: agentState.appName,
      repoUrl: agentState.repoUrl,
      issueUrl: agentState.issueUrl,
      issueNumber: agentState.issueNumber,
      prUrl: agentState.prUrl,
      prNumber: agentState.prNumber,
      userMessage: 'AIが作業中です',
      nextActionLabel: '何もしなくてOK',
      shouldWakeUser: false,
    });
  }

  // Move to issue-creating
  return save({
    ...current,
    status: 'issue-creating',
    appName: form.appName,
    repoUrl,
    userMessage: 'Issueを作成しています...',
    nextActionLabel: '待っていてください',
    shouldWakeUser: false,
  });
}

async function handleIssueCreating(
  current: DarakeAutopilotState,
): Promise<DarakeAutopilotState> {
  const form = loadGentleAppStartForm();
  const repoUrl = current.repoUrl ?? '';
  const appName = current.appName ?? form?.appName ?? '';

  if (!form || !form.appName) {
    addToWakeQueue({
      reason: 'issue-create-failed',
      title: 'フォーム情報が不足しています',
      message: 'フォームに入力してから再度試してください。',
      nextActionLabel: 'フォームを入力する',
    });
    return save({
      ...current,
      status: 'needs-human',
      userMessage: 'フォーム情報が不足しています。',
      nextActionLabel: 'フォームを入力する',
      shouldWakeUser: true,
      wakeReason: 'フォームへの入力が必要です',
    });
  }

  const bridge = buildGentleFormToBlueprintBridge(form);
  if (bridge.status === 'blocked') {
    const msg = `内容に問題があります: ${bridge.blockers.join('、')}`;
    addToWakeQueue({
      reason: 'issue-create-failed',
      title: 'フォーム内容に問題があります',
      message: msg,
      nextActionLabel: 'フォームを確認する',
    });
    return save({
      ...current,
      status: 'needs-human',
      userMessage: msg,
      nextActionLabel: 'フォームを確認する',
      shouldWakeUser: true,
      wakeReason: msg,
    });
  }

  try {
    const res = await createGitHubIssue({
      repoUrl,
      title: bridge.issueDraftTitle,
      body: bridge.issueDraftBody,
      source: 'pon-start',
    });

    if (!res.ok) {
      addToWakeQueue({
        reason: 'issue-create-failed',
        title: 'Issue作成に失敗しました',
        message: res.error,
        nextActionLabel: 'もう一度試す',
      });
      return save({
        ...current,
        status: 'needs-human',
        userMessage: `Issueを作れませんでした。${res.error}`,
        nextActionLabel: 'もう一度試す',
        shouldWakeUser: true,
        wakeReason: `Issue作成失敗: ${res.error}`,
        error: res.error,
      });
    }

    const record = saveGitHubIssueRecord({
      issueUrl: res.issueUrl,
      owner: res.owner,
      repo: res.repo,
      issueNumber: res.issueNumber,
      fullName: res.fullName,
    });

    // Try to assign Copilot agent
    const assignRes = await assignAgentToIssue({
      repoUrl,
      issueNumber: res.issueNumber,
      agent: 'copilot',
    }).catch(() => null);

    const cloudAgentInstruction = buildCloudAgentStartInstruction(record);

    saveAgentRunState({
      status: 'issue-created',
      appName,
      repoUrl,
      issueUrl: res.issueUrl,
      issueNumber: res.issueNumber,
      nextActionLabel: assignRes?.ok ? '何もしなくてOK' : 'Cloud Agentに貼る',
      userMessage: assignRes?.ok
        ? 'IssueにAIを割り当てました。作業を待っています。'
        : 'Issueを作成しました。Cloud Agentに指示を貼ってください。',
    });

    const userMessage = assignRes?.ok
      ? 'AIが作業を開始しました'
      : `Issueを作成しました。\n\n${cloudAgentInstruction}`;

    return save({
      ...current,
      status: 'agent-working',
      appName,
      repoUrl,
      issueUrl: res.issueUrl,
      issueNumber: res.issueNumber,
      userMessage: assignRes?.ok
        ? 'AIが作業中です'
        : userMessage,
      nextActionLabel: assignRes?.ok ? '何もしなくてOK' : 'Cloud Agentに貼る',
      shouldWakeUser: !assignRes?.ok,
      wakeReason: assignRes?.ok ? undefined : 'Cloud Agentへの貼り付けが必要です',
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '不明なエラー';
    addToWakeQueue({
      reason: 'issue-create-failed',
      title: 'ネットワークエラーが発生しました',
      message: errorMessage,
      nextActionLabel: 'もう一度試す',
    });
    return save({
      ...current,
      status: 'needs-human',
      userMessage: `ネットワークエラーが発生しました。(${errorMessage})`,
      nextActionLabel: 'もう一度試す',
      shouldWakeUser: true,
      wakeReason: `ネットワークエラー: ${errorMessage}`,
      error: errorMessage,
    });
  }
}

async function handleAgentWorking(
  current: DarakeAutopilotState,
): Promise<DarakeAutopilotState> {
  const repoUrl = current.repoUrl ?? '';
  const issueNumber = current.issueNumber;

  if (!issueNumber || !repoUrl) {
    return save({
      ...current,
      status: 'watching-pr',
      userMessage: 'AIが作業中です。PRを探しています...',
      nextActionLabel: '何もしなくてOK',
      shouldWakeUser: false,
    });
  }

  // Check if there's already a PR
  if (current.prNumber && current.prUrl) {
    return save({
      ...current,
      status: 'waiting-for-checks',
      userMessage: 'CIを確認しています...',
      nextActionLabel: '何もしなくてOK',
      shouldWakeUser: false,
    });
  }

  // Try to find a PR for this issue
  try {
    const findRes = await findPrByIssue({ repoUrl, issueNumber });

    if (!findRes.ok) {
      return save({
        ...current,
        status: 'watching-pr',
        userMessage: 'AIが作業中です。PR作成を待っています。',
        nextActionLabel: '何もしなくてOK',
        shouldWakeUser: false,
      });
    }

    if (findRes.status === 'not-found') {
      return save({
        ...current,
        status: 'watching-pr',
        userMessage: 'AIが作業中です。PR作成を待っています。',
        nextActionLabel: '何もしなくてOK',
        shouldWakeUser: false,
      });
    }

    if (findRes.status === 'multiple-candidates') {
      addToWakeQueue({
        reason: 'pr-candidates-multiple',
        title: '複数のPR候補があります',
        message: `Issue #${issueNumber} に対して複数のPRが見つかりました。確認してください。`,
        nextActionLabel: 'PRを確認する',
        actionUrl: `https://github.com/${repoUrl.replace('https://github.com/', '')}/pulls`,
      });
      return save({
        ...current,
        status: 'needs-human',
        userMessage: '複数のPR候補があります。確認してください。',
        nextActionLabel: 'PRを確認する',
        shouldWakeUser: true,
        wakeReason: '複数のPR候補があります',
      });
    }

    // Single PR found
    saveAgentRunState({
      ...(loadAgentRunState() ?? {
        status: 'pr-created' as const,
        appName: current.appName ?? '',
        repoUrl,
        issueUrl: current.issueUrl,
        issueNumber,
        nextActionLabel: '何もしなくてOK',
        userMessage: 'PRが作成されました',
      }),
      prUrl: findRes.prUrl,
      prNumber: findRes.prNumber,
    });

    return save({
      ...current,
      status: 'waiting-for-checks',
      prUrl: findRes.prUrl,
      prNumber: findRes.prNumber,
      userMessage: 'PRが見つかりました。CIを確認しています。',
      nextActionLabel: '何もしなくてOK',
      shouldWakeUser: false,
    });
  } catch {
    return save({
      ...current,
      status: 'watching-pr',
      userMessage: 'AIが作業中です。PR作成を待っています。',
      nextActionLabel: '何もしなくてOK',
      shouldWakeUser: false,
    });
  }
}

async function handleWatchingPr(
  current: DarakeAutopilotState,
): Promise<DarakeAutopilotState> {
  if (current.prNumber && current.prUrl) {
    return save({
      ...current,
      status: 'waiting-for-checks',
      userMessage: 'CIを確認しています...',
      nextActionLabel: '何もしなくてOK',
      shouldWakeUser: false,
    });
  }
  return handleAgentWorking(current);
}

async function handleWaitingForChecks(
  current: DarakeAutopilotState,
): Promise<DarakeAutopilotState> {
  const repoUrl = current.repoUrl ?? '';
  const prNumber = current.prNumber;

  if (!prNumber || !repoUrl) {
    return save({
      ...current,
      status: 'watching-pr',
      userMessage: 'PRを探しています...',
      nextActionLabel: '何もしなくてOK',
      shouldWakeUser: false,
    });
  }

  try {
    const healthRes = await getPrHealth({ repoUrl, prNumber });

    if (!healthRes.ok) {
      return save({
        ...current,
        userMessage: 'CI状態を確認できませんでした。再試行します。',
        nextActionLabel: '何もしなくてOK',
        shouldWakeUser: false,
      });
    }

    const health = parsePrHealthFromApi(healthRes.health);

    if (health === 'checks-running' || health === 'waiting') {
      return save({
        ...current,
        status: 'waiting-for-checks',
        userMessage: 'CIが実行中です。完了を待っています。',
        nextActionLabel: '何もしなくてOK',
        shouldWakeUser: false,
      });
    }

    if (health === 'checks-passed' || health === 'ready-to-merge') {
      addToWakeQueue({
        reason: 'merge-candidate',
        title: 'マージ候補です',
        message: 'PRは問題なさそうです。確認してマージしてください。',
        nextActionLabel: 'PRを開いて確認してください',
        actionUrl: current.prUrl,
      });
      return save({
        ...current,
        status: 'merge-candidate',
        userMessage: 'PRは問題なさそうです。',
        nextActionLabel: 'PRを開いて確認してください',
        shouldWakeUser: true,
        wakeReason: 'PRがマージ候補になりました',
      });
    }

    if (health === 'checks-failed') {
      if (current.autoFixAttempts >= current.maxAutoFixAttempts) {
        addToWakeQueue({
          reason: 'ci-failed-max-retry',
          title: 'Build失敗が続いています',
          message: `${current.maxAutoFixAttempts}回修正を試みましたが、解決できませんでした。`,
          nextActionLabel: '詳細を確認してください',
          actionUrl: current.prUrl,
        });
        return save({
          ...current,
          status: 'needs-human',
          userMessage: `Build失敗が${current.maxAutoFixAttempts}回続きました。`,
          nextActionLabel: '詳細を確認してください',
          shouldWakeUser: true,
          wakeReason: `Build失敗が${current.maxAutoFixAttempts}回続きました`,
        });
      }

      return save({
        ...current,
        status: 'auto-fixing',
        userMessage: 'CIが失敗しました。AIに修正依頼を送ります。',
        nextActionLabel: '何もしなくてOK',
        shouldWakeUser: false,
      });
    }

    if (health === 'review-needed') {
      return save({
        ...current,
        status: 'waiting-for-checks',
        userMessage: 'CIが通りました。レビューを待っています。',
        nextActionLabel: '何もしなくてOK',
        shouldWakeUser: false,
      });
    }

    return save({
      ...current,
      userMessage: 'CI状態を確認中です。',
      nextActionLabel: '何もしなくてOK',
      shouldWakeUser: false,
    });
  } catch {
    return save({
      ...current,
      userMessage: 'CI確認中にエラーが発生しました。再試行します。',
      nextActionLabel: '何もしなくてOK',
      shouldWakeUser: false,
    });
  }
}

async function handleAutoFixing(
  current: DarakeAutopilotState,
): Promise<DarakeAutopilotState> {
  const repoUrl = current.repoUrl ?? '';
  const prNumber = current.prNumber;

  if (!prNumber || !repoUrl) {
    return save({
      ...current,
      status: 'needs-human',
      userMessage: 'PR情報が見つかりません。確認してください。',
      nextActionLabel: 'PRを確認する',
      shouldWakeUser: true,
      wakeReason: 'PR情報が不足しています',
    });
  }

  const failure = buildFailureSummaryFromPrHealth('checks-failed');
  const instruction = buildAgentFixInstruction({
    repoUrl,
    issueUrl: current.issueUrl,
    prUrl: current.prUrl ?? '',
    prNumber,
    failure,
    attemptCount: current.autoFixAttempts + 1,
  });

  try {
    const commentRes = await createPrComment({
      repoUrl,
      prNumber,
      body: instruction,
    });

    if (commentRes.ok) {
      return save({
        ...current,
        status: 'waiting-for-checks',
        autoFixAttempts: current.autoFixAttempts + 1,
        userMessage: 'AIに修正依頼を送りました。',
        nextActionLabel: '何もしなくてOK',
        shouldWakeUser: false,
      });
    }

    // Comment post failed — give user the instruction to copy
    addToWakeQueue({
      reason: 'ci-failed-max-retry',
      title: '修正依頼を送れませんでした',
      message: 'この修正指示をコピーしてPRに貼ってください。',
      nextActionLabel: 'PRに修正指示を貼る',
      actionUrl: current.prUrl,
    });
    return save({
      ...current,
      status: 'needs-human',
      autoFixAttempts: current.autoFixAttempts + 1,
      userMessage: '修正依頼を送れませんでした。PRに貼ってください。',
      nextActionLabel: 'PRに修正指示を貼る',
      shouldWakeUser: true,
      wakeReason: '修正依頼の手動貼り付けが必要です',
    });
  } catch {
    addToWakeQueue({
      reason: 'ci-failed-max-retry',
      title: '修正依頼でエラーが発生しました',
      message: '修正依頼の送信に失敗しました。',
      nextActionLabel: 'PRを確認する',
      actionUrl: current.prUrl,
    });
    return save({
      ...current,
      status: 'needs-human',
      autoFixAttempts: current.autoFixAttempts + 1,
      userMessage: '修正依頼でエラーが発生しました。',
      nextActionLabel: 'PRを確認する',
      shouldWakeUser: true,
      wakeReason: '修正依頼の送信エラー',
    });
  }
}
