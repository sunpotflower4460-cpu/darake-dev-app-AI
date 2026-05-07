import { loadAgentRunState } from './agentRunState';
import { getPrHealth } from './githubAgentClient';
import { parsePrHealthFromApi } from './prHealthSummary';
import {
  loadAutoFixLoopState,
  saveAutoFixLoopState,
  buildInitialAutoFixLoopState,
} from './autoFixLoopState';
import type { AutoFixLoopState } from './autoFixLoopState';
import { buildFailureSummaryFromPrHealth } from './failureSummary';

/**
 * Check current PR state and decide the next action.
 * Updates and returns AutoFixLoopState.
 */
export async function checkPrAndDecideNext(): Promise<AutoFixLoopState | null> {
  const agentState = loadAgentRunState();
  if (!agentState) return null;

  const { repoUrl, issueUrl, issueNumber, prUrl, prNumber } = agentState;
  const existing = loadAutoFixLoopState();
  const base = existing ?? {
    ...buildInitialAutoFixLoopState(repoUrl),
    updatedAt: new Date().toISOString(),
  };

  // Sync identifiers from agentRunState
  const synced = {
    ...base,
    repoUrl,
    issueUrl,
    issueNumber,
    prUrl,
    prNumber,
  };

  // No PR yet
  if (!prNumber) {
    const next = {
      ...synced,
      status: 'checking' as const,
      userMessage: 'AIがPRを作るのを待っています',
      nextActionLabel: '何もしなくてOK',
    };
    saveAutoFixLoopState(next);
    return { ...next, updatedAt: new Date().toISOString() };
  }

  // Check PR health
  let healthRes;
  try {
    healthRes = await getPrHealth({ repoUrl, prNumber });
  } catch {
    const next = {
      ...synced,
      status: 'checking' as const,
      userMessage: 'PR状態の確認中にエラーが発生しました',
      nextActionLabel: 'もう一度確認する',
    };
    saveAutoFixLoopState(next);
    return { ...next, updatedAt: new Date().toISOString() };
  }

  if (!healthRes.ok) {
    const next = {
      ...synced,
      status: 'checking' as const,
      userMessage: 'PR状態を確認できませんでした',
      nextActionLabel: 'もう一度確認する',
    };
    saveAutoFixLoopState(next);
    return { ...next, updatedAt: new Date().toISOString() };
  }

  const health = parsePrHealthFromApi(healthRes.health);

  if (health === 'checks-running' || health === 'waiting' || health === 'unknown') {
    const next = {
      ...synced,
      status: 'checking' as const,
      userMessage: '確認中です',
      nextActionLabel: '何もしなくてOK',
    };
    saveAutoFixLoopState(next);
    return { ...next, updatedAt: new Date().toISOString() };
  }

  if (health === 'checks-passed' || health === 'ready-to-merge') {
    const next = {
      ...synced,
      status: 'merge-candidate' as const,
      userMessage: 'PRは問題なさそうです',
      nextActionLabel: 'PRを見てマージできます',
    };
    saveAutoFixLoopState(next);
    return { ...next, updatedAt: new Date().toISOString() };
  }

  if (health === 'checks-failed') {
    const failure = buildFailureSummaryFromPrHealth(health, healthRes.details);
    const next = {
      ...synced,
      status: 'needs-fix' as const,
      userMessage: 'BuildまたはCIで止まりました',
      nextActionLabel: 'AIに修正をお願いする',
      lastFailureSummary: failure.shortMessage,
    };
    saveAutoFixLoopState(next);
    return { ...next, updatedAt: new Date().toISOString() };
  }

  if (health === 'review-needed' || health === 'blocked') {
    const next = {
      ...synced,
      status: 'needs-human' as const,
      userMessage: '人間の確認が必要です',
      nextActionLabel: '詳細を見る',
    };
    saveAutoFixLoopState(next);
    return { ...next, updatedAt: new Date().toISOString() };
  }

  const next = {
    ...synced,
    status: 'checking' as const,
    userMessage: '確認中です',
    nextActionLabel: '何もしなくてOK',
  };
  saveAutoFixLoopState(next);
  return { ...next, updatedAt: new Date().toISOString() };
}
