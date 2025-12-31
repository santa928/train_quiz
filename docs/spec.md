# 仕様書

## 画面構成
- スタート画面
  - タイトル、スタートボタン、クレジット導線
  - データ未設定（写真/形式/クレジット）がある場合はスタートを無効化
- 問題画面
  - 進捗表示（n/5）
  - 写真表示
  - 4択ボタン（タップで即判定）
  - 正誤フィードバック（画面演出のみ）
- 結果画面
  - 正解数の表示
  - おさらいリスト
  - もう一回ボタン
- クレジット画面
  - 各路線の出典URL・利用条件

## クイズロジック
- 問題数: 5問
- 各問題は路線データから重複なしで抽選
- 選択肢は正解 + 他3路線をランダム
- 表示ラベルは `路線名（形式）`、形式が無い場合は路線名のみ

## データ仕様
`app/data/lines.js`
- `id`: 一意のID
- `lineName`: 路線名
- `series`: 形式（ない場合は空文字）
- `image`: 画像ファイルパス（`assets/images/`）
- `credit.sourceName`: 出典名
- `credit.sourceUrl`: 出典URL
- `credit.license`: 利用条件の記載
- 登録路線数: 74件（追加で拡充可能）

## クレジット方針
- ライセンスが明記された実写写真のみ使用（Wikimedia Commons 等）
- 出典URL・作者・ライセンスをアプリ内に記載

## 素材追加手順
- `tools/commons_images.json` に追加し、`tools/fetch_commons_images.py` で取得

## 技術構成
- 静的HTML/CSS/JS（ES Modules）
- Docker Compose + nginx で実行
- GitHub Pagesで公開可能な構成
