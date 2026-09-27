import React, { useState, useEffect } from 'react';
import { runQuantBacktest, ExtendedBacktestResult, DetailedBacktestTrade } from '../../lib/backtestEngine';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  ComposedChart,
  Legend
} from 'recharts';
import { 
  Activity, 
  Play, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  Sliders,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Radio,
  Layers,
  BarChart3,
  Percent,
  Search,
  Building2,
  Coins,
  LineChart
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
  const [isLiveSim, setIsLiveSim] = useState(false);
  const [activeTab, setActiveTab] = useState<'EQUITY' | 'DRAWDOWN' | 'MONTHLY'>('EQUITY');
  const [tradeLogFilter, setTradeLogFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [simulationData, setSimulationData] = useState<ExtendedBacktestResult>(() => 
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

  // Auto-run simulation when parameters or asset change
  useEffect(() => {
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
  }, [asset, strategyName, initialCapital, riskPerTrade, stopLossPct, takeProfitPct, dateRange, timeframe]);

  // Live simulation tick interval
  useEffect(() => {
    if (!isLiveSim) return;

    const interval = setInterval(() => {
      setSimulationData(prev => {
        const lastPt = prev.equityCurve[prev.equityCurve.length - 1];
        const tickDelta = (Math.random() - 0.46) * 0.008;
        const newValue = Math.round(Math.max(prev.equityCurve[0].value * 0.5, lastPt.value * (1 + tickDelta)));
        const newBench = Math.round(lastPt.benchmark * (1 + (Math.random() - 0.48) * 0.005));

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const updatedCurve = [...prev.equityCurve.slice(1), {
          date: timeStr,
          value: newValue,
          benchmark: newBench,
          drawdown: Math.round(Math.random() * 4.5 * 100) / 100
        }];

        const currentReturn = Math.round(((newValue - prev.equityCurve[0].value) / prev.equityCurve[0].value) * 10000) / 100;

        return {
          ...prev,
          equityCurve: updatedCurve,
          totalReturn: currentReturn
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLiveSim]);

  const handleManualRun = () => {
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
    }, 500);
  };

  const handleExportCSV = () => {
    const headers = "TradeID,EntryTime,ExitTime,Asset,Side,EntryPrice,ExitPrice,PnL(INR),Return(%),Status,BlockHeight\n";
    const rows = simulationData.tradesLog.map(t => 
      `${t.id},${t.entryTime},${t.exitTime},"${t.asset}",${t.side},${t.entryPrice},${t.exitPrice},${t.pnl},${t.pnlPct}%,${t.status},#${t.blockHeight}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeChain_Backtest_${asset.replace(/\s+/g, '_')}_${Date.now()}.csv`;
    a.click();
  };

  const filteredTradeLog = simulationData.tradesLog.filter(t => {
    const matchesFilter = tradeLogFilter === 'ALL' || t.status === tradeLogFilter;
    const matchesSearch = searchTerm === '' || 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.asset.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-[#11161D] p-5 rounded-xl border border-slate-200 dark:border-[#242B35] shadow-sm w-full overflow-hidden">
        <div className="min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Activity size={20} className="text-[#3B82F6] shrink-0" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] font-mono tracking-tight truncate">
              Institutional Strategy Backtesting Workspace
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 rounded shrink-0">
              DETERMINISTIC SIMULATOR
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8B95A5] mt-1 font-sans truncate">
            Historical algorithmic simulation with asset-specific price scaling, STT/broker fee models & real-time equity curves.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsLiveSim(!isLiveSim)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
              isLiveSim 
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 animate-pulse' 
                : 'bg-slate-100 dark:bg-[#080A0F] text-slate-600 dark:text-[#8B95A5] border-slate-200 dark:border-[#242B35]'
            }`}
          >
            <Radio size={14} className={isLiveSim ? 'text-[#10B981]' : 'text-slate-400'} />
            <span>{isLiveSim ? 'LIVE SIM Ticks: ACTIVE' : 'LIVE SIM Ticks: OFF'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500 dark:text-[#8B95A5]">Strategy Hash:</span>
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] text-[#10B981] font-bold truncate max-w-[140px] sm:max-w-[200px]">
              {simulationData.strategyHash}
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-3d btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm w-full overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
            <Sliders size={16} className="text-[#3B82F6]" />
            <span>Asset Selection & Hyperparameter Controls</span>
          </h3>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-[#8B95A5]">
            <span>Category:</span>
            <span className="px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-[#161D2A] text-[#3B82F6]">
              {simulationData.assetCategory}
            </span>
            <span>Spot Price:</span>
            <span className="font-bold text-slate-900 dark:text-[#F4F7FA]">
              ₹{simulationData.assetSpotPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs font-mono">
          
          {/* Target Asset */}
          <div>
            <label className="text-slate-500 dark:text-[#8B95A5] block mb-1 flex items-center gap-1">
              <Building2 size={12} className="text-[#3B82F6]" /> Target Asset
            </label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none cursor-pointer"
            >
              <option value="NIFTY 50 Futures">NIFTY 50 Futures (NSE)</option>
              <option value="BANK NIFTY Futures">BANK NIFTY Futures (NSE)</option>
              <option value="RELIANCE IND">RELIANCE IND (Company)</option>
              <option value="TCS">TCS (IT Sector)</option>
              <option value="HDFC BANK">HDFC BANK (Banking)</option>
              <option value="BTC / INR">BTC / INR (Crypto Asset)</option>
            </select>
          </div>

          {/* Strategy Profile */}
          <div>
            <label className="text-slate-500 dark:text-[#8B95A5] block mb-1 flex items-center gap-1">
              <Zap size={12} className="text-[#10B981]" /> Strategy Profile
            </label>
            <select
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none cursor-pointer"
            >
              <option value="Quant EMA Crossover Scalper">Quant EMA Scalper v2.4</option>
              <option value="BankNifty Volatility Breakout">BankNifty Volatility v0.9</option>
              <option value="Reliance Momentum Driver">Reliance Momentum v2.1</option>
              <option value="TCS Mean Reversion Engine">TCS Mean Reversion v1.0</option>
            </select>
          </div>

          {/* Initial Capital */}
          <div>
            <label className="text-slate-500 dark:text-[#8B95A5] block mb-1 flex items-center gap-1">
              <Coins size={12} className="text-[#F59E0B]" /> Capital (INR)
            </label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Math.max(10000, Number(e.target.value)))}
              className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
            />
          </div>

          {/* Risk per trade */}
          <div>
            <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Risk / Trade (%)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="10"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
            />
          </div>

          {/* SL / TP */}
          <div>
            <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">SL % / TP %</label>
            <div className="flex items-center gap-1 min-w-0">
              <input
                type="number"
                step="0.1"
                min="0.2"
                value={stopLossPct}
                onChange={(e) => setStopLossPct(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none text-center"
              />
              <span className="text-slate-400 font-bold">/</span>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={takeProfitPct}
                onChange={(e) => setTakeProfitPct(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none text-center"
              />
            </div>
          </div>

          {/* Run Backtest button */}
          <div className="flex items-end">
            <button
              onClick={handleManualRun}
              disabled={isSimulating}
              className="btn-3d btn-3d-primary w-full py-2 px-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  <span>RE-SIMULATE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Performance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono w-full overflow-hidden">
        
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#11161D] border border-[#10B981]/40 space-y-1 shadow-sm overflow-hidden">
          <span className="text-[11px] text-slate-500 dark:text-[#8B95A5] block truncate">Total Bot Return</span>
          <div className="text-lg sm:text-xl font-bold text-[#10B981] truncate">
            +{simulationData.totalReturn}%
          </div>
          <span className="text-[10px] text-[#10B981] font-bold block truncate">
            +{formatCurrency(initialCapital * simulationData.totalReturn / 100)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-[11px] text-slate-500 dark:text-[#8B95A5] block truncate">Win Rate</span>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F4F7FA] truncate">
            {simulationData.winRate}%
          </div>
          <span className="text-[10px] text-[#10B981] font-bold block truncate">
            {simulationData.winningTrades} W / {simulationData.losingTrades} L
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#11161D] border border-[#EF4444]/40 space-y-1 shadow-sm overflow-hidden">
          <span className="text-[11px] text-slate-500 dark:text-[#8B95A5] block truncate">Max Drawdown</span>
          <div className="text-lg sm:text-xl font-bold text-[#EF4444] truncate">
            -{simulationData.maxDrawdown}%
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5] block truncate">Peak to Valley</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-[11px] text-slate-500 dark:text-[#8B95A5] block truncate">Profit Factor</span>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F4F7FA] truncate">
            {simulationData.profitFactor}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5] block truncate">Sharpe: {simulationData.sharpeRatio}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-[11px] text-slate-500 dark:text-[#8B95A5] block truncate">Benchmark Return</span>
          <div className="text-lg sm:text-xl font-bold text-[#F59E0B] truncate">
            {simulationData.benchmarkReturn >= 0 ? '+' : ''}{simulationData.benchmarkReturn}%
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5] block truncate">Buy & Hold</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-[11px] text-slate-500 dark:text-[#8B95A5] block truncate">Alpha Generated</span>
          <div className={`text-lg sm:text-xl font-bold truncate ${simulationData.alphaGenerated >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {simulationData.alphaGenerated >= 0 ? '+' : ''}{simulationData.alphaGenerated}%
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5] block truncate">Excess Return</span>
        </div>

      </div>

      {/* Main Backtest Charts Workspace with View Selector */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm w-full overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LineChart size={18} className="text-[#10B981]" />
            <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider">
              {activeTab === 'EQUITY' && `Cumulative Equity Trajectory: ${asset} (INR)`}
              {activeTab === 'DRAWDOWN' && `Underwater Drawdown Spectrum (%)`}
              {activeTab === 'MONTHLY' && `Monthly P&L Distribution (INR)`}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#080A0F] p-1 rounded-lg border border-slate-200 dark:border-[#242B35]">
            <button
              onClick={() => setActiveTab('EQUITY')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'EQUITY'
                  ? 'bg-white dark:bg-[#1E2631] text-[#10B981] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Equity Trajectory
            </button>
            <button
              onClick={() => setActiveTab('DRAWDOWN')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'DRAWDOWN'
                  ? 'bg-white dark:bg-[#1E2631] text-[#EF4444] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Drawdown
            </button>
            <button
              onClick={() => setActiveTab('MONTHLY')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'MONTHLY'
                  ? 'bg-white dark:bg-[#1E2631] text-[#3B82F6] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Monthly P&L
            </button>
          </div>
        </div>

        {/* Tab 1: Dynamic Cumulative Equity Trajectory */}
        {activeTab === 'EQUITY' && (
          <div className="h-72 w-full bg-slate-50 dark:bg-[#080A0F] rounded-xl p-3 border border-slate-200 dark:border-[#1E2631] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={simulationData.equityCurve} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis 
                  stroke="#64748B" 
                  width={85}
                  tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                  domain={['auto', 'auto']} 
                  tickFormatter={formatCurrency} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0D1117', 
                    borderColor: '#242B35', 
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: '#F4F7FA',
                    borderRadius: '8px'
                  }} 
                  formatter={(val: any, name: string) => [
                    formatCurrency(Number(val)), 
                    name === 'value' ? `${strategyName} Equity` : `${asset} Buy & Hold Benchmark`
                  ]}
                />
                <Legend 
                  verticalAlign="top" 
                  height={30} 
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  formatter={(val) => val === 'value' ? `${strategyName} Trajectory (INR)` : `${asset} Buy & Hold Benchmark (INR)`}
                />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
                <Line type="monotone" dataKey="benchmark" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 2: Underwater Drawdown Spectrum */}
        {activeTab === 'DRAWDOWN' && (
          <div className="h-72 w-full bg-slate-50 dark:bg-[#080A0F] rounded-xl p-3 border border-slate-200 dark:border-[#1E2631] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData.equityCurve} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis 
                  stroke="#64748B" 
                  width={50}
                  tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                  tickFormatter={(val) => `-${val}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0D1117', 
                    borderColor: '#EF4444', 
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: '#F4F7FA',
                    borderRadius: '8px'
                  }} 
                  formatter={(val: any) => [`-${val}%`, 'Peak Drawdown']}
                />
                <Area type="monotone" dataKey="drawdown" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#drawdownGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 3: Monthly P&L Distribution */}
        {activeTab === 'MONTHLY' && (
          <div className="h-72 w-full bg-slate-50 dark:bg-[#080A0F] rounded-xl p-3 border border-slate-200 dark:border-[#1E2631] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={simulationData.monthlyPnL} margin={{ top: 15, right: 15, left: 10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis 
                  stroke="#64748B" 
                  width={80}
                  tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0D1117', 
                    borderColor: '#242B35', 
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: '#F4F7FA',
                    borderRadius: '8px'
                  }} 
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Monthly P&L']}
                />
                <Bar dataKey="pnl" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Detailed Trade Execution Log Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm font-mono w-full overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-[#3B82F6]" />
            <span>Individual Execution Log ({filteredTradeLog.length} Trades Simulated)</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search trade ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] text-slate-900 dark:text-[#F4F7FA] outline-none w-36 focus:w-48 transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1">
              <Filter size={14} className="text-slate-400 hidden sm:inline" />
              {(['ALL', 'WIN', 'LOSS'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTradeLogFilter(f)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    tradeLogFilter === f 
                      ? 'bg-[#2563EB] text-white shadow-sm' 
                      : 'bg-slate-100 dark:bg-[#161D2A] text-slate-500 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#1E2631]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Table Frame */}
        <div className="w-full overflow-x-auto border border-slate-100 dark:border-[#1E2631] rounded-lg">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#242B35] bg-slate-50 dark:bg-[#080A0F] text-[10px] text-slate-500 dark:text-[#8B95A5] uppercase">
                <th className="py-2.5 px-3.5">Trade ID</th>
                <th className="py-2.5 px-3.5">Entry Time</th>
                <th className="py-2.5 px-3.5">Asset</th>
                <th className="py-2.5 px-3.5">Side</th>
                <th className="py-2.5 px-3.5">Entry Price</th>
                <th className="py-2.5 px-3.5">Exit Price</th>
                <th className="py-2.5 px-3.5">P&L (INR)</th>
                <th className="py-2.5 px-3.5">Return</th>
                <th className="py-2.5 px-3.5">STT / Fee</th>
                <th className="py-2.5 px-3.5">Block Anchor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E2633]">
              {filteredTradeLog.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-[#161D2A] transition-colors whitespace-nowrap">
                  <td className="py-2.5 px-3.5 font-bold text-[#3B82F6]">{t.id}</td>
                  <td className="py-2.5 px-3.5 text-slate-500 dark:text-[#94A3B8]">{t.entryTime}</td>
                  <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-[#F1F5F9]">{t.asset}</td>
                  <td className="py-2.5 px-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.side === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}>
                      {t.side}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-900 dark:text-[#F1F5F9]">₹{t.entryPrice.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3.5 text-slate-900 dark:text-[#F1F5F9]">₹{t.exitPrice.toLocaleString('en-IN')}</td>
                  <td className={`py-2.5 px-3.5 font-bold ${t.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toLocaleString('en-IN')}
                  </td>
                  <td className={`py-2.5 px-3.5 font-bold ${t.pnlPct >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct}%
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-400 dark:text-[#64748B]">₹{t.fee.toFixed(2)}</td>
                  <td className="py-2.5 px-3.5 text-slate-400 dark:text-[#64748B]">#{t.blockHeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

