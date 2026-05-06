import type { PostReleaseFeedback } from './postReleaseFeedbackRecord';

export type FeedbackIssueDraft = {
  feedbackId: string;
  issueTitle: string;
  issueBody: string;
  cloudAgentInstruction: string;
  severity: string;
  doneConditions: string[];
  manualGate: string;
};

export function generateFeedbackIssueDraft(feedback: PostReleaseFeedback): FeedbackIssueDraft {
  const severity =
    feedback.priority === 'critical'
      ? '🔴 critical'
      : feedback.priority === 'high'
        ? '🟠 high'
        : feedback.priority === 'medium'
          ? '🟡 medium'
          : '🟢 low';

  const issueTitle = `[${feedback.category}][${feedback.priority}] ${feedback.title || '（タイトルなし）'}`;

  const issueBody = [
    `## 概要`,
    feedback.title || '（なし）',
    '',
    `## 詳細`,
    feedback.body || '（なし）',
    '',
    `## メタ情報`,
    `- **source**: ${feedback.source}`,
    `- **priority**: ${feedback.priority}`,
    `- **category**: ${feedback.category}`,
    `- **appId**: ${feedback.appId || '（未設定）'}`,
    `- **feedbackId**: ${feedback.id}`,
    `- **createdAt**: ${feedback.createdAt}`,
    '',
    `## 完了条件`,
    `- [ ] 問題を再現できた`,
    `- [ ] 修正を実装した`,
    `- [ ] テストした`,
    `- [ ] レビューした`,
    '',
    `## Safety Note`,
    `- 本番操作は自動実行しません`,
    `- secret / token は保存しません`,
  ].join('\n');

  const cloudAgentInstruction = [
    `# Cloud Agent 指示書`,
    '',
    `## タスク`,
    `${feedback.title || '（タイトルなし）'} を修正してください。`,
    '',
    `## 背景`,
    feedback.body || '（なし）',
    '',
    `## 優先度`,
    severity,
    '',
    `## 禁止事項`,
    `- App Store / Google Play への本番操作を自動実行しない`,
    `- secret / token / API key を保存しない`,
    `- 本番DB変更を自動実行しない`,
    '',
    `## 完了条件`,
    `- 問題を修正した`,
    `- typecheck / build が通る`,
    `- PR本文に変更内容を記載した`,
  ].join('\n');

  return {
    feedbackId: feedback.id,
    issueTitle,
    issueBody,
    cloudAgentInstruction,
    severity,
    doneConditions: ['問題を再現できた', '修正を実装した', 'テストした', 'レビューした'],
    manualGate: 'GitHub Issueは自動作成しません。コピーして手動で作成してください。',
  };
}
