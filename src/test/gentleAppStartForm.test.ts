import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildEmptyGentleAppStartForm,
  clearGentleAppStartForm,
  loadGentleAppStartForm,
  saveGentleAppStartForm,
  summarizeGentleAppStartForm,
  validateGentleAppStartForm,
} from '../utils/gentleAppStartForm';

describe('gentleAppStartForm', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('builds default form', () => {
    expect(buildEmptyGentleAppStartForm()).toEqual({
      appName: '',
      oneLineIdea: '',
      targetUser: '',
      mainFeeling: 'not-sure',
      platform: 'not-sure',
      firstGoal: 'not-sure',
      autoPreference: 'ask-only-important',
      uiTemplate: 'not-sure',
      mustHave: '',
      mustNotDo: '',
      notes: '',
    });
  });

  it('returns null when nothing is saved', () => {
    expect(loadGentleAppStartForm()).toBeNull();
  });

  it('saves and loads form', () => {
    const form = {
      ...buildEmptyGentleAppStartForm(),
      appName: 'my app',
      oneLineIdea: 'idea',
      targetUser: 'everyone',
      uiTemplate: 'soft-card' as const,
    };
    saveGentleAppStartForm(form);
    expect(loadGentleAppStartForm()).toEqual(form);
  });

  it('normalizes legacy saved form without uiTemplate', () => {
    localStorage.setItem(
      'darake.gentleAppStartForm.v1',
      JSON.stringify({ appName: 'legacy', oneLineIdea: 'x' }),
    );
    const loaded = loadGentleAppStartForm();
    expect(loaded?.appName).toBe('legacy');
    expect(loaded?.uiTemplate).toBe('not-sure');
  });

  it('clears saved form', () => {
    saveGentleAppStartForm(buildEmptyGentleAppStartForm());
    clearGentleAppStartForm();
    expect(loadGentleAppStartForm()).toBeNull();
  });

  it('validates required fields', () => {
    const emptyErrors = validateGentleAppStartForm(buildEmptyGentleAppStartForm());
    expect(emptyErrors).toContain('アプリ名は必須です');
    expect(emptyErrors).toContain('どんなアプリかを入力してください');

    const valid = {
      ...buildEmptyGentleAppStartForm(),
      appName: 'ok',
      oneLineIdea: 'ok',
    };
    expect(validateGentleAppStartForm(valid)).toEqual([]);
  });

  it('summarizes form text', () => {
    const summary = summarizeGentleAppStartForm({
      ...buildEmptyGentleAppStartForm(),
      appName: 'Todo',
      oneLineIdea: 'メモを集める',
      targetUser: '学生',
    });
    expect(summary).toContain('Todo');
    expect(summary).toContain('対象: 学生');
  });
});
