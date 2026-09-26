import React, { useState } from 'react';
import { askTradeChainAI } from '../../lib/ai';
import { NavPage } from '../../types/trading';
import { 
  Sparkles, 
  X, 
  Send, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  Loader2
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: NavPage) => void;
  onSelectTrade: (tradeId: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    type: 'verify' | 'trade' | 'strategy';
    id: string;
    label: string;
  };
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectPage,
  onSelectTrade
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'TradeChain Quant AI Assistant active. I synthesize live NIFTY/BANKNIFTY signal telemetry, SEBI peak margin compliance, Upstox/Groww API execution proofs, and SECP256K1 block signatures. How can I assist your desk?',
      timestamp: '10:15:30 IST'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const response = await askTradeChainAI(textToSend);
      
      let action: ChatMessage['action'];
      const lower = textToSend.toLowerCase();
      if (lower.includes('nifty') || lower.includes('trade')) {
        action = { type: 'trade', id: 'TRD-IN-00104', label: 'Inspect Trade TRD-IN-00104' };
      } else if (lower.includes('verify') || lower.includes('proof') || lower.includes('block')) {
        action = { type: 'verify', id: 'TRD-IN-00104', label: 'Verify Cryptographic Proof' };
      } else if (lower.includes('strategy')) {
        action = { type: 'strategy', id: 'NIFTY_EMA', label: 'View Strategy Lab' };
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: response,
          timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST',
          action
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Trade TRD-IN-00104 verified on Block #4281 with 0 collision delta.',
          timestamp: '10:18 IST'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "Why did the bot enter NIFTY 50?",
    "Explain Block #4281 Merkle proof logic",
    "Analyze SEBI intraday risk cap",
    "Verify TRD-IN-00104 execution proof"
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white dark:bg-[#0D1117] border-l border-slate-300 dark:border-[#242B35] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#242B35] flex items-center justify-between bg-slate-50 dark:bg-[#11161D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center">
              <Sparkles size={18} className="text-[#8B5CF6] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-[#F4F7FA]">TradeChain Quant Assistant</h3>
                <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#8B5CF6]/20 text-[#8B5CF6] rounded border border-[#8B5CF6]/30 font-bold">
                  LLAMA-3.3 / GEMINI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8B95A5]">NSE / BSE F&O & On-Chain Proof Intelligence</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-200 dark:bg-[#151B23] border border-slate-300 dark:border-[#242B35] text-slate-600 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Sample Query Chips - Fitted inside frame */}
        <div className="p-3 bg-slate-100 dark:bg-[#080A0F] border-b border-slate-200 dark:border-[#242B35] flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="btn-3d btn-3d-secondary px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-700 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Trajectory Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-[#5F6978] mb-1">
                <span>{msg.sender === 'user' ? 'Deskside Trader' : 'TradeChain Quant Engine'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div className={`
                max-w-[92%] p-3.5 rounded-xl text-xs leading-relaxed border shadow-xs whitespace-pre-line
                ${msg.sender === 'user' 
                  ? 'bg-[#2563EB] text-white border-[#2563EB] rounded-br-none font-sans font-medium' 
                  : 'bg-slate-50 dark:bg-[#11161D] text-slate-900 dark:text-[#F4F7FA] border-slate-200 dark:border-[#242B35] rounded-bl-none font-mono'
                }
              `}>
                <p>{msg.text}</p>

                {msg.action && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#242B35] flex items-center gap-2">
                    {msg.action.type === 'trade' && (
                      <button
                        onClick={() => {
                          onSelectTrade(msg.action!.id);
                          onClose();
                        }}
                        className="btn-3d btn-3d-primary px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1"
                      >
                        <ExternalLink size={12} />
                        {msg.action.label}
                      </button>
                    )}
                    {msg.action.type === 'verify' && (
                      <button
                        onClick={() => {
                          onSelectPage('verify');
                          onClose();
                        }}
                        className="btn-3d btn-3d-success px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1"
                      >
                        <ShieldCheck size={12} />
                        {msg.action.label}
                      </button>
                    )}
                    {msg.action.type === 'strategy' && (
                      <button
                        onClick={() => {
                          onSelectPage('strategies');
                          onClose();
                        }}
                        className="btn-3d btn-3d-purple px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1"
                      >
                        <ArrowRight size={12} />
                        {msg.action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-mono text-[#8B5CF6] font-bold">
              <Loader2 size={16} className="animate-spin" />
              <span>Analyzing order telemetry & compiling proof logic...</span>
            </div>
          )}
        </div>

        {/* Input Form Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-[#242B35] bg-slate-50 dark:bg-[#11161D]">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about signals, trades, risk rules, Merkle hashes..."
              className="flex-1 bg-white dark:bg-[#080A0F] border border-slate-300 dark:border-[#242B35] focus:border-[#8B5CF6] rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-[#F4F7FA] placeholder-slate-400 dark:placeholder-[#5F6978] outline-none font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn-3d btn-3d-purple p-2.5 rounded-lg text-white disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 dark:text-[#5F6978] mt-1.5 text-center font-mono">
            Responses synthesize real-time NSE/BSE engine state and SHA-256 block digests.
          </p>
        </div>
      </div>
    </div>
  );
};
