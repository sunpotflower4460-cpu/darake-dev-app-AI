export type RiskLevel = 'safe' | 'review-needed' | 'manual-gate' | 'blocked';

const BLOCKED_PATTERNS = [
  /secret[s]?\s*=\s*['"`]/i,
  /token\s*=\s*['"`]/i,
  /localStorage\.setItem\(['"`][^'"`)]*token/i,
  /auto[-_]?approve/i,
  /auto[-_]?merge/i,
  /GITHUB_TOKEN.*frontend/i,
];

const MANUAL_GATE_PATHS = [
  /auth/i,
  /billing/i,
  /payment/i,
  /stripe/i,
  /app.?store/i,
  /wrangler\.toml$/i,
  /firebase.*rules/i,
];

const MANUAL_GATE_FILE_NAMES = [
  '.env',
  '.env.local',
  '.env.production',
  'wrangler.toml',
];

const SAFE_PATTERNS = [
  /\.css$/i,
  /README/i,
  /\.md$/i,
  /\.test\.[tj]sx?$/i,
  /\.spec\.[tj]sx?$/i,
];

export type RiskyChangeInput = {
  changedFiles?: string[];
  diffContent?: string;
};

export type RiskyChangeResult = {
  riskLevel: RiskLevel;
  reasons: string[];
  blockedFiles: string[];
  manualGateFiles: string[];
};

export function detectRiskyChanges(input: RiskyChangeInput): RiskyChangeResult {
  const { changedFiles = [], diffContent = '' } = input;
  const blockedFiles: string[] = [];
  const manualGateFiles: string[] = [];
  const reasons: string[] = [];

  // Check diff content for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(diffContent)) {
      blockedFiles.push(`diff content matches: ${pattern.source}`);
      reasons.push(`危険なパターンが検出されました: ${pattern.source}`);
    }
  }

  // Check file paths
  for (const file of changedFiles) {
    const fileName = file.split('/').pop() ?? file;

    // Blocked exact filenames
    if (MANUAL_GATE_FILE_NAMES.some((f) => fileName === f || file.endsWith(f))) {
      manualGateFiles.push(file);
      reasons.push(`重要ファイルが変更されています: ${file}`);
      continue;
    }

    // Manual gate by path pattern
    if (MANUAL_GATE_PATHS.some((p) => p.test(file))) {
      manualGateFiles.push(file);
      reasons.push(`手動確認が必要なパスです: ${file}`);
    }
  }

  if (blockedFiles.length > 0) {
    return { riskLevel: 'blocked', reasons, blockedFiles, manualGateFiles };
  }

  if (manualGateFiles.length > 0) {
    return { riskLevel: 'manual-gate', reasons, blockedFiles, manualGateFiles };
  }

  // Check if all changed files are safe
  if (
    changedFiles.length > 0 &&
    changedFiles.every((f) => SAFE_PATTERNS.some((p) => p.test(f)))
  ) {
    return { riskLevel: 'safe', reasons: [], blockedFiles: [], manualGateFiles: [] };
  }

  if (changedFiles.length === 0) {
    return { riskLevel: 'safe', reasons: [], blockedFiles: [], manualGateFiles: [] };
  }

  return { riskLevel: 'review-needed', reasons: [], blockedFiles: [], manualGateFiles: [] };
}
