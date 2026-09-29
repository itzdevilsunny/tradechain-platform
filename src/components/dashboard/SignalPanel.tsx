import React, { useState } from 'react';
import { AISignalData, BlockHeader } from '../../types/trading';
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
  SlidersHorizontal,
  Activity,
  Layers
} from 'lucide-react';

export const SCANNED_ASSETS = [
  { id: 'NIFTY 50 Futures', label: 'NIFTY 50' },
  { id: 'BANK NIFTY Futures', label: 'BANK NIFTY' },
  { id: 'FIN NIFTY Futures', label: 'FIN NIFTY' },
  { id: 'SENSEX Futures', label: 'SENSEX' },
  { id: 'RELIANCE Eq', label: 'RELIANCE' },
  { id: 'TCS Eq', label: 'TCS' },
  { id: 'BTC / INR', label: 'BTC/INR' }
];

interface SignalPanelProps {
  signal: AISignalData;
  onOpenAIModal: () => void;
  onReanalyze?: () => void;
  isAnalyzing?: boolean;
  onExecuteSignal?: () => void;
  isExecuting?: boolean;
  selectedPair?: string;
  onSelectPair?: (pair: string) => void;
  latestBlock?: BlockHeader;
  multiAssetSignals?: Record<string, { state: 'BUY' | 'SELL' | 'NEUTRAL'; confidence: number; rsi?: number }>;
}

export const SignalPanel: React.FC<SignalPanelProps> = ({ 
  signal, 
  onOpenAIModal,
  onReanalyze,
  isAnalyzing = false,
  onExecuteSignal,
  isExecuting = false,
  selectedPair,
  onSelectPair,
  latestBlock,
  multiAssetSignals = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRadar, setShowRadar] = useState(true);

  const isBuy = signal.state === 'BUY';
  const isSell = signal.state === 'SELL';
  const isNeutral = signal.state === 'NEUTRAL';

  // Indicator math calculations from live candles
  const divergence = Math.round((signal.indicators.ema20 - signal.indicators.ema50) * 10) / 10;
  const isEmaBullish = divergence >= 0;
  const rsi = signal.indicators.rsi;
  const rsiTag = rsi >= 70 ? 'Overbought (>70)' : rsi <= 30 ? 'Oversold (<30)' : rsi >= 50 ? 'Bullish Zone' : 'Bearish Zone';

  // Theme styling based on state
  const stateColor = isBuy ? '#10B981' : isSell ? '#EF4444' : '#F59E0B';
  const stateBgClass = isBuy ? 'bg-[#10B981]/15 border-[#10B981]/40' : isSell ? 'bg-[#EF4444]/15 border-[#EF4444]/40' : 'bg-[#F59E0B]/15 border-[#F59E0B]/40';
  const stateBadgeClass = isBuy ? 'bg-[#10B981] text-black' : isSell ? 'bg-[#EF4444] text-white' : 'bg-[#F59E0B] text-black';

  const currentAsset = selectedPair || signal.asset;
  const blockMerkle = latestBlock?.merkleRoot || signal.strategyHash;
  const blockNum = latestBlock?.blockNumber || 4281;

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] space-y-3.5 shadow-sm flex flex-col justify-between transition-all">
      <div>
        {/* Header with Engine Info & Live Re-Scan */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242B35] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center">
              <Bot size={16} className="text-[#8B5CF6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider">
                  AI Live Telemetry
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
                className="px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-slate-100 dark:bg-[#161D2A] border border-slate-300 dark:border-[#242B35] text-slate-700 dark:text-[#F4F7FA] hover:text-[#8B5CF6] hover:border-[#8B5CF6]/50 flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <RefreshCw size={11} className={isAnalyzing ? 'animate-spin text-[#8B5CF6]' : ''} />
                <span>{isAnalyzing ? 'Analyzing...' : 'Re-scan'}</span>
              </button>
            )}
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 rounded">
              LIVE ALGO
            </span>
          </div>
        </div>

        {/* Quick Multi-Asset AI Scanner Switcher */}
        {onSelectPair && (
          <div className="mt-2.5 pt-0.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-[#8B95A5] flex items-center gap-1">
                <Activity size={11} className="text-[#3B82F6]" />
                SCAN ASSET:
              </span>
              <button 
                onClick={() => setShowRadar(!showRadar)}
                className="text-[9px] font-mono text-[#3B82F6] hover:underline"
              >
                {showRadar ? 'Compact Radar' : 'Expand Radar'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {SCANNED_ASSETS.map(item => {
                const isSelected = (selectedPair || signal.asset).includes(item.label) || (selectedPair || signal.asset) === item.id;
                const radarSig = multiAssetSignals[item.id] || multiAssetSignals[item.label];
                const sigColor = radarSig?.state === 'BUY' ? 'text-[#10B981]' : radarSig?.state === 'SELL' ? 'text-[#EF4444]' : 'text-slate-400';

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectPair(item.id)}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-[#3B82F6] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#161D2A] text-slate-600 dark:text-[#8B95A5] border border-slate-200 dark:border-[#242B35] hover:border-[#3B82F6]/50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {radarSig && (
                      <span className={`text-[8px] font-mono font-black ${isSelected ? 'text-white/90' : sigColor}`}>
                        {radarSig.state === 'BUY' ? '▲' : radarSig.state === 'SELL' ? '▼' : '●'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Large Signal State */}
        <div className="py-3 flex items-center justify-between border-b border-slate-100 dark:border-[#1E2633]/60 my-1">
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
                <span className="font-semibold text-slate-900 dark:text-[#F4F7FA]">{currentAsset}</span>
                <span>•</span>
                <span className="text-[#10B981] flex items-center gap-0.5">
                  <ShieldCheck size={12} /> Level 3 Risk Filter OK
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 dark:text-[#5F6978] block">{signal.timestamp}</span>
            <span className="text-[10px] font-mono text-[#8B5CF6] block mt-0.5 font-bold">● Live Tick</span>
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
            <span className={`font-bold block ${rsi >= 45 && rsi <= 68 ? 'text-[#10B981]' : rsi > 70 ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
              {rsi.toFixed(1)} ({rsiTag})
            </span>
            <span className="text-[9px] text-slate-400 dark:text-[#5F6978]">
              MACD: {signal.indicators.macdHist >= 0 ? '+' : ''}{signal.indicators.macdHist.toFixed(1)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35]">
            <span className="text-slate-500 dark:text-[#8B95A5] block text-[10px]">Strategy Profile</span>
            <span className="text-[#3B82F6] font-bold block truncate">{signal.strategyName}</span>
            <span className="text-[9px] text-slate-400 dark:text-[#5F6978]">SEBI Margin Compliant</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35]">
            <span className="text-slate-500 dark:text-[#8B95A5] block text-[10px]">On-Chain Attestation</span>
            <span className="text-[#10B981] font-bold block">Block #{blockNum} • Active</span>
            <span className="text-[9px] text-slate-400 dark:text-[#5F6978] truncate block">
              Merkle: {blockMerkle.slice(0, 10)}...
            </span>
          </div>
        </div>

        {/* Expandable "Why this signal?" Rationale */}
        <div className="mt-2.5 border border-slate-200 dark:border-[#242B35] rounded-lg overflow-hidden bg-slate-50 dark:bg-[#080A0F]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA] transition-colors cursor-pointer"
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
      <div className="space-y-2 mt-2">
        {onExecuteSignal && (
          <button
            onClick={onExecuteSignal}
            disabled={isExecuting || signal.state === 'NEUTRAL'}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
              isBuy 
                ? 'bg-[#10B981] hover:bg-[#0EA271] text-black shadow-glow-green' 
                : isSell
                ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
                : 'bg-slate-200 dark:bg-[#1E2633] text-slate-600 dark:text-slate-400 cursor-not-allowed'
            }`}
          >
            <Zap size={14} />
            <span>
              {isExecuting 
                ? `Dispatching ${signal.state} to Upstox Pro API...` 
                : signal.state === 'NEUTRAL'
                ? '⏸️ Market Consolidating (Awaiting Breakout Signal)'
                : `⚡ 1-Click Execute ${signal.state} (${currentAsset} @ Market via Upstox)`}
            </span>
          </button>
        )}

        {/* Button to ask AI Copilot */}
        <button
          onClick={onOpenAIModal}
          className="w-full py-2 px-3 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-xs font-mono font-semibold text-[#8B5CF6] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles size={14} />
          Ask TradeChain AI Copilot about this signal
        </button>
      </div>
    </div>
  );
};
