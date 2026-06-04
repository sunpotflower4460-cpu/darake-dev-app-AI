# AI Pipeline Design (Safe Manual Copy)

このドキュメントでは、だらけ管制室における安全なAIパイプライン方針を説明します。

## 基本方針

**このアプリから外部AI APIへ自動送信は行いません。**

Deep Build Mode の判定結果は、人間が確認してから外部AIへ手動コピーする流れで進めます。

---

## パイプライン全体像

```
[Deep Build Mode]
       ↓ 判定結果（complete-candidate / not-ready / blocked-hard）
[deepBuildAiPrompt.ts]
       ↓ 判定ごとに最適なプロンプト文面を生成
[DeepBuildAiPromptPanel.tsx]
       ↓ 人間が内容を確認・チェックを入れる
[クリップボードコピー]
       ↓ 人間がAIツールへ手動で貼り付ける
[ChatGPT / Claude / Cursor / Cloud Agent など]
       ↓ AI回答を人間が確認・採用可否を判断
[人間が次の行動を決める]
```

---

## 判定結果とプロンプトの目的対応

| 判定ステータス | 目的 | AIへの依頼内容 |
|---|---|---|
| `complete-candidate` | 最終確認と不足点レビュー | 見落とし・懸念の洗い出し、最終確認チェックリスト |
| `not-ready` | 次に育てるべきポイント整理 | 優先事項の整理、次フェーズへの具体的手順 |
| `blocked-hard` | 止める理由と再開条件の整理 | 停止理由の分析、人間確認ポイント、安全な再開手順 |

---

## 安全ルール

1. **外部AI APIを呼ばない** — このアプリからのAPI自動送信は行わない
2. **API key入力欄を作らない** — secret情報はアプリに入力させない
3. **自動コード生成しない** — AI回答を自動でコードやPRに反映しない
4. **人間確認必須** — コピー前に2つのチェックボックスで確認を求める
5. **private情報の保護** — API key / token / secret / 個人情報を貼らないよう警告

---

## コピー前の人間確認チェック

プロンプトコピー前に以下の2点を人間が確認する：

- [ ] API key / token / secret / private情報を貼っていないことを確認した
- [ ] AI回答を自動採用せず、人間が確認することを理解した

---

## 構成ファイル

| ファイル | 役割 |
|---|---|
| `src/utils/deepBuildAiPrompt.ts` | 判定結果→AIプロンプト変換ロジック |
| `src/components/DeepBuildAiPromptPanel.tsx` | コピー導線UI（チェックボックス + コピーボタン） |
| `src/utils/deepBuildCompletionJudge.ts` | Deep Build Modeの判定ロジック |
| `src/utils/aiManualCopyPrompt.ts` | 汎用AI手動コピープロンプト生成 |
| `src/test/deepBuildAiPrompt.test.ts` | ユニットテスト |

---

## まだやらないこと

- AI APIの直接呼び出し
- 自動コード生成
- 自動PR作成
- 自動マージ
- AI回答の自動反映
- secret / API key の入力欄

---

## 関連ドキュメント

- [AI Manual Copy Pipeline](./ai-manual-copy-pipeline.md)
- [Deep Build Mode](./deep-build-mode.md)
