import { describe, expect, it } from 'vitest';
import { AI_EXECUTION_CANDIDATE_DRAFTS } from '../utils/aiExecutionCandidateDraft';
import { buildAiManualCopyPrompt } from '../utils/aiManualCopyPrompt';

describe('aiManualCopyPrompt', () => {
  it('always includes mandatory safety instructions', () => {
    const draft = AI_EXECUTION_CANDIDATE_DRAFTS.find((item) => item.provider === 'openai');
    expect(draft).toBeTruthy();

    const prompt = buildAiManualCopyPrompt({ draft: draft!, purpose: 'PRレビューの補助' });
    expect(prompt).toContain('このアプリから外部AI APIへ送信はしません');
    expect(prompt).toContain('API key / token / secret は貼らないでください');
    expect(prompt).toContain('private情報や個人情報は貼る前に人間が確認');
    expect(prompt).toContain('AIの回答は自動採用せず、人間が確認');
  });

  it('includes provider-specific focus for openai', () => {
    const draft = AI_EXECUTION_CANDIDATE_DRAFTS.find((item) => item.provider === 'openai');
    const prompt = buildAiManualCopyPrompt({ draft: draft!, purpose: 'PRレビューの補助' });
    expect(prompt).toContain('総合レビュー向け');
  });

  it('supports manual-ai as default-safe candidate', () => {
    const draft = AI_EXECUTION_CANDIDATE_DRAFTS.find((item) => item.provider === 'manual-ai');
    const prompt = buildAiManualCopyPrompt({ draft: draft!, purpose: '安全な手動コピー導線の確認' });
    expect(prompt).toContain('既定の安全候補');
    expect(prompt).toContain('requiredSecrets: なし');
  });
});

