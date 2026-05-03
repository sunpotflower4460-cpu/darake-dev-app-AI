export type WatchStatus = 'ok' | 'checking' | 'manual' | 'blocked';
export type ReviewRiskLevel = 'low' | 'medium' | 'high' | 'unknown';
export type ReviewActionKind = 'open' | 'update' | 'wait' | 'manual';

const repoUrl = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI';

export type ReviewWatchLink = {
  label: string;
  url: string;
};

export type ReviewWatchAction = {
  label: string;
  kind: ReviewActionKind;
  url?: string;
};

export type WatchItem = {
  id: string;
  label: string;
  status: WatchStatus;
  message: string;
  url?: string;
  risk?: ReviewRiskLevel;
  links?: ReviewWatchLink[];
  actions?: ReviewWatchAction[];
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
    url: `${repoUrl}/pulls`,
    risk: 'medium',
    links: [{ label: 'PR一覧', url: `${repoUrl}/pulls` }],
    actions: [{ label: 'PRを見る', kind: 'open', url: `${repoUrl}/pulls` }],
  },
  {
    id: 'ci',
    label: 'CI',
    status: 'ok',
    message: 'state:build / typecheck / build を確認します。',
    url: `${repoUrl}/actions`,
    risk: 'low',
    links: [{ label: 'Actions', url: `${repoUrl}/actions` }],
    actions: [{ label: '放っておく', kind: 'wait' }],
  },
  {
    id: 'review',
    label: 'レビュー',
    status: 'manual',
    message: 'CodeRabbitや人間レビューの指摘を見ます。',
    url: `${repoUrl}/pulls`,
    risk: 'medium',
    links: [{ label: 'レビュー確認', url: `${repoUrl}/pulls` }],
    actions: [{ label: '確認する', kind: 'manual', url: `${repoUrl}/pulls` }],
  },
  {
    id: 'merge',
    label: 'マージ判断',
    status: 'manual',
    message: '危険がなければsquash mergeへ進みます。',
    url: `${repoUrl}/pulls`,
    risk: 'high',
    links: [{ label: 'マージ候補', url: `${repoUrl}/pulls` }],
    actions: [{ label: '人間確認', kind: 'manual', url: `${repoUrl}/pulls` }],
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
