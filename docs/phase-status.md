# Phase ステータス一覧

このファイルは、Darake Dev App AI の開発Phaseを「今どこまで進んでいて、次に何を見るべきか」が分かる台帳です。

READMEから辿れる簡易ロードマップは [README.md](../README.md#ロードマップ) を参照してください。

> **メンテナンス**: 新しいPhaseが追加されたり状態が変わったりした際は、このファイルを合わせて更新してください。

---

## このファイルの読み方

Phase番号には2種類の体系があります。

| 体系 | 例 | 追跡場所 |
|------|----|---------|
| 概念Phase（小数点あり） | `0`, `2`, `3.6`, `6.20` | `README.md`、`docs/` |
| 実装Phase（整数） | `59`, `66`, `89` | `manual-deploy-trigger/` |

概念Phaseは機能マイルストーン単位、実装Phaseは個別PRのデプロイ検証単位です。

---

## ステータス凡例

| ステータス | 意味 |
|-----------|------|
| `done` | 完了 |
| `in-progress` | 進行中 |
| `not-started` | 未着手 |
| `skipped` | スキップ |
| `not-documented-yet` | 記録なし・未確認 |

---

## 概念Phase（小数点あり）

### Phase 0: 設計固定

- status: done
- summary: アプリの核・MVP範囲・画面構成・データ構造・手動ゲートを固定した設計ドキュメント
- related files:
  - `docs/phase-0-design.md`
- next: Phase 2〜を参照

---

### Phase 1

- status: not-documented-yet
- summary: unknown — READMEに記載なし、ドキュメントも見当たらない
- note: Phase 0の直後のPhase。別Phaseに吸収された可能性、または番号が予約のみで実施なしの可能性あり。断定できないため未確認とする。
- next: Phase 2 を参照

---

### Phase 2: 初期UI強化

- status: done
- summary: 種から生成された計画の表示、確認エージェントの役割表示、進行タイムライン、スクリーンショット確認カード、止めるタイミングと通知方針の見える化
- related files:
  - `README.md` (Phase 2セクション)
  - `src/`
- next: Phase 2.5

---

### Phase 2.5: 表示モード整理

- status: done
- summary: 表示モードの確認欄、将来育てる場所の整理、仮データで動いている欄の見える化、実運用前の安全な境界づくり
- related files:
  - `README.md` (Phase 2.5セクション)
  - `src/`
- next: Phase 3

---

### Phase 3: 読み取り導線の設計準備

- status: done
- summary: Phase 3の準備。GitHub状態をアプリ内で見られるようにするための画面・設計の準備。実際の取得処理はまだ実施せず。
- related files:
  - `docs/phase-3-prep.md`
- next: Phase 3.6

---

### Phase 3.6: 状態ファイルビルド

- status: done
- summary: `scripts/buildState.mjs` で `public/repo-state.json` を更新する導線、`npm run state:build` コマンド、手動実行専用の `Update State File` workflow、変更がある時だけ状態ファイルをコミットする仕組み
- related files:
  - `scripts/buildState.mjs`
  - `public/repo-state.json`
  - `README.md` (Phase 3.6セクション)
- next: Phase 3.7

---

### Phase 3.7: 状態鮮度判定

- status: done
- summary: 状態ファイルの鮮度判定、「だらけてOK」か「軽く確認すると安心」かの表示、古い状態の時だけ更新を促すメッセージ、確認に使う力を減らすための見える化
- related files:
  - `README.md` (Phase 3.7セクション)
  - `src/`
- next: Phase 3.8

---

### Phase 3.8: だらけモードUIコア

- status: done
- summary: だらけモードの中核UI、「今やる / 後でいい / 放っておいていい」の仕分け、全部を頑張らない設計、だらけることを開発戦略として扱う画面
- related files:
  - `README.md` (Phase 3.8セクション)
  - `src/`
- next: Phase 3.9

---

### Phase 3.9: だらけモード × 状態鮮度連動

- status: done
- summary: だらけモードと状態鮮度の連動、状態が新しい時は確認タスクを「放っておいていい」へ、状態が古い時だけ「今やる」へ移動
- related files:
  - `README.md` (Phase 3.9セクション)
  - `src/`
- next: Phase 4

---

### Phase 4: Issue下書き表示

- status: done
- summary: 作りたいアプリの種からIssue下書きを表示、目的・背景・やること・完了条件・まだやらないことを整理、エージェントに渡す文を用意
- related files:
  - `README.md` (Phase 4セクション)
  - `src/`
- next: Phase 4.1

---

### Phase 4.1: Issue下書きMarkdown整形

- status: done
- summary: Issue下書きをMarkdown形式に整形、Issue本文をワンタップでコピー、コピー成功/失敗の表示
- related files:
  - `README.md` (Phase 4.1セクション)
  - `src/`
- next: Phase 4.2

---

### Phase 4.2: Issue下書き編集フォーム

- status: done
- summary: コピー前にIssue下書きを編集できるフォーム、タイトル・目的・背景・やること・完了条件を画面上で調整、一行ずつ編集したリストをMarkdown本文へ反映
- related files:
  - `README.md` (Phase 4.2セクション)
  - `src/`
- next: Phase 4.3

---

### Phase 4.3: Issue下書き一時保存

- status: done
- summary: 編集中のIssue下書きをブラウザに一時保存、画面を閉じても編集内容が残りやすい導線、初期状態に戻すボタン
- related files:
  - `README.md` (Phase 4.3セクション)
  - `src/utils/localStorageKeyRegistry.ts`
- next: Phase 5（または Phase 6.0）

---

### Phase 5

- status: not-documented-yet
- summary: unknown — READMEに記載なし、ドキュメントも見当たらない
- note: Phase 4.3の後、Phase 6.0の前。別Phaseに吸収された可能性、または番号が予約のみで実施なしの可能性あり。断定できないため未確認とする。
- next: Phase 6.0 を参照

---

### Phase 6.0: GitHub実データ読み取り安全設計

- status: done
- summary: GitHub実データ連携は読み取り専用から始める、tokenをブラウザへ出さない、状態JSONをpublicへ選別して出す、不明な状態はmanualへ寄せる、書き込みはPhase 7以降
- related files:
  - `docs/github-integration-safety.md`
  - `README.md` (Phase 6.0セクション)
- next: Phase 6.1

---

### Phase 6.1: PR一覧読み取り土台

- status: done
- summary: GitHub ActionsでPR一覧を読み取り、`snapshot/pr-watch.json` をartifact生成、`npm run pr:build` コマンド追加
- related files:
  - `scripts/buildPrWatch.mjs`
  - `public/pr-watch.json`
  - `README.md` (Phase 6.1セクション)
- next: Phase 6.2（詳細は下記）

---

### Phase 6.2〜6.7

- status: not-documented-yet
- summary: unknown — READMEに記載なし
- note: `docs/github-integration-safety.md` のPhase 6実装順には 6.2（PR一覧のpublic JSON反映）・6.3（CI結果JSON生成）・6.4（レビューコメント読み取り）が計画として記載されている。ただし、これらが個別Phaseとして実施されたか、他Phaseに吸収されたかは断定できないため未確認とする。
- related files:
  - `docs/github-integration-safety.md` (Phase 6実装順セクション参照)
- next: Phase 6.8 を参照

---

### Phase 6.8: CI Watch JSON生成

- status: done
- summary: GitHub ActionsでCI/workflow runsを読み取り、`snapshot/ci-watch.json` をartifact生成、`npm run ci:build` コマンド追加
- related files:
  - `scripts/buildCiWatch.mjs`
  - `public/ci-watch.json`
  - `README.md` (Phase 6.8セクション)
- next: Phase 6.9

---

### Phase 6.9: CI Watch手動更新

- status: done
- summary: CI Watch結果を手動実行時だけ `public/ci-watch.json` へ反映する導線、`Update CI Watch File` workflow、変更がある時だけCI状態ファイルをコミット
- related files:
  - `public/ci-watch.json`
  - `README.md` (Phase 6.9セクション)
- next: Phase 6.10（詳細は下記）

---

### Phase 6.10〜6.19

- status: not-documented-yet
- summary: unknown — READMEに記載なし、ドキュメントも見当たらない
- note: Phase 6.9と6.20の間。別Phaseに吸収された可能性、または番号が予約のみの可能性あり。断定できないため未確認とする。
- next: Phase 6.20 を参照

---

### Phase 6.20〜6.22: Review Watch UI改善

- status: done
- summary: Review Watchの詳細一覧を折りたたみ前提へ変更、今日見るところ・重要アラート・統合サマリー・更新ハブを先に表示、manual/blocked箇所だけに集中できる導線
- related files:
  - `README.md` (Phase 6.20〜6.22セクション)
  - `scripts/buildReviewWatch.mjs`
  - `public/review-watch.json`
  - `src/`
- next: Phase 7入口

---

### Phase 7: 書き込み自動化の安全設計（入口）

- status: in-progress
- summary: 書き込み自動化に入る前に安全ゲートを表示する設計が固まっている。Issue/PR本文の下書き生成は自動候補。PR/CI/Review状態の読み取りは自動候補。Issue作成・PR作成・マージは当面手動ゲート。
- related files:
  - `README.md` (Phase 7入口セクション)
- note: 「入口」の設計は done。Phase 7本体の実装は next-step として残っている。
- next: 次のIssueやPRでPhase 7本体の実装を進める

---

## 実装Phase（整数）

実装Phaseは `manual-deploy-trigger/` 配下のファイルで追跡されています。
各ファイルはデプロイ検証のトリガー兼記録です。

---

### Phase 59〜63

- status: not-documented-yet
- summary: unknown — `manual-deploy-trigger/` にファイルなし。`phase59to63` というブランチ名の記録のみ存在する。
- note: 断定できないため未確認とする。
- related files:
  - (なし)
- next: Phase 64を参照

---

### Phase 64a

- status: not-documented-yet
- summary: unknown — `manual-deploy-trigger/phase64b-redeploy-2026-05-13.txt` は存在するが、64aの記録はない
- note: 64bが「再デプロイ」であることから64aが先行して存在した可能性あり。断定できないため未確認とする。
- next: Phase 64bを参照

---

### Phase 64b: 再デプロイ検証

- status: done
- summary: PR #150・#152マージ後のメイン最新版を再デプロイして first-start cockpit route のUI/dataセービング挙動を確認
- related files:
  - `manual-deploy-trigger/phase64b-redeploy-2026-05-13.txt`

---

### Phase 65

- status: not-documented-yet
- summary: unknown — `manual-deploy-trigger/` にファイルなし
- note: 断定できないため未確認とする。
- next: Phase 66を参照

---

### Phase 66: ワンページ人間向けUI

- status: done
- summary: PR #156マージ後のデプロイ検証。人間向けUIがデフォルトで1ページ表示になることを確認。
- related files:
  - `manual-deploy-trigger/phase66-one-page-ui-2026-05-13.txt`

---

### Phase 67: メインボタン

- status: done
- summary: PR #157マージ後のデプロイ検証。ワンページのプライマリボタンが安全スタートフローを呼ぶことを確認。
- related files:
  - `manual-deploy-trigger/phase67-main-button-2026-05-13.txt`

---

### Phase 68: ワンページガイダンス

- status: done
- summary: PR #158マージ後のデプロイ検証。blocked/failed/fallbackガイダンスが人間向けコックピット上に表示されることを確認。
- related files:
  - `manual-deploy-trigger/phase68-one-page-guidance-2026-05-13.txt`

---

### Phase 69: 種入力

- status: done
- summary: PR #159マージ後のデプロイ検証。アプリ名/一言アイデアをワンページコックピットから直接入力できることを確認。
- related files:
  - `manual-deploy-trigger/phase69-seed-input-2026-05-13.txt`

---

### Phase 70: 自動スタート

- status: done
- summary: PR #161マージ後のデプロイ検証。ワンページコックピットが種を保存して安全スタートフローへ続くことを確認。
- related files:
  - `manual-deploy-trigger/phase70-auto-start-2026-05-13.txt`

---

### Phase 71: 完了レシート

- status: done
- summary: PR #164マージ後のデプロイ検証。ワンページコックピットに完了/作業中/レビューのレシートが表示されることを確認。
- related files:
  - `manual-deploy-trigger/phase71-done-receipt-2026-05-13.txt`

---

### Phase 72: テンプレート入力

- status: done
- summary: PR #165マージ後のデプロイ検証。ワンページコックピットにテストテンプレート入力ボタンが表示されることを確認。
- related files:
  - `manual-deploy-trigger/phase72-template-fill-2026-05-13.txt`

---

### Phase 73: 人間向けUIポリッシュ

- status: done
- summary: PR #166マージ後のデプロイ検証。初回から人間が理解しやすいワンページコックピット改善。
- related files:
  - `manual-deploy-trigger/phase73-human-ui-2026-05-13.txt`

---

### Phase 74: ワンクリックサンプル起動

- status: done
- summary: PR #167マージ後のデプロイ検証。ワンページコックピットでサンプルを入力から起動まで1クリックで実行できることを確認。
- related files:
  - `manual-deploy-trigger/phase74-one-click-sample-2026-05-13.txt`

---

### Phase 75: 内部機能の非表示

- status: done
- summary: PR #168マージ後のデプロイ検証。通常の人間パスで内部/デバッグビューが表示されないことを確認。
- related files:
  - `manual-deploy-trigger/phase75-hide-internals-2026-05-13.txt`

---

### Phase 76: スタート画面シンプル化

- status: done
- summary: PR #169マージ後のデプロイ検証。最初の人間向け画面がシンプルなサンプル/カスタム起動の選択だけ表示されることを確認。
- related files:
  - `manual-deploy-trigger/phase76-simplify-start-2026-05-13.txt`

---

### Phase 77: リポジトリ確認UI

- status: done
- summary: PR #170マージ後のデプロイ検証。リポジトリURL確認がワンページコックピット上に直接表示されることを確認。
- related files:
  - `manual-deploy-trigger/phase77-repo-check-2026-05-13.txt`

---

### Phase 78: 確認フリクション整理

- status: done
- summary: PR #171マージ後のデプロイ検証。リポジトリ確認フローが人間向けの文言とワンクリックデフォルト確認になっていることを確認。
- related files:
  - `manual-deploy-trigger/phase78-confirmation-friction-2026-05-13.txt`

---

### Phase 79: Cloudflareセットアップガイド

- status: done
- summary: PR #172マージ後のデプロイ検証。Cloudflareセットアップ手順がワンページコックピット上に直接表示されることを確認。
- related files:
  - `manual-deploy-trigger/phase79-cloudflare-guide-2026-05-13.txt`

---

### Phase 80: Cloudflareスキャン可能ガイド

- status: done
- summary: PR #173マージ後のデプロイ検証。Cloudflareセットアップ失敗時にスキャンしやすい初心者向けガイドが表示されることを確認。
- related files:
  - `manual-deploy-trigger/phase80-cloudflare-scannable-2026-05-13.txt`

---

### Phase 81: 初心者セットアップヘルプ

- status: done
- summary: PR #174マージ後のデプロイ検証。ワンページコックピットに初心者レベルのセットアップ説明が表示されることを確認。
- related files:
  - `manual-deploy-trigger/phase81-beginner-help-2026-05-13.txt`

---

### Phase 82: Cloudflare自動化

- status: done
- summary: PR #175マージ後のデプロイ検証。`GITHUB_ISSUE_CREATE_ENABLED` が `wrangler.toml vars` から供給されること、Cloudflareセットアップworkflowと初心者向け自動化ガイドが利用可能なことを確認。
- related files:
  - `manual-deploy-trigger/phase82-cloudflare-automation-2026-05-13.txt`
  - `wrangler.toml`
  - `docs/cloudflare-automation-beginner-guide.md`

---

### Phase 83: セットアップチェックリスト

- status: done
- summary: PR #176マージ後のデプロイ検証。初心者向けセットアップチェックリストパネルとドキュメントが利用可能なことを確認。
- related files:
  - `manual-deploy-trigger/phase83-setup-checklist-2026-05-13.txt`
  - `docs/darake-initial-setup-checklist.md`

---

### Phase 84: セットアップショートカットリンク

- status: done
- summary: PR #177マージ後のデプロイ検証。セットアップパネルにGitHubとCloudflareのセットアップページへの直接リンクが表示されることを確認。
- related files:
  - `manual-deploy-trigger/phase84-setup-shortcut-links-2026-05-13.txt`

---

### Phase 85: CloudflareトークンSync

- status: done
- summary: PR #178マージ後のデプロイ検証。Cloudflareセットアップworkflowがオプションで `WORKER_GITHUB_TOKEN` をCloudflare Worker GitHub Accessとして同期できることを確認。
- related files:
  - `manual-deploy-trigger/phase85-cloudflare-token-sync-2026-05-13.txt`

---

### Phase 86: Cloudflareアカウント自動検出

- status: done
- summary: PR #179マージ後のデプロイ検証。CloudflareセットアップworkflowがアカウントIDを可能な時自動検出することを確認。
- related files:
  - `manual-deploy-trigger/phase86-cloudflare-account-auto-detect-2026-05-13.txt`
  - `docs/darake-initial-setup-checklist.md` (Phase 86の項目参照)

---

### Phase 87: Cloudflareセットアップサマリー

- status: done
- summary: PR #180マージ後のデプロイ検証。Cloudflare Setupが人間が読めるGitHub Actions Summaryを書き出すことを確認。
- related files:
  - `manual-deploy-trigger/phase87-cloudflare-setup-summary-2026-05-13.txt`
  - `scripts/write-cloudflare-setup-summary.mjs`

---

### Phase 88: セットアップハブ

- status: done
- summary: PR #181マージ後のデプロイ検証。Setup Hubパネルが利用可能なこと、順番付きセットアップリンクとコピーボタンが機能することを確認。
- related files:
  - `manual-deploy-trigger/phase88-setup-hub-2026-05-13.txt`

---

### Phase 89: インラインセットアップリンク

- status: done
- summary: PR #182マージ後のデプロイ検証。Cloudflareブロッカーカード自体に直接セットアップリンクが表示されること、`WORKER_GITHUB_TOKEN` コピーボタンがブロッカーカード内に表示されることを確認。
- related files:
  - `manual-deploy-trigger/phase89-inline-setup-links-2026-05-13.txt`

---

### Phase 90: Deep Build Mode基盤

- status: in-progress
- summary: 設計図から熟成計画を作る、熟成Phaseごとの完了条件を持つ、最終的に完成候補/育成中/停止すべきかを判定する土台。`DeepBuildPlan` の型追加・熟成モードパネル・完成判定最小ロジックを含む。
- related files:
  - `docs/deep-build-mode.md`
- next: Deep Build PlanをIssue作成へ接続する、PR/CI/AutoFixの状態をDeep Build Phaseに反映する

---

## 欠番・未確認Phase 一覧

| Phase | 状態 | 備考 |
|-------|------|------|
| 1 | not-documented-yet | READMEに記載なし。Phase 0直後。推測不可。 |
| 5 | not-documented-yet | READMEに記載なし。Phase 4.3→6.0の間。推測不可。 |
| 6.2〜6.7 | not-documented-yet | `docs/github-integration-safety.md` に6.2〜6.4が計画として記載あり。実施/吸収の詳細は不明。 |
| 6.10〜6.19 | not-documented-yet | READMEに記載なし。推測不可。 |
| 59〜63 | not-documented-yet | `phase59to63` ブランチ名の記録のみ。内容・詳細は未確認。 |
| 64a | not-documented-yet | 64bの存在から推測されるが記録なし。 |
| 65 | not-documented-yet | `manual-deploy-trigger/` にファイルなし。推測不可。 |

---

## 次に着手するとよさそうな場所

- **Phase 7本体の実装**: Phase 7入口の安全設計が完了している。次はIssue作成・PR作成などの書き込み操作を安全ゲート付きで実装する段階。
- **Phase 90 (Deep Build Mode)**: `docs/deep-build-mode.md` に基盤設計あり。Deep Build PlanとIssue作成の接続が次のステップ。
- **このファイル自体の更新**: 新しいPhaseが追加されるたびに、このファイルを更新してください。
