# Phase 7: GitHub書き込みゲート設計（安全監査）

この文書は、Phase 7 で GitHub へ変更を加える操作を扱う前に、安全境界を明確にするための監査メモです。  
対象は「Issue作成フローの安全確認」と「次に進める操作の境界整理」です。

---

## 1. リスク分類（Phase 7）

### low
- Issue作成
- コメント下書き生成

### medium
- ラベル追加
- Issue本文更新
- PR本文更新

### high
- PR作成
- ブランチ作成
- workflow手動補助

### blocked for now
- マージ
- 強い自動化
- 設定変更

---

## 2. 既存Issue作成フロー監査

監査対象:
- `src/components/GitHubDirectIssueCreatePanel.tsx`
- `src/utils/githubIssueCreateClient.ts`
- `worker/index.ts` (`/api/github/issues/create`)

確認結果:
- ブラウザ側は `/api/github/issues/create` へ必要データのみ送信し、tokenを保持しない
- Worker側で `GITHUB_ISSUE_CREATE_ENABLED` を確認し、無効時は停止する
- Worker側で `GITHUB_TOKEN` を Secret として使用し、レスポンスへ返さない
- Worker側で許可リポジトリ (`GITHUB_ALLOWED_REPOS` + KV allowlist) を確認する
- 無効設定や許可外リポジトリ、入力不正、GitHub API失敗時は明示エラーを返す

---

## 3. Issue作成前ゲート（今回の明確化）

Issue作成前に、次を必須とする:
- 作成内容のプレビュー表示（タイトル・本文）
- ユーザーの明示確認チェック

`GitHubDirectIssueCreatePanel` では、チェックが入るまで `Issueを作成する` ボタンを有効化しない。

---

## 4. 秘密情報の扱い

維持する原則:
- 認証情報をブラウザに置かない
- GitHub書き込みは Worker 経由のみ
- token/secret は Worker Secret で管理し、UIへ返さない

---

## 5. PR作成の扱い（次Phase候補）

このIssueでは PR作成を実装しない。  
次Phaseで扱う候補は次の範囲まで:
- PR作成の準備データ作成
- PR本文のプレビュー
- 実行前の手動確認

実際のPR作成実行は、別Issueで安全ゲートを再確認してから進める。

---

## 6. このIssueで扱わないもの

- マージ操作
- workflow実行操作
- 秘密情報・権限設定の変更
- 強い自動化

「大きな操作は止める」「不明なら手動確認へ寄せる」を継続する。
