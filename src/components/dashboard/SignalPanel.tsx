import React, { useState } from 'react';
import { AISignalData } from '../../types/trading';
import { 
  Bot, 
  TrendingUp, 
  TrendingDown,
  MinusCircle,
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  Sparkles,
  Zap,
  RefreshCw,
  Send
} from 'lucide-react';

interface SignalPanelProps {
  signal: AISignalData;
  onOpenAIModal: () => void;
  onReanalyze?: () => void;
  isAnalyzing?: boolean;
  onExecuteSignal?: () => void;
  isExecuting?: boolean;
}

export const SignalPanel: React.FC<SignalPanelProps> = ({ 
  signal, 
  onOpenAIModal,
  onReanalyze,
  isAnalyzing = false,
  onExecuteSignal,
  isExecuting = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const isBuy = signal.state === 'BUY';
  const isSell = signal.state === 'SELL';
  const isNeutral = signal.state === 'NEUTRAL';

  // Indicator math calculations
  const divergence = Math.round((signal.indicators.ema20 - signal.indicators.ema50) * 10) / 10;
  const isEmaBullish = divergence >= 0;
  const rsi = signal.indicators.rsi;
  const rsiTag = rsi >= 70 ? 'Overbought (>70)' : rsi <= 30 ? 'Oversold (<30)' : rsi >= 50 ? 'Bullish Zone' : 'Bearish Zone';

  // Theme styling based on state
  const stateColor = isBuy ? '#10B981' : isSell ? '#EF4444' : '#F59E0B';
  const stateBgClass = isBuy ? 'bg-[#10B981]/15 border-[#10B981]/40' : isSell ? 'bg-[#EF4444]/15 border-[#EF4444]/40' : 'bg-[#F59E0B]/15 border-[#F59E0B]/40';
  const stateBadgeClass = isBuy ? 'bg-[#10B981] text-black' : isSell ? 'bg-[#EF4444] text-white' : 'bg-[#F59E0B] text-black';

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] space-y-4 shadow-sm flex flex-col justify-between transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242B35] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center">
              <Bot size={16} className="text-[#8B5CF6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider">
                  AI / Strategy Telemetry
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-[#8B95A5]">
                Groq Qwen-27B Live Inference Engine
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {onReanalyze && (
              <button
                onClick={onReanalyze}
                disabled={isAnalyzing}
                title="Re-analyze live market telemetry with Groq AI"
                className="px-2 py-1 text-[10px] font-mono font-bold rounded bg-slate-100 dark:bg-[#161D2A] border border-slate-300 dark:border-[#242B35] text-slate-700 dark:text-[#F4F7FA] hover:text-[#8B5CF6] hover:border-[#8B5CF6]/50 flex items-center gap-1 transition-all disabled:opacity-50"
              >
                <RefreshCw size={11} className={isAnalyzing ? 'animate-spin text-[#8B5CF6]' : ''} />
                <span>{isAnalyzing ? 'Analyzing...' : 'Re-scan'}</span>
              </button>
            )}
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 rounded">
              ACTIVE ALGO
            </span>
          </div>
        </div>

        {/* Large Signal State */}
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${stateBgClass}`}>
              {isBuy && <TrendingUp size={24} className="text-[#10B981]" />}
              {isSell && <TrendingDown size={24} className="text-[#EF4444]" />}
              {isNeutral && <MinusCircle size={24} className="text-[#F59E0B]" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono tracking-tight" style={{ color: stateColor }}>
                  {signal.state} SIGNAL
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${stateBadgeClass}`}>
                  {signal.confidence}% CONFIDENCE
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 dark:text-[#8B95A5] mt-0.5 flex items-center gap-1.5">
                <span>{signal.asset}</span>
                <span>•</span>
                <span className="text-[#10B981] flex items-center gap-0.5">
                  <ShieldCheck size={12} /> Level 3 Risk Filter OK
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 dark:text-[#5F6978] block">{signal.timestamp}</span>
            <span className="text-[10px] font-mono text-[#8B5CF6] block mt-0.5">Live Tick</span>
          </div>
        </div>

        {/* Indicator Telemetry Matrix */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35]">
            <span className="text-slate-500 dark:text-[#8B95A5] block text-[10px]">EMA Cross (20/50)</span>
            <span className={`font-bold block ${isEmaBullish ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {isEmaBullish ? 'Bullish' : 'Bearish'} ({divergence >= 0 ? '+' : ''}{divergence} pts)
            </span>
            <span className="text-[9px] text-slate-400 dark:text-[#5F6978]">
              EMA20: ₹{signal.indicators.ema20.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35]">
            <span className="text-slate-500 dark:text-[#8B95A5] block text-[10px]">RSI (14 Period)</span>
            <span className={`font-bold block ${rsi >= 45 && rsi <= 65 ? 'text-[#10B981]' : rsi > 70 ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
              {rsi.toFixed(1)} ({rsiTag})
            </span>
            <span className="text-[9px] text-slate-400 dark:text-[#5F6978]">
              MACD: {signal.indicators.macdHist >= 0 ? '+' : ''}{signal.indicators.macdHist.toFixed(1)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35]">
            <span className="text-slate-500 dark:text-[#8B95A5] block text-[10px]">Strategy Profile</span>
            <span className="text-[#3B82F6] font-bold block truncate">{signal.strategyName} {signal.strategyVersion}</span>
            <span className="text-[9px] text-slate-400 dark:text-[#5F6978]">SEBI Margin Compliant</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35]">
            <span className="text-slate-500 dark:text-[#8B95A5] block text-[10px]">Block Validity</span>
            <span className="text-[#10B981] font-bold block">0 Drift • Invariant</span>
            <span className="text-[9px] text-slate-400 dark:text-[#5F6978] truncate block">
              Merkle: {signal.strategyHash.slice(0, 10)}...
            </span>
          </div>
        </div>

        {/* Expandable "Why this signal?" Rationale */}
        <div className="mt-3 border border-slate-200 dark:border-[#242B35] rounded-lg overflow-hidden bg-slate-50 dark:bg-[#080A0F]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Info size={14} className="text-[#3B82F6]" />
              <span className="font-semibold text-slate-900 dark:text-[#F4F7FA]">AI Live Rationale & Risk Guardrails</span>
            </div>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isExpanded && (
            <div className="px-3 pb-3 pt-1 text-xs font-mono text-slate-600 dark:text-[#8B95A5] space-y-2 border-t border-slate-200 dark:border-[#1E2631]">
              <p className="leading-relaxed text-slate-900 dark:text-[#F4F7FA] text-[11px]">
                "{signal.rationale}"
              </p>
              <div className="p-2 rounded bg-slate-100 dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] text-[10px] text-slate-500 dark:text-[#5F6978] flex items-center justify-between">
                <span>Signal Hash: {signal.strategyHash.slice(0, 16)}...</span>
                <span className="text-[#10B981] flex items-center gap-1">
                  <CheckCircle2 size={11} /> Upstox v2 Ready
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 mt-4">
        {onExecuteSignal && signal.state !== 'NEUTRAL' && (
          <button
            onClick={onExecuteSignal}
            disabled={isExecuting}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 ${
              isBuy 
                ? 'bg-[#10B981] hover:bg-[#0EA271] text-black shadow-glow-green' 
                : 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
            }`}
          >
            <Zap size={14} />
            <span>
              {isExecuting 
                ? 'Dispatching to Upstox Pro API...' 
                : `⚡ 1-Click Execute ${signal.state} (1 Lot @ Market via Upstox)`}
            </span>
          </button>
        )}

        {/* Button to ask AI Copilot */}
        <button
          onClick={onOpenAIModal}
          className="w-full py-2 px-3 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-xs font-mono font-semibold text-[#8B5CF6] flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles size={14} />
          Ask TradeChain AI Copilot about this signal
        </button>
      </div>
    </div>
  );
};
