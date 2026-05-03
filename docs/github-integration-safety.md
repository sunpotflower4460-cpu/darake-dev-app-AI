# Phase 6.0: GitHub実データ読み取りの安全設計書

この文書は、Darake Dev App AI が GitHub の実データを扱い始める前に、守る境界線を固定するための設計書です。

目的は、開発を楽にすることです。ただし、楽にするために危険な自動化へ急がないことを最優先にします。

---

## 1. 基本方針

Darake Dev App AI は、まず「読むだけ」の管制室として育てます。

- 最初は GitHub の状態を読むだけ
- token や secret はブラウザへ出さない
- 書き込み操作は後のPhaseへ分離する
- 失敗したら mock / fallback 表示へ戻る
- 危険な変更は必ず手動ゲートで止める

このPhaseでは、Issue作成、PR作成、マージ、workflow再実行などの書き込みは行いません。

---

## 2. 読み取り対象

Phase 6で最初に読む候補は次の通りです。

### 2.1 PR一覧

- PR番号
- タイトル
- URL
- open / closed / merged
- head branch
- base branch
- updatedAt
- draft状態

### 2.2 CI / workflow状態

- workflow名
- run URL
- success / failure / in_progress / queued / cancelled / unknown
- 最終更新時刻
- 対象commit SHA

### 2.3 レビュー状態

- コメント件数
- レビュー件数
- 未解決っぽい項目の有無
- CodeRabbit要約の有無
- レート制限などの状態

### 2.4 マージ判断材料

- CI成功か
- PRがmergeableか
- draftではないか
- 危険差分がありそうか
- manual gate が必要か

---

## 3. まだ読まないもの

初期段階では、次の情報は読まなくてもよい、または扱いを慎重にします。

- secretの中身
- privateな本番環境変数
- 課金情報
- App Store Connect情報
- Firebase / Supabase の本番データ
- ユーザー個人情報
- 本番DBの中身

必要になった場合でも、表示するのは存在確認や設定状態だけにし、中身は表示しません。

---

## 4. 書き込み禁止範囲

Phase 6では、以下を自動実行しません。

- Issue作成
- ブランチ作成
- PR作成
- PR本文更新
- ラベル追加
- workflow再実行
- auto-merge有効化
- squash merge
- ファイル更新
- secret登録
- GitHub Actions permissions変更

これらはPhase 7以降で、個別に安全設計してから扱います。

---

## 5. secret / token の扱い

### 5.1 絶対ルール

- GitHub tokenをチャットに貼らない
- GitHub tokenをコードに書かない
- GitHub tokenをブラウザへ返さない
- public JSONにsecretを入れない
- ログにsecretを出さない

### 5.2 置き場所

必要なtokenは、次のどちらかに置きます。

- GitHub Actions secrets
- 将来のserverless環境変数

現時点では、GitHub Actions の `GITHUB_TOKEN` で読める範囲から始めるのが安全です。

---

## 6. 推奨アーキテクチャ

Phase 6の推奨は、ブラウザからGitHub APIを直接叩かない方式です。

```text
GitHub Actions
  ↓ GitHub状態を読み取り
snapshot/pr-watch.json
snapshot/review-watch.json
  ↓ artifact生成 or 手動public反映
public/*.json
  ↓
Darake Dev App AI が読み込み表示
```

この方式の利点は次の通りです。

- tokenをブラウザへ出さなくて済む
- GitHub Actionsの権限内で完結しやすい
- 失敗してもアプリが壊れにくい
- publicへ出す情報を事前に選別できる
- 手動更新workflowと相性がよい

---

## 7. public JSONに出してよい情報

public JSONに出してよいのは、ユーザーがGitHub画面でも普通に見られる開発状態だけです。

例：

- PRタイトル
- PR番号
- PR URL
- workflow名
- workflow URL
- status / conclusion
- review件数
- generatedAt
- risk判定
- next action候補

出してはいけないもの：

- token
- secret
- private env値
- 個人情報
- 生ログ全文の大量貼り付け
- 未加工の機密情報

---

## 8. 状態変換ルール

GitHubの実データは、Review Watchの状態へ変換します。

### CI

- success → `ok`
- in_progress / queued → `checking`
- failure / cancelled → `blocked`
- unknown → `manual`

### PR

- open + CI進行中 → `checking`
- open + manual review必要 → `manual`
- open + CI失敗 → `blocked`
- merged → `ok`

### Review

- コメントなし / 指摘なし → `ok`
- コメントあり → `manual`
- blocking指摘らしきものあり → `blocked`
- CodeRabbit rate limit → `manual`

---

## 9. リスク判定ルール

初期のriskは単純でよいです。

### low

- UI文言変更
- CSS調整
- docs追加
- mockデータ追加
- 型の小変更

### medium

- workflow変更
- package変更
- GitHub連携の構造変更
- service層追加
- 状態JSON schema変更

### high

- secret / env 周辺
- auth / billing / database
- GitHub Actions permissions write
- merge / delete / deploy系
- 大規模リファクタ
- App Store提出

### unknown

- 判定不能
- 外部データ不足
- JSON不正
- API取得失敗

---

## 10. 失敗時のfallback

GitHub状態取得に失敗しても、アプリ全体は止めません。

- JSONが読めない → fallbackデータ
- generatedAtが読めない → `unknown`
- statusが不正 → `manual`
- riskが不正 → `unknown`
- action.kindが不正 → actionを捨てる
- linksが不正 → linksを捨てる

不明なものは、自動で進めず「manual」に寄せます。

---

## 11. Phase 6の実装順

### Phase 6.1: PR一覧JSONをartifact生成

- GitHub ActionsでPR一覧を読む
- `snapshot/pr-watch.json` を生成
- artifactとして保存
- public反映はまだしない

### Phase 6.2: PR一覧をpublic JSONへ手動反映

- 手動workflowで `public/pr-watch.json` を更新
- 変更がある時だけcommit
- 画面で読み込み表示

### Phase 6.3: CI結果JSONを生成

- workflow runsを読む
- CI状態をReview Watch形式へ変換
- success / failure / in_progressを表示

### Phase 6.4: レビューコメント状態を読み取り

- コメント件数
- review件数
- CodeRabbit要約有無
- blocking不明ならmanualへ寄せる

---

## 12. 手動ゲート

Phase 6で人間確認が必要な場面：

- tokenやsecretを新しく作る必要がある
- GitHub Actions permissionsをwriteへ広げる必要がある
- public JSONに出す情報が増える
- private repoの情報を外へ出す可能性がある
- 書き込み操作へ進みたくなった時

この場合は、アプリ上でもチャット上でも「ここは手動です」と明示します。

---

## 13. Phase 6完了条件

Phase 6完了の目安：

- PR一覧がJSONとして出る
- CI状態がJSONとして出る
- Review Watchに実データ由来の状態が出る
- 古さ判定が効く
- manual / blocked があればアラートが出る
- tokenはブラウザに出ていない
- 書き込み操作はまだ入っていない

---

## 14. 合言葉

> 読むだけから始める。  
> 危険なら止まる。  
> 不明ならmanual。  
> secretは海底に沈めて、表には泡だけ出す。

Darake Dev App AI は、便利さより先に安全な怠け方を設計する。
