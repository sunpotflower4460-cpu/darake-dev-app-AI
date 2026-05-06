export type AutoProgressSimulationStepStatus =
  | 'would-run'
  | 'would-wait-human'
  | 'would-block'
  | 'would-complete'
  | 'would-record';

export type AutoProgressSimulationStep = {
  id: string;
  label: string;
  status: AutoProgressSimulationStepStatus;
  detail: string;
  expectedOutput: string;
  stopIf: string[];
};

export type AutoProgressSimulation = {
  id: string;
  title: string;
  candidateId: string;
  status: 'safe-preview' | 'needs-review' | 'blocked';
  summary: string;
  steps: AutoProgressSimulationStep[];
  predictedBlockers: string[];
  predictedManualGates: string[];
  predictedCompletionReport: string;
};

export function buildAutoProgressSimulation(
  partial: Partial<AutoProgressSimulation> &
    Pick<AutoProgressSimulation, 'title' | 'candidateId'>
): AutoProgressSimulation {
  return {
    id: `aps-${crypto.randomUUID()}`,
    status: 'safe-preview',
    summary: '',
    steps: [],
    predictedBlockers: [],
    predictedManualGates: [],
    predictedCompletionReport: '',
    ...partial,
  };
}

export function formatAutoProgressSimulationMarkdown(
  sim: AutoProgressSimulation
): string {
  const lines = [
    `# Auto Progress Simulation: ${sim.title}`,
    '',
    `**status:** ${sim.status}`,
    `**candidateId:** ${sim.candidateId}`,
    '',
    `## サマリー`,
    sim.summary || '（なし）',
    '',
    `## ステップ`,
  ];

  sim.steps.forEach((step, i) => {
    const icon =
      step.status === 'would-run'
        ? '▶️'
        : step.status === 'would-wait-human'
          ? '⏳'
          : step.status === 'would-block'
            ? '🚫'
            : step.status === 'would-complete'
              ? '✅'
              : '📝';
    lines.push(
      `${i + 1}. ${icon} **${step.label}** (${step.status})`,
      `   ${step.detail}`
    );
    if (step.expectedOutput) {
      lines.push(`   → ${step.expectedOutput}`);
    }
    if (step.stopIf.length > 0) {
      step.stopIf.forEach((s) => lines.push(`   ⚠️ 止まる条件: ${s}`));
    }
  });

  if (sim.predictedBlockers.length > 0) {
    lines.push('', '## 予測されるBlocker');
    sim.predictedBlockers.forEach((b) => lines.push(`- ${b}`));
  }
  if (sim.predictedManualGates.length > 0) {
    lines.push('', '## 予測されるManual Gate');
    sim.predictedManualGates.forEach((g) => lines.push(`- ${g}`));
  }
  if (sim.predictedCompletionReport) {
    lines.push('', '## 完了レポート予測', sim.predictedCompletionReport);
  }

  return lines.join('\n');
}

export function summarizeAutoProgressSimulation(
  sim: AutoProgressSimulation
): string {
  const total = sim.steps.length;
  const wouldBlock = sim.steps.filter(
    (s) => s.status === 'would-block'
  ).length;
  const wouldWait = sim.steps.filter(
    (s) => s.status === 'would-wait-human'
  ).length;
  const wouldComplete = sim.steps.filter(
    (s) => s.status === 'would-complete'
  ).length;
  return `${total} ステップ / ブロック: ${wouldBlock} / 人間待ち: ${wouldWait} / 完了見込み: ${wouldComplete}`;
}

const STORAGE_KEY = 'darake.autoProgressSimulations.v1';

export function loadAutoProgressSimulations(): AutoProgressSimulation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AutoProgressSimulation[];
  } catch {
    return [];
  }
}

export function saveAutoProgressSimulations(
  sims: AutoProgressSimulation[]
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sims));
  } catch {
    // ignore
  }
}
