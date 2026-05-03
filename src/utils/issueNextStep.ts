import type { IssueRecord } from './issueRecordStore';

export type IssueNextStep = {
  title: string;
  message: string;
  hasLink: boolean;
  url?: string;
};

export function getIssueNextStep(record: IssueRecord): IssueNextStep {
  const hasUrl = record.url.trim().length > 0;
  const hasNumber = record.number.trim().length > 0;

  if (hasUrl) {
    return {
      title: '次に見る場所があります',
      message: hasNumber ? `${record.number} を開いて、進み具合を確認できます。` : '保存したIssue URLを開けます。',
      hasLink: true,
      url: record.url,
    };
  }

  if (hasNumber) {
    return {
      title: 'Issue番号だけ記録されています',
      message: 'URLも貼っておくと、次回すぐ戻れます。',
      hasLink: false,
    };
  }

  return {
    title: 'まだ見る場所はありません',
    message: 'Issueを作ったら、番号やURLをここに残します。',
    hasLink: false,
  };
}
