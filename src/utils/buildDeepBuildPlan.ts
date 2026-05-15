import type { DeepBuildPlan, DeepBuildPhase, DeepBuildCompletionContract } from './deepBuildPlan';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildPhase(args: {
  order: number;
  kind: DeepBuildPhase['kind'];
  title: string;
  purpose: string;
  agentInstruction: string;
  doneWhen: string[];
}): DeepBuildPhase {
  return {
    id: `deep-phase-${args.order}`,
    order: args.order,
    kind: args.kind,
    title: args.title,
    purpose: args.purpose,
    agentInstruction: args.agentInstruction,
    doneWhen: args.doneWhen,
    status: args.order === 1 ? 'issue-ready' : 'planned',
    autoFixAttempts: 0,
    maxAutoFixAttempts: 2,
    riskLevel: 'low',
  };
}

export function buildDefaultDeepBuildCompletionContract(): DeepBuildCompletionContract {
  return {
    mustPass: [
      'build-passed',
      'typecheck-passed',
      'requirements-covered',
      'ui-reviewed',
      'mobile-checked',
    ],
    humanReviewRequiredFor: [
      '課金・認証・secret/token・本番DB・App Store提出・Worker Secret・GitHub権限変更',
      'high risk または unknown risk の変更',
      'アプリの核となる方向性変更',
    ],
    finalReviewChecklist: [
      'ユーザーに見せる画面が短く、内部情報を出しすぎていない',
      'スマホ表示で主要操作が迷わない',
      'typecheck と build が通っている',
      '危険操作が自動実行されない',
      'README/docs に次の確認点が残っている',
    ],
  };
}

export function buildDeepBuildPlan(input: {
  appName: string;
  oneLineIdea: string;
  goal?: string;
}): DeepBuildPlan {
  const now = new Date().toISOString();
  const appName = input.appName.trim() || 'まだ名前のないアプリ';
  const oneLineIdea = input.oneLineIdea.trim() || '作りたいことを一行で置くと、AIが完成までの流れに変換します。';
  const goal = input.goal?.trim() || `${appName} を、ユーザーが迷わず触れるMVPとして完成候補まで育てる。`;

  const phases: DeepBuildPhase[] = [
    buildPhase({
      order: 1,
      kind: 'design',
      title: '設計整理',
      purpose: 'アプリの目的、MVP、やらないこと、安全停止点を短く固定する。',
      agentInstruction: `「${appName}」の目的とMVPを整理し、最初に作る範囲・まだ作らない範囲・安全停止点を docs にまとめてください。一言説明: ${oneLineIdea}`,
      doneWhen: ['MVP範囲が明確', 'やらないことが明確', '安全停止点が明記されている'],
    }),
    buildPhase({
      order: 2,
      kind: 'ui-shell',
      title: 'UI骨格',
      purpose: 'ユーザーが最初に迷わない画面構成を作る。',
      agentInstruction: `「${appName}」のMVP画面を作ってください。人間に内部情報を見せすぎず、次に押す場所が分かるUIにしてください。`,
      doneWhen: ['主要画面がある', '最初の導線がある', 'スマホで破綻しない'],
    }),
    buildPhase({
      order: 3,
      kind: 'core-implementation',
      title: 'コア実装',
      purpose: 'アプリの核となる機能を最小実装する。',
      agentInstruction: `「${appName}」の中核機能を最小実装してください。見た目だけでなく、保存・状態更新・基本操作が通るようにしてください。`,
      doneWhen: ['中核操作が動く', '状態が保存される', '空状態や失敗状態が壊れない'],
    }),
    buildPhase({
      order: 4,
      kind: 'worker-api',
      title: 'Worker/API確認',
      purpose: '必要な外部連携だけを安全に確認する。',
      agentInstruction: `必要なAPI/Workerがある場合だけ最小追加してください。secret/tokenや本番DBが必要な場合は実装せず、手動停止点として文書化してください。`,
      doneWhen: ['不要な外部連携を増やしていない', '必要なAPIの境界が明確', 'secret/tokenをコードに入れていない'],
    }),
    buildPhase({
      order: 5,
      kind: 'test',
      title: 'テスト',
      purpose: 'typecheck/build と主要動線確認を通す。',
      agentInstruction: 'npm run typecheck と npm run build が通るようにしてください。壊れている場合は原因を短くまとめて修正してください。',
      doneWhen: ['typecheckが通る', 'buildが通る', '主要動線の確認メモがある'],
    }),
    buildPhase({
      order: 6,
      kind: 'fix',
      title: '修正ループ',
      purpose: 'CI・レビュー・見た目の問題を短い修正依頼で潰す。',
      agentInstruction: 'CI失敗、レビュー指摘、UIの迷いを確認し、必要最小限の修正を行ってください。大きな作り直しは避けてください。',
      doneWhen: ['未解決のCI失敗がない', '危険な変更が残っていない', '修正理由が説明されている'],
    }),
    buildPhase({
      order: 7,
      kind: 'final-polish',
      title: '仕上げレビュー',
      purpose: '完成候補として見せられる状態かを最終確認する。',
      agentInstruction: `「${appName}」を完成候補としてレビューしてください。UI、スマホ、README、安全停止点、次フェーズを確認し、必要な最後の小修正だけ行ってください。`,
      doneWhen: ['完成候補レポートがある', 'スマホ確認観点がある', '次に人間が見る点だけ残っている'],
    }),
  ];

  return {
    id: makeId('deep-build'),
    appName,
    oneLineIdea,
    goal,
    currentPhaseId: phases[0]?.id,
    overallStatus: 'planning',
    phases,
    completionContract: buildDefaultDeepBuildCompletionContract(),
    createdAt: now,
    updatedAt: now,
  };
}
