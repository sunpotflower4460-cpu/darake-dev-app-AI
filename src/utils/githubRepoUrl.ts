export type ParseGitHubRepoUrlResult =
  | { ok: true; owner: string; repo: string; fullName: string }
  | { ok: false; error: string };

/**
 * GitHubリポジトリURLから owner / repo を取り出します。
 *
 * 対応形式:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/
 *   github.com/owner/repo
 */
export function parseGitHubRepoUrl(url: string): ParseGitHubRepoUrlResult {
  if (!url || !url.trim()) {
    return { ok: false, error: 'GitHubリポジトリURLを入力してください' };
  }

  const trimmed = url.trim().replace(/\/$/, '');

  // Normalize: accept with or without https://
  let normalized = trimmed;
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
    return { ok: false, error: 'GitHubのURLを入力してください（github.com のみ対応）' };
  }

  // pathname is like /owner/repo or /owner/repo/
  const parts = parsed.pathname.replace(/^\/|\/$/g, '').split('/');
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    return { ok: false, error: 'リポジトリURLを入力してください（例: https://github.com/owner/repo）' };
  }

  const owner = parts[0];
  const repo = parts[1];

  return {
    ok: true,
    owner,
    repo,
    fullName: `${owner}/${repo}`,
  };
}
