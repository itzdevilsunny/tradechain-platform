import React, { useState } from 'react';
import { MOCK_RISK_RULES } from '../../lib/mockData';
import { RiskRule } from '../../types/trading';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  X,
  Check
} from 'lucide-react';

export const RiskManagementCenter: React.FC = () => {
  const [rules, setRules] = useState<RiskRule[]>(MOCK_RISK_RULES);
  const [editingRule, setEditingRule] = useState<RiskRule | null>(null);
  const [newLimitVal, setNewLimitVal] = useState('');

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleOpenEdit = (rule: RiskRule) => {
    setEditingRule(rule);
    setNewLimitVal(rule.limitValue);
  };

  const handleSaveLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRule) {
      setRules(prev => prev.map(r => r.id === editingRule.id ? { ...r, limitValue: newLimitVal } : r));
      alert(`Updated risk limit for ${editingRule.name} to: ${newLimitVal}`);
      setEditingRule(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11161D] dark:bg-[#11161D] light:bg-white p-5 rounded-xl border border-[#242B35] dark:border-[#242B35] light:border-slate-300 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#10B981]" />
            <h2 className="text-lg font-bold text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900 font-mono tracking-tight">
              Institutional Risk Control Center
            </h2>
          </div>
          <p className="text-xs text-[#8B95A5] dark:text-[#8B95A5] light:text-slate-500 mt-1">
            Pre-trade margin enforcement and strict position sizing guardrails.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 font-mono text-xs font-bold text-[#10B981] flex items-center gap-1.5 shadow-glow-green">
          <CheckCircle2 size={16} />
          ALL GUARDRAILS ACTIVE
        </span>
      </div>

      {/* Top Capital Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 font-mono">
        <div className="p-4 rounded-xl bg-[#11161D] dark:bg-[#11161D] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 shadow-md">
          <span className="text-xs text-[#8B95A5] block">Trading Capital</span>
          <span className="text-lg font-bold text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900">₹1,00,000</span>
        </div>
        <div className="p-4 rounded-xl bg-[#11161D] dark:bg-[#11161D] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 shadow-md">
          <span className="text-xs text-[#8B95A5] block">Risk / Trade</span>
          <span className="text-lg font-bold text-[#3B82F6]">1.0%</span>
        </div>
        <div className="p-4 rounded-xl bg-[#11161D] dark:bg-[#11161D] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 shadow-md">
          <span className="text-xs text-[#8B95A5] block">Daily Loss Cap</span>
          <span className="text-lg font-bold text-[#EF4444]">₹5,000 (5%)</span>
        </div>
        <div className="p-4 rounded-xl bg-[#11161D] dark:bg-[#11161D] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 shadow-md">
          <span className="text-xs text-[#8B95A5] block">Max Open Positions</span>
          <span className="text-lg font-bold text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900">3 Positions</span>
        </div>
        <div className="p-4 rounded-xl bg-[#11161D] dark:bg-[#11161D] light:bg-white border border-[#10B981]/40 shadow-md">
          <span className="text-xs text-[#8B95A5] block">Current Exposure</span>
          <span className="text-lg font-bold text-[#10B981]">42.0%</span>
        </div>
      </div>

      {/* Large Risk Gauge Card */}
      <div className="p-6 rounded-xl bg-[#11161D] dark:bg-[#11161D] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-xs text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Lock size={16} className="text-[#3B82F6]" />
            Real-Time Portfolio Exposure Gauge
          </h3>
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded-lg">
            STATE: NORMAL
          </span>
        </div>

        {/* Multi-segment Bar Gauge */}
        <div className="space-y-2 font-mono">
          <div className="flex justify-between text-xs">
            <span className="text-[#10B981] font-bold">42% Current Exposure</span>
            <span className="text-[#5F6978]">100% Margin Cap</span>
          </div>

          <div className="h-4 w-full bg-[#080A0F] dark:bg-[#080A0F] light:bg-slate-100 rounded-lg border border-[#242B35] overflow-hidden p-0.5 flex gap-1">
            <div className="bg-[#10B981] h-full rounded w-[42%] transition-all duration-500 shadow-glow-green"></div>
            <div className="bg-[#242B35] h-full rounded w-[58%]"></div>
          </div>

          <div className="flex justify-between text-[10px] text-[#8B95A5] pt-1">
            <span className="text-[#10B981] font-bold">LOW (0-30%)</span>
            <span className="text-[#3B82F6] font-bold">NORMAL (30-60%)</span>
            <span className="text-[#F59E0B] font-bold">ELEVATED (60-80%)</span>
            <span className="text-[#EF4444] font-bold">CRITICAL (80-100%)</span>
          </div>
        </div>
      </div>

      {/* Risk Rules List */}
      <div className="p-5 rounded-xl bg-[#11161D] dark:bg-[#11161D] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 space-y-4 shadow-xl">
        <h3 className="font-mono font-bold text-xs text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900 uppercase tracking-wider">
          Enforced Risk Rules & Threshold Controls
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {rules.map(rule => (
            <div 
              key={rule.id}
              className="p-4 rounded-xl bg-[#151B23] dark:bg-[#151B23] light:bg-slate-50 border border-[#242B35] dark:border-[#242B35] light:border-slate-300 flex flex-wrap items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`
                    w-12 h-6 rounded-full transition-colors relative flex items-center px-1 border-2 border-slate-700
                    ${rule.enabled ? 'bg-[#10B981]' : 'bg-[#242B35]'}
                  `}
                >
                  <span className={`
                    w-4 h-4 rounded-full bg-white transition-transform transform shadow-md
                    ${rule.enabled ? 'translate-x-5' : 'translate-x-0'}
                  `}></span>
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900">{rule.name}</span>
                    <span className="px-2 py-0.5 text-[9px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded font-bold">
                      {rule.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B95A5] dark:text-[#8B95A5] light:text-slate-600 mt-0.5">{rule.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[#8B95A5] block text-[10px]">Configured Limit</span>
                  <span className="font-bold text-[#3B82F6]">{rule.limitValue}</span>
                </div>

                <button 
                  onClick={() => handleOpenEdit(rule)}
                  className="btn-3d btn-3d-secondary px-3 py-1.5 rounded-lg text-xs font-bold text-[#F4F7FA]"
                >
                  Edit Limit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Risk Limit Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0D1117] dark:bg-[#0D1117] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 rounded-2xl shadow-2xl p-5 font-mono text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#242B35] pb-3 mb-4">
              <span className="font-bold text-[#F4F7FA] text-sm">Edit Risk Rule Limit</span>
              <button onClick={() => setEditingRule(null)} className="p-1 rounded text-[#8B95A5] hover:text-[#F4F7FA]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLimit} className="space-y-4">
              <div>
                <label className="text-[#8B95A5] block mb-1">Rule Name</label>
                <input
                  type="text"
                  disabled
                  value={editingRule.name}
                  className="w-full bg-[#080A0F] border border-[#242B35] rounded-lg p-2.5 text-[#8B95A5] font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[#8B95A5] block mb-1">New Limit Value</label>
                <input
                  type="text"
                  required
                  value={newLimitVal}
                  onChange={(e) => setNewLimitVal(e.target.value)}
                  className="w-full bg-[#080A0F] border border-[#242B35] rounded-lg p-2.5 text-[#3B82F6] font-bold outline-none"
                />
              </div>

              <button
                type="submit"
                className="btn-3d btn-3d-primary w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
              >
                <Check size={16} />
                <span>Save Enforced Threshold</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
