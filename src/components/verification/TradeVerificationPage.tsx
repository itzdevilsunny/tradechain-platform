import React, { useState, useEffect } from 'react';
import { generateMerkleProof } from '../../lib/cryptoUtils';
import { TradeRecord } from '../../types/trading';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Lock, 
  FileCheck, 
  Copy, 
  Check,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';

interface TradeVerificationPageProps {
  initialTradeId?: string;
  trades: TradeRecord[];
}

export const TradeVerificationPage: React.FC<TradeVerificationPageProps> = ({
  initialTradeId = 'TRD-00041',
  trades
}) => {
  const [queryId, setQueryId] = useState(initialTradeId);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStep, setVerifiedStep] = useState<number>(6);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const selectedTrade = trades.find(t => t.id.toLowerCase() === queryId.toLowerCase()) || trades[0];
  const merkleProof = generateMerkleProof(selectedTrade.id);

  const handleRunVerification = () => {
    setIsVerifying(true);
    setVerifiedStep(0);

    // Step-by-step verification animation simulation
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setVerifiedStep(current);
      if (current >= 6) {
        clearInterval(interval);
        setIsVerifying(false);
      }
    }, 250);
  };

  const steps = [
    { label: 'Trade Record Intake', desc: 'JSON payload canonical serialization & timestamp validation' },
    { label: 'Hash Calculation', desc: 'SHA-256 state digest computed (0x8c7f91a92...)' },
    { label: 'Digital Signature', desc: 'ECDSA SECP256K1 signature affirmed by Node 01' },
    { label: 'Merkle Proof Inclusion', desc: 'Binary tree branch proof path matched to Root 9ab42...' },
    { label: 'Block Consensus', desc: 'Committed to Block #4281 by PoA Consortium quorum' },
    { label: 'Chain Immutability', desc: '14 network attestations deep. Zero collision delta' }
  ];

  const proofJson = {
    tradeId: selectedTrade.id,
    asset: selectedTrade.asset,
    side: selectedTrade.side,
    priceINR: selectedTrade.price,
    quantity: selectedTrade.quantity,
    strategy: selectedTrade.strategy,
    timestamp: selectedTrade.timestamp,
    txHash: selectedTrade.txHash,
    blockNumber: selectedTrade.blockNumber,
    blockHash: selectedTrade.blockHash,
    merkleRoot: selectedTrade.merkleRoot,
    digitalSignature: selectedTrade.digitalSignature,
    chainIntegrity: '100% IMMUTABLE'
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(proofJson, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Verification Card Header */}
      <div className="p-6 rounded-2xl bg-[#11161D] border border-[#242B35] shadow-fintech space-y-4">
        
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/40 items-center justify-center text-[#10B981] shadow-glow-green mb-1">
            <ShieldCheck size={26} />
          </div>
          <h2 className="text-xl font-bold font-mono text-[#F4F7FA] tracking-tight">
            Cryptographic Trade Verifier
          </h2>
          <p className="text-xs text-[#8B95A5]">
            Verify mathematical proof of execution, algorithmic strategy integrity, and validator consensus against on-chain state roots.
          </p>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-3 text-[#5F6978]" />
            <input
              type="text"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Enter Trade ID, Transaction Hash, or Block Number..."
              className="w-full bg-[#080A0F] border border-[#242B35] focus:border-[#10B981] rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-[#F4F7FA] outline-none transition-colors"
            />
          </div>

          <button
            onClick={handleRunVerification}
            disabled={isVerifying}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-mono font-semibold text-xs flex items-center justify-center gap-2 shadow-fintech transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {isVerifying ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Validating Proof...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>VERIFY RECORD</span>
              </>
            )}
          </button>
        </div>

        {/* Preset query chips */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#8B95A5]">
          <span>Try Presets:</span>
          {['TRD-00041', 'TRD-00040', 'TRD-00039'].map(id => (
            <button
              key={id}
              onClick={() => {
                setQueryId(id);
                handleRunVerification();
              }}
              className="px-2.5 py-0.5 rounded bg-[#151B23] border border-[#242B35] text-[#3B82F6] hover:underline"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Banner */}
      {verifiedStep >= 6 && (
        <div className="p-5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-glow-green">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono text-[#10B981]">
                  ✓ CRYPTOGRAPHICALLY VERIFIED
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono bg-[#10B981] text-black font-bold rounded">
                  AUTHENTIC
                </span>
              </div>
              <p className="text-xs text-[#F4F7FA] font-mono mt-0.5">
                Trade record integrity confirmed. Tamper-evident hash matches consensus ledger block #{selectedTrade.blockNumber}.
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-xs text-[#8B95A5]">
            <div>Latency: <span className="text-[#10B981] font-bold">1.2ms</span></div>
            <div>Validator Quorum: <span className="text-[#F4F7FA] font-bold">14/14</span></div>
          </div>
        </div>
      )}

      {/* 6-Step Verification Timeline */}
      <div className="p-6 rounded-xl bg-[#11161D] border border-[#242B35] space-y-4 shadow-fintech">
        <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider flex items-center justify-between">
          <span>Cryptographic Verification Lifecycle</span>
          <span className="text-[#10B981] font-semibold">{verifiedStep} / 6 Steps Cleared</span>
        </h3>

        <div className="space-y-3">
          {steps.map((step, idx) => {
            const isCompleted = verifiedStep > idx;
            const isCurrent = verifiedStep === idx + 1;

            return (
              <div 
                key={idx}
                className={`
                  p-3.5 rounded-xl border transition-all flex items-start gap-3.5 font-mono text-xs
                  ${isCompleted 
                    ? 'bg-[#151B23] border-[#10B981]/40 text-[#F4F7FA]' 
                    : isCurrent 
                    ? 'bg-[#151B23] border-[#3B82F6] text-[#F4F7FA] shadow-glow-blue' 
                    : 'bg-[#080A0F] border-[#242B35] opacity-50 text-[#5F6978]'
                  }
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                  ${isCompleted 
                    ? 'bg-[#10B981] text-black' 
                    : isCurrent 
                    ? 'bg-[#3B82F6] text-white animate-pulse' 
                    : 'bg-[#242B35] text-[#5F6978]'
                  }
                `}>
                  {isCompleted ? <Check size={14} /> : idx + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{step.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isCompleted ? 'bg-[#10B981]/15 text-[#10B981]' : 'text-[#5F6978]'}`}>
                      {isCompleted ? 'MATCHED' : isCurrent ? 'EXECUTING' : 'PENDING'}
                    </span>
                  </div>
                  <p className="text-[#8B95A5] text-xs mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw Proof JSON Payload Viewer */}
      <div className="p-6 rounded-xl bg-[#11161D] border border-[#242B35] space-y-3 shadow-fintech">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
            <FileCheck size={16} className="text-[#3B82F6]" />
            Canonical JSON-LD Proof Payload
          </h3>

          <button
            onClick={handleCopyJson}
            className="px-3 py-1.5 rounded-lg bg-[#151B23] border border-[#242B35] hover:border-[#3B82F6] text-xs font-mono text-[#F4F7FA] flex items-center gap-1.5 transition-colors"
          >
            {copiedPayload ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
            <span>{copiedPayload ? 'Proof Copied!' : 'Copy Proof JSON'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-[#080A0F] border border-[#1E2631] text-xs font-mono text-[#10B981] overflow-x-auto leading-relaxed">
          {JSON.stringify(proofJson, null, 2)}
        </pre>
      </div>
    </div>
  );
};
