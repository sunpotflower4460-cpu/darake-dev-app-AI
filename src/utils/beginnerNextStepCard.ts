export type BeginnerNextStepCard = {
  title: string;
  message: string;
  nextStepLabel: string;
  nextStepDetail: string;
  doNotWorry: string[];
  stopIf: string[];
};

export function buildBeginnerNextStepCard(): BeginnerNextStepCard {
  return {
    title: '次はこれだけ',
    message: 'Cloud Agentに指示書を貼ります。',
    nextStepLabel: 'やること',
    nextStepDetail:
      'ぽん開始パックの「Cloud Agent指示だけコピー」を押して、Cloud Agentのチャットに貼ってください。それだけです。',
    doNotWorry: [
      'GitHubの細かい設定は後でOK',
      'App Store提出はまだしません',
      'APIキーはまだ不要です',
      'ログインや課金は後で考えます',
      'エラーが出ても止まらなくて大丈夫です',
    ],
    stopIf: [
      'tokenを求められた時',
      '課金や本番公開が出た時',
      'API keyを入力するよう言われた時',
      'GitHubへの投稿を求められた時',
      'App Storeへの提出を求められた時',
    ],
  };
}
