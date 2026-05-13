# だらけ初期設定チェックリスト

だらけdev app を「できるだけ人間が考えない」状態に近づけるためのチェックリストです。

Secret の中身はチャットにもコードにも貼りません。
入れる場所だけ確認します。

---

## すぐ開くリンク

```text
GitHubの登録ページ
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/settings/secrets/actions/new
```

```text
CloudflareのAPI Tokenページ
https://dash.cloudflare.com/profile/api-tokens
```

```text
GitHubのToken作成ページ
https://github.com/settings/personal-access-tokens
```

```text
Cloudflare Setup実行ページ
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/cloudflare-setup.yml
```

---

## Phase 86でさらに楽になったこと

`CLOUDFLARE_ACCOUNT_ID` は、基本は手入力しなくてもよい形に近づけました。

Cloudflare Setup は、GitHub側に `CLOUDFLARE_ACCOUNT_ID` がなければ、Cloudflare APIからアカウント一覧を見に行きます。

```text
Cloudflareアカウントが1つだけ
→ 自動採用
```

```text
Cloudflareアカウントが複数ある
→ CLOUDFLARE_ACCOUNT_ID もGitHub側に登録する
```

---

## 基本的にGitHub側へ登録する2つ

まずはこの2つで進められる可能性があります。

```text
CLOUDFLARE_API_TOKEN
WORKER_GITHUB_TOKEN
```

一番近いURL:

```text
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/settings/secrets/actions/new
```

---

## 複数アカウントの場合だけ追加するもの

Cloudflareアカウントが複数ある場合だけ、これも追加します。

```text
CLOUDFLARE_ACCOUNT_ID
```

---

## すでにコード側に入ったもの

```text
GITHUB_ISSUE_CREATE_ENABLED = true
```

これは Secret ではありません。
そのため `wrangler.toml` の `[vars]` で管理します。

---

## 役割の違い

```text
CLOUDFLARE_API_TOKEN
CloudflareをGitHub Actionsから再デプロイするための鍵
→ GitHub側に入れる
```

```text
WORKER_GITHUB_TOKEN
だらけdev app がGitHubにIssueを作るための鍵
→ GitHub側に入れる
→ ActionsがCloudflare Workerの GITHUB_TOKEN として同期する
```

```text
CLOUDFLARE_ACCOUNT_ID
Cloudflareのアカウントを特定するID
→ 1アカウントなら自動推定
→ 複数アカウントならGitHub側に入れる
```

---

## いちばん楽な順番

```text
1. CloudflareのAPI Tokenページを開く
2. GitHubのToken作成ページを開く
3. GitHubの登録ページを開く
4. まず2つの名前で保存する
5. Cloudflare Setup実行ページを開く
6. Run workflow を押す
7. 複数アカウントで止まった時だけ CLOUDFLARE_ACCOUNT_ID を追加する
8. だらけdev app に戻って「設定したので再チェック」
```

---

## やらなくていいこと

```text
GITHUB_ISSUE_CREATE_ENABLED をCloudflare画面で毎回探して入れる
```

これは Phase 82 以降、`wrangler.toml` に入っているので、GitHub Actions から反映できます。

```text
GITHUB_TOKEN をCloudflare画面で探して入れる
```

これは Phase 85 以降、`WORKER_GITHUB_TOKEN` をGitHub側に入れて `Cloudflare Setup` を実行すれば、自動同期できます。

---

## 迷った時の見方

```text
Cloudflareアカウントが複数と出た
→ CLOUDFLARE_ACCOUNT_ID をGitHub側に追加する
```

```text
GitHub Tokenがないと言われる
→ WORKER_GITHUB_TOKEN がGitHub側にない、またはCloudflare Setupが未実行の可能性
```

```text
リポジトリURLを聞かれる
→ テストなら darake-dev-app-AI のURLで進める
```

---

## だらけるための方針

```text
普通のON/OFF設定は wrangler.toml に置く
強い鍵はGitHub側の安全な登録場所にまとめる
Cloudflareへの反映は Actions に任せる
分かるものはActionsが自動推定する
人間は最初の登録とRun workflowだけやる
```
