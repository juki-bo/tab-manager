# Tab Manager

URLパターンルールによるタブの自動振り分け・自動クローズを行う Google Chrome 拡張機能。

## 機能

- **URLパターンによる自動振り分け** — glob または正規表現でルールを設定。タブが開かれた瞬間に自動でウィンドウやタブグループへ移動する
- **自動クローズ** — 設定した時間が経過したタブを自動で閉じる。`chrome.alarms` を使用するためブラウザ再起動をまたいでも機能する
- **クローズ履歴と再オープン** — 自動クローズされたタブを一覧で確認し、ワンクリックで再オープンできる
- **タブ一覧の非表示** — 拡張機能の UI 内でオープン中のタブ一覧を表示しない。複数ウィンドウを使っても UI が増殖しない

## インストール（ビルド不要）

```bash
git clone https://github.com/juki-bo/tab-manager.git
```

1. `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」をオンにする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. クローンした `tab-manager/dist/` フォルダを選択

## 開発者向け

```bash
npm install
npm run dev   # 開発サーバー起動（変更のたびに chrome://extensions/ でリロード）
npm run build # dist/ を再生成
```

## ルールの設定例

| 入力するパターン文字列 | タイプ | 説明 |
|---|---|---|
| `*://github.com/**` | glob | GitHub のすべてのページ |
| `*://linear.app/**` | glob | Linear のすべてのページ |
| `https?://.*\.notion\.so/.*` | regex | Notion |

### パターン記法（glob）

| 書き方 | マッチする対象 | 例 |
|---|---|---|
| `*` | `/` を含まない任意の文字列 | `*.html` → `index.html` にはマッチするが `dir/index.html` にはしない |
| `**` | `/` を含む任意の文字列（パス全体） | `github.com/**` → `github.com/foo/bar/baz` にもマッチ |
| `?` | 任意の1文字 | `http?` → `https` にもマッチ |

## 技術スタック

- TypeScript + React
- Tailwind CSS
- Vite + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- Manifest V3
