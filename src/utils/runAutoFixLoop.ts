import { loadAutoFixLoopState, saveAutoFixLoopState } from './autoFixLoopState';
import type { AutoFixLoopState } from './autoFixLoopState';
import { checkPrAndDecideNext } from './checkPrAndDecideNext';
import { buildAgentFixInstruction } from './buildAgentFixInstruction';
import { buildFailureSummaryFromPrHealth } from './failureSummary';
import { createPrComment } from './githubAgentClient';

/**
 * Run one iteration of the auto-fix loop.
 * - Checks PR health
 * - If CI passes → merge-candidate
 * - If CI fails → generate fix instruction, post as PR comment (if under maxAttempts)
 * - If maxAttempts reached → needs-human
 * Returns the latest AutoFixLoopState.
 */
export async function runAutoFixLoop(): Promise<AutoFixLoopState | null> {
  const current = loadAutoFixLoopState();

  // Check PR and decide next action
  const next = await checkPrAndDecideNext();
  if (!next) return null;

  // Already at a terminal state that doesn't need fixing
  if (
    next.status === 'merge-candidate' ||
    next.status === 'checking' ||
    next.status === 'waiting-for-agent' ||
    next.status === 'needs-human'
  ) {
    return next;
  }

  if (next.status !== 'needs-fix') {
    return next;
  }

  // CI/Build failed — decide whether to post fix instruction
  const attemptCount = current?.attemptCount ?? 0;
  const maxAttempts = next.maxAttempts;

  if (attemptCount >= maxAttempts) {
    const humanState = {
      ...next,
      status: 'needs-human' as const,
      userMessage: `AIに${maxAttempts}回修正をお願いしましたが、まだ止まっています。`,
      nextActionLabel: '詳細を見る',
    };
    saveAutoFixLoopState(humanState);
    return { ...humanState, updatedAt: new Date().toISOString() };
  }

  // Build fix instruction
  if (!next.prUrl || !next.prNumber) {
    return next;
  }

  const failure = buildFailureSummaryFromPrHealth('checks-failed');
  const instruction = buildAgentFixInstruction({
    repoUrl: next.repoUrl,
    issueUrl: next.issueUrl,
    prUrl: next.prUrl,
    prNumber: next.prNumber,
    failure,
    attemptCount,
  });

  // Avoid duplicate instructions
  if (current?.lastInstruction === instruction) {
    const noRepeatState = {
      ...next,
      status: 'waiting-for-agent' as const,
      userMessage: 'AIに修正依頼をすでに送りました',
      nextActionLabel: '何もしなくてOK',
    };
    saveAutoFixLoopState(noRepeatState);
    return { ...noRepeatState, updatedAt: new Date().toISOString() };
  }

  // Update state to fix-instruction-ready
  const instructionReadyState = {
    ...next,
    status: 'fix-instruction-ready' as const,
    lastInstruction: instruction,
    userMessage: '修正依頼を準備しました',
    nextActionLabel: 'AIに修正をお願いする',
    attemptCount: attemptCount + 1,
  };
  saveAutoFixLoopState(instructionReadyState);

  // Try to post comment
  try {
    const res = await createPrComment({
      repoUrl: next.repoUrl,
      prNumber: next.prNumber,
      body: instruction,
    });

    if (res.ok) {
      const postedState = {
        ...instructionReadyState,
        status: 'fix-comment-posted' as const,
        lastCommentUrl: res.commentUrl,
        userMessage: 'AIに修正依頼を送りました',
        nextActionLabel: '何もしなくてOK',
      };
      saveAutoFixLoopState(postedState);
      return { ...postedState, updatedAt: new Date().toISOString() };
    } else {
      // Post failed — stay at fix-instruction-ready for copy fallback
      return { ...instructionReadyState, updatedAt: new Date().toISOString() };
    }
  } catch {
    return { ...instructionReadyState, updatedAt: new Date().toISOString() };
  }
}
