import { AppIdea } from './appIdeaBatch';

export type IdeaToBlueprintOutput = {
  appName: string;
  appSeed: string;
  mvp: string[];
  platform: string[];
  recommendedTemplate: string;
  firstPhase: string;
  doNotBuild: string[];
  cloudAgentFirstInstruction: string;
};

const TEMPLATE_MAPPING: Record<AppIdea['complexity'], string> = {
  small: 'simple-utility',
  medium: 'content-creator',
  large: 'productivity-tool',
};

export function convertIdeaToBlueprint(idea: AppIdea): IdeaToBlueprintOutput {
  const template = TEMPLATE_MAPPING[idea.complexity] ?? 'simple-utility';

  const mvp = [
    `${idea.title} のコア機能を最小限で実装する`,
    `${idea.targetUser} が直感的に使えるUI`,
    idea.monetizationHint ? `収益化: ${idea.monetizationHint}` : '無料版でMVP検証',
  ];

  const doNotBuild = [
    '必要になるまで認証機能を作らない',
    '複雑なダッシュボードを最初から作らない',
    `複雑度が ${idea.complexity} なので、スコープを厳守する`,
    '課金システムはMVP後に追加する',
  ];

  const cloudAgentFirstInstruction = [
    `# Cloud Agent 初回指示: ${idea.title}`,
    '',
    `## アプリの種`,
    idea.seed || '（seedを入力してください）',
    '',
    `## ターゲットユーザー`,
    idea.targetUser || '（ターゲットを入力してください）',
    '',
    `## プラットフォーム`,
    idea.platform.join(', '),
    '',
    `## 推奨テンプレート`,
    template,
    '',
    `## 最初にやること`,
    `1. ${idea.title} の新しいリポジトリを作成する`,
    `2. テンプレート (${template}) に基づいてプロジェクトをセットアップする`,
    `3. Phase 1 を開始する：基本的なUI実装`,
    '',
    `## 絶対にやらないこと`,
    ...doNotBuild.map((d) => `- ${d}`),
    '',
    '## 安全方針',
    '- 外部APIの自動実行なし',
    '- secretの保存なし',
    '- 本番操作はmanual gate',
  ].join('\n');

  return {
    appName: idea.title,
    appSeed: idea.seed,
    mvp,
    platform: idea.platform,
    recommendedTemplate: template,
    firstPhase: 'Phase 1: 基本UI実装・コアロジック',
    doNotBuild,
    cloudAgentFirstInstruction,
  };
}

export function formatIdeaToBlueprintMarkdown(output: IdeaToBlueprintOutput): string {
  return [
    `# Blueprint: ${output.appName}`,
    '',
    `## アプリの種`,
    output.appSeed || '未設定',
    '',
    `## プラットフォーム`,
    output.platform.join(', '),
    '',
    `## 推奨テンプレート`,
    output.recommendedTemplate,
    '',
    `## 最初のPhase`,
    output.firstPhase,
    '',
    '## MVP',
    ...output.mvp.map((m) => `- ${m}`),
    '',
    '## やらないこと',
    ...output.doNotBuild.map((d) => `- ${d}`),
    '',
    '## Cloud Agent 初回指示',
    output.cloudAgentFirstInstruction,
  ].join('\n');
}
