# だらけ スターターテンプレート

`app/` が **生成される各アプリのリポジトリにそのまま push できる雛形** です。
管制室 (このリポジトリ) のCI・デプロイには影響しません
(`app/.github/workflows/` はサブディレクトリ内なので、このリポジトリでは実行されません)。

## 使い方

1. `app/` の中身を新しいGitHubリポジトリに push する
2. そのリポジトリを **Template repository** に設定 (Settings → Template repository)
3. だらけWorkerの環境変数 `STARTER_TEMPLATE_REPO` に `owner/repo` を設定

以降、だらけ管制室の「並列プロジェクト ダッシュボード」からの作成、または
プロジェクト自走 (`DARAKE_PROJECT_AUTOPILOT_ENABLED`) が、このテンプレートを複製します。

## `app/` の中身

| パス | 役割 |
|---|---|
| `package.json` / `vite.config.ts` / `tsconfig.json` / `index.html` / `src/` | 最小の Vite + React アプリ (ビルド可能) |
| `darake.config.json` | スクリーンショット撮影対象ルート |
| `darake/design/` | 設計参照画像を置く場所 |
| `.github/workflows/phase-verify.yml` | PRのCI成功後にスクショ→設計図比較→PRコメント/ラベル |
| `.github/workflows/final-verify.yml` | main更新時に全画面スクショ→2パス完成判定 |
| `.github/workflows/submit-ios.yml` / `submit-android.yml` | fastlane / gradle-play-publisher 申請テンプレート |
| `scripts/darake-verify.mjs` / `darake-final.mjs` | Playwright撮影 + だらけWorkerへの判定リクエスト |

## 生成プロジェクト側の設定

1. 設計参照画像を `darake/design/*.png` にコミット
2. リポジトリ Secrets に `DARAKE_WORKER_URL` (だらけWorkerの公開URL)
3. 任意で Variables `DARAKE_VERIFY_ROUTES` (例 `"/,/settings"`)
4. Cloudflare Pages のプレビューデプロイを有効化
5. 申請する場合は Apple/Google の認証情報を Secrets に
   (だらけの「申請前ゲート」+ Secret同期で投入可能)

## だらけWorker側 (管制室リポジトリ)

- Worker Secret: `ANTHROPIC_API_KEY`、`GITHUB_TOKEN`
- wrangler 変数: 使う機能を `DARAKE_*_ENABLED = "true"`
- KV `RUN_REGISTRY_KV` をバインド (履歴・監査ログ・プロジェクト登録に必須)
