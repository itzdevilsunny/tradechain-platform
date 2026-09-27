import React, { useState, useEffect, useCallback } from 'react';
import { BlockHeader, TradeRecord } from '../../types/trading';
import {
  Box, Search, Copy, Check, Code, Server, X,
  Blocks, Zap, RefreshCw, CheckCircle2, Lock,
  Layers, ArrowRight, Cpu, Activity, BarChart2,
  Hash, TrendingUp, Network, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface BlockExplorerProps {
  blocks: BlockHeader[];
  trades: TradeRecord[];
  onSelectTrade: (tradeId: string) => void;
  onNavigateToVerify: (tradeId: string) => void;
}

const truncateHash = (h: string, n = 14) => `${h.slice(0, n)}...${h.slice(-4)}`;

// Generate live nonce-mining progress
const generateNonceProgress = () =>
  Array.from({ length: 16 }, (_, i) => ({
    step: i,
    nonce: Math.floor(50000 + i * 15000 + Math.random() * 5000),
    hashLeadingZeros: Math.min(4, Math.floor(i / 4)),
    found: i === 15,
  }));

// Block time chart data
const generateBlockTimeData = (blocks: BlockHeader[]) =>
  blocks.slice(0, 12).map((b, i) => ({
    block: `#${b.blockNumber}`,
    txCount: b.txCount,
    blockTime: Math.round(2.8 + Math.random() * 0.8),
    gasUsed: Math.round(75 + Math.random() * 20),
  })).reverse();

// Network Topology Nodes
const VALIDATOR_NODES = [
  { id: 'NSE-1', name: 'NSE Node #1', location: 'BKC, Mumbai', status: 'ACTIVE', latency: 12, uptime: 99.99, blocks: 1847, pubKey: '0x04a91f...9b2c' },
  { id: 'BSE-2', name: 'BSE Clearing #2', location: 'Dalal Street, Mumbai', status: 'ACTIVE', latency: 16, uptime: 99.97, blocks: 1203, pubKey: '0x04b82d...4c1a' },
  { id: 'UPX-3', name: 'Upstox Gateway', location: 'Bengaluru', status: 'ACTIVE', latency: 21, uptime: 99.94, blocks: 984, pubKey: '0x04c73a...8f3d' },
  { id: 'TCH-4', name: 'TradeChain Vault', location: 'Frankfurt, DE', status: 'ACTIVE', latency: 88, uptime: 99.91, blocks: 756, pubKey: '0x04d64f...1e9a' },
];

export const BlockExplorer: React.FC<BlockExplorerProps> = ({
  blocks: initialBlocks,
  trades,
  onSelectTrade,
  onNavigateToVerify
}) => {
  const [blocks, setBlocks] = useState<BlockHeader[]>(initialBlocks);
  const [selectedBlockNumber, setSelectedBlockNumber] = useState<number>(initialBlocks[0]?.blockNumber || 4281);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isMiningBlock, setIsMiningBlock] = useState(false);
  const [selectedRawBlockJson, setSelectedRawBlockJson] = useState<BlockHeader | null>(null);
  const [activeTab, setActiveTab] = useState<'EXPLORER' | 'ANALYTICS' | 'NETWORK' | 'NONCE_LAB'>('EXPLORER');
  const [nonceProgress, setNonceProgress] = useState(generateNonceProgress());
  const [blockTimeData, setBlockTimeData] = useState(generateBlockTimeData(initialBlocks));
  const [autoMine, setAutoMine] = useState(false);
  const [miningLog, setMiningLog] = useState<string[]>([]);
  const [nonceTrials, setNonceTrials] = useState<number>(0);
  const [currentMiningNonce, setCurrentMiningNonce] = useState<number>(0);

  // Auto-mine interval
  useEffect(() => {
    if (!autoMine) return;
    const t = setInterval(() => {
      handleMineNewBlock();
    }, 6000);
    return () => clearInterval(t);
  }, [autoMine, blocks]);

  // Live nonce ticker (for Nonce Lab visual)
  useEffect(() => {
    if (activeTab !== 'NONCE_LAB') return;
    const t = setInterval(() => {
      setNonceTrials(prev => prev + Math.floor(800 + Math.random() * 400));
      setCurrentMiningNonce(prev => prev + Math.floor(100 + Math.random() * 200));
    }, 100);
    return () => clearInterval(t);
  }, [activeTab]);

  const handleMineNewBlock = useCallback(() => {
    setIsMiningBlock(true);
    const startTime = Date.now();
    setTimeout(() => {
      setBlocks(prev => {
        const topBlock = prev[0] || { blockNumber: 4281, blockHash: '0x8f2a391eb4d02a01' };
        const newBlockNum = topBlock.blockNumber + 1;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
        const newTxHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
        const nonce = Math.floor(100000 + Math.random() * 900000);

        const newBlock: BlockHeader = {
          blockNumber: newBlockNum,
          blockHash: newTxHash,
          previousHash: topBlock.blockHash,
          timestamp: timeStr,
          txCount: Math.floor(18 + Math.random() * 14),
          merkleRoot: `0x${Math.random().toString(16).substring(2, 14)}`,
          validator: VALIDATOR_NODES[Math.floor(Math.random() * VALIDATOR_NODES.length)].name,
          nonce,
          status: 'VALID',
          trades: trades.slice(0, 4)
        };

        setSelectedBlockNumber(newBlockNum);
        const elapsed = Date.now() - startTime;
        setMiningLog(prev => [
          `[${timeStr}] Block #${newBlockNum} mined in ${elapsed}ms · Nonce: ${nonce.toLocaleString()} · Hash: ${newTxHash.slice(0, 18)}...`,
          ...prev.slice(0, 9)
        ]);
        setBlockTimeData(d => [
          { block: `#${newBlockNum}`, txCount: newBlock.txCount, blockTime: Math.round(elapsed / 100) / 10, gasUsed: Math.round(75 + Math.random() * 20) },
          ...d.slice(0, 11)
        ]);
        return [newBlock, ...prev];
      });
      setIsMiningBlock(false);
    }, 800);
  }, [trades]);

  const selectedBlock = blocks.find(b => b.blockNumber === selectedBlockNumber) || blocks[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredBlocks = blocks.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      b.blockNumber.toString().includes(q) ||
      b.blockHash.toLowerCase().includes(q) ||
      b.merkleRoot.toLowerCase().includes(q) ||
      b.validator.toLowerCase().includes(q)
    );
  });

  const avgBlockTime = 3.2;
  const totalTx = blocks.reduce((a, b) => a + b.txCount, 0);
  const networkTps = Math.round((totalTx / (blocks.length * avgBlockTime)) * 10) / 10;

  return (
    <div className="space-y-5 w-full max-w-full font-mono">

      {/* ━━━━ HEADER — Blue Theme ━━━━ */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4
        bg-gradient-to-r from-[#0A1628] via-[#0D1E3A] to-[#071525]
        p-5 rounded-2xl border border-[#1D4ED8]/40 shadow-lg shadow-blue-900/20 w-full overflow-hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-[#1D4ED8]/20 border border-[#1D4ED8]/30">
              <Blocks size={18} className="text-[#60A5FA]" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Consensus Block Explorer
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#1D4ED8]/20 text-[#60A5FA] border border-[#1D4ED8]/40 rounded">
              POA NETWORK
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${
              autoMine ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 animate-pulse' : 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20'
            }`}>
              {autoMine ? '● AUTO-MINE ON' : '○ MANUAL MODE'}
            </span>
          </div>
          <p className="text-xs text-[#8B95A5]">
            Live block production · Nonce brute-force lab · Network topology matrix · PoA validator consensus
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleMineNewBlock}
            disabled={isMiningBlock}
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md
              bg-[#1D4ED8] hover:bg-[#1E40AF] text-white transition-all disabled:opacity-50"
          >
            {isMiningBlock ? (
              <><RefreshCw size={14} className="animate-spin" /><span>Mining...</span></>
            ) : (
              <><Zap size={14} fill="currentColor" /><span>Mine Block</span></>
            )}
          </button>
          <button
            onClick={() => setAutoMine(p => !p)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              autoMine
                ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/25'
                : 'border-[#1D4ED8]/40 text-[#60A5FA] hover:bg-[#1D4ED8]/10'
            }`}
          >
            <Activity size={14} />
            {autoMine ? 'Stop Auto-Mine' : 'Auto-Mine'}
          </button>
        </div>
      </div>

      {/* ━━━━ KPI CARDS ━━━━ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[
          { label: 'Latest Block', value: `#${blocks[0]?.blockNumber || 4281}`, sub: 'Chain Head', color: '#60A5FA', icon: <Box size={18} className="text-[#60A5FA]" /> },
          { label: 'Network TPS', value: `${networkTps}`, sub: 'Trades / Second', color: '#3B82F6', icon: <TrendingUp size={18} className="text-[#3B82F6]" /> },
          { label: 'Active Validators', value: `${VALIDATOR_NODES.length}`, sub: '100% Consensus', color: '#10B981', icon: <Network size={18} className="text-[#10B981]" /> },
          { label: 'Avg Block Time', value: `${avgBlockTime}s`, sub: 'PoA Deterministic', color: '#F59E0B', icon: <Cpu size={18} className="text-[#F59E0B]" /> },
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
        <div className="flex items-center gap-1 p-3 border-b border-[#1E2633] bg-[#0A1628] overflow-x-auto">
          {([
            { key: 'EXPLORER', label: 'Block Cards & Inspector', icon: <Box size={13} /> },
            { key: 'ANALYTICS', label: 'Block Analytics', icon: <BarChart2 size={13} /> },
            { key: 'NETWORK', label: 'Validator Network', icon: <Network size={13} /> },
            { key: 'NONCE_LAB', label: 'Nonce Mining Lab', icon: <Hash size={13} /> },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-[#1D4ED8] text-white shadow-md'
                  : 'text-[#64748B] hover:text-[#60A5FA] hover:bg-[#1D4ED8]/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Block Cards & Inspector ── */}
        {activeTab === 'EXPLORER' && (
          <div className="p-5 space-y-5">
            {/* Search bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search block #, hash, validator..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#0D1117] border border-[#242B35] text-[#F4F7FA] outline-none focus:border-[#1D4ED8]/60"
                />
              </div>
              <div className="text-xs text-[#64748B] flex items-center gap-2">
                <Layers size={13} className="text-[#60A5FA]" />
                {filteredBlocks.length} blocks in chain
              </div>
            </div>

            {/* Block card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredBlocks.slice(0, 8).map(block => {
                const isSelected = block.blockNumber === selectedBlockNumber;
                return (
                  <div
                    key={block.blockNumber}
                    onClick={() => setSelectedBlockNumber(block.blockNumber)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-2 relative group ${
                      isSelected
                        ? 'bg-[#0A1628] border-[#1D4ED8] shadow-lg shadow-blue-900/30 ring-1 ring-[#3B82F6]/30'
                        : 'bg-[#0D1117] border-[#242B35] hover:border-[#1D4ED8]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ color: isSelected ? '#60A5FA' : '#F4F7FA' }}>
                        Block #{block.blockNumber}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] bg-[#10B981]/15 text-[#10B981] rounded font-bold">VALID</span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Tx Records:</span>
                        <span className="font-bold text-[#3B82F6]">{block.txCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Nonce:</span>
                        <span className="font-bold text-[#F59E0B]">{block.nonce.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Validator:</span>
                        <span className="text-[#8B95A5] truncate max-w-[80px]">{block.validator.split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="text-[9px] text-[#374151] font-mono truncate pt-1 border-t border-[#1E2633]">
                      {block.blockHash.slice(0, 22)}...
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); setSelectedRawBlockJson(block); }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-[#1D4ED8]/15 text-[#60A5FA] hover:bg-[#1D4ED8] hover:text-white transition-all"
                    >
                      <Code size={11} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Selected Block Detail */}
            {selectedBlock && (
              <div className="p-4 rounded-xl bg-[#0A1628] border border-[#1D4ED8]/40 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-[#60A5FA] flex items-center gap-2">
                    <Box size={15} />
                    Inspecting Block #{selectedBlock.blockNumber} — Detailed Header
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B]">{selectedBlock.timestamp}</span>
                    <button
                      onClick={() => setSelectedRawBlockJson(selectedBlock)}
                      className="px-3 py-1 rounded-lg bg-[#1D4ED8]/15 text-[#60A5FA] hover:bg-[#1D4ED8] hover:text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                    >
                      <Code size={12} /> Raw JSON
                    </button>
                  </div>
                </div>

                {/* Hash Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'Block Hash (SHA-256)', val: selectedBlock.blockHash, color: 'text-[#60A5FA]', id: 'bh' },
                    { label: 'Previous Block Hash', val: selectedBlock.previousHash, color: 'text-[#64748B]', id: 'ph' },
                    { label: 'Merkle Root', val: selectedBlock.merkleRoot, color: 'text-[#F59E0B]', id: 'mr' },
                  ].map(f => (
                    <div key={f.label} className="p-3 rounded-lg bg-[#0D1117] border border-[#242B35] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#64748B]">{f.label}</span>
                        <button onClick={() => handleCopy(f.val, f.id)} className="text-[#64748B] hover:text-[#60A5FA]">
                          {copiedHash === f.id ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <span className={`${f.color} font-bold break-all block text-[11px]`}>{f.val}</span>
                    </div>
                  ))}
                </div>

                {/* Secondary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { label: 'Validator Node', val: selectedBlock.validator, color: '#8B95A5' },
                    { label: 'Nonce', val: selectedBlock.nonce.toLocaleString(), color: '#F59E0B' },
                    { label: 'Tx Count', val: `${selectedBlock.txCount} Records`, color: '#10B981' },
                    { label: 'Block Status', val: selectedBlock.status, color: '#10B981' },
                  ].map(s => (
                    <div key={s.label} className="p-2.5 rounded-lg bg-[#0D1117] border border-[#242B35]">
                      <span className="text-[10px] text-[#64748B] block">{s.label}</span>
                      <span className="font-bold truncate block" style={{ color: s.color }}>{s.val}</span>
                    </div>
                  ))}
                </div>

                {/* Chain linkage visual */}
                <div className="flex items-center gap-2 text-xs overflow-x-auto">
                  <div className="p-2 rounded-lg bg-[#1E2633] border border-[#242B35] text-[#64748B] shrink-0">
                    ← Prev #{selectedBlock.blockNumber - 1}
                  </div>
                  <ArrowRight size={14} className="text-[#1D4ED8] shrink-0" />
                  <div className="p-2 rounded-lg bg-[#1D4ED8]/15 border border-[#1D4ED8] text-[#60A5FA] font-bold shrink-0">
                    Block #{selectedBlock.blockNumber} (ACTIVE)
                  </div>
                  <ArrowRight size={14} className="text-[#1D4ED8] shrink-0" />
                  <div className="p-2 rounded-lg bg-[#1E2633] border border-[#242B35] text-[#64748B] shrink-0">
                    Next #{selectedBlock.blockNumber + 1} →
                  </div>
                </div>
              </div>
            )}

            {/* Mining Log */}
            {miningLog.length > 0 && (
              <div className="p-3 rounded-xl bg-[#0D1117] border border-[#1E2633] space-y-1.5">
                <div className="text-[10px] text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={11} className="text-[#3B82F6]" /> Mining Activity Log
                </div>
                {miningLog.map((log, i) => (
                  <div key={i} className="text-[10px] text-[#64748B] font-mono">{log}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Block Analytics ── */}
        {activeTab === 'ANALYTICS' && (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-[#60A5FA] flex items-center gap-2">
                <BarChart2 size={16} /> Block Production Analytics
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Transaction throughput per block · Block time distribution · Gas usage trends
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Blocks', value: blocks.length, color: '#60A5FA' },
                { label: 'Avg Tx / Block', value: Math.round(totalTx / Math.max(blocks.length, 1)), color: '#10B981' },
                { label: 'Avg Block Time', value: `${avgBlockTime}s`, color: '#F59E0B' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl bg-[#0D1117] border border-[#242B35] text-center">
                  <div className="text-xs text-[#64748B]">{s.label}</div>
                  <div className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Tx per block bar chart */}
            <div>
              <div className="text-xs text-[#64748B] mb-2 uppercase tracking-wider">Transactions Per Block</div>
              <div className="h-52 bg-[#0D1117] rounded-xl p-3 border border-[#1E2633]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={blockTimeData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="block" stroke="#374151" tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="#374151" tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'monospace' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0D1117', borderColor: '#242B35', fontSize: '11px', color: '#F4F7FA', borderRadius: '8px' }}
                      formatter={(v: any) => [`${v} Txns`, 'Count']}
                    />
                    <Bar dataKey="txCount" fill="#1D4ED8" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Block time area chart */}
            <div>
              <div className="text-xs text-[#64748B] mb-2 uppercase tracking-wider">Block Commit Time (seconds)</div>
              <div className="h-44 bg-[#0D1117] rounded-xl p-3 border border-[#1E2633]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={blockTimeData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="btGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="block" stroke="#374151" tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="#374151" tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'monospace' }} domain={[2, 4]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0D1117', borderColor: '#242B35', fontSize: '11px', color: '#F4F7FA', borderRadius: '8px' }}
                      formatter={(v: any) => [`${v}s`, 'Block Time']}
                    />
                    <Area type="monotone" dataKey="blockTime" stroke="#3B82F6" strokeWidth={2} fill="url(#btGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: Validator Network ── */}
        {activeTab === 'NETWORK' && (
          <div className="p-5 space-y-4">
            <div>
              <h3 className="font-bold text-[#60A5FA] flex items-center gap-2">
                <Network size={16} /> PoA Consortium Validator Network
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Proof-of-Authority nodes participating in block proposal and finalization across the TradeChain consortium
              </p>
            </div>

            {/* Network Stats */}
            <div className="grid grid-cols-4 gap-3 text-xs">
              {[
                { label: 'Total Nodes', v: VALIDATOR_NODES.length, c: '#60A5FA' },
                { label: 'Active', v: VALIDATOR_NODES.filter(n => n.status === 'ACTIVE').length, c: '#10B981' },
                { label: 'Total Blocks', v: VALIDATOR_NODES.reduce((a, n) => a + n.blocks, 0).toLocaleString(), c: '#A78BFA' },
                { label: 'Consensus', v: '100%', c: '#F59E0B' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl bg-[#0D1117] border border-[#242B35] text-center">
                  <div className="text-[#64748B] text-[10px]">{s.label}</div>
                  <div className="font-bold text-base mt-0.5" style={{ color: s.c }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Node Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VALIDATOR_NODES.map(node => (
                <div key={node.id} className="p-4 rounded-xl bg-[#0A1628] border border-[#1D4ED8]/30 space-y-3 text-xs hover:border-[#1D4ED8] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[#1D4ED8]/15">
                        <Server size={15} className="text-[#60A5FA]" />
                      </div>
                      <div>
                        <div className="font-bold text-[#F4F7FA]">{node.name}</div>
                        <div className="text-[#64748B] text-[10px]">{node.location}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded font-bold">
                      ● {node.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Latency', val: `${node.latency}ms`, color: node.latency < 30 ? '#10B981' : '#F59E0B' },
                      { label: 'Uptime', val: `${node.uptime}%`, color: '#10B981' },
                      { label: 'Blocks', val: node.blocks.toLocaleString(), color: '#60A5FA' },
                    ].map(s => (
                      <div key={s.label} className="p-2 rounded-lg bg-[#0D1117] border border-[#1E2633] text-center">
                        <div className="text-[10px] text-[#64748B]">{s.label}</div>
                        <div className="font-bold" style={{ color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2 rounded-lg bg-[#0D1117] border border-[#1E2633]">
                    <div className="text-[10px] text-[#64748B] mb-0.5">Public Key (secp256k1)</div>
                    <div className="font-mono text-[#60A5FA] text-[11px]">{node.pubKey}</div>
                  </div>

                  {/* Uptime bar */}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-[#64748B]">Availability</span>
                      <span className="text-[#10B981] font-bold">{node.uptime}%</span>
                    </div>
                    <div className="h-1.5 bg-[#1E2633] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#10B981]"
                        style={{ width: `${node.uptime}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: Nonce Mining Lab ── */}
        {activeTab === 'NONCE_LAB' && (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-[#60A5FA] flex items-center gap-2">
                <Hash size={16} /> Nonce Brute-Force Mining Simulator
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Visualizes the PoA block sealing process — incrementing nonces until the block hash satisfies the difficulty target (leading zeros)
              </p>
            </div>

            {/* Live counters */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#1D4ED8]/40 text-center">
                <div className="text-xs text-[#64748B]">Nonce Trials / sec</div>
                <div className="text-2xl font-bold text-[#60A5FA] tabular-nums">
                  {(nonceTrials % 100000).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#1D4ED8]/40 text-center">
                <div className="text-xs text-[#64748B]">Current Nonce</div>
                <div className="text-2xl font-bold text-[#F59E0B] tabular-nums">
                  {currentMiningNonce.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#1D4ED8]/40 text-center">
                <div className="text-xs text-[#64748B]">Difficulty Target</div>
                <div className="text-2xl font-bold text-[#10B981]">0000xxxx</div>
              </div>
            </div>

            {/* Nonce attempt visualization */}
            <div className="space-y-2">
              <div className="text-[10px] text-[#64748B] uppercase tracking-wider">Hash Computation Attempts</div>
              {nonceProgress.map((step, i) => {
                const isFound = step.found;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-[10px] font-mono transition-all ${
                      isFound
                        ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]'
                        : step.hashLeadingZeros > 0
                        ? 'bg-[#1D4ED8]/5 border-[#1D4ED8]/20 text-[#60A5FA]'
                        : 'bg-[#0D1117] border-[#1E2633] text-[#374151]'
                    }`}
                  >
                    <span className="w-20 shrink-0 text-[#64748B]">Nonce {step.nonce.toLocaleString()}</span>
                    <span className="flex-1 truncate">
                      {isFound ? '0000' : step.hashLeadingZeros > 0 ? '0'.repeat(step.hashLeadingZeros) : ''}
                      {`${Math.random().toString(16).substring(2, 18).toUpperCase()}...`}
                    </span>
                    <span className={`shrink-0 px-1.5 py-0.5 rounded font-bold text-[9px] ${
                      isFound ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#1E2633] text-[#374151]'
                    }`}>
                      {isFound ? '✓ FOUND' : `${step.hashLeadingZeros} zeros`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Block sealing explanation */}
            <div className="p-4 rounded-xl bg-[#0A1628] border border-[#1D4ED8]/30 space-y-3">
              <h4 className="font-bold text-[#60A5FA] text-xs">How PoA Block Sealing Works</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {[
                  { step: '1', title: 'Collect Txns', desc: 'Pending trades are pulled from the mempool queue, forming the block payload.' },
                  { step: '2', title: 'Compute Merkle Root', desc: 'SHA-256 hash the trade leaves, pair them upward to compute the Merkle root.' },
                  { step: '3', title: 'Seal Block', desc: 'Validator signs the block header (prev hash + Merkle root + nonce) with secp256k1 private key.' },
                ].map(s => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#1D4ED8]/20 border border-[#1D4ED8]/40 flex items-center justify-center text-[10px] font-bold text-[#60A5FA] shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <div className="font-bold text-[#F4F7FA]">{s.title}</div>
                      <div className="text-[#64748B] mt-0.5 leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ━━━━ LEDGER TABLE ━━━━ */}
      <div className="p-5 rounded-2xl bg-[#11161D] border border-[#242B35] space-y-3 shadow-sm">
        <h3 className="font-bold text-xs text-[#60A5FA] uppercase tracking-wider flex items-center gap-2">
          <Layers size={14} /> Full Block History Ledger
        </h3>
        <div className="w-full overflow-x-auto border border-[#1E2633] rounded-xl">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-[#0A1628] border-b border-[#242B35] text-[10px] text-[#64748B] uppercase">
                <th className="py-2.5 px-3.5">Block #</th>
                <th className="py-2.5 px-3.5">Timestamp</th>
                <th className="py-2.5 px-3.5">Tx Count</th>
                <th className="py-2.5 px-3.5">Block Hash</th>
                <th className="py-2.5 px-3.5">Merkle Root</th>
                <th className="py-2.5 px-3.5">Validator</th>
                <th className="py-2.5 px-3.5">Nonce</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2633]">
              {filteredBlocks.map(b => (
                <tr
                  key={b.blockNumber}
                  className={`hover:bg-[#0A1628]/60 transition-colors whitespace-nowrap cursor-pointer ${
                    selectedBlockNumber === b.blockNumber ? 'bg-[#0A1628]/80' : ''
                  }`}
                  onClick={() => setSelectedBlockNumber(b.blockNumber)}
                >
                  <td className="py-2.5 px-3.5 font-bold text-[#60A5FA]">#{b.blockNumber}</td>
                  <td className="py-2.5 px-3.5 text-[#8B95A5]">{b.timestamp}</td>
                  <td className="py-2.5 px-3.5 font-bold text-[#F4F7FA]">{b.txCount}</td>
                  <td className="py-2.5 px-3.5 font-mono text-[#3B82F6]">{truncateHash(b.blockHash)}</td>
                  <td className="py-2.5 px-3.5 font-mono text-[#F59E0B]">{truncateHash(b.merkleRoot)}</td>
                  <td className="py-2.5 px-3.5 text-[#8B95A5]">{b.validator}</td>
                  <td className="py-2.5 px-3.5 text-[#64748B]">{b.nonce.toLocaleString()}</td>
                  <td className="py-2.5 px-3.5 text-right">
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedRawBlockJson(b); }}
                      className="px-2.5 py-1 rounded bg-[#1D4ED8]/15 text-[#60A5FA] hover:bg-[#1D4ED8] hover:text-white font-bold text-[10px] transition-all"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ━━━━ RAW JSON MODAL ━━━━ */}
      {selectedRawBlockJson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0D1117] border border-[#1D4ED8]/40 rounded-2xl shadow-2xl p-5 font-mono text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E2633] pb-3">
              <div className="flex items-center gap-2">
                <Code className="text-[#60A5FA]" size={18} />
                <h3 className="font-bold text-sm text-[#F4F7FA]">
                  Block #{selectedRawBlockJson.blockNumber} — Raw JSON Payload
                </h3>
              </div>
              <button onClick={() => setSelectedRawBlockJson(null)} className="text-[#64748B] hover:text-[#F4F7FA]">
                <X size={16} />
              </button>
            </div>

            <div className="bg-[#020408] text-[#10B981] p-4 rounded-xl max-h-80 overflow-y-auto text-[11px] border border-[#0D2010] font-mono">
              <pre>{JSON.stringify(selectedRawBlockJson, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleCopy(JSON.stringify(selectedRawBlockJson, null, 2), 'rawJson')}
                className="px-3 py-1.5 rounded-lg border border-[#1D4ED8]/40 text-[#60A5FA] hover:bg-[#1D4ED8]/10 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                {copiedHash === 'rawJson' ? <Check size={13} className="text-[#10B981]" /> : <Copy size={13} />}
                {copiedHash === 'rawJson' ? 'Copied!' : 'Copy JSON'}
              </button>
              <button onClick={() => setSelectedRawBlockJson(null)} className="px-4 py-1.5 rounded-lg bg-[#1D4ED8] text-white font-bold text-xs hover:bg-[#1E40AF] transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
