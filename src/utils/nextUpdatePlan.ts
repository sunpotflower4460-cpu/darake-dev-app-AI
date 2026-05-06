import type { ReleaseRecord } from './releaseRecord';
import type { PostReleaseFeedback } from './postReleaseFeedbackRecord';

export type NextUpdatePlan = {
  appId: string;
  appName: string;
  targetVersion: string;
  status: 'draft' | 'ready-to-issue' | 'blocked';
  includedFixes: string[];
  includedImprovements: string[];
  notIncluded: string[];
  risks: string[];
  suggestedPhases: string[];
  issueDraft: string;
};

export function buildNextUpdatePlan(
  release: ReleaseRecord,
  feedbacks: PostReleaseFeedback[],
): NextUpdatePlan {
  const appFeedbacks = feedbacks.filter((f) => f.appId === release.appId || !f.appId);

  const criticalFixes = appFeedbacks
    .filter((f) => f.priority === 'critical' && (f.category === 'bug' || f.category === 'crash'))
    .map((f) => f.title);

  const improvements = appFeedbacks
    .filter((f) => f.category === 'feature-request' || f.category === 'ui' || f.category === 'copy')
    .map((f) => f.title);

  const knownIssues = release.knownIssues;
  const ideas = release.nextUpdateIdeas;

  const includedFixes = [...criticalFixes, ...knownIssues].filter(Boolean);
  const includedImprovements = [...improvements, ...ideas].filter(Boolean);

  const risks = appFeedbacks
    .filter((f) => f.priority === 'critical')
    .map((f) => `[critical] ${f.title}`);

  const versionParts = release.version.split('.').map(Number);
  versionParts[versionParts.length - 1] += 1;
  const targetVersion = versionParts.join('.');

  const status: NextUpdatePlan['status'] =
    criticalFixes.length > 0 ? 'ready-to-issue' : includedImprovements.length > 0 ? 'draft' : 'draft';

  const issueDraft = [
    `## 次アップデート計画: ${release.appName} v${targetVersion}`,
    '',
    '### 含める修正',
    ...includedFixes.map((f) => `- [ ] ${f}`),
    includedFixes.length === 0 ? '（なし）' : '',
    '',
    '### 含める改善',
    ...includedImprovements.map((i) => `- [ ] ${i}`),
    includedImprovements.length === 0 ? '（なし）' : '',
    '',
    '### リスク',
    ...risks.map((r) => `- ${r}`),
    risks.length === 0 ? '（なし）' : '',
    '',
    '### Safety Note',
    '- App Store / Google Playへの自動操作は行いません',
  ].join('\n');

  return {
    appId: release.appId,
    appName: release.appName,
    targetVersion,
    status,
    includedFixes,
    includedImprovements,
    notIncluded: [],
    risks,
    suggestedPhases: ['修正', 'テスト', 'スクショ更新', 'メタデータ更新', '提出'],
    issueDraft,
  };
}
