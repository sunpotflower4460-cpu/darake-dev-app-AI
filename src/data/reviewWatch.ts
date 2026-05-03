export type WatchStatus = 'ok' | 'checking' | 'manual' | 'blocked';

export type WatchItem = {
  id: string;
  label: string;
  status: WatchStatus;
  message: string;
};

export type ReviewUpdateStep = {
  id: string;
  title: string;
  detail: string;
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

export const reviewUpdateSteps: ReviewUpdateStep[] = [
  {
    id: 'open-actions',
    title: 'Actionsを開く',
    detail: 'GitHubのActionsタブで Update Review Watch File を選びます。',
  },
  {
    id: 'run-workflow',
    title: '手動実行する',
    detail: 'Run workflow を押すと public/review-watch.json が更新されます。',
  },
  {
    id: 'return-app',
    title: '画面に戻る',
    detail: '更新後にアプリを再読み込みすると新しい状態が見えます。',
  },
];
