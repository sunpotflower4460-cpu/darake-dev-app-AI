export type UpdateAftercareStep = {
  id: string;
  title: string;
  detail: string;
};

export const updateAftercareSteps: UpdateAftercareStep[] = [
  {
    id: 'wait-for-workflow',
    title: '1. workflow完了を待つ',
    detail: 'GitHub Actionsで押した更新workflowがsuccessになったかだけ見ます。',
  },
  {
    id: 'reload-page',
    title: '2. 画面を再読み込み',
    detail: 'public JSONが更新されたあと、アプリ画面をリロードして新しい状態を読みます。',
  },
  {
    id: 'check-alert',
    title: '3. 上のアラートだけ見る',
    detail: 'manual / blocked が出ていなければ、細かい一覧は見なくて大丈夫です。',
  },
  {
    id: 'open-only-needed',
    title: '4. 必要なリンクだけ開く',
    detail: '今やるレーンにあるものだけ開き、後でいい・放っておくは触りません。',
  },
];
