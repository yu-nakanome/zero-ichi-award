import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

export default function ChatRoom({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    // 1. 初期ロード
    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (error) {
        console.error('Fetch chats error:', error);
      } else if (data) {
        setMessages(data);
      }
      setIsLoading(false);
    };

    fetchMessages();

    // 2. Realtime 購読開始
    const channel = supabase
      .channel('public:chats-room')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chats' 
      }, payload => {
        console.log('Room Received Message:', payload.new);
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Chat Room Subscribed');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const content = input.trim();
    setInput('');

    const { error } = await supabase.from('chats').insert({
      user_id: userId,
      content,
    });

    if (error) {
      console.error("Post message error:", error);
      alert('送信に失敗しました。接続を確認してください。');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] animate-in fade-in duration-700">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-5 pr-2 pb-6 scrollbar-hide pt-2"
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-white/5 animate-pulse">
             <Loader2 className="w-8 h-8 animate-spin mb-2" />
             <p className="text-[10px] uppercase font-black tracking-widest leading-none">Syncing Stream...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/10 gap-5">
             <div className="p-5 bg-white/[0.02] rounded-full border border-white/5">
                <MessageSquare className="w-10 h-10" />
             </div>
             <p className="text-[10px] uppercase font-black tracking-[0.4em] italic">No active thoughts found</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === userId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1.5 animate-in slide-in-from-bottom-2 duration-300`}>
                <span className="text-[9px] font-black text-white/20 px-2.5 uppercase font-mono tracking-tighter">
                  {isMe ? 'AUTHORIZED_AGENT' : `REMOTE_UNIT_${msg.user_id.slice(0, 5).toUpperCase()}`}
                </span>
                <div 
                  className={`max-w-[85%] px-5 py-4 text-sm font-bold rounded-2xl ${
                    isMe 
                      ? 'bg-brand-orange text-white rounded-tr-none shadow-xl shadow-brand-orange/20' 
                      : 'bg-white/5 border border-white/10 rounded-tl-none backdrop-blur-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-3 p-1 border-t border-white/10 pt-5 mt-auto">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="リアルタイムで思考を出力..." 
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand-orange transition-all placeholder:text-white/10 shadow-inner"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="w-14 h-14 bg-brand-orange rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-orange/30 disabled:opacity-30 disabled:grayscale transition-all active:scale-90 hover:scale-105"
        >
          <Send className="w-6 h-6 text-white" />
        </button>
      </form>
    </div>
  );
}
