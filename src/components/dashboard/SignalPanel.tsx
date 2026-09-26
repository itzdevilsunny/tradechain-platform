import React, { useState } from 'react';
import { AISignalData } from '../../types/trading';
import { 
  Bot, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';

interface SignalPanelProps {
  signal: AISignalData;
  onOpenAIModal: () => void;
}

export const SignalPanel: React.FC<SignalPanelProps> = ({ signal, onOpenAIModal }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-4 shadow-fintech h-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242B35] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center">
              <Bot size={16} className="text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider">
                AI / Strategy Telemetry
              </h3>
              <p className="text-[10px] text-[#8B95A5]">Deterministic Execution Signal</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 rounded">
            ACTIVE ALGO
          </span>
        </div>

        {/* Large Signal State */}
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center shadow-glow-green">
              <TrendingUp size={24} className="text-[#10B981]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-mono text-[#10B981] tracking-tight">
                  BUY SIGNAL
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981] text-black rounded">
                  87% CONFIDENCE
                </span>
              </div>
              <p className="text-xs font-mono text-[#8B95A5] mt-0.5">
                Deterministic Bot Execution • Level 3 Risk Filter OK
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#5F6978]">{signal.timestamp}</span>
        </div>

        {/* Indicator Telemetry Matrix */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
          <div className="p-2.5 rounded-lg bg-[#151B23] border border-[#242B35]">
            <span className="text-[#8B95A5] block text-[10px]">EMA Cross (20/50)</span>
            <span className="text-[#F4F7FA] font-bold">Bullish Divergence (+270)</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#151B23] border border-[#242B35]">
            <span className="text-[#8B95A5] block text-[10px]">RSI (14 Period)</span>
            <span className="text-[#10B981] font-bold">57.4 (Entry Channel)</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#151B23] border border-[#242B35]">
            <span className="text-[#8B95A5] block text-[10px]">Strategy Profile</span>
            <span className="text-[#3B82F6] font-bold">{signal.strategyName} {signal.strategyVersion}</span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#151B23] border border-[#242B35]">
            <span className="text-[#8B95A5] block text-[10px]">Block Validity</span>
            <span className="text-[#10B981] font-bold">0 Drift • Invariant</span>
          </div>
        </div>

        {/* Expandable "Why this signal?" Rationale */}
        <div className="mt-3 border border-[#242B35] rounded-lg overflow-hidden bg-[#080A0F]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-mono text-[#8B95A5] hover:text-[#F4F7FA] transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Info size={14} className="text-[#3B82F6]" />
              <span className="font-semibold text-[#F4F7FA]">Automated Rationale & Risk Guardrails</span>
            </div>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {isExpanded && (
            <div className="px-3 pb-3 pt-1 text-xs font-mono text-[#8B95A5] space-y-2 border-t border-[#1E2631]">
              <p className="leading-relaxed text-[#F4F7FA]">
                "{signal.rationale}"
              </p>
              <div className="p-2 rounded bg-[#11161D] border border-[#242B35] text-[10px] text-[#5F6978]">
                Disclaimer: Signal generated strictly via rule-based quantitative indicators bound to strategy hash {signal.strategyHash.slice(0, 14)}... Not financial advice.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Button to ask AI Copilot */}
      <button
        onClick={onOpenAIModal}
        className="w-full mt-4 py-2 px-3 rounded-lg bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/40 text-xs font-mono font-semibold text-[#8B5CF6] flex items-center justify-center gap-2 transition-all"
      >
        <Sparkles size={14} />
        Ask TradeChain AI Copilot about this signal
      </button>
    </div>
  );
};
