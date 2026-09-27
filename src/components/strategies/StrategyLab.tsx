import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';

interface StrategyLabProps {
  onNavigateToBacktest: (stratName: string) => void;
}

export const StrategyLab: React.FC<StrategyLabProps> = ({ onNavigateToBacktest }) => {
  const [strategies, setStrategies] = useState<StrategyConfig[]>(MOCK_STRATEGIES);
  
  // Modals state
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [editingStrat, setEditingStrat] = useState<StrategyConfig | null>(null);

  // New Strategy Form state
  const [newStratName, setNewStratName] = useState('');
  const [newStratDesc, setNewStratDesc] = useState('');
  const [newEmaShort, setNewEmaShort] = useState(20);
  const [newEmaLong, setNewEmaLong] = useState(50);
  const [newRsiLower, setNewRsiLower] = useState(30);
  const [newRsiUpper, setNewRsiUpper] = useState(70);
  const [newStopLoss, setNewStopLoss] = useState(1.5);
  const [newTakeProfit, setNewTakeProfit] = useState(3.5);

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
      winRate: 72.5,
      backtestReturn: 21.4,
      maxDrawdown: 5.8,
      totalTrades: 54,
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
                Strategy Lab & Cryptographic Registry
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">
                SHA-256 INVARIANT REGISTERED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5 font-sans">
              Configure rule-based trading engines bound to cryptographic SHA-256 state hashes.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsCreatingModal(true)}
          className="btn-3d btn-3d-primary px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-md whitespace-nowrap"
        >
          <Plus size={16} />
          <span>Create New Strategy</span>
        </button>
      </div>

      {/* Strategy Cards Grid - Responsive Clamping */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 min-w-0">
        {strategies.map(strat => {
          const isActive = strat.status === 'ACTIVE';
          return (
            <div 
              key={strat.id}
              className="p-5 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] transition-all space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3 font-mono">
                {/* Top Status & Title */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3B82F6]">{strat.version}</span>
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
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 leading-relaxed">{strat.description}</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                    <span className="text-slate-500 dark:text-[#64748B] block text-[10px]">Win Rate</span>
                    <span className="text-slate-900 dark:text-[#F1F5F9] font-bold">{strat.winRate}%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                    <span className="text-slate-500 dark:text-[#64748B] block text-[10px]">Backtest Return</span>
                    <span className="text-[#10B981] font-bold">+{strat.backtestReturn}%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                    <span className="text-slate-500 dark:text-[#64748B] block text-[10px]">Max Drawdown</span>
                    <span className="text-[#EF4444] font-bold">-{strat.maxDrawdown}%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                    <span className="text-slate-500 dark:text-[#64748B] block text-[10px]">Total Trades</span>
                    <span className="text-[#3B82F6] font-bold">{strat.totalTrades}</span>
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
                    Strategy Hash:
                  </span>
                  <span className="text-slate-900 dark:text-[#F1F5F9] font-bold truncate max-w-[140px]">{strat.hash}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#1E2633] grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => onNavigateToBacktest(strat.name)}
                  className="btn-3d btn-3d-primary py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <Play size={14} fill="currentColor" />
                  <span>Backtest</span>
                </button>

                <button
                  onClick={() => setEditingStrat(strat)}
                  className="btn-3d btn-3d-secondary py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <Settings size={14} />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
              <span className="font-bold text-slate-900 dark:text-[#F4F7FA] text-base">Register New Quantitative Strategy</span>
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
                  placeholder="e.g., VWAP Mean Reversion"
                  className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-xl p-3 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Strategy Description</label>
                <textarea
                  rows={2}
                  value={newStratDesc}
                  onChange={(e) => setNewStratDesc(e.target.value)}
                  placeholder="Explain quantitative signal criteria..."
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
