import React, { useState } from 'react';

/**
 * 差分（GAP）測定スライダー
 * @param {string} label 項目名
 * @param {string} icon アイコン
 * @param {function} onChange 値変更時のコールバック
 */
export default function GapSlider({ label, subtitle, icon, labelLeft, labelRight, value = { me: 30, presenter: 70 }, onChange }) {
  const handleMeChange = (e) => {
    onChange({ ...value, me: parseInt(e.target.value) });
  };

  const handlePresenterChange = (e) => {
    onChange({ ...value, presenter: parseInt(e.target.value) });
  };

  const gap = value.presenter - value.me;

  return (
    <div className="glass-card mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">{label}</h3>
          <p className="text-xs text-white/40">{subtitle}</p>
        </div>
      </div>

      <div className="relative h-12 flex items-center group mb-2">
        {/* レール */}
        <div className="absolute w-full h-2 bg-white/10 rounded-full overflow-hidden">
          {/* GAP部分の着色 */}
          <div 
            className="absolute h-full heat-gradient transition-all duration-300"
            style={{ 
              left: `${Math.min(value.me, value.presenter)}%`, 
              width: `${Math.abs(gap)}%` 
            }}
          />
        </div>

        {/* 自分の位置（Input） */}
        <input
          type="range"
          min="0"
          max="100"
          value={value.me}
          onChange={handleMeChange}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-20 
                     [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
                     [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-blue-500
                     [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
          title="自分の現在地"
        />

        {/* 登壇者の位置（Input） */}
        <input
          type="range"
          min="0"
          max="100"
          value={value.presenter}
          onChange={handlePresenterChange}
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none z-30
                     [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 
                     [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,77,0,0.8)]"
          title="登壇者の位置"
        />

        {/* ラベル表示 */}
        <div 
            className="absolute -top-7 text-[10px] font-bold text-blue-400"
            style={{ left: `${value.me}%`, transform: 'translateX(-50%)' }}
        >
            自分
        </div>
        <div 
            className="absolute -bottom-7 text-[10px] font-bold text-brand-orange"
            style={{ left: `${value.presenter}%`, transform: 'translateX(-50%)' }}
        >
            登壇者
        </div>
      </div>

      {/* 目盛りラベル */}
      <div className="flex justify-between mt-3 mb-4 px-1 gap-4">
        <div className="flex-1 text-[9px] text-white/30 text-left leading-tight break-words">
          {labelLeft}
        </div>
        <div className="flex-1 text-[9px] text-brand-orange/50 text-right leading-tight break-words">
          {labelRight}
        </div>
      </div>

      <div className="mt-2 flex justify-between items-end border-t border-white/5 pt-2">
        <span className="text-white/20 text-[10px] font-bold tracking-widest">GAP SCORE</span>
        <span className="text-2xl font-black text-heat leading-none">
          {gap > 0 ? `+${gap}` : gap}
        </span>
      </div>
    </div>
  );
}
