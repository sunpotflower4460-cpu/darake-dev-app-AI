export type StoreCopyTemplate = {
  id: string;
  label: string;
  tone: string;
  subtitlePattern: string;
  promotionalTextPattern: string;
  descriptionSections: string[];
  keywordHints: string[];
  reviewRiskNotes: string[];
};

export const STORE_COPY_TEMPLATES: StoreCopyTemplate[] = [
  {
    id: 'simple-utility',
    label: 'シンプル・ユーティリティ',
    tone: 'シンプル・クリーン',
    subtitlePattern: '毎日使えるシンプルツール',
    promotionalTextPattern: '余計なものを省いた、シンプルなツールです。',
    descriptionSections: [
      '直感的な操作で、すぐ使えます。',
      '広告なし・シンプルデザインで集中できます。',
      'いつでも手軽に使える、必要最小限の機能です。',
    ],
    keywordHints: ['ツール', 'シンプル', 'ユーティリティ', '便利'],
    reviewRiskNotes: ['機能が限定的すぎるとリジェクトの可能性があります'],
  },
  {
    id: 'calm-minimal',
    label: 'おだやか・ミニマル',
    tone: 'おだやか・ゆったり',
    subtitlePattern: 'ゆったり使えるシンプルなアプリ',
    promotionalTextPattern: '毎日の小さなひとときを、もっとおだやかに。',
    descriptionSections: [
      'シンプルで静かな空間で、自分だけの時間を。',
      '余計な通知もなく、自分のペースで使えます。',
    ],
    keywordHints: ['ミニマル', 'シンプル', 'リラックス', '静かな'],
    reviewRiskNotes: [],
  },
  {
    id: 'cute-character',
    label: 'かわいいキャラクター',
    tone: 'キュート・フレンドリー',
    subtitlePattern: 'かわいいキャラと一緒に',
    promotionalTextPattern: 'かわいいキャラクターが毎日を応援します。',
    descriptionSections: [
      'かわいいキャラクターと一緒に毎日を楽しみましょう。',
      'コレクションして、自分だけのスタイルに。',
    ],
    keywordHints: ['かわいい', 'キャラクター', 'コレクション', '楽しい'],
    reviewRiskNotes: ['ユーザー生成コンテンツがある場合はモデレーション方針が必要'],
  },
  {
    id: 'creative-tool',
    label: 'クリエイティブツール',
    tone: 'クリエイティブ・自由',
    subtitlePattern: '自分だけの作品を作ろう',
    promotionalTextPattern: 'あなたのクリエイティビティを自由に表現。',
    descriptionSections: [
      '直感的なツールで、アイデアをすぐ形に。',
      '豊富な表現方法で、自分だけの作品を作れます。',
      '作ったものをかんたんに保存・共有できます。',
    ],
    keywordHints: ['クリエイティブ', 'アート', 'デザイン', '制作'],
    reviewRiskNotes: ['共有機能があればコンテンツポリシーが必要'],
  },
  {
    id: 'wellness',
    label: 'ウェルネス・健康',
    tone: '健康的・サポート',
    subtitlePattern: '毎日の健康をサポート',
    promotionalTextPattern: 'あなたの毎日の健康を、やさしくサポートします。',
    descriptionSections: [
      '日々の体調・気分を記録して、自分の変化を知ることができます。',
      'シンプルな習慣で、毎日が少し楽になります。',
    ],
    keywordHints: ['健康', 'ウェルネス', '習慣', 'セルフケア'],
    reviewRiskNotes: ['医療アドバイスと誤解される表現は避ける', '健康データには特別なプライバシー説明が必要'],
  },
  {
    id: 'music-creator',
    label: '音楽クリエイター',
    tone: '音楽・クリエイティブ',
    subtitlePattern: '自分だけの音楽を作ろう',
    promotionalTextPattern: '手軽に、自分だけの音楽を作れます。',
    descriptionSections: [
      '直感的な操作で、すぐに音楽制作を始められます。',
      '多彩な音源とエフェクトで、表現の幅が広がります。',
    ],
    keywordHints: ['音楽', 'DTM', 'サウンド', 'クリエイター'],
    reviewRiskNotes: ['著作権のある音源を使用する場合はライセンス確認が必要'],
  },
  {
    id: 'productivity',
    label: '生産性・タスク管理',
    tone: '効率的・プロフェッショナル',
    subtitlePattern: 'タスク管理をシンプルに',
    promotionalTextPattern: 'タスクを整理して、毎日をもっとスムーズに。',
    descriptionSections: [
      'シンプルなタスク管理で、やることが一目でわかります。',
      '優先順位をつけて、大事なことに集中できます。',
    ],
    keywordHints: ['タスク管理', '生産性', 'ToDo', 'スケジュール'],
    reviewRiskNotes: [],
  },
  {
    id: 'game-casual',
    label: 'カジュアルゲーム',
    tone: '楽しい・カジュアル',
    subtitlePattern: '気軽に楽しめるゲーム',
    promotionalTextPattern: 'ちょっとした時間に楽しめるカジュアルゲーム。',
    descriptionSections: [
      'シンプルなルールで、すぐ遊べます。',
      'スコアを競いながら、毎日少しずつ上達しよう。',
    ],
    keywordHints: ['ゲーム', 'カジュアル', '暇つぶし', '脳トレ'],
    reviewRiskNotes: ['IAPがあればsandboxテスト必須', '暴力・ギャンブル要素がある場合は年齢レーティング要確認'],
  },
  {
    id: 'ai-assistant',
    label: 'AIアシスタント',
    tone: 'スマート・サポート',
    subtitlePattern: 'AIがあなたをサポート',
    promotionalTextPattern: 'AIの力で、毎日の作業をもっとかんたんに。',
    descriptionSections: [
      'AIがあなたの質問に答え、作業をサポートします。',
      'シンプルな操作で、すぐにAIと会話できます。',
    ],
    keywordHints: ['AI', 'アシスタント', 'チャット', '自動化'],
    reviewRiskNotes: [
      'AI生成コンテンツポリシーの明記が必要',
      'ユーザーデータの扱いについてプライバシー説明が必要',
      'AI誤情報に関する免責事項を検討',
    ],
  },
  {
    id: 'research-tool',
    label: 'リサーチ・情報収集',
    tone: '情報的・知的',
    subtitlePattern: '情報収集をもっとかんたんに',
    promotionalTextPattern: '必要な情報を、手軽に整理できます。',
    descriptionSections: [
      '気になる情報を素早く収集・整理できます。',
      '見つけた情報を自分なりにまとめて保存できます。',
    ],
    keywordHints: ['リサーチ', '情報収集', 'ノート', '調査'],
    reviewRiskNotes: ['外部リンクを扱う場合はコンテンツポリシーが必要'],
  },
];

export function getStoreCopyTemplate(id: string): StoreCopyTemplate | undefined {
  return STORE_COPY_TEMPLATES.find((t) => t.id === id);
}

export function formatStoreCopyTemplateMarkdown(template: StoreCopyTemplate, appName: string): string {
  const lines: string[] = [
    `# ストア文面候補（${template.label}）`,
    '',
    `- **トーン**: ${template.tone}`,
    `- **サブタイトル候補**: ${template.subtitlePattern}`,
    `- **プロモーション文候補**: ${template.promotionalTextPattern}`,
    '',
    '## 説明文候補セクション',
  ];
  template.descriptionSections.forEach((s) => lines.push(`- ${s}`));
  lines.push('', '## キーワード候補');
  lines.push(template.keywordHints.join(', '));
  if (template.reviewRiskNotes.length > 0) {
    lines.push('', '## 審査リスクメモ');
    template.reviewRiskNotes.forEach((n) => lines.push(`- ⚠️ ${n}`));
  }
  lines.push('', `## アプリ名`, appName || '（未入力）');
  lines.push('', '## Safety Note', '- この候補をApp Storeに貼る前に人間が確認してください。', '- App Store Connect APIは呼びません。');
  return lines.join('\n');
}
