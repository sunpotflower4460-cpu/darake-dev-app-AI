export type RepoPullRequestSnapshot = {
  number: number;
  title: string;
  status: 'merged' | 'open' | 'closed';
  url: string;
  summary: string;
};

export type RepoSnapshot = {
  name: string;
  fullName: string;
  visibility: 'private' | 'public';
  defaultBranch: string;
  issueCount: number;
  pullRequests: RepoPullRequestSnapshot[];
  safetyMode: string;
  lastUpdatedLabel: string;
};

export const repoSnapshot: RepoSnapshot = {
  name: 'darake-dev-app-AI',
  fullName: 'sunpotflower4460-cpu/darake-dev-app-AI',
  visibility: 'private',
  defaultBranch: 'main',
  issueCount: 0,
  safetyMode: 'このリポジトリだけを対象にした読み取り表示',
  lastUpdatedLabel: '2026-05-01 Phase 3',
  pullRequests: [
    {
      number: 4,
      title: 'P3: 次の表示準備パネルを追加',
      status: 'merged',
      url: 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/pull/4',
      summary: '次の表示準備パネルと設計メモを追加。',
    },
    {
      number: 3,
      title: 'Phase 2.5: 表示モードとサービス境界を追加',
      status: 'merged',
      url: 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/pull/3',
      summary: '仮表示モードと将来の境界を見える化。',
    },
    {
      number: 2,
      title: 'Phase 2: モック管制室体験を強化',
      status: 'merged',
      url: 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/pull/2',
      summary: '計画、確認エージェント、スクショ予定、通知方針を追加。',
    },
    {
      number: 1,
      title: 'Phase 0-1: 設計固定と初期アプリ土台',
      status: 'merged',
      url: 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/pull/1',
      summary: '設計書、React/Vite土台、初期UI、CIを追加。',
    },
  ],
};
