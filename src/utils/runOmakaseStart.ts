import { loadGentleAppStartForm } from './gentleAppStartForm';
import { loadGitHubStartSettings } from './githubStartSettings';
import { buildGentleFormToBlueprintBridge } from './gentleFormToBlueprintBridge';
import { createGitHubIssue } from './githubIssueCreateClient';
import { saveGitHubIssueRecord } from './githubIssueRecord';
import { buildCloudAgentStartInstruction } from './cloudAgentStartInstruction';
import { saveOmakaseStartState, loadOmakaseStartState } from './omakaseStartState';
import type { OmakaseStartState } from './omakaseStartState';
import { loadGitHubIssueCreateState } from './githubIssueCreateState';

function saveFailedState(
  appName: string,
  repoUrl: string,
  userMessage: string,
  nextActionLabel: string,
  error?: string,
): void {
  const base: Omit<OmakaseStartState, 'updatedAt'> = {
    status: 'failed',
    appName,
    repoUrl,
    userMessage,
    nextActionLabel,
    error,
  };
  saveOmakaseStartState(base);
}

function saveBlockedState(
  appName: string,
  repoUrl: string,
  userMessage: string,
  nextActionLabel: string,
  error: string,
): void {
  const base: Omit<OmakaseStartState, 'updatedAt'> = {
    status: 'blocked',
    appName,
    repoUrl,
    userMessage,
    nextActionLabel,
    error,
  };
  saveOmakaseStartState(base);
}

export async function runOmakaseStart(): Promise<OmakaseStartState> {
  // 1. Load form
  const form = loadGentleAppStartForm();
  const appName = form?.appName ?? '';
  const repoUrl =
    loadGitHubIssueCreateState()?.repoUrl ??
    loadGitHubStartSettings()?.repoUrl ??
    '';

  // Save preparing state
  saveOmakaseStartState({
    status: 'preparing',
    appName,
    repoUrl,
    nextActionLabel: '準備中...',
    userMessage: 'Issueを作成して、Cloud Agentに渡す文章を整えています。',
  });

  // 2. Validate form
  if (!form || !form.appName || !form.oneLineIdea) {
    const msg = 'アプリ情報が不足しています。フォームに入力してください。';
    saveBlockedState(appName, repoUrl, msg, 'フォームを入力する', msg);
    return loadOmakaseStartStateOrDefault(appName, repoUrl);
  }

  // 3. Validate repo URL
  if (!repoUrl) {
    const msg = 'GitHubリポジトリURLを入力してください。';
    saveBlockedState(appName, repoUrl, msg, 'リポジトリURLを確認する', msg);
    return loadOmakaseStartStateOrDefault(appName, repoUrl);
  }

  // 4. Build Issue title/body
  const bridge = buildGentleFormToBlueprintBridge(form);
  if (bridge.status === 'blocked') {
    const msg = `内容に問題があります: ${bridge.blockers.join('、')}`;
    saveBlockedState(appName, repoUrl, msg, 'フォームを確認する', msg);
    return loadOmakaseStartStateOrDefault(appName, repoUrl);
  }

  const issueTitle = bridge.issueDraftTitle;
  const issueBody = bridge.issueDraftBody;

  // 5. Create GitHub Issue via Worker
  let issueUrl: string;
  let issueNumber: number;
  try {
    const res = await createGitHubIssue({
      repoUrl,
      title: issueTitle,
      body: issueBody,
      source: 'pon-start',
    });

    if (!res.ok) {
      let userMessage = 'Issueを作れませんでした。';
      let nextActionLabel = 'もう一度試す';

      if (res.code === 'MISSING_TOKEN') {
        userMessage =
          'CloudflareにGITHUB_TOKENを設定してください。Token入力欄はありません。Cloudflare WorkerのSecretとして設定してください。';
        nextActionLabel = '設定方法を見る';
      } else if (res.code === 'DISABLED') {
        userMessage =
          'Issue直接作成はまだ有効化されていません。CloudflareにGITHUB_ISSUE_CREATE_ENABLED=trueを設定してください。';
        nextActionLabel = '設定方法を見る';
      } else if (res.code === 'REPO_NOT_ALLOWED') {
        userMessage =
          'このリポジトリは許可されていません。Workerのallowlistを確認してください。';
        nextActionLabel = 'リポジトリURLを確認する';
      } else {
        userMessage = `Issueを作れませんでした。${res.error}`;
        nextActionLabel = 'もう一度試す';
      }

      saveFailedState(appName, repoUrl, userMessage, nextActionLabel, res.error);
      return loadOmakaseStartStateOrDefault(appName, repoUrl);
    }

    issueUrl = res.issueUrl;
    issueNumber = res.issueNumber;

    // 6. Save issue record
    const record = saveGitHubIssueRecord({
      issueUrl: res.issueUrl,
      owner: res.owner,
      repo: res.repo,
      issueNumber: res.issueNumber,
      fullName: res.fullName,
    });

    // 7. Build Cloud Agent instruction
    const cloudAgentInstruction = buildCloudAgentStartInstruction(record);

    // 8. Save cloud-agent-ready state
    saveOmakaseStartState({
      status: 'cloud-agent-ready',
      appName,
      repoUrl,
      issueUrl,
      issueNumber,
      cloudAgentInstruction,
      nextActionLabel: 'Cloud Agentに貼る指示をコピー',
      userMessage: '準備できました。次はCloud Agentに貼る指示をコピーするだけです。',
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : '不明なエラーが発生しました。';
    const msg = `ネットワークエラーが発生しました。接続を確認して、もう一度試してください。(${errorMessage})`;
    saveFailedState(appName, repoUrl, msg, 'もう一度試す', msg);
  }

  return loadOmakaseStartStateOrDefault(appName, repoUrl);
}

function loadOmakaseStartStateOrDefault(
  appName: string,
  repoUrl: string,
): OmakaseStartState {
  return (
    loadOmakaseStartState() ?? {
      status: 'failed',
      appName,
      repoUrl,
      nextActionLabel: 'もう一度試す',
      userMessage: '不明なエラーが発生しました。',
      updatedAt: new Date().toISOString(),
    }
  );
}
