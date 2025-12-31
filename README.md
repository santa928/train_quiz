# train_quiz

3歳向けスマホ用の「東京の電車」写真クイズ（4択×5問）です。GitHub Pagesで公開できる静的サイトとして構成しています。

## 特徴
- 4択 × 5問の写真クイズ
- スマホ向けの大きいボタン＆音なし演出
- ライセンス明記の実写写真（Wikimedia Commons等）を使う前提のクレジット表示
- 出題路線データは20件（追加で拡充可能）

## 起動方法（Docker Compose）
```bash
# 開発: ローカル変更を即反映
docker compose up --build
```

ブラウザで `http://localhost:8080` を開きます。

## 操作方法
1. 「スタート」
2. 写真を見て4択から選択
3. 5問終了で結果表示
4. 「もう一回」で再挑戦

## 写真素材・クレジットの設定
`app/data/lines.js` の `image` / `credit` を必ず埋めてください。

- `image`: `assets/images/` に置いた画像ファイルのパス
- `series`: 形式（表示ラベルに使うため必須）
- `credit.sourceName`: 出典名
- `credit.sourceUrl`: 出典URL
- `credit.license`: 利用条件の記載（ライセンス名 + 作者名 など）

`image` / `credit` が未設定の場合、スタートボタンが無効になります。

公開前に、各素材のライセンス条件を再確認してください。

## 画像収集スクリプト（Wikimedia Commons）
`tools/commons_images.json` に追加したい車両を追記し、以下で取得できます。

```bash
python3 tools/fetch_commons_images.py --input tools/commons_images.json --lines-out tmp/commons_lines.json --sleep 1.0
```

出力された `tmp/commons_lines.json` を参考に `app/data/lines.js` を更新してください。

## GitHub Pages への公開
1. GitHub の Settings → Pages
2. Source を `main` ブランチ / `/(root)` に設定
3. 保存後に表示されるURLへアクセス

## ドキュメント
- 要件定義: `docs/requirements.md`
- 仕様書: `docs/spec.md`
- 機能一覧: `docs/features.md`
