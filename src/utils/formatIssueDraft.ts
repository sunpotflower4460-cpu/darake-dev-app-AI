import type { IssueDraft } from '../data/issueDraft';

function list(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

export function formatIssueDraft(draft: IssueDraft): string {
  return [
    `# ${draft.title}`,
    '',
    '## 目的',
    draft.intent,
    '',
    '## 背景',
    draft.background,
    '',
    '## やること',
    list(draft.scope),
    '',
    '## 完了条件',
    list(draft.done),
    '',
    '## まだやらないこと',
    list(draft.notDoing),
    '',
    '## エージェントに渡す文',
    draft.handoffPrompt,
  ].join('\n');
}
