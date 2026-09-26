import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, Wallet, ArrowUpRight, TrendingUp } from 'lucide-react';

export const PortfolioOverview: React.FC = () => {
  const allocation = [
    { name: 'BTC / USDT', value: 26062.50, color: '#3B82F6' },
    { name: 'ETH / USDT', value: 112780.00, color: '#8B5CF6' },
    { name: 'SOL / USDT', value: 68580.00, color: '#F59E0B' },
    { name: 'Unallocated Cash', value: 58925.21, color: '#10B981' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11161D] p-5 rounded-xl border border-[#242B35]">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon size={20} className="text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-[#F4F7FA] font-mono tracking-tight">
              Asset Allocation & Portfolio Matrix
            </h2>
          </div>
          <p className="text-xs text-[#8B95A5] mt-1">
            Real-time capital deployment across perpetual margin pairs.
          </p>
        </div>
      </div>

      {/* Top 6 Financial Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono">
        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35]">
          <span className="text-xs text-[#8B95A5] block">Total Portfolio</span>
          <span className="text-base font-bold text-[#F4F7FA]">₹1,17,850.42</span>
        </div>
        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35]">
          <span className="text-xs text-[#8B95A5] block">Available Cash</span>
          <span className="text-base font-bold text-[#10B981]">₹58,925.21</span>
        </div>
        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35]">
          <span className="text-xs text-[#8B95A5] block">Invested Capital</span>
          <span className="text-base font-bold text-[#3B82F6]">₹58,925.21</span>
        </div>
        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35]">
          <span className="text-xs text-[#8B95A5] block">Unrealized P&L</span>
          <span className="text-base font-bold text-[#10B981]">+₹1,042.50</span>
        </div>
        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35]">
          <span className="text-xs text-[#8B95A5] block">Realized P&L</span>
          <span className="text-base font-bold text-[#10B981]">+₹16,807.92</span>
        </div>
        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35]">
          <span className="text-xs text-[#8B95A5] block">Exposure</span>
          <span className="text-base font-bold text-[#F4F7FA]">42.0%</span>
        </div>
      </div>

      {/* Allocation Donut Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-4 shadow-fintech">
          <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider">
            Asset Distribution Spectrum
          </h3>

          <div className="h-64 w-full bg-[#080A0F] rounded-xl p-3 border border-[#1E2631] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#080A0F" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0D1117', 
                    borderColor: '#242B35', 
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: '#F4F7FA'
                  }} 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Allocation']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Legend List */}
        <div className="p-5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-3 shadow-fintech font-mono text-xs flex flex-col justify-between">
          <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider">
            Capital Breakdown Legend
          </h3>

          <div className="space-y-3">
            {allocation.map(item => (
              <div key={item.name} className="p-3 rounded-lg bg-[#151B23] border border-[#242B35] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="font-bold text-[#F4F7FA]">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#F4F7FA] block">₹{item.value.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-[#8B95A5]">
                    {((item.value / 266347.71) * 100).toFixed(1)}% of Capital
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
