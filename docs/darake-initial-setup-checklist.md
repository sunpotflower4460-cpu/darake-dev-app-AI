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
Cloudflare Setup実行ページ
https://github.com/sunpotflower4460-cpu/darake-dev-app-AI/actions/workflows/cloudflare-setup.yml
```

```text
Cloudflare Workers & Pages
https://dash.cloudflare.com/?to=/:account/workers-and-pages
```

```text
GitHubのToken作成ページ
https://github.com/settings/personal-access-tokens
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

## これから必要になるもの

### 1. Cloudflareを自動で再デプロイするためのGitHub側登録

GitHub のこのリポジトリに入れます。

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
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

これが入ると、GitHub Actions の `Cloudflare Setup` で Cloudflare へ再デプロイできます。

---

### 2. GitHubにIssueを作るためのCloudflare Worker Secret

次にアプリが止まるとしたら、おそらくこれです。

```text
GITHUB_TOKEN
```

これは GitHub に Issue を作るための鍵です。

一番近いURL:

```text
https://dash.cloudflare.com/?to=/:account/workers-and-pages
```

入れる場所:

```text
Cloudflare
→ Workers & Pages
→ darakedevapp
→ Settings
→ Variables and secrets
→ Add secret
```

Secret name:

```text
GITHUB_TOKEN
```

Secret value:

```text
GitHubで作ったPersonal Access Token
```

この値はチャットに貼らないでください。

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
GITHUB_TOKEN
だらけdev app がGitHubにIssueを作るための鍵
→ Cloudflare Worker側に入れる
```

---

## いちばん楽な順番

```text
1. CloudflareのAPI Tokenページを開く
2. GitHubの登録ページを開く
3. CLOUDFLARE_API_TOKEN と CLOUDFLARE_ACCOUNT_ID を入れる
4. Cloudflare Setup実行ページを開く
5. Run workflow を押す
6. だらけdev app に戻って「設定したので再チェック」
7. GITHUB_TOKEN が必要と出たら Cloudflare Worker Secret に入れる
8. もう一度「設定したので再チェック」
```

---

## やらなくていいこと

```text
GITHUB_ISSUE_CREATE_ENABLED をCloudflare画面で毎回探して入れる
```

これは Phase 82 以降、`wrangler.toml` に入っているので、GitHub Actions から反映できます。

---

## 迷った時の見方

```text
Issue作成がOFFと言われる
→ Cloudflare Setup がまだ反映されていない可能性
```

```text
GitHub Tokenがないと言われる
→ GITHUB_TOKEN を Cloudflare Worker Secret に入れる
```

```text
リポジトリURLを聞かれる
→ テストなら darake-dev-app-AI のURLで進める
```

---

## だらけるための方針

```text
普通のON/OFF設定は wrangler.toml に置く
強い鍵だけ安全な登録場所に置く
人間は最初の鍵登録だけやる
その後は Actions とアプリ画面が案内する
```
