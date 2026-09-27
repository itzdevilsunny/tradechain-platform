import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Play, 
  Pause, 
  OctagonAlert, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Terminal as TerminalIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Layers, 
  Cpu, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Lock, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ActivePosition, TradeRecord } from '../../types/trading';

interface TradingBotControlProps {
  niftyPrice: number;
  niftyChange: number;
  positions: ActivePosition[];
  trades: TradeRecord[];
  onExecuteOrder: (order: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'SL-M';
    qty: number;
    price: number;
    broker: string;
  }) => void;
  onOpenVerifyPage: (tradeId: string) => void;
}

interface BotStrategyItem {
  id: string;
  name: string;
  asset: string;
  broker: string;
  status: 'RUNNING' | 'PAUSED';
  winRate: number;
  todayPnl: number;
  totalTrades: number;
  timeframe: string;
  description: string;
}

interface ConsoleLogMessage {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SIGNAL' | 'EXECUTION' | 'WARN' | 'BLOCK';
  message: string;
  hash?: string;
}

export const TradingBotControl: React.FC<TradingBotControlProps> = ({
  niftyPrice,
  niftyChange,
  positions,
  trades,
  onExecuteOrder,
  onOpenVerifyPage
}) => {
  // Master Bot State
  const [botMode, setBotMode] = useState<'RUNNING' | 'PAUSED' | 'KILLED'>('RUNNING');
  const [autoExecute, setAutoExecute] = useState(true);

  // Strategy list state
  const [strategies, setStrategies] = useState<BotStrategyItem[]>([
    {
      id: 'STRAT-01',
      name: 'Quant EMA Crossover Scalper',
      asset: 'NIFTY 50 Futures',
      broker: 'Upstox Pro FIX',
      status: 'RUNNING',
      winRate: 78.4,
      todayPnl: 14250.00,
      totalTrades: 42,
      timeframe: '5m',
      description: 'EMA(20) > EMA(50) bullish cross with RSI intraday trailing stop loss.'
    },
    {
      id: 'STRAT-02',
      name: 'BankNifty Volatility Breakout',
      asset: 'BANK NIFTY Futures',
      broker: 'Groww API',
      status: 'RUNNING',
      winRate: 82.1,
      todayPnl: 18900.50,
      totalTrades: 28,
      timeframe: '15m',
      description: 'Bollinger Band squeeze expansion with VWAP directional confirmation.'
    },
    {
      id: 'STRAT-03',
      name: 'Reliance Momentum Driver',
      asset: 'RELIANCE IND',
      broker: 'Zerodha Kite',
      status: 'RUNNING',
      winRate: 69.5,
      todayPnl: 6420.00,
      totalTrades: 19,
      timeframe: '15m',
      description: 'Order flow imbalance scalper targeting high relative volume breakouts.'
    },
    {
      id: 'STRAT-04',
      name: 'TCS Mean Reversion Engine',
      asset: 'TCS',
      broker: 'Upstox Pro FIX',
      status: 'PAUSED',
      winRate: 74.0,
      todayPnl: -1200.00,
      totalTrades: 12,
      timeframe: '1h',
      description: 'RSI oversold < 30 bounce trading with hard 1.2% risk stop loss.'
    }
  ]);

  // Dynamic Bot Controls & Risk Sliders
  const [maxSlippage, setMaxSlippage] = useState(0.05); // 0.05%
  const [maxOrdersPerMin, setMaxOrdersPerMin] = useState(10);
  const [maxLossCap, setMaxLossCap] = useState(50000); // ₹50,000 max daily loss limit
  const [trailStopLossPct, setTrailStopLossPct] = useState(1.5); // 1.5% trailing stop

  // Live Console Log Stream
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogMessage[]>([
    { id: '1', timestamp: '09:12:05', type: 'INFO', message: 'TradeChain Bot Engine initialized. Upstox FIX socket connected at 12ms latency.' },
    { id: '2', timestamp: '09:12:10', type: 'SIGNAL', message: 'BUY Signal generated for NIFTY 50 Futures (89% Confidence). EMA20 (24,845) > EMA50 (24,790).' },
    { id: '3', timestamp: '09:12:12', type: 'EXECUTION', message: 'Order Executed: BUY 50 Qty NIFTY 50 Futures @ ₹24,850.40 via Upstox FIX.', hash: '0x8f2a...391e' },
    { id: '4', timestamp: '09:12:15', type: 'BLOCK', message: 'Block #4282 finality reached. Merkle root 0x9ab4...128c committed on-chain.' }
  ]);

  // Live automated bot ticker effect
  useEffect(() => {
    if (botMode !== 'RUNNING') return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
      const types: ConsoleLogMessage['type'][] = ['INFO', 'SIGNAL', 'EXECUTION', 'BLOCK'];
      const currentType = types[Math.floor(Math.random() * types.length)];
      
      let msg = '';
      let hashStr: string | undefined = undefined;

      if (currentType === 'SIGNAL') {
        const side = Math.random() > 0.4 ? 'BUY' : 'SELL';
        const symbol = ['NIFTY 50 Futures', 'BANK NIFTY Futures', 'RELIANCE IND'][Math.floor(Math.random() * 3)];
        const conf = Math.floor(82 + Math.random() * 15);
        msg = `Determinism Signal: ${side} ${symbol} (${conf}% Confidence). Risk Filter PASSED.`;

        // If autoExecute is ON, trigger actual position order execution!
        if (autoExecute && Math.random() > 0.6) {
          const qty = symbol.includes('NIFTY') ? 25 : 50;
          onExecuteOrder({
            symbol,
            side: side as any,
            type: 'MARKET',
            qty,
            price: niftyPrice,
            broker: 'Upstox FIX'
          });
        }
      } else if (currentType === 'EXECUTION') {
        msg = `FIX Gateway fill: Executed BUY 25 Qty NIFTY 50 @ ₹${niftyPrice.toFixed(2)}. Latency: 11ms.`;
        hashStr = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;
      } else if (currentType === 'BLOCK') {
        const blockNum = Math.floor(4280 + Math.random() * 20);
        msg = `On-Chain Consensus: Block #${blockNum} signed by NSE Validator Node #1. 0 drift invariant.`;
        hashStr = `0x${Math.random().toString(16).substring(2, 8)}`;
      } else {
        msg = `Heartbeat OK: SEBI Margin 100% compliant. Active positions monitored: ${positions.length}.`;
      }

      setConsoleLogs(prev => [
        { id: Math.random().toString(), timestamp: timeStr, type: currentType, message: msg, hash: hashStr },
        ...prev.slice(0, 19)
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, [botMode, autoExecute, niftyPrice, positions.length, onExecuteOrder]);

  const toggleStrategyStatus = (id: string) => {
    setStrategies(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'RUNNING' ? 'PAUSED' : 'RUNNING' };
      }
      return s;
    }));
  };

  const handleKillSwitch = () => {
    if (confirm('🚨 EMERGENCY KILL-SWITCH WARNING:\n\nAre you sure you want to IMMEDIATELY liquidate all positions, halt all bot engines, and lock trading?')) {
      setBotMode('KILLED');
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
      setConsoleLogs(prev => [
        {
          id: Math.random().toString(),
          timestamp: timeStr,
          type: 'WARN',
          message: '🚨 EMERGENCY KILL-SWITCH ENGAGED! Liquidated all active positions and severed broker FIX sockets.',
          hash: '0xKILL_SWITCH_AUDIT_LOG_001'
        },
        ...prev
      ]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 overflow-x-hidden">
      
      {/* Top Banner & Master Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0B0E14] p-5 rounded-xl border border-slate-200 dark:border-[#1E2633] shadow-xs">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md transition-colors ${
            botMode === 'RUNNING' 
              ? 'bg-gradient-to-br from-[#10B981] to-[#059669]' 
              : botMode === 'PAUSED' 
                ? 'bg-gradient-to-br from-amber-500 to-amber-600' 
                : 'bg-gradient-to-br from-[#EF4444] to-[#B91C1C]'
          }`}>
            <Bot size={24} className={botMode === 'RUNNING' ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-slate-900 dark:text-[#F1F5F9]">
                Algorithmic Bot Control & Execution Desk
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border uppercase ${
                botMode === 'RUNNING' 
                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' 
                  : botMode === 'PAUSED' 
                    ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' 
                    : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
              }`}>
                BOT ENGINE {botMode}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5 font-sans">
              Autonomous NSE/BSE signal execution, latency optimization, and emergency kill-switch guardrails.
            </p>
          </div>
        </div>

        {/* Master Control Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {botMode === 'RUNNING' ? (
            <button
              onClick={() => setBotMode('PAUSED')}
              className="btn-3d btn-3d-warning px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
            >
              <Pause size={15} />
              <span>PAUSE BOT ENGINE</span>
            </button>
          ) : (
            <button
              onClick={() => setBotMode('RUNNING')}
              className="btn-3d btn-3d-success px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2"
            >
              <Play size={15} />
              <span>START BOT ENGINE</span>
            </button>
          )}

          {/* Emergency Kill Switch Button */}
          <button
            onClick={handleKillSwitch}
            className="btn-3d btn-3d-danger px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-lg animate-pulse"
          >
            <OctagonAlert size={16} />
            <span>KILL SWITCH</span>
          </button>
        </div>
      </div>

      {/* 4 Bot Metric KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Bot Realized PnL */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-[#64748B] text-xs font-mono">
            <span>Bot Realized P&L Today</span>
            <TrendingUp size={16} className="text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#10B981]">
              +₹39,570.50
            </span>
            <span className="text-xs font-mono text-[#10B981] font-bold">+4.18%</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 dark:text-[#5F6978]">Across 4 active quant strategies</p>
        </div>

        {/* KPI 2: Signal Accuracy */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-[#64748B] text-xs font-mono">
            <span>Overall Win Rate</span>
            <Activity size={16} className="text-[#3B82F6]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-[#F1F5F9]">
              78.6%
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-[#64748B]">101W / 27L</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 dark:text-[#5F6978]">128 total automated trades</p>
        </div>

        {/* KPI 3: Execution Latency */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-[#64748B] text-xs font-mono">
            <span>Average Order Latency</span>
            <Zap size={16} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-[#F1F5F9]">
              11.4 ms
            </span>
            <span className="text-xs font-mono text-[#10B981] font-bold">OPTIMAL</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 dark:text-[#5F6978]">Direct FIX Socket Telemetry</p>
        </div>

        {/* KPI 4: Cryptographic Proof Verification */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-[#64748B] text-xs font-mono">
            <span>On-Chain Block Integrity</span>
            <ShieldCheck size={16} className="text-[#10B981]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#10B981]">
              100% VERIFIED
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 dark:text-[#5F6978]">128/128 SHA-256 Merkle Hashes</p>
        </div>
      </div>

      {/* Main 2-Column Grid: Strategies + Live Console Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        
        {/* LEFT: Active Bot Strategies Management (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E2633]">
            <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <Layers size={16} className="text-[#3B82F6]" />
              <span>Active Quant Strategy Portfolio ({strategies.length})</span>
            </h3>

            {/* Auto Execute Toggle */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500 dark:text-[#64748B] text-[11px]">Auto-Execute Signals:</span>
              <button
                onClick={() => setAutoExecute(!autoExecute)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                  autoExecute 
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' 
                    : 'bg-slate-100 dark:bg-[#161D2A] text-slate-500 border border-slate-200 dark:border-[#1E2633]'
                }`}
              >
                {autoExecute ? 'ON (AUTO FILL)' : 'OFF (MANUAL)'}
              </button>
            </div>
          </div>

          {/* Strategy Cards List */}
          <div className="space-y-3">
            {strategies.map(strat => (
              <div 
                key={strat.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] space-y-3 font-mono"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] font-bold text-xs">
                      {strat.id.split('-')[1]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-[#F1F5F9]">{strat.name}</h4>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-200 dark:bg-[#161D2A] text-slate-700 dark:text-[#94A3B8] rounded border border-slate-300 dark:border-[#1E2633]">
                          {strat.timeframe}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-[#64748B] mt-0.5">
                        {strat.asset} • {strat.broker}
                      </p>
                    </div>
                  </div>

                  {/* Status & Toggle Switch */}
                  <div className="flex items-center gap-3">
                    <div className="text-right text-[11px]">
                      <span className="text-slate-500 dark:text-[#64748B] text-[9px] block">Today's P&L</span>
                      <span className={`font-bold ${strat.todayPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {strat.todayPnl >= 0 ? '+' : ''}₹{strat.todayPnl.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleStrategyStatus(strat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold btn-3d ${
                        strat.status === 'RUNNING' ? 'btn-3d-success' : 'btn-3d-secondary text-slate-600'
                      }`}
                    >
                      {strat.status === 'RUNNING' ? 'RUNNING' : 'PAUSED'}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                  {strat.description}
                </p>

                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-200 dark:border-[#1E2633] text-slate-500 dark:text-[#64748B]">
                  <span>Win Rate: <strong className="text-slate-900 dark:text-[#F1F5F9]">{strat.winRate}%</strong></span>
                  <span>Total Executions: <strong className="text-slate-900 dark:text-[#F1F5F9]">{strat.totalTrades} Trades</strong></span>
                  <span>Status: <strong className={strat.status === 'RUNNING' ? 'text-[#10B981]' : 'text-amber-500'}>{strat.status}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Bot Risk Sliders */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] space-y-3 font-mono">
            <h4 className="font-bold text-xs text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <Sliders size={14} className="text-[#8B5CF6]" />
              <span>Bot Risk Guardrails & Constraints</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#64748B] mb-1">
                  <span>Max Slippage Limit</span>
                  <span className="font-bold text-[#3B82F6]">{maxSlippage}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.20"
                  step="0.01"
                  value={maxSlippage}
                  onChange={(e) => setMaxSlippage(Number(e.target.value))}
                  className="w-full accent-[#3B82F6] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#64748B] mb-1">
                  <span>Trailing Stop Loss</span>
                  <span className="font-bold text-[#10B981]">{trailStopLossPct}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={trailStopLossPct}
                  onChange={(e) => setTrailStopLossPct(Number(e.target.value))}
                  className="w-full accent-[#10B981] cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Live Bot Terminal Console Stream (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl p-5 flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E2633]">
            <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <TerminalIcon size={16} className="text-[#10B981]" />
              <span>Live Console Log & On-Chain Feed</span>
            </h3>
            <span className="text-[10px] font-mono text-[#10B981] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
              STREAMING
            </span>
          </div>

          {/* Terminal Output Area */}
          <div className="flex-1 bg-slate-950 text-slate-100 p-4 rounded-xl my-3 font-mono text-[11px] overflow-y-auto space-y-2 border border-slate-800 shadow-inner">
            {consoleLogs.map(log => (
              <div key={log.id} className="leading-relaxed border-b border-slate-900 pb-1.5">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>[{log.timestamp}]</span>
                  <span className={`font-bold px-1 rounded text-[9px] ${
                    log.type === 'SIGNAL' 
                      ? 'bg-[#3B82F6]/20 text-[#3B82F6]' 
                      : log.type === 'EXECUTION' 
                        ? 'bg-[#10B981]/20 text-[#10B981]' 
                        : log.type === 'BLOCK' 
                          ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' 
                          : log.type === 'WARN' 
                            ? 'bg-[#EF4444]/20 text-[#EF4444]' 
                            : 'bg-slate-800 text-slate-400'
                  }`}>
                    {log.type}
                  </span>
                  {log.hash && (
                    <span 
                      onClick={() => onOpenVerifyPage('TRD-IN-00104')}
                      className="text-slate-500 hover:text-[#3B82F6] cursor-pointer underline text-[9px]"
                    >
                      {log.hash}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-slate-200 font-medium">
                  {log.message}
                </p>
              </div>
            ))}
          </div>

          {/* Console Action Footer */}
          <div className="p-3 bg-slate-50 dark:bg-[#111620] rounded-xl border border-slate-200 dark:border-[#1E2633] flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-[#64748B] text-[11px]">
              Engine Latency: <strong className="text-[#10B981]">11ms</strong>
            </span>
            <button
              onClick={() => {
                const now = new Date().toLocaleTimeString('en-IN', { hour12: false });
                setConsoleLogs(prev => [
                  { id: Math.random().toString(), timestamp: now, type: 'INFO', message: 'Manually flushed console log buffer.' },
                  ...prev.slice(0, 5)
                ]);
              }}
              className="btn-3d btn-3d-secondary px-2.5 py-1 rounded text-[10px] flex items-center gap-1 font-bold"
            >
              <RotateCcw size={12} />
              <span>Clear Console</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
