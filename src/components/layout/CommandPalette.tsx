import React, { useState, useEffect, useRef } from 'react';
import { NavPage } from '../../types/trading';
import { 
  Search, 
  LayoutDashboard, 
  TrendingUp, 
  Bot, 
  Layers, 
  Activity, 
  PieChart, 
  ShieldCheck, 
  Blocks, 
  Receipt, 
  Box, 
  CheckCircle2, 
  Server, 
  FileText, 
  Settings, 
  ArrowRight,
  Hash,
  X
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: NavPage) => void;
  onSelectTrade: (tradeId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectPage,
  onSelectTrade
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    { type: 'page', id: 'overview', title: 'Go to Overview Dashboard', category: 'Navigation', icon: <LayoutDashboard size={16} /> },
    { type: 'page', id: 'markets', title: 'Open Live Markets Terminal', category: 'Navigation', icon: <TrendingUp size={16} /> },
    { type: 'page', id: 'bot', title: 'Control Algorithmic Trading Bot', category: 'Execution', icon: <Bot size={16} /> },
    { type: 'page', id: 'backtesting', title: 'Run Quantitative Backtest', category: 'Quant', icon: <Activity size={16} /> },
    { type: 'page', id: 'verify', title: 'Verify Cryptographic Trade Record', category: 'Audit', icon: <CheckCircle2 size={16} /> },
    { type: 'page', id: 'blockchain', title: 'Open Blockchain Ledger', category: 'Explorer', icon: <Blocks size={16} /> },
    { type: 'page', id: 'risk', title: 'Open Risk Management Center', category: 'Guardrails', icon: <ShieldCheck size={16} /> },
    { type: 'page', id: 'monitoring', title: 'Inspect System Infrastructure Telemetry', category: 'System', icon: <Server size={16} /> },
    { type: 'trade', id: 'TRD-00041', title: 'Inspect Trade TRD-00041 (BTC/USDT BUY 0.025 @ 10,42,500)', category: 'Trade Record', icon: <Hash size={16} /> },
    { type: 'trade', id: 'TRD-00040', title: 'Inspect Trade TRD-00040 (ETH/USDT SELL 0.40 @ 2,81,950)', category: 'Trade Record', icon: <Hash size={16} /> },
    { type: 'block', id: '4281', title: 'Inspect Consensus Block #4281 (24 TXs - Merkle Root 9ab42...)', category: 'Blockchain', icon: <Box size={16} /> }
  ];

  const filtered = commands.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase()) ||
    cmd.id.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: typeof commands[0]) => {
    if (item.type === 'page') {
      onSelectPage(item.id as NavPage);
    } else if (item.type === 'trade') {
      onSelectTrade(item.id);
    } else if (item.type === 'block') {
      onSelectPage('blocks');
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
      <div 
        className="w-full max-w-2xl bg-[#0D1117] border border-[#242B35] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="p-3 border-b border-[#242B35] flex items-center gap-3">
          <Search size={18} className="text-[#3B82F6]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, trade ID, or block hash..."
            className="w-full bg-transparent text-sm text-[#F4F7FA] placeholder-[#5F6978] outline-none font-mono"
          />
          <button onClick={onClose} className="p-1 rounded text-[#5F6978] hover:text-[#F4F7FA]">
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#5F6978]">
              No command or ledger record matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id + idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-all text-left
                    ${isSelected 
                      ? 'bg-[#151B23] text-[#F4F7FA] border border-[#242B35]' 
                      : 'text-[#8B95A5] hover:bg-[#11161D]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSelected ? 'text-[#3B82F6]' : 'text-[#5F6978]'}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-[#11161D] text-[#5F6978] border border-[#242B35] rounded">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={14} className="text-[#3B82F6]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#242B35] bg-[#080A0F] flex items-center justify-between text-[11px] font-mono text-[#5F6978]">
          <div className="flex items-center gap-4">
            <span><kbd className="px-1 bg-[#151B23] border border-[#242B35] rounded text-[10px]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 bg-[#151B23] border border-[#242B35] rounded text-[10px]">↵</kbd> Select</span>
            <span><kbd className="px-1 bg-[#151B23] border border-[#242B35] rounded text-[10px]">ESC</kbd> Close</span>
          </div>
          <span>TradeChain Cryptographic Palette</span>
        </div>
      </div>
    </div>
  );
};
