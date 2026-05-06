import { GitHubOperationType } from './githubOperationCandidate';

export type GitHubManualOperationGuide = {
  type: GitHubOperationType;
  label: string;
  steps: string[];
  copyTemplate: string;
  warnings: string[];
};

export function buildGitHubManualOperationGuide(
  type: GitHubOperationType,
  context: { title?: string; body?: string; repo?: string; branch?: string },
): GitHubManualOperationGuide {
  const guides: Record<GitHubOperationType, GitHubManualOperationGuide> = {
    'create-issue': {
      type: 'create-issue',
      label: 'Issue作成 手順カード',
      steps: [
        `1. GitHub → ${context.repo ?? '<リポジトリ>'} → Issues を開く`,
        '2. "New issue" をクリック',
        `3. タイトル: ${context.title ?? '<タイトル>'}`,
        '4. 本文を以下からコピーして貼り付ける',
        '5. ラベル・マイルストーンを設定',
        '6. "Submit new issue" をクリック',
      ],
      copyTemplate: `## タイトル\n${context.title ?? ''}\n\n## 本文\n${context.body ?? ''}`,
      warnings: ['自動Issue作成はしません', 'GitHub APIは実行しません'],
    },
    'create-pr': {
      type: 'create-pr',
      label: 'PR作成 手順カード',
      steps: [
        `1. GitHub → ${context.repo ?? '<リポジトリ>'} → Pull requests を開く`,
        '2. "New pull request" をクリック',
        `3. base: main ← compare: ${context.branch ?? '<ブランチ名>'}`,
        `4. タイトル: ${context.title ?? '<タイトル>'}`,
        '5. 本文を以下からコピーして貼り付ける',
        '6. "Create pull request" をクリック',
      ],
      copyTemplate: `## タイトル\n${context.title ?? ''}\n\n## 本文\n${context.body ?? ''}`,
      warnings: ['自動PR作成はしません', 'GitHub APIは実行しません'],
    },
    'dispatch-workflow': {
      type: 'dispatch-workflow',
      label: 'Workflow Dispatch 手順カード',
      steps: [
        `1. GitHub → ${context.repo ?? '<リポジトリ>'} → Actions を開く`,
        '2. 対象ワークフローを選択',
        '3. "Run workflow" をクリック',
        '4. inputsを確認して実行',
      ],
      copyTemplate: `## Workflow\n${context.title ?? ''}\n\n## Inputs\n${context.body ?? ''}`,
      warnings: ['自動dispatch実行はしません', 'GitHub APIは実行しません'],
    },
    'merge-pr': {
      type: 'merge-pr',
      label: 'PR Merge 手順カード',
      steps: [
        `1. GitHub → ${context.repo ?? '<リポジトリ>'} → Pull requests を開く`,
        `2. 対象PR "${context.title ?? '<PR番号>'}" を開く`,
        '3. CI・レビュー・チェックリストを確認',
        '4. "Merge pull request" をクリック',
        '5. マージコミットメッセージを確認して "Confirm merge"',
      ],
      copyTemplate: `## Merge対象\n${context.title ?? ''}\n\nブランチ: ${context.branch ?? ''}`,
      warnings: ['自動mergeは実行しません', '全チェック通過を確認してから実行してください'],
    },
    'close-issue': {
      type: 'close-issue',
      label: 'Issue Close 手順カード',
      steps: [
        `1. GitHub → ${context.repo ?? '<リポジトリ>'} → Issues を開く`,
        `2. Issue "${context.title ?? '<Issue番号>'}" を開く`,
        '3. "Close issue" をクリック',
      ],
      copyTemplate: `## Close対象\n${context.title ?? ''}`,
      warnings: ['自動Close実行はしません'],
    },
    'create-release': {
      type: 'create-release',
      label: 'Release作成 手順カード',
      steps: [
        `1. GitHub → ${context.repo ?? '<リポジトリ>'} → Releases を開く`,
        '2. "Draft a new release" をクリック',
        '3. Tag version を入力',
        `4. タイトル: ${context.title ?? '<タイトル>'}`,
        '5. リリースノートを以下からコピー',
        '6. "Publish release" をクリック',
      ],
      copyTemplate: `## リリースタイトル\n${context.title ?? ''}\n\n## リリースノート\n${context.body ?? ''}`,
      warnings: ['自動Release作成はしません', 'GitHub APIは実行しません'],
    },
    comment: {
      type: 'comment',
      label: 'コメント追加 手順カード',
      steps: [
        `1. GitHub → 対象のIssue/PRを開く`,
        '2. コメント欄に以下の文章をコピーして貼り付ける',
        '3. "Comment" をクリック',
      ],
      copyTemplate: context.body ?? '',
      warnings: ['自動コメント投稿はしません'],
    },
  };

  return guides[type];
}

export function formatGitHubManualOperationGuideMarkdown(guide: GitHubManualOperationGuide): string {
  return [
    `# ${guide.label}`,
    '',
    '## 手順',
    ...guide.steps.map((s) => `- ${s}`),
    '',
    '## コピー用テンプレート',
    '```',
    guide.copyTemplate,
    '```',
    '',
    '## 注意',
    ...guide.warnings.map((w) => `- ⚠️ ${w}`),
  ].join('\n');
}
