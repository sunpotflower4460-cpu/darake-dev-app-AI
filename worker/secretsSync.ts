import nacl from 'tweetnacl';
import { blake2b } from 'blakejs';
import { isAllowedRepoAsync } from './repoAllowlist';
import { appendAudit } from './auditLog';

type SecretsSyncEnv = {
  GITHUB_TOKEN?: string;
  GITHUB_ALLOWED_REPOS?: string;
  DARAKE_SECRET_SYNC_ENABLED?: string;
  RUN_REGISTRY_KV?: KVNamespace;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function ghHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'darake-dev-app-ai',
    'Content-Type': 'application/json',
  };
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/** libsodium crypto_box_seal compatible with GitHub's encrypted secrets. */
function sealForGitHub(secretValue: string, recipientPublicKeyB64: string): string {
  const recipientPk = base64ToBytes(recipientPublicKeyB64);
  const message = new TextEncoder().encode(secretValue);

  const ephemeral = nacl.box.keyPair();
  const nonceInput = new Uint8Array(ephemeral.publicKey.length + recipientPk.length);
  nonceInput.set(ephemeral.publicKey, 0);
  nonceInput.set(recipientPk, ephemeral.publicKey.length);
  const nonce = blake2b(nonceInput, undefined, 24);

  const boxed = nacl.box(message, nonce, recipientPk, ephemeral.secretKey);
  const sealed = new Uint8Array(ephemeral.publicKey.length + boxed.length);
  sealed.set(ephemeral.publicKey, 0);
  sealed.set(boxed, ephemeral.publicKey.length);
  return bytesToBase64(sealed);
}

function repoParts(fullName: string): { owner: string; repo: string } | null {
  const m = fullName.trim().replace(/^https?:\/\//, '').replace(/^github\.com\//, '').match(/^([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

const SECRET_NAME_RE = /^[A-Z][A-Z0-9_]{0,99}$/;

export async function handleSecretsSync(request: Request, env: SecretsSyncEnv): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'POSTだけ使えます' }, 405);
  }
  if (env.DARAKE_SECRET_SYNC_ENABLED !== 'true') {
    return json(
      { ok: false, code: 'DISABLED', error: 'Secret同期はまだ有効化されていません (コードレビュー後に有効化)' },
      403,
    );
  }
  if (!env.GITHUB_TOKEN) {
    return json({ ok: false, code: 'MISSING_TOKEN', error: 'GITHUB_TOKENが未設定です' }, 500);
  }

  let body: { repoFullName?: unknown; secrets?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'JSONを読み取れません' }, 400);
  }

  const repoFullName = String(body.repoFullName ?? '').trim();
  const parts = repoParts(repoFullName);
  if (!parts) {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'repoFullNameは owner/repo 形式で渡してください' }, 400);
  }
  if (!(await isAllowedRepoAsync(`${parts.owner}/${parts.repo}`, env))) {
    return json({ ok: false, code: 'REPO_NOT_ALLOWED', error: 'このリポジトリは許可リストに入っていません' }, 403);
  }

  const rawSecrets = Array.isArray(body.secrets) ? body.secrets : [];
  if (rawSecrets.length === 0 || rawSecrets.length > 30) {
    return json({ ok: false, code: 'INVALID_INPUT', error: 'secretsは1〜30件で渡してください' }, 400);
  }
  const secrets: Array<{ name: string; value: string }> = [];
  for (const item of rawSecrets) {
    const i = (item ?? {}) as { name?: unknown; value?: unknown };
    const name = String(i.name ?? '');
    const value = String(i.value ?? '');
    if (!SECRET_NAME_RE.test(name)) {
      return json(
        { ok: false, code: 'INVALID_INPUT', error: `secret名が不正です: ${name.slice(0, 40)} (大文字英数と_のみ)` },
        400,
      );
    }
    if (!value || value.length > 64000) {
      return json({ ok: false, code: 'INVALID_INPUT', error: `${name} の値が空か長すぎます` }, 400);
    }
    secrets.push({ name, value });
  }

  // 1. Fetch the repo's public key once.
  const pkRes = await fetch(
    `https://api.github.com/repos/${parts.owner}/${parts.repo}/actions/secrets/public-key`,
    { headers: ghHeaders(env.GITHUB_TOKEN) },
  );
  const pkJson = (await pkRes.json().catch(() => null)) as { key?: string; key_id?: string } | null;
  if (!pkRes.ok || !pkJson?.key || !pkJson.key_id) {
    return json(
      { ok: false, code: 'GITHUB_ERROR', error: 'リポジトリ公開鍵の取得に失敗しました' },
      pkRes.status >= 400 && pkRes.status < 600 ? pkRes.status : 502,
    );
  }

  // 2. Encrypt + PUT each secret. Never log values.
  const results: Array<{ name: string; ok: boolean; error?: string }> = [];
  for (const secret of secrets) {
    try {
      const encrypted_value = sealForGitHub(secret.value, pkJson.key);
      const putRes = await fetch(
        `https://api.github.com/repos/${parts.owner}/${parts.repo}/actions/secrets/${secret.name}`,
        {
          method: 'PUT',
          headers: ghHeaders(env.GITHUB_TOKEN),
          body: JSON.stringify({ encrypted_value, key_id: pkJson.key_id }),
        },
      );
      results.push({ name: secret.name, ok: putRes.ok, error: putRes.ok ? undefined : `status ${putRes.status}` });
    } catch (e) {
      results.push({ name: secret.name, ok: false, error: (e as Error).message });
    }
  }

  // Wipe plaintext references.
  for (const s of secrets) s.value = '';

  const failed = results.filter((r) => !r.ok);
  await appendAudit(env, {
    scope: `${parts.owner}/${parts.repo}`,
    kind: 'secrets-sync',
    message: `synced ${results.length - failed.length}/${results.length} (names only)`,
    meta: { names: results.map((r) => r.name).join(',') },
  });

  return json({
    ok: failed.length === 0,
    synced: results.filter((r) => r.ok).map((r) => r.name),
    failed: failed.map((r) => ({ name: r.name, error: r.error })),
  });
}
