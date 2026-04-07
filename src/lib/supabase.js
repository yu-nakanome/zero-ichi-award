import { createClient } from '@supabase/supabase-js'

/**
 * 環境変数の取得
 */
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// デフォルト値のまま、または空の場合のチェックロジック
export const isSupabaseConfigured = (
  supabaseUrl && 
  supabaseUrl !== '' && 
  supabaseUrl !== 'your_supabase_url' && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey && 
  supabaseAnonKey !== '' && 
  supabaseAnonKey !== 'your_anon_key'
);

/**
 * Supabase クライアントの初期化
 */
let client = null;

try {
  if (isSupabaseConfigured) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.error('Supabase Invalid Configuration: 接続情報が .env に正しく設定されていません。');
  }
} catch (e) {
  console.error('Supabase initialization failed:', e);
}

export const supabase = client;
