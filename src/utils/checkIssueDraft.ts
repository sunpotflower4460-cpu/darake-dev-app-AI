import type { IssueDraft } from '../data/issueDraft';

export type DraftCheckLevel = 'ok' | 'watch' | 'needs_care';

export type DraftCheck = {
  id: string;
  label: string;
  level: DraftCheckLevel;
  message: string;
};

function hasEnoughText(value: string, minLength: number): boolean {
  return value.trim().length >= minLength;
}

export function checkIssueDraft(draft: IssueDraft): DraftCheck[] {
  const checks: DraftCheck[] = [];

  checks.push({
    id: 'title',
    label: 'タイトル',
    level: hasEnoughText(draft.title, 12) ? 'ok' : 'watch',
    message: hasEnoughText(draft.title, 12) ? '十分伝わります。' : 'もう少しだけ具体的にすると渡しやすいです。',
  });

  checks.push({
    id: 'intent',
    label: '目的',
    level: hasEnoughText(draft.intent, 20) ? 'ok' : 'needs_care',
    message: hasEnoughText(draft.intent, 20) ? '目的が見えています。' : '何のためにやるかを少し足すと安心です。',
  });

  checks.push({
    id: 'scope',
    label: 'やること',
    level: draft.scope.length >= 3 ? 'ok' : 'watch',
    message: draft.scope.length >= 3 ? '作業範囲が見えています。' : '作業項目が少なめです。必要なら一つ足しましょう。',
  });

  checks.push({
    id: 'done',
    label: '完了条件',
    level: draft.done.length >= 2 ? 'ok' : 'needs_care',
    message: draft.done.length >= 2 ? '終わりの形が見えています。' : '完了条件が少なめです。終わりの形を足すと楽です。',
  });

  checks.push({
    id: 'not-doing',
    label: 'まだやらないこと',
    level: draft.notDoing.length >= 2 ? 'ok' : 'watch',
    message: draft.notDoing.length >= 2 ? 'やらない範囲が守れそうです。' : 'やらないことを足すと、作業が膨らみにくくなります。',
  });

  return checks;
}
