export type FinalCheckItem = {
  id: string;
  label: string;
  state: 'ok' | 'check' | 'later';
  message: string;
};

export const finalCheckItems: FinalCheckItem[] = [
  {
    id: 'quality',
    label: '下書きの整い方',
    state: 'ok',
    message: '品質チェックを見てから次へ進めます。',
  },
  {
    id: 'review',
    label: '最後のひと目',
    state: 'check',
    message: 'タイトル、目的、完了条件だけ見れば大丈夫です。',
  },
  {
    id: 'next-action',
    label: '次の一歩',
    state: 'later',
    message: '今はまだ準備画面です。',
  },
];

export const finalCheckNotes = [
  'タイトルが伝わるか',
  '目的が一文で見えるか',
  '完了条件が分かるか',
  'やらないことが入っているか',
];
