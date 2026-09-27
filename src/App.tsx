import React, { useState, useEffect } from 'react';
import { NavPage, TradeRecord, ActivePosition, CandlestickData } from './types/trading';
import { 
  INITIAL_CANDLESTICKS, 
  MOCK_TRADES, 
  MOCK_POSITIONS, 
  MOCK_SIGNAL, 
  MOCK_BLOCKS 
} from './lib/mockData';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { CommandPalette } from './components/layout/CommandPalette';
import { TradeDrawer } from './components/layout/TradeDrawer';
import { AIAssistantModal } from './components/layout/AIAssistantModal';
import { LoginModal } from './components/layout/LoginModal';
import { FloatingDraggableAIChat } from './components/layout/FloatingDraggableAIChat';

import { MarketsTerminal } from './components/markets/MarketsTerminal';

// Workspace View Components
import { KPICards } from './components/dashboard/KPICards';
import { TradingChart } from './components/dashboard/TradingChart';
import { SignalPanel } from './components/dashboard/SignalPanel';
import { ActivePositionsTable } from './components/dashboard/ActivePositionsTable';
import { RecentTradesTable } from './components/dashboard/RecentTradesTable';

import { BlockchainOverview } from './components/blockchain/BlockchainOverview';
import { TradeVerificationPage } from './components/verification/TradeVerificationPage';
import { BacktestWorkspace } from './components/backtest/BacktestWorkspace';
import { StrategyLab } from './components/strategies/StrategyLab';
import { RiskManagementCenter } from './components/risk/RiskManagementCenter';
import { PortfolioOverview } from './components/portfolio/PortfolioOverview';
import { SystemHealthPage } from './components/monitoring/SystemHealthPage';
import { AuditLogPage } from './components/audit/AuditLogPage';

import { ShieldCheck } from 'lucide-react';

export function App() {
  const [activePage, setActivePage] = useState<NavPage>('overview');
  const [selectedTrade, setSelectedTrade] = useState<TradeRecord | null>(null);
  const [selectedTradeIdForVerify, setSelectedTradeIdForVerify] = useState<string>('TRD-IN-00104');
  
  // Theme state: dark mode (default) vs light mode
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Live Market Data simulation state (NIFTY 50 Futures default)
  const [niftyPrice, setNiftyPrice] = useState(24850.40);
  const [niftyChange, setNiftyChange] = useState(0.64);
  const [selectedPair, setSelectedPair] = useState('NIFTY 50 Futures');
  const [candles, setCandles] = useState<CandlestickData[]>(INITIAL_CANDLESTICKS);
  const [positions, setPositions] = useState<ActivePosition[]>(MOCK_POSITIONS);

  // Toggle Theme handler
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Market Ticker interval simulation (NSE Ticks)
  useEffect(() => {
    const ticker = setInterval(() => {
      const delta = (Math.random() - 0.48) * 8.5;
      setNiftyPrice(prev => {
        const next = Math.max(22000, prev + delta);
        return Math.round(next * 100) / 100;
      });

      setCandles(prev => {
        if (prev.length === 0) return prev;
        const last = { ...prev[prev.length - 1] };
        last.close = Math.round((last.close + delta * 0.2) * 100) / 100;
        last.high = Math.max(last.high, last.close);
        last.low = Math.min(last.low, last.close);
        return [...prev.slice(0, prev.length - 1), last];
      });
    }, 3000);

    return () => clearInterval(ticker);
  }, []);

  // Close position handler
  const handleClosePosition = (posId: string) => {
    const target = positions.find(p => p.id === posId);
    setPositions(prev => prev.filter(p => p.id !== posId));
    if (target) {
      alert(`Closed position ${target.id} (${target.asset}). Realized P&L: +₹${target.unrealizedPnl.toLocaleString('en-IN')}`);
    }
  };

  // Render view router according to activePage
  const renderWorkspaceContent = () => {
    switch (activePage) {
      case 'markets':
        return (
          <MarketsTerminal
            candles={candles}
            niftyPrice={niftyPrice}
            niftyChange={niftyChange}
            selectedPair={selectedPair}
            onSelectPair={setSelectedPair}
            onOpenVerifyPage={(tradeId) => {
              setSelectedTradeIdForVerify(tradeId);
              setActivePage('verify');
            }}
          />
        );

      case 'overview':
      case 'bot':
        return (
          <div className="space-y-6">
            {/* Overview Header Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#111620] p-5 rounded-xl border border-slate-200 dark:border-[#1E2633] shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold font-mono text-slate-900 dark:text-[#F1F5F9] tracking-tight">
                    Trading Overview — NSE / F&O Desk
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">
                    UPSTOX & GROWW GATEWAY ONLINE
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-sans">
                  Real-time Indian algorithmic trading & cryptographically audited execution monitoring.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono text-xs hidden sm:block">
                  <span className="text-slate-500 dark:text-[#64748B] block text-[10px]">Active Symbol</span>
                  <span className="text-[#3B82F6] font-bold">{selectedPair}</span>
                </div>
                <button
                  onClick={() => setActivePage('verify')}
                  className="btn-3d btn-3d-primary px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-md"
                >
                  <ShieldCheck size={16} />
                  <span>Audit Engine</span>
                </button>
              </div>
            </div>

            {/* 5 KPI Cards */}
            <KPICards
              portfolioValue={117850.42}
              todayPnl={2340.18}
              todayPnlPct={2.04}
              activeTradesCount={positions.length}
              buyCount={2}
              sellCount={1}
              winRate={71.4}
              chainIntegrity={100}
            />

            {/* Main Central Trading Chart + Live Signal Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <TradingChart
                  candles={candles}
                  selectedPair={selectedPair}
                  onSelectPair={setSelectedPair}
                  price={niftyPrice}
                  priceChangePct={niftyChange}
                />
              </div>

              <div>
                <SignalPanel
                  signal={MOCK_SIGNAL}
                  onOpenAIModal={() => setIsAIAssistantOpen(true)}
                />
              </div>
            </div>

            {/* Active Positions Table */}
            <ActivePositionsTable
              positions={positions}
              onSelectPosition={(posId) => {
                const trd = MOCK_TRADES.find(t => t.id === 'TRD-IN-00104');
                if (trd) setSelectedTrade(trd);
              }}
              onClosePosition={handleClosePosition}
            />

            {/* Recent Trades Table */}
            <RecentTradesTable
              trades={MOCK_TRADES}
              onSelectTrade={(trade) => setSelectedTrade(trade)}
              onNavigateToVerify={(tradeId) => {
                setSelectedTradeIdForVerify(tradeId);
                setActivePage('verify');
              }}
            />
          </div>
        );

      case 'blockchain':
      case 'blocks':
      case 'transactions':
        return (
          <BlockchainOverview
            blocks={MOCK_BLOCKS}
            trades={MOCK_TRADES}
            onSelectTrade={(tradeId) => {
              const trd = MOCK_TRADES.find(t => t.id === tradeId) || MOCK_TRADES[0];
              setSelectedTrade(trd);
            }}
            onNavigateToVerify={(tradeId) => {
              setSelectedTradeIdForVerify(tradeId);
              setActivePage('verify');
            }}
          />
        );

      case 'verify':
        return (
          <TradeVerificationPage
            initialTradeId={selectedTradeIdForVerify}
            trades={MOCK_TRADES}
          />
        );

      case 'backtesting':
        return <BacktestWorkspace />;

      case 'strategies':
        return (
          <StrategyLab
            onNavigateToBacktest={(stratName) => {
              setActivePage('backtesting');
            }}
          />
        );

      case 'risk':
        return <RiskManagementCenter />;

      case 'portfolio':
      case 'analytics':
        return <PortfolioOverview />;

      case 'monitoring':
        return <SystemHealthPage />;

      case 'audit':
      case 'settings':
        return <AuditLogPage />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080A0F] text-slate-900 dark:text-[#F1F5F9] flex flex-col font-sans transition-colors">
      <div className="flex-1 flex overflow-hidden">
        
        {/* Persistent Left Sidebar */}
        <Sidebar
          activePage={activePage}
          onSelectPage={(page) => setActivePage(page)}
          isOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-grid-pattern">
          
          {/* Sticky Top Command Header */}
          <TopHeader
            activePage={activePage}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onToggleAIAssistant={() => setIsAIAssistantOpen(true)}
            onToggleLoginModal={() => setIsLoginModalOpen(true)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
            btcPrice={niftyPrice}
            btcChange={niftyChange}
          />

          {/* Dynamic Page Workspace Body */}
          <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto space-y-6">
            {renderWorkspaceContent()}
          </main>
        </div>
      </div>

      {/* Floating Draggable Round AI Chatbot Action Button */}
      <FloatingDraggableAIChat
        onToggleAIAssistant={() => setIsAIAssistantOpen(prev => !prev)}
      />

      {/* Slide-out Trade Detail Drawer */}
      <TradeDrawer
        trade={selectedTrade}
        onClose={() => setSelectedTrade(null)}
        onNavigateToVerify={(tradeId) => {
          setSelectedTradeIdForVerify(tradeId);
          setActivePage('verify');
        }}
        onNavigateToBlock={(blockNum) => {
          setActivePage('blockchain');
        }}
      />

      {/* ⌘K Command Palette Overlay Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectPage={(page) => setActivePage(page)}
        onSelectTrade={(tradeId) => {
          const trd = MOCK_TRADES.find(t => t.id === tradeId) || MOCK_TRADES[0];
          setSelectedTrade(trd);
        }}
      />

      {/* TradeChain AI Assistant Slide-out Panel */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onSelectPage={(page) => setActivePage(page)}
        onSelectTrade={(tradeId) => {
          const trd = MOCK_TRADES.find(t => t.id === tradeId) || MOCK_TRADES[0];
          setSelectedTrade(trd);
        }}
      />

      {/* Institutional Auth Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={() => alert('Authenticated as Sunny Prasad (Admin / Developer)')}
      />
    </div>
  );
}

export default App;
