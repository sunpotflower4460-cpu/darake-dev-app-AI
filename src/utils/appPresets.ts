export type AppPreset = {
  id: string;
  label: string;
  appName: string;
  oneLineIdea: string;
  targetUser: string;
  platform: 'iphone' | 'web' | 'both' | 'not-sure';
  uiTemplate: string;
  mainFeeling: string;
  firstGoal: string;
  mustHave: string;
  mustNotDo: string;
  notes: string;
};

export const APP_PRESETS: AppPreset[] = [
  {
    id: 'treasure-map-memo',
    label: '宝地図メモ帳で始める',
    appName: '宝地図メモ帳',
    oneLineIdea:
      '断片的にメモをするとAIが自動で画像生成してくれて、タイトルもつけて「宝地図」にしてくれる。メモとは別にボードを作れて、ボード上に宝地図を好きなように貼れる。',
    targetUser: '右脳型で夢を叶えたい人',
    platform: 'not-sure',
    uiTemplate: '宝地図ボード',
    mainFeeling: 'beautiful',
    firstGoal: 'usable-mvp',
    mustHave: [
      'メモ入力',
      '宝地図カード生成のモック',
      'タイトル自動生成のモック',
      'ボード表示',
      'カードをボードに貼るUIの土台',
      'ローカル保存',
      'README',
      'typecheck/build',
    ].join(' / '),
    mustNotDo:
      'AI APIは呼ばない。画像生成は最初はモックのみ。外部サービスへの接続なし。スマホで見やすいUIを優先。',
    notes:
      'UIテンプレートは宝地図ボード(map-board)。雰囲気：明るい・幻想的・やさしい・夢が叶いそう。プラットフォームはiPhone / Web 未確定。初期MVPに集中する。',
  },
];

export function findPresetById(id: string): AppPreset | undefined {
  return APP_PRESETS.find((p) => p.id === id);
}
