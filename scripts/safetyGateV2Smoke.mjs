import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const sourcePath = path.resolve('src/utils/safetyGateV2.ts');
const sourceText = fs.readFileSync(sourcePath, 'utf8');
const transpiled = ts.transpileModule(sourceText, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
});

const moduleRef = { exports: {} };
const sandbox = {
  module: moduleRef,
  exports: moduleRef.exports,
  require,
  __dirname: path.dirname(sourcePath),
  __filename: sourcePath,
  console,
  process,
};
vm.runInNewContext(transpiled.outputText, sandbox, { filename: sourcePath });

const { runSafetyGateV2TestCases } = moduleRef.exports;
if (typeof runSafetyGateV2TestCases !== 'function') {
  throw new Error('runSafetyGateV2TestCases が見つかりません');
}

const results = runSafetyGateV2TestCases();
let failed = 0;
for (const row of results) {
  const expected = Array.isArray(row.expected) ? row.expected.join('|') : row.expected;
  const status = row.passed ? 'PASS' : 'FAIL';
  if (!row.passed) failed += 1;
  console.log(`[${status}] ${row.input} => ${row.actual} (expected: ${expected})`);
}

if (failed > 0) {
  console.error(`SafetyGateV2 smoke test failed: ${failed} case(s).`);
  process.exit(1);
}

console.log(`SafetyGateV2 smoke test passed: ${results.length} case(s).`);
