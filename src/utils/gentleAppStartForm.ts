const STORAGE_KEY = 'darake.gentleAppStartForm.v1';

export type GentleAppStartForm = {
  appName: string;
  oneLineIdea: string;
  targetUser: string;
  mainFeeling:
    | 'simple'
    | 'cute'
    | 'calm'
    | 'fun'
    | 'beautiful'
    | 'serious'
    | 'not-sure';
  platform:
    | 'iphone'
    | 'web'
    | 'both'
    | 'not-sure';
  firstGoal:
    | 'just-visible'
    | 'usable-mvp'
    | 'app-store-ready'
    | 'not-sure';
  autoPreference:
    | 'explain-everything'
    | 'ask-only-important'
    | 'do-safe-things-silently'
    | 'maximum-darake';
  mustHave: string;
  mustNotDo: string;
  notes: string;
};

export const FEELING_LABELS: Record<GentleAppStartForm['mainFeeling'], string> = {
  simple: 'シンプル',
  cute: 'かわいい',
  calm: '静か',
  fun: '楽しい',
  beautiful: 'きれい',
  serious: '真面目',
  'not-sure': 'わからない',
};

export const PLATFORM_LABELS: Record<GentleAppStartForm['platform'], string> = {
  iphone: 'iPhone',
  web: 'ウェブ',
  both: '両方',
  'not-sure': 'わからない',
};

export const FIRST_GOAL_LABELS: Record<GentleAppStartForm['firstGoal'], string> = {
  'just-visible': 'まず見えるところまで',
  'usable-mvp': '使えるMVP',
  'app-store-ready': 'App Store準備まで',
  'not-sure': 'わからない',
};

export const AUTO_PREF_LABELS: Record<GentleAppStartForm['autoPreference'], string> = {
  'explain-everything': '全部説明してほしい',
  'ask-only-important': '大事なことだけ聞いて',
  'do-safe-things-silently': '安全なことは黙ってやって',
  'maximum-darake': '最大限だらけたい',
};

export function buildEmptyGentleAppStartForm(): GentleAppStartForm {
  return {
    appName: '',
    oneLineIdea: '',
    targetUser: '',
    mainFeeling: 'not-sure',
    platform: 'not-sure',
    firstGoal: 'not-sure',
    autoPreference: 'ask-only-important',
    mustHave: '',
    mustNotDo: '',
    notes: '',
  };
}

export function loadGentleAppStartForm(): GentleAppStartForm | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GentleAppStartForm;
  } catch {
    return null;
  }
}

export function saveGentleAppStartForm(form: GentleAppStartForm): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  } catch {
    // ignore
  }
}

export function clearGentleAppStartForm(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function validateGentleAppStartForm(form: GentleAppStartForm): string[] {
  const errors: string[] = [];
  if (!form.appName.trim()) errors.push('アプリ名は必須です');
  if (!form.oneLineIdea.trim()) errors.push('どんなアプリかを入力してください');
  return errors;
}

export function summarizeGentleAppStartForm(form: GentleAppStartForm): string {
  const parts: string[] = [];
  if (form.appName) parts.push(`「${form.appName}」`);
  if (form.oneLineIdea) parts.push(form.oneLineIdea);
  if (form.targetUser) parts.push(`対象: ${form.targetUser}`);
  return parts.join(' — ') || '（未入力）';
}

export function formatGentleAppStartFormMarkdown(form: GentleAppStartForm): string {
  const lines = [
    '# やさしいアプリ開始フォーム',
    '',
    `## アプリ情報`,
    `- アプリ名: ${form.appName || '未入力'}`,
    `- 内容: ${form.oneLineIdea || '未入力'}`,
    `- 対象ユーザー: ${form.targetUser || '未入力'}`,
    '',
    `## スタイル・目標`,
    `- 雰囲気: ${FEELING_LABELS[form.mainFeeling]}`,
    `- プラットフォーム: ${PLATFORM_LABELS[form.platform]}`,
    `- 最初の目標: ${FIRST_GOAL_LABELS[form.firstGoal]}`,
    `- 自動化希望: ${AUTO_PREF_LABELS[form.autoPreference]}`,
    '',
  ];

  if (form.mustHave) {
    lines.push(`## 必ず入れること`, form.mustHave, '');
  }
  if (form.mustNotDo) {
    lines.push(`## やらないこと`, form.mustNotDo, '');
  }
  if (form.notes) {
    lines.push(`## メモ`, form.notes, '');
  }

  return lines.join('\n');
}
