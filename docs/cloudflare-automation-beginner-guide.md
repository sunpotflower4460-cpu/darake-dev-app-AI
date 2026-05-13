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
GitHubの登録ページ
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/settings/secrets/actions/new
```

```text
Cloudflare Setup実行ページ
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/cloudflare-setup.yml
```

```text
Cloudflare Workers & Pages
https://dash.cloudflare.com/?to=/:account/workers-and-pages
```

---

## 何を自動化するの？

今までCloudflare画面で探していた次のON/OFFスイッチを、リポジトリ側の `wrangler.toml` で管理します。

```text
GITHUB_ISSUE_CREATE_ENABLED = true
```

これは、だらけdev app が GitHub に Issue、つまり作業メモを作れるようにするための ON/OFF スイッチです。

Phase 82 以降、この値は `wrangler.toml` に入っています。
そのため、Cloudflare画面でこの名前を手入力し続ける必要はありません。

---

## 人間が最初に1回だけやること

GitHub のこのリポジトリに、次の2つを登録します。

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

この2つを入れた後は、GitHub Actions の `Cloudflare Setup` を押すだけで、`wrangler.toml` の内容が Cloudflare に反映されます。

---

## 1. CLOUDFLARE_ACCOUNT_ID の場所

Cloudflare で確認します。

一番近いURL:

```text
https://dash.cloudflare.com/?to=/:account/workers-and-pages
```

見つけたらコピーして、GitHub側の登録ページに入れます。

一番近いURL:

```text
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/settings/secrets/actions/new
```

Secret name:

```text
CLOUDFLARE_ACCOUNT_ID
```

Secret value:

```text
Cloudflare の Account ID
```

---

## 2. CLOUDFLARE_API_TOKEN の作り方

一番近いURL:

```text
https://dash.cloudflare.com/profile/api-tokens
```

ここで API Token を作ります。

テンプレートが選べる場合は、できるだけ Worker を編集できる最小権限にします。

必要な目安:

```text
Account / Workers Scripts / Edit
```

作った Token は一度しか見えないことがあります。
コピーしたら、GitHub側の登録ページに入れます。

一番近いURL:

```text
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/settings/secrets/actions/new
```

Secret name:

```text
CLOUDFLARE_API_TOKEN
```

Secret value:

```text
Cloudflareで作ったAPI Token
```

⚠️ この値はチャットに貼らないでください。

---

## 3. 自動デプロイを実行する場所

2つの登録が終わったら、GitHub Actions で実行します。

一番近いURL:

```text
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/cloudflare-setup.yml
```

入力は基本このままでOKです。

```text
worker_name: darakedevapp
```

実行に成功すると、`wrangler.toml` の `[vars]` が Cloudflare に反映されます。

```text
GITHUB_ISSUE_CREATE_ENABLED = true
```

---

## 4. 終わったら何をする？

だらけdev app に戻って、次のボタンを押します。

```text
設定したので再チェック
```

---

## もしまた止まったら

次に出る可能性があるのは `GITHUB_TOKEN` です。

これは GitHub に Issue を作るための GitHub 側の鍵です。
これもチャットには貼らず、Cloudflare Worker Secret として入れます。

---

## この自動化の考え方

```text
最初に1回だけ、人間がCloudflareを操作できる鍵をGitHub側に入れる
↓
次からは GitHub Actions が Cloudflare にデプロイする
↓
GITHUB_ISSUE_CREATE_ENABLED は wrangler.toml から自動反映される
↓
人間はボタンを押すだけになる
```

だらけるための設定です。
