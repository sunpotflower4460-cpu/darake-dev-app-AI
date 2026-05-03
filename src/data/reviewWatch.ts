export type WatchStatus = 'ok' | 'checking' | 'manual' | 'blocked';

export type WatchItem = {
  id: string;
  label: string;
  status: WatchStatus;
  message: string;
};

export const reviewWatchItems: WatchItem[] = [
  {
    id: 'pr',
    label: 'PR',
    status: 'checking',
    message: '作業内容と差分を見る場所です。',
  },
  {
    id: 'ci',
    label: 'CI',
    status: 'ok',
    message: 'state:build / typecheck / build を確認します。',
  },
  {
    id: 'review',
    label: 'レビュー',
    status: 'manual',
    message: 'CodeRabbitや人間レビューの指摘を見ます。',
  },
  {
    id: 'merge',
    label: 'マージ判断',
    status: 'manual',
    message: '危険がなければsquash mergeへ進みます。',
  },
];

export const reviewWatchPrinciples = [
  '失敗だけ目立たせる',
  '成功は静かに通す',
  '危険なら止める',
  '判断が必要な所だけ見る',
];
