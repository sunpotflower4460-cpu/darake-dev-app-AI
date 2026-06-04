import { describe, expect, it } from 'vitest';
import {
  extractFirstPreviewUrl,
  extractPreviewUrls,
  isAllowedPreviewUrl,
} from '../utils/previewUrlExtractor';

describe('previewUrlExtractor', () => {
  const extractCases = [
    { input: 'https://example.pages.dev', expected: ['https://example.pages.dev/'] },
    { input: 'https://abc.workers.dev/path', expected: ['https://abc.workers.dev/path'] },
    { input: 'https://demo.vercel.app', expected: ['https://demo.vercel.app/'] },
    { input: 'https://sample.netlify.app', expected: ['https://sample.netlify.app/'] },
    { input: 'javascript:alert(1)', expected: [] },
    { input: 'data:text/html,<h1>x</h1>', expected: [] },
    { input: 'ただの文章', expected: [] },
    { input: 'https://dup.pages.dev https://dup.pages.dev', expected: ['https://dup.pages.dev/'] },
    { input: 'http://example.pages.dev', expected: ['https://example.pages.dev/'] },
  ];

  it.each(extractCases)('extracts smoke case: %s', ({ input, expected }) => {
    expect(extractPreviewUrls(input)).toEqual(expected);
  });

  const allowedCases = [
    { input: 'https://example.pages.dev', expected: true },
    { input: 'http://example.pages.dev', expected: false },
    { input: 'javascript:alert(1)', expected: false },
    { input: 'data:text/html,<h1>x</h1>', expected: false },
  ];

  it.each(allowedCases)('checks allowed url: %s', ({ input, expected }) => {
    expect(isAllowedPreviewUrl(input)).toBe(expected);
  });

  it('extracts first preview url', () => {
    expect(extractFirstPreviewUrl('x https://a.pages.dev and https://b.pages.dev')).toBe('https://a.pages.dev/');
  });
});
