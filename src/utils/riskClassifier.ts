export type RiskClass = 'safe-auto' | 'review-needed' | 'manual-gate' | 'blocked';

export type RiskClassification = {
  item: string;
  risk: RiskClass;
  label: string;
  reason: string;
};

const blockedKeywords = ['secret', 'token', 'key', 'apiキー', 'password', '本番公開', 'app store', 'google play'];
const manualKeywords = ['認証', '課金', 'firebase', 'supabase', 'db', 'database', 'セキュリティ', 'rules', 'マージ', 'merge', '提出'];
const reviewKeywords = ['リファクタ', 'refactor', '設計変更', '中核', '思想', 'レビュー', 'スクショ', 'screenshot'];

function includesAny(value: string, keywords: string[]): boolean {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function classifyRisk(item: string): RiskClassification {
  if (includesAny(item, blockedKeywords)) {
    return {
      item,
      risk: 'blocked',
      label: '必ず停止',
      reason: 'secret、本番公開、ストア提出などに関わる可能性があります。途中で止める対象です。',
    };
  }

  if (includesAny(item, manualKeywords)) {
    return {
      item,
      risk: 'manual-gate',
      label: '手動ゲート',
      reason: '認証、課金、DB、セキュリティ、マージなどは人間確認が必要です。',
    };
  }

  if (includesAny(item, reviewKeywords)) {
    return {
      item,
      risk: 'review-needed',
      label: '後で確認',
      reason: '途中停止ではなく、完成間近レポートでまとめて確認する候補です。',
    };
  }

  return {
    item,
    risk: 'safe-auto',
    label: '自動候補',
    reason: '低リスク作業として、自動進行候補にできます。',
  };
}

export function classifyRiskList(items: string[]): RiskClassification[] {
  return items.map(classifyRisk);
}

export function summarizeRisk(classifications: RiskClassification[]) {
  return {
    safeAuto: classifications.filter((item) => item.risk === 'safe-auto').length,
    reviewNeeded: classifications.filter((item) => item.risk === 'review-needed').length,
    manualGate: classifications.filter((item) => item.risk === 'manual-gate').length,
    blocked: classifications.filter((item) => item.risk === 'blocked').length,
  };
}
