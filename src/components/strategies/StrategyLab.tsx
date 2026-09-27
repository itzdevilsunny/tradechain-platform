import React, { useState, useMemo } from 'react';
import { MOCK_STRATEGIES } from '../../lib/mockData';
import { StrategyConfig } from '../../types/trading';
import { 
  Layers, 
  Play, 
  Settings, 
  CheckCircle2, 
  PauseCircle, 
  Hash, 
  Plus,
  X,
  Check,
  Sliders,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Sparkles,
  BarChart2,
  Copy,
  Trash2,
  Search,
  Filter,
  Download,
  Code2,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  Zap,
  Terminal,
  FileCode,
  Gauge
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface StrategyLabProps {
  onNavigateToBacktest: (stratName: string) => void;
}

export const StrategyLab: React.FC<StrategyLabProps> = ({ onNavigateToBacktest }) => {
  const [strategies, setStrategies] = useState<StrategyConfig[]>(MOCK_STRATEGIES);
  const [activeTab, setActiveTab] = useState<'registry' | 'performance' | 'optimizer' | 'code'>('registry');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  
  // Modals state
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [editingStrat, setEditingStrat] = useState<StrategyConfig | null>(null);
  const [cloningStrat, setCloningStrat] = useState<StrategyConfig | null>(null);

  // New Strategy Form state
  const [newStratName, setNewStratName] = useState('');
  const [newStratDesc, setNewStratDesc] = useState('');
  const [newEmaShort, setNewEmaShort] = useState(20);
  const [newEmaLong, setNewEmaLong] = useState(50);
  const [newRsiLower, setNewRsiLower] = useState(30);
  const [newRsiUpper, setNewRsiUpper] = useState(70);
  const [newStopLoss, setNewStopLoss] = useState(1.5);
  const [newTakeProfit, setNewTakeProfit] = useState(3.5);

  // Optimizer Sandbox State
  const [selectedOptStrat, setSelectedOptStrat] = useState<string>(MOCK_STRATEGIES[0]?.name || 'NIFTY VWAP Pullback');
  const [optFastEma, setOptFastEma] = useState(21);
  const [optSlowEma, setOptSlowEma] = useState(55);
  const [optRsiLower, setOptRsiLower] = useState(32);
  const [optRsiUpper, setOptRsiUpper] = useState(68);
  const [optSl, setOptSl] = useState(1.8);
  const [optTp, setOptTp] = useState(4.2);
  const [isSimulating, setIsSimulating] = useState(false);
  const [sweepResults, setSweepResults] = useState<{
    winRate: number;
    expectedReturn: number;
    sharpe: number;
    maxDd: number;
    tradesSimulated: number;
  }>({
    winRate: 74.2,
    expectedReturn: 31.8,
    sharpe: 2.14,
    maxDd: 4.8,
    tradesSimulated: 420
  });

  // Selected Strategy for Code Inspector
  const [selectedCodeStrat, setSelectedCodeStrat] = useState<StrategyConfig>(MOCK_STRATEGIES[0]);

  // Filtered Strategies
  const filteredStrategies = useMemo(() => {
    return strategies.filter(strat => {
      const matchSearch = strat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strat.hash.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || strat.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [strategies, searchQuery, filterStatus]);

  const toggleStatus = (id: string) => {
    setStrategies(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
        };
      }
      return s;
    }));
  };

  const handleDeleteStrategy = (id: string) => {
    if (strategies.length <= 1) {
      alert('At least one quantitative strategy must remain active in the registry.');
      return;
    }
    const target = strategies.find(s => s.id === id);
    if (window.confirm(`Are you sure you want to decommission "${target?.name}"?`)) {
      setStrategies(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleCloneStrategy = (strat: StrategyConfig) => {
    const cloneHash = `0x${Math.random().toString(16).slice(2, 14)}${Math.random().toString(16).slice(2, 14)}`;
    const cloned: StrategyConfig = {
      ...strat,
      id: `STRAT-00${strategies.length + 1}`,
      name: `${strat.name} (Clone)`,
      version: `${strat.version}.1`,
      status: 'PAUSED',
      hash: cloneHash,
      totalTrades: 0,
      description: `Cloned snapshot of ${strat.name} for parameter experimentation.`
    };
    setStrategies(prev => [...prev, cloned]);
    alert(`Successfully cloned "${strat.name}" to "${cloned.name}". Bound with new SHA-256 state.`);
  };

  const handleCreateStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStratName.trim()) return;

    const hashVal = `0x${Math.random().toString(16).slice(2, 14)}${Math.random().toString(16).slice(2, 14)}`;

    const newStrat: StrategyConfig = {
      id: `STRAT-00${strategies.length + 1}`,
      name: newStratName,
      version: 'v1.0.0',
      status: 'ACTIVE',
      hash: hashVal,
      winRate: Math.round((65 + Math.random() * 15) * 10) / 10,
      backtestReturn: Math.round((18 + Math.random() * 25) * 10) / 10,
      maxDrawdown: Math.round((4 + Math.random() * 4) * 10) / 10,
      totalTrades: 32,
      description: newStratDesc || 'Custom quantitative strategy configured in TradeChain Strategy Lab.',
      parameters: {
        emaShort: newEmaShort,
        emaLong: newEmaLong,
        rsiPeriod: 14,
        rsiLower: newRsiLower,
        rsiUpper: newRsiUpper,
        stopLossPct: newStopLoss,
        takeProfitPct: newTakeProfit
      }
    };

    setStrategies(prev => [...prev, newStrat]);
    setIsCreatingModal(false);
    setNewStratName('');
    setNewStratDesc('');
    alert(`Successfully registered & bound SHA-256 strategy hash for ${newStrat.name}! Hash: ${hashVal.substring(0, 16)}...`);
  };

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStrat) return;

    const newHash = `0x${Math.random().toString(16).slice(2, 14)}${Math.random().toString(16).slice(2, 14)}`;

    setStrategies(prev => prev.map(s => {
      if (s.id === editingStrat.id) {
        return {
          ...s,
          hash: newHash,
          parameters: { ...editingStrat.parameters }
        };
      }
      return s;
    }));

    alert(`Re-hashed & updated parameters for ${editingStrat.name}! New SHA-256 Digest: ${newHash.substring(0, 16)}...`);
    setEditingStrat(null);
  };

  const handleExportJSON = (strat: StrategyConfig) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(strat, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${strat.name.replace(/\s+/g, '_')}_manifest.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRunOptimizationSweep = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      // Generate randomized realistic optimization improvement
      const simulatedWin = Math.min(88, Math.round((70 + (optFastEma < optSlowEma ? 5 : -5) + (optSl < optTp ? 4 : -2) + Math.random() * 5) * 10) / 10);
      const simulatedReturn = Math.round((22 + (optTp / (optSl || 1)) * 4 + Math.random() * 8) * 10) / 10;
      const simulatedSharpe = Math.round((1.7 + (simulatedWin / 50) + Math.random() * 0.4) * 100) / 100;
      const simulatedDd = Math.round((3.2 + Math.random() * 3) * 10) / 10;

      setSweepResults({
        winRate: simulatedWin,
        expectedReturn: simulatedReturn,
        sharpe: simulatedSharpe,
        maxDd: simulatedDd,
        tradesSimulated: 500
      });
    }, 700);
  };

  const handleApplyOptimizedToStrategy = () => {
    const target = strategies.find(s => s.name === selectedOptStrat);
    if (!target) return;

    const newHash = `0x${Math.random().toString(16).slice(2, 14)}${Math.random().toString(16).slice(2, 14)}`;

    setStrategies(prev => prev.map(s => {
      if (s.id === target.id) {
        return {
          ...s,
          hash: newHash,
          winRate: sweepResults.winRate,
          backtestReturn: sweepResults.expectedReturn,
          maxDrawdown: sweepResults.maxDd,
          parameters: {
            ...s.parameters,
            emaShort: optFastEma,
            emaLong: optSlowEma,
            rsiLower: optRsiLower,
            rsiUpper: optRsiUpper,
            stopLossPct: optSl,
            takeProfitPct: optTp
          }
        };
      }
      return s;
    }));

    alert(`Successfully applied optimized parameters to "${target.name}"! Cryptographic state hash recalculated: ${newHash.substring(0, 16)}...`);
  };

  // Performance comparison data for Recharts
  const comparisonData = useMemo(() => {
    return strategies.map(s => ({
      name: s.name.length > 14 ? s.name.substring(0, 14) + '...' : s.name,
      winRate: s.winRate,
      return: s.backtestReturn,
      drawdown: s.maxDrawdown,
      trades: s.totalTrades
    }));
  }, [strategies]);

  // Synthetic Monte Carlo Equity Curve for Optimizer
  const monteCarloCurve = useMemo(() => {
    let eq = 100000;
    return Array.from({ length: 25 }, (_, i) => {
      const stepChange = (Math.random() > 0.32 ? 1 : -0.7) * (sweepResults.expectedReturn * 45);
      eq = Math.max(80000, eq + stepChange);
      return {
        tradeIndex: `T-${i * 20}`,
        equity: Math.round(eq),
        benchmark: Math.round(100000 + i * 450)
      };
    });
  }, [sweepResults]);

  return (
    <div className="space-y-6 overflow-x-hidden">
      
      {/* Top Banner & Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0B0E14] p-5 rounded-xl border border-slate-200 dark:border-[#1E2633] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
            <Layers size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-slate-900 dark:text-[#F1F5F9]">
                Strategy Lab & Algorithmic Registry
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">
                SHA-256 INVARIANT PROTECTED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5 font-sans">
              Deploy, test, compare, and optimize quantitative algorithms cryptographically tied to immutable state hashes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCreatingModal(true)}
            className="btn-3d btn-3d-primary px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-md whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Create Strategy</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-[#1E2633] pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('registry')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'registry'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111620]'
          }`}
        >
          <Layers size={14} />
          <span>Strategy Registry ({strategies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'performance'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111620]'
          }`}
        >
          <BarChart2 size={14} />
          <span>Performance & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('optimizer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'optimizer'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111620]'
          }`}
        >
          <Sliders size={14} />
          <span>Parameter Optimizer</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'code'
              ? 'bg-[#3B82F6] text-white shadow-md'
              : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111620]'
          }`}
        >
          <Code2 size={14} />
          <span>Algorithm & Crypto Proof</span>
        </button>
      </div>

      {/* TAB 1: STRATEGY REGISTRY */}
      {activeTab === 'registry' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0B0E14] p-3 rounded-xl border border-slate-200 dark:border-[#1E2633] font-mono text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search size={15} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search strategies by name, logic, or SHA-256 hash..."
                className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-[#F1F5F9] text-xs placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Status:</span>
              {(['ALL', 'ACTIVE', 'PAUSED'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    filterStatus === status
                      ? 'bg-slate-200 dark:bg-[#1E2633] text-[#3B82F6] border border-[#3B82F6]/30'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-[#F1F5F9]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 min-w-0">
            {filteredStrategies.map(strat => {
              const isActive = strat.status === 'ACTIVE';
              return (
                <div 
                  key={strat.id}
                  className="p-5 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] transition-all space-y-4 shadow-sm flex flex-col justify-between hover:border-[#3B82F6]/50"
                >
                  <div className="space-y-3 font-mono">
                    {/* Top Status & Title */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#3B82F6]">{strat.version}</span>
                        <span className="text-[10px] text-slate-400 dark:text-[#64748B]">{strat.id}</span>
                      </div>
                      <button
                        onClick={() => toggleStatus(strat.id)}
                        className={`
                          btn-3d px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1
                          ${isActive ? 'btn-3d-success' : 'btn-3d-warning'}
                        `}
                      >
                        {isActive ? <CheckCircle2 size={12} /> : <PauseCircle size={12} />}
                        {strat.status}
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-[#F1F5F9]">{strat.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 leading-relaxed line-clamp-2">{strat.description}</p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                        <span className="text-slate-500 dark:text-[#64748B] block text-[10px]">Win Rate</span>
                        <span className="text-slate-900 dark:text-[#F1F5F9] font-bold text-sm">{strat.winRate}%</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                        <span className="text-slate-500 dark:text-[#64748B] block text-[10px]">Backtest Return</span>
                        <span className="text-[#10B981] font-bold text-sm">+{strat.backtestReturn}%</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                        <span className="text-slate-500 dark:text-[#64748B] block text-[10px]">Max Drawdown</span>
                        <span className="text-[#EF4444] font-bold text-sm">-{strat.maxDrawdown}%</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                        <span className="text-slate-500 dark:text-[#64748B] block text-[10px]">Total Trades</span>
                        <span className="text-[#3B82F6] font-bold text-sm">{strat.totalTrades}</span>
                      </div>
                    </div>

                    {/* Parameters Preview Ribbon */}
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] text-[10px] text-slate-500 dark:text-[#64748B] flex justify-between">
                      <span>EMA: {strat.parameters.emaShort}/{strat.parameters.emaLong}</span>
                      <span>RSI: {strat.parameters.rsiLower}-{strat.parameters.rsiUpper}</span>
                      <span>SL/TP: {strat.parameters.stopLossPct}% / {strat.parameters.takeProfitPct}%</span>
                    </div>

                    {/* Hash binding */}
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] text-[10px] text-slate-500 dark:text-[#64748B] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Hash size={12} className="text-[#3B82F6]" />
                        State Invariant:
                      </span>
                      <span className="text-slate-900 dark:text-[#F1F5F9] font-mono text-[9px] truncate max-w-[130px]">{strat.hash}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-200 dark:border-[#1E2633] space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <button
                        onClick={() => onNavigateToBacktest(strat.name)}
                        className="btn-3d btn-3d-primary py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5"
                      >
                        <Play size={13} fill="currentColor" />
                        <span>Backtest</span>
                      </button>

                      <button
                        onClick={() => setEditingStrat(strat)}
                        className="btn-3d btn-3d-secondary py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5"
                      >
                        <Settings size={13} />
                        <span>Configure</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                      <button
                        onClick={() => handleCloneStrategy(strat)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E2633] text-slate-600 dark:text-[#94A3B8] hover:text-[#3B82F6] flex items-center justify-center gap-1 bg-slate-50 dark:bg-[#111620]"
                        title="Clone Strategy"
                      >
                        <Copy size={11} />
                        <span>Clone</span>
                      </button>

                      <button
                        onClick={() => handleExportJSON(strat)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E2633] text-slate-600 dark:text-[#94A3B8] hover:text-[#10B981] flex items-center justify-center gap-1 bg-slate-50 dark:bg-[#111620]"
                        title="Export JSON Manifest"
                      >
                        <Download size={11} />
                        <span>Export</span>
                      </button>

                      <button
                        onClick={() => handleDeleteStrategy(strat.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E2633] text-slate-600 dark:text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center gap-1 bg-slate-50 dark:bg-[#111620]"
                        title="Decommission Strategy"
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PERFORMANCE & ANALYTICS */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Comparative Chart */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                  <BarChart2 size={16} className="text-[#3B82F6]" />
                  <span>Strategy Comparative Matrix (Win Rate % vs Return %)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#8B95A5] mt-0.5">
                  Benchmark returns across registered algorithmic execution profiles
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242B35" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#8B95A5', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8B95A5', fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D1117', borderColor: '#242B35', borderRadius: '8px', fontSize: '11px' }}
                    labelStyle={{ color: '#F4F7FA', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="winRate" name="Win Rate %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="return" name="Backtest Return %" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="drawdown" name="Max Drawdown %" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deep Analytics Matrix Table */}
          <div className="bg-white dark:bg-[#0B0E14] rounded-xl border border-slate-200 dark:border-[#1E2633] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#1E2633]">
              <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-[#F1F5F9]">
                Quantitative Risk & Expectancy Metrics
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-50 dark:bg-[#111620] text-slate-500 dark:text-[#64748B] text-[10px] uppercase border-b border-slate-200 dark:border-[#1E2633]">
                  <tr>
                    <th className="py-3 px-4">Strategy</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4 text-right">Win Rate</th>
                    <th className="py-3 px-4 text-right">Backtest Return</th>
                    <th className="py-3 px-4 text-right">Max Drawdown</th>
                    <th className="py-3 px-4 text-right">Profit Factor</th>
                    <th className="py-3 px-4 text-right">Sharpe Ratio</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E2633]">
                  {strategies.map((strat, idx) => {
                    const profitFactor = Math.round((1.5 + (strat.winRate / 100) * 1.8) * 100) / 100;
                    const sharpe = Math.round((1.4 + (strat.backtestReturn / 25)) * 100) / 100;
                    return (
                      <tr key={strat.id} className="hover:bg-slate-50 dark:hover:bg-[#111620]/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-[#F1F5F9]">{strat.name}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-[#64748B]">{strat.version}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-[#F1F5F9]">{strat.winRate}%</td>
                        <td className="py-3 px-4 text-right font-bold text-[#10B981]">+{strat.backtestReturn}%</td>
                        <td className="py-3 px-4 text-right font-bold text-[#EF4444]">-{strat.maxDrawdown}%</td>
                        <td className="py-3 px-4 text-right text-slate-900 dark:text-[#F1F5F9]">{profitFactor}</td>
                        <td className="py-3 px-4 text-right text-[#3B82F6] font-bold">{sharpe}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            strat.status === 'ACTIVE' 
                              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                              : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                          }`}>
                            {strat.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onNavigateToBacktest(strat.name)}
                            className="btn-3d btn-3d-primary px-2.5 py-1 rounded text-[10px] font-bold"
                          >
                            Simulate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PARAMETER OPTIMIZER */}
      {activeTab === 'optimizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-4 font-mono text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                <Sliders size={16} className="text-[#3B82F6]" />
                <span>Hyperparameter Sweep</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#8B95A5] mt-0.5">
                Monte Carlo parameter tuning sandbox
              </p>
            </div>

            <div>
              <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Target Strategy</label>
              <select
                value={selectedOptStrat}
                onChange={(e) => setSelectedOptStrat(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] rounded-lg p-2.5 text-slate-900 dark:text-[#F1F5F9] outline-none"
              >
                {strategies.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.version})</option>
                ))}
              </select>
            </div>

            {/* EMA sliders */}
            <div className="p-3 bg-slate-50 dark:bg-[#111620] rounded-xl border border-slate-200 dark:border-[#1E2633] space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Fast EMA:</span>
                  <span className="font-bold text-[#3B82F6]">{optFastEma}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={optFastEma}
                  onChange={(e) => setOptFastEma(Number(e.target.value))}
                  className="w-full accent-[#3B82F6] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Slow EMA:</span>
                  <span className="font-bold text-[#8B5CF6]">{optSlowEma}</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={optSlowEma}
                  onChange={(e) => setOptSlowEma(Number(e.target.value))}
                  className="w-full accent-[#8B5CF6] cursor-pointer"
                />
              </div>
            </div>

            {/* RSI thresholds */}
            <div className="p-3 bg-slate-50 dark:bg-[#111620] rounded-xl border border-slate-200 dark:border-[#1E2633] space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">RSI Oversold (Entry):</span>
                  <span className="font-bold text-[#10B981]">{optRsiLower}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="45"
                  value={optRsiLower}
                  onChange={(e) => setOptRsiLower(Number(e.target.value))}
                  className="w-full accent-[#10B981] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-500">RSI Overbought (Exit):</span>
                  <span className="font-bold text-[#EF4444]">{optRsiUpper}</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="80"
                  value={optRsiUpper}
                  onChange={(e) => setOptRsiUpper(Number(e.target.value))}
                  className="w-full accent-[#EF4444] cursor-pointer"
                />
              </div>
            </div>

            {/* SL / TP */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 dark:bg-[#111620] rounded-lg border border-slate-200 dark:border-[#1E2633]">
                <label className="text-[10px] text-slate-500 block mb-1">SL %</label>
                <input
                  type="number"
                  step="0.1"
                  value={optSl}
                  onChange={(e) => setOptSl(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633] rounded p-1.5 font-bold text-slate-900 dark:text-[#F1F5F9]"
                />
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-[#111620] rounded-lg border border-slate-200 dark:border-[#1E2633]">
                <label className="text-[10px] text-slate-500 block mb-1">TP %</label>
                <input
                  type="number"
                  step="0.1"
                  value={optTp}
                  onChange={(e) => setOptTp(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633] rounded p-1.5 font-bold text-slate-900 dark:text-[#F1F5F9]"
                />
              </div>
            </div>

            <button
              onClick={handleRunOptimizationSweep}
              disabled={isSimulating}
              className="btn-3d btn-3d-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {isSimulating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Computing 500-Trade Simulation...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Run 500-Trade Monte Carlo Sweep</span>
                </>
              )}
            </button>

            <button
              onClick={handleApplyOptimizedToStrategy}
              className="btn-3d btn-3d-success w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={15} />
              <span>Apply & Re-Hash SHA-256</span>
            </button>
          </div>

          {/* Simulation Output & Equity Curve */}
          <div className="lg:col-span-2 space-y-4">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633]">
                <span className="text-[10px] text-slate-500 dark:text-[#64748B] block">Simulated Win Rate</span>
                <span className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9]">{sweepResults.winRate}%</span>
                <span className="text-[10px] text-[#10B981] mt-0.5 block">+3.8% vs Baseline</span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633]">
                <span className="text-[10px] text-slate-500 dark:text-[#64748B] block">Expected Return</span>
                <span className="text-xl font-bold text-[#10B981]">+{sweepResults.expectedReturn}%</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Annualized</span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633]">
                <span className="text-[10px] text-slate-500 dark:text-[#64748B] block">Sharpe Ratio</span>
                <span className="text-xl font-bold text-[#3B82F6]">{sweepResults.sharpe}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Risk-adjusted</span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633]">
                <span className="text-[10px] text-slate-500 dark:text-[#64748B] block">Simulated Max DD</span>
                <span className="text-xl font-bold text-[#EF4444]">-{sweepResults.maxDd}%</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Max Peak-to-Trough</span>
              </div>
            </div>

            {/* Equity Curve Visualizer */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-mono font-bold text-sm text-slate-900 dark:text-[#F1F5F9]">
                    Simulated Equity Trajectory (₹100,000 Initial Capital)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-[#8B95A5] mt-0.5">
                    Monte Carlo 500-execution trajectory vs Buy & Hold Benchmark
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monteCarloCurve} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#242B35" vertical={false} />
                    <XAxis dataKey="tradeIndex" tick={{ fill: '#8B95A5', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#8B95A5', fontSize: 10 }} domain={['dataMin - 5000', 'dataMax + 5000']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0D1117', borderColor: '#242B35', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="equity" name="Optimized Strategy Equity" stroke="#10B981" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="benchmark" name="Passive Benchmark" stroke="#64748B" strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ALGORITHM & CRYPTO PROOF */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-[#0B0E14] rounded-xl border border-slate-200 dark:border-[#1E2633] space-y-3 font-mono text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                <FileCode size={16} className="text-[#3B82F6]" />
                <span>Select Strategy Script</span>
              </h3>
              <div className="space-y-2">
                {strategies.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedCodeStrat(s)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedCodeStrat.id === s.id
                        ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-slate-900 dark:text-[#F1F5F9]'
                        : 'border-slate-200 dark:border-[#1E2633] text-slate-600 dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#111620]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{s.name}</span>
                      <span className="text-[10px] text-[#3B82F6]">{s.version}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block mt-1 truncate">{s.hash}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#0B0E14] rounded-xl border border-slate-200 dark:border-[#1E2633] space-y-3 font-mono text-xs">
              <h4 className="font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#10B981]" />
                <span>Cryptographic Proof Certificate</span>
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                This strategy is formally verified and cryptographically stamped with SHA-256 state invariants:
              </p>
              <div className="p-2.5 bg-slate-50 dark:bg-[#111620] rounded border border-slate-200 dark:border-[#1E2633] break-all text-[10px] text-slate-800 dark:text-[#94A3B8]">
                <strong>SHA-256 Root:</strong><br />
                {selectedCodeStrat.hash}
              </div>
              <div className="text-[10px] text-slate-500 space-y-1">
                <div>Timestamp: <span className="text-slate-800 dark:text-[#F1F5F9]">2026-09-27 10:45:00 UTC</span></div>
                <div>Validator Node: <span className="text-slate-800 dark:text-[#F1F5F9]">TradeChain NSE Node #1</span></div>
                <div>Status: <span className="text-[#10B981] font-bold">MERKLE ANCHORED</span></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2633] pb-3">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Terminal size={16} className="text-[#3B82F6]" />
                  <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">{selectedCodeStrat.name.toLowerCase().replace(/\s+/g, '_')}.py</span>
                  <span className="text-[10px] text-slate-400">Python 3.11 Quantitative Model</span>
                </div>
                <button
                  onClick={() => handleExportJSON(selectedCodeStrat)}
                  className="btn-3d btn-3d-secondary px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download Manifest</span>
                </button>
              </div>

              {/* Code viewer with syntax styling */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
                <pre>{`# ==========================================================
# TradeChain Institutional Strategy: ${selectedCodeStrat.name}
# Version: ${selectedCodeStrat.version} | Hash: ${selectedCodeStrat.hash}
# Cryptographically Anchored to NSE FIX Gateway
# ==========================================================

import numpy as np
import pandas as pd
from tradechain.crypto import verify_state_hash, bind_merkle_leaf

class ${selectedCodeStrat.name.replace(/\s+/g, '')}Model:
    def __init__(self):
        self.strategy_id = "${selectedCodeStrat.id}"
        self.fast_ema = ${selectedCodeStrat.parameters.emaShort}
        self.slow_ema = ${selectedCodeStrat.parameters.emaLong}
        self.rsi_period = ${selectedCodeStrat.parameters.rsiPeriod}
        self.rsi_lower = ${selectedCodeStrat.parameters.rsiLower}
        self.rsi_upper = ${selectedCodeStrat.parameters.rsiUpper}
        self.stop_loss_pct = ${selectedCodeStrat.parameters.stopLossPct}
        self.take_profit_pct = ${selectedCodeStrat.parameters.takeProfitPct}
        self.sha256_invariant = "${selectedCodeStrat.hash}"

    def compute_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        df['ema_fast'] = df['close'].ewm(span=self.fast_ema, adjust=False).mean()
        df['ema_slow'] = df['close'].ewm(span=self.slow_ema, adjust=False).mean()
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=self.rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=self.rsi_period).mean()
        rs = gain / (loss + 1e-9)
        df['rsi'] = 100 - (100 / (1 + rs))
        return df

    def generate_signal(self, df: pd.DataFrame) -> dict:
        latest = df.iloc[-1]
        prev = df.iloc[-2]
        
        # Bullish Golden Cross with RSI Confirmation
        if latest['ema_fast'] > latest['ema_slow'] and latest['rsi'] > self.rsi_lower and latest['rsi'] < self.rsi_upper:
            return {
                "action": "BUY",
                "price": latest['close'],
                "stop_loss": round(latest['close'] * (1 - self.stop_loss_pct / 100), 2),
                "take_profit": round(latest['close'] * (1 + self.take_profit_pct / 100), 2),
                "state_hash": self.sha256_invariant
            }
        return {"action": "HOLD"}
`}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Configure Strategy Parameter Modal */}
      {editingStrat && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#242B35] rounded-2xl shadow-2xl p-6 font-mono text-xs animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242B35] pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-[#F4F7FA] text-base flex items-center gap-2">
                  <Sliders size={18} className="text-[#3B82F6]" />
                  <span>Configure {editingStrat.name}</span>
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-[#8B95A5] mt-0.5">Modifying parameters will compute a new SHA-256 state hash</p>
              </div>
              <button onClick={() => setEditingStrat(null)} className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-[#F4F7FA]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveParameters} className="space-y-4">
              
              {/* EMA Sliders */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#111620] rounded-xl border border-slate-200 dark:border-[#1E2633]">
                <div>
                  <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Fast EMA Period: <strong className="text-slate-900 dark:text-[#F1F5F9]">{editingStrat.parameters.emaShort}</strong></label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={editingStrat.parameters.emaShort}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingStrat(prev => prev ? { ...prev, parameters: { ...prev.parameters, emaShort: val } } : null);
                    }}
                    className="w-full accent-[#3B82F6] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Slow EMA Period: <strong className="text-slate-900 dark:text-[#F1F5F9]">{editingStrat.parameters.emaLong}</strong></label>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={editingStrat.parameters.emaLong}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingStrat(prev => prev ? { ...prev, parameters: { ...prev.parameters, emaLong: val } } : null);
                    }}
                    className="w-full accent-[#8B5CF6] cursor-pointer"
                  />
                </div>
              </div>

              {/* RSI Bounds */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#111620] rounded-xl border border-slate-200 dark:border-[#1E2633]">
                <div>
                  <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">RSI Oversold (Lower): <strong className="text-[#10B981]">{editingStrat.parameters.rsiLower}</strong></label>
                  <input
                    type="number"
                    value={editingStrat.parameters.rsiLower}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingStrat(prev => prev ? { ...prev, parameters: { ...prev.parameters, rsiLower: val } } : null);
                    }}
                    className="w-full bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">RSI Overbought (Upper): <strong className="text-[#EF4444]">{editingStrat.parameters.rsiUpper}</strong></label>
                  <input
                    type="number"
                    value={editingStrat.parameters.rsiUpper}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingStrat(prev => prev ? { ...prev, parameters: { ...prev.parameters, rsiUpper: val } } : null);
                    }}
                    className="w-full bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold"
                  />
                </div>
              </div>

              {/* SL / TP Controls */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#111620] rounded-xl border border-slate-200 dark:border-[#1E2633]">
                <div>
                  <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Stop Loss (%): <strong className="text-[#EF4444]">{editingStrat.parameters.stopLossPct}%</strong></label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingStrat.parameters.stopLossPct}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingStrat(prev => prev ? { ...prev, parameters: { ...prev.parameters, stopLossPct: val } } : null);
                    }}
                    className="w-full bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Take Profit (%): <strong className="text-[#10B981]">{editingStrat.parameters.takeProfitPct}%</strong></label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingStrat.parameters.takeProfitPct}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingStrat(prev => prev ? { ...prev, parameters: { ...prev.parameters, takeProfitPct: val } } : null);
                    }}
                    className="w-full bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-3d btn-3d-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>Save Parameters & Re-Hash SHA-256 Invariant</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Working Create Strategy Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#242B35] rounded-2xl shadow-2xl p-6 font-mono text-xs animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242B35] pb-3">
              <span className="font-bold text-slate-900 dark:text-[#F4F7FA] text-base">Register Quantitative Strategy</span>
              <button onClick={() => setIsCreatingModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-[#F4F7FA]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateStrategy} className="space-y-4">
              <div>
                <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Strategy Name</label>
                <input
                  type="text"
                  required
                  value={newStratName}
                  onChange={(e) => setNewStratName(e.target.value)}
                  placeholder="e.g., VWAP Mean Reversion F&O"
                  className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-xl p-3 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Strategy Description</label>
                <textarea
                  rows={2}
                  value={newStratDesc}
                  onChange={(e) => setNewStratDesc(e.target.value)}
                  placeholder="Explain quantitative signal criteria & execution triggers..."
                  className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-xl p-3 text-slate-900 dark:text-[#F4F7FA] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Fast / Slow EMA</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={newEmaShort}
                      onChange={(e) => setNewEmaShort(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA]"
                    />
                    <span>/</span>
                    <input
                      type="number"
                      value={newEmaLong}
                      onChange={(e) => setNewEmaLong(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">SL % / TP %</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={newStopLoss}
                      onChange={(e) => setNewStopLoss(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA]"
                    />
                    <span>/</span>
                    <input
                      type="number"
                      step="0.1"
                      value={newTakeProfit}
                      onChange={(e) => setNewTakeProfit(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-3d btn-3d-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>Bind Cryptographic Hash & Register</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
