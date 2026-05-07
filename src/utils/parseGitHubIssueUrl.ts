export type ParseGitHubIssueUrlResult =
  | {
      ok: true;
      owner: string;
      repo: string;
      fullName: string;
      issueNumber: number;
    }
  | { ok: false; error: string };

/**
 * GitHub Issue URLから owner / repo / issueNumber を取り出します。
 *
 * 対応形式:
 *   https://github.com/owner/repo/issues/1
 *   github.com/owner/repo/issues/1
 *
 * GitHub以外のURLは拒否します。
 * まだGitHubには自動投稿しません。作ったIssueのURLを記録するだけです。
 */
export function parseGitHubIssueUrl(url: string): ParseGitHubIssueUrlResult {
  if (!url || !url.trim()) {
    return { ok: false, error: 'GitHub Issue URLを入力してください' };
  }

  let normalized = url.trim();

  // Allow with or without https://
  if (normalized.startsWith('github.com/')) {
    normalized = 'https://' + normalized;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { ok: false, error: 'URLの形式が正しくありません' };
  }

  if (parsed.hostname !== 'github.com') {
    return { ok: false, error: 'GitHub Issue URLを入力してください（github.com のみ対応）' };
  }

  // pathname must be like /owner/repo/issues/123
  const parts = parsed.pathname.replace(/^\/|\/$/g, '').split('/');
  if (
    parts.length < 4 ||
    !parts[0] ||
    !parts[1] ||
    parts[2] !== 'issues' ||
    !parts[3]
  ) {
    return {
      ok: false,
      error: 'GitHub Issue URLを入力してください（例: https://github.com/owner/repo/issues/1）',
    };
  }

  const issueNumber = Number(parts[3]);
  if (!Number.isInteger(issueNumber) || issueNumber <= 0) {
    return { ok: false, error: 'Issue番号が正しくありません' };
  }

  const owner = parts[0];
  const repo = parts[1];

  return {
    ok: true,
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    issueNumber,
  };
}
