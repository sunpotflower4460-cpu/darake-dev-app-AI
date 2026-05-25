// だらけ最終完成判定スクリプト (生成プロジェクト側)
//
// main の最新プレビューURLでアプリ全体のスクショを撮り、設計参照画像と一緒に
// だらけWorkerの /api/darake/verify/final-check に送って2パス完成判定する。
//
// 必要な環境変数:
//   DARAKE_WORKER_URL, PREVIEW_URL, PROJECT_ID, ROUTES(任意), DESIGN_DIR(任意)
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const WORKER_URL = (process.env.DARAKE_WORKER_URL ?? '').replace(/\/$/, '');
const PREVIEW_URL = (process.env.PREVIEW_URL ?? '').replace(/\/$/, '');
const PROJECT_ID = process.env.PROJECT_ID ?? 'project';
const ROUTES = (process.env.ROUTES ?? '/').split(',').map((r) => r.trim()).filter(Boolean);
const DESIGN_DIR = process.env.DESIGN_DIR ?? 'darake/design';
const OUT_DIR = 'artifacts/darake-final';
const ACCEPTED = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function fail(msg) {
  console.error(`[darake-final] ${msg}`);
  process.exit(1);
}

function mediaTypeFor(ext) {
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

async function setOutput(key, value) {
  const file = process.env.GITHUB_OUTPUT;
  if (file) await fs.appendFile(file, `${key}=${value}\n`);
}

async function loadDesign() {
  let entries;
  try {
    entries = await fs.readdir(DESIGN_DIR);
  } catch {
    fail(`設計参照ディレクトリが見つかりません: ${DESIGN_DIR}`);
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
    for (let i = 0; i < ROUTES.length && i < 8; i += 1) {
      const route = ROUTES[i];
      const url = `${PREVIEW_URL}${route.startsWith('/') ? route : `/${route}`}`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1200);
      const buf = await page.screenshot({ path: path.join(OUT_DIR, `final-${i + 1}.png`), fullPage: true });
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

  const designAssets = await loadDesign();
  const capturedScreenshots = await capture();

  const res = await fetch(`${WORKER_URL}/api/darake/verify/final-check`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ projectId: PROJECT_ID, previewUrl: PREVIEW_URL, designAssets, capturedScreenshots }),
  });
  const json = await res.json().catch(() => null);
  if (!json || !json.ok) {
    await setOutput('complete', 'error');
    fail(`完成判定API失敗: [${json?.code ?? res.status}] ${json?.error ?? 'unknown'}`);
  }

  const r = json.result;
  await setOutput('complete', r.complete ? 'true' : 'false');
  await setOutput('score', String(r.score));
  console.log(`[darake-final] complete=${r.complete} score=${r.score} blockers=${r.blockers.length}`);
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));
