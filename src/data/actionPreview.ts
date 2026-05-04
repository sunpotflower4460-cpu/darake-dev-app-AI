export type ActionPreviewMode = 'preview-only' | 'manual-confirm' | 'blocked';

export type ActionPreviewItem = {
  id: string;
  label: string;
  mode: ActionPreviewMode;
  summary: string;
  checks: string[];
};

export const actionPreviewItems: ActionPreviewItem[] = [
  {
    id: 'issue-create-preview',
    label: 'Issue作成プレビュー',
    mode: 'manual-confirm',
    summary: 'Issue本文、タイトル、ラベル候補を表示し、投稿前に止めます。',
    checks: ['タイトルがある', '本文がある', 'secretを含まない', 'ユーザー確認がある'],
  },
  {
    id: 'pr-create-preview',
    label: 'PR作成プレビュー',
    mode: 'manual-confirm',
    summary: 'ブランチ名、差分概要、テスト結果を表示し、PR作成前に止めます。',
    checks: ['ブランチ名が安全', '差分概要がある', 'CI方針がある', 'ユーザー確認がある'],
  },
  {
    id: 'merge-preview',
    label: 'マージ前プレビュー',
    mode: 'manual-confirm',
    summary: 'CI、Snapshot、レビュー、危険差分を確認し、マージ前に止めます。',
    checks: ['CI成功', 'Snapshot成功', 'ブロック指摘なし', '危険差分なし', 'ユーザー確認がある'],
  },
  {
    id: 'secret-preview',
    label: 'secret入力',
    mode: 'blocked',
    summary: 'secret / token / key はアプリ内にもチャットにも表示しません。',
    checks: ['GitHub Secretsで手動登録', '値は画面に出さない', 'コードに含めない'],
  },
];
