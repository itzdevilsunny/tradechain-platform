import React, { useState } from 'react';
import { runQuantBacktest, BacktestInput } from '../../lib/backtestEngine';
import { BacktestResult } from '../../types/trading';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Activity, 
  Play, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  Zap, 
  RefreshCw,
  Sliders,
  Award
} from 'lucide-react';

export const BacktestWorkspace: React.FC = () => {
  const [asset, setAsset] = useState('BTC/USDT');
  const [strategyName, setStrategyName] = useState('EMA + RSI Momentum');
  const [initialCapital, setInitialCapital] = useState(100000);
  const [riskPerTrade, setRiskPerTrade] = useState(1.0);
  const [stopLossPct, setStopLossPct] = useState(2.0);
  const [takeProfitPct, setTakeProfitPct] = useState(4.0);
  const [isSimulating, setIsSimulating] = useState(false);

  const [results, setResults] = useState<BacktestResult>(() => 
    runQuantBacktest({
      asset,
      strategyName,
      initialCapital,
      riskPerTradePct: riskPerTrade,
      stopLossPct,
      takeProfitPct,
      dateRange: 'YTD 2026'
    })
  );

  const handleRunBacktest = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = runQuantBacktest({
        asset,
        strategyName,
        initialCapital,
        riskPerTradePct: riskPerTrade,
        stopLossPct,
        takeProfitPct,
        dateRange: 'YTD 2026'
      });
      setResults(res);
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11161D] p-5 rounded-xl border border-[#242B35]">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-[#F4F7FA] font-mono tracking-tight">
              Strategy Backtesting Workspace
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 rounded">
              DETERMINISTIC SIMULATOR
            </span>
          </div>
          <p className="text-xs text-[#8B95A5] mt-1">
            Historical algorithmic simulation bound to immutable strategy hashes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#8B95A5]">Strategy Hash:</span>
          <span className="px-2.5 py-1 rounded bg-[#080A0F] border border-[#242B35] text-[#10B981] font-bold">
            {results.strategyHash.slice(0, 18)}...
          </span>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="p-5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-4 shadow-fintech">
        <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
          <Sliders size={16} className="text-[#3B82F6]" />
          Backtest Hyperparameters & Risk Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          
          {/* Asset */}
          <div>
            <label className="text-[#8B95A5] block mb-1">Target Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full bg-[#080A0F] border border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2.5 text-[#F4F7FA] outline-none"
            >
              <option value="BTC/USDT">BTC / USDT Perpetual</option>
              <option value="ETH/USDT">ETH / USDT Perpetual</option>
              <option value="SOL/USDT">SOL / USDT Perpetual</option>
            </select>
          </div>

          {/* Strategy */}
          <div>
            <label className="text-[#8B95A5] block mb-1">Strategy Algorithm</label>
            <select
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              className="w-full bg-[#080A0F] border border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2.5 text-[#F4F7FA] outline-none"
            >
              <option value="EMA + RSI Momentum">EMA + RSI Momentum v1.2</option>
              <option value="MACD Breakout">MACD Trend Breakout v0.9</option>
              <option value="Bollinger Mean Rev">Bollinger Mean Reversion v2.1</option>
            </select>
          </div>

          {/* Initial Capital */}
          <div>
            <label className="text-[#8B95A5] block mb-1">Initial Capital (INR)</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-[#080A0F] border border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2.5 text-[#F4F7FA] outline-none"
            />
          </div>

          {/* Risk per trade */}
          <div>
            <label className="text-[#8B95A5] block mb-1">Risk per Trade (%)</label>
            <input
              type="number"
              step="0.5"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(Number(e.target.value))}
              className="w-full bg-[#080A0F] border border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2.5 text-[#F4F7FA] outline-none"
            />
          </div>

          {/* Run button */}
          <div className="flex items-end">
            <button
              onClick={handleRunBacktest}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-fintech transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  <span>RUN BACKTEST</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Results Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        
        <div className="p-4 rounded-xl bg-[#11161D] border border-[#10B981]/40 space-y-1">
          <span className="text-xs font-mono text-[#8B95A5] block">Total Return</span>
          <div className="text-xl font-bold font-mono text-[#10B981]">
            +{results.totalReturn}%
          </div>
          <span className="text-[10px] font-mono text-[#5F6978]">Net +₹{(initialCapital * results.totalReturn / 100).toLocaleString('en-IN')}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <span className="text-xs font-mono text-[#8B95A5] block">Win Rate</span>
          <div className="text-xl font-bold font-mono text-[#F4F7FA]">
            {results.winRate}%
          </div>
          <span className="text-[10px] font-mono text-[#10B981]">{results.winningTrades} W / {results.losingTrades} L</span>
        </div>

        <div className="p-4 rounded-xl bg-[#11161D] border border-[#EF4444]/40 space-y-1">
          <span className="text-xs font-mono text-[#8B95A5] block">Max Drawdown</span>
          <div className="text-xl font-bold font-mono text-[#EF4444]">
            -{results.maxDrawdown}%
          </div>
          <span className="text-[10px] font-mono text-[#8B95A5]">Peak to Valley</span>
        </div>

        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <span className="text-xs font-mono text-[#8B95A5] block">Profit Factor</span>
          <div className="text-xl font-bold font-mono text-[#F4F7FA]">
            {results.profitFactor}
          </div>
          <span className="text-[10px] font-mono text-[#8B95A5]">Sharpe: {results.sharpeRatio}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <span className="text-xs font-mono text-[#8B95A5] block">Total Trades</span>
          <div className="text-xl font-bold font-mono text-[#3B82F6]">
            {results.totalTrades}
          </div>
          <span className="text-[10px] font-mono text-[#8B95A5]">Avg Dwell: {results.avgTradeTime}</span>
        </div>
      </div>

      {/* Equity Curve Chart */}
      <div className="p-5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-4 shadow-fintech">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-[#10B981]" />
            Cumulative Portfolio Equity Trajectory (INR)
          </h3>
          <span className="text-xs font-mono text-[#10B981] font-bold">
            Peak Portfolio: ₹{(initialCapital * (1 + results.totalReturn / 100)).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="h-64 w-full bg-[#080A0F] rounded-xl p-3 border border-[#1E2631]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={results.equityCurve} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#5F6978" tick={{ fill: '#8B95A5', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#5F6978" tick={{ fill: '#8B95A5', fontSize: 10, fontFamily: 'JetBrains Mono' }} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0D1117', 
                  borderColor: '#242B35', 
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono',
                  color: '#F4F7FA'
                }} 
              />
              <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#equityGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drawdown Spectrum Chart */}
      <div className="p-5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-4 shadow-fintech">
        <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider text-[#EF4444]">
          Underwater Drawdown Depth Spectrum (%)
        </h3>

        <div className="h-32 w-full bg-[#080A0F] rounded-xl p-3 border border-[#1E2631]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.equityCurve} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#5F6978" tick={{ fill: '#8B95A5', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#5F6978" tick={{ fill: '#EF4444', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Bar dataKey="drawdown" fill="#EF4444" opacity={0.7} radius={[0, 0, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
