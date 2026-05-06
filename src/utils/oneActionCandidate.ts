export type OneActionCandidateKind =
  | 'cloud-agent-job'
  | 'github-issue-dry-run'
  | 'github-pr-dry-run'
  | 'workflow-dispatch-dry-run'
  | 'ai-review-manual'
  | 'notification-manual'
  | 'app-store-prep'
  | 'portfolio-update'
  | 'template-generate'
  | 'safety-review'
  | 'completion-report';

export type OneActionDecision =
  | 'ok'
  | 'stop'
  | 'later'
  | 'needs-human-choice';

export type OneActionCandidate = {
  id: string;
  title: string;
  kind: OneActionCandidateKind;
  status: 'ready' | 'needs-review' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  expectedBenefit: string;
  estimatedHumanEffort:
    | 'one-tap'
    | 'copy-paste'
    | 'quick-review'
    | 'manual-check'
    | 'heavy-review';
  proposedActionLabel: string;
  primaryCopyText: string;
  blockers: string[];
  warnings: string[];
  stopIf: string[];
  nextIfOk: string[];
  nextIfLater: string[];
  nextIfStop: string[];
  createdAt: string;
};

const PRIORITY_ORDER: Record<OneActionCandidate['priority'], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const KIND_ORDER: Record<OneActionCandidateKind, number> = {
  'safety-review': 0,
  'app-store-prep': 1,
  'cloud-agent-job': 2,
  'ai-review-manual': 3,
  'github-issue-dry-run': 4,
  'github-pr-dry-run': 5,
  'workflow-dispatch-dry-run': 6,
  'notification-manual': 7,
  'portfolio-update': 8,
  'template-generate': 9,
  'completion-report': 10,
};

export function buildOneActionCandidate(
  partial: Partial<OneActionCandidate> & Pick<OneActionCandidate, 'title' | 'kind'>
): OneActionCandidate {
  return {
    id: `oac-${crypto.randomUUID()}`,
    status: 'ready',
    priority: 'medium',
    reason: '',
    expectedBenefit: '',
    estimatedHumanEffort: 'quick-review',
    proposedActionLabel: 'OK',
    primaryCopyText: '',
    blockers: [],
    warnings: [],
    stopIf: [],
    nextIfOk: [],
    nextIfLater: [],
    nextIfStop: [],
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

export function rankOneActionCandidates(
  candidates: OneActionCandidate[]
): OneActionCandidate[] {
  return [...candidates].sort((a, b) => {
    // blocked items with urgent/high priority come first
    const aBlocked = a.status === 'blocked' ? -10 : 0;
    const bBlocked = b.status === 'blocked' ? -10 : 0;
    const priorityDiff =
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    const kindDiff = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
    return aBlocked - bBlocked + priorityDiff * 2 + kindDiff;
  });
}

export function selectBestOneActionCandidate(
  candidates: OneActionCandidate[]
): OneActionCandidate | null {
  if (candidates.length === 0) return null;
  const ranked = rankOneActionCandidates(candidates);
  return ranked[0];
}

export function formatOneActionCandidateMarkdown(
  c: OneActionCandidate
): string {
  const lines: string[] = [
    `# One Action Candidate: ${c.title}`,
    '',
    `**kind:** ${c.kind}`,
    `**status:** ${c.status}`,
    `**priority:** ${c.priority}`,
    `**effort:** ${c.estimatedHumanEffort}`,
    '',
    `## なぜこれか`,
    c.reason || '（未記入）',
    '',
    `## 期待効果`,
    c.expectedBenefit || '（未記入）',
  ];
  if (c.blockers.length > 0) {
    lines.push('', '## Blockers');
    c.blockers.forEach((b) => lines.push(`- ${b}`));
  }
  if (c.warnings.length > 0) {
    lines.push('', '## Warnings');
    c.warnings.forEach((w) => lines.push(`- ${w}`));
  }
  if (c.stopIf.length > 0) {
    lines.push('', '## 止まる条件');
    c.stopIf.forEach((s) => lines.push(`- ${s}`));
  }
  if (c.nextIfOk.length > 0) {
    lines.push('', '## OKしたら');
    c.nextIfOk.forEach((n) => lines.push(`- ${n}`));
  }
  if (c.nextIfLater.length > 0) {
    lines.push('', '## あとでしたら');
    c.nextIfLater.forEach((n) => lines.push(`- ${n}`));
  }
  if (c.nextIfStop.length > 0) {
    lines.push('', '## 止めたら');
    c.nextIfStop.forEach((n) => lines.push(`- ${n}`));
  }
  if (c.primaryCopyText) {
    lines.push('', '## コピーテキスト', '```', c.primaryCopyText, '```');
  }
  return lines.join('\n');
}

const STORAGE_KEY = 'darake.oneActionCandidates.v1';

export function loadOneActionCandidates(): OneActionCandidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OneActionCandidate[];
  } catch {
    return [];
  }
}

export function saveOneActionCandidates(
  candidates: OneActionCandidate[]
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
  } catch {
    // ignore
  }
}
