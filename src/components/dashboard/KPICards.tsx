import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DollarSign, 
  Activity, 
  Target, 
  ShieldCheck, 
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';

interface KPICardsProps {
  portfolioValue: number;
  todayPnl: number;
  todayPnlPct: number;
  activeTradesCount: number;
  buyCount: number;
  sellCount: number;
  winRate: number;
  chainIntegrity: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  portfolioValue,
  todayPnl,
  todayPnlPct,
  activeTradesCount,
  buyCount,
  sellCount,
  winRate,
  chainIntegrity
}) => {
  // Sparkline data array for Portfolio
  const sparkline = [105000, 108000, 107200, 110500, 112000, 114800, 117850];
  const maxS = Math.max(...sparkline);
  const minS = Math.min(...sparkline);
  const sparklinePath = sparkline
    .map((val, idx) => {
      const x = (idx / (sparkline.length - 1)) * 100;
      const y = 30 - ((val - minS) / (maxS - minS || 1)) * 25;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Portfolio Value */}
      <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] hover:border-[#3A4454] transition-all space-y-2 relative overflow-hidden group">
        <div className="flex items-center justify-between text-[#8B95A5] text-xs font-mono">
          <span>Portfolio Value</span>
          <Wallet size={15} className="text-[#3B82F6]" />
        </div>
        <div>
          <div className="text-xl font-bold font-mono text-[#F4F7FA] tracking-tight">
            ₹{portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs font-mono">
            <span className="text-[#10B981] font-semibold flex items-center">
              <ArrowUpRight size={13} />
              +4.82%
            </span>
            <span className="text-[#5F6978]">24H</span>
          </div>
        </div>
        {/* Sparkline SVG */}
        <div className="h-6 w-full pt-1">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
            <path
              d={sparklinePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 2. Today's P&L */}
      <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] hover:border-[#3A4454] transition-all space-y-2">
        <div className="flex items-center justify-between text-[#8B95A5] text-xs font-mono">
          <span>Today's P&L</span>
          <TrendingUp size={15} className="text-[#10B981]" />
        </div>
        <div>
          <div className="text-xl font-bold font-mono text-[#10B981] tracking-tight">
            +₹{todayPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-mono">
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] rounded">
              +{todayPnlPct.toFixed(2)}%
            </span>
            <span className="text-[#8B95A5]">Streak 4d</span>
          </div>
        </div>
        <div className="w-full bg-[#151B23] h-1.5 rounded-full overflow-hidden mt-3 border border-[#242B35]">
          <div className="bg-[#10B981] h-full w-[72%] rounded-full"></div>
        </div>
      </div>

      {/* 3. Active Trades */}
      <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] hover:border-[#3A4454] transition-all space-y-2">
        <div className="flex items-center justify-between text-[#8B95A5] text-xs font-mono">
          <span>Active Trades</span>
          <Activity size={15} className="text-[#F59E0B]" />
        </div>
        <div>
          <div className="text-xl font-bold font-mono text-[#F4F7FA] tracking-tight">
            {activeTradesCount} <span className="text-xs font-normal text-[#8B95A5]">Positions</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs font-mono">
            <span className="text-[#10B981] font-semibold">{buyCount} BUY</span>
            <span className="text-[#5F6978]">•</span>
            <span className="text-[#EF4444] font-semibold">{sellCount} SELL</span>
          </div>
        </div>
        <div className="flex items-center gap-1 pt-1">
          <div className="h-1.5 bg-[#10B981] rounded-l w-[33%]"></div>
          <div className="h-1.5 bg-[#EF4444] rounded-r w-[67%]"></div>
        </div>
      </div>

      {/* 4. Win Rate */}
      <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] hover:border-[#3A4454] transition-all space-y-2">
        <div className="flex items-center justify-between text-[#8B95A5] text-xs font-mono">
          <span>Win Rate</span>
          <Target size={15} className="text-[#8B5CF6]" />
        </div>
        <div>
          <div className="text-xl font-bold font-mono text-[#F4F7FA] tracking-tight">
            {winRate}%
          </div>
          <div className="text-xs font-mono text-[#8B95A5] mt-1">
            Last 100 executions
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-[#5F6978] pt-1">
          <span>68 W</span>
          <span>32 L</span>
        </div>
      </div>

      {/* 5. Blockchain Integrity */}
      <div className="p-4 rounded-xl bg-[#11161D] border border-[#10B981]/40 hover:border-[#10B981] transition-all space-y-2 bg-gradient-to-br from-[#11161D] to-[#10B981]/5">
        <div className="flex items-center justify-between text-[#8B95A5] text-xs font-mono">
          <span>Chain Integrity</span>
          <ShieldCheck size={16} className="text-[#10B981]" />
        </div>
        <div>
          <div className="text-xl font-bold font-mono text-[#10B981] tracking-tight flex items-center gap-1.5">
            <span>{chainIntegrity}%</span>
            <CheckCircle2 size={16} className="text-[#10B981]" />
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-mono text-[#10B981]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="font-bold">VERIFIED</span>
          </div>
        </div>
        <div className="text-[10px] font-mono text-[#8B95A5] pt-1">
          Consensus Block #4281
        </div>
      </div>
    </div>
  );
};
