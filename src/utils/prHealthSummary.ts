export type PrHealth =
  | 'unknown'
  | 'waiting'
  | 'checks-running'
  | 'checks-passed'
  | 'checks-failed'
  | 'review-needed'
  | 'ready-to-merge'
  | 'blocked';

export type PrHealthSummary = {
  health: PrHealth;
  userMessage: string;
  nextActionLabel: string;
  shouldNotifyUser: boolean;
  details?: string[];
};

const HEALTH_MESSAGES: Record<PrHealth, { userMessage: string; nextActionLabel: string; shouldNotifyUser: boolean }> = {
  unknown: {
    userMessage: 'PRの状態を確認中です。',
    nextActionLabel: '何もしなくてOK',
    shouldNotifyUser: false,
  },
  waiting: {
    userMessage: 'CI / チェックの開始を待っています。',
    nextActionLabel: '何もしなくてOK',
    shouldNotifyUser: false,
  },
  'checks-running': {
    userMessage: 'CIが実行中です。',
    nextActionLabel: '何もしなくてOK',
    shouldNotifyUser: false,
  },
  'checks-passed': {
    userMessage: 'CIが通りました。',
    nextActionLabel: 'まだ何もしなくてOK',
    shouldNotifyUser: false,
  },
  'checks-failed': {
    userMessage: 'CIまたはBuildが失敗しました。',
    nextActionLabel: 'AIに修正をお願いする',
    shouldNotifyUser: true,
  },
  'review-needed': {
    userMessage: 'レビューが必要です。',
    nextActionLabel: 'PRを確認する',
    shouldNotifyUser: true,
  },
  'ready-to-merge': {
    userMessage: 'マージできる状態です。',
    nextActionLabel: 'PRを開いてマージを確認する',
    shouldNotifyUser: true,
  },
  blocked: {
    userMessage: '手動での対応が必要です。',
    nextActionLabel: 'PRを確認する',
    shouldNotifyUser: true,
  },
};

export function buildPrHealthSummary(
  health: PrHealth,
  details?: string[],
): PrHealthSummary {
  const meta = HEALTH_MESSAGES[health];
  return {
    health,
    userMessage: meta.userMessage,
    nextActionLabel: meta.nextActionLabel,
    shouldNotifyUser: meta.shouldNotifyUser,
    details,
  };
}

export function parsePrHealthFromApi(raw: string): PrHealth {
  const valid: PrHealth[] = [
    'unknown', 'waiting', 'checks-running', 'checks-passed',
    'checks-failed', 'review-needed', 'ready-to-merge', 'blocked',
  ];
  if (valid.includes(raw as PrHealth)) return raw as PrHealth;
  return 'unknown';
}
