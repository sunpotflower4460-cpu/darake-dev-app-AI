import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

const sourcePath = path.resolve('src/utils/previewUrlExtractor.ts');
const sourceText = fs.readFileSync(sourcePath, 'utf8');
const transpiled = ts.transpileModule(sourceText, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const moduleRef = { exports: {} };
vm.runInNewContext(
  transpiled.outputText,
  {
    module: moduleRef,
    exports: moduleRef.exports,
    console,
    process,
    URL,
  },
  { filename: sourcePath },
);

const { extractPreviewUrls, isAllowedPreviewUrl } = moduleRef.exports;
if (typeof extractPreviewUrls !== 'function' || typeof isAllowedPreviewUrl !== 'function') {
  throw new Error('extractPreviewUrls / isAllowedPreviewUrl が見つかりません');
}

const cases = [
  { input: 'https://example.pages.dev', expected: ['https://example.pages.dev/'] },
  { input: 'https://abc.workers.dev/path', expected: ['https://abc.workers.dev/path'] },
  { input: 'https://demo.vercel.app', expected: ['https://demo.vercel.app/'] },
  { input: 'https://sample.netlify.app', expected: ['https://sample.netlify.app/'] },
  { input: 'javascript:alert(1)', expected: [] },
  { input: 'data:text/html,<h1>x</h1>', expected: [] },
  { input: 'ただの文章', expected: [] },
  {
    input: 'https://dup.pages.dev https://dup.pages.dev',
    expected: ['https://dup.pages.dev/'],
  },
  {
    input: 'http://example.pages.dev',
    expected: ['https://example.pages.dev/'],
  },
];

let failed = 0;
for (const testCase of cases) {
  const actual = extractPreviewUrls(testCase.input);
  const passed = JSON.stringify(actual) === JSON.stringify(testCase.expected);
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testCase.input} => ${JSON.stringify(actual)}`);
  if (!passed) {
    failed += 1;
    console.log(`  expected: ${JSON.stringify(testCase.expected)}`);
  }
}

if (failed > 0) {
  console.error(`previewUrlExtractor smoke test failed: ${failed} case(s).`);
  process.exit(1);
}

const allowedChecks = [
  { input: 'https://example.pages.dev', expected: true },
  { input: 'http://example.pages.dev', expected: false },
  { input: 'javascript:alert(1)', expected: false },
  { input: 'data:text/html,<h1>x</h1>', expected: false },
];

for (const check of allowedChecks) {
  const actual = isAllowedPreviewUrl(check.input);
  const passed = actual === check.expected;
  console.log(`[${passed ? 'PASS' : 'FAIL'}] allowed ${check.input} => ${actual}`);
  if (!passed) {
    failed += 1;
    console.log(`  expected: ${check.expected}`);
  }
}

if (failed > 0) {
  console.error(`previewUrlExtractor smoke test failed: ${failed} case(s).`);
  process.exit(1);
}

console.log(`previewUrlExtractor smoke test passed: ${cases.length + allowedChecks.length} case(s).`);
