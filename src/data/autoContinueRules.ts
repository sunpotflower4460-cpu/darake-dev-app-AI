export type AutoContinueRuleType = 'continue' | 'batch-report' | 'hard-stop';

export type AutoContinueRule = {
  id: string;
  type: AutoContinueRuleType;
  title: string;
  detail: string;
  examples: string[];
};

export const autoContinueRules: AutoContinueRule[] = [
  {
    id: 'continue-safe',
    type: 'continue',
    title: '次へ進む条件',
    detail: '低リスク作業で、前のQueue itemが成功し、型・Build・基本確認が通っている時は次へ進めます。',
    examples: ['safe-auto', 'Typecheck成功', 'Build成功', 'Phase目的内の変更', 'secretなし'],
  },
  {
    id: 'batch-review',
    type: 'batch-report',
    title: '完成間近レポートへ回す条件',
    detail: '進行を止めるほどではない注意点は、途中で止めず最後にまとめます。',
    examples: ['review-needed', '軽微なUI違和感', '追加したいテスト', '低リスクなレビュー指摘', '文言の改善案'],
  },
  {
    id: 'manual-later',
    type: 'batch-report',
    title: '手動項目を最後にまとめる条件',
    detail: '手動確認が必要でも、今すぐ必要でなければ完成間近レポートへまとめます。',
    examples: ['GitHub Issueの最終Submit', 'ストア文言確認', 'スクショ確認', '任意の微調整', '低リスクPR確認'],
  },
  {
    id: 'hard-secret',
    type: 'hard-stop',
    title: '途中で止まる条件',
    detail: 'それがないと進めない、または危険な場面だけ途中停止します。',
    examples: ['secret / token / key が必要', '権限不足', 'Build不能', '本番DB操作', '課金・認証・本番公開判断'],
  },
];
