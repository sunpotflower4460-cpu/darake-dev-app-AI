import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const PLAN_JSON = process.env.PLAN_JSON ?? '';
const CONFIRM_CAPTURE = process.env.CONFIRM_CAPTURE ?? '';
const MAX_TARGETS_RAW = process.env.MAX_TARGETS ?? '1';
const OUT_DIR = process.env.OUT_DIR ?? 'artifacts/screenshots';
const MANIFEST_PATH = process.env.MANIFEST_PATH ?? 'artifacts/screenshot-capture-manifest.json';

const REQUIRED_CONFIRMATION = 'CAPTURE_LIMITED_APPROVED';
const SCHEMA_VERSION = 'darake-screenshot-plan-v1';
const CAPTURE_SCHEMA_VERSION = 'darake-screenshot-capture-manifest-v1';
const PRIVATE_TEXT_PATTERN = /(secret|token|cookie|password|private[_-]?key|api[_-]?key|authorization|bearer)/i;

function stop(message) {
  console.error(message);
  process.exit(1);
}

function parseMaxTargets(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || ![1, 2].includes(parsed)) {
    stop('max_targets must be 1 or 2.');
  }
  return parsed;
}

function assertNoPrivateText(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (PRIVATE_TEXT_PATTERN.test(text)) {
    stop('plan_json appears to include private credential-like text. Stop before capture.');
  }
}

function parsePlan() {
  if (!PLAN_JSON.trim()) {
    stop('PLAN_JSON is empty.');
  }

  assertNoPrivateText(PLAN_JSON);

  try {
    return JSON.parse(PLAN_JSON);
  } catch (error) {
    stop(`PLAN_JSON is invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function validatePlan(plan) {
  if (CONFIRM_CAPTURE !== REQUIRED_CONFIRMATION) {
    stop(`confirm_capture must be ${REQUIRED_CONFIRMATION}.`);
  }

  if (plan.schemaVersion !== SCHEMA_VERSION) {
    stop(`schemaVersion must be ${SCHEMA_VERSION}.`);
  }

  if (plan.runner?.mode !== 'draft-only') {
    stop('runner.mode must remain draft-only in the source plan.');
  }

  if (plan.runner?.shouldRunAutomatically !== false) {
    stop('runner.shouldRunAutomatically must be false.');
  }

  if (!plan.source?.baseUrl || typeof plan.source.baseUrl !== 'string') {
    stop('source.baseUrl is required.');
  }

  if (!Array.isArray(plan.targets) || plan.targets.length === 0) {
    stop('plan.targets must include at least one ready target.');
  }

  assertNoPrivateText(plan);
}

function sanitizeOutputName(value, fallback) {
  const safe = String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  return safe.endsWith('.png') ? safe : `${safe || fallback}.png`;
}

function validateTarget(target, index) {
  if (!target || typeof target !== 'object') {
    stop(`target #${index + 1} is invalid.`);
  }

  if (!target.url || typeof target.url !== 'string') {
    stop(`target #${index + 1} has no url.`);
  }

  const url = new URL(target.url);
  if (!['https:', 'http:'].includes(url.protocol)) {
    stop(`target #${index + 1} must be http or https.`);
  }

  if (!target.viewport || typeof target.viewport !== 'object') {
    stop(`target #${index + 1} has no viewport.`);
  }

  const width = Number(target.viewport.width);
  const height = Number(target.viewport.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 320 || height < 480 || width > 2400 || height > 2400) {
    stop(`target #${index + 1} viewport is outside safe bounds.`);
  }

  return { url, width, height };
}

async function main() {
  const maxTargets = parseMaxTargets(MAX_TARGETS_RAW);
  const plan = parsePlan();
  validatePlan(plan);

  const targets = plan.targets.slice(0, maxTargets);
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const [index, target] of targets.entries()) {
      const { width, height } = validateTarget(target, index);
      const page = await browser.newPage({ viewport: { width, height } });
      const outputName = sanitizeOutputName(target.outputName, `target-${index + 1}.png`);
      const outputPath = path.join(OUT_DIR, outputName);

      try {
        await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30_000 });
        await page.screenshot({ path: outputPath, fullPage: true });
        results.push({
          targetId: target.id ?? `target-${index + 1}`,
          targetLabel: target.label ?? '',
          targetPath: target.pagePath ?? '',
          targetUrl: target.url,
          viewportName: target.viewport.label ?? '',
          viewportWidth: width,
          viewportHeight: height,
          imagePath: outputPath,
          status: 'success',
          notes: 'Captured by limited manual workflow.',
        });
      } catch (error) {
        results.push({
          targetId: target.id ?? `target-${index + 1}`,
          targetLabel: target.label ?? '',
          targetPath: target.pagePath ?? '',
          targetUrl: target.url,
          viewportName: target.viewport.label ?? '',
          viewportWidth: width,
          viewportHeight: height,
          imagePath: outputPath,
          status: 'failed',
          notes: error instanceof Error ? error.message : String(error),
        });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  const manifest = {
    schemaVersion: CAPTURE_SCHEMA_VERSION,
    capturedAt: new Date().toISOString(),
    source: {
      baseUrl: plan.source.baseUrl,
      title: plan.source.title ?? '',
    },
    requestedTargetCount: plan.targets.length,
    maxTargets,
    capturedCount: results.filter((item) => item.status === 'success').length,
    failedCount: results.filter((item) => item.status === 'failed').length,
    results,
    safetyNotes: [
      'This capture was manually gated.',
      'max_targets is limited to 1 or 2.',
      'Only ready targets from the plan are used.',
    ],
  };

  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(manifest, null, 2));

  if (manifest.failedCount > 0) {
    stop('One or more screenshots failed. See manifest artifact.');
  }
}

main().catch((error) => {
  stop(error instanceof Error ? error.stack || error.message : String(error));
});
