import React, { useState, useEffect } from 'react';
import { BlockHeader, TradeRecord } from '../../types/trading';
import { 
  Box, 
  Search, 
  Copy, 
  Check, 
  Code, 
  Server, 
  X, 
  ArrowRight, 
  Blocks, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  Lock,
  Layers
} from 'lucide-react';

interface BlockExplorerProps {
  blocks: BlockHeader[];
  trades: TradeRecord[];
  onSelectTrade: (tradeId: string) => void;
  onNavigateToVerify: (tradeId: string) => void;
}

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
  const [activeTab, setActiveTab] = useState<'GRID' | 'TABLE' | 'VALIDATORS'>('GRID');

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

  const validatorNodes = [
    { name: 'TradeChain NSE Node #1', location: 'BKC, Mumbai (India)', status: 'ACTIVE', latency: '12ms', votes: '100%', key: '0x04a91f...9b2c' },
    { name: 'BSE Clearing Validator #2', location: 'Dalal Street, Mumbai (India)', status: 'ACTIVE', latency: '16ms', votes: '100%', key: '0x04b82d...4c1a' },
    { name: 'Upstox Brokerage Gateway', location: 'Bengaluru (India)', status: 'ACTIVE', latency: '21ms', votes: '100%', key: '0x04c73a...8f3d' },
    { name: 'TradeChain Cryptographic Vault', location: 'Frankfurt (Germany)', status: 'ACTIVE', latency: '88ms', votes: '100%', key: '0x04d64f...1e9a' }
  ];

  return (
    <div className="space-y-6 w-full max-w-full font-mono">
      
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-[#11161D] p-5 rounded-xl border border-slate-200 dark:border-[#242B35] shadow-sm w-full overflow-hidden">
        <div className="min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Box size={20} className="text-[#3B82F6] shrink-0" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] tracking-tight truncate">
              Consensus Block Explorer & Network Topology
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded shrink-0">
              POA NETWORK ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8B95A5] mt-1 font-sans truncate">
            Inspect individual blocks, Merkle tree root hashes, nonces & validator signatures across the consortium network.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleMineNewBlock}
            disabled={isMiningBlock}
            className="btn-3d btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
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
        </div>
      </div>

      {/* Top 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full overflow-hidden">
        
        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Current Block Height</span>
          <div className="text-xl sm:text-2xl font-bold text-[#3B82F6] truncate">
            #{selectedBlock.blockNumber}
          </div>
          <span className="text-[10px] text-[#10B981] font-bold block truncate">Immutable Chain Height</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Avg Block Commit Time</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F4F7FA] truncate">
            3.2 seconds
          </div>
          <span className="text-[10px] text-slate-400 block truncate">Deterministic PoA Interval</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Consensus Validators</span>
          <div className="text-xl sm:text-2xl font-bold text-[#10B981] truncate">
            {validatorNodes.length} Nodes
          </div>
          <span className="text-[10px] text-[#10B981] font-bold block truncate">100% Agreement</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-[#10B981]/40 space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Network Hash Integrity</span>
          <div className="text-xl sm:text-2xl font-bold text-[#10B981] truncate">
            99.98%
          </div>
          <span className="text-[10px] text-slate-400 block truncate">Zero-Knowledge Audited</span>
        </div>

      </div>

      {/* Main Block Explorer Container */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm w-full overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Blocks size={18} className="text-[#3B82F6]" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider">
              {activeTab === 'GRID' && 'Committed Block Visualizer & Detail Inspector'}
              {activeTab === 'TABLE' && 'Block History Ledger Table'}
              {activeTab === 'VALIDATORS' && 'PoA Consortium Validator Network'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#080A0F] p-1 rounded-lg border border-slate-200 dark:border-[#242B35]">
            <button
              onClick={() => setActiveTab('GRID')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                activeTab === 'GRID'
                  ? 'bg-white dark:bg-[#1E2631] text-[#3B82F6] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Block Cards
            </button>
            <button
              onClick={() => setActiveTab('TABLE')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                activeTab === 'TABLE'
                  ? 'bg-white dark:bg-[#1E2631] text-[#3B82F6] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Ledger Table
            </button>
            <button
              onClick={() => setActiveTab('VALIDATORS')}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                activeTab === 'VALIDATORS'
                  ? 'bg-white dark:bg-[#1E2631] text-[#10B981] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Validators ({validatorNodes.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Block Cards Grid & Inspector */}
        {activeTab === 'GRID' && (
          <div className="space-y-5">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Block #, Hash string, or Validator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] text-slate-900 dark:text-[#F4F7FA] outline-none"
              />
            </div>

            {/* Block Cards Horizontal Scroll */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredBlocks.map(block => {
                const isSelected = block.blockNumber === selectedBlockNumber;
                return (
                  <div
                    key={block.blockNumber}
                    onClick={() => setSelectedBlockNumber(block.blockNumber)}
                    className={`
                      p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-2 relative
                      ${isSelected 
                        ? 'bg-white dark:bg-[#161D2A] border-[#3B82F6] text-slate-900 dark:text-[#F4F7FA] shadow-md ring-2 ring-[#3B82F6]/30' 
                        : 'bg-slate-50 dark:bg-[#080A0F] border-slate-200 dark:border-[#242B35] text-slate-600 dark:text-[#8B95A5] hover:border-[#3B82F6]/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-[#F4F7FA] text-sm">Block #{block.blockNumber}</span>
                      <span className="px-1.5 py-0.5 text-[9px] bg-[#10B981]/15 text-[#10B981] rounded font-bold">
                        VALID
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Trades Committed:</span>
                        <span className="font-bold text-[#3B82F6]">{block.txCount} Records</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Validator:</span>
                        <span className="font-bold text-slate-700 dark:text-[#CBD5E1] truncate max-w-[100px]">{block.validator}</span>
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-400 font-mono truncate pt-1 border-t border-slate-200 dark:border-[#242B35]">
                      Hash: {block.blockHash}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Block Detailed Inspector */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-[#242B35] pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-[#F4F7FA] flex items-center gap-2">
                    <Box size={16} className="text-[#3B82F6]" />
                    Inspecting Block #{selectedBlock.blockNumber} Payload
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8B95A5]">Timestamp: {selectedBlock.timestamp} | Nonce: {selectedBlock.nonce}</p>
                </div>

                <button
                  onClick={() => setSelectedRawBlockJson(selectedBlock)}
                  className="btn-3d btn-3d-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Code size={14} />
                  <span>Inspect Raw JSON</span>
                </button>
              </div>

              {/* Block Hashes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] space-y-1">
                  <span className="text-slate-400 text-[10px] block">Block Hash</span>
                  <span className="text-slate-900 dark:text-[#F4F7FA] font-bold break-all block">{selectedBlock.blockHash}</span>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] space-y-1">
                  <span className="text-slate-400 text-[10px] block">Previous Hash</span>
                  <span className="text-slate-500 dark:text-[#8B95A5] font-bold break-all block">{selectedBlock.previousHash}</span>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] space-y-1">
                  <span className="text-slate-400 text-[10px] block">Merkle Root</span>
                  <span className="text-[#3B82F6] font-bold break-all block">{selectedBlock.merkleRoot}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Ledger Table View */}
        {activeTab === 'TABLE' && (
          <div className="w-full overflow-x-auto border border-slate-100 dark:border-[#1E2631] rounded-lg">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#242B35] bg-slate-50 dark:bg-[#080A0F] text-[10px] text-slate-500 dark:text-[#8B95A5] uppercase">
                  <th className="py-2.5 px-3.5">Block Height</th>
                  <th className="py-2.5 px-3.5">Timestamp</th>
                  <th className="py-2.5 px-3.5">Trades Committed</th>
                  <th className="py-2.5 px-3.5">Block Hash</th>
                  <th className="py-2.5 px-3.5">Merkle Root</th>
                  <th className="py-2.5 px-3.5">Validator</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E2633]">
                {filteredBlocks.map(b => (
                  <tr key={b.blockNumber} className="hover:bg-slate-50 dark:hover:bg-[#161D2A] transition-colors whitespace-nowrap">
                    <td className="py-2.5 px-3.5 font-bold text-[#3B82F6]">#{b.blockNumber}</td>
                    <td className="py-2.5 px-3.5 text-slate-500 dark:text-[#94A3B8]">{b.timestamp}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-[#F1F5F9]">{b.txCount} Records</td>
                    <td className="py-2.5 px-3.5 text-slate-400 font-mono">{b.blockHash.slice(0, 16)}...</td>
                    <td className="py-2.5 px-3.5 text-[#3B82F6] font-mono">{b.merkleRoot.slice(0, 16)}...</td>
                    <td className="py-2.5 px-3.5 text-slate-500">{b.validator}</td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => setSelectedRawBlockJson(b)}
                        className="px-2.5 py-1 rounded bg-[#3B82F6]/15 text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white font-bold text-[10px] transition-all"
                      >
                        Inspect Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Validators Network Matrix */}
        {activeTab === 'VALIDATORS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
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
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Raw Block JSON Inspector Modal */}
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
