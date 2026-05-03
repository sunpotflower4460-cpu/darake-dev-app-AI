export type ManualGateStep = {
  id: string;
  title: string;
  detail: string;
};

export const manualGateSteps: ManualGateStep[] = [
  {
    id: 'review-title',
    title: 'タイトルを見る',
    detail: 'ひと目で何をする下書きか分かるかだけ確認します。',
  },
  {
    id: 'review-body',
    title: '本文を見る',
    detail: '目的、やること、完了条件、まだやらないことが入っているか確認します。',
  },
  {
    id: 'open-github',
    title: 'GitHubで開く',
    detail: '次の段階では、GitHub側で内容を見ながら進めます。',
  },
  {
    id: 'final-touch',
    title: '最後に整える',
    detail: '必要なら貼り付け後に一行だけ直します。',
  },
];

export const manualGateWarnings = [
  'まだ自動投稿はしません',
  '内容確認を一度挟みます',
  '大事な判断は人間が残します',
];
