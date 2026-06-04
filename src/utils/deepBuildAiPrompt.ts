import type { DeepBuildCompletionJudgement, DeepBuildPlan } from './deepBuildPlan';

export type DeepBuildAiPromptInput = {
  plan: DeepBuildPlan;
  judgement: DeepBuildCompletionJudgement;
};

export type DeepBuildAiPromptResult = {
  title: string;
  purpose: string;
  prompt: string;
};

const NOT_DOING_NOW = [
  'OpenAI / Claude / Gemini APIの直接呼び出し',
  'GitHub Issueの自動作成',
  'PR作成やマージの自動化',
  'private情報の自動送信',
  'AI回答の自動反映',
  'コードの自動生成・自動マージ',
];

function buildPurpose(judgement: DeepBuildCompletionJudgement): string {
  switch (judgement.status) {
    case 'complete-candidate':
      return '完成候補の最終確認と不足点レビュー';
    case 'not-ready':
      return '育成中のプロジェクト: 次に育てるべきポイント整理';
    case 'blocked-hard':
      return '停止/保留中のプロジェクト: 止める理由と再開条件の整理';
  }
}

function buildAiExpectation(judgement: DeepBuildCompletionJudgement): string[] {
  switch (judgement.status) {
    case 'complete-candidate':
      return [
        '- 完成候補として提出・公開する前に見落としがないか確認してください',
        '- 不足している点や懸念があれば箇条書きで挙げてください',
        '- 最終確認事項のチェックリストを出力してください',
      ];
    case 'not-ready':
      return [
        '- 次に優先的に取り組むべきポイントを整理してください',
        '- 今のフェーズから次のフェーズへ進むための具体的な手順を出力してください',
        '- ブロックしている問題があれば特定して解決策の候補を挙げてください',
      ];
    case 'blocked-hard':
      return [
        '- 停止している理由を整理し、再開条件を明確にしてください',
        '- 人間確認が必要なポイントを具体的に列挙してください',
        '- 安全に再開するための最初の一手を提案してください',
      ];
  }
}

function buildPhaseSummary(plan: DeepBuildPlan): string[] {
  const lines: string[] = [];
  const done = plan.phases.filter((p) => p.status === 'done').length;
  const blocked = plan.phases.filter((p) => p.status === 'blocked-hard').length;
  const inProgress = plan.phases.filter((p) => p.status !== 'done' && p.status !== 'blocked-hard').length;

  lines.push(`- 全Phase数: ${plan.phases.length}`);
  lines.push(`- 完了済み: ${done}`);
  lines.push(`- 進行中: ${inProgress}`);
  if (blocked > 0) {
    lines.push(`- 停止中: ${blocked}`);
  }

  const currentPhase = plan.currentPhaseId
    ? plan.phases.find((p) => p.id === plan.currentPhaseId)
    : plan.phases.find((p) => p.status !== 'done');

  if (currentPhase) {
    lines.push(`- 現在のPhase: ${currentPhase.title}（${currentPhase.status}）`);
    lines.push(`  目的: ${currentPhase.purpose}`);
  }

  return lines;
}

export function buildDeepBuildAiPrompt(input: DeepBuildAiPromptInput): DeepBuildAiPromptResult {
  const { plan, judgement } = input;
  const purpose = buildPurpose(judgement);
  const aiExpectation = buildAiExpectation(judgement);
  const phaseSummary = buildPhaseSummary(plan);

  const lines: string[] = [
    '# Deep Build Mode → AI手動コピー用プロンプト',
    '',
    '## 安全注意（必読）',
    '- このアプリから外部AI APIへ送信はしません（manual copy only）。',
    '- API key / token / secret は貼らないでください。',
    '- private情報や個人情報は貼る前に人間が確認し、不要部分は削除してください。',
    '- AIの回答は自動採用せず、人間が確認してから採用してください。',
    '',
    '## このプロンプトの目的',
    purpose,
    '',
    '## 判定結果',
    `- ステータス: ${judgement.title}`,
    `- メッセージ: ${judgement.message}`,
  ];

  if (judgement.blocking.length > 0) {
    lines.push('', '### ブロック要因');
    judgement.blocking.forEach((item) => lines.push(`- ${item}`));
  }

  if (judgement.missing.length > 0) {
    lines.push('', '### 不足している項目');
    judgement.missing.forEach((item) => lines.push(`- ${item}`));
  }

  lines.push(
    '',
    '## プロジェクト概要',
    `- アプリ名: ${plan.appName}`,
    `- 目標: ${plan.goal}`,
    `- 概要: ${plan.oneLineIdea}`,
    '',
    '## 熟成フェーズの現状',
    ...phaseSummary,
    '',
    '## AIに期待する出力形式',
    ...aiExpectation,
    '- 不足情報があれば先に質問してください。',
    '- 根拠が弱い推測は推測と明示してください。',
    '',
    '## Human Gate（必須）',
    '- 人間が最終判断します。AIの回答はあくまで参考情報です。',
    '- 本番公開・提出・課金・secret変更などは人間確認が必要です。',
    '- この回答を自動でコードやPRに反映しないでください。',
    '',
    '## まだやらないこと',
    ...NOT_DOING_NOW.map((item) => `- ${item}`),
  );

  const prompt = lines.join('\n');

  return { title: `Deep Build AI: ${judgement.title}`, purpose, prompt };
}
