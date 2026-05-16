import { extractPreviewUrls, extractFirstPreviewUrl } from './previewUrlExtractor';

export type PreviewUrlTestResult = {
  name: string;
  passed: boolean;
  actual: unknown;
  expected: unknown;
};

function eq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Run all preview URL extractor tests.
 * Can be called from scripts/previewUrlExtractorSmoke.mjs or a future test runner.
 */
export function runPreviewUrlExtractorTests(): PreviewUrlTestResult[] {
  const results: PreviewUrlTestResult[] = [];

  function check(name: string, actual: unknown, expected: unknown): void {
    results.push({ name, passed: eq(actual, expected), actual, expected });
  }

  // Detection cases
  check(
    'pages.dev detected',
    extractPreviewUrls('https://example.pages.dev'),
    ['https://example.pages.dev'],
  );

  check(
    'workers.dev with path detected',
    extractPreviewUrls('https://abc.workers.dev/path'),
    ['https://abc.workers.dev/path'],
  );

  check(
    'vercel.app detected',
    extractPreviewUrls('https://demo.vercel.app'),
    ['https://demo.vercel.app'],
  );

  check(
    'netlify.app detected',
    extractPreviewUrls('https://sample.netlify.app'),
    ['https://sample.netlify.app'],
  );

  // Blocked
  check(
    'javascript: not detected',
    extractPreviewUrls('javascript:alert(1)'),
    [],
  );

  // No match
  check(
    'plain text returns empty',
    extractPreviewUrls('just a sentence without urls'),
    [],
  );

  // Deduplication
  const dupText = 'https://example.pages.dev https://example.pages.dev';
  const dupResult = extractPreviewUrls(dupText);
  check(
    'duplicate URL deduplicated',
    dupResult.length === 1 && dupResult[0] === 'https://example.pages.dev',
    true,
  );

  // https preference
  const mixedText = 'http://foo.pages.dev https://foo.pages.dev';
  const mixedResult = extractPreviewUrls(mixedText);
  check(
    'https preferred over http when both present',
    mixedResult.length === 1 && mixedResult[0] === 'https://foo.pages.dev',
    true,
  );

  // extractFirstPreviewUrl
  check(
    'extractFirstPreviewUrl returns first URL',
    extractFirstPreviewUrl('See https://demo.vercel.app for preview'),
    'https://demo.vercel.app',
  );

  check(
    'extractFirstPreviewUrl returns null for no match',
    extractFirstPreviewUrl('no urls here'),
    null,
  );

  return results;
}
