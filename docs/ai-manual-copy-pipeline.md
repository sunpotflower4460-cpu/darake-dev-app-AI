# AI Manual Copy Pipeline

このPhaseの目的は「AI実行」ではなく、外部AIへ安全に貼り付ける文面を作ることです。

## 範囲

- 候補選択
- 手動コピー用プロンプト生成
- コピー前の人間確認
- クリップボードコピー

## 安全ルール

- このアプリから外部AI APIへ送信しない
- API key / token / secret を貼らない
- private情報・個人情報は人間が確認してから貼る
- AI回答は自動採用しない

## プロンプトに含める内容

- 安全注意
- このIssue / PR / 設計の目的
- Provider別の注意
- 期待する出力形式
- Manual Gate
- まだやらないこと

## まだやらないこと

- OpenAI / Claude / Gemini APIの直接呼び出し
- GitHub Issueの自動作成
- PR作成やマージの自動化
- private情報の自動送信
- AI回答の自動反映
