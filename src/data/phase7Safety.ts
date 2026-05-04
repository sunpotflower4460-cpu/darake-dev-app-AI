export type Phase7SafetyGate = {
  id: string;
  label: string;
  mode: 'auto-candidate' | 'manual-gate' | 'blocked';
  reason: string;
};

export const phase7SafetyGates: Phase7SafetyGate[] = [
  {
    id: 'safe-draft',
    label: 'Issue / PR本文の下書き生成',
    mode: 'auto-candidate',
    reason: '本文生成だけなら安全。投稿前に確認できます。',
  },
  {
    id: 'safe-read',
    label: 'PR / CI / Review状態の読み取り',
    mode: 'auto-candidate',
    reason: '読み取り専用なので継続して自動化候補です。',
  },
  {
    id: 'manual-create-issue',
    label: 'Issue作成',
    mode: 'manual-gate',
    reason: 'GitHubへ書き込むため、最初は必ず手動確認を残します。',
  },
  {
    id: 'manual-create-pr',
    label: 'PR作成',
    mode: 'manual-gate',
    reason: 'ブランチや差分が絡むため、安全条件が揃うまで止めます。',
  },
  {
    id: 'manual-merge',
    label: 'マージ',
    mode: 'manual-gate',
    reason: '低リスクでも、条件判定が育つまでは明示確認が必要です。',
  },
  {
    id: 'blocked-secret',
    label: 'secret / token / key の入力',
    mode: 'blocked',
    reason: 'チャットやブラウザ表示に出さず、GitHub Secrets等で手動登録します。',
  },
  {
    id: 'blocked-store',
    label: 'App Store / 本番公開の最終提出',
    mode: 'blocked',
    reason: '法務・課金・公開判断を含むため、必ず人間が最後に確認します。',
  },
];
