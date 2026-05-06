export type SafetyCheckCategory =
  | 'external-api'
  | 'github-api'
  | 'webhook'
  | 'app-store-api'
  | 'secret-storage'
  | 'auto-execution'
  | 'local-storage';

export type SafetyCheckResult = 'pass' | 'manual-gate' | 'review-needed' | 'blocked';

export type SafetyInvariantItem = {
  id: string;
  category: SafetyCheckCategory;
  label: string;
  result: SafetyCheckResult;
  description: string;
  evidence: string;
  notes: string;
};

export type SafetyInvariantAudit = {
  title: string;
  status: 'safe' | 'needs-review' | 'blocked';
  passItems: SafetyInvariantItem[];
  reviewItems: SafetyInvariantItem[];
  blockedItems: SafetyInvariantItem[];
  fixedInvariants: string[];
  warnings: string[];
  nextActions: string[];
};

export const SAFETY_INVARIANT_ITEMS: SafetyInvariantItem[] = [
  // External API
  {
    id: 'no-fetch-external',
    category: 'external-api',
    label: '外部APIへのfetch呼び出しなし',
    result: 'pass',
    description: 'アプリ内でfetch()を使った外部API呼び出しはありません。',
    evidence: '全パネルがlocalStorageのみを使用。fetch()の使用箇所は存在しない。',
    notes: 'copy-only / manual-gate方針で設計されているため外部通信なし。',
  },
  {
    id: 'no-xhr',
    category: 'external-api',
    label: 'XMLHttpRequestなし',
    result: 'pass',
    description: 'XMLHttpRequestは使用していません。',
    evidence: 'コードベース全体にXMLHttpRequestの使用なし。',
    notes: '外部通信手段として使用する設計ではない。',
  },
  {
    id: 'no-axios',
    category: 'external-api',
    label: 'axiosなし',
    result: 'pass',
    description: 'axiosライブラリは使用していません。',
    evidence: 'package.jsonにaxiosの依存なし。',
    notes: '外部HTTPクライアントは一切使用しない方針。',
  },
  // GitHub API
  {
    id: 'no-github-api',
    category: 'github-api',
    label: 'GitHub API自動実行なし',
    result: 'pass',
    description: 'GitHub APIへの自動呼び出しはありません。',
    evidence:
      'GitHubOperationCandidatePanel等はコピー専用。Issue/PR/workflow dispatch自動実行なし。',
    notes: 'GitHub関連パネルはすべてdraft-only/copy-only/manual-gate。',
  },
  {
    id: 'no-issue-auto-create',
    category: 'github-api',
    label: 'Issue自動作成なし',
    result: 'pass',
    description: 'GitHubへのIssue自動作成は行いません。',
    evidence: 'IssueDraftPanelはコピーのみ。API呼び出しなし。',
    notes: 'ユーザーが手動でGitHubへコピー&ペーストして作成する。',
  },
  {
    id: 'no-pr-auto-create',
    category: 'github-api',
    label: 'PR自動作成なし',
    result: 'pass',
    description: 'GitHubへのPR自動作成は行いません。',
    evidence: 'PrCreationPreviewPanelはコピーのみ。',
    notes: '手動操作のみ。',
  },
  {
    id: 'no-workflow-dispatch',
    category: 'github-api',
    label: 'workflow dispatch自動実行なし',
    result: 'pass',
    description: 'GitHub workflow dispatchの自動実行はありません。',
    evidence: 'WorkflowDispatchCandidateDraftPanelはdraft-only。実行ボタンなし。',
    notes: '下書きのコピーのみ提供。実行は手動。',
  },
  {
    id: 'no-merge-auto',
    category: 'github-api',
    label: 'merge自動実行なし',
    result: 'pass',
    description: 'GitHub PRのmerge自動実行はありません。',
    evidence: 'PrMergeCandidateGatePanelはmanual-gate。',
    notes: '手動確認必須。',
  },
  // Webhook
  {
    id: 'no-webhook-send',
    category: 'webhook',
    label: 'Webhook実送信なし',
    result: 'pass',
    description: 'WebhookへのHTTP送信は行いません。',
    evidence:
      'WebhookPayloadDraftPanelはpayload下書きのみ。実際のHTTP送信コードなし。',
    notes: '外部通知はすべてdraft-only。実送信は手動。',
  },
  {
    id: 'no-webhook-url-stored',
    category: 'webhook',
    label: 'Webhook URL保存なし',
    result: 'pass',
    description: 'WebhookのURLをlocalStorageに保存していません。',
    evidence: 'localStorage keyにwebhook URLを含む項目なし。',
    notes: 'secret/webhook URLは保存禁止の設計方針。',
  },
  // App Store API
  {
    id: 'no-app-store-api',
    category: 'app-store-api',
    label: 'App Store Connect API自動実行なし',
    result: 'pass',
    description: 'App Store Connect APIへの自動呼び出しはありません。',
    evidence:
      'AppStoreConnectApiCandidateDraftPanelはdraft-only。実API呼び出しなし。',
    notes: '提出は手動のみ。Submit for Review自動化なし。',
  },
  {
    id: 'no-submit-for-review-auto',
    category: 'app-store-api',
    label: 'Submit for Review自動化なし',
    result: 'pass',
    description: 'App Storeへの審査提出自動化はありません。',
    evidence:
      'SubmitForReviewManualGuidePanelはmanual-gate。FinalSubmissionGatePanelも手動確認必須。',
    notes: '本番提出操作は必ず手動で行う。',
  },
  // Secret Storage
  {
    id: 'no-secret-localstorage',
    category: 'secret-storage',
    label: 'localStorageへのsecret保存なし',
    result: 'pass',
    description: 'secret / token / API key をlocalStorageに保存していません。',
    evidence:
      '全localStorageキーを確認。機密データを含む項目はなし（darake.*.v1形式のみ）。',
    notes: 'containsSensitiveData=falseを全キーで確認済み。',
  },
  {
    id: 'no-token-input',
    category: 'secret-storage',
    label: 'token入力欄なし',
    result: 'pass',
    description: 'GitHub token / API keyなどの入力フォームはありません。',
    evidence: '全パネルを確認。token/api_key/secretの入力欄なし。',
    notes: '将来AI連携時も外部secret入力欄は別フェーズで設計。',
  },
  // Auto Execution
  {
    id: 'no-auto-deploy',
    category: 'auto-execution',
    label: 'deploy自動実行なし',
    result: 'pass',
    description: '本番デプロイの自動実行はありません。',
    evidence: 'デプロイ実行コードなし。',
    notes: '管制室はすべて手動確認前提。',
  },
  {
    id: 'no-auto-publish',
    category: 'auto-execution',
    label: 'publish自動実行なし',
    result: 'pass',
    description: 'App Store publishの自動実行はありません。',
    evidence: '全パネルがdraft/copy/manual-gate。',
    notes: 'Phase 24でも自動公開機能追加なし。',
  },
  // Local Storage
  {
    id: 'localstorage-review',
    category: 'local-storage',
    label: 'localStorageキー一覧確認',
    result: 'manual-gate',
    description: 'localStorageキーの全件確認はPhase 24.6で実施。',
    evidence: 'LocalStorageKeyRegistryPanelで一覧化済み。',
    notes: '衝突・機密データなし（LocalStorageKeyRegistryを参照）。',
  },
  {
    id: 'no-sensitive-localstorage',
    category: 'local-storage',
    label: '機密データlocalStorage保存なし',
    result: 'pass',
    description: 'すべてのlocalStorageキーは非機密データのみ。',
    evidence: 'darake.*.v1形式のみ。token/secret/api_keyを含まない。',
    notes: 'Phase 24.6 LocalStorage Key Registryで確認。',
  },
];

export function buildSafetyInvariantAudit(): SafetyInvariantAudit {
  const allItems = SAFETY_INVARIANT_ITEMS;

  const passItems = allItems.filter((i) => i.result === 'pass');
  const reviewItems = allItems.filter(
    (i) => i.result === 'review-needed' || i.result === 'manual-gate',
  );
  const blockedItems = allItems.filter((i) => i.result === 'blocked');

  const warnings: string[] = [];
  if (reviewItems.length > 0) {
    warnings.push(`${reviewItems.length}件の安全チェックが手動確認または要レビューです。`);
  }

  const fixedInvariants: string[] = [
    '外部APIを呼ばない（fetch/XHR/axios なし）',
    'GitHub API を自動実行しない（Issue/PR/workflow dispatch/merge）',
    'Webhook 送信をしない',
    'App Store Connect API を自動実行しない',
    'Submit for Review を自動化しない',
    'secret / token / API key / webhook URL を保存しない',
    'localStorage に機密データを保存しない',
    '既存の copy-only / manual-gate 方針を維持する',
    'Phase 1〜23 の機能を削除しない',
  ];

  const overallStatus: SafetyInvariantAudit['status'] =
    blockedItems.length > 0 ? 'blocked' : warnings.length > 0 ? 'needs-review' : 'safe';

  const nextActions: string[] = [
    '新機能追加時は必ず safety invariant を確認する',
    '外部API連携はPhase 25以降で別途設計する',
    'webhook URL / secret の入力欄を追加しない',
    'LocalStorage Key Registry で新しいキーを登録する',
  ];

  return {
    title: 'Safety Invariant Audit - Phase 24',
    status: overallStatus,
    passItems,
    reviewItems,
    blockedItems,
    fixedInvariants,
    warnings,
    nextActions,
  };
}

export function formatSafetyInvariantAuditMarkdown(audit: SafetyInvariantAudit): string {
  const lines: string[] = [
    `# ${audit.title}`,
    `Status: ${audit.status}`,
    '',
    '## 固定安全方針',
    ...audit.fixedInvariants.map((i) => `- ✅ ${i}`),
    '',
    `## Pass (${audit.passItems.length}件)`,
    ...audit.passItems.map((i) => `- ✅ ${i.label}: ${i.evidence}`),
  ];

  if (audit.reviewItems.length > 0) {
    lines.push(`\n## Manual Gate / Review (${audit.reviewItems.length}件)`);
    audit.reviewItems.forEach((i) => lines.push(`- ⚠️ ${i.label}: ${i.notes}`));
  }
  if (audit.blockedItems.length > 0) {
    lines.push(`\n## Blocked (${audit.blockedItems.length}件)`);
    audit.blockedItems.forEach((i) => lines.push(`- 🔴 ${i.label}: ${i.notes}`));
  }
  if (audit.warnings.length > 0) {
    lines.push('\n## Warnings');
    audit.warnings.forEach((w) => lines.push(`- ⚠️ ${w}`));
  }
  lines.push('\n## Next Actions');
  audit.nextActions.forEach((a) => lines.push(`- ${a}`));

  return lines.join('\n');
}
