export type IssueManualGuideStep = {
  id: string;
  title: string;
  detail: string;
};

export const issueManualGuideUrl = 'https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/issues/new';

export const issueManualGuideSteps: IssueManualGuideStep[] = [
  {
    id: 'copy-title',
    title: '1. タイトルを確認',
    detail: 'Issue下書きのタイトルをGitHubのTitle欄へ入れます。',
  },
  {
    id: 'copy-body',
    title: '2. 本文を貼る',
    detail: 'Issue下書きのMarkdown本文をGitHubの本文欄へ貼ります。',
  },
  {
    id: 'scan-secrets',
    title: '3. secretがないか見る',
    detail: 'token、API key、password、環境変数の値が本文にないことだけ確認します。',
  },
  {
    id: 'submit-manually',
    title: '4. 自分でSubmitする',
    detail: '内容に納得した時だけ、GitHub側のSubmit new issueを押します。',
  },
];
