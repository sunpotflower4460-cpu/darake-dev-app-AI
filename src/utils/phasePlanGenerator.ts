import type { AppBlueprintTemplate } from './appBlueprintTemplates';

export type GeneratedPhasePlan = {
  appName: string;
  phases: Array<{
    id: string;
    title: string;
    purpose: string;
    tasks: string[];
    doneConditions: string[];
    manualGates: string[];
  }>;
};

export function generatePhasePlan(appName: string, template: AppBlueprintTemplate): GeneratedPhasePlan {
  const phases = template.defaultPhases.map((phaseTitle, index) => ({
    id: `phase-${index + 1}`,
    title: phaseTitle,
    purpose: `${appName} の ${phaseTitle} フェーズを完了させる`,
    tasks: [`${phaseTitle}の計画を立てる`, `${phaseTitle}を実装する`, 'レビューする'],
    doneConditions: [`${phaseTitle}が完了した`, 'typecheck / buildが通る', 'レビューを受けた'],
    manualGates:
      phaseTitle.includes('提出') || phaseTitle.includes('submit')
        ? ['App Store / Google Play への提出は手動で行う', 'secret / token は入力しない']
        : [],
  }));

  return { appName, phases };
}

export function formatPhasePlanMarkdown(plan: GeneratedPhasePlan): string {
  const lines: string[] = [
    `# Phase計画: ${plan.appName}`,
    '',
  ];

  plan.phases.forEach((p) => {
    lines.push(
      `## ${p.id}: ${p.title}`,
      '',
      `**目的**: ${p.purpose}`,
      '',
      '**タスク**:',
      ...p.tasks.map((t) => `- [ ] ${t}`),
      '',
      '**完了条件**:',
      ...p.doneConditions.map((d) => `- ${d}`),
    );
    if (p.manualGates.length > 0) {
      lines.push('', '**⚠️ Manual Gate**:', ...p.manualGates.map((g) => `- ${g}`));
    }
    lines.push('');
  });

  return lines.join('\n');
}
