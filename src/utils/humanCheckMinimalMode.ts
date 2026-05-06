export type HumanCheckMinimalModeStatus =
  | 'quiet'
  | 'ready'
  | 'manual-gate'
  | 'blocked'
  | 'needs-choice';

export type HumanCheckMinimalCard = {
  id: string;
  title: string;
  status: HumanCheckMinimalModeStatus;
  oneLineSummary: string;
  whyNow: string;
  humanQuestion: string;
  okLabel: string;
  stopLabel: string;
  laterLabel: string;
  detailsMarkdown: string;
  hiddenDetails: string[];
  safetyNotes: string[];
};

export function buildHumanCheckMinimalCard(
  partial: Partial<HumanCheckMinimalCard> &
    Pick<HumanCheckMinimalCard, 'title'>
): HumanCheckMinimalCard {
  return {
    id: `hcmc-${crypto.randomUUID()}`,
    status: 'ready',
    oneLineSummary: '',
    whyNow: '',
    humanQuestion: 'どうしますか？',
    okLabel: 'OK',
    stopLabel: '止める',
    laterLabel: 'あとで',
    detailsMarkdown: '',
    hiddenDetails: [],
    safetyNotes: [],
    ...partial,
  };
}

export function formatHumanCheckMinimalCard(
  card: HumanCheckMinimalCard
): string {
  const lines = [
    `# ${card.title}`,
    '',
    `**状態:** ${card.status}`,
    '',
    `## 今見るべきこと`,
    card.oneLineSummary || '（なし）',
    '',
    `## なぜ今？`,
    card.whyNow || '（なし）',
    '',
    `## ${card.humanQuestion}`,
    `[${card.okLabel}] / [${card.laterLabel}] / [${card.stopLabel}]`,
  ];
  if (card.safetyNotes.length > 0) {
    lines.push('', '## 安全メモ');
    card.safetyNotes.forEach((n) => lines.push(`- ${n}`));
  }
  if (card.detailsMarkdown) {
    lines.push('', '## 詳細（折りたたみ）', card.detailsMarkdown);
  }
  return lines.join('\n');
}

export function summarizeHumanCheckMinimalMode(
  cards: HumanCheckMinimalCard[]
): {
  total: number;
  ready: number;
  blocked: number;
  manualGate: number;
  quiet: number;
} {
  return {
    total: cards.length,
    ready: cards.filter((c) => c.status === 'ready').length,
    blocked: cards.filter((c) => c.status === 'blocked').length,
    manualGate: cards.filter((c) => c.status === 'manual-gate').length,
    quiet: cards.filter((c) => c.status === 'quiet').length,
  };
}

const STORAGE_KEY = 'darake.humanCheckMinimalCards.v1';

export function loadHumanCheckMinimalCards(): HumanCheckMinimalCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HumanCheckMinimalCard[];
  } catch {
    return [];
  }
}

export function saveHumanCheckMinimalCards(
  cards: HumanCheckMinimalCard[]
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // ignore
  }
}
