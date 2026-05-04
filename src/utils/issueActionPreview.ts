import type { IssueDraft } from '../data/issueDraft';
import type { DraftCheck } from './checkIssueDraft';

export type IssueActionPreview = {
  title: string;
  status: 'ready' | 'needs-care';
  message: string;
  previewLines: string[];
  careCount: number;
};

export function buildIssueActionPreview(draft: IssueDraft, checks: DraftCheck[]): IssueActionPreview {
  const careChecks = checks.filter((check) => check.level !== 'ok');
  const status = careChecks.some((check) => check.level === 'needs_care') ? 'needs-care' : 'ready';

  return {
    title: status === 'ready' ? 'Issue作成前プレビューは整っています' : 'Issue作成前に少し確認します',
    status,
    message:
      status === 'ready'
        ? '下書きの目的、範囲、完了条件が見えています。実投稿前の確認カードとして使えます。'
        : 'まだ投稿はしません。気になる項目を整えてから実行前確認へ進みます。',
    previewLines: [
      `タイトル: ${draft.title}`,
      `目的: ${draft.intent}`,
      `やること: ${draft.scope.length}件`,
      `完了条件: ${draft.done.length}件`,
      `まだやらないこと: ${draft.notDoing.length}件`,
    ],
    careCount: careChecks.length,
  };
}
