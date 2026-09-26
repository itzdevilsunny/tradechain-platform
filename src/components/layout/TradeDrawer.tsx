import React, { useState } from 'react';
import { TradeRecord, NavPage } from '../../types/trading';
import { 
  X, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Box, 
  Hash, 
  Lock, 
  TrendingUp, 
  TrendingDown, 
  FileCheck,
  Zap
} from 'lucide-react';

interface TradeDrawerProps {
  trade: TradeRecord | null;
  onClose: () => void;
  onNavigateToVerify: (tradeId: string) => void;
  onNavigateToBlock: (blockNumber: number) => void;
}

export const TradeDrawer: React.FC<TradeDrawerProps> = ({
  trade,
  onClose,
  onNavigateToVerify,
  onNavigateToBlock
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!trade) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#0D1117] border-l border-[#242B35] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#242B35] flex items-center justify-between bg-[#11161D]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-[#F4F7FA]">{trade.id}</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded flex items-center gap-1">
                <ShieldCheck size={12} />
                Blockchain Verified
              </span>
            </div>
            <p className="text-xs text-[#8B95A5] mt-0.5">Execution & Cryptographic Ledger Audit</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#151B23] border border-[#242B35] text-[#8B95A5] hover:text-[#F4F7FA]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Section 1: Trade Information */}
          <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase text-[#5F6978] tracking-wider flex items-center justify-between">
              <span>Trade Execution Payload</span>
              <span className="text-[#3B82F6]">{trade.asset}</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[#8B95A5] block">Order Side</span>
                <span className={`font-bold inline-flex items-center gap-1 ${trade.side === 'BUY' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {trade.side === 'BUY' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {trade.side}
                </span>
              </div>
              <div>
                <span className="text-[#8B95A5] block">Quantity</span>
                <span className="text-[#F4F7FA] font-semibold">{trade.quantity} BTC</span>
              </div>
              <div>
                <span className="text-[#8B95A5] block">Entry Price</span>
                <span className="text-[#F4F7FA] font-semibold">₹{trade.price.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[#8B95A5] block">Realized / Mark P&L</span>
                <span className={`font-bold ${trade.pnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toLocaleString('en-IN')} ({trade.pnlPercentage}%)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E2631] flex items-center justify-between text-xs font-mono">
              <span className="text-[#8B95A5]">Strategy Engine</span>
              <span className="text-[#3B82F6] font-medium">{trade.strategy}</span>
            </div>
          </div>

          {/* Section 2: Risk Information */}
          <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-3">
            <h4 className="text-xs font-mono font-semibold uppercase text-[#5F6978] tracking-wider">
              Risk & Margin Parameters
            </h4>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
              <div className="p-2 rounded bg-[#151B23] border border-[#242B35]">
                <span className="text-[#8B95A5] block text-[10px]">Stop Loss</span>
                <span className="text-[#EF4444] font-semibold">₹{trade.stopLoss.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 rounded bg-[#151B23] border border-[#242B35]">
                <span className="text-[#8B95A5] block text-[10px]">Take Profit</span>
                <span className="text-[#10B981] font-semibold">₹{trade.takeProfit.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2 rounded bg-[#151B23] border border-[#242B35]">
                <span className="text-[#8B95A5] block text-[10px]">Risk/Reward</span>
                <span className="text-[#F4F7FA] font-semibold">1 : 2.5</span>
              </div>
            </div>
          </div>

          {/* Section 3: Blockchain Cryptographic Proof */}
          <div className="p-3.5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-semibold uppercase text-[#5F6978] tracking-wider flex items-center gap-1.5">
                <Lock size={14} className="text-[#3B82F6]" />
                Cryptographic Attestation
              </h4>
              <span className="text-[10px] font-mono text-[#10B981] font-bold">ECDSA SECP256K1</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {/* Tx Hash */}
              <div>
                <div className="flex items-center justify-between text-[#8B95A5] mb-1">
                  <span>Transaction Hash</span>
                  <button 
                    onClick={() => handleCopy(trade.txHash, 'txHash')}
                    className="text-[#3B82F6] hover:underline text-[10px] flex items-center gap-1"
                  >
                    {copiedField === 'txHash' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'txHash' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 rounded bg-[#080A0F] border border-[#242B35] text-[11px] text-[#F4F7FA] break-all">
                  {trade.txHash}
                </div>
              </div>

              {/* Block & Merkle Root */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#8B95A5] block mb-0.5">Consensus Block</span>
                  <span className="text-[#3B82F6] font-bold">#{trade.blockNumber}</span>
                </div>
                <div>
                  <span className="text-[#8B95A5] block mb-0.5">Digital Signature</span>
                  <span className="text-[#10B981] font-bold">VALID ✓</span>
                </div>
              </div>

              {/* Merkle Root */}
              <div>
                <div className="flex items-center justify-between text-[#8B95A5] mb-1">
                  <span>Merkle Tree Root</span>
                  <button 
                    onClick={() => handleCopy(trade.merkleRoot, 'merkleRoot')}
                    className="text-[#3B82F6] hover:underline text-[10px] flex items-center gap-1"
                  >
                    {copiedField === 'merkleRoot' ? <Check size={12} /> : <Copy size={12} />}
                    {copiedField === 'merkleRoot' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 rounded bg-[#080A0F] border border-[#242B35] text-[11px] text-[#8B95A5] break-all">
                  {trade.merkleRoot}
                </div>
              </div>

              <div className="pt-2 text-[10px] text-[#5F6978] flex items-center justify-between">
                <span>Finalized Block Timestamp</span>
                <span>{trade.timestamp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-[#242B35] bg-[#11161D] space-y-2">
          <button
            onClick={() => {
              onNavigateToVerify(trade.id);
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-mono font-semibold text-xs flex items-center justify-center gap-2 shadow-fintech transition-all"
          >
            <ShieldCheck size={16} />
            Verify Cryptographic Integrity
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onNavigateToBlock(trade.blockNumber);
                onClose();
              }}
              className="py-2 px-3 rounded-lg bg-[#151B23] border border-[#242B35] hover:border-[#3B82F6] text-xs font-mono text-[#F4F7FA] flex items-center justify-center gap-1.5"
            >
              <Box size={14} className="text-[#3B82F6]" />
              View Block #{trade.blockNumber}
            </button>
            <button
              onClick={() => handleCopy(JSON.stringify(trade, null, 2), 'rawJson')}
              className="py-2 px-3 rounded-lg bg-[#151B23] border border-[#242B35] hover:border-[#3B82F6] text-xs font-mono text-[#8B95A5] hover:text-[#F4F7FA] flex items-center justify-center gap-1.5"
            >
              <FileCheck size={14} />
              {copiedField === 'rawJson' ? 'Payload Copied' : 'Export JSON Proof'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
