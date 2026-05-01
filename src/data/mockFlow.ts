import type { AgentCheck, GeneratedPlan, NotificationPlan, ScreenshotCheck } from '../types';

export const generatedPlan: GeneratedPlan = {
  title: '種から一旦の完成まで進める計画',
  summary: 'まずは安全な仮データで流れを体験し、次に確認欄や進行欄を育てます。',
  nextActions: [
    '設計図を固定する',
    '画面の器を作る',
    '進行体験を作る',
    '確認結果を見える化する',
    '提出準備フォームを育てる',
  ],
  humanStops: ['大事な判断の前', '公開の前', '提出の前', 'アプリの核を変える前'],
};

export const agentChecks: AgentCheck[] = [
  { name: '設計確認エージェント', role: '目的とMVPを見る', status: 'passed', message: '種から設計へ自然につながっています。' },
  { name: 'UI確認エージェント', role: 'スマホで迷わず読めるかを見る', status: 'checking', message: 'カード分けと読みやすさを確認中です。' },
  { name: '安全確認エージェント', role: '危ない変更がないかを見る', status: 'passed', message: '今回は画面と仮データ中心です。' },
  { name: '提出準備エージェント', role: '提出前の情報不足を見る', status: 'ready', message: '説明文や確認メモを育てられます。' },
];

export const screenshotChecks: ScreenshotCheck[] = [
  { label: 'トップ画面', viewport: 'desktop', status: 'planned', note: '大きな画面で入口が見えるか確認する。' },
  { label: '種入力フォーム', viewport: 'mobile', status: 'planned', note: 'スマホで入力欄が詰まりすぎないか確認する。' },
  { label: 'Phaseカード', viewport: 'mobile', status: 'planned', note: '段階と停止場所が一目で読めるか確認する。' },
];

export const notificationPlan: NotificationPlan = {
  mode: 'pause_on_risk',
  channels: ['アプリ内通知', '将来の通知先'],
  message: '普段は静かに進め、確認が必要な時だけ知らせます。',
};
