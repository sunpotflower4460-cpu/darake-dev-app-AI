# だらけ スターターテンプレート

このフォルダは **生成される各アプリのリポジトリ** に配置するファイル群です。
管制室 (このリポジトリ) 自体のCI・デプロイには影響しません。

Phase 3 のプロジェクト・ブートストラップが、新規リポジトリ作成時にこれらを
コピーする想定です。Phase 2 の段階では、単一リポジトリで検証ループを試すために
手動でコピーして使えます。

## 中身

| パス | コピー先 | 役割 |
|---|---|---|
| `github-workflows/phase-verify.yml` | `.github/workflows/phase-verify.yml` | PRのCI成功後にスクショ撮影→設計図比較→PRコメント/ラベル |
| `scripts/darake-verify.mjs` | `scripts/darake-verify.mjs` | Playwright撮影 + だらけWorkerへ判定リクエスト |

## 生成プロジェクト側の設定

1. 設計参照画像を `darake/design/*.png`(または jpg/webp)にコミット
2. リポジトリ Secrets に `DARAKE_WORKER_URL`(だらけWorkerの公開URL)を設定
3. 任意で Variables に `DARAKE_VERIFY_ROUTES`(例 `"/,/settings"`)を設定
4. Cloudflare Pages のプレビューデプロイを有効化(PRごとにプレビューURLが出る状態)

## だらけWorker側の設定 (管制室リポジトリ)

- Worker Secret: `ANTHROPIC_API_KEY`
- wrangler 変数: `DARAKE_VISION_VERIFY_ENABLED = "true"`
- KV `RUN_REGISTRY_KV` をバインドすると判定履歴と監査ログが残る
