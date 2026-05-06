export type DarakeInternalReleaseNotes = {
  version: string;
  title: string;
  whatYouCanDo: string[];
  whatWeWontDoYet: string[];
  safetyPolicy: string[];
  knownLimitations: string[];
  nextPhaseCandidates: string[];
  releaseMarkdown: string;
};

export function buildDarakeInternalReleaseNotes(): DarakeInternalReleaseNotes {
  const version = 'v1.0.0-internal';

  const whatYouCanDo = [
    '見なくていいものを隠す（成功済みreport / dry-run詳細 / prompt全文）',
    '危険なものだけ起こす（blocked / urgent / secret未設定 / CI失敗）',
    '完成までの最短ルートを出す（Completion-first Dashboard）',
    'Cloud Agent指示書を作る・コピーする',
    'GitHub dry-runを作る・コピーする',
    'App Store準備を整える（メタデータ・スクショ・Store copy）',
    'Morning Reportで1日1回確認できる',
    'Sleep Modeで寝ている間も状況把握できる',
    'Review Inboxで後回し項目を管理できる',
    'Friction Auditで手間の残りを検出できる',
    'v1 Readiness Gateで完成度を確認できる',
  ];

  const whatWeWontDoYet = [
    '外部APIの自動実行',
    'GitHub Issue / PR の自動作成',
    'workflow dispatch の自動実行',
    'merge の自動実行',
    'AI APIの自動呼び出し',
    'webhook の自動送信',
    'App Store Connect APIの自動実行',
    'Submit for Review の自動化',
    'secret / token / API key の保存',
    '本番deploy / publish / 課金 / 認証 / DB変更',
  ];

  const safetyPolicy = [
    'blockedは常に表示する',
    'secret / production / App Store Submit / billing / auth / DBは隠さない',
    '外部API実行処理は含まない',
    'API key入力欄は設けない',
    '隠すのはsafe / draft / local / report / optional中心',
    '人間の最終確認が必要な操作は自動化しない',
  ];

  const knownLimitations = [
    '実際のGitHub / App Store操作は人間が手動で行う',
    'AIとの実際の通信は行わない（指示書・コピー補助のみ）',
    'CI / PR の実際の状態はGitHubで確認が必要',
    'スマホ画面での情報量はまだ最適化余地あり（Phase 45で改善予定）',
    'Friction Audit の検出はサンプルベース（全網羅ではない）',
  ];

  const nextPhaseCandidates = [
    'Phase 45: Darake v1 Polish（見た目の最終調整・スマホ最適化・ボタン削減）',
    'Phase 46: Darake Self-Use Loop（管制室自身の改善を管制室で管理する）',
    'Phase 47: Optional External Connection Planning（実通知・GitHub実行の本格検討）',
  ];

  const lines = [
    `# だらけ管制室 ${version} 内部リリースノート`,
    '',
    '## できること',
    ...whatYouCanDo.map((w) => `- ${w}`),
    '',
    '## まだやらないこと',
    ...whatWeWontDoYet.map((w) => `- ${w}`),
    '',
    '## 安全方針',
    ...safetyPolicy.map((s) => `- ${s}`),
    '',
    '## 既知の制限',
    ...knownLimitations.map((k) => `- ${k}`),
    '',
    '## 次のPhase候補',
    ...nextPhaseCandidates.map((n) => `- ${n}`),
  ];

  return {
    version,
    title: 'だらけ管制室 内部リリースノート',
    whatYouCanDo,
    whatWeWontDoYet,
    safetyPolicy,
    knownLimitations,
    nextPhaseCandidates,
    releaseMarkdown: lines.join('\n'),
  };
}
