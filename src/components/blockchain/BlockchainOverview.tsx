import React, { useState } from 'react';
import { BlockHeader, TradeRecord, NavPage } from '../../types/trading';
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
  ExternalLink,
  ChevronDown,
  Hash,
  Lock,
  Search
} from 'lucide-react';

interface BlockchainOverviewProps {
  blocks: BlockHeader[];
  trades: TradeRecord[];
  onSelectTrade: (tradeId: string) => void;
  onNavigateToVerify: (tradeId: string) => void;
}

export const BlockchainOverview: React.FC<BlockchainOverviewProps> = ({
  blocks,
  trades,
  onSelectTrade,
  onNavigateToVerify
}) => {
  const [selectedBlockNumber, setSelectedBlockNumber] = useState<number>(4281);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const selectedBlock = blocks.find(b => b.blockNumber === selectedBlockNumber) || blocks[0];
  const merkleTree = createBlockMerkleTree(trades);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(label);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11161D] p-5 rounded-xl border border-[#242B35]">
        <div>
          <div className="flex items-center gap-2">
            <Blocks size={20} className="text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-[#F4F7FA] font-mono tracking-tight">
              Blockchain Ledger
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">
              CONSENSUS SYNCED
            </span>
          </div>
          <p className="text-xs text-[#8B95A5] mt-1">
            Cryptographically verified trading activity and immutable block commits.
          </p>
        </div>

        <button 
          onClick={() => onNavigateToVerify('TRD-00041')}
          className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-mono font-semibold text-xs flex items-center gap-2 shadow-fintech transition-all"
        >
          <ShieldCheck size={16} />
          Verify Any Trade Hash
        </button>
      </div>

      {/* Top 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B95A5]">
            <span>Total Blocks</span>
            <Box size={16} className="text-[#3B82F6]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F4F7FA]">
            4,281 <span className="text-xs font-normal text-[#10B981]">+1 (12s ago)</span>
          </div>
          <p className="text-[10px] font-mono text-[#5F6978]">PoA Consortium Ledger</p>
        </div>

        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B95A5]">
            <span>Transactions</span>
            <Receipt size={16} className="text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F4F7FA]">
            28,492 <span className="text-xs font-normal text-[#8B95A5]">in ledger</span>
          </div>
          <p className="text-[10px] font-mono text-[#5F6978]">100% Zero-Loss Audit</p>
        </div>

        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B95A5]">
            <span>Verified Trades</span>
            <ShieldCheck size={16} className="text-[#10B981]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#10B981]">
            28,492 <span className="text-xs font-normal text-[#10B981]">100%</span>
          </div>
          <p className="text-[10px] font-mono text-[#5F6978]">Secp256k1 Signed</p>
        </div>

        <div className="p-4 rounded-xl bg-[#11161D] border border-[#10B981]/40 bg-gradient-to-br from-[#11161D] to-[#10B981]/5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-[#8B95A5]">
            <span>Chain Integrity</span>
            <Lock size={16} className="text-[#10B981]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#10B981]">
            100% <span className="text-xs font-normal text-[#10B981]">VERIFIED</span>
          </div>
          <p className="text-[10px] font-mono text-[#8B95A5]">0 Tampered Records</p>
        </div>
      </div>

      {/* Interactive Merkle Tree Component */}
      <MerkleTreeVisualizer
        tree={merkleTree}
        selectedTradeId="TRD-00041"
        onSelectLeaf={(tId) => onSelectTrade(tId)}
      />

      {/* Horizontal Interconnected Blockchain Sequence */}
      <div className="p-5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-4 shadow-fintech">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
            <Blocks size={16} className="text-[#3B82F6]" />
            Interconnected Block Sequence
          </h3>
          <span className="text-xs font-mono text-[#8B95A5]">PoA Consortium Validator Network</span>
        </div>

        {/* Chain visualization line */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {/* Genesis block */}
          <div className="p-3 rounded-lg bg-[#080A0F] border border-[#242B35] text-xs font-mono min-w-[130px] opacity-70">
            <div className="text-[#5F6978] font-bold">#0001 Genesis</div>
            <div className="text-[10px] text-[#8B95A5]">000000000...</div>
          </div>

          <div className="text-[#5F6978] font-bold">...</div>

          {blocks.slice().reverse().map((block) => {
            const isSelected = block.blockNumber === selectedBlockNumber;
            return (
              <React.Fragment key={block.blockNumber}>
                <div 
                  onClick={() => setSelectedBlockNumber(block.blockNumber)}
                  className={`
                    p-3 rounded-xl border text-xs font-mono min-w-[170px] cursor-pointer transition-all duration-150 relative
                    ${isSelected 
                      ? 'bg-[#151B23] border-[#3B82F6] shadow-glow-blue text-[#F4F7FA]' 
                      : 'bg-[#080A0F] border-[#242B35] text-[#8B95A5] hover:border-[#3A4454]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#F4F7FA]">#{block.blockNumber}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-[#10B981]/15 text-[#10B981] rounded font-semibold">
                      VALID
                    </span>
                  </div>
                  <div className="text-[10px] text-[#5F6978]">{block.txCount} Trades</div>
                  <div className="text-[9px] text-[#8B95A5] truncate mt-1">{block.blockHash.slice(0, 16)}...</div>
                </div>

                <div className="text-[#3B82F6]">
                  <ArrowRight size={16} />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Block Detail Inspector */}
      <div className="p-5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-4 shadow-fintech">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#242B35] pb-3">
          <div>
            <h3 className="font-mono font-bold text-sm text-[#F4F7FA] flex items-center gap-2">
              <Box size={16} className="text-[#3B82F6]" />
              Block #{selectedBlock.blockNumber} Detail Inspector
            </h3>
            <p className="text-xs text-[#8B95A5]">Validator: {selectedBlock.validator}</p>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">
            STATUS: {selectedBlock.status}
          </span>
        </div>

        {/* Hashes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          
          <div className="p-3 rounded-lg bg-[#080A0F] border border-[#242B35] space-y-1">
            <div className="flex items-center justify-between text-[#8B95A5]">
              <span>Block Hash (SHA-256 Digest)</span>
              <button 
                onClick={() => handleCopy(selectedBlock.blockHash, 'blockHash')}
                className="text-[#3B82F6] hover:underline text-[10px] flex items-center gap-1"
              >
                {copiedHash === 'blockHash' ? <Check size={12} /> : <Copy size={12} />}
                {copiedHash === 'blockHash' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-[#F4F7FA] break-all font-semibold">{selectedBlock.blockHash}</div>
          </div>

          <div className="p-3 rounded-lg bg-[#080A0F] border border-[#242B35] space-y-1">
            <div className="flex items-center justify-between text-[#8B95A5]">
              <span>Previous Block Hash</span>
              <button 
                onClick={() => handleCopy(selectedBlock.previousHash, 'prevHash')}
                className="text-[#3B82F6] hover:underline text-[10px] flex items-center gap-1"
              >
                {copiedHash === 'prevHash' ? <Check size={12} /> : <Copy size={12} />}
                {copiedHash === 'prevHash' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-[#8B95A5] break-all font-semibold">{selectedBlock.previousHash}</div>
          </div>

          <div className="p-3 rounded-lg bg-[#080A0F] border border-[#242B35] space-y-1">
            <div className="flex items-center justify-between text-[#8B95A5]">
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

          <div className="p-3 rounded-lg bg-[#080A0F] border border-[#242B35] grid grid-cols-2 gap-2 text-center">
            <div>
              <span className="text-[#8B95A5] block text-[10px]">Nonce</span>
              <span className="text-[#F4F7FA] font-bold">{selectedBlock.nonce}</span>
            </div>
            <div>
              <span className="text-[#8B95A5] block text-[10px]">Committed Timestamp</span>
              <span className="text-[#F4F7FA] font-bold">{selectedBlock.timestamp.split(' ')[1]} UTC</span>
            </div>
          </div>
        </div>

        {/* Block Transactions List */}
        <div className="pt-3 border-t border-[#242B35] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#F4F7FA] font-bold">Committed Trade Payload ({selectedBlock.trades.length} Records)</span>
            <span className="text-[#5F6978]">Zero-Knowledge Proof Verified</span>
          </div>

          <div className="space-y-2">
            {selectedBlock.trades.map(t => (
              <div 
                key={t.id}
                onClick={() => onSelectTrade(t.id)}
                className="p-3 rounded-lg bg-[#151B23] border border-[#242B35] hover:border-[#3B82F6] transition-all cursor-pointer flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#3B82F6]">{t.id}</span>
                  <span className="text-[#F4F7FA] font-semibold">{t.asset}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.side === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'}`}>
                    {t.side} {t.quantity}
                  </span>
                  <span className="text-[#8B95A5]">@ ₹{t.price.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#5F6978] text-[11px] truncate max-w-[150px]">{t.txHash.slice(0, 16)}...</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToVerify(t.id);
                    }}
                    className="px-2 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/30 text-[10px] font-bold flex items-center gap-1"
                  >
                    <ShieldCheck size={12} />
                    Verify Proof
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
