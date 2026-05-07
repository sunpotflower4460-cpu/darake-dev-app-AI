export type UiTemplateId =
  | 'not-sure'
  | 'soft-card'
  | 'minimal-note'
  | 'vision-board'
  | 'chat-companion'
  | 'dashboard'
  | 'cute-collection'
  | 'timeline'
  | 'map-board'
  | 'studio-tool'
  | 'game-diorama'
  | 'ritual-calm';

export type UiTemplateOption = {
  id: UiTemplateId;
  label: string;
  shortLabel: string;
  description: string;
  promptHint: string;
};

export const UI_TEMPLATE_OPTIONS: UiTemplateOption[] = [
  {
    id: 'not-sure',
    label: 'おまかせ',
    shortLabel: 'おまかせ',
    description: '内容から自然に選ぶ。迷ったらこれ。',
    promptHint: 'UIテンプレートは未指定。アプリ内容に合わせて、スマホで見やすく、情報量が少ない構成を提案してください。',
  },
  {
    id: 'soft-card',
    label: 'やわらかカード',
    shortLabel: 'カード',
    description: '角丸カード中心で、やさしく整理された見た目。',
    promptHint: '大きな角丸カード、余白多め、スマホ1カラム、やさしい色で構成してください。',
  },
  {
    id: 'minimal-note',
    label: 'ミニマルメモ',
    shortLabel: 'メモ',
    description: '入力を邪魔しない、白基調の軽いメモUI。',
    promptHint: '入力欄を主役にし、白基調・細い線・軽い余白で、余計な装飾を避けてください。',
  },
  {
    id: 'vision-board',
    label: '宝地図ボード',
    shortLabel: '宝地図',
    description: '画像カードを貼って、夢やビジョンを眺めるUI。',
    promptHint: '生成画像カードをボード上に貼れる構成にし、明るく幻想的で、ドラッグ配置を将来拡張しやすいUIにしてください。',
  },
  {
    id: 'chat-companion',
    label: '会話相棒',
    shortLabel: '会話',
    description: 'チャットやAIガイドが主役のUI。',
    promptHint: '会話欄を主役にし、入力欄・返答カード・履歴がスマホで読みやすい構成にしてください。',
  },
  {
    id: 'dashboard',
    label: 'ダッシュボード',
    shortLabel: '管理',
    description: '数字・状態・次の行動を一目で見せるUI。',
    promptHint: '上部に状態サマリー、下にカード型の指標と次のアクションを置く管理画面にしてください。',
  },
  {
    id: 'cute-collection',
    label: 'かわいいコレクション',
    shortLabel: '収集',
    description: '集める・育てる・眺める楽しさがあるUI。',
    promptHint: '小さなカードやバッジを集めるような、かわいく軽いコレクションUIにしてください。',
  },
  {
    id: 'timeline',
    label: 'タイムライン',
    shortLabel: '履歴',
    description: '記録や出来事を時系列で追えるUI。',
    promptHint: '日付ごとのタイムラインを中心に、記録追加と履歴確認が自然にできるUIにしてください。',
  },
  {
    id: 'map-board',
    label: 'マップ/ボード',
    shortLabel: 'ボード',
    description: '要素を配置して関係を眺めるUI。',
    promptHint: 'カードやノードを広いボードに配置し、関係やまとまりを視覚的に見られるUIにしてください。',
  },
  {
    id: 'studio-tool',
    label: '制作スタジオ',
    shortLabel: '制作',
    description: '作る・調整する・書き出す道具型UI。',
    promptHint: '左または上に操作、中央にプレビュー、下に保存/書き出しの導線がある制作ツールUIにしてください。',
  },
  {
    id: 'game-diorama',
    label: 'ゲーム/ジオラマ',
    shortLabel: 'ゲーム',
    description: '小さな世界を触る、遊びのあるUI。',
    promptHint: '中央に遊び場/ステージ、周囲に最小限の操作ボタンを置く、スマホ向けの楽しいUIにしてください。',
  },
  {
    id: 'ritual-calm',
    label: '静かな儀式',
    shortLabel: '静けさ',
    description: '瞑想・直感・内省に合う落ち着いたUI。',
    promptHint: '余白、静かな色、少ない文字、ゆっくり進む導線を重視した落ち着いたUIにしてください。',
  },
];

export function getUiTemplateOption(id: UiTemplateId): UiTemplateOption {
  return UI_TEMPLATE_OPTIONS.find((option) => option.id === id) ?? UI_TEMPLATE_OPTIONS[0];
}
