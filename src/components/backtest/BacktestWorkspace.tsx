import React, { useState } from 'react';
import { runQuantBacktest, DetailedBacktestTrade } from '../../lib/backtestEngine';
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
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

export const BacktestWorkspace: React.FC = () => {
  const [asset, setAsset] = useState('NIFTY 50 Futures');
  const [strategyName, setStrategyName] = useState('Quant EMA Crossover Scalper');
  const [initialCapital, setInitialCapital] = useState(500000);
  const [riskPerTrade, setRiskPerTrade] = useState(2.0);
  const [stopLossPct, setStopLossPct] = useState(1.5);
  const [takeProfitPct, setTakeProfitPct] = useState(3.5);
  const [timeframe, setTimeframe] = useState('15m');
  const [dateRange, setDateRange] = useState('YTD 2026');
  const [isSimulating, setIsSimulating] = useState(false);
  const [tradeLogFilter, setTradeLogFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  const [simulationData, setSimulationData] = useState(() => 
    runQuantBacktest({
      asset,
      strategyName,
      initialCapital,
      riskPerTradePct: riskPerTrade,
      stopLossPct,
      takeProfitPct,
      dateRange,
      timeframe
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
        dateRange,
        timeframe
      });
      setSimulationData(res);
      setIsSimulating(false);
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = "TradeID,EntryTime,ExitTime,Asset,Side,EntryPrice,ExitPrice,PnL(INR),Return(%),Status\n";
    const rows = simulationData.tradesLog.map(t => 
      `${t.id},${t.entryTime},${t.exitTime},${t.asset},${t.side},${t.entryPrice},${t.exitPrice},${t.pnl},${t.pnlPct}%,${t.status}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeChain_Backtest_${asset.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
  };

  const filteredTradeLog = simulationData.tradesLog.filter(t => {
    if (tradeLogFilter === 'WIN') return t.status === 'WIN';
    if (tradeLogFilter === 'LOSS') return t.status === 'LOSS';
    return true;
  });

  return (
    <div className="space-y-6 overflow-x-hidden">
      
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#11161D] p-5 rounded-xl border border-slate-200 dark:border-[#242B35] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] font-mono tracking-tight">
              Institutional Strategy Backtesting Workspace
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 rounded">
              DETERMINISTIC SIMULATOR
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8B95A5] mt-1 font-sans">
            Historical algorithmic simulation bound to immutable strategy state hashes & STT/broker fee models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500 dark:text-[#8B95A5]">Strategy Hash:</span>
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] text-[#10B981] font-bold">
              {simulationData.strategyHash.slice(0, 18)}...
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-3d btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm">
        <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
          <Sliders size={16} className="text-[#3B82F6]" />
          <span>Backtest Hyperparameters & Risk Rules</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs font-mono">
          
          {/* Asset */}
          <div>
            <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Target Asset</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2.5 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
            >
              <option value="NIFTY 50 Futures">NIFTY 50 Futures (NSE)</option>
              <option value="BANK NIFTY Futures">BANK NIFTY Futures (NSE)</option>
              <option value="RELIANCE IND">RELIANCE IND (NSE)</option>
              <option value="TCS">TCS (NSE)</option>
              <option value="HDFC BANK">HDFC BANK (NSE)</option>
              <option value="BTC / INR">BTC / INR (Crypto)</option>
            </select>
          </div>

          {/* Strategy */}
          <div>
            <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Strategy Profile</label>
            <select
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2.5 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
            >
              <option value="Quant EMA Crossover Scalper">Quant EMA Scalper v2</option>
              <option value="BankNifty Volatility Breakout">BankNifty Volatility v0.9</option>
              <option value="Reliance Momentum Driver">Reliance Momentum v2.1</option>
              <option value="TCS Mean Reversion Engine">TCS Mean Reversion v1.0</option>
            </select>
          </div>

          {/* Initial Capital */}
          <div>
            <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Capital (INR)</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2.5 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
            />
          </div>

          {/* Risk per trade */}
          <div>
            <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Risk / Trade (%)</label>
            <input
              type="number"
              step="0.5"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2.5 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
            />
          </div>

          {/* SL / TP */}
          <div>
            <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">SL % / TP %</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                value={stopLossPct}
                onChange={(e) => setStopLossPct(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2.5 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
              />
              <span>/</span>
              <input
                type="number"
                step="0.1"
                value={takeProfitPct}
                onChange={(e) => setTakeProfitPct(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2.5 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
              />
            </div>
          </div>

          {/* Run button */}
          <div className="flex items-end">
            <button
              onClick={handleRunBacktest}
              disabled={isSimulating}
              className="btn-3d btn-3d-primary w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 font-mono">
        
        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-[#10B981]/40 space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block">Total Return</span>
          <div className="text-xl font-bold text-[#10B981]">
            +{simulationData.totalReturn}%
          </div>
          <span className="text-[10px] text-[#10B981] font-bold">
            +₹{(initialCapital * simulationData.totalReturn / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block">Win Rate</span>
          <div className="text-xl font-bold text-slate-900 dark:text-[#F4F7FA]">
            {simulationData.winRate}%
          </div>
          <span className="text-[10px] text-[#10B981] font-bold">{simulationData.winningTrades} W / {simulationData.losingTrades} L</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-[#EF4444]/40 space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block">Max Drawdown</span>
          <div className="text-xl font-bold text-[#EF4444]">
            -{simulationData.maxDrawdown}%
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5]">Peak to Valley</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block">Profit Factor</span>
          <div className="text-xl font-bold text-slate-900 dark:text-[#F4F7FA]">
            {simulationData.profitFactor}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5]">Sharpe Ratio: {simulationData.sharpeRatio}</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block">Total Trades</span>
          <div className="text-xl font-bold text-[#3B82F6]">
            {simulationData.totalTrades}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5]">Avg Duration: {simulationData.avgTradeTime}</span>
        </div>
      </div>

      {/* Equity Curve Chart */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-[#10B981]" />
            <span>Cumulative Portfolio Equity Trajectory (INR)</span>
          </h3>
          <span className="text-xs font-mono text-[#10B981] font-bold">
            Peak Portfolio: ₹{(initialCapital * (1 + simulationData.totalReturn / 100)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="h-64 w-full bg-slate-50 dark:bg-[#080A0F] rounded-xl p-3 border border-slate-200 dark:border-[#1E2631]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={simulationData.equityCurve} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <YAxis stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} domain={['auto', 'auto']} tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
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

      {/* Detailed Trade Execution Log Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm font-mono">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-[#3B82F6]" />
            <span>Individual Backtested Execution Log ({filteredTradeLog.length} Trades)</span>
          </h3>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter size={14} className="text-slate-400" />
            {(['ALL', 'WIN', 'LOSS'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTradeLogFilter(f)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  tradeLogFilter === f 
                    ? 'bg-[#2563EB] text-white' 
                    : 'bg-slate-100 dark:bg-[#161D2A] text-slate-500 dark:text-[#94A3B8]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#242B35] text-[10px] text-slate-500 dark:text-[#8B95A5] uppercase">
                <th className="py-2.5 px-3">Trade ID</th>
                <th className="py-2.5 px-3">Entry Time</th>
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Side</th>
                <th className="py-2.5 px-3">Entry Price</th>
                <th className="py-2.5 px-3">Exit Price</th>
                <th className="py-2.5 px-3">P&L (INR)</th>
                <th className="py-2.5 px-3">Return</th>
                <th className="py-2.5 px-3">STT / Fee</th>
                <th className="py-2.5 px-3">Block</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E2633]">
              {filteredTradeLog.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-[#161D2A] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#3B82F6]">{t.id}</td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-[#94A3B8]">{t.entryTime}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-[#F1F5F9]">{t.asset}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      t.side === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}>
                      {t.side}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 dark:text-[#F1F5F9]">₹{t.entryPrice.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-slate-900 dark:text-[#F1F5F9]">₹{t.exitPrice.toLocaleString('en-IN')}</td>
                  <td className={`py-2.5 px-3 font-bold ${t.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toLocaleString('en-IN')}
                  </td>
                  <td className={`py-2.5 px-3 font-bold ${t.pnlPct >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 dark:text-[#64748B]">₹{t.fee.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-slate-400 dark:text-[#64748B]">#{t.blockHeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
