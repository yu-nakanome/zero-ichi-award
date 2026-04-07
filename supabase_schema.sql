-- ゼロイチAward データベース初期化スクリプト

-- 1. テーブル作成

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- チームテーブル
CREATE TABLE IF NOT EXISTS teams (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  profile TEXT,
  status TEXT DEFAULT '待機中',
  action_logs JSONB DEFAULT '[]'
);

-- 初期データ投入
INSERT INTO teams (id, name, profile, status) VALUES
(1, 'Team A', '九大発の次世代〇〇開発', 'ピッチ中'),
(2, 'Team B', '地域課題を解決するアプリ', '待機中'),
(3, 'Team C', '教育の未来を変えるプロダクト', '待機中'),
(4, 'Team D', '持続可能な食の革命', '待機中'),
(5, 'Team E', 'AIによるクリエイティブ支援', '待機中'),
(6, 'Team F', '宇宙を目指すモビリティ', '待機中')
ON CONFLICT (id) DO NOTHING;

-- 投票テーブル
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  team_id INT REFERENCES teams(id),
  score_friction INT CHECK (score_friction BETWEEN 0 AND 100),
  score_evolution INT CHECK (score_evolution BETWEEN 0 AND 100),
  score_ignition INT CHECK (score_ignition BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, team_id) -- 二重投票防止
);

-- チャットテーブル
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. セキュリティ設定 (RLS)
-- ※ 簡単のため、一旦全ての操作を許可する設定（本番では制限を推奨）

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert/select" ON users FOR ALL USING (true);
CREATE POLICY "Allow public insert/select" ON votes FOR ALL USING (true);
CREATE POLICY "Allow public insert/select" ON chats FOR ALL USING (true);

-- 3. リアルタイム機能の有効化
-- Supabaseダッシュボードの Replication 設定で、chats テーブルと votes テーブルを 
-- 'supabase_realtime' パブリケーションに追加してください。
-- もしくは以下のコマンド（権限が必要な場合があります）:
-- alter publication supabase_realtime add table chats, votes;
