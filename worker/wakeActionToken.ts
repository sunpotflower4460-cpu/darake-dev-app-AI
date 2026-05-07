import type { WakeActionKind, WakeActionTokenRecord } from '../src/utils/wakeActionTypes';

export type { WakeActionKind, WakeActionTokenRecord };

const TOKEN_PREFIX = 'wake-action:';
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export function generateTokenId(): string {
  return `wat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function saveWakeActionToken(
  kv: KVNamespace,
  token: WakeActionTokenRecord,
): Promise<void> {
  await kv.put(`${TOKEN_PREFIX}${token.tokenId}`, JSON.stringify(token), {
    expirationTtl: TOKEN_TTL_SECONDS,
  });
}

export async function getWakeActionToken(
  kv: KVNamespace,
  tokenId: string,
): Promise<WakeActionTokenRecord | null> {
  const raw = await kv.get(`${TOKEN_PREFIX}${tokenId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WakeActionTokenRecord;
  } catch {
    return null;
  }
}

export async function markWakeActionTokenUsed(
  kv: KVNamespace,
  token: WakeActionTokenRecord,
): Promise<void> {
  const updated: WakeActionTokenRecord = {
    ...token,
    usedAt: new Date().toISOString(),
  };
  // Keep remaining TTL (re-save with original expiry; KV will honour expirationTtl from now)
  const remainingMs = new Date(token.expiresAt).getTime() - Date.now();
  const remainingSec = Math.max(60, Math.floor(remainingMs / 1000));
  await kv.put(`${TOKEN_PREFIX}${token.tokenId}`, JSON.stringify(updated), {
    expirationTtl: remainingSec,
  });
}

export function createWakeActionToken(
  params: Omit<WakeActionTokenRecord, 'tokenId' | 'expiresAt' | 'createdAt'>,
): WakeActionTokenRecord {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_SECONDS * 1000).toISOString();
  return {
    ...params,
    tokenId: generateTokenId(),
    expiresAt,
    createdAt: now.toISOString(),
  };
}

export function isTokenExpired(token: WakeActionTokenRecord): boolean {
  return Date.now() > new Date(token.expiresAt).getTime();
}

/**
 * Actions that are absolutely forbidden from execution via wake action.
 * These must never be automated even when a token is present.
 */
export const FORBIDDEN_ACTION_KINDS = new Set<string>([
  'merge',
  'approve',
  'request-changes',
  'push-main',
  'workflow-dispatch',
  'secret-change',
  'token-issue',
  'billing-change',
  'app-store-submit',
  'db-change',
  'auth-change',
]);

/**
 * Actions that the run endpoint can execute.
 */
export const EXECUTABLE_ACTION_KINDS = new Set<WakeActionKind>(['send-fix-request']);
