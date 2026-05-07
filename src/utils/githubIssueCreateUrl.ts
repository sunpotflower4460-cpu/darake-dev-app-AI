import { parseGitHubRepoUrl } from './githubRepoUrl';

export type BuildGitHubIssueCreateUrlInput = {
  repoUrl: string;
  title: string;
  body: string;
};

export type BuildGitHubIssueCreateUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Issue タイトル / 本文を使って、GitHubの新規Issue作成URLを生成します。
 * GitHub APIは使いません。最後の投稿は人間が押します。
 */
export function buildGitHubIssueCreateUrl(
  input: BuildGitHubIssueCreateUrlInput,
): BuildGitHubIssueCreateUrlResult {
  const parsed = parseGitHubRepoUrl(input.repoUrl);
  if (!parsed.ok) {
    return { ok: false, error: 'GitHubリポジトリURLを確認してください' };
  }

  const { owner, repo } = parsed;
  const base = `https://github.com/${owner}/${repo}/issues/new`;
  const params = new URLSearchParams();
  if (input.title) params.set('title', input.title);
  if (input.body) params.set('body', input.body);

  const url = `${base}?${params.toString()}`;
  return { ok: true, url };
}
