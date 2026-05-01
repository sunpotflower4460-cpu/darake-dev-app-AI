export type IssueDraft = {
  title: string;
  intent: string;
  background: string;
  scope: string[];
  done: string[];
  notDoing: string[];
  handoffPrompt: string;
};

export const issueDraft: IssueDraft = {
  title: 'Phase 4: 作りたいアプリの種からIssue下書きを作る',
  intent: 'ユーザーが入力した作りたいアプリの種を、エージェントへ渡しやすいIssue形式に整える。',
  background: 'Darake Dev App AIは、細かい開発作業を毎回手で整理しなくても進められる管制室を目指している。まずは実際に投稿する前の下書き確認から始める。',
  scope: [
    '種の要約をIssueタイトルへ変換する',
    '目的、背景、MVP、完了条件を下書きとして表示する',
    '手動確認が必要な項目を分けて表示する',
    'コピーしやすいエージェント依頼文を作る',
  ],
  done: [
    'Issue下書きが画面に表示される',
    '完了条件が箇条書きで見える',
    'まだ投稿しないことが分かる',
    '次に確認する場所が分かる',
  ],
  notDoing: [
    'この段階では実際のIssue投稿はしない',
    '外部サービスの新しい権限は増やさない',
    '自動マージや提出処理はしない',
  ],
  handoffPrompt: 'このIssue下書きをもとに、Phaseの目的に収まる範囲で実装してください。危険な変更や外部接続が必要な場合は、必ず停止して理由を表示してください。',
};
