import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * ニコニコ動画風チャットオーバーレイ
 * Supabaseからリアルタイムにメッセージを受信して画面を流す
 */
export default function ChatOverlay() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 1. 初期ロード (最新15件を順次流す)
    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('content')
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) {
        console.error('Initial chat fetch failed:', error);
        return;
      }

      if (data) {
        data.reverse().forEach((msg, i) => {
          setTimeout(() => {
            setMessages(prev => [...prev, createComment(msg.content)]);
          }, i * 1200);
        });
      }
    };

    fetchLatest();

    // 2. Realtime 購読開始
    const channel = supabase
      .channel('public:chats-global-overlay')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chats'
      }, payload => {
        console.log('Incoming Stream Comment:', payload.new.content);
        const newMsg = createComment(payload.new.content);
        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Chat Overlay Subscribed successfully');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createComment = (text) => ({
    id: Math.random() + Date.now(),
    text,
    top: `${10 + Math.random() * 75}%`, // 10%〜85%にバラす
    duration: `${Math.random() * 4 + 7}s`, // 7s〜11s
  });

  const handleEnd = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[0]">
      {messages.map(msg => (
        <div
          key={msg.id}
          onAnimationEnd={() => handleEnd(msg.id)}
          className="absolute whitespace-nowrap text-xl font-bold text-white/20 drop-shadow-[0_2px_12px_rgba(0,0,0,1.0)] leading-none select-none chat-overlay italic tracking-tighter"
          style={{
            top: msg.top,
            animationDuration: msg.duration,
          }}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
