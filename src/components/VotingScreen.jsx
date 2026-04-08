import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import GapSlider from './GapSlider';
import { Zap, ExternalLink, Activity, Monitor, ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function VotingScreen({ team, userId, onBack, onNavigate, onSuccess }) {
  const [scores, setScores] = useState({
    action: { me: 30, presenter: 70 },
    evolution: { me: 40, presenter: 60 },
    ignition: { me: 20, presenter: 80 },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleVote = async () => {
    if (!userId || isSubmitting) return;
    setIsSubmitting(true);
    console.log(`Starting vote for Team ${team.id} by User ${userId}`);

    try {
      const myScores = {
        friction: scores.action.presenter - scores.action.me,
        evolution: scores.evolution.presenter - scores.evolution.me,
        ignition: scores.ignition.presenter - scores.ignition.me,
      };

      // 1. Supabaseへ送信 (Upsert)
      const { error: upsertError } = await supabase.from('votes').upsert({
        user_id: userId,
        team_id: team.id,
        score_friction: myScores.friction,
        score_evolution: myScores.evolution,
        score_ignition: myScores.ignition,
      }, { onConflict: 'user_id, team_id' });

      if (upsertError) throw upsertError;
      console.log('Vote broadcasted successfully to Supabase');
      if (onSuccess) onSuccess();
      // 2. 全体平均を取得してリアルタイム反映
      const { data: allVotes, error: fetchError } = await supabase
        .from('votes')
        .select('score_friction, score_evolution, score_ignition')
        .eq('team_id', team.id);

      if (fetchError) throw fetchError;
      console.log(`Fetched ${allVotes?.length || 0} relative samples`);

      // 最初の投票や接続直後の場合でも結果を表示
      let averages = { ...myScores };

      if (allVotes && allVotes.length > 0) {
        const sum = allVotes.reduce((acc, curr) => ({
          f: acc.f + curr.score_friction,
          e: acc.e + curr.score_evolution,
          i: acc.i + curr.score_ignition,
        }), { f: 0, e: 0, i: 0 });

        averages = {
          friction: Math.round(sum.f / allVotes.length),
          evolution: Math.round(sum.e / allVotes.length),
          ignition: Math.round(sum.i / allVotes.length),
        };
      }

      setResult({
        average: averages,
        myGap: {
          friction: myScores.friction - averages.friction,
          evolution: myScores.evolution - averages.evolution,
          ignition: myScores.ignition - averages.ignition,
        }
      });
      console.log('Final GAP calculation established');

    } catch (err) {
      console.error("Critical submission error:", err);
      alert('Supabaseとの通信に失敗しました。接続情報とRLS設定を確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-8 pt-4 animate-in fade-in zoom-in-95 duration-700 max-w-sm mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-brand-orange/20 rounded-full mb-6 relative">
            <div className="absolute inset-x-0 inset-y-0 bg-brand-orange/10 blur-2xl rounded-full animate-pulse"></div>
            <CheckCircle2 className="w-12 h-12 text-brand-orange relative z-10" />
          </div>
          <h2 className="text-4xl font-black mb-3 tracking-tighter uppercase italic">Synced</h2>
          <p className="text-[11px] text-white/30 uppercase tracking-[0.5em] font-mono leading-none">Global Insight Collated</p>
        </div>

        <div className="glass-card border-brand-orange/30 bg-brand-orange/5 space-y-10 p-9 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-full h-[2px] heat-gradient opacity-60"></div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-center text-white/30 mb-6">Thermal Deviation Map</h3>

          <div className="space-y-10">
            {[
              // 101行目
              { label: '摩擦熱', value: result.myGap.friction, avg: result.average.friction },
              // 102行目
              { label: '変異熱', value: result.myGap.evolution, avg: result.average.evolution },
              // 103行目
              { label: '引火熱', value: result.myGap.ignition, avg: result.average.ignition }
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-4 group">
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-[11px] font-black text-white/40 uppercase tracking-widest leading-none">{item.label}</span>
                  <span className="text-[10px] font-mono text-white/10 bg-white/[0.02] px-3 py-1 rounded-full uppercase tracking-tighter">Avg_Heat: +{item.avg}</span>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase italic">Deviation</span>
                  <span className={`text-5xl font-black tabular-nums tracking-tighter drop-shadow-lg ${item.value >= 0 ? 'text-brand-orange' : 'text-blue-500'}`}>
                    {item.value >= 0 ? '+' : ''}{item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full py-6 bg-white/[0.03] border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white/10 transition-all active:scale-95 shadow-2xl hover:shadow-brand-orange/5"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-7 pt-2 animate-in fade-in slide-in-from-right-12 duration-700 pb-16">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="p-4 -ml-4 text-white/20 hover:text-white transition-colors"><ChevronLeft className="w-8 h-8" /></button>
        <div className="flex-1 text-center pr-12">
          <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-orange mb-1.5 leading-none">Thermal Scan Phase</h2>
          <div className="text-2xl font-black tracking-tight uppercase italic">{team.name}</div>
        </div>
      </header>

      <div className="glass-card border-white/10 bg-white/5 border-dashed p-6">
        <p className="text-[12px] text-white/40 leading-relaxed font-bold italic">
          "{team.description}"
        </p>
      </div>

      <div className="grid gap-3 pt-4">
        <GapSlider
          label="代謝・摩擦熱"
          subtitle="泥臭い行動量・リスクテイク"
          icon="🔥"
          labelLeft="安定志向"
          labelRight="泥臭い行動量"
          value={scores.action}
          onChange={(v) => setScores({ ...scores, action: v })}
        />
        <GapSlider
          label="変異熱"
          subtitle="ピボットの速さ・進化量"
          icon="⚡"
          labelLeft="昨日までの自分"
          labelRight="異次元の脱皮"
          value={scores.evolution}
          onChange={(v) => setScores({ ...scores, evolution: v })}
        />
        <GapSlider
          label="引火熱"
          subtitle="ビジョンへの確信度・解像度"
          icon="💡"
          labelLeft="希望的観測"
          labelRight="確定した未来"
          value={scores.ignition}
          onChange={(v) => setScores({ ...scores, ignition: v })}
        />
      </div>

      <button
        onClick={handleVote}
        disabled={isSubmitting}
        className="w-full btn-primary mt-10 py-6 shadow-[0_0_60px_-15px_rgba(255,77,0,0.4)] disabled:opacity-30 font-black tracking-[0.3em] uppercase italic transition-all hover:scale-[1.02] active:scale-95 text-lg"
      >
        {isSubmitting ? 'Transmitting...' : '⚡ 差分を同期して送信'}
      </button>

      <div className="pt-14 border-t border-white/5">
        <h3 className="text-[11px] font-black text-white/10 uppercase mb-6 flex items-center gap-3 tracking-[0.4em]">
          <ExternalLink className="w-4 h-4" />
          Agent_Action_Logs
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-square bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center group relative cursor-not-allowed transition-all opacity-40">
              <span className="text-white/20 text-[9px] font-black uppercase tracking-tighter mb-1">Log_0{i}</span>
              <span className="text-[8px] font-mono text-white/5 uppercase">Secure_Link</span>
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform origin-left opacity-30"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
