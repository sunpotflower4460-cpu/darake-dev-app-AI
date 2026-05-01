import type { AppSeed, Blueprint, PhasePlan, ReviewCheck, SubmissionDraft } from '../types';

export const initialSeed: AppSeed = {
  title: 'やさしい自動開発管制室',
  soul: '作りたいアプリの種から、設計、段階分解、確認、完成通知まで進めたい。',
  targetUser: 'AIと一緒にアプリを作りたい人',
  desiredOutcome: '一旦の完成まで進み、あとから改善もできる状態',
  stopTiming: '大事な判断が必要なところで止める',
  automationLevel: 'near_full_auto',
};

export const blueprint: Blueprint = {
  purpose: 'アプリ開発の流れをやさしく管制する。',
  mvp: ['種入力', '設計図表示', '段階表示', '確認ゲート', '提出準備'],
  notDoing: ['初期版では外部サービスへ接続しない', '初期版では本番提出しない'],
  completionSignals: ['流れが見える', '止める場所がわかる', '次の確認がわかる'],
};

export const phases: PhasePlan[] = [
  { id: 'phase-0', title: 'Phase 0 設計固定', summary: '目的と範囲を決める。', status: 'passed', risk: 'low', autoRunnable: true, stopGate: '中核変更のみ確認', doneDefinition: '設計書がある' },
  { id: 'phase-1', title: 'Phase 1 器を作る', summary: 'アプリの土台を作る。', status: 'running', risk: 'low', autoRunnable: true, stopGate: '外部接続なし', doneDefinition: '画面が見える' },
  { id: 'phase-2', title: 'Phase 2 モック完成', summary: '全体の流れを仮データで体験する。', status: 'waiting_review', risk: 'low', autoRunnable: true, stopGate: 'UI確認', doneDefinition: '流れが理解できる' },
  { id: 'phase-3', title: 'Phase 3 実接続準備', summary: '外部サービスとの境界を作る。', status: 'not_started', risk: 'medium', autoRunnable: false, stopGate: '接続前確認', doneDefinition: '安全な境界がある' },
];

export const reviewChecks: ReviewCheck[] = [
  { label: '設計範囲', state: 'ok', detail: '初期版の目的に収まっている。' },
  { label: 'ビルド', state: 'pending', detail: 'PR後に確認する。' },
  { label: '画面確認', state: 'watch', detail: '後続でスクリーンショット確認を足す。' },
];

export const submissionDraft: SubmissionDraft = {
  appName: 'Darake Dev App AI',
  subtitle: 'AI開発をやさしく進める管制室',
  description: '作りたいアプリの種から設計、段階分解、確認、改善、提出準備までを支えるアプリです。',
  privacyNote: '初期版は入力内容を画面上で扱うだけです。',
  reviewNote: '提出は将来フェーズで手動確認してから進めます。',
};
