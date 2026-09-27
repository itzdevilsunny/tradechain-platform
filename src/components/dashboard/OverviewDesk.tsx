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
  OctagonAlert
} from 'lucide-react';

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
  onOpenAIModal
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
    { name: 'NIFTY 50', val: niftyPrice, chg: niftyChange, active: selectedPair.includes('NIFTY') },
    { name: 'BANK NIFTY', val: 51340.25, chg: 0.82, active: selectedPair.includes('BANKNIFTY') },
    { name: 'FIN NIFTY', val: 23115.80, chg: 0.45, active: false },
    { name: 'SENSEX', val: 81480.10, chg: 0.61, active: false },
    { name: 'INDIA VIX', val: 12.38, chg: -3.20, active: false, isVix: true }
  ];

  // Update quick price when selectedPair or niftyPrice changes
  useEffect(() => {
    setQuickSymbol(selectedPair);
    setQuickPrice(niftyPrice);
  }, [selectedPair, niftyPrice]);

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
    positions.forEach(p => onClosePosition(p.id));
    setIsLiquidateConfirmOpen(false);
    alert(`Emergency stop triggered: All ${positions.length} active positions were closed and logged to audit ledger.`);
  };

  const handleExportLedgerJSON = () => {
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      activePositions: positions,
      tradeRecords: trades,
      blockchainHeaders: blocks.map(b => ({
        blockNumber: b.blockNumber,
        hash: b.blockHash,
        merkleRoot: b.merkleRoot,
        timestamp: b.timestamp
      }))
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tradechain_ledger_snapshot_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Indian Indices Live Ticker Ribbon */}
      <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl p-3 shadow-xs font-mono text-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#64748B] flex items-center gap-1 uppercase tracking-wider shrink-0 mr-2">
            <Activity size={13} className="text-[#3B82F6]" />
            Live Market Pulse:
          </span>
          {indices.map(idx => {
            const isPos = idx.chg >= 0;
            return (
              <button
                key={idx.name}
                onClick={() => {
                  if (idx.name === 'NIFTY 50') onSelectPair('NIFTY 24800 CE');
                  if (idx.name === 'BANK NIFTY') onSelectPair('BANKNIFTY 51500 PE');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                  idx.active
                    ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-slate-900 dark:text-[#F1F5F9]'
                    : 'border-slate-200 dark:border-[#1E2633] bg-slate-50 dark:bg-[#111620] hover:border-slate-300 dark:hover:border-[#2E384D]'
                }`}
              >
                <span className="font-bold text-slate-700 dark:text-[#CBD5E1]">{idx.name}</span>
                <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">
                  {idx.val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[10px] font-bold flex items-center ${isPos ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {isPos ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                  {isPos ? '+' : ''}{idx.chg.toFixed(2)}%
                </span>
              </button>
            );
          })}
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
            onClick={handleExportLedgerJSON}
            className="btn-3d btn-3d-secondary px-3 py-2 rounded-xl font-bold flex items-center gap-1.5"
            title="Export Cryptographic Ledger Snapshot as JSON"
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

        <div className="space-y-5">
          <SignalPanel
            signal={MOCK_SIGNAL}
            onOpenAIModal={onOpenAIModal}
          />

          {/* Sector Movers & Market Breadth Mini Widget */}
          <div className="p-4 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2633] pb-2">
              <span className="font-bold text-slate-900 dark:text-[#F1F5F9] flex items-center gap-1.5">
                <Flame size={14} className="text-[#F59E0B]" />
                NSE Sector Performance
              </span>
              <span className="text-[10px] text-slate-400">1-Min Heatmap</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {sectors.map(sec => {
                const isBull = sec.change >= 0;
                return (
                  <div
                    key={sec.name}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-700 dark:text-[#94A3B8] truncate max-w-[85px]">{sec.name}</span>
                    <span className={`font-bold ${isBull ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {isBull ? '+' : ''}{sec.change}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 dark:border-[#1E2633]">
              <span>Advances: <strong className="text-[#10B981]">1,428</strong></span>
              <span>Declines: <strong className="text-[#EF4444]">792</strong></span>
              <span>A/D: <strong className="text-slate-900 dark:text-[#F1F5F9]">1.80</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Active Positions Table */}
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
    </div>
  );
};
