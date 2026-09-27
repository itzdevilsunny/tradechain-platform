import React, { useState, useEffect } from 'react';
import { BlockHeader, TradeRecord } from '../../types/trading';
import { createBlockMerkleTree } from '../../lib/cryptoUtils';
import { MerkleTreeVisualizer } from './MerkleTreeVisualizer';
import { 
  Blocks, 
  Receipt, 
  ShieldCheck, 
  Box, 
  ArrowRight, 
  Copy, 
  Check, 
  Hash, 
  Lock, 
  Search, 
  Zap, 
  Cpu, 
  RefreshCw, 
  Code, 
  Server, 
  X, 
  CheckCircle2,
  ExternalLink,
  Layers
} from 'lucide-react';

interface BlockchainOverviewProps {
  blocks: BlockHeader[];
  trades: TradeRecord[];
  onSelectTrade: (tradeId: string) => void;
  onNavigateToVerify: (tradeId: string) => void;
}

export const BlockchainOverview: React.FC<BlockchainOverviewProps> = ({
  blocks: initialBlocks,
  trades,
  onSelectTrade,
  onNavigateToVerify
}) => {
  const [blocks, setBlocks] = useState<BlockHeader[]>(initialBlocks);
  const [selectedBlockNumber, setSelectedBlockNumber] = useState<number>(
    initialBlocks[0]?.blockNumber || 4281
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'INSPECTOR' | 'VALIDATORS' | 'PAYLOAD'>('INSPECTOR');
  const [isMiningBlock, setIsMiningBlock] = useState(false);
  const [isAutoMining, setIsAutoMining] = useState(false);
  const [selectedRawBlockJson, setSelectedRawBlockJson] = useState<BlockHeader | null>(null);

  // Auto-mining block interval simulation
  useEffect(() => {
    if (!isAutoMining) return;

    const interval = setInterval(() => {
      handleMineNewBlock();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoMining, blocks]);

  const handleMineNewBlock = () => {
    setIsMiningBlock(true);
    setTimeout(() => {
      setBlocks(prev => {
        const topBlock = prev[0] || { blockNumber: 4281, blockHash: '0x8f2a391eb4d02a01' };
        const newBlockNum = topBlock.blockNumber + 1;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
        const newTxHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;

        const newBlock: BlockHeader = {
          blockNumber: newBlockNum,
          blockHash: newTxHash,
          previousHash: topBlock.blockHash,
          timestamp: timeStr,
          txCount: Math.floor(18 + Math.random() * 14),
          merkleRoot: `0x${Math.random().toString(16).substring(2, 14)}`,
          validator: 'TradeChain NSE Node #1',
          nonce: Math.floor(100000 + Math.random() * 900000),
          status: 'VALID',
          trades: trades.slice(0, 4)
        };

        setSelectedBlockNumber(newBlockNum);
        return [newBlock, ...prev];
      });
      setIsMiningBlock(false);
    }, 600);
  };

  const selectedBlock = blocks.find(b => b.blockNumber === selectedBlockNumber) || blocks[0];
  const merkleTree = createBlockMerkleTree(trades);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredBlocks = blocks.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      b.blockNumber.toString().includes(q) ||
      b.blockHash.toLowerCase().includes(q) ||
      b.merkleRoot.toLowerCase().includes(q) ||
      b.validator.toLowerCase().includes(q)
    );
  });

  // Consensus Network Nodes
  const validatorNodes = [
    { name: 'TradeChain NSE Node #1', location: 'BKC, Mumbai (India)', status: 'ACTIVE', latency: '12ms', votes: '100%', key: '0x04a91f...9b2c' },
    { name: 'BSE Clearing Validator #2', location: 'Dalal Street, Mumbai (India)', status: 'ACTIVE', latency: '16ms', votes: '100%', key: '0x04b82d...4c1a' },
    { name: 'Upstox Brokerage Gateway', location: 'Bengaluru (India)', status: 'ACTIVE', latency: '21ms', votes: '100%', key: '0x04c73a...8f3d' },
    { name: 'TradeChain Cryptographic Vault', location: 'Frankfurt (Germany)', status: 'ACTIVE', latency: '88ms', votes: '100%', key: '0x04d64f...1e9a' }
  ];

  return (
    <div className="space-y-6 w-full max-w-full">
      
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-[#11161D] p-5 rounded-xl border border-slate-200 dark:border-[#242B35] shadow-sm w-full overflow-hidden">
        <div className="min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Blocks size={20} className="text-[#3B82F6] shrink-0" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] font-mono tracking-tight truncate">
              Institutional Cryptographic Blockchain Ledger
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded shrink-0">
              CONSENSUS SYNCED & IMMUTABLE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8B95A5] mt-1 font-sans truncate">
            Cryptographically signed F&O execution commits, Zero-Knowledge Merkle roots & multi-validator consensus telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAutoMining(!isAutoMining)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
              isAutoMining 
                ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 animate-pulse' 
                : 'bg-slate-100 dark:bg-[#080A0F] text-slate-600 dark:text-[#8B95A5] border-slate-200 dark:border-[#242B35]'
            }`}
          >
            <RefreshCw size={14} className={isAutoMining ? 'animate-spin text-[#10B981]' : ''} />
            <span>{isAutoMining ? 'Auto Block Commit: ON' : 'Auto Block Commit: OFF'}</span>
          </button>

          <button
            onClick={handleMineNewBlock}
            disabled={isMiningBlock}
            className="btn-3d btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            {isMiningBlock ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Mining Block...</span>
              </>
            ) : (
              <>
                <Zap size={14} fill="currentColor" />
                <span>Mine New Block</span>
              </>
            )}
          </button>

          <button 
            onClick={() => onNavigateToVerify('TRD-IN-00104')}
            className="btn-3d btn-3d-success px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
          >
            <ShieldCheck size={14} />
            <span>Verify Trade Hash</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono w-full overflow-hidden">
        
        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8B95A5]">
            <span>Total Block Height</span>
            <Box size={16} className="text-[#3B82F6]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F4F7FA] truncate">
            #{selectedBlock.blockNumber} <span className="text-xs font-normal text-[#10B981]">+1 (Live)</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-[#5F6978] truncate">PoA Consortium Ledger</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8B95A5]">
            <span>Ledger Transactions</span>
            <Receipt size={16} className="text-[#F59E0B]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F4F7FA] truncate">
            {(28492 + (blocks.length - initialBlocks.length) * 20).toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">commits</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-[#5F6978] truncate">100% Zero-Loss Audit</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8B95A5]">
            <span>Secp256k1 Signed</span>
            <ShieldCheck size={16} className="text-[#10B981]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#10B981] truncate">
            100% <span className="text-xs font-normal text-[#10B981]">Authentic</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-[#5F6978] truncate">Cryptographically Verified</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-[#10B981]/40 space-y-1 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#8B95A5]">
            <span>Chain Integrity</span>
            <Lock size={16} className="text-[#10B981]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#10B981] truncate">
            100% VERIFIED
          </div>
          <p className="text-[10px] text-slate-400 dark:text-[#8B95A5] truncate">0 Tampered Records</p>
        </div>
      </div>

      {/* Interactive Merkle Proof Tree Diagram Component */}
      <MerkleTreeVisualizer
        tree={merkleTree}
        selectedTradeId="TRD-00041"
        onSelectLeaf={(tId) => onSelectTrade(tId)}
      />

      {/* Main Section Navigation & Controls */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm w-full overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#3B82F6]" />
            <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider">
              {activeTab === 'INSPECTOR' && 'Block Chain Sequence & Cryptographic Payload Inspector'}
              {activeTab === 'VALIDATORS' && 'PoA Validator Network & Consensus Matrix'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#080A0F] p-1 rounded-lg border border-slate-200 dark:border-[#242B35]">
            <button
              onClick={() => setActiveTab('INSPECTOR')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'INSPECTOR'
                  ? 'bg-white dark:bg-[#1E2631] text-[#3B82F6] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Block Explorer
            </button>
            <button
              onClick={() => setActiveTab('VALIDATORS')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'VALIDATORS'
                  ? 'bg-white dark:bg-[#1E2631] text-[#10B981] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Consensus Nodes ({validatorNodes.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Block Inspector & Sequence */}
        {activeTab === 'INSPECTOR' && (
          <div className="space-y-5 font-mono text-xs">
            
            {/* Filter Search Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by block height, SHA-256 hash, or validator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] text-slate-900 dark:text-[#F4F7FA] outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400">
                Showing {filteredBlocks.length} of {blocks.length} Committed Blocks
              </span>
            </div>

            {/* Horizontal Interconnected Blockchain Sequence */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2631] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-[#F4F7FA] text-xs">Horizontal Block Link Chain</span>
                <span className="text-[10px] text-slate-400">Click block card to inspect cryptographic state digest</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {/* Genesis block */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35] text-xs min-w-[130px] opacity-70">
                  <div className="text-slate-400 font-bold">#0001 Genesis</div>
                  <div className="text-[10px] text-slate-400 font-mono">0000000000...</div>
                </div>

                <div className="text-slate-400 font-bold">...</div>

                {filteredBlocks.map((block) => {
                  const isSelected = block.blockNumber === selectedBlockNumber;
                  return (
                    <React.Fragment key={block.blockNumber}>
                      <div 
                        onClick={() => setSelectedBlockNumber(block.blockNumber)}
                        className={`
                          p-3 rounded-xl border text-xs min-w-[170px] cursor-pointer transition-all relative shrink-0
                          ${isSelected 
                            ? 'bg-white dark:bg-[#161D2A] border-[#3B82F6] text-slate-900 dark:text-[#F4F7FA] shadow-md ring-2 ring-[#3B82F6]/30' 
                            : 'bg-white dark:bg-[#111620] border-slate-200 dark:border-[#242B35] text-slate-500 dark:text-[#8B95A5] hover:border-[#3B82F6]/60'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-[#F4F7FA]">#{block.blockNumber}</span>
                          <span className="px-1.5 py-0.5 text-[9px] bg-[#10B981]/15 text-[#10B981] rounded font-semibold">
                            VALID
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-[#64748B]">{block.txCount} Trades</div>
                        <div className="text-[9px] text-slate-400 truncate mt-1">{block.blockHash.slice(0, 16)}...</div>
                      </div>

                      <div className="text-[#3B82F6] shrink-0">
                        <ArrowRight size={14} />
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Selected Block Detail Inspector */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-[#242B35] pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-[#F4F7FA] flex items-center gap-2">
                    <Box size={16} className="text-[#3B82F6]" />
                    Block #{selectedBlock.blockNumber} Detail Inspector
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8B95A5]">Validator: {selectedBlock.validator}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedRawBlockJson(selectedBlock)}
                    className="btn-3d btn-3d-secondary px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1"
                  >
                    <Code size={12} />
                    <span>View Raw JSON Payload</span>
                  </button>

                  <span className="px-2.5 py-1 text-xs font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">
                    STATUS: {selectedBlock.status}
                  </span>
                </div>
              </div>

              {/* Hashes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                
                <div className="p-3 rounded-lg bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-[#8B95A5]">
                    <span>Block Hash (SHA-256 Digest)</span>
                    <button 
                      onClick={() => handleCopy(selectedBlock.blockHash, 'blockHash')}
                      className="text-[#3B82F6] hover:underline text-[10px] flex items-center gap-1"
                    >
                      {copiedHash === 'blockHash' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedHash === 'blockHash' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-slate-900 dark:text-[#F4F7FA] break-all font-semibold">{selectedBlock.blockHash}</div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-[#8B95A5]">
                    <span>Previous Block Hash</span>
                    <button 
                      onClick={() => handleCopy(selectedBlock.previousHash, 'prevHash')}
                      className="text-[#3B82F6] hover:underline text-[10px] flex items-center gap-1"
                    >
                      {copiedHash === 'prevHash' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedHash === 'prevHash' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-slate-500 dark:text-[#8B95A5] break-all font-semibold">{selectedBlock.previousHash}</div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-[#8B95A5]">
                    <span>Merkle Root Hash</span>
                    <button 
                      onClick={() => handleCopy(selectedBlock.merkleRoot, 'merkleRoot')}
                      className="text-[#3B82F6] hover:underline text-[10px] flex items-center gap-1"
                    >
                      {copiedHash === 'merkleRoot' ? <Check size={12} /> : <Copy size={12} />}
                      {copiedHash === 'merkleRoot' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="text-[#3B82F6] break-all font-semibold">{selectedBlock.merkleRoot}</div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-slate-500 dark:text-[#8B95A5] block text-[10px]">Nonce</span>
                    <span className="text-slate-900 dark:text-[#F4F7FA] font-bold">{selectedBlock.nonce}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-[#8B95A5] block text-[10px]">Timestamp</span>
                    <span className="text-slate-900 dark:text-[#F4F7FA] font-bold">{selectedBlock.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* Block Transactions List */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#242B35] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-[#F4F7FA]">
                  <span>Committed Trade Payload ({selectedBlock.trades.length} Records)</span>
                  <span className="text-[#10B981] font-bold">Zero-Knowledge Proof Verified</span>
                </div>

                <div className="space-y-2">
                  {selectedBlock.trades.map(t => (
                    <div 
                      key={t.id}
                      onClick={() => onSelectTrade(t.id)}
                      className="p-3 rounded-lg bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] hover:border-[#3B82F6] transition-all cursor-pointer flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#3B82F6]">{t.id}</span>
                        <span className="text-slate-900 dark:text-[#F4F7FA] font-semibold">{t.asset}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.side === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'}`}>
                          {t.side} {t.quantity}
                        </span>
                        <span className="text-slate-500 dark:text-[#8B95A5]">@ ₹{t.price.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px] truncate max-w-[150px]">{t.txHash.slice(0, 16)}...</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToVerify(t.id);
                          }}
                          className="px-2 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/30 text-[10px] font-bold flex items-center gap-1"
                        >
                          <ShieldCheck size={12} />
                          <span>Verify Proof</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Consensus Validator Network */}
        {activeTab === 'VALIDATORS' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {validatorNodes.map(node => (
                <div key={node.name} className="p-4 rounded-xl bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server size={16} className="text-[#3B82F6]" />
                      <span className="font-bold text-slate-900 dark:text-[#F4F7FA]">{node.name}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded font-bold">
                      {node.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-[#8B95A5]">{node.location}</p>

                  <div className="pt-2 border-t border-slate-200 dark:border-[#242B35] grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Latency</span>
                      <span className="font-bold text-[#10B981]">{node.latency}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Block Vote</span>
                      <span className="font-bold text-slate-900 dark:text-[#F4F7FA]">{node.votes}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Secp256k1 Key</span>
                      <span className="font-bold text-[#3B82F6] truncate block">{node.key}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Raw Block Payload Modal */}
      {selectedRawBlockJson && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#242B35] rounded-2xl shadow-2xl p-5 font-mono text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242B35] pb-3">
              <div className="flex items-center gap-2">
                <Code className="text-[#3B82F6]" size={18} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#F4F7FA]">
                  Block #{selectedRawBlockJson.blockNumber} Raw JSON Payload
                </h3>
              </div>
              <button onClick={() => setSelectedRawBlockJson(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-[#F4F7FA]">
                <X size={16} />
              </button>
            </div>

            <div className="bg-slate-900 text-[#10B981] p-4 rounded-xl max-h-96 overflow-y-auto text-[11px] border border-slate-800 font-mono">
              <pre>{JSON.stringify(selectedRawBlockJson, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleCopy(JSON.stringify(selectedRawBlockJson, null, 2), 'rawJson')}
                className="btn-3d btn-3d-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                {copiedHash === 'rawJson' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedHash === 'rawJson' ? 'Payload Copied!' : 'Copy Raw JSON'}</span>
              </button>

              <button
                onClick={() => setSelectedRawBlockJson(null)}
                className="btn-3d btn-3d-primary px-4 py-1.5 rounded-lg text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
