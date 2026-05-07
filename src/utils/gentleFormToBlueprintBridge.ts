import { loadGentleAppStartForm } from './gentleAppStartForm';
import type { GentleAppStartForm } from './gentleAppStartForm';
import { getUiTemplateOption } from './uiTemplateOptions';

export type GentleFormToBlueprintBridge = {
  title: string;
  status: 'blocked' | 'ready' | 'needs-review';
  productBrief: string;
  mvpScope: string[];
  doNotBuild: string[];
  recommendedTemplate: string;
  recommendedTechStack: string;
  suggestedPhases: Array<{
    title: string;
    purpose: string;
    doneConditions: string[];
  }>;
  cloudAgentFirstInstruction: string;
  issueDraftTitle: string;
  issueDraftBody: string;
  warnings: string[];
  blockers: string[];
};

function inferTechStack(form: GentleAppStartForm): string {
  if (form.platform === 'iphone') return 'Expo / React Native';
  if (form.platform === 'web') return 'Vite + React + TypeScript';
  if (form.platform === 'both') return 'Expo / React Native + Vite + React';
  return 'Vite + React + TypeScript';
}

function inferTemplate(form: GentleAppStartForm): string {
  if (form.platform === 'iphone') return 'expo-typescript-template';
  return 'vite-react-ts-template';
}

function buildMvpScope(form: GentleAppStartForm): string[] {
  const scope = ['ホーム画面', '基本UI'];
  if (form.firstGoal === 'just-visible') {
    scope.push('静的な画面表示');
  } else if (form.firstGoal === 'usable-mvp' || form.firstGoal === 'app-store-ready') {
    scope.push('記録・入力フォーム', '履歴表示', 'ローカル保存');
  }
  if (form.firstGoal === 'app-store-ready') {
    scope.push('App Store提出用メタデータ', 'スクリーンショット');
  }
  if (form.uiTemplate === 'vision-board') {
    scope.push('宝地図カード表示', 'ボード表示の土台');
  }
  if (form.mustHave) {
    scope.push(form.mustHave);
  }
  return scope;
}

function buildDoNotBuild(form: GentleAppStartForm): string[] {
  const skip = ['ログイン / 認証', '課金・サブスクリプション', 'SNS共有'];
  if (form.firstGoal !== 'app-store-ready') {
    skip.push('App Store提出');
  }
  if (form.mustNotDo) {
    skip.push(form.mustNotDo);
  }
  return skip;
}

function buildSuggestedPhases(form: GentleAppStartForm): GentleFormToBlueprintBridge['suggestedPhases'] {
  const phases: GentleFormToBlueprintBridge['suggestedPhases'] = [
    {
      title: 'Phase 1: 画面の骨格',
      purpose: 'アプリの基本UI・ナビゲーション構造を作る',
      doneConditions: ['ホーム画面が表示できる', 'ナビゲーションが動く'],
    },
    {
      title: 'Phase 2: 記録機能',
      purpose: '入力フォームとローカル保存を実装する',
      doneConditions: ['フォームが入力できる', 'データがローカルに保存できる', '履歴が表示できる'],
    },
  ];

  if (form.uiTemplate === 'vision-board') {
    phases.push({
      title: 'Phase 3: 宝地図ボード',
      purpose: '生成画像カードを並べて眺められるボード体験を作る',
      doneConditions: ['カード一覧が見える', 'ボード上にカードを配置できる土台がある'],
    });
  } else if (form.firstGoal === 'usable-mvp' || form.firstGoal === 'app-store-ready') {
    phases.push({
      title: 'Phase 3: MVPの磨き込み',
      purpose: 'UXを整えて実用的なMVPにする',
      doneConditions: ['エラーハンドリングが動く', 'スマホで快適に使える'],
    });
  }

  if (form.firstGoal === 'app-store-ready') {
    phases.push({
      title: 'Phase 4: App Store準備',
      purpose: 'メタデータ・スクリーンショット・提出準備をする',
      doneConditions: ['App Storeメタデータが揃っている', 'スクリーンショットが取れている'],
    });
  }

  return phases;
}

export function buildGentleFormToBlueprintBridge(
  form?: GentleAppStartForm | null,
): GentleFormToBlueprintBridge {
  const f = form ?? loadGentleAppStartForm();

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!f) {
    blockers.push('やさしいフォームが未入力です');
  } else {
    if (!f.appName) blockers.push('アプリ名が未入力');
    if (!f.oneLineIdea) blockers.push('アプリ内容が未入力');
  }

  if (f && !f.targetUser) {
    warnings.push('対象ユーザーが未入力 — 後で追加できます');
  }

  const status: GentleFormToBlueprintBridge['status'] =
    blockers.length > 0 ? 'blocked' : warnings.length > 0 ? 'needs-review' : 'ready';

  if (!f) {
    return {
      title: 'やさしい設計書',
      status: 'blocked',
      productBrief: '',
      mvpScope: [],
      doNotBuild: [],
      recommendedTemplate: 'vite-react-ts-template',
      recommendedTechStack: 'Vite + React + TypeScript',
      suggestedPhases: [],
      cloudAgentFirstInstruction: '',
      issueDraftTitle: '',
      issueDraftBody: '',
      warnings: [],
      blockers: ['やさしいフォームが未入力です'],
    };
  }

  const uiTemplate = getUiTemplateOption(f.uiTemplate);
  const techStack = inferTechStack(f);
  const template = inferTemplate(f);
  const mvpScope = buildMvpScope(f);
  const doNotBuild = buildDoNotBuild(f);
  const suggestedPhases = buildSuggestedPhases(f);

  const productBrief = [
    `# ${f.appName || 'アプリ'}`,
    '',
    f.oneLineIdea ? `**内容**: ${f.oneLineIdea}` : '',
    f.targetUser ? `**対象ユーザー**: ${f.targetUser}` : '',
    `**プラットフォーム**: ${f.platform}`,
    `**雰囲気**: ${f.mainFeeling}`,
    `**UIテンプレート**: ${uiTemplate.label}`,
    `**見た目の方針**: ${uiTemplate.description}`,
    `**最初の目標**: ${f.firstGoal}`,
  ].filter(Boolean).join('\n');

  const cloudAgentFirstInstruction = [
    `# Cloud Agent 最初の指示`,
    '',
    `${f.appName || 'アプリ'} を作ります。`,
    '',
    `## 概要`,
    f.oneLineIdea || '（内容未入力）',
    '',
    `## 対象ユーザー`,
    f.targetUser || '未入力。アプリ内容から自然に補ってください。',
    '',
    `## 技術スタック`,
    techStack,
    '',
    `## UIテンプレート / 見た目`,
    `- 選択: ${uiTemplate.label}`,
    `- 説明: ${uiTemplate.description}`,
    `- 実装方針: ${uiTemplate.promptHint}`,
    '',
    `## 最初にやること`,
    `1. ${template} でプロジェクトを初期化する`,
    `2. ホーム画面を作る`,
    `3. 基本ナビゲーションを入れる`,
    `4. UIテンプレートの雰囲気が分かる最小画面を作る`,
    '',
    `## 外部APIは実行しない`,
    `- GitHub APIは実行しない`,
    `- App Store APIは実行しない`,
    `- AI APIは実行しない`,
    `- secretは保存しない`,
  ].join('\n');

  const issueDraftTitle = `[Phase 1] ${f.appName || 'アプリ'} — 画面の骨格`;
  const issueDraftBody = [
    `## 概要`,
    f.oneLineIdea || '（内容未入力）',
    '',
    `## UIテンプレート`,
    `- ${uiTemplate.label}: ${uiTemplate.description}`,
    '',
    `## やること`,
    ...mvpScope.slice(0, 3).map((m) => `- [ ] ${m}`),
    '',
    `## やらないこと`,
    ...doNotBuild.slice(0, 3).map((d) => `- ${d}`),
    '',
    `## 技術スタック`,
    techStack,
    '',
    `> これはdry-runの下書きです。GitHub APIは実行していません。`,
  ].join('\n');

  return {
    title: `${f.appName || 'アプリ'} — やさしい設計書`,
    status,
    productBrief,
    mvpScope,
    doNotBuild,
    recommendedTemplate: template,
    recommendedTechStack: techStack,
    suggestedPhases,
    cloudAgentFirstInstruction,
    issueDraftTitle,
    issueDraftBody,
    warnings,
    blockers,
  };
}
