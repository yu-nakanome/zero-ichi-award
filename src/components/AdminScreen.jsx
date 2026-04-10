import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ChatOverlay from './ChatOverlay';
import { Zap, ChevronLeft, Target, Users } from 'lucide-react';

// 10行目のすぐ上に貼り付け
const TEAMS = [
  { id: 1, name: "九大ギルド" },
  { id: 2, name: "TOMOSHIBI" },
  { id: 3, name: "Q-delivery" },
  { id: 4, name: "JaoRium" },
  { id: 5, name: "Aun" },
];

/**
 * 会場スクリーン用インターフェース
 * 全参加者の熱量データをリアルタイムに集計・可視化
 */
export default function AdminScreen({ onBack }) {
  const [stats, setStats] = useState({ friction: 0, evolution: 0, ignition: 0, count: 0 });
  const [activeTeam, setActiveTeam] = useState(1);

  useEffect(() => {
    // 初回データ取得
    fetchStats();

    // 投票テーブルのリアルタイム監視
    // 注意: SupabaseダッシュボードでテーブルのRealtimeが有効である必要があります。
    const channel = supabase
      .channel(`realtime:admin-stats-${activeTeam}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: `team_id=eq.${activeTeam}`
      }, (payload) => {
        console.log('Realtime Vote Received:', payload);
        fetchStats();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Realtime Connected for Team ${activeTeam}`);
        }
      });

    return () => supabase.removeChannel(channel);
  }, [activeTeam]);

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('votes')
      .select('score_friction, score_evolution, score_ignition')
      .eq('team_id', activeTeam);

    if (error) {
      console.error('Fetch error:', error);
      return;
    }

    if (data && data.length > 0) {
      const sum = data.reduce((acc, curr) => ({
        f: acc.f + curr.score_friction,
        e: acc.e + curr.score_evolution,
        i: acc.i + curr.score_ignition,
      }), { f: 0, e: 0, i: 0 });

      setStats({
        friction: Math.round(sum.f / data.length),
        evolution: Math.round(sum.e / data.length),
        ignition: Math.round(sum.i / data.length),
        count: data.length
      });
    } else {
      setStats({ friction: 0, evolution: 0, ignition: 0, count: 0 });
    }
  };

  // レーダーチャート用計算
  const size = 350;
  const center = size / 2;
  const radius = size * 0.45;

  const getPoint = (angle, value) => {
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle - Math.PI / 2);
    const y = center + r * Math.sin(angle - Math.PI / 2);
    return `${x},${y}`;
  };

  const points = [
    getPoint(0, stats.friction),
    getPoint((2 * Math.PI) / 3, stats.evolution),
    getPoint((4 * Math.PI) / 3, stats.ignition),
  ].join(' ');
  // 86行目のすぐ上に挿入
  const currentTeam = TEAMS.find(t => t.id === activeTeam);
  const teamDisplayName = currentTeam ? currentTeam.name : `TEAM ${String(activeTeam).padStart(2, '0')}`;



  return (
    <div className="fixed inset-0 bg-[#050505] text-white flex flex-col items-center justify-center p-16 overflow-hidden">
      {/* リアルタイムチャット通知 */}
      <ChatOverlay />

      {/* Control Surface */}
      <div className="absolute top-10 left-10 flex items-center gap-6 z-[60] bg-white/[0.02] border border-white/5 p-2 rounded-2xl backdrop-blur-xl">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-white/5">
          {[1, 2, 3, 4, 5, 6].map(id => (
            <button
              key={id}
              onClick={() => setActiveTeam(id)}
              className={`px-6 py-2.5 text-[10px] font-black transition-all rounded-lg ${activeTeam === id ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-white/20 hover:text-white/40'}`}
            >
              {TEAMS.find(t => t.id === id)?.name || id}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center z-10 max-w-7xl w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000">
        <div className="mb-8 inline-flex items-center gap-3 px-6 py-1.5 bg-red-600/10 text-red-500 rounded-full border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)] font-bold">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_#ef4444]"></div>
          <span className="text-[11px] font-black tracking-[0.4em] uppercase font-mono">Real-time Stream Connected</span>
        </div>

        <h1 className="text-9xl font-black text-heat mb-24 tracking-[ -0.05em] drop-shadow-2xl uppercase">
          {teamDisplayName}
        </h1>

        <div className="flex justify-center items-center gap-32 w-full">
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-orange/10 blur-[150px] rounded-full group-hover:bg-brand-orange/20 transition-all duration-1000"></div>
            <svg width={size} height={size} className="relative z-10 drop-shadow-[0_0_50px_rgba(255,77,0,0.6)]">
              {[1, 0.75, 0.5, 0.25].map(scale => (
                <polygon
                  key={scale}
                  points={`${getPoint(0, 100 * scale)} ${getPoint((2 * Math.PI) / 3, 100 * scale)} ${getPoint((4 * Math.PI) / 3, 100 * scale)}`}
                  className="fill-none stroke-white/5 stroke-[1px]"
                />
              ))}
              {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map(angle => (
                <line
                  key={angle}
                  x1={center} y1={center}
                  x2={center + radius * Math.cos(angle - Math.PI / 2)}
                  y2={center + radius * Math.sin(angle - Math.PI / 2)}
                  className="stroke-white/5 stroke-[1px]"
                />
              ))}
              <polygon
                points={points}
                className="fill-brand-orange/30 stroke-brand-orange stroke-[8px] shadow-[0_0_20px_rgba(255,123,0,0.5)] transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
              />
            </svg>

            <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 text-center">
              <div className="text-[11px] font-black uppercase text-white tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">代謝・摩擦熱</div>
            </div>
            <div className="absolute bottom-[20px] left-[-70px] text-center">
              <div className="text-[11px] font-black uppercase text-white tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">変異熱</div>
            </div>
            <div className="absolute bottom-[20px] right-[-70px] text-center">
              <div className="text-[11px] font-black uppercase text-white tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">引火熱</div>
            </div>
          </div>

          <div className="text-left space-y-16 min-w-[320px]">
            <div className="relative p-7 border-l-[6px] border-brand-orange bg-white/[0.03] rounded-r-2xl">
              <div className="flex items-center gap-3 text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                <Users className="w-4.5 h-4.5" />
                Population Density
              </div>
              <div className="flex items-baseline gap-5">
                <div className="text-8xl font-black tabular-nums tracking-tighter shadow-heat drop-shadow-xl">{stats.count.toString().padStart(2, '0')}</div>
                <div className="text-xs font-black text-white/30 uppercase tracking-[0.2em] leading-tight">Validated<br />Heat Samples</div>
              </div>
            </div>

            <div className="grid gap-8">
              {[
                { label: '摩擦熱', val: stats.friction, icon: '🔥' },
                { label: '変異熱', val: stats.evolution, icon: '⚡' },
                { label: '引火熱', val: stats.ignition, icon: '💡' }
              ].map(item => (
                <div key={item.label} className="group border-b border-white/5 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">{item.label}</span>
                    <span className="text-xl rotate-0 group-hover:rotate-12 transition-transform">{item.icon}</span>
                  </div>
                  <div className="text-5xl font-black text-brand-orange tabular-nums drop-shadow-[0_0_15px_rgba(255,77,0,0.5)] transition-all group-hover:scale-110 origin-left">
                    +{item.val.toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 text-white/10 text-[10px] font-mono tracking-[1.2em] uppercase flex items-center gap-12 select-none">
        <span className="hover:text-white/20 transition-colors cursor-help">Heat_Viz_Platform_v2.1</span>
        <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"></div>
        <span className="hover:text-white/20 transition-colors uppercase">Distributed_Cloud_Sync</span>
      </div>
    </div>
  );
}
