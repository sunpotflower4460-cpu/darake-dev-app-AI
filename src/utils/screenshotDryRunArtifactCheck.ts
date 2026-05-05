export type DryRunArtifactCheckItem = {
  id: string;
  label: string;
  expected: string;
  why: string;
};

export type DryRunArtifactCheckGuide = {
  title: string;
  status: 'manual-check-only';
  artifactName: string;
  artifactFileName: string;
  workflowName: string;
  successConditions: DryRunArtifactCheckItem[];
  inspectItems: DryRunArtifactCheckItem[];
  stopIf: string[];
  nextActions: string[];
  safetyNotes: string[];
};

export function buildDryRunArtifactCheckGuide(): DryRunArtifactCheckGuide {
  return {
    title: 'Dry-run Artifact Check',
    status: 'manual-check-only',
    artifactName: 'screenshot-plan-dry-run',
    artifactFileName: 'screenshot-plan.pretty.json',
    workflowName: 'Screenshot Capture Draft',
    successConditions: [
      {
        id: 'workflow-success',
        label: 'Workflow run status',
        expected: 'success',
        why: 'dry-run workflowが正常終了していることを確認します。',
      },
      {
        id: 'artifact-exists',
        label: 'Artifact exists',
        expected: 'screenshot-plan-dry-run が存在する',
        why: 'plan_jsonがartifactとして保存されたかを確認します。',
      },
      {
        id: 'json-file-exists',
        label: 'JSON file exists',
        expected: 'screenshot-plan.pretty.json が含まれる',
        why: 'workflow内でJSON validationとpretty出力が成功した証拠になります。',
      },
      {
        id: 'schema-version',
        label: 'Schema version',
        expected: 'darake-screenshot-plan-v1',
        why: 'Phase 10.9のJSON形式と一致しているか確認します。',
      },
      {
        id: 'runner-mode',
        label: 'Runner mode',
        expected: 'draft-only / shouldRunAutomatically=false',
        why: 'まだ実撮影へ進んでいない安全なplanであることを確認します。',
      },
    ],
    inspectItems: [
      {
        id: 'targets',
        label: 'targets',
        expected: 'readyな撮影対象が入っている',
        why: '次の実撮影フェーズで対象ページとviewportを使うためです。',
      },
      {
        id: 'blocked-targets',
        label: 'blockedTargets',
        expected: '必要なら理由つきで入っている',
        why: '実撮影前に未解決の対象を見落とさないためです。',
      },
      {
        id: 'base-url',
        label: 'source.baseUrl',
        expected: 'Preview URLが入っている',
        why: '空だと実撮影に進めません。',
      },
      {
        id: 'output-name',
        label: 'outputName',
        expected: '各targetにpng名がある',
        why: '将来のスクショ画像保存名として使います。',
      },
    ],
    stopIf: [
      'workflow runがfailure / cancelledになっている',
      'artifactが生成されていない',
      'screenshot-plan.pretty.jsonがartifactに含まれていない',
      'schemaVersionがdarake-screenshot-plan-v1ではない',
      'runner.modeがdraft-onlyではない',
      'runner.shouldRunAutomaticallyがfalseではない',
      'source.baseUrlが空',
      'plan内にsecret / token / key / cookie / passwordのような情報がある',
    ],
    nextActions: [
      'Artifact内容がOKなら、Phase 10.15でartifact確認結果の記録欄を追加する',
      'その後、Phase 10.16以降でPlaywright実撮影をmanual-gate付きで検討する',
      '実撮影前にPreview URLとtargetsを再確認する',
    ],
    safetyNotes: [
      'This panel is manual-check-only.',
      'The app does not fetch or download artifacts yet.',
      'The app does not trigger GitHub Actions.',
      'The dry-run artifact should contain only the validated screenshot plan JSON.',
      'Real capture remains behind a later manual gate.',
    ],
  };
}

export function formatDryRunArtifactCheckGuide(guide: DryRunArtifactCheckGuide): string {
  return [
    `# ${guide.title}`,
    '',
    `- status: ${guide.status}`,
    `- workflowName: ${guide.workflowName}`,
    `- artifactName: ${guide.artifactName}`,
    `- artifactFileName: ${guide.artifactFileName}`,
    '',
    '## Success Conditions',
    ...guide.successConditions.map((item) => `- ${item.label}: ${item.expected} / ${item.why}`),
    '',
    '## Inspect Items',
    ...guide.inspectItems.map((item) => `- ${item.label}: ${item.expected} / ${item.why}`),
    '',
    '## Stop If',
    ...guide.stopIf.map((item) => `- ${item}`),
    '',
    '## Next Actions',
    ...guide.nextActions.map((item) => `- ${item}`),
    '',
    '## Safety Notes',
    ...guide.safetyNotes.map((item) => `- ${item}`),
  ].join('\n');
}
