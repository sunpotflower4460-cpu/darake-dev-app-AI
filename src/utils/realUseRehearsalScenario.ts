export type RehearsalScenarioStage =
  | 'idea'
  | 'blueprint'
  | 'cloud-agent-instruction'
  | 'github-dry-run'
  | 'pr-review'
  | 'screenshot'
  | 'ui-check'
  | 'app-store-prep'
  | 'submission-gate'
  | 'post-release';

export type RealUseRehearsalScenario = {
  id: string;
  title: string;
  appName: string;
  appSeed: string;
  platform: 'ios' | 'web' | 'android' | 'multi';
  currentStage: RehearsalScenarioStage;
  goal: string;
  humanShouldSee: string[];
  humanShouldNotNeedToSee: string[];
  expectedDarakeFlow: string[];
  manualGates: string[];
  blockedIf: string[];
};

export const REHEARSAL_SCENARIO_STAGE_LABELS: Record<RehearsalScenarioStage, string> = {
  idea: 'アイデア',
  blueprint: '設計書',
  'cloud-agent-instruction': 'Cloud Agent指示書',
  'github-dry-run': 'GitHub dry-run',
  'pr-review': 'PRレビュー',
  screenshot: 'スクショ撮影',
  'ui-check': 'UIチェック',
  'app-store-prep': 'App Store準備',
  'submission-gate': '提出ゲート',
  'post-release': 'リリース後',
};

// Sample scenario 1: Simple mobile utility — 100年時計
const scenario100YearClock: RealUseRehearsalScenario = {
  id: 'scenario-100nen-clock',
  title: '通し稽古 — 100年時計',
  appName: '100年時計',
  appSeed: 'シンプルなタイマー / 100年先まで表示するカウントダウン時計',
  platform: 'ios',
  currentStage: 'blueprint',
  goal: '最短でApp Storeに出す',
  humanShouldSee: [
    '次のアクション1件だけ',
    'blockedがあればその理由',
    '提出ゲートの最終確認',
  ],
  humanShouldNotNeedToSee: [
    'Cloud Agent指示書の全文',
    'GitHub dry-run詳細ログ',
    'CI通過ログ',
    'App Storeメタデータ候補の全文',
    '低リスク警告',
  ],
  expectedDarakeFlow: [
    'アイデア → 設計書自動生成',
    '設計書 → Cloud Agent指示書コピー',
    'Cloud Agent → PR dry-run確認',
    'PR dry-run → PRレビュー確認',
    'PRレビュー → スクショ・UIチェック',
    'UIチェック → App Store準備コピー',
    'App Store準備 → 提出ゲート確認',
  ],
  manualGates: [
    'Cloud Agent指示書のコピー',
    '提出ゲートの最終OK',
  ],
  blockedIf: [
    'CI失敗',
    'App Store審査リジェクト',
    'secret未設定',
    'ビルドエラー',
  ],
};

// Sample scenario 2: Cute casual app — ねこ電卓
const scenarioCatCalculator: RealUseRehearsalScenario = {
  id: 'scenario-neko-calc',
  title: '通し稽古 — ねこ電卓',
  appName: 'ねこ電卓',
  appSeed: 'かわいい猫のキャラクターが計算してくれる電卓アプリ',
  platform: 'ios',
  currentStage: 'cloud-agent-instruction',
  goal: 'かわいいUIで差別化してApp Storeに出す',
  humanShouldSee: [
    '次のアクション1件だけ',
    'UIチェック結果（パス / 要修正）',
    '提出ゲートの最終確認',
  ],
  humanShouldNotNeedToSee: [
    'スクショ撮影ワークフローの詳細',
    'UIチェック詳細ログ',
    'Store copy候補全文',
    'GitHub操作詳細',
    'low-risk警告',
  ],
  expectedDarakeFlow: [
    'アイデア → 設計書生成',
    '設計書 → Cloud Agent指示書',
    'Cloud Agent → GitHub dry-run',
    'GitHub dry-run → PR作成確認',
    'PR → スクショ自動撮影',
    'スクショ → UIチェック',
    'UIチェック → App Store準備',
    'App Store準備 → 提出ゲート',
  ],
  manualGates: [
    'Cloud Agent指示書のコピー',
    'UIチェック結果確認',
    '提出ゲートの最終OK',
  ],
  blockedIf: [
    'UIチェック失敗',
    'App Storeスクショ要件不足',
    'secret未設定',
  ],
};

// Sample scenario 3: App Store submission prep — ぷに相撲
const scenarioPuniSumo: RealUseRehearsalScenario = {
  id: 'scenario-puni-sumo',
  title: '通し稽古 — ぷに相撲',
  appName: 'ぷに相撲',
  appSeed: 'ぷにぷにキャラクターが相撲を取るカジュアルゲーム',
  platform: 'ios',
  currentStage: 'app-store-prep',
  goal: 'App Store審査通過 → リリース',
  humanShouldSee: [
    'App Store準備チェックリスト（完了 / 未完了）',
    'blockedがあればその理由',
    '提出ゲートの最終確認',
    'リジェクト対応が必要な場合のみその内容',
  ],
  humanShouldNotNeedToSee: [
    'App Storeメタデータ全文',
    'プライバシーポリシー文章全文',
    'age rating設定詳細',
    'TestFlight詳細ログ',
    'すでに通過したUIチェック詳細',
  ],
  expectedDarakeFlow: [
    '設計書 → App Store準備チェックリスト自動生成',
    'チェックリスト → Store copyコピー',
    'Store copy → スクショ確認',
    'スクショ確認 → App Store Connect準備コピー',
    'App Store準備 → TestFlight確認',
    'TestFlight → 提出ゲート確認',
    '提出ゲート → リリース後確認',
  ],
  manualGates: [
    'Store copyのコピー・貼り付け',
    'App Store Connect操作（人間が手動）',
    '提出ゲートの最終OK',
    'Submit for Review（App Store側の操作）',
  ],
  blockedIf: [
    'App Storeスクショ不足',
    'age rating未設定',
    'TestFlight未配布',
    'リジェクト未対応',
  ],
};

export const REHEARSAL_SCENARIOS: RealUseRehearsalScenario[] = [
  scenario100YearClock,
  scenarioCatCalculator,
  scenarioPuniSumo,
];

export function getRehearsalScenarioById(id: string): RealUseRehearsalScenario | undefined {
  return REHEARSAL_SCENARIOS.find((s) => s.id === id);
}
