export type NotificationSafetyGateStatus = 'blocked' | 'needs-review' | 'safe-to-copy';

export type NotificationSafetyGate = {
  title: string;
  status: NotificationSafetyGateStatus;
  message: string;
  passItems: string[];
  warnings: string[];
  blockers: string[];
  requiredHumanChecks: string[];
};

const SECRET_PATTERNS = [
  /token/i,
  /api[_\s-]?key/i,
  /password/i,
  /secret/i,
  /webhook/i,
  /cookie/i,
  /bearer/i,
  /auth/i,
];

const WEBHOOK_URL_PATTERN = /https:\/\/(hooks\.slack\.com|discord\.com\/api\/webhooks|notify-api\.line\.me)/i;

const SCREENSHOT_PRIVATE_PATTERN = /https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp)/i;

const GITHUB_PRODUCTION_PATTERN = /(merge|deploy|push to main|push to master|release|publish)/i;

const MANUAL_GATE_AUTO_PATTERN = /(自動で.*?した|automatically (sent|submitted|deployed|merged))/i;

function containsSecretLeak(text: string): boolean {
  return SECRET_PATTERNS.some((p) => p.test(text));
}

function containsWebhookUrl(text: string): boolean {
  return WEBHOOK_URL_PATTERN.test(text);
}

function containsScreenshotPrivateUrl(text: string): boolean {
  return SCREENSHOT_PRIVATE_PATTERN.test(text);
}

function containsProductionOpRisk(text: string): boolean {
  return GITHUB_PRODUCTION_PATTERN.test(text);
}

function containsManualGateAutoViolation(text: string): boolean {
  return MANUAL_GATE_AUTO_PATTERN.test(text);
}

export function checkNotificationSafetyGate(text: string, targetLabel?: string): NotificationSafetyGate {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const passItems: string[] = [];

  // Secret leak check
  if (containsSecretLeak(text)) {
    blockers.push('通知文にsecret / token / api key / password らしき文字列が含まれています。除去してください。');
  } else {
    passItems.push('secret / token / api key が含まれていない');
  }

  // Webhook URL check
  if (containsWebhookUrl(text)) {
    blockers.push('通知文にWebhook URLが含まれています。URLを除去してください。');
  } else {
    passItems.push('Webhook URLが含まれていない');
  }

  // Screenshot private URL
  if (containsScreenshotPrivateUrl(text)) {
    warnings.push('通知文にスクショURLが含まれています。private情報でないか確認してください。');
  } else {
    passItems.push('private可能性のあるスクショURLが含まれていない');
  }

  // Production operation risk
  if (containsProductionOpRisk(text)) {
    warnings.push('本番操作（merge / deploy / release等）を促す表現が含まれています。手動確認が必要です。');
  } else {
    passItems.push('App Store / GitHub本番操作を過度に促す表現がない');
  }

  // Manual gate auto violation
  if (containsManualGateAutoViolation(text)) {
    blockers.push('「自動でした」等の表現が含まれています。manual gate前提の確認が必要です。');
  } else {
    passItems.push('manual gateが必要な操作を「自動でやった」と表現していない');
  }

  // Target clarity
  if (targetLabel && targetLabel.trim().length > 0) {
    passItems.push(`通知対象が明確: ${targetLabel}`);
  } else {
    warnings.push('通知対象（送信先）が明確でありません。確認してください。');
  }

  const requiredHumanChecks = [
    '通知文を目視確認する',
    '送信先が正しいか確認する',
    'private情報が含まれていないか確認する',
    'この通知を送ることが今必要か判断する',
    '送信後に NotificationSentRecord に記録する',
  ];

  let status: NotificationSafetyGateStatus;
  let message: string;
  if (blockers.length > 0) {
    status = 'blocked';
    message = `🔴 blocked: ${blockers.length}件のブロック項目があります。送信しないでください。`;
  } else if (warnings.length > 0) {
    status = 'needs-review';
    message = `⚠️ needs-review: ${warnings.length}件の注意事項があります。人間が確認してから送信してください。`;
  } else {
    status = 'safe-to-copy';
    message = '✅ safe-to-copy: 安全ゲートを通過しました。手動コピーで送信できます。';
  }

  return {
    title: 'Notification Safety Gate',
    status,
    message,
    passItems,
    warnings,
    blockers,
    requiredHumanChecks,
  };
}

export function formatNotificationSafetyGateMarkdown(gate: NotificationSafetyGate): string {
  return [
    `# ${gate.title}`,
    `Status: ${gate.status}`,
    '',
    gate.message,
    '',
    '## ✅ Pass Items',
    gate.passItems.map((p) => `- ✅ ${p}`).join('\n'),
    '',
    '## ⚠️ Warnings',
    gate.warnings.length > 0
      ? gate.warnings.map((w) => `- ⚠️ ${w}`).join('\n')
      : '- なし',
    '',
    '## 🔴 Blockers',
    gate.blockers.length > 0
      ? gate.blockers.map((b) => `- 🔴 ${b}`).join('\n')
      : '- なし',
    '',
    '## 人間が確認すること',
    gate.requiredHumanChecks.map((c) => `- [ ] ${c}`).join('\n'),
  ].join('\n');
}
