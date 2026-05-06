import type { AiTaskTypeId } from './aiTaskTypeRegistry';

export type AiReviewOutputFormat = {
  id: string;
  label: string;
  taskTypes: AiTaskTypeId[];
  markdown: string;
};

export const AI_REVIEW_OUTPUT_FORMATS: AiReviewOutputFormat[] = [
  {
    id: 'ui-review-output',
    label: 'UI Review Output',
    taskTypes: ['screenshot-ui-review'],
    markdown: [
      '## Overall',
      'pass / warn / fail',
      '## Findings',
      '- ...',
      '## Blockers',
      '- ...',
      '## Suggestions',
      '- ...',
      '## Next Action',
      '...',
    ].join('\n'),
  },
  {
    id: 'pr-review-output',
    label: 'PR Review Output',
    taskTypes: ['pr-review', 'code-risk-review'],
    markdown: [
      '## Summary',
      '...',
      '## Risk',
      'low / medium / high',
      '## Must Fix',
      '- ...',
      '## Nice To Have',
      '- ...',
      '## Merge Recommendation',
      'merge / hold / needs-human-review',
    ].join('\n'),
  },
  {
    id: 'store-copy-output',
    label: 'Store Copy Review Output',
    taskTypes: ['store-copy-review', 'ux-copy-polish', 'release-note-draft'],
    markdown: [
      '## Summary',
      '...',
      '## Strong Points',
      '- ...',
      '## Improvements',
      '- ...',
      '## Rewritten Copy Options',
      '- short: ...',
      '- polished: ...',
      '## Manual Check Required',
      '- ...',
    ].join('\n'),
  },
  {
    id: 'app-store-risk-output',
    label: 'App Store Risk Output',
    taskTypes: ['app-store-risk-review'],
    markdown: [
      '## Risk Level',
      'low / medium / high',
      '## Possible Review Issues',
      '- ...',
      '## Metadata Improvements',
      '- ...',
      '## Privacy / Age Rating Notes',
      '- ...',
      '## Manual Check Required',
      '- ...',
    ].join('\n'),
  },
  {
    id: 'rejection-response-output',
    label: 'Rejection Response Output',
    taskTypes: ['rejection-response-review', 'cloud-agent-instruction-review', 'phase-plan-review'],
    markdown: [
      '## Summary',
      '...',
      '## Missing Points',
      '- ...',
      '## Improved Draft',
      '...',
      '## Manual Review Notes',
      '- ...',
      '## Final Recommendation',
      'ready / revise / needs-human-review',
    ].join('\n'),
  },
  {
    id: 'bug-triage-output',
    label: 'Bug Triage Output',
    taskTypes: ['bug-triage'],
    markdown: [
      '## Severity',
      'low / medium / high / critical',
      '## Suspected Cause',
      '- ...',
      '## Missing Information',
      '- ...',
      '## Suggested Owner',
      '...',
      '## Next Action',
      '- ...',
    ].join('\n'),
  },
];

export function getAiReviewOutputFormatByTaskType(taskType: AiTaskTypeId): AiReviewOutputFormat | undefined {
  return AI_REVIEW_OUTPUT_FORMATS.find((format) => format.taskTypes.includes(taskType));
}

export function formatAiReviewOutputFormatsMarkdown(formats: AiReviewOutputFormat[]): string {
  const lines: string[] = ['# AI Review Output Formats'];

  formats.forEach((format) => {
    lines.push('', `## ${format.label}`, `- taskTypes: ${format.taskTypes.join(', ')}`, '', format.markdown);
  });

  return lines.join('\n');
}
