import {
  loadAgentRunState,
  saveAgentRunState,
} from './agentRunState';
import { findPrByIssue, getPrHealth } from './githubAgentClient';
import { parsePrHealthFromApi } from './prHealthSummary';

/**
 * Poll for a PR linked to the current issue, update AgentRunState.
 * Returns the updated AgentRunState or null if nothing to watch.
 */
export async function watchAgentPr(): Promise<void> {
  const state = loadAgentRunState();
  if (!state) return;

  const { repoUrl, issueNumber, prNumber, status } = state;

  // If already in a terminal or human-needed state, skip
  if (
    status === 'done' ||
    status === 'failed' ||
    status === 'needs-human' ||
    status === 'ready-to-review'
  ) {
    return;
  }

  // Step 1: If we don't have a PR yet, try to find one
  if (!prNumber && issueNumber) {
    try {
      const res = await findPrByIssue({ repoUrl, issueNumber });
      if (!res.ok) {
        // Keep status as-is, just update check time
        saveAgentRunState({
          ...state,
          lastCheckAt: new Date().toISOString(),
        });
        return;
      }
      if (res.status === 'found') {
        saveAgentRunState({
          ...state,
          status: 'pr-created',
          prUrl: res.prUrl,
          prNumber: res.prNumber,
          lastCheckAt: new Date().toISOString(),
          nextActionLabel: 'まだ何もしなくてOK',
          userMessage: 'PRができました。CIを確認中です。',
        });
        return;
      }
      if (res.status === 'multiple-candidates') {
        saveAgentRunState({
          ...state,
          status: 'needs-human',
          lastCheckAt: new Date().toISOString(),
          nextActionLabel: 'PRを選んでください',
          userMessage: 'PRの候補が複数あります。確認が必要です。',
        });
        return;
      }
      // not-found: still working
      saveAgentRunState({
        ...state,
        status: state.status === 'pr-created' ? 'pr-created' : 'agent-working',
        lastCheckAt: new Date().toISOString(),
        nextActionLabel: '何もしなくてOK',
        userMessage: 'AIが作業中です。PRができるのを待っています。',
      });
    } catch {
      // network error, ignore
    }
    return;
  }

  // Step 2: If we have a PR, check its health
  if (prNumber) {
    try {
      const res = await getPrHealth({ repoUrl, prNumber });
      if (!res.ok) return;
      const health = parsePrHealthFromApi(res.health);

      if (health === 'checks-failed') {
        saveAgentRunState({
          ...state,
          status: 'needs-agent-fix',
          lastCheckAt: new Date().toISOString(),
          nextActionLabel: 'AIに修正をお願いする',
          userMessage: '止まりました。CIまたはBuildが失敗しています。',
        });
      } else if (health === 'ready-to-merge') {
        saveAgentRunState({
          ...state,
          status: 'ready-to-review',
          lastCheckAt: new Date().toISOString(),
          nextActionLabel: 'PRを開いてマージを確認する',
          userMessage: '確認できました。PRをマージできる状態です。',
        });
      } else if (health === 'review-needed') {
        saveAgentRunState({
          ...state,
          status: 'needs-human',
          lastCheckAt: new Date().toISOString(),
          nextActionLabel: 'PRを確認する',
          userMessage: 'レビューが必要です。',
        });
      } else if (health === 'checks-passed') {
        saveAgentRunState({
          ...state,
          status: 'checks-running',
          lastCheckAt: new Date().toISOString(),
          nextActionLabel: 'まだ何もしなくてOK',
          userMessage: 'PRができました。CIが通っています。',
        });
      } else {
        saveAgentRunState({
          ...state,
          status: 'checks-running',
          lastCheckAt: new Date().toISOString(),
          nextActionLabel: '何もしなくてOK',
          userMessage: 'PRができました。確認中です。',
        });
      }
    } catch {
      // ignore
    }
  }
}
