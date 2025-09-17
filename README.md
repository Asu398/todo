# ToDo アプリ

React と Node.js (Express) を用いたシンプルな ToDo アプリです。バックエンドはメモリ上にタスクを保持し、フロントエンドはタスクの一覧表示・追加・削除が行えます。

## プロジェクト構成

```
./client  … フロントエンド (ブラウザで読み込むシンプルな React 実装)
./server  … バックエンド API (Express 互換サーバー)
```

## 動作環境

- Node.js 20 以上を推奨
- 追加の npm パッケージは不要です

## 起動方法

```bash
# サーバーの起動
cd server
npm start
```

上記コマンドでポート `3001` でサーバーが起動し、以下が利用できます。

- フロントエンド: http://localhost:3001/
- API エンドポイント
  - `GET    /api/tasks`
  - `POST   /api/tasks`
  - `DELETE /api/tasks/:id`

## テスト

バックエンド API のテストは Jest 互換のテストランナーで実行できます。

```bash
cd server
npm test
```

## メモ

- バックエンドはメモリ上にタスクを保持します。サーバー再起動でタスクはリセットされます。
- フロントエンドは `client` ディレクトリ内の静的ファイルをそのまま配信しています。
