import React, { useState, useEffect } from 'react';
import { NavPage, TradeRecord, ActivePosition, BlockHeader, CandlestickData } from './types/trading';
import { 
  INITIAL_CANDLESTICKS, 
  MOCK_TRADES, 
  MOCK_POSITIONS, 
  MOCK_SIGNAL, 
  MOCK_BLOCKS,
  generateAssetCandles
} from './lib/mockData';
import { 
  fetchTradesFromDB, 
  fetchPositionsFromDB, 
  fetchBlocksFromDB, 
  saveTradeToDB, 
  savePositionToDB, 
  deletePositionFromDB, 
  saveBlockToDB, 
  recordAuditLog 
} from './lib/supabase';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { CommandPalette } from './components/layout/CommandPalette';
import { TradeDrawer } from './components/layout/TradeDrawer';
import { AIAssistantModal } from './components/layout/AIAssistantModal';
import { LoginModal } from './components/layout/LoginModal';
import { FloatingDraggableAIChat } from './components/layout/FloatingDraggableAIChat';

import { MarketsTerminal } from './components/markets/MarketsTerminal';
import { TradingBotControl } from './components/bot/TradingBotControl';

// Workspace View Components
import { OverviewDesk } from './components/dashboard/OverviewDesk';
import { KPICards } from './components/dashboard/KPICards';
import { TradingChart } from './components/dashboard/TradingChart';
import { SignalPanel } from './components/dashboard/SignalPanel';
import { ActivePositionsTable } from './components/dashboard/ActivePositionsTable';
import { RecentTradesTable } from './components/dashboard/RecentTradesTable';

import { BlockchainOverview } from './components/blockchain/BlockchainOverview';
import { TransactionExplorer } from './components/blockchain/TransactionExplorer';
import { BlockExplorer } from './components/blockchain/BlockExplorer';
import { TradeVerificationPage } from './components/verification/TradeVerificationPage';
import { BacktestWorkspace } from './components/backtest/BacktestWorkspace';
import { StrategyLab } from './components/strategies/StrategyLab';
import { RiskManagementCenter } from './components/risk/RiskManagementCenter';
import { PortfolioOverview } from './components/portfolio/PortfolioOverview';
import { SystemHealthPage } from './components/monitoring/SystemHealthPage';
import { AuditLogPage } from './components/audit/AuditLogPage';
import { SettingsPage } from './components/settings/SettingsPage';

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
  const [positions, setPositions] = useState<ActivePosition[]>(() => {
    try {
      const saved = localStorage.getItem('tradechain_positions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load positions from localStorage', e);
    }
    return MOCK_POSITIONS;
  });

  const [trades, setTrades] = useState<TradeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('tradechain_trades');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load trades from localStorage', e);
    }
    return MOCK_TRADES;
  });

  const [blocks, setBlocks] = useState<BlockHeader[]>(() => {
    try {
      const saved = localStorage.getItem('tradechain_blocks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load blocks from localStorage', e);
    }
    return MOCK_BLOCKS;
  });

  // Sync state mutations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tradechain_positions', JSON.stringify(positions));
    } catch {}
  }, [positions]);

  useEffect(() => {
    try {
      localStorage.setItem('tradechain_trades', JSON.stringify(trades));
    } catch {}
  }, [trades]);

  useEffect(() => {
    try {
      localStorage.setItem('tradechain_blocks', JSON.stringify(blocks));
    } catch {}
  }, [blocks]);

  // Dynamic asset candle and price generator when selectedPair switches
  useEffect(() => {
    let basePrice = 24850.40;
    let changePct = 0.64;

    if (selectedPair.includes('BANK NIFTY') || selectedPair.includes('BANKNIFTY')) {
      basePrice = 51340.25;
      changePct = 0.82;
    } else if (selectedPair.includes('FIN NIFTY') || selectedPair.includes('FINNIFTY')) {
      basePrice = 23115.80;
      changePct = 0.45;
    } else if (selectedPair.includes('SENSEX')) {
      basePrice = 81480.10;
      changePct = 0.61;
    } else if (selectedPair.includes('RELIANCE')) {
      basePrice = 3042.80;
      changePct = 0.85;
    } else if (selectedPair.includes('TCS')) {
      basePrice = 4290.50;
      changePct = -0.32;
    } else if (selectedPair.includes('BTC')) {
      basePrice = 5785400.00;
      changePct = 2.85;
    } else if (selectedPair.includes('24800 CE')) {
      basePrice = 168.20;
      changePct = 18.04;
    } else if (selectedPair.includes('51500 PE')) {
      basePrice = 312.40;
      changePct = 9.61;
    }

    setNiftyPrice(basePrice);
    setNiftyChange(changePct);
    setCandles(generateAssetCandles(selectedPair, basePrice));
  }, [selectedPair]);

  // Initial fetch & synchronization from Supabase database
  const refreshSupabaseData = async () => {
    try {
      const [dbPositions, dbTrades, dbBlocks] = await Promise.all([
        fetchPositionsFromDB(),
        fetchTradesFromDB(),
        fetchBlocksFromDB()
      ]);
      if (dbPositions && dbPositions.length > 0) setPositions(dbPositions);
      if (dbTrades && dbTrades.length > 0) setTrades(dbTrades);
      if (dbBlocks && dbBlocks.length > 0) setBlocks(dbBlocks);
    } catch (err) {
      console.warn('Supabase fetch gracefully falling back to local cache.', err);
    }
  };

  useEffect(() => {
    refreshSupabaseData();
  }, []);

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

      // Update positions unrealized PnL based on live tick
      setPositions(prev => prev.map(p => {
        const pnl = p.side === 'BUY' 
          ? Math.round((niftyPrice - p.entryPrice) * p.quantity * 100) / 100
          : Math.round((p.entryPrice - niftyPrice) * p.quantity * 100) / 100;
        const pnlPct = Math.round((pnl / (p.entryPrice * p.quantity)) * 10000) / 100;
        return { ...p, currentPrice: niftyPrice, unrealizedPnl: pnl, unrealizedPnlPercent: pnlPct };
      }));
    }, 3000);

    return () => clearInterval(ticker);
  }, [niftyPrice]);

  // Order Execution Handler across platform
  const handleExecuteOrder = (order: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'SL-M';
    qty: number;
    price: number;
    broker: string;
  }) => {
    const newTradeId = `TRD-IN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
    const totalVal = Math.round(order.price * order.qty * 100) / 100;

    const newPosition: ActivePosition = {
      id: `POS-${Math.floor(100 + Math.random() * 900)}`,
      asset: order.symbol,
      side: order.side,
      entryPrice: order.price,
      currentPrice: order.price,
      quantity: order.qty,
      totalValue: totalVal,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      stopLoss: order.side === 'BUY' ? Math.round(order.price * 0.985 * 100) / 100 : Math.round(order.price * 1.015 * 100) / 100,
      takeProfit: order.side === 'BUY' ? Math.round(order.price * 1.03 * 100) / 100 : Math.round(order.price * 0.97 * 100) / 100,
      openedAt: timeStr
    };
    setPositions(prev => [newPosition, ...prev]);

    const newTradeRecord: TradeRecord = {
      id: newTradeId,
      asset: order.symbol,
      strategy: `${order.broker} FIX Route`,
      side: order.side,
      price: order.price,
      quantity: order.qty,
      totalValue: totalVal,
      pnl: 0,
      pnlPercentage: 0,
      stopLoss: newPosition.stopLoss,
      takeProfit: newPosition.takeProfit,
      status: 'ACTIVE',
      timestamp: timeStr,
      txHash: txHash,
      blockNumber: 4282,
      blockHash: '0x8f2a391eb4d02a01',
      merkleRoot: `0x${Math.random().toString(16).substring(2, 14)}`,
      digitalSignature: `0xsig${Math.random().toString(16).substring(2, 12)}`,
      isVerified: true
    };
    setTrades(prev => [newTradeRecord, ...prev]);

    const newBlock: BlockHeader = {
      blockNumber: 4282,
      blockHash: txHash,
      previousHash: '0x8f2a391eb4d02a01',
      timestamp: timeStr,
      txCount: 25,
      merkleRoot: `0x${Math.random().toString(16).substring(2, 14)}`,
      validator: 'TradeChain NSE Node #1',
      nonce: 104928,
      status: 'VALID',
      trades: [newTradeRecord]
    };
    setBlocks(prev => [newBlock, ...prev.slice(0, 9)]);

    // Persist to Supabase PostgreSQL database
    savePositionToDB(newPosition);
    saveTradeToDB(newTradeRecord);
    saveBlockToDB(newBlock);
    recordAuditLog(
      order.broker,
      'TRADE_CREATED',
      `${newTradeRecord.id} (${newTradeRecord.asset})`,
      txHash,
      { qty: order.qty, price: order.price, side: order.side }
    );
  };

  // Close position handler
  const handleClosePosition = (posId: string) => {
    const target = positions.find(p => p.id === posId);
    setPositions(prev => prev.filter(p => p.id !== posId));
    deletePositionFromDB(posId);
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
            onExecuteOrder={handleExecuteOrder}
            onOpenVerifyPage={(tradeId) => {
              setSelectedTradeIdForVerify(tradeId);
              setActivePage('verify');
            }}
          />
        );

      case 'bot':
        return (
          <TradingBotControl
            niftyPrice={niftyPrice}
            niftyChange={niftyChange}
            positions={positions}
            trades={trades}
            onExecuteOrder={handleExecuteOrder}
            onOpenVerifyPage={(tradeId) => {
              setSelectedTradeIdForVerify(tradeId);
              setActivePage('verify');
            }}
          />
        );

      case 'overview':
        return (
          <OverviewDesk
            candles={candles}
            selectedPair={selectedPair}
            onSelectPair={setSelectedPair}
            niftyPrice={niftyPrice}
            niftyChange={niftyChange}
            positions={positions}
            trades={trades}
            blocks={blocks}
            onExecuteOrder={handleExecuteOrder}
            onClosePosition={handleClosePosition}
            onSelectTrade={(trade) => setSelectedTrade(trade)}
            onNavigateToVerify={(tradeId) => {
              setSelectedTradeIdForVerify(tradeId);
              setActivePage('verify');
            }}
            onNavigateToPage={(page) => setActivePage(page)}
            onOpenAIModal={() => setIsAIAssistantOpen(true)}
            onRefreshData={refreshSupabaseData}
          />
        );

      case 'blockchain':
        return (
          <BlockchainOverview
            blocks={blocks}
            trades={trades}
            onSelectTrade={(tradeId) => {
              const trd = trades.find(t => t.id === tradeId) || trades[0];
              setSelectedTrade(trd);
            }}
            onNavigateToVerify={(tradeId) => {
              setSelectedTradeIdForVerify(tradeId);
              setActivePage('verify');
            }}
          />
        );

      case 'transactions':
        return (
          <TransactionExplorer
            trades={trades}
            onSelectTrade={(tradeId) => {
              const trd = trades.find(t => t.id === tradeId) || trades[0];
              setSelectedTrade(trd);
            }}
            onNavigateToVerify={(tradeId) => {
              setSelectedTradeIdForVerify(tradeId);
              setActivePage('verify');
            }}
          />
        );

      case 'blocks':
        return (
          <BlockExplorer
            blocks={blocks}
            trades={trades}
            onSelectTrade={(tradeId) => {
              const trd = trades.find(t => t.id === tradeId) || trades[0];
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
            trades={trades}
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
        return (
          <RiskManagementCenter
            positions={positions}
            trades={trades}
            niftyPrice={niftyPrice}
            onClosePosition={handleClosePosition}
          />
        );

      case 'portfolio':
        return (
          <PortfolioOverview
            positions={positions}
            trades={trades}
            niftyPrice={niftyPrice}
            onClosePosition={handleClosePosition}
            onExecuteOrder={handleExecuteOrder}
            onNavigateToMarkets={() => setActivePage('markets')}
          />
        );

      case 'analytics':
        return (
          <PortfolioOverview
            positions={positions}
            trades={trades}
            niftyPrice={niftyPrice}
            onClosePosition={handleClosePosition}
            onExecuteOrder={handleExecuteOrder}
            onNavigateToMarkets={() => setActivePage('markets')}
          />
        );

      case 'monitoring':
        return <SystemHealthPage />;

      case 'audit':
        return <AuditLogPage />;

      case 'settings':
        return <SettingsPage />;

      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-[#080A0F] text-slate-900 dark:text-[#F1F5F9] flex overflow-hidden font-sans transition-colors">
      
      {/* Persistent Left Sidebar */}
      <Sidebar
        activePage={activePage}
        onSelectPage={(page) => setActivePage(page)}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-grid-pattern">
        
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
        <main className="flex-1 p-4 lg:p-6 pb-28 lg:pb-36 max-w-7xl w-full mx-auto space-y-6">
          {renderWorkspaceContent()}
        </main>
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
