import {
  DARAKE_FIRST_APP_START_UPDATED_EVENT,
  emitDarakeRuntimeEvent,
} from './darakeRuntimeEvents';
import { parseGitHubRepoUrl } from './githubRepoUrl';
import { sanitizePreviewUrl } from './previewDeployStatus';

export type DarakeWorkSessionStatus =
  | 'idea'
  | 'issue-ready'
  | 'issue-created'
  | 'agent-instruction-ready'
  | 'agent-working'
  | 'pr-detected'
  | 'ci-checking'
  | 'preview-ready'
  | 'review-needed'
  | 'phase-complete';

export type DarakeWorkSession = {
  id: string;
  appName: string;
  oneLineIdea: string;
  repoUrl: string | null;
  issueUrl: string | null;
  issueNumber: number | null;
  prUrl: string | null;
  prNumber: number | null;
  previewUrl: string | null;
  currentPhaseTitle: string | null;
  currentInstruction: string | null;
  status: DarakeWorkSessionStatus;
  nextActionLabel: string;
  updatedAt: string;
};

export const DARAKE_WORK_SESSION_CURRENT_KEY = 'darake.workSession.current.v1';
export const DARAKE_WORK_SESSION_HISTORY_KEY = 'darake.workSession.history.v1';

const VALID_STATUSES: DarakeWorkSessionStatus[] = [
  'idea',
  'issue-ready',
  'issue-created',
  'agent-instruction-ready',
  'agent-working',
  'pr-detected',
  'ci-checking',
  'preview-ready',
  'review-needed',
  'phase-complete',
];

function makeId(): string {
  return `work-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isValidStatus(value: unknown): value is DarakeWorkSessionStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as DarakeWorkSessionStatus);
}

function sanitizeText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function sanitizeOptionalText(value: unknown): string | null {
  const text = sanitizeText(value);
  if (!text) return null;
  return text.slice(0, 20000);
}

function sanitizeRepoUrl(value: unknown): string | null {
  const text = sanitizeOptionalText(value);
  if (!text) return null;
  const parsed = parseGitHubRepoUrl(text);
  if (!parsed.ok) return null;
  return `https://github.com/${parsed.owner}/${parsed.repo}`;
}

function sanitizePositiveNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function sanitizeIssueUrl(value: unknown): string | null {
  const text = sanitizeOptionalText(value);
  if (!text) return null;
  return /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/(\d+\/?|new(\?.+)?)$/i.test(text) ? text : null;
}

function sanitizePrUrl(value: unknown): string | null {
  const text = sanitizeOptionalText(value);
  if (!text) return null;
  return /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+\/?$/i.test(text) ? text : null;
}

function defaultNextActionLabel(status: DarakeWorkSessionStatus): string {
  switch (status) {
    case 'idea':
      return 'Issueを作る';
    case 'issue-ready':
      return 'GitHub Issue作成画面を開く';
    case 'issue-created':
      return 'AI指示を作る';
    case 'agent-instruction-ready':
      return 'Agentに渡す';
    case 'agent-working':
      return 'PRを探す';
    case 'pr-detected':
      return 'CIを確認する';
    case 'ci-checking':
      return 'CIを確認する';
    case 'preview-ready':
      return 'Previewを見る';
    case 'review-needed':
      return '人間確認する';
    case 'phase-complete':
      return '次のPhaseへ';
  }
}

export function buildDarakeWorkSession(
  input: Partial<DarakeWorkSession> & Pick<DarakeWorkSession, 'appName' | 'oneLineIdea'>,
): DarakeWorkSession {
  const status = isValidStatus(input.status) ? input.status : 'idea';
  return {
    id: sanitizeText(input.id) || makeId(),
    appName: sanitizeText(input.appName) || '新しいアプリ',
    oneLineIdea: sanitizeText(input.oneLineIdea) || 'アイデアを整理する',
    repoUrl: sanitizeRepoUrl(input.repoUrl),
    issueUrl: sanitizeIssueUrl(input.issueUrl),
    issueNumber: sanitizePositiveNumber(input.issueNumber),
    prUrl: sanitizePrUrl(input.prUrl),
    prNumber: sanitizePositiveNumber(input.prNumber),
    previewUrl: sanitizePreviewUrl(sanitizeOptionalText(input.previewUrl)),
    currentPhaseTitle: sanitizeOptionalText(input.currentPhaseTitle),
    currentInstruction: sanitizeOptionalText(input.currentInstruction),
    status,
    nextActionLabel: sanitizeText(input.nextActionLabel) || defaultNextActionLabel(status),
    updatedAt: sanitizeText(input.updatedAt) || new Date().toISOString(),
  };
}

function normalizeCurrentWorkSession(parsed: unknown): DarakeWorkSession | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const candidate = parsed as Partial<DarakeWorkSession>;
  const appName = sanitizeText(candidate.appName);
  const oneLineIdea = sanitizeText(candidate.oneLineIdea);
  if (!appName && !oneLineIdea) return null;
  return buildDarakeWorkSession({
    ...candidate,
    appName: appName || '新しいアプリ',
    oneLineIdea: oneLineIdea || 'アイデアを整理する',
  });
}

function normalizeHistory(parsed: unknown): DarakeWorkSession[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((item) => normalizeCurrentWorkSession(item))
    .filter((item): item is DarakeWorkSession => item !== null);
}

function emitUpdated(): void {
  emitDarakeRuntimeEvent(DARAKE_FIRST_APP_START_UPDATED_EVENT);
}

export function loadCurrentWorkSession(): DarakeWorkSession | null {
  try {
    const raw = localStorage.getItem(DARAKE_WORK_SESSION_CURRENT_KEY);
    if (!raw) return null;
    return normalizeCurrentWorkSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveCurrentWorkSession(session: DarakeWorkSession): DarakeWorkSession {
  const normalized = buildDarakeWorkSession(session);
  try {
    localStorage.setItem(DARAKE_WORK_SESSION_CURRENT_KEY, JSON.stringify(normalized));
    emitUpdated();
  } catch {
    // ignore
  }
  return normalized;
}

export function clearCurrentWorkSession(): void {
  try {
    localStorage.removeItem(DARAKE_WORK_SESSION_CURRENT_KEY);
    emitUpdated();
  } catch {
    // ignore
  }
}

export function loadWorkSessionHistory(): DarakeWorkSession[] {
  try {
    const raw = localStorage.getItem(DARAKE_WORK_SESSION_HISTORY_KEY);
    if (!raw) return [];
    return normalizeHistory(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function appendWorkSessionHistory(session: DarakeWorkSession): DarakeWorkSession[] {
  const normalized = buildDarakeWorkSession(session);
  const history = loadWorkSessionHistory().filter((item) => item.id !== normalized.id);
  const next = [normalized, ...history].slice(0, 20);
  try {
    localStorage.setItem(DARAKE_WORK_SESSION_HISTORY_KEY, JSON.stringify(next));
    emitUpdated();
  } catch {
    // ignore
  }
  return next;
}

export function parseGitHubIssueInput(input: string, repoUrl?: string | null): {
  issueNumber: number | null;
  issueUrl: string | null;
  repoUrl: string | null;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { issueNumber: null, issueUrl: null, repoUrl: sanitizeRepoUrl(repoUrl) };
  }

  const issueNumberOnly = sanitizePositiveNumber(trimmed);
  const safeRepoUrl = sanitizeRepoUrl(repoUrl);
  if (issueNumberOnly) {
    return {
      issueNumber: issueNumberOnly,
      issueUrl: safeRepoUrl ? `${safeRepoUrl}/issues/${issueNumberOnly}` : null,
      repoUrl: safeRepoUrl,
    };
  }

  const match = trimmed.match(/^(https:\/\/github\.com\/[^/]+\/[^/]+)\/issues\/(\d+)\/?$/i);
  if (!match) {
    return { issueNumber: null, issueUrl: null, repoUrl: safeRepoUrl };
  }

  return {
    issueNumber: Number.parseInt(match[2] ?? '', 10) || null,
    issueUrl: match[0],
    repoUrl: match[1] ?? safeRepoUrl,
  };
}

export function parseGitHubPrInput(input: string, repoUrl?: string | null): {
  prNumber: number | null;
  prUrl: string | null;
  repoUrl: string | null;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    return { prNumber: null, prUrl: null, repoUrl: sanitizeRepoUrl(repoUrl) };
  }

  const prNumberOnly = sanitizePositiveNumber(trimmed);
  const safeRepoUrl = sanitizeRepoUrl(repoUrl);
  if (prNumberOnly) {
    return {
      prNumber: prNumberOnly,
      prUrl: safeRepoUrl ? `${safeRepoUrl}/pull/${prNumberOnly}` : null,
      repoUrl: safeRepoUrl,
    };
  }

  const match = trimmed.match(/^(https:\/\/github\.com\/[^/]+\/[^/]+)\/pull\/(\d+)\/?$/i);
  if (!match) {
    return { prNumber: null, prUrl: null, repoUrl: safeRepoUrl };
  }

  return {
    prNumber: Number.parseInt(match[2] ?? '', 10) || null,
    prUrl: match[0],
    repoUrl: match[1] ?? safeRepoUrl,
  };
}

export function hasActiveWorkSession(session: DarakeWorkSession | null): boolean {
  return Boolean(session && session.status !== 'phase-complete');
}
