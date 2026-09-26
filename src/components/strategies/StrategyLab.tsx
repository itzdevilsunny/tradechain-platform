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
  Check
} from 'lucide-react';

interface StrategyLabProps {
  onNavigateToBacktest: (stratName: string) => void;
}

export const StrategyLab: React.FC<StrategyLabProps> = ({ onNavigateToBacktest }) => {
  const [strategies, setStrategies] = useState<StrategyConfig[]>(MOCK_STRATEGIES);
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [newStratName, setNewStratName] = useState('');
  const [newStratDesc, setNewStratDesc] = useState('');

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

    const newStrat: StrategyConfig = {
      id: `STRAT-00${strategies.length + 1}`,
      name: newStratName,
      version: 'v1.0.0',
      status: 'ACTIVE',
      hash: `0x${Math.random().toString(16).slice(2, 14)}`,
      winRate: 65.0,
      backtestReturn: 15.2,
      maxDrawdown: 7.5,
      totalTrades: 42,
      description: newStratDesc || 'Custom algorithmic strategy parameters.',
      parameters: {
        emaShort: 14,
        emaLong: 28,
        rsiPeriod: 14,
        rsiLower: 40,
        rsiUpper: 60,
        stopLossPct: 2.0,
        takeProfitPct: 4.0
      }
    };

    setStrategies(prev => [...prev, newStrat]);
    setIsCreatingModal(false);
    setNewStratName('');
    setNewStratDesc('');
    alert(`Created & Registered strategy hash for ${newStrat.name}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11161D] dark:bg-[#11161D] light:bg-white p-5 rounded-xl border border-[#242B35] dark:border-[#242B35] light:border-slate-300 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900 font-mono tracking-tight">
              Strategy Lab & Algorithmic Registry
            </h2>
          </div>
          <p className="text-xs text-[#8B95A5] dark:text-[#8B95A5] light:text-slate-500 mt-1">
            Configure rule-based trading engines bound to cryptographic SHA-256 state hashes.
          </p>
        </div>

        <button 
          onClick={() => setIsCreatingModal(true)}
          className="btn-3d btn-3d-primary px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-md"
        >
          <Plus size={16} />
          Create New Strategy
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {strategies.map(strat => {
          const isActive = strat.status === 'ACTIVE';
          return (
            <div 
              key={strat.id}
              className="p-5 rounded-xl bg-[#11161D] dark:bg-[#11161D] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 transition-all space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Status & Title */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#3B82F6]">{strat.version}</span>
                  <button
                    onClick={() => toggleStatus(strat.id)}
                    className={`
                      btn-3d px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1
                      ${isActive ? 'btn-3d-success' : 'btn-3d-warning'}
                    `}
                  >
                    {isActive ? <CheckCircle2 size={12} /> : <PauseCircle size={12} />}
                    {strat.status}
                  </button>
                </div>

                <div>
                  <h3 className="font-mono font-bold text-base text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900">{strat.name}</h3>
                  <p className="text-xs text-[#8B95A5] dark:text-[#8B95A5] light:text-slate-600 mt-1 leading-relaxed">{strat.description}</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                  <div className="p-2.5 rounded-lg bg-[#080A0F] dark:bg-[#080A0F] light:bg-slate-100 border border-[#242B35] dark:border-[#242B35] light:border-slate-200">
                    <span className="text-[#8B95A5] block text-[10px]">Win Rate</span>
                    <span className="text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900 font-bold">{strat.winRate}%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#080A0F] dark:bg-[#080A0F] light:bg-slate-100 border border-[#242B35] dark:border-[#242B35] light:border-slate-200">
                    <span className="text-[#8B95A5] block text-[10px]">Backtest Return</span>
                    <span className="text-[#10B981] font-bold">+{strat.backtestReturn}%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#080A0F] dark:bg-[#080A0F] light:bg-slate-100 border border-[#242B35] dark:border-[#242B35] light:border-slate-200">
                    <span className="text-[#8B95A5] block text-[10px]">Max Drawdown</span>
                    <span className="text-[#EF4444] font-bold">-{strat.maxDrawdown}%</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#080A0F] dark:bg-[#080A0F] light:bg-slate-100 border border-[#242B35] dark:border-[#242B35] light:border-slate-200">
                    <span className="text-[#8B95A5] block text-[10px]">Total Trades</span>
                    <span className="text-[#3B82F6] font-bold">{strat.totalTrades}</span>
                  </div>
                </div>

                {/* Hash binding */}
                <div className="p-2 rounded-lg bg-[#080A0F] dark:bg-[#080A0F] light:bg-slate-100 border border-[#242B35] dark:border-[#242B35] light:border-slate-200 text-[10px] font-mono text-[#8B95A5] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Hash size={12} className="text-[#3B82F6]" />
                    Strategy Hash:
                  </span>
                  <span className="text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900 font-bold">{strat.hash.slice(0, 14)}...</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#242B35] dark:border-[#242B35] light:border-slate-200 grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => onNavigateToBacktest(strat.name)}
                  className="btn-3d btn-3d-primary py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <Play size={14} fill="currentColor" />
                  Backtest
                </button>

                <button
                  onClick={() => alert(`Configured algorithm parameters for ${strat.name}`)}
                  className="btn-3d btn-3d-secondary py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <Settings size={14} />
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Working Create Strategy Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0D1117] dark:bg-[#0D1117] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 rounded-2xl shadow-2xl p-6 font-mono text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#242B35] pb-3 mb-4">
              <span className="font-bold text-[#F4F7FA] text-base">Register New Quantitative Strategy</span>
              <button onClick={() => setIsCreatingModal(false)} className="p-1 rounded text-[#8B95A5] hover:text-[#F4F7FA]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateStrategy} className="space-y-4">
              <div>
                <label className="text-[#8B95A5] block mb-1">Strategy Name</label>
                <input
                  type="text"
                  required
                  value={newStratName}
                  onChange={(e) => setNewStratName(e.target.value)}
                  placeholder="e.g., VWAP Mean Reversion"
                  className="w-full bg-[#080A0F] border border-[#242B35] rounded-xl p-3 text-[#F4F7FA] font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[#8B95A5] block mb-1">Strategy Rationale / Description</label>
                <textarea
                  rows={3}
                  value={newStratDesc}
                  onChange={(e) => setNewStratDesc(e.target.value)}
                  placeholder="Explain quantitative signal criteria..."
                  className="w-full bg-[#080A0F] border border-[#242B35] rounded-xl p-3 text-[#F4F7FA] outline-none"
                />
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
