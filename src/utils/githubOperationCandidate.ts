export type GitHubOperationType =
  | 'create-issue'
  | 'create-pr'
  | 'dispatch-workflow'
  | 'merge-pr'
  | 'close-issue'
  | 'create-release'
  | 'comment';

export type GitHubOperationRisk =
  | 'safe-draft'
  | 'review-needed'
  | 'manual-gate'
  | 'blocked';

export type GitHubOperationCandidate = {
  id: string;
  type: GitHubOperationType;
  title: string;
  body: string;
  targetRepo: string;
  targetBranch: string;
  risk: GitHubOperationRisk;
  reason: string;
  requiredHumanAction: string;
  blockedReasons: string[];
};

const STORAGE_KEY = 'darake.githubOperationCandidates.v1';

export function buildInitialGitHubOperationCandidate(): GitHubOperationCandidate {
  return {
    id: `gh-op-${Date.now()}`,
    type: 'create-issue',
    title: '',
    body: '',
    targetRepo: '',
    targetBranch: 'main',
    risk: 'safe-draft',
    reason: '',
    requiredHumanAction: 'GitHubで手動実行してください',
    blockedReasons: ['自動実行なし：手動コピーのみ'],
  };
}

export function loadGitHubOperationCandidates(): GitHubOperationCandidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GitHubOperationCandidate[];
  } catch {
    return [];
  }
}

export function saveGitHubOperationCandidates(candidates: GitHubOperationCandidate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  } catch {
    // ignore
  }
}

export function addGitHubOperationCandidate(
  candidates: GitHubOperationCandidate[],
  candidate: GitHubOperationCandidate,
): GitHubOperationCandidate[] {
  return [...candidates, candidate];
}

export function updateGitHubOperationCandidate(
  candidates: GitHubOperationCandidate[],
  updated: GitHubOperationCandidate,
): GitHubOperationCandidate[] {
  return candidates.map((c) => (c.id === updated.id ? updated : c));
}

export function deleteGitHubOperationCandidate(
  candidates: GitHubOperationCandidate[],
  id: string,
): GitHubOperationCandidate[] {
  return candidates.filter((c) => c.id !== id);
}

export function formatGitHubOperationCandidateMarkdown(candidate: GitHubOperationCandidate): string {
  return [
    `# GitHub操作候補: ${candidate.title}`,
    `- type: ${candidate.type}`,
    `- risk: ${candidate.risk}`,
    `- targetRepo: ${candidate.targetRepo}`,
    `- targetBranch: ${candidate.targetBranch}`,
    `- reason: ${candidate.reason}`,
    '',
    '## Body',
    candidate.body,
    '',
    '## 必要な人間の操作',
    candidate.requiredHumanAction,
    '',
    '## ブロック理由',
    ...candidate.blockedReasons.map((r) => `- ${r}`),
  ].join('\n');
}

export function getRiskLabel(risk: GitHubOperationRisk): string {
  const labels: Record<GitHubOperationRisk, string> = {
    'safe-draft': '🟢 安全（下書き）',
    'review-needed': '🟡 要確認',
    'manual-gate': '🔶 手動ゲート必要',
    blocked: '🔴 ブロック',
  };
  return labels[risk];
}

export function getOperationTypeLabel(type: GitHubOperationType): string {
  const labels: Record<GitHubOperationType, string> = {
    'create-issue': 'Issue作成',
    'create-pr': 'PR作成',
    'dispatch-workflow': 'Workflow Dispatch',
    'merge-pr': 'PR Merge',
    'close-issue': 'Issue Close',
    'create-release': 'Release作成',
    comment: 'コメント',
  };
  return labels[type];
}
