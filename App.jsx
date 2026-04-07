import React, { useState, useEffect } from 'react';
import { useUser } from './hooks/useUser';
import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from './lib/supabase';
import ChatOverlay from './components/ChatOverlay';
import AdminScreen from './components/AdminScreen';
import VotingScreen from './components/VotingScreen';
import ChatRoom from './components/ChatRoom';
import { MessageSquare, Users, Award, ExternalLink, Zap, Monitor, Home, Activity, ShieldAlert } from 'lucide-react';

const TEAMS = [
  { id: 1, name: "Team A", status: "ピッチ中", description: "九大発の次世代〇〇開発" },
  { id: 2, name: "Team B", status: "待機中", description: "地域課題を解決するアプリ" },
  { id: 3, name: "Team C", status: "待機中", description: "教育の未来を変えるプロダクト" },
  { id: 4, name: "Team D", status: "待機中", description: "持続可能な食の革命" },
  { id: 5, name: "Team E", status: "待機中", description: "AIによるクリエイティブ支援" },
  { id: 6, name: "Team F", status: "待機中", description: "宇宙を目指すモビリティ" },
];

export default function App() {
  const { userId } = useUser();
  const [view, setView] = useState('home');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // リアルタイム・チャットの通知監視
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chats' }, () => {
        if (view !== 'chat') setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [view]);

  useEffect(() => {
    if (view === 'chat') setUnreadCount(0);
  }, [view]);

  // 環境設定エラー画面
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-brand-deep-black flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a] text-white">
        <div className="p-6 bg-red-600/10 border border-red-500/30 rounded-3xl mb-8 relative">
          <div className="absolute inset-x-0 inset-y-0 bg-red-500/10 blur-3xl animate-pulse rounded-full"></div>
          <ShieldAlert className="w-16 h-16 text-red-500 relative z-10" />
        </div>
        <h1 className="text-3xl font-black mb-4 tracking-tighter uppercase italic text-red-500">Supabase Config Invalid</h1>
        <p className="text-white/40 text-sm max-w-sm mb-10 leading-relaxed font-bold">
          `.env` ファイルの接続情報が正しく設定されていません。プロジェクトの URL 共有設定を確認し、以下の値を実際のキーに置き換えてください。
        </p>

        <div className="w-full max-w-md space-y-4 font-mono text-[11px] bg-white/[0.03] p-6 rounded-2xl border border-white/5 text-left overflow-hidden">
          <div className="border-b border-white/5 pb-2">
            <span className="text-white/20 block mb-1">VITE_SUPABASE_URL</span>
            <span className={supabaseUrl === 'your_supabase_url' || !supabaseUrl ? 'text-red-500' : 'text-green-500'}>{supabaseUrl || '(EMPTY)'}</span>
          </div>
          <div>
            <span className="text-white/20 block mb-1">VITE_SUPABASE_ANON_KEY</span>
            <span className={supabaseAnonKey === 'your_anon_key' || !supabaseAnonKey ? 'text-red-500 font-bold' : 'text-green-500'}>{supabaseAnonKey ? '********' : '(EMPTY)'}</span>
          </div>
        </div>

        <p className="mt-10 text-[10px] text-white/20 font-black uppercase tracking-widest leading-none">After update, restart `npm run dev` in your terminal</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white/40">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] italic leading-none">Identity_Syncing...</p>
        </div>
      </div>
    );
  }

  const selectedTeam = TEAMS.find(t => t.id === selectedTeamId);

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden flex flex-col text-white pb-24 font-sans antialiased">

      {/* Background Radiance */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <ChatOverlay />

      {/* Persistent Header */}
      <header className="sticky top-0 z-40 p-5 border-b border-white/5 bg-[#050505]/60 backdrop-blur-2xl flex items-center justify-between">
        <h1 className="text-xl font-black text-heat leading-none">
          <span className="text-[10px] block font-bold text-white/40 mb-1 tracking-[0.2em] uppercase">Kyudai 0→1 Award</span>
          {view === 'home' ? 'TEAM LIST' :
            view === 'gap' ? 'HEAT GAP' :
              view === 'screen' ? 'SCREEN VIEW' :
                view === 'chat' ? 'CHAT ROOM' : 'VOTING'}
        </h1>
        <div className="text-[10px] text-brand-orange/60 font-mono flex flex-col items-end">
          <span className="text-white/20 uppercase font-black tracking-tighter">Agent_ID</span>
          <span className="font-bold">{userId.slice(0, 8)}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full z-10">

        {view === 'home' && (
          <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {TEAMS.map((team) => {
              const isLive = false;
              return (
                <div
                  key={team.id}
                  className={`glass-card relative flex flex-col h-full border transition-all duration-500 ${isLive ? 'border-brand-orange shadow-[0_0_25px_rgba(255,77,0,0.3)] animate-glow' : 'border-white/5 opacity-80'
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    {isLive ? (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600/20 text-red-500 text-[9px] font-black rounded border border-red-500/30 uppercase">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    ) : <div className="h-4"></div>}
                    <span className="text-[9px] font-black text-white/20 ml-auto tracking-widest">0{team.id}</span>
                  </div>
                  <h3 className="text-sm font-black mb-1 line-clamp-1 leading-none">{team.name}</h3>
                  <p className="text-[10px] text-white/40 mb-5 line-clamp-2 leading-tight flex-1">
                    {team.description}
                  </p>

                  <button
                    onClick={() => {
                      setSelectedTeamId(team.id);
                      setView('voting');
                    }}
                    className="w-full py-3 bg-brand-orange text-white text-[10px] font-black rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-orange/20"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    ⚡ 投票する
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {view === 'voting' && selectedTeam && (
          <VotingScreen
            team={selectedTeam}
            userId={userId}
            onBack={() => setView('home')}
            onNavigate={(v) => setView(v)}
          />
        )}

        {view === 'gap' && (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-left-8 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-brand-orange/20 rounded-2xl">
                <Activity className="w-6 h-6 text-brand-orange" />
              </div>
              <h2 className="text-lg font-black tracking-widest uppercase italic">Team Heat Profiles</h2>
            </div>
            {TEAMS.map(team => (
              <div key={team.id} className="glass-card flex items-center justify-between border-white/5 py-4 px-5">
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-mono text-brand-orange/60 bg-brand-orange/10 w-8 h-8 flex items-center justify-center rounded-lg font-bold">0{team.id}</div>
                  <div className="font-black text-sm tracking-wide lowercase italic">{team.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'screen' && (
          <AdminScreen onBack={() => setView('home')} />
        )}

        {view === 'chat' && (
          <ChatRoom userId={userId} />
        )}

      </main>

      {/* Unified Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 bg-[#050505]/95 backdrop-blur-3xl border-t border-white/5 max-w-md mx-auto">
        <div className="flex items-center justify-between px-4">
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center gap-1.5 transition-all ${view === 'home' ? 'text-brand-orange scale-110' : 'text-white/20 hover:text-white/50'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">Home</span>
          </button>

          <button
            onClick={() => setView('gap')}
            className={`flex flex-col items-center gap-1.5 transition-all ${view === 'gap' ? 'text-brand-orange scale-110' : 'text-white/20 hover:text-white/50'}`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">Gap</span>
          </button>

          <button
            onClick={() => setView('screen')}
            className={`flex flex-col items-center gap-1.5 transition-all ${view === 'screen' ? 'text-brand-orange scale-110' : 'text-white/20 hover:text-white/50'}`}
          >
            <Monitor className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">Screen</span>
          </button>

          <button
            onClick={() => setView('chat')}
            className={`flex flex-col items-center gap-1.5 transition-all ${view === 'chat' ? 'text-brand-orange scale-110' : 'text-white/20 hover:text-white/50'}`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-brand-orange text-white text-[8px] font-black rounded-full flex items-center justify-center animate-bounce px-0.5 border-2 border-[#050505]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">Chat</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
