// だらけ自動検証スクリプト (生成プロジェクト側で動く)
//
// プレビューURLのスクリーンショットを撮り、リポジトリにコミットされた
// 設計参照画像 (darake/design/*.{png,jpg,jpeg,webp}) と一緒に
// だらけWorkerの /api/darake/verify/compare-screenshots に送って判定する。
//
// 出力:
//   artifacts/darake-verify-comment.md  … PRに貼るコメント本文
//   GITHUB_OUTPUT に verdict=pass|fail, score=<n>
//
// 必要な環境変数:
//   DARAKE_WORKER_URL  … 例: https://darakedevapp.example.workers.dev
//   PREVIEW_URL        … 例: https://<hash>.<project>.pages.dev
//   PROJECT_ID         … 履歴グルーピング用 (省略時 repo名)
//   ROUTES             … カンマ区切りの相対パス。省略時 "/"
//   DESIGN_DIR         … 設計参照ディレクトリ。省略時 "darake/design"
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const WORKER_URL = (process.env.DARAKE_WORKER_URL ?? '').replace(/\/$/, '');
const PREVIEW_URL = (process.env.PREVIEW_URL ?? '').replace(/\/$/, '');
const PROJECT_ID = process.env.PROJECT_ID ?? 'project';
const ROUTES = (process.env.ROUTES ?? '/')
  .split(',')
  .map((r) => r.trim())
  .filter(Boolean);
const DESIGN_DIR = process.env.DESIGN_DIR ?? 'darake/design';
const OUT_DIR = 'artifacts/darake-verify';
const COMMENT_PATH = 'artifacts/darake-verify-comment.md';

const ACCEPTED = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function fail(msg) {
  console.error(`[darake-verify] ${msg}`);
  process.exit(1);
}

function mediaTypeFor(ext) {
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

async function setOutput(key, value) {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  await fs.appendFile(file, `${key}=${value}\n`);
}

async function loadDesignAssets() {
  let entries;
  try {
    entries = await fs.readdir(DESIGN_DIR);
  } catch {
    fail(`設計参照ディレクトリが見つかりません: ${DESIGN_DIR} (設計画像を ${DESIGN_DIR}/ にコミットしてください)`);
  }
  const assets = [];
  for (const name of entries.sort()) {
    const ext = path.extname(name).toLowerCase();
    if (!ACCEPTED.has(ext)) continue;
    const buf = await fs.readFile(path.join(DESIGN_DIR, name));
    assets.push({ mediaType: mediaTypeFor(ext), base64: buf.toString('base64'), label: name });
  }
  if (assets.length === 0) fail(`設計参照画像が ${DESIGN_DIR}/ にありません`);
  return assets;
}

async function capture() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const shots = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    for (let i = 0; i < ROUTES.length && i < 6; i += 1) {
      const route = ROUTES[i];
      const url = `${PREVIEW_URL}${route.startsWith('/') ? route : `/${route}`}`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1200);
      const filePath = path.join(OUT_DIR, `shot-${i + 1}.png`);
      const buf = await page.screenshot({ path: filePath, fullPage: true });
      shots.push({ mediaType: 'image/png', base64: buf.toString('base64'), label: route });
    }
  } finally {
    await browser.close();
  }
  return shots;
}

async function main() {
  if (!WORKER_URL) fail('DARAKE_WORKER_URL が未設定です');
  if (!PREVIEW_URL) fail('PREVIEW_URL が未設定です');

  const designAssets = await loadDesignAssets();
  const capturedScreenshots = await capture();

  const res = await fetch(`${WORKER_URL}/api/darake/verify/compare-screenshots`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      projectId: PROJECT_ID,
      capturedScreenshots,
      designAssets,
      prContext: { previewUrl: PREVIEW_URL },
    }),
  });

  const json = await res.json().catch(() => null);
  if (!json || !json.ok) {
    const code = json?.code ?? res.status;
    const error = json?.error ?? 'unknown';
    const body = [
      '## だらけ自動検証: エラー',
      '',
      `判定を実行できませんでした: [${code}] ${error}`,
      '',
      '_Worker側の設定 (ANTHROPIC_API_KEY / DARAKE_VISION_VERIFY_ENABLED) を確認してください。_',
    ].join('\n');
    await fs.writeFile(COMMENT_PATH, body);
    await setOutput('verdict', 'error');
    await setOutput('score', '0');
    fail(`判定API失敗: [${code}] ${error}`);
  }

  const result = json.result;
  await fs.writeFile(COMMENT_PATH, result.fixRequestComment ?? '(コメントなし)');
  await setOutput('verdict', result.pass ? 'pass' : 'fail');
  await setOutput('score', String(result.score));
  console.log(`[darake-verify] verdict=${result.pass ? 'pass' : 'fail'} score=${result.score}`);
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));
