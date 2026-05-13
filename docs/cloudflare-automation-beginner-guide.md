# Cloudflare設定を自動化するための最初の1回ガイド

だらけdev app が Cloudflare へ自動デプロイできるようにするには、最初に1回だけ GitHub側に鍵を入れます。

この鍵はチャットやコードには貼りません。
GitHub の安全な登録場所にだけ入れます。

---

## すぐ開くリンク

```text
CloudflareのAPI Tokenページ
https://dash.cloudflare.com/profile/api-tokens
```

```text
GitHubのToken作成ページ
https://github.com/settings/personal-access-tokens
```

```text
GitHubの登録ページ
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/settings/secrets/actions/new
```

```text
Cloudflare Setup実行ページ
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/cloudflare-setup.yml
```

---

## 何を自動化するの？

今までCloudflare画面で探していたON/OFFスイッチ、Worker用のGitHub鍵、そして分かる場合のCloudflare Account IDを、GitHub Actions側で処理します。

```text
GITHUB_ISSUE_CREATE_ENABLED = true
```

これは `wrangler.toml` の `[vars]` で管理します。

```text
GITHUB_TOKEN
```

これはCloudflare Worker側のSecretとして、GitHub側に登録した `WORKER_GITHUB_TOKEN` から同期します。

```text
CLOUDFLARE_ACCOUNT_ID
```

これは、Cloudflareアカウントが1つだけなら Actions が自動推定します。

---

## 人間が最初に1回だけやること

まずは GitHub のこのリポジトリに、次の2つを登録します。

```text
CLOUDFLARE_API_TOKEN
WORKER_GITHUB_TOKEN
```

Cloudflareアカウントが複数ある場合だけ、あとからこれも登録します。

```text
CLOUDFLARE_ACCOUNT_ID
```

---

## 1. CLOUDFLARE_API_TOKEN の作り方

一番近いURL:

```text
https://dash.cloudflare.com/profile/api-tokens
```

ここで API Token を作ります。

必要な目安:

```text
Account / Workers Scripts / Edit
```

コピーしたら、GitHub側の登録ページに入れます。

Secret name:

```text
CLOUDFLARE_API_TOKEN
```

⚠️ この値はチャットに貼らないでください。

---

## 2. WORKER_GITHUB_TOKEN の作り方

一番近いURL:

```text
https://github.com/settings/personal-access-tokens
```

ここでGitHubのTokenを作ります。

このTokenは、だらけdev app がGitHubにIssueを作るために使います。

作ったら、GitHub側の登録ページに入れます。

Secret name:

```text
WORKER_GITHUB_TOKEN
```

⚠️ この値もチャットに貼らないでください。

---

## 3. 入れる場所

一番近いURL:

```text
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/settings/secrets/actions/new
```

ここで以下を1つずつ追加します。

```text
CLOUDFLARE_API_TOKEN
WORKER_GITHUB_TOKEN
```

複数アカウントで止まった場合だけ、あとから追加します。

```text
CLOUDFLARE_ACCOUNT_ID
```

---

## 4. 自動デプロイを実行する場所

登録が終わったら、GitHub Actions で実行します。

一番近いURL:

```text
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/cloudflare-setup.yml
```

入力は基本このままでOKです。

```text
worker_name: darakedevapp
sync_worker_github_token: true
```

実行に成功すると、`wrangler.toml` の `[vars]` とWorker SecretがCloudflareに反映されます。

---

## 5. 終わったら何をする？

だらけdev app に戻って、次のボタンを押します。

```text
設定したので再チェック
```

---

## この自動化の考え方

```text
最初に1回だけ、必要な鍵をGitHub側に入れる
↓
次からは GitHub Actions が Cloudflare にデプロイする
↓
GITHUB_ISSUE_CREATE_ENABLED は wrangler.toml から反映される
↓
WORKER_GITHUB_TOKEN は Cloudflare Worker の GITHUB_TOKEN として同期される
↓
CLOUDFLARE_ACCOUNT_ID は1アカウントなら自動推定される
↓
人間はボタンを押すだけになる
```

だらけるための設定です。
