export type SubmitForReviewManualGuide = {
  title: string;
  steps: Array<{
    number: number;
    label: string;
    detail: string;
  }>;
  stopConditions: string[];
  preSubmitChecks: string[];
  importantNote: string;
};

export function buildSubmitForReviewManualGuide(): SubmitForReviewManualGuide {
  return {
    title: 'Submit for Review 手順カード',
    steps: [
      {
        number: 1,
        label: 'App Store Connectを開く',
        detail: 'https://appstoreconnect.apple.com にブラウザでアクセスする',
      },
      {
        number: 2,
        label: '対象アプリを選ぶ',
        detail: 'My Appsから提出するアプリを選択する',
      },
      {
        number: 3,
        label: '対象バージョンを開く',
        detail: '「iOS App」セクションで提出するバージョンを開く',
      },
      {
        number: 4,
        label: 'ビルドを確認する',
        detail: 'TestFlightから連携されたビルドが選択されているか確認する',
      },
      {
        number: 5,
        label: 'メタデータを確認する',
        detail: 'アプリ名・説明文・サブタイトル・プロモーション文・キーワードを確認する',
      },
      {
        number: 6,
        label: 'スクショを確認する',
        detail: '必要枚数がアップロードされているか、private情報がないかを確認する',
      },
      {
        number: 7,
        label: 'Privacy / Age Ratingを確認する',
        detail: 'プライバシー設定・年齢レーティングがすべて入力されているか確認する',
      },
      {
        number: 8,
        label: 'Review Notesを確認する',
        detail: 'ログイン・課金・特定機能がある場合、審査メモに必要情報を記入する',
      },
      {
        number: 9,
        label: 'Add for Reviewを確認する',
        detail: 'バージョンのステータスが「Ready to Submit」になっているか確認する',
      },
      {
        number: 10,
        label: 'Draft Submissionを確認する',
        detail: '提出内容の最終プレビューを確認する',
      },
      {
        number: 11,
        label: 'Submit for Reviewを押す',
        detail: '最後のSubmitボタンは必ず人間が押す。このアプリは自動提出しない。',
      },
    ],
    stopConditions: [
      'ビルドが選択されていない',
      'メタデータに空欄がある（必須項目）',
      'スクショがアップロードされていない',
      'プライバシー設定にunknownがある',
      '年齢レーティングが未設定',
      '審査メモが必要なのに空欄',
      'IAPが未設定（課金があるアプリ）',
      'TestFlightで未確認のクラッシュがある',
    ],
    preSubmitChecks: [
      '全必須メタデータが入力済み',
      'スクショが最低1枚アップロード済み',
      'プライバシー・年齢レーティングが設定済み',
      '審査メモに必要情報が記入済み',
      'ビルドが選択済み',
      'TestFlightで主要機能が動作確認済み',
    ],
    importantNote:
      'このアプリはSubmit for Reviewを押しません。「ここから先は人間」です。App Store Connectを開いて、上記手順を人間が行ってください。',
  };
}
