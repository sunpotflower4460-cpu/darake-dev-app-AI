# `src/styles`

- `tokens.css`: 色・余白・角丸・影・文字サイズなどの基本値を置く
- `common.css`: 新しいパネルでも再利用しやすいカード・バッジ・注意文などの共通クラスを置く

## 追加するときの小さなルール

1. まず `tokens.css` に基本値を足せるか確認する
2. 複数パネルで使いそうなら `common.css` に共通クラスを追加する
3. 画面固有のレイアウトや状態ごとの差分は各パネルの CSS に残す
4. 既存 class 名は大きく変えず、段階的に共通化する

## 段階的な移行方針（Issue #2フェーズ）

- `src/styleImports.ts` の**読み込み順は維持**し、import path だけを `./styles/*.css` に切り替える
- 影響が小さい CSS から 5〜10 ファイルずつ移動する
- 置換は「色・余白・角丸・影・文字サイズ」のトークン参照を優先し、UI の見た目差分を最小化する
- カード/バッジ/ボタンなどは `common.css` の共通セレクタへ段階追加し、class 名の大幅変更はしない
- 1 回の移行ごとに `npm run typecheck` / `npm run build` を実行して安全性を確認する

## 今回 `src/styles/` へ移動した CSS

- `actionPreview.css`
- `agentRun.css`
- `darakeHealthCheck.css`
- `settingsHealth.css`
- `setupGuidance.css`
- `darakePanelBadge.css`
- `safetyConfirmButton.css`
- `previewDeployStatus.css`
- `appCreationFlow.css`
- `appStorePrepMode.css`
