# Cloudflare設定を自動化するための最初の1回ガイド

だらけdev app が Cloudflare へ自動デプロイできるようにするには、最初に1回だけ GitHub Secrets に鍵を入れます。

この鍵はチャットやコードには貼りません。
GitHub の Secrets にだけ入れます。

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

GitHub のこのリポジトリに、次の2つを Secrets として入れます。

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

この2つを入れた後は、GitHub Actions の `Cloudflare Setup` を押すだけで、`wrangler.toml` の内容が Cloudflare に反映されます。

---

## 1. CLOUDFLARE_ACCOUNT_ID の場所

Cloudflare で確認します。

```text
Cloudflare
→ Workers & Pages
→ 右側や下の方にある Account ID を探す
```

見つけたらコピーして、GitHub Secrets に入れます。

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

Cloudflare で API Token を作ります。

```text
Cloudflare
→ 右上の人型アイコン
→ My Profile
→ API Tokens
→ Create Token
```

テンプレートが選べる場合は、できるだけ Worker を編集できる最小権限にします。

必要な目安:

```text
Account / Workers Scripts / Edit
```

作った Token は一度しか見えないことがあります。
コピーしたら、GitHub Secrets に入れます。

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

## 3. GitHub Secrets に入れる場所

GitHub でこのリポジトリを開きます。

```text
GitHub
→ darake-dev-app-AI
→ Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

ここで、次の2つを追加します。

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

---

## 4. 自動デプロイを実行する場所

2つのSecretを入れたら、GitHub Actions で実行します。

```text
GitHub
→ darake-dev-app-AI
→ Actions
→ Cloudflare Setup
→ Run workflow
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

## 5. 終わったら何をする？

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
最初に1回だけ、人間がCloudflareを操作できる鍵をGitHub Secretsに入れる
↓
次からは GitHub Actions が Cloudflare にデプロイする
↓
GITHUB_ISSUE_CREATE_ENABLED は wrangler.toml から自動反映される
↓
人間はボタンを押すだけになる
```

だらけるための設定です。
