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

## まず今できていること

Phase 82 で、次のON/OFFスイッチはリポジトリ側に入りました。

```text
GITHUB_ISSUE_CREATE_ENABLED = true
```

これは Secret ではありません。
そのため `wrangler.toml` の `[vars]` で管理します。

---

## Phase 85でさらに楽になったこと

以前は `GITHUB_TOKEN` をCloudflare画面で手入力する想定でした。

Phase 85では、GitHub側に `WORKER_GITHUB_TOKEN` として登録しておけば、`Cloudflare Setup` がCloudflare Worker側の `GITHUB_TOKEN` として同期できるようにします。

---

## 最初にGitHub側へ登録する3つ

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
WORKER_GITHUB_TOKEN
```

一番近いURL:

```text
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/settings/secrets/actions/new
```

入れる場所:

```text
GitHub
→ darake-dev-app-AI
→ Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

---

## 役割の違い

```text
CLOUDFLARE_API_TOKEN
CloudflareをGitHub Actionsから再デプロイするための鍵
→ GitHub側に入れる
```

```text
CLOUDFLARE_ACCOUNT_ID
Cloudflareのアカウントを特定するID
→ GitHub側に入れる
```

```text
WORKER_GITHUB_TOKEN
だらけdev app がGitHubにIssueを作るための鍵
→ GitHub側に入れる
→ ActionsがCloudflare Workerの GITHUB_TOKEN として同期する
```

---

## いちばん楽な順番

```text
1. CloudflareのAPI Tokenページを開く
2. GitHubのToken作成ページを開く
3. GitHubの登録ページを開く
4. 3つの名前で保存する
5. Cloudflare Setup実行ページを開く
6. Run workflow を押す
7. だらけdev app に戻って「設定したので再チェック」
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
Issue作成がOFFと言われる
→ Cloudflare Setup がまだ反映されていない可能性
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
人間は最初の登録とRun workflowだけやる
```
