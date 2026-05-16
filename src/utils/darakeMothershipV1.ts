export type MothershipFeature = {
  id: string;
  label: string;
  phase: string;
  status: 'done' | 'in-progress' | 'planned';
  description: string;
};

export const MOTHERSHIP_V1_FEATURES: MothershipFeature[] = [
  { id: 'setup', label: '初期設定ここだけ', phase: 'Phase 88/92', status: 'done', description: '上から押すだけで完了' },
  { id: 'diagnostic', label: '設定状態診断', phase: 'Phase 91', status: 'done', description: '何が足りないか教える' },
  { id: 'idea-input', label: '作りたいものを置くだけ', phase: 'Phase 98', status: 'done', description: 'アプリ名と一行アイデアで始まる' },
  { id: 'issue-create', label: 'Issue自動作成', phase: 'Phase 93', status: 'done', description: 'GitHub Issueを安定して作る' },
  { id: 'agent-instruction', label: 'AI作業指示自動生成', phase: 'Phase 94', status: 'done', description: '統一フォーマットでAgentに渡す' },
  { id: 'pr-summary', label: 'PR/CI状態を人間向け表示', phase: 'Phase 95', status: 'done', description: 'GitHubの言葉を人間の言葉に翻訳' },
  { id: 'safety-gate', label: '安全ゲート', phase: 'Phase 96', status: 'done', description: 'だらけても危なくならない' },
  { id: 'preview-deploy', label: 'Preview確認', phase: 'Phase 97', status: 'done', description: '最新の反映状態を確認' },
  { id: 'appstore-prep', label: 'App Store準備チェック', phase: 'Phase 99', status: 'done', description: '提出前の確認を一覧化' },
];

export type MothershipReadiness = {
  doneCount: number;
  totalCount: number;
  percent: number;
  v1Complete: boolean;
  message: string;
};

export function buildMothershipReadiness(): MothershipReadiness {
  const done = MOTHERSHIP_V1_FEATURES.filter((f) => f.status === 'done').length;
  const total = MOTHERSHIP_V1_FEATURES.length;
  const percent = Math.round((done / total) * 100);
  const v1Complete = done === total;

  return {
    doneCount: done,
    totalCount: total,
    percent,
    v1Complete,
    message: v1Complete
      ? 'だらけ開発母艦 v1 が完成しました。一通りの開発サイクルをアプリ内で完結できます。'
      : `v1完成まで ${total - done} 機能が残っています。`,
  };
}
