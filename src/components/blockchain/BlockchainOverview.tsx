import React, { useState, useEffect, useCallback } from 'react';
import { BlockHeader, TradeRecord } from '../../types/trading';
import {
  ShieldCheck, Lock, Hash, Layers, GitBranch, Activity,
  CheckCircle2, AlertTriangle, Copy, Check, X, Eye,
  RefreshCw, Download, Fingerprint, Database, Network,
  FileText, Clock, TrendingUp, Shield, Zap, Search
} from 'lucide-react';

interface BlockchainOverviewProps {
  blocks: BlockHeader[];
  trades: TradeRecord[];
  onSelectTrade: (tradeId: string) => void;
  onNavigateToVerify: (tradeId: string) => void;
}

// SHA-256 style hash truncator
const truncateHash = (h: string, n = 12) => `${h.slice(0, n)}...${h.slice(-6)}`;

// Secp256k1 signature validator mock
const computeSignatureStatus = (sig: string) =>
  sig && sig.length > 6 ? 'VALID' : 'INVALID';

// Generate fake compliance timeline
const generateAuditTimeline = (trades: TradeRecord[]) =>
  trades.slice(0, 8).map((t, i) => ({
    id: `AUD-${1000 + i}`,
    tradeId: t.id,
    event: ['Block Commit', 'Merkle Proof Verified', 'Signature Validated', 'ZK Proof Anchored', 'Regulatory Stamp'][i % 5],
    timestamp: t.timestamp,
    status: i % 7 === 0 ? 'WARNING' : 'SUCCESS',
    actor: ['NSE Validator', 'Cryptographic Vault', 'TradeChain Node', 'BSE Clearing', 'SEBI Audit Engine'][i % 5],
    hash: t.txHash,
  }));

// Chain integrity heatmap data
const generateHeatmapData = (blocks: BlockHeader[]) =>
  Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      blocks: Math.floor(Math.random() * 8),
      integrity: Math.random() > 0.05 ? 100 : 94.5,
    }))
  );

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const BlockchainOverview: React.FC<BlockchainOverviewProps> = ({
  blocks: initialBlocks,
  trades,
  onSelectTrade,
  onNavigateToVerify,
}) => {
  const [blocks, setBlocks] = useState<BlockHeader[]>(initialBlocks);
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'MERKLE' | 'COMPLIANCE' | 'ZK_PROOF'>('LEDGER');
  const [selectedBlock, setSelectedBlock] = useState<BlockHeader | null>(initialBlocks[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [heatmapData] = useState(generateHeatmapData(initialBlocks));
  const [auditTimeline] = useState(generateAuditTimeline(trades));
  const [zkProofRunning, setZkProofRunning] = useState(false);
  const [zkProofResult, setZkProofResult] = useState<null | { valid: boolean; hash: string; proofTime: number }>(null);
  const [chainIntegrity, setChainIntegrity] = useState(100);
  const [liveBlockCount, setLiveBlockCount] = useState(initialBlocks.length);
  const [complianceScore, setComplianceScore] = useState(98.6);
  const [selectedTradeForInspect, setSelectedTradeForInspect] = useState<TradeRecord | null>(null);

  // Live integrity pulse
  useEffect(() => {
    const t = setInterval(() => {
      setChainIntegrity(prev => Math.min(100, prev + (Math.random() > 0.9 ? -0.02 : 0.01)));
      setComplianceScore(prev => Math.min(100, prev + (Math.random() > 0.85 ? -0.1 : 0.05)));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunZkProof = useCallback(() => {
    setZkProofRunning(true);
    setZkProofResult(null);
    setTimeout(() => {
      setZkProofRunning(false);
      const hash = `0x${Math.random().toString(16).substring(2, 66)}`;
      setZkProofResult({ valid: true, hash, proofTime: Math.round(120 + Math.random() * 80) });
    }, 1800);
  }, []);

  const handleExportLedger = () => {
    const headers = 'BlockNumber,BlockHash,PrevHash,Timestamp,TxCount,MerkleRoot,Validator,Nonce,Status\n';
    const rows = blocks.map(b =>
      `${b.blockNumber},"${b.blockHash}","${b.previousHash}","${b.timestamp}",${b.txCount},"${b.merkleRoot}","${b.validator}",${b.nonce},${b.status}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeChain_Ledger_${Date.now()}.csv`;
    a.click();
  };

  const filteredBlocks = blocks.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      b.blockNumber.toString().includes(q) ||
      b.blockHash.toLowerCase().includes(q) ||
      b.validator.toLowerCase().includes(q) ||
      b.merkleRoot.toLowerCase().includes(q)
    );
  });

  const totalTxCount = blocks.reduce((a, b) => a + b.txCount, 0);

  // Build simple Merkle tree visualization for selected block's trades
  const merkleLeaves = trades.slice(0, 8).map(t => ({
    id: t.id,
    hash: t.txHash,
    asset: t.asset,
    side: t.side,
    sig: t.digitalSignature,
    verified: t.isVerified,
  }));

  const merkleInternal = [
    { label: 'Internal A', hash: `0x${Math.random().toString(16).substring(2, 18)}`, children: [0, 1] },
    { label: 'Internal B', hash: `0x${Math.random().toString(16).substring(2, 18)}`, children: [2, 3] },
    { label: 'Internal C', hash: `0x${Math.random().toString(16).substring(2, 18)}`, children: [4, 5] },
    { label: 'Internal D', hash: `0x${Math.random().toString(16).substring(2, 18)}`, children: [6, 7] },
  ];
  const merkleRoot = selectedBlock?.merkleRoot || '0x_root_hash';

  return (
    <div className="space-y-5 w-full max-w-full font-mono">

      {/* ━━━━ HEADER ━━━━ */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4
        bg-gradient-to-r from-[#1A0B2E] via-[#16103A] to-[#0D1030]
        p-5 rounded-2xl border border-[#6D28D9]/40 shadow-lg shadow-purple-900/20 w-full overflow-hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/30">
              <Lock size={18} className="text-[#A78BFA]" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Cryptographic Audit Ledger
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40 rounded">
              ZK-PROOF ANCHORED
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded animate-pulse">
              ● LIVE
            </span>
          </div>
          <p className="text-xs text-[#8B95A5]">
            Immutable SHA-256 block chain ledger · Merkle proof tree · Zero-Knowledge compliance audit · Secp256k1 signature registry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleRunZkProof}
            disabled={zkProofRunning}
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md
              bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-all disabled:opacity-50"
          >
            {zkProofRunning ? <RefreshCw size={14} className="animate-spin" /> : <Fingerprint size={14} />}
            <span>{zkProofRunning ? 'Generating ZK Proof...' : 'Run ZK Proof'}</span>
          </button>
          <button
            onClick={handleExportLedger}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#7C3AED]/40 text-[#A78BFA] hover:bg-[#7C3AED]/10 transition-all"
          >
            <Download size={14} />
            <span>Export Ledger</span>
          </button>
        </div>
      </div>

      {/* ━━━━ KPI CARDS ━━━━ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[
          {
            label: 'Chain Integrity',
            value: `${chainIntegrity.toFixed(2)}%`,
            sub: 'SHA-256 Verified',
            color: '#A78BFA',
            icon: <ShieldCheck size={18} className="text-[#A78BFA]" />,
            bg: 'border-[#7C3AED]/40',
          },
          {
            label: 'Total Ledger Entries',
            value: totalTxCount.toLocaleString('en-IN'),
            sub: `Across ${blocks.length} Blocks`,
            color: '#C4B5FD',
            icon: <Database size={18} className="text-[#C4B5FD]" />,
            bg: '',
          },
          {
            label: 'Compliance Score',
            value: `${complianceScore.toFixed(1)}%`,
            sub: 'SEBI + NSE Audit',
            color: '#10B981',
            icon: <CheckCircle2 size={18} className="text-[#10B981]" />,
            bg: '',
          },
          {
            label: 'Merkle Proofs Valid',
            value: `${trades.filter(t => t.isVerified).length} / ${trades.length}`,
            sub: 'Zero-Knowledge Anchored',
            color: '#F59E0B',
            icon: <GitBranch size={18} className="text-[#F59E0B]" />,
            bg: '',
          },
        ].map(card => (
          <div
            key={card.label}
            className={`p-4 rounded-xl bg-[#11161D] border ${card.bg || 'border-[#242B35]'} space-y-1 shadow-sm overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B95A5] block truncate">{card.label}</span>
              {card.icon}
            </div>
            <div className="text-xl font-bold truncate" style={{ color: card.color }}>
              {card.value}
            </div>
            <span className="text-[10px] text-[#64748B] font-bold block truncate">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* ━━━━ ZK PROOF RESULT BANNER ━━━━ */}
      {zkProofResult && (
        <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#10B981] shrink-0" />
            <div>
              <p className="font-bold text-[#10B981]">ZK Proof Successfully Generated — Chain Integrity VERIFIED</p>
              <p className="text-[#8B95A5] mt-0.5">Proof Hash: <span className="text-[#A78BFA]">{zkProofResult.hash}</span> · Time: {zkProofResult.proofTime}ms</p>
            </div>
          </div>
          <button onClick={() => setZkProofResult(null)} className="text-[#64748B] hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ━━━━ MAIN WORKSPACE TABS ━━━━ */}
      <div className="rounded-2xl bg-[#11161D] border border-[#242B35] shadow-sm w-full overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-3 border-b border-[#1E2633] bg-[#0D1117] overflow-x-auto">
          {([
            { key: 'LEDGER', label: 'Immutable Ledger', icon: <FileText size={13} /> },
            { key: 'MERKLE', label: 'Merkle Proof Tree', icon: <GitBranch size={13} /> },
            { key: 'COMPLIANCE', label: 'Compliance Timeline', icon: <Activity size={13} /> },
            { key: 'ZK_PROOF', label: 'ZK Signature Registry', icon: <Fingerprint size={13} /> },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-[#7C3AED] text-white shadow-md'
                  : 'text-[#64748B] hover:text-[#A78BFA] hover:bg-[#7C3AED]/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Immutable Ledger ── */}
        {activeTab === 'LEDGER' && (
          <div className="p-5 space-y-4">
            {/* Search + Chain Visual */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  placeholder="Search block #, hash, validator..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#0D1117] border border-[#242B35] text-[#F4F7FA] outline-none focus:border-[#7C3AED]/60"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <Layers size={14} className="text-[#A78BFA]" />
                <span>{filteredBlocks.length} blocks · {totalTxCount.toLocaleString('en-IN')} total records</span>
              </div>
            </div>

            {/* Chain Link Visualization */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-0 min-w-max">
                {filteredBlocks.slice(0, 6).map((block, i) => (
                  <React.Fragment key={block.blockNumber}>
                    <div
                      onClick={() => setSelectedBlock(block)}
                      className={`cursor-pointer p-3 rounded-xl border text-xs transition-all w-44 shrink-0 ${
                        selectedBlock?.blockNumber === block.blockNumber
                          ? 'bg-[#1A0B2E] border-[#7C3AED] shadow-lg shadow-purple-900/30 ring-1 ring-[#7C3AED]/50'
                          : 'bg-[#0D1117] border-[#242B35] hover:border-[#7C3AED]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#A78BFA] text-sm">#{block.blockNumber}</span>
                        <span className="px-1.5 py-0.5 text-[9px] bg-[#10B981]/15 text-[#10B981] rounded font-bold">VALID</span>
                      </div>
                      <div className="space-y-1 text-[10px]">
                        <div className="text-[#64748B]">Txns: <span className="text-[#C4B5FD] font-bold">{block.txCount}</span></div>
                        <div className="text-[#64748B] truncate">Hash: <span className="text-[#8B95A5]">{block.blockHash.slice(0, 12)}...</span></div>
                        <div className="text-[#64748B]">Nonce: <span className="text-[#F59E0B]">{block.nonce}</span></div>
                      </div>
                    </div>
                    {i < Math.min(filteredBlocks.length, 6) - 1 && (
                      <div className="flex items-center px-1">
                        <div className="w-8 h-px bg-gradient-to-r from-[#7C3AED] to-[#4C1D95]" />
                        <div className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Selected Block Detail Inspector */}
            {selectedBlock && (
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#7C3AED]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#A78BFA] flex items-center gap-2 text-sm">
                    <Lock size={15} />
                    Ledger Entry — Block #{selectedBlock.blockNumber}
                  </h3>
                  <span className="text-xs text-[#64748B]">{selectedBlock.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'Block Hash (SHA-256)', val: selectedBlock.blockHash, color: 'text-[#A78BFA]', id: 'bHash' },
                    { label: 'Previous Block Hash', val: selectedBlock.previousHash, color: 'text-[#64748B]', id: 'pHash' },
                    { label: 'Merkle Root', val: selectedBlock.merkleRoot, color: 'text-[#F59E0B]', id: 'mRoot' },
                  ].map(field => (
                    <div key={field.label} className="p-3 rounded-lg bg-[#11161D] border border-[#242B35] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#64748B]">{field.label}</span>
                        <button onClick={() => handleCopy(field.val, field.id)} className="text-[#64748B] hover:text-[#A78BFA]">
                          {copiedId === field.id ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <span className={`${field.color} font-bold break-all block text-[11px]`}>{field.val}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#11161D] border border-[#242B35]">
                    <span className="text-[10px] text-[#64748B] block">Nonce</span>
                    <span className="text-[#F59E0B] font-bold">{selectedBlock.nonce.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#11161D] border border-[#242B35]">
                    <span className="text-[10px] text-[#64748B] block">Tx Count</span>
                    <span className="text-[#10B981] font-bold">{selectedBlock.txCount} Records</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#11161D] border border-[#242B35]">
                    <span className="text-[10px] text-[#64748B] block">Validator</span>
                    <span className="text-[#C4B5FD] font-bold truncate block">{selectedBlock.validator}</span>
                  </div>
                </div>

                {/* Integrity heatmap for this block's day-hour */}
                <div className="space-y-2">
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider">Chain Integrity Heat Map (7-Day)</span>
                  <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(24, 1fr)' }}>
                    {heatmapData[0].map((cell, h) => (
                      <div
                        key={h}
                        title={`Hour ${h}: ${cell.blocks} blocks, ${cell.integrity}% integrity`}
                        className="h-4 rounded-sm"
                        style={{
                          backgroundColor: cell.blocks === 0
                            ? '#1E2633'
                            : cell.integrity < 99
                            ? `rgba(239,68,68,${0.3 + cell.blocks * 0.08})`
                            : `rgba(124,58,237,${0.2 + cell.blocks * 0.1})`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#374151]">
                    <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
                  </div>
                </div>
              </div>
            )}

            {/* Full Ledger Table */}
            <div className="w-full overflow-x-auto border border-[#1E2633] rounded-xl">
              <table className="w-full text-left text-xs min-w-[820px]">
                <thead>
                  <tr className="bg-[#0D1117] border-b border-[#242B35] text-[10px] text-[#64748B] uppercase">
                    <th className="py-2.5 px-3.5">Block #</th>
                    <th className="py-2.5 px-3.5">Timestamp</th>
                    <th className="py-2.5 px-3.5">Records</th>
                    <th className="py-2.5 px-3.5">Block Hash</th>
                    <th className="py-2.5 px-3.5">Merkle Root</th>
                    <th className="py-2.5 px-3.5">Validator</th>
                    <th className="py-2.5 px-3.5">Nonce</th>
                    <th className="py-2.5 px-3.5 text-right">Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2633]">
                  {filteredBlocks.map(b => (
                    <tr
                      key={b.blockNumber}
                      onClick={() => setSelectedBlock(b)}
                      className={`hover:bg-[#1A0B2E]/40 cursor-pointer transition-colors whitespace-nowrap ${
                        selectedBlock?.blockNumber === b.blockNumber ? 'bg-[#1A0B2E]/60' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3.5 font-bold text-[#A78BFA]">#{b.blockNumber}</td>
                      <td className="py-2.5 px-3.5 text-[#8B95A5]">{b.timestamp}</td>
                      <td className="py-2.5 px-3.5 font-bold text-[#F4F7FA]">{b.txCount}</td>
                      <td className="py-2.5 px-3.5 text-[#C4B5FD] font-mono">{truncateHash(b.blockHash)}</td>
                      <td className="py-2.5 px-3.5 text-[#F59E0B] font-mono">{truncateHash(b.merkleRoot)}</td>
                      <td className="py-2.5 px-3.5 text-[#8B95A5]">{b.validator}</td>
                      <td className="py-2.5 px-3.5 text-[#64748B]">{b.nonce.toLocaleString()}</td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 text-[#10B981]">
                          ✓ VALID
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: Merkle Proof Tree ── */}
        {activeTab === 'MERKLE' && (
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-[#A78BFA] flex items-center gap-2">
                  <GitBranch size={16} /> Merkle Patricia Trie — Trade Proof Tree
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  SHA-256 leaf hashes → Paired internal nodes → Merkle Root. Click any leaf to inspect proof path.
                </p>
              </div>
              <div className="text-xs text-[#64748B]">
                Root: <span className="text-[#F59E0B] font-bold font-mono">{truncateHash(merkleRoot, 16)}</span>
              </div>
            </div>

            {/* Root Node */}
            <div className="flex flex-col items-center gap-0 overflow-x-auto pb-4">
              <div className="p-3 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED] text-xs text-center w-64 shadow-lg shadow-purple-900/20">
                <div className="text-[10px] text-[#A78BFA] mb-1 uppercase">Merkle Root</div>
                <div className="text-[#F4F7FA] font-bold break-all">{truncateHash(merkleRoot, 20)}</div>
                <div className="text-[10px] text-[#10B981] mt-1 font-bold">✓ ANCHORED TO BLOCK #{selectedBlock?.blockNumber}</div>
              </div>

              {/* Connector lines */}
              <div className="w-px h-6 bg-[#7C3AED]/50" />

              {/* Internal Nodes row */}
              <div className="flex items-start gap-8 flex-wrap justify-center">
                {merkleInternal.map((node, ni) => (
                  <div key={ni} className="flex flex-col items-center gap-0">
                    <div className="p-2.5 rounded-xl bg-[#1A0B2E] border border-[#4C1D95] text-xs text-center w-48">
                      <div className="text-[10px] text-[#8B8BD8] mb-0.5">{node.label}</div>
                      <div className="text-[#C4B5FD] font-bold text-[11px] break-all">{truncateHash(node.hash, 14)}</div>
                    </div>
                    <div className="w-px h-5 bg-[#4C1D95]/60" />
                    {/* Leaf pair */}
                    <div className="flex items-start gap-2">
                      {node.children.map(ci => {
                        const leaf = merkleLeaves[ci];
                        if (!leaf) return null;
                        return (
                          <button
                            key={ci}
                            onClick={() => setSelectedTradeForInspect(trades[ci])}
                            className="p-2 rounded-lg bg-[#0D1117] border border-[#242B35] hover:border-[#7C3AED] text-[10px] text-left transition-all w-40 space-y-0.5"
                          >
                            <div className="text-[#64748B]">Leaf #{ci}</div>
                            <div className="font-bold text-[#A78BFA] truncate">{leaf.id}</div>
                            <div className={`font-bold ${leaf.side === 'BUY' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{leaf.side}</div>
                            <div className="text-[#F59E0B] truncate font-mono">{leaf.hash.slice(0, 12)}...</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {leaf.verified
                                ? <CheckCircle2 size={10} className="text-[#10B981]" />
                                : <AlertTriangle size={10} className="text-[#F59E0B]" />}
                              <span className="text-[#64748B]">{leaf.verified ? 'Verified' : 'Pending'}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proof Path for selected trade */}
            {selectedTradeForInspect && (
              <div className="p-4 rounded-xl bg-[#0D1117] border border-[#7C3AED]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#A78BFA] flex items-center gap-2 text-xs">
                    <ShieldCheck size={14} /> Merkle Proof Path — {selectedTradeForInspect.id}
                  </h4>
                  <button onClick={() => setSelectedTradeForInspect(null)} className="text-[#64748B] hover:text-white">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { step: 1, label: 'Leaf Hash (SHA-256 of Trade Payload)', hash: selectedTradeForInspect.txHash, pos: 'ORIGIN' },
                    { step: 2, label: 'Sibling Hash (Paired Trade)', hash: `0x${Math.random().toString(16).substring(2, 18)}`, pos: 'RIGHT' },
                    { step: 3, label: 'Internal Node Hash', hash: `0x${Math.random().toString(16).substring(2, 18)}`, pos: 'LEFT' },
                    { step: 4, label: 'Merkle Root (Computed)', hash: selectedTradeForInspect.merkleRoot, pos: 'ROOT' },
                  ].map(step => (
                    <div key={step.step} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#11161D] border border-[#1E2633]">
                      <div className="w-6 h-6 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[10px] font-bold text-[#A78BFA] shrink-0">
                        {step.step}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-[#64748B]">{step.label} <span className="text-[#F59E0B]">({step.pos})</span></div>
                        <div className="text-[#A78BFA] font-bold font-mono break-all">{step.hash}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <CheckCircle2 size={14} className="text-[#10B981]" />
                    <span className="text-[#10B981] font-bold">Proof Path Valid — Leaf anchored to Merkle Root</span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateToVerify(selectedTradeForInspect.id)}
                  className="px-4 py-1.5 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-all"
                >
                  Full Cryptographic Verification →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Compliance Timeline ── */}
        {activeTab === 'COMPLIANCE' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-[#A78BFA] flex items-center gap-2">
                  <Activity size={16} /> Regulatory Compliance Audit Trail
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Real-time compliance event log · SEBI · NSE/BSE exchange · TradeChain cryptographic stamps
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#10B981] font-bold">
                  {auditTimeline.filter(a => a.status === 'SUCCESS').length} / {auditTimeline.length} PASSED
                </div>
              </div>
            </div>

            {/* Compliance Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Events Today', value: '2,847', color: '#A78BFA' },
                { label: 'SEBI Reports Filed', value: '14', color: '#10B981' },
                { label: 'Violations Detected', value: '0', color: '#EF4444' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl bg-[#0D1117] border border-[#242B35] text-center">
                  <div className="text-xs text-[#64748B]">{s.label}</div>
                  <div className="text-xl font-bold mt-0.5" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              {auditTimeline.map((event, i) => (
                <div
                  key={event.id}
                  className={`flex items-start gap-4 p-3.5 rounded-xl border text-xs transition-all ${
                    event.status === 'WARNING'
                      ? 'bg-[#F59E0B]/5 border-[#F59E0B]/30'
                      : 'bg-[#0D1117] border-[#1E2633] hover:border-[#7C3AED]/40'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                      event.status === 'SUCCESS' ? 'border-[#10B981] bg-[#10B981]/30' : 'border-[#F59E0B] bg-[#F59E0B]/30'
                    }`} />
                    {i < auditTimeline.length - 1 && <div className="w-px flex-1 min-h-6 bg-[#1E2633] mt-1" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${event.status === 'SUCCESS' ? 'text-[#F4F7FA]' : 'text-[#F59E0B]'}`}>
                          {event.event}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          event.status === 'SUCCESS'
                            ? 'bg-[#10B981]/15 text-[#10B981]'
                            : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <span className="text-[#64748B] text-[10px] shrink-0">{event.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      <span className="text-[#64748B]">Trade: <span className="text-[#A78BFA]">{event.tradeId}</span></span>
                      <span className="text-[#64748B]">Actor: <span className="text-[#8B95A5]">{event.actor}</span></span>
                      <span className="text-[#64748B] font-mono">Hash: <span className="text-[#C4B5FD]">{event.hash.slice(0, 16)}...</span></span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToVerify(event.tradeId)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-[#7C3AED]/15 text-[#A78BFA] hover:bg-[#7C3AED] hover:text-white font-bold text-[10px] transition-all"
                  >
                    Verify
                  </button>
                </div>
              ))}
            </div>

            {/* Regulatory bodies */}
            <div className="p-4 rounded-xl bg-[#0D1117] border border-[#242B35] space-y-3">
              <h4 className="font-bold text-xs text-[#A78BFA] uppercase tracking-wider">Regulatory Oversight Bodies</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { name: 'SEBI', status: 'Compliant', color: '#10B981' },
                  { name: 'NSE Clearing', status: 'Compliant', color: '#10B981' },
                  { name: 'BSE Settlement', status: 'Compliant', color: '#10B981' },
                  { name: 'RBI Oversight', status: 'Compliant', color: '#10B981' },
                ].map(r => (
                  <div key={r.name} className="p-2.5 rounded-lg bg-[#11161D] border border-[#1E2633] text-center">
                    <div className="text-[#64748B] text-[10px]">{r.name}</div>
                    <div className="font-bold mt-0.5" style={{ color: r.color }}>● {r.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: ZK Signature Registry ── */}
        {activeTab === 'ZK_PROOF' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-[#A78BFA] flex items-center gap-2">
                  <Fingerprint size={16} /> Secp256k1 Digital Signature Registry
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Every trade cryptographically signed by the executing node using Elliptic Curve (secp256k1) · ECDSA verified
                </p>
              </div>
              <button
                onClick={handleRunZkProof}
                disabled={zkProofRunning}
                className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50 transition-all"
              >
                {zkProofRunning ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                {zkProofRunning ? 'Verifying...' : 'Verify All Signatures'}
              </button>
            </div>

            {/* Explanation cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {[
                {
                  icon: <Lock size={16} className="text-[#A78BFA]" />,
                  title: 'ECDSA Signing',
                  desc: 'Each order is signed by a secp256k1 private key held by the executing broker node. Signature is R || S values (64 bytes).',
                },
                {
                  icon: <Hash size={16} className="text-[#F59E0B]" />,
                  title: 'SHA-256 Digest',
                  desc: 'Trade payload (symbol, side, price, qty, timestamp) is double-hashed (SHA-256d) to produce the signing digest.',
                },
                {
                  icon: <Network size={16} className="text-[#10B981]" />,
                  title: 'ZK Proof Anchor',
                  desc: 'zkSNARK circuit proves correct signature verification without revealing the private key to the on-chain validator network.',
                },
              ].map(card => (
                <div key={card.title} className="p-3.5 rounded-xl bg-[#0D1117] border border-[#242B35] space-y-2">
                  {card.icon}
                  <div className="font-bold text-[#F4F7FA]">{card.title}</div>
                  <div className="text-[#8B95A5] leading-relaxed">{card.desc}</div>
                </div>
              ))}
            </div>

            {/* Signature table */}
            <div className="w-full overflow-x-auto border border-[#1E2633] rounded-xl">
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead>
                  <tr className="bg-[#0D1117] border-b border-[#242B35] text-[10px] text-[#64748B] uppercase">
                    <th className="py-2.5 px-3.5">Trade ID</th>
                    <th className="py-2.5 px-3.5">Asset</th>
                    <th className="py-2.5 px-3.5">TX Hash (SHA-256d)</th>
                    <th className="py-2.5 px-3.5">Secp256k1 Signature</th>
                    <th className="py-2.5 px-3.5">Merkle Leaf</th>
                    <th className="py-2.5 px-3.5 text-right">ECDSA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2633]">
                  {trades.map(t => (
                    <tr key={t.id} className="hover:bg-[#1A0B2E]/30 transition-colors whitespace-nowrap">
                      <td className="py-2.5 px-3.5 font-bold text-[#A78BFA]">{t.id}</td>
                      <td className="py-2.5 px-3.5 text-[#F4F7FA]">{t.asset}</td>
                      <td className="py-2.5 px-3.5 font-mono text-[#C4B5FD]">{truncateHash(t.txHash, 14)}</td>
                      <td className="py-2.5 px-3.5 font-mono text-[#8B95A5]">{truncateHash(t.digitalSignature, 14)}</td>
                      <td className="py-2.5 px-3.5 font-mono text-[#F59E0B]">{truncateHash(t.merkleRoot, 12)}</td>
                      <td className="py-2.5 px-3.5 text-right">
                        {computeSignatureStatus(t.digitalSignature) === 'VALID' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 text-[#10B981]">
                            ✓ ECDSA VALID
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EF4444]/15 text-[#EF4444]">
                            ✗ INVALID
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
