# バックアップ・複数タブ同期

## 概要

このドキュメントでは、複数タブ間の状態同期と手動バックアップ機能について説明します。

## 複数タブ同期

### 仕組み

`subscribeDarakeRuntimeEvents` (src/utils/darakeRuntimeEvents.ts) が

- **同一タブ**: `darake:first-app-start-updated` CustomEvent を購読
- **別タブ**: ブラウザ標準の `storage` イベントを購読

の両方に対応しています。

`storage` イベントは、**自タブ以外**の同一オリジンのタブで localStorage が変更されたときに発火します。
キーが `darake.` で始まる場合のみリスナーが呼ばれます。

各コンポーネントはリスナー内で localStorage を再読み込みするため、別タブの変更が自動的に反映されます。

### 「別タブで新しい変更があります」通知

`DarakeBackupPanel` (src/components/DarakeBackupPanel.tsx) は、バックアップ対象キーが別タブで変更されたときに通知バナーを表示します。

---

## 手動バックアップ・復元

### バックアップ対象キー

| キー | 用途 |
|------|------|
| `darake.gentleAppStartForm.v1` | やさしいアプリ開始フォーム |
| `darake.omakaseStartState.v1` | おまかせ開始状態 |
| `darake.issueDraft.v1` | Issue下書き |

シークレット・APIトークン・Webhook URL はバックアップ対象外です。

### エクスポート

1. Settings タブの「バックアップ & 復元」パネルを開く
2. 「JSONファイルをダウンロード」ボタンを押す
3. `darake-backup-YYYY-MM-DD.json` がダウンロードされる

### インポート（復元）

1. Settings タブの「バックアップ & 復元」パネルを開く
2. ファイルを選択するか、JSONを直接テキストエリアに貼り付ける
3. 「インポートして復元」ボタンを押す

- バックアップに含まれないキーは変更されません
- バージョン番号が一致しない場合はエラーメッセージが表示され、データは書き換えられません
- JSON が壊れている・形式が違う場合もアプリはクラッシュしません

### バックアップ形式

```json
{
  "version": 1,
  "exportedAt": "2026-06-04T12:00:00.000Z",
  "data": {
    "darake.gentleAppStartForm.v1": { ... },
    "darake.omakaseStartState.v1": { ... },
    "darake.issueDraft.v1": { ... }
  }
}
```

`data` 内のキーは、localStorage に存在するもののみ含まれます。

---

## まだやらないこと

- 本番DB接続
- ログイン / 認証
- クラウド同期
- 他端末間の同期
- 複雑なマージUI
