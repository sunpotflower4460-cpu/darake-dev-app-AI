/**
 * Preview URL extractor smoke test.
 * Usage: node scripts/previewUrlExtractorSmoke.mjs
 *
 * Compiles src/utils/previewUrlExtractor.ts at runtime using the TypeScript
 * compiler API (same pattern as safetyGateV2Smoke.mjs), then runs all test
 * cases inline.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);

function compileTs(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });
  return transpiled.outputText;
}

// Custom require that can resolve relative .ts imports
function makeCustomRequire(baseDir) {
  return function customRequire(id) {
    if (id.startsWith('./') || id.startsWith('../')) {
      const resolved = path.resolve(baseDir, id);
      const withTs = resolved.endsWith('.ts') ? resolved : resolved + '.ts';
      if (fs.existsSync(withTs)) {
        const code = compileTs(withTs);
        const mod = { exports: {} };
        const sandbox = {
          module: mod,
          exports: mod.exports,
          require: makeCustomRequire(path.dirname(withTs)),
          __dirname: path.dirname(withTs),
          __filename: withTs,
          console,
          process,
          URL,
        };
        vm.runInNewContext(code, sandbox, { filename: withTs });
        return mod.exports;
      }
    }
    return require(id);
  };
}

const sourcePath = path.resolve('src/utils/previewUrlExtractor.ts');
const code = compileTs(sourcePath);
const moduleRef = { exports: {} };
const sandbox = {
  module: moduleRef,
  exports: moduleRef.exports,
  require: makeCustomRequire(path.dirname(sourcePath)),
  __dirname: path.dirname(sourcePath),
  __filename: sourcePath,
  console,
  process,
  URL,
};
vm.runInNewContext(code, sandbox, { filename: sourcePath });

const { extractPreviewUrls, extractFirstPreviewUrl } = moduleRef.exports;

if (typeof extractPreviewUrls !== 'function') {
  throw new Error('extractPreviewUrls が見つかりません');
}
if (typeof extractFirstPreviewUrl !== 'function') {
  throw new Error('extractFirstPreviewUrl が見つかりません');
}

// Test cases (mirrors previewUrlExtractor.test.ts)
const TEST_CASES = [
  {
    name: 'pages.dev detected',
    actual: () => extractPreviewUrls('https://example.pages.dev'),
    expected: ['https://example.pages.dev'],
  },
  {
    name: 'workers.dev with path detected',
    actual: () => extractPreviewUrls('https://abc.workers.dev/path'),
    expected: ['https://abc.workers.dev/path'],
  },
  {
    name: 'vercel.app detected',
    actual: () => extractPreviewUrls('https://demo.vercel.app'),
    expected: ['https://demo.vercel.app'],
  },
  {
    name: 'netlify.app detected',
    actual: () => extractPreviewUrls('https://sample.netlify.app'),
    expected: ['https://sample.netlify.app'],
  },
  {
    name: 'javascript: not detected',
    actual: () => extractPreviewUrls('javascript:alert(1)'),
    expected: [],
  },
  {
    name: 'plain text returns empty',
    actual: () => extractPreviewUrls('just a sentence'),
    expected: [],
  },
  {
    name: 'duplicate URL deduplicated',
    actual: () => {
      const r = extractPreviewUrls('https://example.pages.dev https://example.pages.dev');
      return r.length === 1 && r[0] === 'https://example.pages.dev';
    },
    expected: true,
  },
  {
    name: 'https preferred over http when both present',
    actual: () => {
      const r = extractPreviewUrls('http://foo.pages.dev https://foo.pages.dev');
      return r.length === 1 && r[0] === 'https://foo.pages.dev';
    },
    expected: true,
  },
  {
    name: 'extractFirstPreviewUrl returns first URL',
    actual: () => extractFirstPreviewUrl('See https://demo.vercel.app for preview'),
    expected: 'https://demo.vercel.app',
  },
  {
    name: 'extractFirstPreviewUrl returns null for no match',
    actual: () => extractFirstPreviewUrl('no urls here'),
    expected: null,
  },
];

let failed = 0;
for (const tc of TEST_CASES) {
  const actual = tc.actual();
  const passed = JSON.stringify(actual) === JSON.stringify(tc.expected);
  const status = passed ? 'PASS' : 'FAIL';
  if (!passed) {
    failed += 1;
    console.log(`[${status}] ${tc.name}`);
    console.log(`        actual  : ${JSON.stringify(actual)}`);
    console.log(`        expected: ${JSON.stringify(tc.expected)}`);
  } else {
    console.log(`[${status}] ${tc.name}`);
  }
}

if (failed > 0) {
  console.error(`\npreviewUrlExtractor smoke test failed: ${failed} case(s).`);
  process.exit(1);
}

console.log(`\npreviewUrlExtractor smoke test passed: ${TEST_CASES.length} case(s).`);
