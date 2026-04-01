# Tab Manager

URLパターンルールによるタブの自動振り分け・自動クローズを行う Google Chrome 拡張機能。

## 機能

- **URLパターンによる自動振り分け** — glob または正規表現でルールを設定。タブが開かれた瞬間に自動でウィンドウやタブグループへ移動する
- **自動クローズ** — 設定した時間が経過したタブを自動で閉じる。`chrome.alarms` を使用するためブラウザ再起動をまたいでも機能する
- **クローズ履歴と再オープン** — 自動クローズされたタブを一覧で確認し、ワンクリックで再オープンできる
- **タブ一覧の非表示** — 拡張機能の UI 内でオープン中のタブ一覧を表示しない。複数ウィンドウを使っても UI が増殖しない

## 開発環境のセットアップ

```bash
npm install
```

## ビルド

```bash
npm run build
```

`dist/` フォルダに出力される。

## Chrome への読み込み

1. `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `dist/` フォルダを選択

## 開発

```bash
npm run dev
```

Vite の HMR（Hot Module Replacement）が有効になる。変更のたびに `chrome://extensions/` でリロードボタンを押すと反映される。

## ルールの設定例

| 入力するパターン文字列 | タイプ | 説明 |
|---|---|---|
| `*://github.com/**` | glob | GitHub のすべてのページ |
| `*://linear.app/**` | glob | Linear のすべてのページ |
| `https?://.*\.notion\.so/.*` | regex | Notion |

### パターン記法（glob）

| 記号 | 意味 |
|---|---|
| `*` | `/` を除く任意の文字列 |
| `**` | `/` を含む任意の文字列 |
| `?` | 任意の1文字 |

## 技術スタック

- TypeScript + React
- Tailwind CSS
- Vite + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- Manifest V3
