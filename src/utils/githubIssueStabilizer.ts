import { loadGentleAppStartForm } from './gentleAppStartForm';
import { loadGitHubIssueCreateState } from './githubIssueCreateState';
import { buildGitHubIssueCreateUrl } from './githubIssueCreateUrl';

export type IssueStabilizerState =
  | { mode: 'ready'; repoUrl: string; title: string; body: string; fallbackUrl: string }
  | { mode: 'no-repo' }
  | { mode: 'no-idea' };

export function buildIssueStabilizerState(): IssueStabilizerState {
  const issueState = loadGitHubIssueCreateState();
  const form = loadGentleAppStartForm();

  if (!issueState?.repoUrl) {
    return { mode: 'no-repo' };
  }

  const appName = form?.appName?.trim() ?? '';
  const oneLineIdea = form?.oneLineIdea?.trim() ?? '';

  if (!appName && !oneLineIdea) {
    return { mode: 'no-idea' };
  }

  const displayAppName = appName || '新しいアプリ';
  const displayIdea = oneLineIdea || 'アイデアを整理する';
  const title = `[作業] ${displayAppName} — ${displayIdea.slice(0, 50)}`;
  const body = buildIssueBody(displayAppName, displayIdea, form);
  const urlResult = buildGitHubIssueCreateUrl({ repoUrl: issueState.repoUrl, title, body });
  const fallbackUrl = urlResult.ok ? urlResult.url : issueState.repoUrl + '/issues/new';

  return {
    mode: 'ready',
    repoUrl: issueState.repoUrl,
    title,
    body,
    fallbackUrl,
  };
}

function buildIssueBody(
  appName: string,
  oneLineIdea: string,
  form: ReturnType<typeof loadGentleAppStartForm>,
): string {
  const lines = [
    `## ${appName}`,
    '',
    `**一行アイデア**: ${oneLineIdea}`,
    '',
  ];

  if (form?.targetUser) {
    lines.push(`**対象ユーザー**: ${form.targetUser}`, '');
  }

  if (form?.firstGoal) {
    const goalLabel: Record<string, string> = {
      'just-visible': 'まず動くものを作る',
      'usable-mvp': '使えるMVPを作る',
      'app-store-ready': 'App Store申請できる状態にする',
      'not-sure': '未定',
    };
    lines.push(`**最初のゴール**: ${goalLabel[form.firstGoal] ?? form.firstGoal}`, '');
  }

  lines.push(
    '## やること（AIが自動生成）',
    '',
    '- [ ] 設計図を作る',
    '- [ ] MVP機能を実装する',
    '- [ ] UIを整える',
    '- [ ] テストを書く',
    '- [ ] レビューを受ける',
    '',
    '## 安全方針',
    '',
    '- secret / token は保存しない',
    '- App Store / 本番への自動操作は行わない',
    '- 危険な判断は必ず人間に確認する',
  );

  return lines.join('\n');
}
