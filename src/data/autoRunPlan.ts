export type AutoRunPlanSection = {
  id: string;
  title: string;
  detail: string;
  items: string[];
};

export const autoRunPlanSections: AutoRunPlanSection[] = [
  {
    id: 'goal',
    title: '1. 受け取るもの',
    detail: '最初に、作りたいアプリの魂・種・方向性を受け取ります。',
    items: ['アプリ名', '魂・種', '使う人', 'MVP範囲', '完成間近の定義'],
  },
  {
    id: 'auto-scope',
    title: '2. 自動で進める範囲',
    detail: '低リスクな作業は途中で細かく止めず、まとめて進めます。',
    items: ['UI実装', 'モックデータ', 'CSS調整', '型定義', 'README更新', 'CI確認', 'Snapshot確認'],
  },
  {
    id: 'batch-gate',
    title: '3. Batch Gate Mode',
    detail: '軽微な問題は途中停止せず、完成間近レポートへまとめます。',
    items: ['軽微なUI違和感', '後で直せるレビュー指摘', '追加したいテスト', '提出前の補足項目', '手動で必要な確認'],
  },
  {
    id: 'hard-stop',
    title: '4. 途中で止まる条件',
    detail: 'どうしても進めない、または危険な場面だけ即停止します。',
    items: ['secret / token / key が必要', '認証・課金・本番DB変更', 'Build不能で先に進めない', '権限不足', 'App Store / 本番公開判断'],
  },
  {
    id: 'completion',
    title: '5. 完成間近レポート',
    detail: '最後に、できたこと・残ったこと・手動項目をまとめて渡します。',
    items: ['完了したPhase', '確認URL', 'PR一覧', 'スクショ結果', '残った手動作業', '次のおすすめ'],
  },
];
