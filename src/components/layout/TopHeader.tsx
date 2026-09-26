import React, { useState, useEffect } from 'react';
import { NavPage } from '../../types/trading';
import { 
  Search, 
  Bell, 
  Sparkles, 
  Menu, 
  Sun, 
  Moon, 
  Clock, 
  ShieldCheck, 
  Check, 
  X
} from 'lucide-react';

interface TopHeaderProps {
  activePage: NavPage;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
  onToggleAIAssistant: () => void;
  onToggleLoginModal: () => void;
  onToggleMobileSidebar: () => void;
  btcPrice: number;
  btcChange: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activePage,
  theme,
  onToggleTheme,
  onOpenCommandPalette,
  onToggleAIAssistant,
  onToggleLoginModal,
  onToggleMobileSidebar,
  btcPrice,
  btcChange
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setIstTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const pageTitleMap: Record<NavPage, { title: string; category: string }> = {
    overview: { title: 'Trading Overview', category: 'Dashboard' },
    markets: { title: 'Live Markets Terminal', category: 'Trading' },
    bot: { title: 'Algorithmic Bot Control', category: 'Execution' },
    strategies: { title: 'Strategy Lab', category: 'Quant' },
    backtesting: { title: 'Strategy Backtesting', category: 'Quant' },
    portfolio: { title: 'Asset Portfolio', category: 'Capital' },
    risk: { title: 'Risk Management Center', category: 'Guardrails' },
    blockchain: { title: 'Blockchain Ledger', category: 'Verification' },
    transactions: { title: 'Transaction Ledger Explorer', category: 'Explorer' },
    blocks: { title: 'Block Explorer', category: 'Proof' },
    verify: { title: 'Cryptographic Trade Verification', category: 'Audit' },
    analytics: { title: 'Institutional Analytics', category: 'Reports' },
    monitoring: { title: 'System Telemetry & Health', category: 'Infrastructure' },
    audit: { title: 'Enterprise Audit Trail', category: 'Compliance' },
    settings: { title: 'System Configuration', category: 'Admin' }
  };

  const currentMeta = pageTitleMap[activePage] || { title: 'Overview', category: 'Dashboard' };

  return (
    <header className="h-14 bg-white dark:bg-[#0B0E14] border-b border-slate-200 dark:border-[#1E2633] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors">
      {/* Left: Mobile Menu & Page Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-md bg-slate-100 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633] text-slate-700 dark:text-[#94A3B8]"
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-[#64748B]">{currentMeta.category}</span>
          <span className="text-slate-300 dark:text-[#334155]">/</span>
          <span className="font-semibold text-slate-900 dark:text-[#F1F5F9]">{currentMeta.title}</span>
        </div>

        {/* Real-time Ticker Badge in Header */}
        <div className="hidden xl:flex items-center gap-2 ml-4 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] text-xs font-mono">
          <span className="text-slate-500 dark:text-[#64748B]">NIFTY 50</span>
          <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">₹{btcPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <span className={`text-[10px] font-bold ${btcChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Center/Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633] hover:border-[#3B82F6] text-xs font-mono text-slate-600 dark:text-[#94A3B8] transition-all"
        >
          <Search size={14} className="text-[#3B82F6]" />
          <span className="hidden sm:inline">Search trade, hash, block...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono bg-white dark:bg-[#080A0F] text-slate-500 dark:text-[#64748B] border border-slate-200 dark:border-[#1E2633] rounded">
            <span>⌘</span>K
          </kbd>
        </button>

        {/* Realtime IST Clock (Indian Standard Time) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] text-xs font-mono text-slate-800 dark:text-[#F1F5F9] font-bold">
          <Clock size={13} className="text-[#3B82F6]" />
          <span>{istTime || '23:25:47 IST'}</span>
        </div>

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md bg-slate-100 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633] text-amber-500 dark:text-amber-400 hover:border-amber-400 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Connection Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-mono text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
          <span className="font-bold text-[11px]">NSE LIVE</span>
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={onToggleAIAssistant}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs font-mono font-bold text-[#8B5CF6] hover:bg-[#8B5CF6]/25 transition-all"
          title="Open TradeChain AI Copilot"
        >
          <Sparkles size={14} className="text-[#8B5CF6]" />
          <span className="hidden md:inline text-[11px]">Quant Assistant</span>
        </button>

        {/* Notifications Icon with working modal */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-md bg-slate-100 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633] text-slate-700 dark:text-[#94A3B8] relative"
          >
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl shadow-2xl p-4 z-50 font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2633] pb-2 mb-3">
                <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">System Notifications</span>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 dark:text-[#64748B] hover:text-slate-900 dark:hover:text-[#F1F5F9]">
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633]">
                  <div className="flex items-center gap-1 text-[#10B981] font-bold text-[11px]">
                    <ShieldCheck size={12} />
                    <span>Block #4281 Finalized</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] mt-1">
                    24 trade transactions cryptographically verified on-chain.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633]">
                  <div className="flex items-center gap-1 text-[#3B82F6] font-bold text-[11px]">
                    <Check size={12} />
                    <span>Trade TRD-IN-00104 Executed</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] mt-1">
                    BUY 50 Qty NIFTY @ ₹24,850.40 approved by Upstox Gateway.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Auth / Profile Button - Opens Login Modal */}
        <button
          onClick={onToggleLoginModal}
          className="flex items-center gap-1.5 p-1 rounded-md bg-slate-100 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633] hover:border-[#3B82F6] transition-colors"
          title="Open Authentication & Login"
        >
          <div className="w-6 h-6 rounded bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-mono font-bold">
            SP
          </div>
          <span className="hidden lg:inline text-xs font-medium font-mono text-slate-900 dark:text-[#F1F5F9] pr-1">Sunny</span>
        </button>
      </div>
    </header>
  );
};
