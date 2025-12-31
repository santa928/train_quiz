# 機能一覧

## 機能説明
- 写真クイズ: 東京区間のある路線から出題し、4択で回答
- 進捗表示: 現在の問題数を表示
- 結果表示: 正解数とおさらい一覧
- クレジット表示: 出典/利用条件を確認可能
- 出題路線データ: 20件（追加で拡充可能）

## 運用補足
- Wikimedia Commons 画像の取得は `tools/fetch_commons_images.py` を利用

## 画面フロー（Mermaid）
```mermaid
flowchart TD
  Start[スタート画面]
  Question[問題画面
写真 + 4択]
  Feedback[正誤フィードバック]
  Result[結果画面]
  Credit[クレジット画面]

  Start -->|スタート| Question
  Question --> Feedback
  Feedback -->|つぎへ| Question
  Feedback -->|5問目| Result
  Result -->|もう一回| Start
  Start -.-> Credit
  Question -.-> Credit
  Result -.-> Credit
  Credit -->|もどる| Start
```
