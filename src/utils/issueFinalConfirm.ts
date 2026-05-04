import type { IssueDraft } from '../data/issueDraft';
import type { DraftCheck } from './checkIssueDraft';

export type IssueFinalConfirm = {
  title: string;
  status: 'ready-to-review' | 'needs-care';
  message: string;
  gateLabel: string;
  stopReasons: string[];
  finalLines: string[];
};

export function buildIssueFinalConfirm(draft: IssueDraft, checks: DraftCheck[]): IssueFinalConfirm {
  const careChecks = checks.filter((check) => check.level !== 'ok');
  const blockingChecks = checks.filter((check) => check.level === 'needs_care');
  const status = blockingChecks.length === 0 ? 'ready-to-review' : 'needs-care';

  return {
    title: status === 'ready-to-review' ? 'Issue投稿前の最終確認に進めます' : 'Issue投稿前にまだ整える場所があります',
    status,
    message:
      status === 'ready-to-review'
        ? '内容は下書きとして整っています。ただし、実際のIssue投稿はまだ手動ゲートで止めます。'
        : 'まだ投稿せず、目的や完了条件などを少し整えると安心です。',
    gateLabel: 'ここで手動確認',
    stopReasons: [
      'GitHubへ書き込む操作なので自動投稿はまだしない',
      '投稿前にユーザーがタイトルと本文を確認する',
      'secret / token / key が混ざっていないか見る',
      ...careChecks.map((check) => `${check.label}: ${check.message}`),
    ],
    finalLines: [
      `投稿タイトル: ${draft.title || '未入力'}`,
      `本文の目的: ${draft.intent || '未入力'}`,
      `作業範囲: ${draft.scope.length}件`,
      `完了条件: ${draft.done.length}件`,
      `まだやらないこと: ${draft.notDoing.length}件`,
    ],
  };
}
