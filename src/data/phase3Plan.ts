export type ReadinessItem = {
  label: string;
  state: 'planned' | 'mocked' | 'manual_gate';
  description: string;
};

export const phase3Readiness: ReadinessItem[] = [
  {
    label: 'リポジトリ概要',
    state: 'planned',
    description: '対象リポジトリ名、既定ブランチ、最新状態を表示する予定です。',
  },
  {
    label: '作業依頼一覧',
    state: 'planned',
    description: '今どの依頼が進んでいるかを一覧で見られるようにします。',
  },
  {
    label: '変更提案一覧',
    state: 'planned',
    description: '作られた変更提案と確認状態をまとめて表示する予定です。',
  },
  {
    label: 'チェック結果',
    state: 'mocked',
    description: '今は仮表示です。あとで実際のチェック状態に差し替えます。',
  },
  {
    label: '手動確認地点',
    state: 'manual_gate',
    description: '実データ表示を始める前に、対象範囲をユーザーが確認します。',
  },
];

export const phase3GateNotes = [
  '最初は表示だけにする',
  '書き込み操作はまだ入れない',
  '対象リポジトリを限定する',
  '大事な判断では必ず止める',
];
