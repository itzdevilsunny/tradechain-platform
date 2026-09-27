import React, { useState, useEffect, useCallback } from 'react';
import { TradeRecord } from '../../types/trading';
import {
  Receipt, Search, Filter, ShieldCheck, Copy, Check,
  Clock, Zap, BarChart2, Download, PlusCircle, X,
  CheckCircle2, ArrowUpRight, Database, Radio, TrendingUp,
  TrendingDown, AlertTriangle, Eye, RefreshCw, FileText
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

interface TransactionExplorerProps {
  trades: TradeRecord[];
  onSelectTrade: (tradeId: string) => void;
  onNavigateToVerify: (tradeId: string) => void;
}

const truncateHash = (h: string, n = 14) => `${h.slice(0, n)}...`;

// Transaction lifecycle stages
const TX_STAGES = ['Order Placed', 'FIX Route', 'NSE Matching', 'Execution', 'Block Commit', 'Finalized'];

// Generate P&L timeline from trades
const buildPnlTimeline = (trades: TradeRecord[]) => {
  let cumPnl = 0;
  return trades.slice().reverse().slice(0, 20).map((t, i) => {
    cumPnl += t.pnl;
    return {
      idx: i + 1,
      id: t.id,
      pnl: t.pnl,
      cumPnl: Math.round(cumPnl),
      asset: t.asset,
    };
  });
};

// Throughput data (24 hours)
const generateThroughputData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    tps: Math.floor(100 + Math.sin(i * 0.5) * 45 + Math.random() * 20),
    buy: Math.floor(60 + Math.random() * 30),
    sell: Math.floor(40 + Math.random() * 30),
    feeAvg: Math.round((1.1 + Math.cos(i * 0.4) * 0.3) * 100) / 100,
  }));

// Asset distribution
const buildAssetDistribution = (trades: TradeRecord[]) => {
  const counts: Record<string, number> = {};
  trades.forEach(t => { counts[t.asset] = (counts[t.asset] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));
};

const PIE_COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#A78BFA', '#EF4444'];

const MEMPOOL_INITIAL = [
  { txHash: '0x9a8f1b2c3d4e5f607182', tradeId: 'TRD-MP-101', asset: 'NIFTY 50 Futures', side: 'BUY' as const, qty: 25, price: 24855.00, gasFee: '₹1.25', age: 2 },
  { txHash: '0x3c4d5e6f7a8b9c0d1e2f', tradeId: 'TRD-MP-102', asset: 'BANK NIFTY Futures', side: 'SELL' as const, qty: 15, price: 53435.50, gasFee: '₹1.50', age: 5 },
  { txHash: '0x7e8f9a0b1c2d3e4f5a6b', tradeId: 'TRD-MP-103', asset: 'RELIANCE IND', side: 'BUY' as const, qty: 50, price: 3048.00, gasFee: '₹1.10', age: 8 },
  { txHash: '0x1b2c3d4e5f6a7b8c9d0e', tradeId: 'TRD-MP-104', asset: 'TCS', side: 'SELL' as const, qty: 20, price: 4290.00, gasFee: '₹1.35', age: 11 },
];

export const TransactionExplorer: React.FC<TransactionExplorerProps> = ({
  trades: initialTrades,
  onSelectTrade,
  onNavigateToVerify,
}) => {
  const [trades, setTrades] = useState<TradeRecord[]>(initialTrades);
  const [searchQuery, setSearchQuery] = useState('');
  const [sideFilter, setSideFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED' | 'CANCELLED'>('ALL');
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'MEMPOOL' | 'PNL' | 'ANALYTICS' | 'LIFECYCLE'>('LEDGER');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState<TradeRecord | null>(null);
  const [mempool, setMempool] = useState(MEMPOOL_INITIAL);
  const [mempoolAge, setMempoolAge] = useState(0);
  const [throughputData] = useState(generateThroughputData());
  const [pnlData, setPnlData] = useState(() => buildPnlTimeline(initialTrades));
  const [assetDist, setAssetDist] = useState(() => buildAssetDistribution(initialTrades));
  const [selectedLifecycleTx, setSelectedLifecycleTx] = useState<TradeRecord | null>(null);
  const [lifecycleStage, setLifecycleStage] = useState(5); // 0-5 stages
  const [liveMode, setLiveMode] = useState(false);

  // Age tick for mempool
  useEffect(() => {
    const t = setInterval(() => setMempoolAge(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Live tx simulation
  useEffect(() => {
    if (!liveMode) return;
    const t = setInterval(() => {
      handleSimulateNewTx();
    }, 4000);
    return () => clearInterval(t);
  }, [liveMode]);

  const handleSimulateNewTx = useCallback(() => {
    const assets = ['NIFTY 50 Futures', 'BANK NIFTY Futures', 'RELIANCE IND', 'TCS', 'HDFC BANK', 'BTC / INR'];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const price = asset.includes('BTC') ? 5845000 : asset.includes('BANK') ? 53420 : asset.includes('TCS') ? 4290 : 24850;
    const qty = Math.floor(5 + Math.random() * 45);
    const side: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const newTxId = `TRD-IN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
    const pnl = Math.round((Math.random() - 0.4) * 4000);

    const newTx: TradeRecord = {
      id: newTxId, asset, strategy: 'Live Sim Route', side, price, quantity: qty,
      totalValue: price * qty, pnl, pnlPercentage: Math.round((pnl / (price * qty)) * 10000) / 100,
      stopLoss: price * 0.985, takeProfit: price * 1.03, status: 'ACTIVE',
      timestamp: timeStr, txHash, blockNumber: 4282, blockHash: '0x8f2a391eb4d02a01',
      merkleRoot: `0x${Math.random().toString(16).substring(2, 14)}`,
      digitalSignature: `0xsig${Math.random().toString(16).substring(2, 12)}`,
      isVerified: true,
    };
    setTrades(prev => [newTx, ...prev]);
    setPnlData(prev => {
      const cum = (prev[prev.length - 1]?.cumPnl || 0) + pnl;
      return [...prev, { idx: prev.length + 1, id: newTxId, pnl, cumPnl: cum, asset }].slice(-20);
    });
    setAssetDist(d => {
      const existing = d.find(e => e.name === asset);
      if (existing) return d.map(e => e.name === asset ? { ...e, value: e.value + 1 } : e);
      return [...d, { name: asset, value: 1 }].sort((a, b) => b.value - a.value).slice(0, 5);
    });
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = 'TxHash,TradeID,Timestamp,Asset,Side,Price,Quantity,TotalValue(INR),PnL,BlockNumber\n';
    const rows = trades.map(t =>
      `"${t.txHash}",${t.id},"${t.timestamp}","${t.asset}",${t.side},${t.price},${t.quantity},${t.totalValue},${t.pnl},#${t.blockNumber}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeChain_Transactions_${Date.now()}.csv`;
    a.click();
  };

  const handleCommitMempool = () => {
    mempool.forEach(m => {
      setTrades(prev => [{
        id: m.tradeId, asset: m.asset, strategy: 'Mempool Commit', side: m.side,
        price: m.price, quantity: m.qty, totalValue: m.price * m.qty,
        pnl: 0, pnlPercentage: 0, stopLoss: m.price * 0.985, takeProfit: m.price * 1.03,
        status: 'ACTIVE', timestamp: 'Just now', txHash: m.txHash, blockNumber: 4282,
        blockHash: '0x8f2a391eb4d02a01', merkleRoot: '0x9ab42ef71d5b128c',
        digitalSignature: '0xsig99120', isVerified: true,
      }, ...prev]);
    });
    setMempool([]);
  };

  const filteredTrades = trades.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || t.id.toLowerCase().includes(q) || t.txHash.toLowerCase().includes(q) || t.asset.toLowerCase().includes(q);
    const matchesSide = sideFilter === 'ALL' || t.side === sideFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesSide && matchesStatus;
  });

  const totalValue = trades.reduce((a, t) => a + t.totalValue, 0);
  const totalPnl = trades.reduce((a, t) => a + t.pnl, 0);
  const winTrades = trades.filter(t => t.pnl > 0).length;
  const winRate = trades.length > 0 ? Math.round((winTrades / trades.length) * 1000) / 10 : 0;

  const handleOpenLifecycle = (t: TradeRecord) => {
    setSelectedLifecycleTx(t);
    setLifecycleStage(0);
    // Animate through stages
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setLifecycleStage(stage);
      if (stage >= TX_STAGES.length - 1) clearInterval(interval);
    }, 400);
    setActiveTab('LIFECYCLE');
  };

  return (
    <div className="space-y-5 w-full max-w-full font-mono">

      {/* ━━━━ HEADER — Amber/Orange Theme ━━━━ */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4
        bg-gradient-to-r from-[#1C1000] via-[#1F1200] to-[#130C00]
        p-5 rounded-2xl border border-[#D97706]/40 shadow-lg shadow-amber-900/20 w-full overflow-hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-[#D97706]/20 border border-[#D97706]/30">
              <Receipt size={18} className="text-[#FCD34D]" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Institutional Transaction Explorer
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#D97706]/20 text-[#FCD34D] border border-[#D97706]/40 rounded">
              FIX PROTOCOL 4.4
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold border rounded transition-all ${
              liveMode ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30 animate-pulse' : 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20'
            }`}>
              {liveMode ? '● LIVE STREAM ON' : '○ STATIC'}
            </span>
          </div>
          <p className="text-xs text-[#8B95A5]">
            Secp256k1 signed payloads · Mempool queue · P&L analytics · NSE/BSE FIX execution lifecycle · CSV export
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setLiveMode(p => !p)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              liveMode
                ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white'
                : 'bg-[#D97706] hover:bg-[#B45309] text-white'
            }`}
          >
            {liveMode ? <><RefreshCw size={13} className="animate-spin" /><span>Stop Live</span></> : <><Radio size={13} /><span>Go Live</span></>}
          </button>
          <button
            onClick={handleSimulateNewTx}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#D97706]/40 text-[#FCD34D] hover:bg-[#D97706]/10 transition-all"
          >
            <PlusCircle size={13} /> Inject Tx
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#64748B]/30 text-[#94A3B8] hover:text-[#FCD34D] hover:border-[#D97706]/40 transition-all"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* ━━━━ KPI CARDS ━━━━ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[
          { label: 'Total Confirmed Txs', value: trades.length.toLocaleString('en-IN'), sub: '+100% Cryptographic Audit', color: '#FCD34D', icon: <Database size={18} className="text-[#FCD34D]" /> },
          { label: 'Cumulative Volume', value: `₹${(totalValue / 1e6).toFixed(2)}M`, sub: 'INR Gross Traded', color: '#F59E0B', icon: <TrendingUp size={18} className="text-[#F59E0B]" /> },
          { label: 'Net P&L', value: `${totalPnl >= 0 ? '+' : ''}₹${Math.abs(totalPnl).toLocaleString('en-IN')}`, sub: `Win Rate: ${winRate}%`, color: totalPnl >= 0 ? '#10B981' : '#EF4444', icon: totalPnl >= 0 ? <TrendingUp size={18} className="text-[#10B981]" /> : <TrendingDown size={18} className="text-[#EF4444]" /> },
          { label: 'Mempool Pending', value: `${mempool.length} Txs`, sub: 'Next Block Commit', color: '#F59E0B', icon: <Clock size={18} className="text-[#F59E0B]" /> },
        ].map(card => (
          <div key={card.label} className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B95A5] truncate">{card.label}</span>
              {card.icon}
            </div>
            <div className="text-xl font-bold truncate" style={{ color: card.color }}>{card.value}</div>
            <span className="text-[10px] text-[#64748B] font-bold block truncate">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* ━━━━ MAIN WORKSPACE ━━━━ */}
      <div className="rounded-2xl bg-[#11161D] border border-[#242B35] shadow-sm w-full overflow-hidden">

        {/* Tab Bar */}
        <div className="flex items-center gap-1 p-3 border-b border-[#1E2633] bg-[#1C1000] overflow-x-auto">
          {([
            { key: 'LEDGER', label: 'Confirmed Ledger', icon: <FileText size={13} /> },
            { key: 'MEMPOOL', label: 'Mempool Queue', icon: <Radio size={13} /> },
            { key: 'PNL', label: 'P&L Analytics', icon: <TrendingUp size={13} /> },
            { key: 'ANALYTICS', label: 'TPS & Volume', icon: <BarChart2 size={13} /> },
            { key: 'LIFECYCLE', label: 'Tx Lifecycle', icon: <Zap size={13} /> },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'text-[#64748B] hover:text-[#FCD34D] hover:bg-[#D97706]/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Confirmed Ledger ── */}
        {activeTab === 'LEDGER' && (
          <div className="p-5 space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search Tx Hash, Trade ID, or Asset..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#0D1117] border border-[#242B35] text-[#F4F7FA] outline-none focus:border-[#D97706]/60"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Filter size={13} className="text-[#64748B]" />
                {(['ALL', 'BUY', 'SELL'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSideFilter(s)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      sideFilter === s ? 'bg-[#D97706] text-white' : 'bg-[#1E2633] text-[#8B95A5] hover:text-[#FCD34D]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <div className="w-px h-4 bg-[#1E2633]" />
                {(['ALL', 'ACTIVE', 'CLOSED'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      statusFilter === s ? 'bg-[#1E40AF] text-white' : 'bg-[#1E2633] text-[#8B95A5] hover:text-[#60A5FA]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#64748B]">
              Showing <span className="text-[#FCD34D] font-bold">{filteredTrades.length}</span> of {trades.length} transactions
            </div>

            {/* Scrollable Table */}
            <div className="w-full overflow-x-auto border border-[#1E2633] rounded-xl">
              <table className="w-full text-left text-xs min-w-[900px]">
                <thead>
                  <tr className="bg-[#1C1000] border-b border-[#242B35] text-[10px] text-[#64748B] uppercase">
                    <th className="py-2.5 px-3.5">Tx Hash</th>
                    <th className="py-2.5 px-3.5">Trade ID</th>
                    <th className="py-2.5 px-3.5">Timestamp</th>
                    <th className="py-2.5 px-3.5">Asset</th>
                    <th className="py-2.5 px-3.5">Side</th>
                    <th className="py-2.5 px-3.5">Price</th>
                    <th className="py-2.5 px-3.5">Qty / Value</th>
                    <th className="py-2.5 px-3.5">P&L</th>
                    <th className="py-2.5 px-3.5">Block</th>
                    <th className="py-2.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2633]">
                  {filteredTrades.slice(0, 20).map(t => (
                    <tr key={t.id} className="hover:bg-[#1C1000]/60 transition-colors whitespace-nowrap">
                      <td className="py-2.5 px-3.5">
                        <button
                          onClick={() => setSelectedTxDetail(t)}
                          className="text-[#FCD34D] hover:underline font-bold flex items-center gap-1"
                        >
                          {truncateHash(t.txHash, 14)}
                          <Eye size={11} />
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-[#F59E0B]">{t.id}</td>
                      <td className="py-2.5 px-3.5 text-[#8B95A5]">{t.timestamp}</td>
                      <td className="py-2.5 px-3.5 font-bold text-[#F4F7FA]">{t.asset}</td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.side === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                        }`}>{t.side}</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#F4F7FA]">₹{t.price.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3.5 text-[#8B95A5]">{t.quantity} (₹{(t.totalValue / 1000).toFixed(0)}K)</td>
                      <td className={`py-2.5 px-3.5 font-bold ${t.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#64748B]">#{t.blockNumber}</td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleOpenLifecycle(t)}
                            className="px-2 py-1 rounded bg-[#D97706]/15 text-[#FCD34D] hover:bg-[#D97706] hover:text-white font-bold text-[10px] transition-all"
                          >
                            Lifecycle
                          </button>
                          <button
                            onClick={() => onNavigateToVerify(t.id)}
                            className="px-2 py-1 rounded bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981] hover:text-white font-bold text-[10px] transition-all flex items-center gap-0.5"
                          >
                            <ShieldCheck size={11} /> Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: Mempool Queue ── */}
        {activeTab === 'MEMPOOL' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-[#FCD34D] flex items-center gap-2">
                  <Radio size={16} className="animate-pulse" /> Live Mempool Broadcast Queue
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Unconfirmed FIX trades awaiting block inclusion · Ordered by age (oldest first)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCommitMempool}
                  disabled={mempool.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-[#D97706] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#B45309] transition-all flex items-center gap-1.5"
                >
                  <Zap size={13} fill="currentColor" />
                  Commit All to Block #4282
                </button>
                <button
                  onClick={() => {
                    const assets = ['NIFTY 50 Futures', 'BTC / INR', 'INFY'];
                    const asset = assets[Math.floor(Math.random() * assets.length)];
                    const side: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'BUY' : 'SELL';
                    setMempool(prev => [{
                      txHash: `0x${Math.random().toString(16).substring(2, 22)}`,
                      tradeId: `TRD-MP-${100 + Math.floor(Math.random() * 900)}`,
                      asset, side, qty: Math.floor(5 + Math.random() * 50), price: 24850, gasFee: '₹1.20', age: 0,
                    }, ...prev]);
                  }}
                  className="px-3 py-2 rounded-xl border border-[#D97706]/40 text-[#FCD34D] text-xs font-bold hover:bg-[#D97706]/10 transition-all flex items-center gap-1.5"
                >
                  <PlusCircle size={13} /> Add to Mempool
                </button>
              </div>
            </div>

            {/* Mempool stats */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#1C1000] border border-[#D97706]/20 text-center">
                <div className="text-[#64748B]">Pending</div>
                <div className="text-xl font-bold text-[#FCD34D]">{mempool.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#1C1000] border border-[#D97706]/20 text-center">
                <div className="text-[#64748B]">Oldest Tx Age</div>
                <div className="text-xl font-bold text-[#F59E0B]">{mempool.length > 0 ? `${mempool[mempool.length - 1].age + mempoolAge}s` : '—'}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#1C1000] border border-[#D97706]/20 text-center">
                <div className="text-[#64748B]">Avg Gas Fee</div>
                <div className="text-xl font-bold text-[#10B981]">₹1.29</div>
              </div>
            </div>

            {/* Mempool items */}
            {mempool.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-dashed border-[#D97706]/20 text-[#64748B]">
                <CheckCircle2 size={32} className="text-[#10B981] mx-auto mb-3" />
                <div className="font-bold text-[#10B981]">Mempool Cleared!</div>
                <div className="text-xs mt-1">All pending trades committed into Block #4282</div>
              </div>
            ) : (
              <div className="space-y-2">
                {mempool.map((item, i) => (
                  <div
                    key={item.txHash}
                    className="p-3.5 rounded-xl bg-[#1C1000] border border-[#D97706]/20 hover:border-[#D97706]/50 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                          <span className="font-bold text-[#FCD34D] font-mono">{truncateHash(item.txHash, 18)}</span>
                        </div>
                        <span className="font-bold text-[#F4F7FA]">{item.asset}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.side === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'}`}>
                          {item.side} {item.qty}
                        </span>
                        <span className="text-[#64748B]">@ ₹{item.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#64748B]">Fee: <span className="text-[#F59E0B]">{item.gasFee}</span></span>
                        <span className="text-[#64748B]">Age: <span className={`font-bold ${item.age + mempoolAge > 10 ? 'text-[#EF4444]' : 'text-[#8B95A5]'}`}>{item.age + mempoolAge}s</span></span>
                        <button
                          onClick={() => setMempool(p => p.filter(m => m.txHash !== item.txHash))}
                          className="text-[#64748B] hover:text-[#EF4444] transition-all"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar indicating age */}
                    <div className="mt-2 h-1 bg-[#1E2633] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D97706] to-[#10B981] transition-all"
                        style={{ width: `${Math.min(100, ((item.age + mempoolAge) / 15) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: P&L Analytics ── */}
        {activeTab === 'PNL' && (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-[#FCD34D] flex items-center gap-2">
                <TrendingUp size={16} /> Realized P&L Analytics
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">Cumulative realized profit & loss across all confirmed transactions</p>
            </div>

            {/* P&L Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { label: 'Total Realized P&L', value: `${totalPnl >= 0 ? '+' : ''}₹${Math.abs(totalPnl).toLocaleString('en-IN')}`, color: totalPnl >= 0 ? '#10B981' : '#EF4444' },
                { label: 'Win Rate', value: `${winRate}%`, color: '#FCD34D' },
                { label: 'Best Trade', value: `+₹${Math.max(0, ...trades.map(t => t.pnl)).toLocaleString('en-IN')}`, color: '#10B981' },
                { label: 'Worst Trade', value: `₹${Math.min(0, ...trades.map(t => t.pnl)).toLocaleString('en-IN')}`, color: '#EF4444' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl bg-[#1C1000] border border-[#D97706]/20">
                  <div className="text-[#64748B] text-[10px]">{s.label}</div>
                  <div className="font-bold text-base mt-0.5" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Cumulative P&L Chart */}
            <div>
              <div className="text-xs text-[#64748B] mb-2 uppercase tracking-wider">Cumulative Realized P&L (INR)</div>
              <div className="h-56 bg-[#0D1117] rounded-xl p-3 border border-[#1E2633]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pnlData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D97706" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="idx" stroke="#374151" tick={{ fill: '#64748B', fontSize: 9 }} />
                    <YAxis stroke="#374151" tick={{ fill: '#64748B', fontSize: 9 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0D1117', borderColor: '#242B35', fontSize: '11px', color: '#F4F7FA', borderRadius: '8px' }}
                      formatter={(v: any) => [`₹${v.toLocaleString('en-IN')}`, 'Cumulative P&L']}
                    />
                    <Area type="monotone" dataKey="cumPnl" stroke="#D97706" strokeWidth={2.5} fill="url(#pnlGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset Distribution Pie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-[#64748B] mb-2 uppercase tracking-wider">Asset Distribution</div>
                <div className="h-52 bg-[#0D1117] rounded-xl p-3 border border-[#1E2633]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {assetDist.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0D1117', borderColor: '#242B35', fontSize: '11px', color: '#F4F7FA', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px', color: '#64748B', fontFamily: 'monospace' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trade results breakdown */}
              <div>
                <div className="text-xs text-[#64748B] mb-2 uppercase tracking-wider">Win / Loss Summary</div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Winning Trades', count: winTrades, pct: winRate, color: '#10B981', bg: 'bg-[#10B981]' },
                    { label: 'Losing Trades', count: trades.length - winTrades, pct: 100 - winRate, color: '#EF4444', bg: 'bg-[#EF4444]' },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl bg-[#1C1000] border border-[#D97706]/15 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#64748B]">{s.label}</span>
                        <span className="font-bold" style={{ color: s.color }}>{s.count} ({s.pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-[#1E2633] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.bg}`} style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="p-3 rounded-xl bg-[#1C1000] border border-[#D97706]/15 text-xs">
                    <div className="text-[#64748B] mb-1">Profit Factor</div>
                    <div className="text-2xl font-bold text-[#FCD34D]">
                      {trades.filter(t => t.pnl > 0).reduce((a, t) => a + t.pnl, 0) > 0
                        ? (trades.filter(t => t.pnl > 0).reduce((a, t) => a + t.pnl, 0) /
                          Math.max(1, Math.abs(trades.filter(t => t.pnl < 0).reduce((a, t) => a + t.pnl, 0)))).toFixed(2)
                        : '0.00'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: TPS & Volume Analytics ── */}
        {activeTab === 'ANALYTICS' && (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-[#FCD34D] flex items-center gap-2">
                <BarChart2 size={16} /> Network Throughput & Volume Analytics
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">24-hour transaction throughput · Buy vs Sell volume · Exchange fee distribution</p>
            </div>

            {/* TPS Chart */}
            <div>
              <div className="text-xs text-[#64748B] mb-2 uppercase tracking-wider">Transactions Per Second (TPS) — 24H</div>
              <div className="h-52 bg-[#0D1117] rounded-xl p-3 border border-[#1E2633]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={throughputData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tpsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" stroke="#374151" tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="#374151" tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0D1117', borderColor: '#242B35', fontSize: '11px', color: '#F4F7FA', borderRadius: '8px' }}
                      formatter={(v: any) => [`${v} tx/s`, 'TPS']} />
                    <Area type="monotone" dataKey="tps" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#tpsGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Buy vs Sell Stacked Bar */}
            <div>
              <div className="text-xs text-[#64748B] mb-2 uppercase tracking-wider">Buy vs Sell Volume Distribution</div>
              <div className="h-44 bg-[#0D1117] rounded-xl p-3 border border-[#1E2633]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={throughputData.filter((_, i) => i % 3 === 0)} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="hour" stroke="#374151" tick={{ fill: '#64748B', fontSize: 9 }} />
                    <YAxis stroke="#374151" tick={{ fill: '#64748B', fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0D1117', borderColor: '#242B35', fontSize: '11px', color: '#F4F7FA', borderRadius: '8px' }} />
                    <Bar dataKey="buy" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} name="BUY" />
                    <Bar dataKey="sell" stackId="a" fill="#EF4444" radius={[2, 2, 0, 0]} name="SELL" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: Transaction Lifecycle ── */}
        {activeTab === 'LIFECYCLE' && (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-[#FCD34D] flex items-center gap-2">
                <Zap size={16} /> FIX Protocol Trade Lifecycle Tracker
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                From order placement → FIX routing → NSE matching → execution → block anchoring → cryptographic finalization
              </p>
            </div>

            {/* Select a tx to trace */}
            {!selectedLifecycleTx ? (
              <div className="space-y-3">
                <div className="text-xs text-[#64748B]">Select a transaction to trace its complete execution lifecycle:</div>
                {trades.slice(0, 6).map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleOpenLifecycle(t)}
                    className="w-full p-3.5 rounded-xl bg-[#1C1000] border border-[#D97706]/20 hover:border-[#D97706] text-left text-xs transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#F59E0B]">{t.id}</span>
                      <span className="text-[#F4F7FA]">{t.asset}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.side === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'}`}>
                        {t.side}
                      </span>
                    </div>
                    <span className="text-[#FCD34D] font-bold flex items-center gap-1">
                      Trace <ArrowUpRight size={12} />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs">
                    Tracing: <span className="text-[#F59E0B] font-bold">{selectedLifecycleTx.id}</span> · {selectedLifecycleTx.asset}
                  </div>
                  <button onClick={() => setSelectedLifecycleTx(null)} className="text-[#64748B] hover:text-white text-xs flex items-center gap-1">
                    <X size={12} /> Clear
                  </button>
                </div>

                {/* Lifecycle Stage Pipeline */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {TX_STAGES.map((stage, i) => {
                    const done = i <= lifecycleStage;
                    const active = i === lifecycleStage;
                    return (
                      <div
                        key={stage}
                        className={`p-3 rounded-xl border text-center text-xs transition-all ${
                          done
                            ? active
                              ? 'bg-[#D97706]/20 border-[#D97706] shadow-md shadow-amber-900/20'
                              : 'bg-[#10B981]/10 border-[#10B981]/40'
                            : 'bg-[#0D1117] border-[#1E2633]'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-[11px] ${
                          done
                            ? active ? 'bg-[#D97706] text-white' : 'bg-[#10B981]/20 text-[#10B981]'
                            : 'bg-[#1E2633] text-[#374151]'
                        }`}>
                          {done && !active ? '✓' : i + 1}
                        </div>
                        <div className={`font-bold leading-tight ${done ? active ? 'text-[#FCD34D]' : 'text-[#10B981]' : 'text-[#374151]'}`}>
                          {stage}
                        </div>
                        {active && (
                          <div className="mt-1 h-1 bg-[#D97706]/20 rounded-full overflow-hidden">
                            <div className="h-full bg-[#D97706] rounded-full animate-pulse" style={{ width: '60%' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Lifecycle detail table */}
                <div className="space-y-2">
                  {[
                    { stage: 'Order Placed', detail: `Order ${selectedLifecycleTx.id} submitted via broker dashboard`, ts: selectedLifecycleTx.timestamp, status: 'done' },
                    { stage: 'FIX Route', detail: `Order routed via FIX 4.4 to NSE smart order gateway`, ts: selectedLifecycleTx.timestamp, status: 'done' },
                    { stage: 'NSE Matching', detail: `Matched against NSE limit order book at ₹${selectedLifecycleTx.price.toLocaleString('en-IN')}`, ts: selectedLifecycleTx.timestamp, status: 'done' },
                    { stage: 'Execution', detail: `${selectedLifecycleTx.quantity} units filled @ ₹${selectedLifecycleTx.price.toLocaleString('en-IN')} — Total: ₹${selectedLifecycleTx.totalValue.toLocaleString('en-IN')}`, ts: selectedLifecycleTx.timestamp, status: 'done' },
                    { stage: 'Block Commit', detail: `Trade payload added to Block #${selectedLifecycleTx.blockNumber} mempool`, ts: selectedLifecycleTx.timestamp, status: 'done' },
                    { stage: 'Finalized', detail: `SHA-256 hash anchored: ${selectedLifecycleTx.txHash.slice(0, 20)}... · ECDSA signed & Merkle-proven`, ts: selectedLifecycleTx.timestamp, status: 'done' },
                  ].map((item, i) => {
                    const done = i <= lifecycleStage;
                    return (
                      <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-[11px] transition-all ${
                        done ? 'bg-[#1C1000] border-[#D97706]/20' : 'bg-[#0D1117] border-[#1E2633] opacity-40'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] ${
                          done ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' : 'bg-[#1E2633] text-[#374151]'
                        }`}>
                          {done ? '✓' : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[#FCD34D]">{item.stage}</div>
                          <div className="text-[#8B95A5] mt-0.5">{item.detail}</div>
                        </div>
                        <div className="text-[#64748B] text-[10px] shrink-0">{done ? item.ts : '—'}</div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => onNavigateToVerify(selectedLifecycleTx.id)}
                  className="w-full py-2 rounded-xl bg-[#D97706] text-white text-xs font-bold hover:bg-[#B45309] transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={14} /> Open Full Cryptographic Verification →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ━━━━ TRANSACTION DETAIL MODAL ━━━━ */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-lg bg-[#0D1117] border border-[#D97706]/40 rounded-2xl shadow-2xl p-5 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E2633] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="text-[#FCD34D]" size={18} />
                <h3 className="font-bold text-sm text-[#F4F7FA]">Transaction Detail — {selectedTxDetail.id}</h3>
              </div>
              <button onClick={() => setSelectedTxDetail(null)} className="text-[#64748B] hover:text-[#F4F7FA]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Transaction Hash (SHA-256d)', val: selectedTxDetail.txHash, color: 'text-[#FCD34D]', id: 'txH' },
                { label: 'Secp256k1 Digital Signature', val: selectedTxDetail.digitalSignature, color: 'text-[#8B95A5]', id: 'sig' },
                { label: 'Merkle Leaf Hash', val: selectedTxDetail.merkleRoot, color: 'text-[#A78BFA]', id: 'ml' },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-lg bg-[#11161D] border border-[#242B35] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#64748B]">{f.label}</span>
                    <button onClick={() => handleCopy(f.val, f.id)} className="text-[#64748B] hover:text-[#FCD34D]">
                      {copiedHash === f.id ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
                    </button>
                  </div>
                  <span className={`${f.color} font-bold break-all block text-[11px]`}>{f.val}</span>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Asset & Side', val: `${selectedTxDetail.asset} (${selectedTxDetail.side})` },
                  { label: 'Total Value', val: `₹${selectedTxDetail.totalValue.toLocaleString('en-IN')}` },
                  { label: 'P&L', val: `${selectedTxDetail.pnl >= 0 ? '+' : ''}₹${selectedTxDetail.pnl.toLocaleString('en-IN')}` },
                  { label: 'Block Anchor', val: `#${selectedTxDetail.blockNumber}` },
                ].map(s => (
                  <div key={s.label} className="p-2.5 rounded-lg bg-[#11161D] border border-[#242B35]">
                    <div className="text-[10px] text-[#64748B]">{s.label}</div>
                    <div className="font-bold text-[#F4F7FA]">{s.val}</div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#10B981]" />
                <span className="text-[#10B981] font-bold">ECDSA Signature Valid · Merkle Proof Anchored · ZK Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#1E2633]">
              <button onClick={() => setSelectedTxDetail(null)} className="px-3 py-1.5 rounded-lg text-[#64748B] font-bold">Close</button>
              <button
                onClick={() => { onNavigateToVerify(selectedTxDetail.id); setSelectedTxDetail(null); }}
                className="px-4 py-1.5 rounded-lg bg-[#D97706] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#B45309] transition-all"
              >
                <ShieldCheck size={13} /> Full Cryptographic Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
