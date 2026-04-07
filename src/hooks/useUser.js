import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

/**
 * ログイン不要のユーザー管理フック
 * LocalStorageからUUIDを取得、なければ生成して保存する
 */
export function useUser() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let localId = localStorage.getItem('zero_ichi_user_uuid');
    if (!localId) {
      localId = uuidv4();
      localStorage.setItem('zero_ichi_user_uuid', localId);
    }
    setUserId(localId);
    
    // Supabaseのusersテーブルに登録/更新する
    const syncUser = async () => {
        if (!localId) return;
        try {
            await supabase.from('users').upsert({ id: localId }, { onConflict: 'id' });
        } catch (e) {
            console.warn("User sync skipped (likely local mode)");
        }
    };
    
    syncUser();
  }, []);

  return { userId };
}
