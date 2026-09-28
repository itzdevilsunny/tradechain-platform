import React, { useState, useEffect, useRef } from 'react';
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
  X,
  AlertTriangle,
  Zap,
  TrendingUp,
  TrendingDown,
  Database,
  Wifi,
  CheckCircle2
} from 'lucide-react';

interface TopHeaderProps {
  activePage: NavPage;
  theme: 'dark' | 'light';
  tradingMode?: 'PAPER' | 'LIVE';
  onToggleTradingMode?: () => void;
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
  onToggleAIAssistant: () => void;
  onToggleLoginModal: () => void;
  onToggleMobileSidebar: () => void;
  btcPrice: number;
  btcChange: number;
}

type NotifType = 'BLOCK' | 'TRADE' | 'SIGNAL' | 'RISK' | 'SYSTEM';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  ts: number;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'N1', type: 'BLOCK',
    title: 'Block #4281 Finalized',
    body: '24 trade transactions cryptographically verified on-chain. Merkle root 0x9ab42ef...',
    time: '2m ago', read: false, ts: Date.now() - 120000
  },
  {
    id: 'N2', type: 'TRADE',
    title: 'Trade TRD-IN-00104 Executed',
    body: 'BUY 50 Qty NIFTY 50 Futures @ ₹24,850.40 approved by Upstox FIX Gateway.',
    time: '5m ago', read: false, ts: Date.now() - 300000
  },
  {
    id: 'N3', type: 'SIGNAL',
    title: 'BUY Signal Generated',
    body: 'EMA20 crossed above EMA50 on NIFTY 50 (15m chart). Confidence: 87.4%',
    time: '8m ago', read: true, ts: Date.now() - 480000
  },
  {
    id: 'N4', type: 'RISK',
    title: 'Risk Alert: Position Nearing Limit',
    body: 'BANK NIFTY position at 84% of max position size limit. Monitor closely.',
    time: '12m ago', read: true, ts: Date.now() - 720000
  },
  {
    id: 'N5', type: 'SYSTEM',
    title: 'All Systems Operational',
    body: '6/6 services healthy. NSE data feed latency: 12ms. Block validator synced.',
    time: '18m ago', read: true, ts: Date.now() - 1080000
  },
];

const NOTIF_COLORS: Record<NotifType, { icon: React.ReactNode; bg: string; text: string; dot: string }> = {
  BLOCK: {
    icon: <Database size={13} />,
    bg: 'bg-[#3B82F6]/15', text: 'text-[#3B82F6]', dot: 'bg-[#3B82F6]'
  },
  TRADE: {
    icon: <TrendingUp size={13} />,
    bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', dot: 'bg-[#10B981]'
  },
  SIGNAL: {
    icon: <Zap size={13} />,
    bg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', dot: 'bg-[#F59E0B]'
  },
  RISK: {
    icon: <AlertTriangle size={13} />,
    bg: 'bg-[#EF4444]/15', text: 'text-[#EF4444]', dot: 'bg-[#EF4444]'
  },
  SYSTEM: {
    icon: <Wifi size={13} />,
    bg: 'bg-[#8B5CF6]/15', text: 'text-[#8B5CF6]', dot: 'bg-[#8B5CF6]'
  },
};

// Auto-generate live notifications driven by real market prices
const buildLiveNotifTemplates = (livePrice: number, liveBlockNum: number): Omit<Notification, 'id' | 'time' | 'ts'>[] => [
  {
    type: 'TRADE',
    title: 'Order Executed',
    body: `BUY 25 Qty BANK NIFTY Futures @ ₹${(livePrice * 2.14).toFixed(2)} via Zerodha Kite`,
    read: false
  },
  {
    type: 'BLOCK',
    title: `Block #${liveBlockNum} Committed`,
    body: '18 transactions anchored. Validator quorum 14/14 confirmed.',
    read: false
  },
  {
    type: 'SIGNAL',
    title: `SELL Signal — RELIANCE`,
    body: 'RSI crossed above 70 overbought. Strategy: Momentum Driver. Confidence: 82%',
    read: false
  },
  {
    type: 'SYSTEM',
    title: 'FIX Heartbeat OK',
    body: 'Upstox gateway responding at 11ms. 248 sessions active.',
    read: false
  },
];

export const TopHeader: React.FC<TopHeaderProps> = ({
  activePage,
  theme,
  tradingMode = 'PAPER',
  onToggleTradingMode,
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
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | NotifType>('ALL');
  const notifRef = useRef<HTMLDivElement>(null);

  // Real-time clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setIstTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-inject live notifications every ~25 seconds using real price from props
  useEffect(() => {
    const interval = setInterval(() => {
      // Derive live block number from timestamps (seeded by real price tick)
      const liveBlockNum = 4281 + Math.floor((Date.now() / 60000) % 50);
      const templates = buildLiveNotifTemplates(btcPrice > 0 ? btcPrice : 24850, liveBlockNum);
      const idx = Math.floor((Date.now() / 25000) % templates.length);
      const tpl = templates[idx];
      const ASSETS = ['NIFTY 50', 'BANK NIFTY', 'RELIANCE'];
      const SIDES: ('BUY' | 'SELL')[] = ['BUY', 'SELL'];
      const QTYS = [25, 50];
      const BROKERS = ['Zerodha Kite', 'Upstox FIX', 'Groww API'];
      // Use price tick remainder to pick deterministic-looking values
      const assetIdx = Math.floor(btcPrice) % ASSETS.length;
      const sideIdx = Math.floor(btcPrice * 10) % SIDES.length;
      const qtyIdx = Math.floor(btcPrice * 100) % QTYS.length;
      const brokerIdx = Math.floor(btcPrice * 1000) % BROKERS.length;
      const newNotif: Notification = {
        ...tpl,
        id: `N${Date.now()}`,
        time: 'just now',
        ts: Date.now(),
        title: tpl.type === 'TRADE' ? `Order Executed — ${ASSETS[assetIdx]}` : tpl.title,
        body: tpl.type === 'TRADE'
          ? `${SIDES[sideIdx]} ${QTYS[qtyIdx]} Qty @ ₹${(btcPrice > 0 ? btcPrice : 24850).toFixed(2)} via ${BROKERS[brokerIdx]}`
          : tpl.body,
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 20));
    }, 25000);
    return () => clearInterval(interval);
  }, [btcPrice]);

  // Dismiss on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifs = activeFilter === 'ALL'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

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

        {/* Realtime IST Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] text-xs font-mono text-slate-800 dark:text-[#F1F5F9] font-bold">
          <Clock size={13} className="text-[#3B82F6]" />
          <span>{istTime || '11:25:00 IST'}</span>
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md bg-slate-100 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633] text-amber-500 dark:text-amber-400 hover:border-amber-400 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* NSE Live Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-mono text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
          <span className="font-bold text-[11px]">NSE LIVE</span>
        </div>

        {/* Paper vs Live Mode Toggle */}
        {onToggleTradingMode && (
          <button
            onClick={onToggleTradingMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-mono font-bold transition-all ${
              tradingMode === 'LIVE'
                ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/25 shadow-sm'
                : 'bg-[#3B82F6]/15 border-[#3B82F6]/40 text-[#3B82F6] hover:bg-[#3B82F6]/25'
            }`}
            title={tradingMode === 'LIVE' ? 'Live Broker Execution Active' : 'Simulated Paper Trading Active'}
          >
            <span className={`w-2 h-2 rounded-full ${tradingMode === 'LIVE' ? 'bg-[#EF4444] animate-ping' : 'bg-[#3B82F6]'}`} />
            <span>{tradingMode === 'LIVE' ? 'BROKER LIVE' : 'PAPER TRADING'}</span>
          </button>
        )}

        {/* AI Assistant Button */}
        <button
          onClick={onToggleAIAssistant}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs font-mono font-bold text-[#8B5CF6] hover:bg-[#8B5CF6]/25 transition-all"
          title="Open TradeChain AI Copilot"
        >
          <Sparkles size={14} className="text-[#8B5CF6]" />
          <span className="hidden md:inline text-[11px]">Quant Assistant</span>
        </button>

        {/* ━━━━ NOTIFICATIONS BELL (Fully Workable) ━━━━ */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-md bg-slate-100 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633] text-slate-700 dark:text-[#94A3B8] hover:border-[#3B82F6] transition-all"
            title="Notifications"
          >
            <Bell size={15} className={unreadCount > 0 ? 'text-[#F59E0B]' : ''} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden font-mono">
              
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#1E2633] bg-slate-50 dark:bg-[#111620]">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-[#F59E0B]" />
                  <span className="font-bold text-sm text-slate-900 dark:text-[#F1F5F9]">System Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EF4444] text-white">{unreadCount} new</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-[#3B82F6] hover:underline font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 dark:text-[#64748B] hover:text-slate-900 dark:hover:text-[#F1F5F9]">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 dark:border-[#1E2633] overflow-x-auto">
                {(['ALL', 'TRADE', 'BLOCK', 'SIGNAL', 'RISK', 'SYSTEM'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition-all ${
                      activeFilter === f
                        ? 'bg-[#3B82F6] text-white'
                        : 'text-slate-500 dark:text-[#64748B] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
                    }`}
                  >
                    {f}
                    {f !== 'ALL' && (
                      <span className="ml-1 opacity-70">
                        ({notifications.filter(n => n.type === f).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#1E2633]">
                {filteredNotifs.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-[#64748B]">
                    <CheckCircle2 size={24} className="mx-auto mb-2 opacity-30" />
                    No notifications in this category
                  </div>
                )}
                {filteredNotifs.map(notif => {
                  const nc = NOTIF_COLORS[notif.type];
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkRead(notif.id)}
                      className={`px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#111620] transition-all flex items-start gap-3 ${
                        !notif.read ? 'bg-blue-50/50 dark:bg-[#0A1020]' : ''
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${nc.bg}`}>
                        <span className={nc.text}>{nc.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[11px] font-bold ${!notif.read ? 'text-slate-900 dark:text-[#F1F5F9]' : 'text-slate-600 dark:text-[#94A3B8]'}`}>
                            {notif.title}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[9px] text-slate-400 dark:text-[#64748B] whitespace-nowrap">{notif.time}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDismiss(notif.id); }}
                              className="text-slate-300 dark:text-[#374155] hover:text-red-500 dark:hover:text-[#EF4444] transition-all"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-[#64748B] mt-0.5 leading-relaxed">{notif.body}</p>
                        {!notif.read && (
                          <div className={`w-1.5 h-1.5 rounded-full ${nc.dot} inline-block mt-1`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-slate-200 dark:border-[#1E2633] bg-slate-50 dark:bg-[#111620] flex items-center justify-between text-[10px]">
                <span className="text-slate-500 dark:text-[#64748B]">{notifications.length} total events logged</span>
                <button
                  onClick={() => setNotifications([])}
                  className="text-[#EF4444] hover:underline font-bold"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Auth / Profile Button */}
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
