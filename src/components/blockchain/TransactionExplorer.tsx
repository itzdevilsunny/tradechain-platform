import React, { useState, useEffect } from 'react';
import { TradeRecord } from '../../types/trading';
import { 
  Receipt, 
  Search, 
  Filter, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Zap, 
  BarChart2, 
  Download, 
  PlusCircle, 
  X, 
  CheckCircle2, 
  ArrowUpRight,
  Database,
  Radio
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TransactionExplorerProps {
  trades: TradeRecord[];
  onSelectTrade: (tradeId: string) => void;
  onNavigateToVerify: (tradeId: string) => void;
}

export const TransactionExplorer: React.FC<TransactionExplorerProps> = ({
  trades: initialTrades,
  onSelectTrade,
  onNavigateToVerify
}) => {
  const [trades, setTrades] = useState<TradeRecord[]>(initialTrades);
  const [searchQuery, setSearchQuery] = useState('');
  const [sideFilter, setSideFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [activeTab, setActiveTab] = useState<'CONFIRMED' | 'MEMPOOL' | 'ANALYTICS'>('CONFIRMED');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [selectedTxDetail, setSelectedTxDetail] = useState<TradeRecord | null>(null);

  // Live Mempool Pending Txs
  const [mempool, setMempool] = useState<Array<{
    txHash: string;
    tradeId: string;
    asset: string;
    side: 'BUY' | 'SELL';
    qty: number;
    price: number;
    gasFee: string;
    time: string;
  }>>([
    { txHash: '0x9a8f1b2c3d4e5f607182', tradeId: 'TRD-MP-101', asset: 'NIFTY 50 Futures', side: 'BUY', qty: 25, price: 24855.00, gasFee: '₹1.25', time: '2s ago' },
    { txHash: '0x3c4d5e6f7a8b9c0d1e2f', tradeId: 'TRD-MP-102', asset: 'BANK NIFTY Futures', side: 'SELL', qty: 15, price: 53435.50, gasFee: '₹1.50', time: '5s ago' },
    { txHash: '0x7e8f9a0b1c2d3e4f5a6b', tradeId: 'TRD-MP-103', asset: 'RELIANCE IND', side: 'BUY', qty: 50, price: 3048.00, gasFee: '₹1.10', time: '8s ago' },
  ]);

  // Simulate incoming live transactions
  const handleSimulateNewTx = () => {
    const newTxId = `TRD-IN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
    const txHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
    
    const assets = ['NIFTY 50 Futures', 'BANK NIFTY Futures', 'RELIANCE IND', 'TCS', 'HDFC BANK', 'BTC / INR'];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const price = asset.includes('BTC') ? 5845000 : asset.includes('BANK') ? 53420 : asset.includes('TCS') ? 4290 : 24850;
    const qty = Math.floor(5 + Math.random() * 45);

    const newTx: TradeRecord = {
      id: newTxId,
      asset,
      strategy: 'FIX Broker Route',
      side: Math.random() > 0.5 ? 'BUY' : 'SELL',
      price,
      quantity: qty,
      totalValue: price * qty,
      pnl: Math.round((Math.random() - 0.4) * 4000),
      pnlPercentage: Math.round((Math.random() - 0.4) * 5 * 100) / 100,
      stopLoss: price * 0.985,
      takeProfit: price * 1.03,
      status: 'ACTIVE',
      timestamp: timeStr,
      txHash,
      blockNumber: 4282,
      blockHash: '0x8f2a391eb4d02a01',
      merkleRoot: `0x${Math.random().toString(16).substring(2, 14)}`,
      digitalSignature: `0xsig${Math.random().toString(16).substring(2, 12)}`,
      isVerified: true
    };

    setTrades(prev => [newTx, ...prev]);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredTrades = trades.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = t.id.toLowerCase().includes(q) || 
      t.txHash.toLowerCase().includes(q) || 
      t.asset.toLowerCase().includes(q);
    const matchesSide = sideFilter === 'ALL' || t.side === sideFilter;
    return matchesSearch && matchesSide;
  });

  const handleExportCSV = () => {
    const headers = "TxHash,TradeID,Timestamp,Asset,Side,Price,Quantity,TotalValue(INR),BlockNumber,DigitalSignature\n";
    const rows = trades.map(t => 
      `"${t.txHash}",${t.id},"${t.timestamp}","${t.asset}",${t.side},${t.price},${t.quantity},${t.totalValue},#${t.blockNumber},"${t.digitalSignature}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeChain_Transactions_${Date.now()}.csv`;
    a.click();
  };

  // Transaction Throughput dataset
  const throughputData = Array.from({ length: 24 }).map((_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    tps: Math.floor(120 + Math.sin(i * 0.5) * 45 + Math.random() * 20),
    feeAvg: Math.round((1.1 + Math.cos(i * 0.4) * 0.3) * 100) / 100
  }));

  return (
    <div className="space-y-6 w-full max-w-full">
      
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-[#11161D] p-5 rounded-xl border border-slate-200 dark:border-[#242B35] shadow-sm w-full overflow-hidden">
        <div className="min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Receipt size={20} className="text-[#F59E0B] shrink-0" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] font-mono tracking-tight truncate">
              Institutional Cryptographic Transaction Explorer
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 rounded shrink-0">
              MEMPOOL & FIX ROUTE SYNCED
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8B95A5] mt-1 font-sans truncate">
            Secp256k1 digitally signed trade payloads, Zero-Knowledge Merkle leaf records & broker FIX execution paths.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleSimulateNewTx}
            className="btn-3d btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
          >
            <PlusCircle size={14} />
            <span>Simulate New Tx</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-3d btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono w-full overflow-hidden">
        
        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Total Confirmed Txs</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F4F7FA] truncate">
            {(28492 + (trades.length - initialTrades.length)).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#10B981] font-bold block truncate">+100% Audited</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Pending Mempool Stream</span>
          <div className="text-xl sm:text-2xl font-bold text-[#F59E0B] truncate">
            {mempool.length} Pending Txs
          </div>
          <span className="text-[10px] text-[#F59E0B] font-bold block truncate">Next Block Commit</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Avg Execution Latency</span>
          <div className="text-xl sm:text-2xl font-bold text-[#3B82F6] truncate">
            14.2 ms
          </div>
          <span className="text-[10px] text-slate-400 block truncate">NSE FIX Gateway</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-[#10B981]/40 space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Avg Exchange Fee</span>
          <div className="text-xl sm:text-2xl font-bold text-[#10B981] truncate">
            ₹1.29 / tx
          </div>
          <span className="text-[10px] text-slate-400 block truncate">STT + Exchange Tax</span>
        </div>

      </div>

      {/* Main Explorer Workspace with View Tabs */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm w-full overflow-hidden font-mono">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-[#F59E0B]" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider">
              {activeTab === 'CONFIRMED' && `Confirmed Transaction Ledger (${filteredTrades.length} Records)`}
              {activeTab === 'MEMPOOL' && `Live Broadcast Mempool Queue (${mempool.length} Pending)`}
              {activeTab === 'ANALYTICS' && `Transaction Throughput (TPS) & Gas Fee Analytics`}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#080A0F] p-1 rounded-lg border border-slate-200 dark:border-[#242B35]">
            <button
              onClick={() => setActiveTab('CONFIRMED')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                activeTab === 'CONFIRMED'
                  ? 'bg-white dark:bg-[#1E2631] text-[#3B82F6] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Confirmed Txs
            </button>
            <button
              onClick={() => setActiveTab('MEMPOOL')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                activeTab === 'MEMPOOL'
                  ? 'bg-white dark:bg-[#1E2631] text-[#F59E0B] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Mempool Stream
            </button>
            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                activeTab === 'ANALYTICS'
                  ? 'bg-white dark:bg-[#1E2631] text-[#10B981] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              TPS Analytics
            </button>
          </div>
        </div>

        {/* Tab 1: Confirmed Transactions Table */}
        {activeTab === 'CONFIRMED' && (
          <div className="space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Tx Hash, Trade ID, or Symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] text-slate-900 dark:text-[#F4F7FA] outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter size={14} className="text-slate-400" />
                {(['ALL', 'BUY', 'SELL'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSideFilter(s)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                      sideFilter === s 
                        ? 'bg-[#2563EB] text-white shadow-sm' 
                        : 'bg-slate-100 dark:bg-[#161D2A] text-slate-500 dark:text-[#94A3B8]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Table */}
            <div className="w-full overflow-x-auto border border-slate-100 dark:border-[#1E2631] rounded-lg">
              <table className="w-full text-left text-xs min-w-[840px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#242B35] bg-slate-50 dark:bg-[#080A0F] text-[10px] text-slate-500 dark:text-[#8B95A5] uppercase">
                    <th className="py-2.5 px-3.5">Tx Hash</th>
                    <th className="py-2.5 px-3.5">Trade ID</th>
                    <th className="py-2.5 px-3.5">Timestamp</th>
                    <th className="py-2.5 px-3.5">Asset Pair</th>
                    <th className="py-2.5 px-3.5">Side</th>
                    <th className="py-2.5 px-3.5">Execution Price</th>
                    <th className="py-2.5 px-3.5">Qty / Value</th>
                    <th className="py-2.5 px-3.5">Block Anchor</th>
                    <th className="py-2.5 px-3.5 text-right">Cryptographic Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E2633]">
                  {filteredTrades.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-[#161D2A] transition-colors whitespace-nowrap">
                      <td className="py-2.5 px-3.5 font-bold text-[#F59E0B]">
                        <button 
                          onClick={() => setSelectedTxDetail(t)}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{t.txHash.slice(0, 14)}...</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-[#3B82F6]">{t.id}</td>
                      <td className="py-2.5 px-3.5 text-slate-500 dark:text-[#94A3B8]">{t.timestamp}</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-[#F1F5F9]">{t.asset}</td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.side === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                        }`}>
                          {t.side}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-900 dark:text-[#F1F5F9]">₹{t.price.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3.5 text-slate-500 dark:text-[#94A3B8]">
                        {t.quantity} (₹{t.totalValue.toLocaleString('en-IN')})
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-400">#{t.blockNumber}</td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={() => onNavigateToVerify(t.id)}
                          className="px-2.5 py-1 rounded bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981] hover:text-white font-bold text-[10px] transition-all flex items-center gap-1 ml-auto"
                        >
                          <ShieldCheck size={12} />
                          <span>Verify Proof</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Live Mempool Queue */}
        {activeTab === 'MEMPOOL' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-[#8B95A5] flex items-center gap-2">
                <Radio size={14} className="text-[#F59E0B] animate-pulse" />
                Unconfirmed FIX trades in memory pool waiting for next block commit:
              </span>
              <button
                onClick={() => {
                  mempool.forEach(m => {
                    const newTx: TradeRecord = {
                      id: m.tradeId,
                      asset: m.asset,
                      strategy: 'Mempool FIX Route',
                      side: m.side,
                      price: m.price,
                      quantity: m.qty,
                      totalValue: m.price * m.qty,
                      pnl: 0,
                      pnlPercentage: 0,
                      stopLoss: m.price * 0.985,
                      takeProfit: m.price * 1.03,
                      status: 'ACTIVE',
                      timestamp: 'Just now',
                      txHash: m.txHash,
                      blockNumber: 4282,
                      blockHash: '0x8f2a391eb4d02a01',
                      merkleRoot: '0x9ab42ef71d5b128c',
                      digitalSignature: '0xsig99120',
                      isVerified: true
                    };
                    setTrades(prev => [newTx, ...prev]);
                  });
                  setMempool([]);
                }}
                disabled={mempool.length === 0}
                className="px-3 py-1 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold text-xs disabled:opacity-50"
              >
                Commit Mempool to Block #4282
              </button>
            </div>

            {mempool.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-sans border border-slate-100 dark:border-[#242B35] rounded-xl">
                Mempool queue empty. All pending trades committed into Block #4282!
              </div>
            ) : (
              mempool.map(item => (
                <div key={item.txHash} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#F59E0B]">{item.txHash}</span>
                    <span className="font-bold text-slate-900 dark:text-[#F4F7FA]">{item.asset}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.side === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'}`}>
                      {item.side} {item.qty}
                    </span>
                    <span className="text-slate-500">@ ₹{item.price.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">Fee: {item.gasFee}</span>
                    <span className="text-slate-500 text-[11px]">{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Throughput & Gas Fee Analytics */}
        {activeTab === 'ANALYTICS' && (
          <div className="h-72 w-full bg-slate-50 dark:bg-[#080A0F] rounded-xl p-3 border border-slate-200 dark:border-[#1E2631] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={throughputData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tpsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis stroke="#64748B" width={45} tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0D1117', 
                    borderColor: '#242B35', 
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: '#F4F7FA',
                    borderRadius: '8px'
                  }} 
                  formatter={(val: any) => [`${val} Trades / Sec`, 'Throughput (TPS)']}
                />
                <Area type="monotone" dataKey="tps" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#tpsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>

      {/* Transaction Detail Inspector Modal */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-lg bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#242B35] rounded-2xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242B35] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="text-[#F59E0B]" size={18} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#F4F7FA]">
                  Transaction Cryptographic Detail ({selectedTxDetail.id})
                </h3>
              </div>
              <button onClick={() => setSelectedTxDetail(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-[#F4F7FA]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] space-y-1">
                <span className="text-slate-400 text-[10px] block">Transaction Hash (SHA-256 Digest)</span>
                <span className="text-[#F59E0B] font-bold break-all block">{selectedTxDetail.txHash}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35]">
                  <span className="text-slate-400 text-[10px] block">Asset & Side</span>
                  <span className="font-bold text-slate-900 dark:text-[#F4F7FA] block">{selectedTxDetail.asset} ({selectedTxDetail.side})</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35]">
                  <span className="text-slate-400 text-[10px] block">Total Value (INR)</span>
                  <span className="font-bold text-[#10B981] block">₹{selectedTxDetail.totalValue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] space-y-1">
                <span className="text-slate-400 text-[10px] block">Secp256k1 Digital Signature</span>
                <span className="text-slate-900 dark:text-[#F4F7FA] font-bold break-all block">{selectedTxDetail.digitalSignature}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#242B35]">
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="px-3 py-1.5 rounded-lg text-slate-500 font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onNavigateToVerify(selectedTxDetail.id);
                  setSelectedTxDetail(null);
                }}
                className="btn-3d btn-3d-success px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>Verify Proof</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
