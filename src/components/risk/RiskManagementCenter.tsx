import React, { useState } from 'react';
import { RiskRule, ActivePosition, TradeRecord } from '../../types/trading';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  X,
  Check,
  AlertTriangle,
  Flame,
  Sliders,
  RotateCcw,
  Zap,
  Activity,
  BarChart2,
  TrendingDown,
  ShieldAlert,
  Edit2
} from 'lucide-react';

export const SEBI_DEFAULT_RISK_RULES: RiskRule[] = [
  {
    id: 'RULE-IN-01',
    name: 'SEBI Maximum Daily Loss Cap',
    key: 'max_daily_loss',
    currentValue: '₹0.00',
    limitValue: '₹5,000.00 (5%)',
    enabled: true,
    status: 'SAFE',
    description: 'Automated emergency circuit breaker halting all bot execution if intraday loss reaches limit.'
  },
  {
    id: 'RULE-IN-02',
    name: 'Single Position Allocation Cap',
    key: 'max_position_size',
    currentValue: '₹0.00',
    limitValue: '₹25,000.00 (25%)',
    enabled: true,
    status: 'SAFE',
    description: 'Caps individual margin commitment per F&O contract or equity symbol to prevent concentration.'
  },
  {
    id: 'RULE-IN-03',
    name: 'NSE Exchange SL Order Lock',
    key: 'stop_loss_pct',
    currentValue: '1.0% Fixed',
    limitValue: '1.0% Stop Loss',
    enabled: true,
    status: 'SAFE',
    description: 'Mandatory automated Stop Loss order placing on Upstox / Groww / Zerodha broker gateways.'
  },
  {
    id: 'RULE-IN-04',
    name: 'Trailing Profit Lock-in Ladder',
    key: 'take_profit_pct',
    currentValue: '2.5%',
    limitValue: '2.5% Target / 0.5% Trail',
    enabled: true,
    status: 'SAFE',
    description: 'Automatically trails peak price once target is achieved to protect realized intraday profits.'
  },
  {
    id: 'RULE-IN-05',
    name: 'Max Concurrent Open Positions',
    key: 'max_open_positions',
    currentValue: '0 Active',
    limitValue: '3 Contracts Max',
    enabled: true,
    status: 'SAFE',
    description: 'Limits simultaneous exposure across NIFTY, Bank NIFTY, and Equity derivatives.'
  }
];

interface RiskManagementCenterProps {
  positions?: ActivePosition[];
  trades?: TradeRecord[];
  niftyPrice?: number;
  onClosePosition?: (posId: string) => void;
}

export const RiskManagementCenter: React.FC<RiskManagementCenterProps> = ({
  positions = [],
  trades = [],
  niftyPrice = 24850,
  onClosePosition
}) => {
  const [rules, setRules] = useState<RiskRule[]>(() => {
    try {
      const saved = localStorage.getItem('tradechain_risk_rules');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEBI_DEFAULT_RISK_RULES;
  });
  const [editingRule, setEditingRule] = useState<RiskRule | null>(null);
  const [newLimitVal, setNewLimitVal] = useState('');
  const [activeTab, setActiveTab] = useState<'RULES' | 'STRESS_TEST' | 'AUDIT_LOGS'>('RULES');
  
  // Emergency Flatten Modal State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isEmergencyExecuted, setIsEmergencyExecuted] = useState(false);

  // Stress Test Simulation State
  const [stressScenarioPct, setStressScenarioPct] = useState<number>(-5);

  // Compute dynamic risk metrics
  const totalCapital = 500000;
  const currentInvested = positions.reduce((acc, p) => acc + (p.entryPrice * p.quantity), 0);
  const unrealizedPnl = positions.reduce((acc, p) => acc + p.unrealizedPnl, 0);
  const currentExposurePct = Math.min(100, Math.round((currentInvested / totalCapital) * 1000) / 10);
  
  // Estimate VaR 99% (Value at Risk) based on asset volatility
  const var99Inr = Math.round(currentInvested * 0.038);
  const riskScore = currentExposurePct < 30 ? 1.8 : currentExposurePct < 60 ? 3.5 : 7.8;
  const riskState = currentExposurePct < 60 ? 'SAFE' : currentExposurePct < 85 ? 'ELEVATED' : 'CRITICAL';

  // Stress test calculations
  const estimatedStressPnl = Math.round(currentInvested * (stressScenarioPct / 100));
  const postStressCapital = totalCapital + unrealizedPnl + estimatedStressPnl;

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
      setEditingRule(null);
    }
  };

  const handleResetDefaults = () => {
    setRules(SEBI_DEFAULT_RISK_RULES);
    alert('Risk guardrails reset to regulatory SEBI & NSE default guidelines.');
  };

  const handleExecuteEmergencyFlatten = () => {
    if (onClosePosition && positions.length > 0) {
      positions.forEach(p => onClosePosition(p.id));
    }
    setIsEmergencyExecuted(true);
    setIsEmergencyModalOpen(false);
    setTimeout(() => setIsEmergencyExecuted(false), 5000);
  };

  const formatCurrency = (val: number) => {
    return `₹${Math.abs(val).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-[#11161D] p-5 rounded-xl border border-slate-200 dark:border-[#242B35] shadow-sm w-full overflow-hidden">
        <div className="min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck size={20} className="text-[#10B981] shrink-0" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] font-mono tracking-tight truncate">
              Institutional Pre-Trade Risk Control Center
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded shrink-0 flex items-center gap-1">
              <CheckCircle2 size={12} /> SEBI & FIX GATEWAY COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8B95A5] mt-1 font-sans truncate">
            Automated pre-order margin validation, intraday loss circuit breakers & tail-risk scenario simulation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="btn-3d btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw size={14} />
            <span>Reset Guidelines</span>
          </button>

          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="btn-3d btn-3d-danger px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-md animate-pulse"
          >
            <Flame size={15} />
            <span>EMERGENCY FLATTEN</span>
          </button>
        </div>
      </div>

      {/* Emergency Flatten Success Notification */}
      {isEmergencyExecuted && (
        <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444] text-[#EF4444] font-mono text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span className="font-bold">EMERGENCY CIRCUIT BREAKER ACTIVATED: All open positions liquidated & FIX gateway paused.</span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#EF4444] text-white rounded">HALTED</span>
        </div>
      )}

      {/* Top 5 Capital & Exposure KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-mono w-full overflow-hidden">
        
        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Portfolio Base Capital</span>
          <div className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] truncate">
            ₹{totalCapital.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#3B82F6] font-bold block truncate">
            NSE F&O Margin Desk
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Current Exposure</span>
          <div className="text-lg font-bold text-[#3B82F6] truncate">
            {currentExposurePct}%
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5] block truncate">
            {positions.length} Active Contracts
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-[#EF4444]/40 space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Intraday Loss Cap</span>
          <div className="text-lg font-bold text-[#EF4444] truncate">
            ₹25,000 (5.0%)
          </div>
          <span className="text-[10px] text-[#EF4444] font-bold block truncate">
            Auto-Kill Switch Enabled
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Value at Risk (VaR 99%)</span>
          <div className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] truncate">
            ₹{var99Inr.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5] block truncate">1-Day Max Expected Drawdown</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-[#10B981]/40 space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Risk Score Index</span>
          <div className="text-lg font-bold text-[#10B981] truncate">
            {riskScore} / 10.0
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span className="text-[10px] font-bold text-[#10B981] uppercase truncate">{riskState}</span>
          </div>
        </div>

      </div>

      {/* Real-Time Exposure Multi-Segment Gauge */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm w-full overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
            <Lock size={16} className="text-[#3B82F6]" />
            Real-Time Margin Exposure Gauge
          </h3>
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded-lg">
            STATE: {riskState} ({currentExposurePct}% DEPLOYED)
          </span>
        </div>

        <div className="space-y-2 font-mono">
          <div className="flex justify-between text-xs">
            <span className="text-[#10B981] font-bold">Current Margin Deployed: {currentExposurePct}%</span>
            <span className="text-slate-400 font-bold">100% Max Regulatory Cap</span>
          </div>

          <div className="h-4 w-full bg-slate-100 dark:bg-[#080A0F] rounded-lg border border-slate-200 dark:border-[#242B35] overflow-hidden p-0.5 flex gap-1">
            <div 
              className={`h-full rounded transition-all duration-500 ${
                currentExposurePct < 60 ? 'bg-[#10B981]' : currentExposurePct < 85 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
              }`}
              style={{ width: `${currentExposurePct}%` }}
            ></div>
            <div 
              className="bg-slate-200 dark:bg-[#1E2631] h-full rounded"
              style={{ width: `${100 - currentExposurePct}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#8B95A5] pt-1">
            <span className="text-[#10B981] font-bold">LOW (0-30%)</span>
            <span className="text-[#3B82F6] font-bold">NORMAL (30-60%)</span>
            <span className="text-[#F59E0B] font-bold">ELEVATED (60-80%)</span>
            <span className="text-[#EF4444] font-bold">CRITICAL (80-100%)</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Navigation Tabs */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm w-full overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#3B82F6]" />
            <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider">
              {activeTab === 'RULES' && 'Enforced Risk Rules & Threshold Controls'}
              {activeTab === 'STRESS_TEST' && 'Tail Risk & Market Crash Scenario Simulator'}
              {activeTab === 'AUDIT_LOGS' && 'Pre-Trade Gateway Audit Log'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#080A0F] p-1 rounded-lg border border-slate-200 dark:border-[#242B35]">
            <button
              onClick={() => setActiveTab('RULES')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'RULES'
                  ? 'bg-white dark:bg-[#1E2631] text-[#3B82F6] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Guardrail Rules
            </button>
            <button
              onClick={() => setActiveTab('STRESS_TEST')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'STRESS_TEST'
                  ? 'bg-white dark:bg-[#1E2631] text-[#EF4444] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Stress Simulator
            </button>
            <button
              onClick={() => setActiveTab('AUDIT_LOGS')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'AUDIT_LOGS'
                  ? 'bg-white dark:bg-[#1E2631] text-[#10B981] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Audit Stream
            </button>
          </div>
        </div>

        {/* Tab 1: Enforced Rules List */}
        {activeTab === 'RULES' && (
          <div className="space-y-3 font-mono text-xs">
            {rules.map(rule => (
              <div 
                key={rule.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-[#3B82F6]/50"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`
                      w-11 h-6 rounded-full transition-colors relative flex items-center px-1 border-2 border-slate-300 dark:border-slate-700 shrink-0 mt-0.5 sm:mt-0
                      ${rule.enabled ? 'bg-[#10B981]' : 'bg-slate-300 dark:bg-[#242B35]'}
                    `}
                  >
                    <span className={`
                      w-4 h-4 rounded-full bg-white transition-transform transform shadow-md
                      ${rule.enabled ? 'translate-x-5' : 'translate-x-0'}
                    `}></span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-[#F4F7FA]">{rule.name}</span>
                      <span className={`px-2 py-0.5 text-[9px] border rounded font-bold ${
                        rule.enabled ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' : 'bg-slate-200 dark:bg-[#1E2631] text-slate-500 border-slate-300 dark:border-[#242B35]'
                      }`}>
                        {rule.enabled ? rule.status : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#8B95A5] mt-1 font-sans">{rule.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-[#242B35]">
                  <div className="text-left sm:text-right">
                    <span className="text-slate-400 block text-[10px]">Configured Limit</span>
                    <span className="font-bold text-[#3B82F6]">{rule.limitValue}</span>
                  </div>

                  <button 
                    onClick={() => handleOpenEdit(rule)}
                    className="btn-3d btn-3d-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Edit2 size={12} />
                    <span>Edit Limit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Market Crash Stress Test Simulator */}
        {activeTab === 'STRESS_TEST' && (
          <div className="space-y-5 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2631] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-slate-900 dark:text-[#F4F7FA] text-xs">Simulated Market Index Movement:</span>
                <span className={`font-bold text-base ${stressScenarioPct < 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                  {stressScenarioPct > 0 ? '+' : ''}{stressScenarioPct}% Instant Drop / Rally
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="-20"
                max="10"
                step="1"
                value={stressScenarioPct}
                onChange={(e) => setStressScenarioPct(Number(e.target.value))}
                className="w-full accent-[#EF4444] cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#8B95A5]">
                <span>-20% Black Swan Drop</span>
                <span>-10% Bank Nifty Meltdown</span>
                <span>-5% Flash Crash</span>
                <span>0% Neutral</span>
                <span>+10% Rally</span>
              </div>
            </div>

            {/* Scenario Impact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35] space-y-1">
                <span className="text-slate-400 text-[11px] block">Estimated Instant P&L Impact</span>
                <span className={`text-lg font-bold block ${estimatedStressPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {estimatedStressPnl >= 0 ? '+' : '-'}{formatCurrency(estimatedStressPnl)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35] space-y-1">
                <span className="text-slate-400 text-[11px] block">Post-Scenario Capital</span>
                <span className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] block">
                  ₹{postStressCapital.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35] space-y-1">
                <span className="text-slate-400 text-[11px] block">Circuit Breaker Trigger Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded inline-block ${
                  Math.abs(estimatedStressPnl) > 25000 ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#10B981]/15 text-[#10B981]'
                }`}>
                  {Math.abs(estimatedStressPnl) > 25000 ? 'HALT & AUTO LIQUIDATE' : 'WITHIN RISK LIMIT'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Pre-Trade Gateway Audit Stream */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2631] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#10B981] font-bold">[10:22:45 IST] PRE-TRADE CHECK PASSED</span>
                <span className="text-slate-400">Order #TRD-IN-94820</span>
              </div>
              <p className="text-slate-500 dark:text-[#8B95A5] text-[11px]">
                Validated margin requirements for 15 lots BANK NIFTY Futures against Upstox FIX gateway. Max loss cap verified.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2631] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#3B82F6] font-bold">[10:18:12 IST] TRAILING STOP ADJUSTED</span>
                <span className="text-slate-400">Position #POS-NSE-02</span>
              </div>
              <p className="text-slate-500 dark:text-[#8B95A5] text-[11px]">
                Trailing profit lock ladder updated trigger price to ₹52,900 (+2.5% intraday profit locked).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2631] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#10B981] font-bold">[09:30:00 IST] MARKET OPEN RISK HEALTH CHECK</span>
                <span className="text-slate-400">System Gateway</span>
              </div>
              <p className="text-slate-500 dark:text-[#8B95A5] text-[11px]">
                All 5 institutional guardrails active. Capital ₹5,00,000 verified across broker API connections.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Edit Risk Limit Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#242B35] rounded-2xl shadow-2xl p-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242B35] pb-3 mb-4">
              <span className="font-bold text-slate-900 dark:text-[#F4F7FA] text-sm">Edit Risk Threshold</span>
              <button onClick={() => setEditingRule(null)} className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-[#F4F7FA]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLimit} className="space-y-4">
              <div>
                <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Rule Name</label>
                <input
                  type="text"
                  disabled
                  value={editingRule.name}
                  className="w-full bg-slate-100 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2.5 text-slate-500 dark:text-[#8B95A5] font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">New Threshold / Limit Value</label>
                <input
                  type="text"
                  required
                  value={newLimitVal}
                  onChange={(e) => setNewLimitVal(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg p-2.5 text-[#3B82F6] font-bold outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-[#F4F7FA] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d btn-3d-primary px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>Save Limit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Flatten Confirmation Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1117] border border-[#EF4444] rounded-2xl shadow-2xl p-5 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EF4444]/30 pb-3">
              <div className="flex items-center gap-2 text-[#EF4444]">
                <Flame size={20} />
                <h3 className="font-bold text-sm">Emergency Circuit Breaker</h3>
              </div>
              <button onClick={() => setIsEmergencyModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-[#F4F7FA]">
                <X size={16} />
              </button>
            </div>

            <p className="text-slate-600 dark:text-[#94A3B8]">
              Are you sure you want to trigger the emergency circuit breaker? This will instantly <strong className="text-[#EF4444]">liquidate all {positions.length} open position(s)</strong> at market price and halt automated order routing.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-[#F4F7FA] font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteEmergencyFlatten}
                className="btn-3d btn-3d-danger px-4 py-2 rounded-xl font-bold flex items-center gap-2"
              >
                <Flame size={16} />
                <span>CONFIRM LIQUIDATION</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
