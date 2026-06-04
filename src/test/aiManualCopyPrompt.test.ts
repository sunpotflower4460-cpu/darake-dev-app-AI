import { describe, expect, it } from 'vitest';
import { AI_EXECUTION_CANDIDATE_DRAFTS } from '../utils/aiExecutionCandidateDraft';
import type { AiProviderId } from '../utils/aiProviderCandidates';
import { buildAiManualCopyPrompt } from '../utils/aiManualCopyPrompt';

function getDraft(provider: AiProviderId) {
  const draft = AI_EXECUTION_CANDIDATE_DRAFTS.find((item) => item.provider === provider);
  if (!draft) {
    throw new Error(`Missing draft for provider: ${provider}`);
  }
  return draft;
}

describe('aiManualCopyPrompt', () => {
  it('always includes mandatory safety instructions', () => {
    const prompt = buildAiManualCopyPrompt({ draft: getDraft('openai'), purpose: 'PRレビューの補助' });
    expect(prompt).toContain('このアプリから外部AI APIへ送信はしません');
    expect(prompt).toContain('API key / token / secret は貼らないでください');
    expect(prompt).toContain('private情報や個人情報は貼る前に人間が確認');
    expect(prompt).toContain('AIの回答は自動採用せず、人間が確認');
  });

  it('includes provider-specific focus for openai', () => {
    const prompt = buildAiManualCopyPrompt({ draft: getDraft('openai'), purpose: 'PRレビューの補助' });
    expect(prompt).toContain('総合レビュー向け');
  });

  it('supports manual-ai as default-safe candidate', () => {
    const prompt = buildAiManualCopyPrompt({ draft: getDraft('manual-ai'), purpose: '安全な手動コピー導線の確認' });
    expect(prompt).toContain('既定の安全候補');
    expect(prompt).toContain('requiredSecrets: なし（この候補はAPI key入力不要）');
  });
});
