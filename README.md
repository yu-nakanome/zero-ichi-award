# ゼロイチAward 参加型Webアプリ

## 概要
観客が登壇者の「熱量」と自分自身の「現状」を比較し、その差分（GAP）を可視化することで行動変容を促すリアルタイム・アプリケーションです。

## 特徴
- **ログイン不要**: 初回アクセス時にUUIDを自動生成・保存。
- **熱量可視化**: 「代謝・摩擦熱」「変異熱」「引火熱」の3軸で差分を入力。
- **プレミアムデザイン**: ダークモード、グラデーション、アニメーションを採用した没入感のあるUI。

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env` ファイルを作成し、Supabase の認証情報を設定してください。
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

## ディレクトリ構造
- `src/hooks/useUser.js`: UUID管理ロジック
- `src/components/GapSlider.jsx`: 差分測定スライダー
- `src/App.jsx`: メインUI（Home, Voting, Status Board）
- `src/lib/supabase.js`: Supabaseクライアント
- `implementation_plan.md`: データベース設計・開発計画
