export type AppReviewResponseTemplate = {
  id: string;
  label: string;
  bodyTemplate: string;
};

export const APP_REVIEW_RESPONSE_TEMPLATES: AppReviewResponseTemplate[] = [
  {
    id: 'fixed-and-ready',
    label: '修正済みを丁寧に伝える',
    bodyTemplate:
      'ご指摘いただきありがとうございます。\n\n指摘いただいた点について修正を行いました。\n\n【修正内容】\n（具体的な修正内容をここに記載）\n\n修正後のビルドをご確認いただけますと幸いです。\n\nどうぞよろしくお願いいたします。',
  },
  {
    id: 'test-account-guide',
    label: 'テストアカウントを案内する',
    bodyTemplate:
      'ご指摘いただきありがとうございます。\n\nアプリの確認用テストアカウントをご提供します。\n\n【テストアカウント】\n- メールアドレス: （メールアドレスをここに記載）\n- パスワード: （パスワードをここに記載）\n\n【確認手順】\n（ログインから主要機能への手順をここに記載）\n\nご不明な点がございましたらお気軽にお問い合わせください。',
  },
  {
    id: 'feature-location-guide',
    label: '機能の場所を説明する',
    bodyTemplate:
      'ご指摘いただきありがとうございます。\n\nご確認いただきたい機能は以下の手順でアクセスできます。\n\n【アクセス手順】\n1. （手順1をここに記載）\n2. （手順2をここに記載）\n3. （手順3をここに記載）\n\nご確認よろしくお願いいたします。',
  },
  {
    id: 'privacy-explanation',
    label: 'プライバシー説明を補足する',
    bodyTemplate:
      'ご指摘いただきありがとうございます。\n\nプライバシーについて補足説明をさせていただきます。\n\n【データ収集について】\n（収集データの種類と用途をここに記載）\n\n【プライバシーポリシー】\n（プライバシーポリシーURLをここに記載）\n\nご確認よろしくお願いいたします。',
  },
  {
    id: 'misunderstanding-clarification',
    label: '誤解がある場合の説明',
    bodyTemplate:
      'ご指摘いただきありがとうございます。\n\n誤解を招いてしまい申し訳ございません。\n\n【ご説明】\n（誤解の解消説明をここに記載）\n\n必要に応じて説明文・スクショの修正も行います。\n\nどうぞよろしくお願いいたします。',
  },
  {
    id: 'additional-info',
    label: '追加情報の提供',
    bodyTemplate:
      'ご指摘いただきありがとうございます。\n\n以下の追加情報をご提供いたします。\n\n【追加情報】\n（追加情報をここに記載）\n\nご確認よろしくお願いいたします。',
  },
];

export function getAppReviewResponseTemplate(id: string): AppReviewResponseTemplate | undefined {
  return APP_REVIEW_RESPONSE_TEMPLATES.find((t) => t.id === id);
}
