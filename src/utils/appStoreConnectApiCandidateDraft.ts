export type AppStoreConnectApiCandidateDraft = {
  title: string;
  status: 'draft-only' | 'blocked';
  possibleOperations: string[];
  requiredManualSetup: string[];
  blockedConditions: string[];
  safetyNotes: string[];
};

export function buildAppStoreConnectApiCandidateDraft(): AppStoreConnectApiCandidateDraft {
  return {
    title: 'App Store Connect API 実行候補 下書き',
    status: 'draft-only',
    possibleOperations: [
      'メタデータ更新（app info, localizations）',
      'スクショアップロード（screenshot sets）',
      'バージョン情報更新（app store versions）',
      '審査メモ更新（review notes）',
      'ビルド情報参照（builds）',
      'バンドルID確認',
    ],
    requiredManualSetup: [
      'App Store Connect APIキーを Apple Developer で発行する（人間が行う）',
      'APIキーをCI secretに登録する（人間が行う）',
      'issuer ID と key ID を把握する（人間が行う）',
      'API実行前に人間が必ず内容を確認する',
    ],
    blockedConditions: [
      'APIキーがこのアプリに入力されていない（入力欄なし・意図的）',
      'Submit for ReviewのAPI実行は禁止（必ず人間が行う）',
      '本番データへの書き込みは人間の承認が必要',
      '課金・認証・プライバシー設定のAPI操作は超強いmanual gateが必要',
    ],
    safetyNotes: [
      'このPhaseではApp Store Connect APIを一切呼びません',
      'APIキーはこのアプリに入力しません（入力欄は作りません）',
      'APIキーはApple Developer / CI secret側で人間が管理します',
      'Submit for ReviewはAPI化しないか、しても別の超強いmanual gateが必要です',
      'このパネルは将来のAPI連携計画の参考メモです',
    ],
  };
}
