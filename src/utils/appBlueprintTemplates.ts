export type AppBlueprintTemplate = {
  id: string;
  label: string;
  suitableFor: string[];
  defaultPhases: string[];
  mvpChecklist: string[];
  doNotBuild: string[];
  riskNotes: string[];
  storePositioningHints: string[];
};

export const APP_BLUEPRINT_TEMPLATES: AppBlueprintTemplate[] = [
  {
    id: 'simple-utility',
    label: 'シンプルユーティリティ',
    suitableFor: ['計算機', '変換ツール', 'タイマー', '記録ツール'],
    defaultPhases: ['UI設計', 'コア機能実装', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['主要機能1つ', 'シンプルなUI', 'クラッシュなし', 'プライバシー対応'],
    doNotBuild: ['ログイン機能', 'サーバー連携', '課金'],
    riskNotes: ['シンプルさを保つ', '機能追加しすぎない'],
    storePositioningHints: ['直感的・シンプル', '1分で使い方がわかる'],
  },
  {
    id: 'cute-tool',
    label: 'かわいいツール',
    suitableFor: ['ペット関係', '子ども向け', 'キャラクター系'],
    defaultPhases: ['キャラクター設計', 'UI設計', 'アニメーション', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['かわいいUI', 'メインキャラクター', '主要機能1つ'],
    doNotBuild: ['複雑な機能', '広告', '課金（最初は）'],
    riskNotes: ['年齢レーティング確認', 'プライバシー（子ども向け）'],
    storePositioningHints: ['見た目のかわいさを前面に', 'スクショで雰囲気を伝える'],
  },
  {
    id: 'habit-tracker',
    label: '習慣トラッカー',
    suitableFor: ['運動', '学習', '健康管理', '日課'],
    defaultPhases: ['データモデル設計', 'UI設計', '通知実装', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['習慣リスト', 'チェック機能', '継続記録', '通知（任意）'],
    doNotBuild: ['AI分析', 'SNS連携', '複雑な統計'],
    riskNotes: ['ヘルスデータ収集に注意', 'プライバシーポリシー必須'],
    storePositioningHints: ['継続できるシンプルさ', '1日1分で続けられる'],
  },
  {
    id: 'memo-app',
    label: 'メモアプリ',
    suitableFor: ['テキストメモ', 'アイデアノート', 'リスト管理'],
    defaultPhases: ['データモデル設計', 'エディタ実装', '保存機能', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['テキスト入力', '保存・読み込み', 'シンプルな一覧'],
    doNotBuild: ['クラウド同期（最初は）', '音声入力', '複雑な書式'],
    riskNotes: ['データ消失リスクに注意', 'バックアップ導線を考える'],
    storePositioningHints: ['シンプルさが強み', '起動してすぐ書ける'],
  },
  {
    id: 'creative-tool',
    label: 'クリエイティブツール',
    suitableFor: ['お絵描き', 'コラージュ', 'デザインツール'],
    defaultPhases: ['キャンバス設計', 'ツール実装', '保存機能', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['描画機能', '保存・共有', 'シンプルなUI'],
    doNotBuild: ['高度なフィルター', 'AI生成（最初は）'],
    riskNotes: ['著作権への配慮', 'パフォーマンス注意'],
    storePositioningHints: ['作品を見せるスクショ', '使いやすさを強調'],
  },
  {
    id: 'music-app',
    label: '音楽アプリ',
    suitableFor: ['楽器シミュレータ', 'BGMプレイヤー', '音楽ツール'],
    defaultPhases: ['音源設計', 'UI設計', '音再生実装', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['音再生', 'シンプルなUI', 'バッテリー配慮'],
    doNotBuild: ['ストリーミング', '著作権楽曲'],
    riskNotes: ['著作権に注意', 'バックグラウンド再生ポリシー確認'],
    storePositioningHints: ['サウンドの質を前面に', 'デモ動画があると強い'],
  },
  {
    id: 'ai-companion',
    label: 'AIコンパニオン',
    suitableFor: ['チャットボット', 'AIアドバイザー', 'バーチャル友達'],
    defaultPhases: ['キャラクター設計', 'UI設計', 'AI連携（手動ゲート）', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['基本会話', 'キャラクター', 'APIキー管理（手動）'],
    doNotBuild: ['個人情報収集', '金融アドバイス', '医療アドバイス'],
    riskNotes: ['AI利用規約確認', 'プライバシーポリシー必須', 'APIキーは絶対保存しない'],
    storePositioningHints: ['キャラクターの個性を強調', '使い道を明確に'],
  },
  {
    id: 'research-lab',
    label: 'リサーチ・実験アプリ',
    suitableFor: ['実験ツール', 'プロトタイプ', '研究補助'],
    defaultPhases: ['仮説設計', 'プロトタイプ', 'データ収集（任意）', 'テスト', '公開'],
    mvpChecklist: ['主要実験機能', 'データ出力', 'メモ機能'],
    doNotBuild: ['本番サービス化（まず実験）'],
    riskNotes: ['実験データの扱いに注意', 'プライバシー'],
    storePositioningHints: ['専門性を前面に', 'ターゲットを絞る'],
  },
  {
    id: 'casual-game',
    label: 'カジュアルゲーム',
    suitableFor: ['パズル', 'アクション', 'クイズ'],
    defaultPhases: ['ゲームデザイン', 'コアループ実装', 'レベル設計', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['コアゲームループ', 'スコア', 'ゲームオーバー・クリア'],
    doNotBuild: ['課金（最初は）', 'オンライン対戦', 'ランキング（最初は）'],
    riskNotes: ['年齢レーティング', 'バッテリー消費'],
    storePositioningHints: ['スクショでゲーム画面を見せる', 'キャッチコピーは短く'],
  },
  {
    id: '3d-web-game',
    label: '3D Webゲーム',
    suitableFor: ['3Dブラウザゲーム', 'WebGL実験'],
    defaultPhases: ['3Dシーン設計', 'コントロール実装', 'レベル設計', 'パフォーマンス最適化', '公開'],
    mvpChecklist: ['3Dシーン表示', 'キャラクター操作', 'ゲームクリア条件'],
    doNotBuild: ['重いアセット', 'サーバー連携（最初は）'],
    riskNotes: ['モバイルパフォーマンス', 'ファイルサイズ'],
    storePositioningHints: ['デモプレイ動画を作る', 'PC/スマホ両対応を明記'],
  },
  {
    id: 'education-app',
    label: '教育アプリ',
    suitableFor: ['学習支援', '語学', '子ども向け教材'],
    defaultPhases: ['カリキュラム設計', 'UI設計', 'コンテンツ実装', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['コアレッスン', '進捗管理', 'シンプルなUI'],
    doNotBuild: ['高度なAI採点（最初は）', '個人情報収集'],
    riskNotes: ['子ども向けプライバシー', '年齢レーティング'],
    storePositioningHints: ['学習効果を具体的に', 'スクショで使い方を示す'],
  },
  {
    id: 'wellness-app',
    label: 'ウェルネスアプリ',
    suitableFor: ['メンタルヘルス', 'リラクゼーション', '瞑想'],
    defaultPhases: ['体験設計', 'UI設計', 'コンテンツ実装', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['メインコンテンツ', '穏やかなUI', 'プライバシー対応'],
    doNotBuild: ['医療診断機能', '個人データ外部送信'],
    riskNotes: ['医療アドバイスNG', 'プライバシーポリシー必須'],
    storePositioningHints: ['穏やかな雰囲気のスクショ', '効果を誇張しない'],
  },
  {
    id: 'portfolio-app',
    label: 'ポートフォリオアプリ',
    suitableFor: ['作品集', '自己紹介', 'クリエイター向け'],
    defaultPhases: ['コンテンツ設計', 'UI設計', '作品ギャラリー実装', 'テスト', '提出準備', '提出'],
    mvpChecklist: ['プロフィール', '作品一覧', 'コンタクト'],
    doNotBuild: ['複雑なCMS', 'バックエンド（まずは静的）'],
    riskNotes: ['著作権表示', '個人情報の扱い'],
    storePositioningHints: ['自分の作品をスクショに', 'ターゲットを明確に'],
  },
];

export function getTemplateById(id: string): AppBlueprintTemplate | undefined {
  return APP_BLUEPRINT_TEMPLATES.find((t) => t.id === id);
}
