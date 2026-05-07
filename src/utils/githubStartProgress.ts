import { loadGentleAppStartForm } from './gentleAppStartForm';
import { loadGitHubStartSettings } from './githubStartSettings';
import { loadGitHubIssueRecord } from './githubIssueRecord';

export type GitHubStartProgress =
  | 'form-ready'
  | 'issue-page-ready'
  | 'issue-recorded'
  | 'cloud-agent-ready';

/**
 * 「いまここ」の状態を計算します。
 *
 * form-ready:       フォーム入力済み
 * issue-page-ready: GitHubリポジトリURL設定済み（Issue作成ページを開ける）
 * issue-recorded:   Issue URLを記録済み
 * cloud-agent-ready: Cloud Agent指示をコピーできる（= issue-recorded と同じ）
 */
export function computeGitHubStartProgress(): GitHubStartProgress {
  const issueRecord = loadGitHubIssueRecord();
  if (issueRecord) {
    return 'issue-recorded';
  }

  const settings = loadGitHubStartSettings();
  if (settings?.repoUrl) {
    return 'issue-page-ready';
  }

  const form = loadGentleAppStartForm();
  if (form?.appName) {
    return 'form-ready';
  }

  return 'form-ready';
}
