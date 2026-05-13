# Cloudflare設定を自動化するための最初の1回ガイド

だらけdev app が Cloudflare の設定を自動で直せるようにするには、最初に1回だけ GitHub Secrets に鍵を入れます。

この鍵はチャットやコードには貼りません。
GitHub の Secrets にだけ入れます。

---

## 何を自動化するの？

今まで手動でやっていた次の作業を、GitHub Actions から自動でできるようにします。

```text
GITHUB_ISSUE_CREATE_ENABLED = true
```

これは、だらけdev app が GitHub に Issue、つまり作業メモを作れるようにするための ON/OFF スイッチです。

---

## 人間が最初に1回だけやること

GitHub のこのリポジトリに、次の2つを Secrets として入れます。

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

この2つを入れた後は、GitHub Actions の `Cloudflare Setup` を押すだけで Cloudflare 側の設定を反映できます。

---

## 1. CLOUDFLARE_ACCOUNT_ID の場所

Cloudflare で確認します。

```text
Cloudflare
→ 右上のアカウント / または Workers & Pages の画面
→ Account ID を探す
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

## 4. 自動設定を実行する場所

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
issue_create_enabled: true
```

実行に成功すると、Cloudflare 側に次が反映されます。

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
これもチャットには貼らず、Cloudflare や GitHub Secrets に入れます。

---

## この自動化の考え方

```text
最初に1回だけ、人間が強い鍵を安全な場所に入れる
↓
次からは GitHub Actions が Cloudflare 設定を直す
↓
人間はボタンを押すだけになる
```

だらけるための設定です。
