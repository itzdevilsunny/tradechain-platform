import React, { useState } from 'react';
import { askTradeChainAI, getActiveGroqKey, setActiveGroqKey, testGroqConnection } from '../../lib/ai';
import { NavPage } from '../../types/trading';
import { 
  Sparkles, 
  X, 
  Send, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  Loader2,
  Key,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: NavPage) => void;
  onSelectTrade: (tradeId: string) => void;
  marketContext?: any;
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
  onSelectTrade,
  marketContext
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'TradeChain Quant AI Assistant active. Powered by live Groq (GPT-OSS-120B / Qwen 3.8) with real-time NIFTY/BANKNIFTY telemetric feeds and SEBI risk compliance. How can I assist your desk?',
      timestamp: '10:15:30 IST'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [groqKeyInput, setGroqKeyInput] = useState(() => getActiveGroqKey());
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    setActiveGroqKey(groqKeyInput);
    try {
      const res = await testGroqConnection(groqKeyInput);
      if (res.success) {
        setTestResult(`Connected: ${res.model}`);
      } else {
        setTestResult(`Error: ${res.message}`);
      }
    } finally {
      setIsTestingKey(false);
    }
  };

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
      const response = await askTradeChainAI(textToSend, marketContext);
      
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
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `TradeChain Quant AI: Request failed (${e.message}). Please verify your Groq connection in settings.`,
          timestamp: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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
                <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#10B981]/20 text-[#10B981] rounded border border-[#10B981]/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  GROQ LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8B95A5]">GPT-OSS-120B & Qwen 3.8 · NSE / BSE Quant Copilot</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowKeyConfig(prev => !prev)}
              title="Groq API Key Config"
              className={`p-1.5 rounded-lg border text-xs transition-all ${
                showKeyConfig 
                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#8B5CF6]' 
                  : 'bg-slate-200 dark:bg-[#151B23] border-slate-300 dark:border-[#242B35] text-slate-600 dark:text-[#8B95A5] hover:text-[#8B5CF6]'
              }`}
            >
              <Key size={15} />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-[#151B23] border border-slate-300 dark:border-[#242B35] text-slate-600 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* In-Modal Groq Key Manager Drawer */}
        {showKeyConfig && (
          <div className="p-3.5 bg-slate-100 dark:bg-[#0A0D13] border-b border-slate-200 dark:border-[#242B35] space-y-2 text-xs font-mono animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-[#F4F7FA] text-[11px] flex items-center gap-1.5">
                <Key size={13} className="text-[#8B5CF6]" />
                <span>Active Groq API Key Configuration</span>
              </span>
              {testResult && (
                <span className={`text-[10px] font-bold ${testResult.startsWith('Connected') ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {testResult}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={groqKeyInput}
                onChange={(e) => setGroqKeyInput(e.target.value)}
                placeholder="gsk_..."
                className="flex-1 bg-white dark:bg-[#11161D] border border-slate-300 dark:border-[#242B35] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#F4F7FA] outline-none focus:border-[#8B5CF6]"
              />
              <button
                onClick={handleTestKey}
                disabled={isTestingKey}
                className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[11px] font-bold disabled:opacity-50 flex items-center gap-1"
              >
                {isTestingKey ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                <span>{isTestingKey ? 'Testing...' : 'Save & Test'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-[#64748B]">
              Key is stored securely in local browser storage and used for direct high-speed Groq inference.
            </p>
          </div>
        )}

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
