import React, { useState, useEffect } from 'react';
import {
  ActivePosition,
  TradeRecord,
  CandlestickData,
  BlockHeader,
  NavPage
} from '../../types/trading';
import { MOCK_SIGNAL } from '../../lib/mockData';
import { KPICards } from './KPICards';
import { TradingChart } from './TradingChart';
import { SignalPanel } from './SignalPanel';
import { ActivePositionsTable } from './ActivePositionsTable';
import { RecentTradesTable } from './RecentTradesTable';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  PlusCircle,
  Activity,
  Flame,
  Globe,
  Sliders,
  CheckCircle2,
  RefreshCw,
  X,
  Send,
  Lock,
  Layers,
  Sparkles,
  OctagonAlert,
  FileText,
  FileSpreadsheet,
  Printer,
  ExternalLink
} from 'lucide-react';
import { triggerFileDownload } from '../../lib/cryptoUtils';

interface OverviewDeskProps {
  candles: CandlestickData[];
  selectedPair: string;
  onSelectPair: (pair: string) => void;
  niftyPrice: number;
  niftyChange: number;
  positions: ActivePosition[];
  trades: TradeRecord[];
  blocks: BlockHeader[];
  onExecuteOrder: (order: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'SL-M';
    qty: number;
    price: number;
    broker: string;
  }) => void;
  onClosePosition: (id: string) => void;
  onSelectTrade: (trade: TradeRecord) => void;
  onNavigateToVerify: (tradeId: string) => void;
  onNavigateToPage: (page: NavPage) => void;
  onOpenAIModal: () => void;
  onRefreshData?: () => Promise<void> | void;
}

interface SectorMover {
  name: string;
  change: number;
  momentum: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export const OverviewDesk: React.FC<OverviewDeskProps> = ({
  candles,
  selectedPair,
  onSelectPair,
  niftyPrice,
  niftyChange,
  positions,
  trades,
  blocks,
  onExecuteOrder,
  onClosePosition,
  onSelectTrade,
  onNavigateToVerify,
  onNavigateToPage,
  onOpenAIModal,
  onRefreshData
}) => {
  // Quick Order Modal
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [quickSymbol, setQuickSymbol] = useState(selectedPair);
  const [quickSide, setQuickSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quickQty, setQuickQty] = useState(50);
  const [quickBroker, setQuickBroker] = useState('Upstox Pro API');
  const [quickType, setQuickType] = useState<'MARKET' | 'LIMIT' | 'SL-M'>('MARKET');
  const [quickPrice, setQuickPrice] = useState(niftyPrice);

  // Panic Liquidate Confirmation
  const [isLiquidateConfirmOpen, setIsLiquidateConfirmOpen] = useState(false);

  // Live ticking state for Indian benchmark indices
  const [bankNiftyPrice, setBankNiftyPrice] = useState(51340.25);
  const [bankNiftyChange, setBankNiftyChange] = useState(0.82);
  const [finNiftyPrice, setFinNiftyPrice] = useState(23115.80);
  const [finNiftyChange, setFinNiftyChange] = useState(0.45);
  const [sensexPrice, setSensexPrice] = useState(81480.10);
  const [sensexChange, setSensexChange] = useState(0.61);
  const [indiaVixPrice, setIndiaVixPrice] = useState(12.38);
  const [indiaVixChange, setIndiaVixChange] = useState(-3.20);

  // Manual refresh engine state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
  });
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // India VIX Analytics Modal state
  const [isVixModalOpen, setIsVixModalOpen] = useState(false);

  // Live market walking ticks for benchmark indices
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setBankNiftyPrice(prev => Math.round((prev + (Math.random() - 0.49) * 12.5) * 100) / 100);
      setFinNiftyPrice(prev => Math.round((prev + (Math.random() - 0.49) * 5.8) * 100) / 100);
      setSensexPrice(prev => Math.round((prev + (Math.random() - 0.49) * 18.0) * 100) / 100);
      setIndiaVixPrice(prev => Math.max(9.5, Math.min(28.0, Math.round((prev + (Math.random() - 0.5) * 0.06) * 100) / 100)));
    }, 2400);

    return () => clearInterval(pulseInterval);
  }, []);

  // Sector Data
  const [sectors, setSectors] = useState<SectorMover[]>([
    { name: 'NIFTY IT', change: 1.42, momentum: 'BULLISH' },
    { name: 'BANK NIFTY', change: 0.88, momentum: 'BULLISH' },
    { name: 'NIFTY AUTO', change: -0.35, momentum: 'BEARISH' },
    { name: 'NIFTY PHARMA', change: 0.62, momentum: 'BULLISH' },
    { name: 'NIFTY METAL', change: 1.75, momentum: 'BULLISH' },
    { name: 'NIFTY FMCG', change: -0.18, momentum: 'NEUTRAL' }
  ]);

  // Live Pulse Indices
  const indices = [
    { 
      name: 'NIFTY 50', 
      val: niftyPrice, 
      chg: niftyChange, 
      active: selectedPair.includes('NIFTY') && !selectedPair.includes('BANK') && !selectedPair.includes('FIN'),
      targetPair: 'NIFTY 50 Futures'
    },
    { 
      name: 'BANK NIFTY', 
      val: bankNiftyPrice, 
      chg: bankNiftyChange, 
      active: selectedPair.includes('BANKNIFTY') || selectedPair.includes('BANK NIFTY'),
      targetPair: 'BANK NIFTY Futures'
    },
    { 
      name: 'FIN NIFTY', 
      val: finNiftyPrice, 
      chg: finNiftyChange, 
      active: selectedPair.includes('FIN NIFTY') || selectedPair.includes('FINNIFTY'),
      targetPair: 'FIN NIFTY Futures'
    },
    { 
      name: 'SENSEX', 
      val: sensexPrice, 
      chg: sensexChange, 
      active: selectedPair.includes('SENSEX'),
      targetPair: 'SENSEX Futures'
    },
    { 
      name: 'INDIA VIX', 
      val: indiaVixPrice, 
      chg: indiaVixChange, 
      active: false, 
      isVix: true 
    }
  ];

  // Update quick price when selectedPair or niftyPrice changes
  useEffect(() => {
    setQuickSymbol(selectedPair);
    setQuickPrice(niftyPrice);
  }, [selectedPair, niftyPrice]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const nowStr = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
    try {
      if (onRefreshData) {
        await onRefreshData();
      }
      setLastSyncTime(nowStr);
      setSyncNotice('Data Synced with Supabase');
      setTimeout(() => setSyncNotice(null), 3000);
    } catch (e) {
      console.warn('Manual refresh err', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteOrder({
      symbol: quickSymbol,
      side: quickSide,
      type: quickType,
      qty: quickQty,
      price: quickPrice,
      broker: quickBroker
    });
    setIsQuickOrderOpen(false);
  };

  const handleLiquidateAll = () => {
    if (positions.length === 0) {
      alert('No active positions to liquidate.');
      return;
    }
    const count = positions.length;
    positions.forEach(p => onClosePosition(p.id));
    setIsLiquidateConfirmOpen(false);
  };

  // Enterprise Audit Export Modal state & toast
  const [isExportAuditModalOpen, setIsExportAuditModalOpen] = useState(false);
  const [auditExportNotice, setAuditExportNotice] = useState<string | null>(null);

  const handleExportAuditJSON = () => {
    const exportData = {
      platform: 'TradeChain Institutional Algorithmic Trading & Cryptographic Audit',
      version: '2.4.0',
      complianceFramework: 'SEBI Algorithmic Trading Circular 2024/2026',
      consensusEngine: 'Proof of Authority (PoA) Consortium Ledger',
      exportTimestamp: new Date().toISOString(),
      networkStatus: 'SYNCHRONIZED',
      totalActivePositions: positions.length,
      totalTradeRecords: trades.length,
      totalBlocksVerified: blocks.length,
      activePositions: positions,
      tradeRecords: trades,
      blockchainHeaders: blocks.map(b => ({
        blockNumber: b.blockNumber,
        hash: b.blockHash,
        previousHash: b.previousHash,
        merkleRoot: b.merkleRoot,
        validator: b.validator,
        timestamp: b.timestamp,
        txCount: b.txCount,
        status: b.status
      }))
    };
    triggerFileDownload(
      JSON.stringify(exportData, null, 2),
      `TradeChain_Cryptographic_Audit_${Date.now()}.json`,
      'application/json;charset=utf-8;'
    );
    setAuditExportNotice('JSON Cryptographic Audit Exported Successfully!');
    setTimeout(() => setAuditExportNotice(null), 3500);
  };

  const handleExportAuditCSV = () => {
    const headers = 'Type,ID,Timestamp,Asset,Side,Quantity,Price,Value_INR,PnL,TxHash,BlockNumber,Status,DigitalSignature\n';
    const positionRows = positions.map(p =>
      `POSITION,${p.id},"${p.openedAt}","${p.asset}",${p.side},${p.quantity},${p.entryPrice},${p.totalValue.toFixed(2)},${p.unrealizedPnl.toFixed(2)},"0x${p.id}hash",4280,OPEN,"SIG_${p.id}"`
    );
    const tradeRows = trades.map(t =>
      `TRADE,${t.id},"${t.timestamp}","${t.asset}",${t.side},${t.quantity},${t.price},${t.totalValue.toFixed(2)},${t.pnl.toFixed(2)},"${t.txHash}",${t.blockNumber},${t.status},"${t.digitalSignature}"`
    );
    const csvContent = headers + [...positionRows, ...tradeRows].join('\n');
    triggerFileDownload(
      csvContent,
      `TradeChain_Regulatory_Ledger_${Date.now()}.csv`,
      'text/csv;charset=utf-8;'
    );
    setAuditExportNotice('CSV Regulatory Ledger Exported Successfully!');
    setTimeout(() => setAuditExportNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Indian Indices Live Ticker Ribbon (Unclipped, Interactive, Live Synced) */}
      <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl p-3 shadow-xs font-mono text-xs">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3">
          
          {/* Left: Unclipped Live Market Pulse Badge */}
          <div className="flex items-center gap-2.5 shrink-0 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#3B82F6]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <Activity size={13} className="text-[#3B82F6]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-[#E2E8F0]">
              LIVE MARKET PULSE
            </span>
          </div>

          {/* Center: Workable Clickable Indices with Live Ticks */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 min-w-0 flex-1">
            {indices.map(idx => {
              const isPos = idx.chg >= 0;
              return (
                <button
                  key={idx.name}
                  onClick={() => {
                    if (idx.isVix) {
                      setIsVixModalOpen(true);
                    } else if (idx.targetPair) {
                      onSelectPair(idx.targetPair);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all shrink-0 cursor-pointer text-left ${
                    idx.active
                      ? 'border-[#3B82F6] bg-[#3B82F6]/15 ring-1 ring-[#3B82F6]/40 text-slate-900 dark:text-[#F1F5F9]'
                      : 'border-slate-200 dark:border-[#1E2633] bg-slate-50 dark:bg-[#111620] hover:border-blue-400 dark:hover:border-[#3B82F6]/50'
                  }`}
                  title={idx.isVix ? 'Click to inspect India VIX volatility analytics' : `Switch active chart & trading view to ${idx.name}`}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-semibold">{idx.name}</span>
                    <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">
                      {idx.isVix ? '' : '₹'}{idx.val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold flex items-center px-1.5 py-0.5 rounded ${
                    isPos ? 'text-[#10B981] bg-[#10B981]/10' : 'text-[#EF4444] bg-[#EF4444]/10'
                  }`}>
                    {isPos ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                    {isPos ? '+' : ''}{idx.chg.toFixed(2)}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: API Sync Status & Manual Refresh Button */}
          <div className="flex items-center gap-2 shrink-0">
            {syncNotice ? (
              <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-1 rounded font-bold animate-in fade-in">
                ✓ {syncNotice}
              </span>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                <CheckCircle2 size={11} className="text-emerald-500" />
                <span>SYNCED: {lastSyncTime.split(' ')[0]}</span>
              </div>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#161D2A] dark:hover:bg-[#1E2633] border border-slate-200 dark:border-[#1E2633] text-xs font-mono font-bold transition-all text-slate-700 dark:text-slate-300 disabled:opacity-50 cursor-pointer shadow-xs active:scale-95"
              title="Refresh all market quotes, active orders & Supabase ledger"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[#3B82F6]' : 'text-slate-500 dark:text-[#94A3B8]'} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Overview Header Banner & Institutional Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#111620] p-5 rounded-xl border border-slate-200 dark:border-[#1E2633] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-900 dark:text-[#F1F5F9] tracking-tight">
              TradeChain Institutional Desk — NSE / F&O Overview
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">
              GATEWAY LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-sans">
            Real-time algorithmic trading, low-latency execution routing, and cryptographic block verification.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setIsQuickOrderOpen(true)}
            className="btn-3d btn-3d-primary px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md"
          >
            <PlusCircle size={15} />
            <span>Instant Order</span>
          </button>

          <button
            onClick={() => setIsExportAuditModalOpen(true)}
            className="btn-3d btn-3d-secondary px-3 py-2 rounded-xl font-bold flex items-center gap-1.5"
            title="Export Cryptographic Audit Package & Regulatory Ledger"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export Audit</span>
          </button>

          <button
            onClick={() => setIsLiquidateConfirmOpen(true)}
            className="btn-3d btn-3d-danger px-3 py-2 rounded-xl font-bold flex items-center gap-1.5"
            title="Liquidate all positions immediately"
          >
            <OctagonAlert size={14} />
            <span className="hidden sm:inline">Stop All</span>
          </button>

          <button
            onClick={() => onNavigateToPage('verify')}
            className="btn-3d btn-3d-secondary px-3 py-2 rounded-xl font-bold flex items-center gap-1.5"
          >
            <ShieldCheck size={14} className="text-[#10B981]" />
            <span>Audit Engine</span>
          </button>
        </div>
      </div>

      {/* 3. Five KPI Summary Cards */}
      <KPICards
        portfolioValue={117850.42 + positions.reduce((acc, p) => acc + p.unrealizedPnl, 0)}
        todayPnl={2340.18 + positions.reduce((acc, p) => acc + p.unrealizedPnl, 0)}
        todayPnlPct={2.04}
        activeTradesCount={positions.length}
        buyCount={positions.filter(p => p.side === 'BUY').length}
        sellCount={positions.filter(p => p.side === 'SELL').length}
        winRate={71.4}
        chainIntegrity={100}
      />

      {/* 4. Main Central Trading Chart + Signal Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TradingChart
            candles={candles}
            selectedPair={selectedPair}
            onSelectPair={onSelectPair}
            price={niftyPrice}
            priceChangePct={niftyChange}
          />
        </div>

        <div>
          <SignalPanel
            signal={MOCK_SIGNAL}
            onOpenAIModal={onOpenAIModal}
          />
        </div>
      </div>

      {/* 5. NSE Sector Performance & Market Breadth */}
      <div className="p-4 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl font-mono text-xs space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-[#1E2633] pb-2 gap-2">
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-[#F59E0B]" />
            <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">NSE Sector Performance & Breadth</span>
            <span className="text-[10px] text-slate-400">1-Min Tick Feed</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Advances: <strong className="text-[#10B981]">1,428</strong></span>
            <span>Declines: <strong className="text-[#EF4444]">792</strong></span>
            <span>A/D Ratio: <strong className="text-slate-900 dark:text-[#F1F5F9]">1.80</strong></span>
            <span className="text-[#3B82F6] font-bold">FII Net: +₹1,240 Cr</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {sectors.map(sec => {
            const isBull = sec.change >= 0;
            return (
              <div
                key={sec.name}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] flex items-center justify-between"
              >
                <span className="font-medium text-slate-700 dark:text-[#94A3B8]">{sec.name}</span>
                <span className={`font-bold ${isBull ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {isBull ? '+' : ''}{sec.change}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Active Positions Table */}
      <ActivePositionsTable
        positions={positions}
        onSelectPosition={(posId) => {
          const trd = trades.find(t => t.id === 'TRD-IN-00104') || trades[0];
          if (trd) onSelectTrade(trd);
        }}
        onClosePosition={onClosePosition}
      />

      {/* 6. Recent Trades Table */}
      <RecentTradesTable
        trades={trades}
        onSelectTrade={onSelectTrade}
        onNavigateToVerify={onNavigateToVerify}
      />

      {/* QUICK ORDER MODAL */}
      {isQuickOrderOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#242B35] rounded-2xl shadow-2xl p-6 font-mono text-xs animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242B35] pb-3">
              <div>
                <span className="font-bold text-slate-900 dark:text-[#F4F7FA] text-base flex items-center gap-2">
                  <Zap size={18} className="text-[#3B82F6]" />
                  <span>Instant Order Entry</span>
                </span>
                <p className="text-[10px] text-slate-500 dark:text-[#8B95A5] mt-0.5">Direct execution via NSE FIX Gateway</p>
              </div>
              <button onClick={() => setIsQuickOrderOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-[#F4F7FA]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-4">
              {/* Buy / Sell Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickSide('BUY')}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                    quickSide === 'BUY'
                      ? 'bg-[#10B981] text-white shadow-md'
                      : 'bg-slate-100 dark:bg-[#111620] text-slate-500'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setQuickSide('SELL')}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                    quickSide === 'SELL'
                      ? 'bg-[#EF4444] text-white shadow-md'
                      : 'bg-slate-100 dark:bg-[#111620] text-slate-500'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              {/* Symbol & Broker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1 text-[10px]">Symbol</label>
                  <select
                    value={quickSymbol}
                    onChange={(e) => setQuickSymbol(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold outline-none"
                  >
                    <option value="NIFTY 24800 CE">NIFTY 24800 CE</option>
                    <option value="NIFTY 24700 PE">NIFTY 24700 PE</option>
                    <option value="BANKNIFTY 51500 CE">BANKNIFTY 51500 CE</option>
                    <option value="BANKNIFTY 51200 PE">BANKNIFTY 51200 PE</option>
                    <option value="RELIANCE EQ">RELIANCE EQ</option>
                    <option value="HDFCBANK EQ">HDFCBANK EQ</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 text-[10px]">Broker Gateway</label>
                  <select
                    value={quickBroker}
                    onChange={(e) => setQuickBroker(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] outline-none"
                  >
                    <option value="Upstox Pro API">Upstox Pro API</option>
                    <option value="Groww Trade API">Groww Trade API</option>
                    <option value="NSE FIX Engine #1">NSE FIX Engine #1</option>
                    <option value="Zerodha Kite Connect">Zerodha Kite Connect</option>
                  </select>
                </div>
              </div>

              {/* Quantity & Order Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1 text-[10px]">Quantity (Lots/Shares)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quickQty}
                    onChange={(e) => setQuickQty(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 text-[10px]">Order Type</label>
                  <select
                    value={quickType}
                    onChange={(e) => setQuickType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2 text-slate-900 dark:text-[#F4F7FA] outline-none"
                  >
                    <option value="MARKET">MARKET</option>
                    <option value="LIMIT">LIMIT</option>
                    <option value="SL-M">SL-M</option>
                  </select>
                </div>
              </div>

              {/* Est. Value Calculation */}
              <div className="p-3 bg-slate-50 dark:bg-[#111620] rounded-xl border border-slate-200 dark:border-[#1E2633] space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Execution Price:</span>
                  <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">₹{quickPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Total Value:</span>
                  <span className="font-bold text-[#3B82F6]">₹{(quickQty * quickPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                type="submit"
                className={`btn-3d w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
                  quickSide === 'BUY' ? 'btn-3d-success' : 'btn-3d-danger'
                }`}
              >
                <Send size={15} />
                <span>Submit {quickSide} Order via {quickBroker}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EMERGENCY STOP ALL MODAL */}
      {isLiquidateConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1117] border border-[#EF4444]/40 rounded-2xl shadow-2xl p-6 font-mono text-xs animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30">
                <OctagonAlert size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F4F7FA]">Emergency Stop Confirmation</h3>
                <p className="text-[10px] text-slate-500">Decommission all active algorithmic exposure</p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Are you sure you want to market-liquidate all <strong>{positions.length} active positions</strong>? 
              This will send immediate cancel-and-close FIX messages to Upstox and Groww gateways and anchor closing blocks to the ledger.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsLiquidateConfirmOpen(false)}
                className="btn-3d btn-3d-secondary py-2.5 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleLiquidateAll}
                className="btn-3d btn-3d-danger py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>Confirm Liquidate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INDIA VIX VOLATILITY & OPTIONS REGIME MODAL */}
      {isVixModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-2xl w-full max-w-lg p-6 shadow-2xl font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2633] pb-3">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-[#F1F5F9]">INDIA VIX Volatility Terminal</h3>
              </div>
              <button 
                onClick={() => setIsVixModalOpen(false)}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#161D2A] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                <div className="text-slate-400 text-[10px] font-bold">CURRENT INDIA VIX</div>
                <div className="text-2xl font-bold text-amber-500 mt-1">{indiaVixPrice.toFixed(2)}</div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1">Normal Volatility Regime (10 - 15)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                <div className="text-slate-400 text-[10px] font-bold">IMPLIED DAILY SWING</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] mt-1">
                  ±{((indiaVixPrice / Math.sqrt(252))).toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  ±{Math.round(niftyPrice * (indiaVixPrice / Math.sqrt(252)) / 100)} NIFTY Points
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-700 dark:text-[#94A3B8] space-y-1.5 font-sans">
              <div className="font-bold font-mono text-[#3B82F6] flex items-center gap-1.5">
                <CheckCircle2 size={13} /> SEBI Algorithmic Options Guidance
              </div>
              <p className="text-[11px] leading-relaxed">
                India VIX below 14 indicates low implied option premium risk. Recommended quantitative strategies: <strong>VWAP Mean Reversion</strong> and <strong>Iron Condor credit spreads</strong> on weekly expiries.
              </p>
            </div>

            <button
              onClick={() => {
                setIsVixModalOpen(false);
                onSelectPair('NIFTY 24800 CE');
              }}
              className="w-full py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              Analyze NIFTY 24800 CE Options Chain
            </button>
          </div>
        </div>
      )}

      {/* ENTERPRISE CRYPTOGRAPHIC AUDIT EXPORT MODAL */}
      {isExportAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-2xl w-full max-w-xl p-6 shadow-2xl font-mono space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2633] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-[#F1F5F9]">
                    Cryptographic Audit Export Center
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-sans">
                    SEBI Algorithmic Trading Circular 2024/2026 Compliant Evidence Package
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExportAuditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#161D2A] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Audit Package Metadata Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Active Positions</div>
                <div className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] mt-1">{positions.length}</div>
                <div className="text-[10px] text-emerald-500 font-bold mt-0.5">Live On-Chain</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Executed Trades</div>
                <div className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] mt-1">{trades.length}</div>
                <div className="text-[10px] text-blue-500 font-bold mt-0.5">Merkle Verified</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Blockchain Blocks</div>
                <div className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] mt-1">{blocks.length}</div>
                <div className="text-[10px] text-purple-500 font-bold mt-0.5">PoA Consensus</div>
              </div>
            </div>

            {/* Download Options */}
            <div className="space-y-3 font-sans text-xs">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E2633] bg-slate-50/50 dark:bg-[#111620]/60 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-[#F1F5F9]">
                    <FileText size={16} className="text-[#10B981]" />
                    <span>Cryptographic Evidence Package (.JSON)</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">RECOMMENDED</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                    Full JSON package with Merkle root hashes, block headers, digital signatures, and timestamped trade state.
                  </p>
                </div>
                <button
                  onClick={handleExportAuditJSON}
                  className="btn-3d btn-3d-primary px-3.5 py-2 rounded-xl font-mono text-xs font-bold shrink-0 flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#1E2633] bg-slate-50/50 dark:bg-[#111620]/60 hover:border-blue-500/50 transition-all flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-[#F1F5F9]">
                    <FileSpreadsheet size={16} className="text-[#3B82F6]" />
                    <span>SEBI Regulatory Ledger (.CSV)</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono bg-blue-500/10 text-blue-500 rounded border border-blue-500/20">EXCEL/SHEETS</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                    Standardized spreadsheet ledger formatted for Indian tax computation, compliance audits, and broker reconciliation.
                  </p>
                </div>
                <button
                  onClick={handleExportAuditCSV}
                  className="btn-3d btn-3d-secondary px-3.5 py-2 rounded-xl font-mono text-xs font-bold shrink-0 flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Direct Multi-Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-[#1E2633]">
              <button
                onClick={() => {
                  handleExportAuditJSON();
                  handleExportAuditCSV();
                }}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Download Both (JSON + CSV)</span>
              </button>

              <button
                onClick={() => setIsExportAuditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#161D2A] text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 dark:hover:bg-[#1E2633] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Audit Toast Notification */}
      {auditExportNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#10B981] text-white shadow-xl font-mono text-xs animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 size={16} />
          <span className="font-bold">{auditExportNotice}</span>
        </div>
      )}
    </div>
  );
};
