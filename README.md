## アプリ概要

このリポジトリは React + Vite を使った案件管理ダッシュボードアプリです。  
Supabase に接続してクラウド同期することも、Supabase を使わずローカルストレージのみでの運用も可能です。

---

## 開発環境での起動（同一LAN内からのアクセスも可）

1. 依存パッケージをインストール

```bash
npm install
```

2. 開発サーバーを起動

```bash
npm run dev
```

3. ブラウザでアクセス

- このPCから: `http://localhost:5173`
- 同じWi-Fi / LAN 内の他の端末から: `http://あなたのPCのIPアドレス:5173`  
  （例: `http://192.168.0.10:5173`）

`vite.config.js` で `server.host = '0.0.0.0'` を設定しているため、同一ネットワーク内の他の端末からもアクセスできます。

---

## Supabase 設定（クラウド同期したい場合）

1. プロジェクト直下に `.env.local` を作成し、以下を記載

```bash
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL_HERE
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE
```

2. `.env.local` は `.gitignore` で除外されているため、Git/GitHub にはアップロードされません。

3. Supabase を設定しない場合は、自動的にローカルストレージモードで動作します。

---

## Vercel への自動デプロイ

このリポジトリには `vercel.json` が含まれており、Vercel で「Git連携」を行うだけで  
`main` ブランチなどに push するたびに自動デプロイされます。

### 手順

1. GitHub などのリモートリポジトリにこのプロジェクトを push する
2. Vercel にログインし、「New Project」からこのリポジトリをインポート
3. Framework が `Vite`、Build Command が `npm run build`、Output Directory が `dist` になっていることを確認
4. Vercel の Environment Variables に以下を追加（Supabase を使う場合）
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 以降は、設定したブランチに push するたびに Vercel が自動でビルド & デプロイを行います。

デプロイ後は、`https://xxxxx.vercel.app` のような URL が発行され、インターネット上のどこからでもアクセスできます。

---

## CLI からの手動デプロイ（オプション）

Vercel CLI を使って手動でデプロイすることもできます。

```bash
npm run deploy
```

初回は `npx vercel login` などで Vercel アカウントとの紐付けが必要です。  
その後はこのコマンドで本番環境（`--prod`）へのデプロイが行われます。
