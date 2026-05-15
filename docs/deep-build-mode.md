# Phase 90: Deep Build Mode foundation

Deep Build Mode は、だらけ管制室の「完成まで育てる」思想を扱うための土台です。

このPhaseでは、危険な自動操作を増やさず、まず次の3つだけを固定します。

1. 設計図から熟成計画を作る
2. 熟成Phaseごとの完了条件を持つ
3. 最終的に完成候補か、まだ育成中か、止めるべきかを判定する

---

## このPhaseでやること

- `DeepBuildPlan` の型を追加
- 設計 / UI / 実装 / Worker/API / テスト / 修正 / 仕上げ のPhaseを作る
- 完成判定の最小ロジックを追加
- 熟成モードのパネルを追加
- 計画はlocalStorageに保存する

---

## このPhaseでやらないこと

- secret/tokenの追加
- GitHub権限変更
- Cloudflare Worker Secret変更
- 本番DB接続
- 認証追加
- 課金追加
- App Store提出
- 危険な自動マージ

---

## 人間に見せる情報

通常表示は短くします。

```text
熟成モード
今: AIが作業を育てています
進み具合: 3/7
確認が必要: なし
```

内部Phase、Agent指示、完了条件は `<details>` の中に置きます。

---

## 完成判定の考え方

このPhaseでは「完全完成」とは断定しません。

全Phaseが完了し、高リスク/不明リスク/停止フェーズが残っていなければ、表示は「かなり完成に近いです」に留めます。

本番公開、提出、課金、認証、secret、権限変更は必ず人間確認へ戻します。

---

## 次のPhase候補

- Deep Build Plan を実際の Issue 作成へ接続する
- PR / CI / AutoFix の状態を Deep Build Phase に反映する
- 朝レポートへ Deep Build の進捗を短く出す
- UI確認 / スマホ確認 / 最終レビューを独立した判定器にする
