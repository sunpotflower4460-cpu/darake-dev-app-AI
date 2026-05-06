import type { AiTaskTypeId } from './aiTaskTypeRegistry';

export type AiResultIntakeGuide = {
  taskType: AiTaskTypeId;
  expectedResult: string;
  pasteTargets: Array<{
    panelName: string;
    fieldName: string;
    note: string;
  }>;
  nextActions: string[];
  cautions: string[];
};

export const AI_RESULT_INTAKE_GUIDES: AiResultIntakeGuide[] = [
  {
    taskType: 'screenshot-ui-review',
    expectedResult: 'UIレビュー結果、blockers、修正提案、次アクション。',
    pasteTargets: [
      { panelName: 'AiReviewResultRecordPanel', fieldName: 'review result', note: 'AIレビュー本文を保存する。' },
      { panelName: 'UiCheckResultBridgePanel', fieldName: 'bridge note', note: 'UI修正に変換する要点を転記する。' },
      { panelName: 'AiReviewFixIssueDraftPanel', fieldName: 'issue draft', note: '修正Issue案に落とし込む。' },
    ],
    nextActions: ['blockerがあれば修正Issueを作る', 'UiCheck系パネルへ橋渡しする', 'private情報指摘があれば即差し替える'],
    cautions: ['AI結果をそのまま採用しない', '画像内private情報の確認は人間が最終判断する'],
  },
  {
    taskType: 'store-copy-review',
    expectedResult: 'ストア文面の改善案、危険表現、差し替え候補。',
    pasteTargets: [
      { panelName: 'AppStoreMetadataDraftPanel', fieldName: 'description/subtitle', note: '改善案をメタデータ下書きへ反映。' },
      { panelName: 'StoreCopyTemplatePanel', fieldName: 'template note', note: '使えそうな表現をテンプレへ寄せる。' },
      { panelName: 'AppStorePrepCompletionReportPanel', fieldName: 'review memo', note: 'レビュー実施メモとして残す。' },
    ],
    nextActions: ['ガイドライン違反表現を除去する', 'サブタイトルと説明文を再確認する', '最終版は人間がApp Store視点で読む'],
    cautions: ['誇大表現や断定表現は人間が再点検する'],
  },
  {
    taskType: 'app-store-risk-review',
    expectedResult: '審査リスク一覧、privacy・年齢レーティング注意、修正提案。',
    pasteTargets: [
      { panelName: 'AppStoreMetadataDraftPanel', fieldName: 'reviewNotes / privacyNotes', note: '審査リスク注意点を書き戻す。' },
      { panelName: 'PrivacyAgeRatingDraftPanel', fieldName: 'age rating note', note: '年齢レーティング観点へ反映する。' },
      { panelName: 'SubmissionControlRoomPanel', fieldName: 'manual check note', note: '提出前チェックに追加する。' },
    ],
    nextActions: ['high riskなら提出前に人間レビューを増やす', 'privacy関連は一次情報で再確認する'],
    cautions: ['法務・ガイドライン判断はAIだけで確定しない'],
  },
  {
    taskType: 'rejection-response-review',
    expectedResult: '改善済み返答文、トーン改善点、説明不足メモ。',
    pasteTargets: [
      { panelName: 'AppReviewResponseDraftPanel', fieldName: 'response body', note: '改善された返答文を反映する。' },
      { panelName: 'RejectionFixIssueDraftPanel', fieldName: 'fix summary', note: '必要な修正作業をIssue化する。' },
      { panelName: 'AppStorePrepCompletionReportPanel', fieldName: 'rejection memo', note: '今回の学びを残す。' },
    ],
    nextActions: ['返答前に事実確認する', 'App Reviewへ送る前に英語/日本語の表現を再確認する'],
    cautions: ['レビュアー向け情報にsecretや個人情報を入れない'],
  },
  {
    taskType: 'pr-review',
    expectedResult: 'PR要約、must fix、merge recommendation。',
    pasteTargets: [
      { panelName: 'AiReviewResultRecordPanel', fieldName: 'PR review result', note: 'レビュー本文を保存する。' },
      { panelName: 'GitHubOperationCandidatePanel', fieldName: 'PR comment draft', note: 'コメント下書きに転記する。' },
      { panelName: 'PrMergeCandidateGatePanel', fieldName: 'manual gate memo', note: 'merge判断材料にする。' },
    ],
    nextActions: ['must fixをIssueまたはPRコメント化する', 'merge recommendationは人間が最終判断する'],
    cautions: ['差分全文の外部送信前にprivate情報を必ず除去する'],
  },
  {
    taskType: 'code-risk-review',
    expectedResult: 'コードリスク、must fix、追加レビュー点。',
    pasteTargets: [
      { panelName: 'AiReviewResultRecordPanel', fieldName: 'risk review result', note: '危険箇所の記録として残す。' },
      { panelName: 'GitHubOperationCandidatePanel', fieldName: 'issue/comment draft', note: '修正依頼の下書きに使う。' },
      { panelName: 'SafetyInvariantAuditPanel', fieldName: 'audit note', note: '安全監査の見直し項目に転記する。' },
    ],
    nextActions: ['高リスクならhuman reviewを追加する', '安全方針への違反がないか再点検する'],
    cautions: ['AIの指摘を採用する前に実コードを再確認する'],
  },
  {
    taskType: 'release-note-draft',
    expectedResult: 'リリースノートの改善案と短縮案。',
    pasteTargets: [
      { panelName: 'ReleaseRecordPanel', fieldName: 'release note', note: '最終候補を反映する。' },
      { panelName: 'LaunchPromotionMemoPanel', fieldName: 'copy idea', note: '告知文へ転用できる表現を抜き出す。' },
    ],
    nextActions: ['ユーザー向けのわかりやすさを人間が最終確認する'],
    cautions: ['未公開情報や今後の約束を断定表現で出さない'],
  },
  {
    taskType: 'cloud-agent-instruction-review',
    expectedResult: '指示書の改善点、安全ガード不足、改善案。',
    pasteTargets: [
      { panelName: 'CloudAgentInstructionGeneratorPanel', fieldName: 'instruction text', note: '指示書の文面を磨く。' },
      { panelName: 'DarakeTopCommandPanel', fieldName: 'top command memo', note: '全体方針に反映する。' },
    ],
    nextActions: ['禁止事項とmanual gateが明確か再確認する'],
    cautions: ['外部実行前提の文言をそのまま採用しない'],
  },
  {
    taskType: 'phase-plan-review',
    expectedResult: 'Phase計画の改善点、分割案、見落とし候補。',
    pasteTargets: [
      { panelName: 'CloudAgentInstructionGeneratorPanel', fieldName: 'phase plan', note: 'Phase計画へ反映する。' },
      { panelName: 'Phase24IntegrationCompletionReportPanel', fieldName: 'next phase note', note: '次Phase候補の参考にする。' },
    ],
    nextActions: ['Phase境界とdone conditionを見直す'],
    cautions: ['AI提案は必ず現行repo構造に照らして採用判断する'],
  },
  {
    taskType: 'bug-triage',
    expectedResult: 'severity、不足情報、次アクション。',
    pasteTargets: [
      { panelName: 'IssueDraftPanel', fieldName: 'issue body', note: 'triage内容をIssue草案にする。' },
      { panelName: 'IssueRecordPanel', fieldName: 'triage note', note: '記録として残す。' },
    ],
    nextActions: ['再現手順と影響範囲を人間が追記する'],
    cautions: ['ユーザー情報が入ったログをそのまま貼らない'],
  },
  {
    taskType: 'ux-copy-polish',
    expectedResult: '短い文言案、丁寧な文言案、危険表現メモ。',
    pasteTargets: [
      { panelName: 'StoreCopyTemplatePanel', fieldName: 'copy idea', note: '再利用できる表現をテンプレへ戻す。' },
      { panelName: 'AppStoreMetadataDraftPanel', fieldName: 'subtitle/promotionalText', note: 'UX copy候補として反映する。' },
    ],
    nextActions: ['対象画面に本当に合う文言か実画面で確認する'],
    cautions: ['断定・誤認・過度な煽り表現は採用しない'],
  },
];

export function getAiResultIntakeGuide(taskType: AiTaskTypeId): AiResultIntakeGuide | undefined {
  return AI_RESULT_INTAKE_GUIDES.find((guide) => guide.taskType === taskType);
}

export function formatAiResultIntakeGuideMarkdown(guide: AiResultIntakeGuide): string {
  const lines: string[] = [
    `# AI Result Intake Guide: ${guide.taskType}`,
    '',
    '## Expected Result',
    guide.expectedResult,
    '',
    '## Paste Targets',
  ];

  guide.pasteTargets.forEach((target) => {
    lines.push(`- ${target.panelName} / ${target.fieldName}: ${target.note}`);
  });

  lines.push('', '## Next Actions');
  guide.nextActions.forEach((action) => lines.push(`- ${action}`));
  lines.push('', '## Cautions');
  guide.cautions.forEach((caution) => lines.push(`- ${caution}`));

  return lines.join('\n');
}
