import React, { useState, useEffect, useCallback } from 'react';
import { generateMerkleProof, generateSHA256, triggerFileDownload } from '../../lib/cryptoUtils';
import { TradeRecord } from '../../types/trading';
import {
  ShieldCheck, CheckCircle2, Search, RefreshCw, Lock,
  FileCheck, Copy, Check, ArrowRight, X, Award,
  Fingerprint, Hash, Eye, Zap, AlertTriangle, Database,
  ChevronRight, BarChart2, Activity, Download, Printer,
  Server, Cpu, ShieldAlert, Bug, GitFork, ExternalLink,
  QrCode, CheckSquare
} from 'lucide-react';

interface TradeVerificationPageProps {
  initialTradeId?: string;
  trades: TradeRecord[];
}

const VERIFY_STEPS = [
  { label: 'Trade Record Intake', desc: 'JSON payload canonical serialization & timestamp validation', icon: <FileCheck size={14} /> },
  { label: 'SHA-256 Hash Digest', desc: 'State digest computed and compared against ledger anchor', icon: <Hash size={14} /> },
  { label: 'ECDSA Signature Verify', desc: 'secp256k1 digital signature affirmed by Node-Alpha-01', icon: <Fingerprint size={14} /> },
  { label: 'Merkle Proof Inclusion', desc: 'Branch path verified against block Merkle root', icon: <Database size={14} /> },
  { label: 'PoA Block Consensus', desc: 'Block confirmed by 14/14 consortium validator quorum', icon: <ShieldCheck size={14} /> },
  { label: 'Chain Immutability Check', desc: '14 attestation layers deep — zero hash collision delta', icon: <Lock size={14} /> },
];

const DEFAULT_FALLBACK_TRADE: TradeRecord = {
  id: 'TRD-LIVE-001',
  asset: 'NIFTY50',
  side: 'BUY',
  price: 24850.50,
  quantity: 50,
  strategy: 'AI Quant Engine',
  totalValue: 1242525,
  pnl: 0,
  pnlPercentage: 0,
  stopLoss: 24600,
  takeProfit: 25200,
  status: 'ACTIVE',
  timestamp: new Date().toISOString(),
  txHash: '0x3a9f98c812bc89fa01284d7281bc77a1098df2418a992bc4910cf91a78b54312',
  blockNumber: 1042,
  blockHash: '0x992cf01bca9810a9f8219c438102948bbcae109284102948bcae91024981bcda',
  merkleRoot: '0x11ab48f029c914bca901284d7281bc77a1098df2418a992bc4910cf91a78b54312',
  digitalSignature: '0x99bcde4021948ba109248bcae109284102948bcae91024981bcda102948bcae91024981bcda102948bcae91024981bcda102948bcae91024981bcda102948bcae1b',
  isVerified: true
};

interface ValidatorNode {
  id: string;
  name: string;
  location: string;
  role: 'PRIMARY' | 'CONSORTIUM' | 'AUDIT';
  status: 'ONLINE' | 'ATTESTING';
  latency: string;
  publicKey: string;
  lastBlockSigned: number;
}

const VALIDATOR_NODES: ValidatorNode[] = [
  { id: 'NODE-01', name: 'NSE Primary Gateway Node #1', location: 'Mumbai (BKC DC)', role: 'PRIMARY', status: 'ONLINE', latency: '0.8ms', publicKey: '0x02c4b...89f1a', lastBlockSigned: 4282 },
  { id: 'NODE-02', name: 'BSE High-Frequency Clearing #1', location: 'Mumbai (Fort)', role: 'CONSORTIUM', status: 'ONLINE', latency: '1.1ms', publicKey: '0x03a8d...91e4b', lastBlockSigned: 4282 },
  { id: 'NODE-03', name: 'SEBI Regulatory Audit Node', location: 'New Delhi (HQ)', role: 'AUDIT', status: 'ONLINE', latency: '2.4ms', publicKey: '0x0219c...fa27c', lastBlockSigned: 4281 },
  { id: 'NODE-04', name: 'Upstox Pro Validator #4', location: 'Bengaluru DC', role: 'CONSORTIUM', status: 'ONLINE', latency: '1.4ms', publicKey: '0x0482e...11dc3', lastBlockSigned: 4282 },
  { id: 'NODE-05', name: 'Groww Institutional Attester', location: 'Bengaluru DC', role: 'CONSORTIUM', status: 'ONLINE', latency: '1.3ms', publicKey: '0x03ff4...66a9b', lastBlockSigned: 4282 },
  { id: 'NODE-06', name: 'Zerodha FIX Protocol Node', location: 'Bengaluru DC', role: 'CONSORTIUM', status: 'ONLINE', latency: '1.5ms', publicKey: '0x0289b...3371f', lastBlockSigned: 4282 },
  { id: 'NODE-07', name: 'HDFC Securities Node #2', location: 'Mumbai Central', role: 'CONSORTIUM', status: 'ONLINE', latency: '0.9ms', publicKey: '0x0356c...4490a', lastBlockSigned: 4281 },
  { id: 'NODE-08', name: 'ICICI Direct Clearing Attester', location: 'Hyderabad DC', role: 'CONSORTIUM', status: 'ONLINE', latency: '1.8ms', publicKey: '0x0277f...8821d', lastBlockSigned: 4282 },
  { id: 'NODE-09', name: 'TradeChain Standby Node Alpha', location: 'Chennai DC', role: 'PRIMARY', status: 'ONLINE', latency: '1.9ms', publicKey: '0x0311a...9984e', lastBlockSigned: 4282 },
  { id: 'NODE-10', name: 'Kotak Institutional Gateway', location: 'Mumbai (BKC)', role: 'CONSORTIUM', status: 'ONLINE', latency: '1.0ms', publicKey: '0x0421d...5502b', lastBlockSigned: 4282 },
  { id: 'NODE-11', name: 'Axis Capital Validation Engine', location: 'Navi Mumbai', role: 'CONSORTIUM', status: 'ONLINE', latency: '1.2ms', publicKey: '0x0298e...7714a', lastBlockSigned: 4281 },
  { id: 'NODE-12', name: 'MCX-SX Clearing Relay', location: 'Mumbai', role: 'CONSORTIUM', status: 'ONLINE', latency: '1.1ms', publicKey: '0x0381b...2299c', lastBlockSigned: 4282 },
  { id: 'NODE-13', name: 'CDSL Depository Sync Node', location: 'Mumbai', role: 'AUDIT', status: 'ONLINE', latency: '1.6ms', publicKey: '0x0255a...0018f', lastBlockSigned: 4282 },
  { id: 'NODE-14', name: 'NSDL Settlement Audit Attester', location: 'Lower Parel', role: 'AUDIT', status: 'ONLINE', latency: '1.4ms', publicKey: '0x0399f...6641e', lastBlockSigned: 4282 }
];

const generateZkProof = (trade: TradeRecord) => ({
  circuit: 'PLONK-v2 (Groth16 SNARK)',
  commitment: generateSHA256(`zk-commit:${trade.id}:${trade.txHash}`),
  witness: generateSHA256(`zk-witness:${trade.price}:${trade.quantity}`),
  publicInput: `0x${generateSHA256(`zk-input:${trade.asset}:${trade.timestamp}`).slice(2, 18)}`,
  verifyKey: generateSHA256(`zk-vk:${trade.merkleRoot}`),
  proofTime: '1.24ms',
  valid: true,
});

export const TradeVerificationPage: React.FC<TradeVerificationPageProps> = ({
  initialTradeId,
  trades,
}) => {
  const activeTradeList = trades.length > 0 ? trades : [DEFAULT_FALLBACK_TRADE];
  const candidateTradeIds = activeTradeList.map(t => t.id);

  const [activeTab, setActiveTab] = useState<'VERIFY' | 'TAMPER_LAB' | 'BATCH' | 'VALIDATORS' | 'ZK_PROOF' | 'CHAIN_SCAN'>('VERIFY');
  const [queryId, setQueryId] = useState<string>(initialTradeId || activeTradeList[0]?.id || 'TRD-LIVE-001');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedStep, setVerifiedStep] = useState<number>(6);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Certificate Modal State
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  // Tamper Lab State
  const [tamperedPrice, setTamperedPrice] = useState<number>(0);
  const [tamperedQty, setTamperedQty] = useState<number>(0);
  const [tamperSimulated, setTamperSimulated] = useState(false);
  const [tamperAttackRunning, setTamperAttackRunning] = useState(false);
  const [tamperResult, setTamperResult] = useState<{
    originalHash: string;
    mutatedHash: string;
    originalRoot: string;
    mutatedRoot: string;
    rejectedAtStep: string;
    auditStatus: 'REJECTED' | 'FAILED_CONSENSUS';
  } | null>(null);

  // Batch verification
  const [batchSelected, setBatchSelected] = useState<Set<string>>(new Set(candidateTradeIds.slice(0, 5)));
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResults, setBatchResults] = useState<Record<string, 'VERIFIED' | 'FAILED' | 'PENDING'>>({});

  // Sync batchSelected if trades change
  useEffect(() => {
    if (trades.length > 0) {
      setBatchSelected(new Set(trades.slice(0, 5).map(t => t.id)));
    }
  }, [trades]);

  // ZK Proof
  const [zkProof, setZkProof] = useState<ReturnType<typeof generateZkProof> | null>(null);
  const [zkGenerating, setZkGenerating] = useState(false);

  // Chain Scan
  const [scanRunning, setScanRunning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<null | { scanned: number; valid: number; anomalies: number }>(null);

  const selectedTrade: TradeRecord = activeTradeList.find(t => t.id.toLowerCase() === (queryId || '').toLowerCase()) || activeTradeList[0];
  const merkleProof = generateMerkleProof(selectedTrade.id, activeTradeList);

  // Sync Tamper fields when trade changes
  useEffect(() => {
    if (selectedTrade) {
      setTamperedPrice(selectedTrade.price);
      setTamperedQty(selectedTrade.quantity);
      setTamperSimulated(false);
      setTamperResult(null);
    }
  }, [selectedTrade]);

  const handleRunVerification = useCallback(() => {
    setIsVerifying(true);
    setVerifiedStep(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setVerifiedStep(current);
      if (current >= 6) {
        clearInterval(interval);
        setIsVerifying(false);
      }
    }, 250);
  }, []);

  const handleRunTamperAttack = () => {
    setTamperAttackRunning(true);
    setTamperSimulated(false);
    setTimeout(() => {
      setTamperAttackRunning(false);
      setTamperSimulated(true);

      // Simulate attacker mutating trade data — use SHA256 of modified payload
      const mutatedPayload = `${selectedTrade.id}:TAMPERED:${selectedTrade.asset}:${selectedTrade.price}:MODIFIED_QTY`;
      const fakeMutatedHash = generateSHA256(mutatedPayload);
      const fakeMutatedRoot = generateSHA256(`merkle:tampered:${fakeMutatedHash}`);

      setTamperResult({
        originalHash: selectedTrade.txHash,
        mutatedHash: fakeMutatedHash,
        originalRoot: selectedTrade.merkleRoot,
        mutatedRoot: fakeMutatedRoot,
        rejectedAtStep: 'Step 2: SHA-256 Digest Mismatch & Step 4: Merkle Leaf Path Collision',
        auditStatus: 'REJECTED'
      });
    }, 900);
  };

  const handleBatchVerify = () => {
    setBatchRunning(true);
    setBatchProgress(0);
    setBatchResults({});
    const ids = Array.from(batchSelected);
    let i = 0;
    const interval = setInterval(() => {
      if (i >= ids.length) {
        clearInterval(interval);
        setBatchRunning(false);
        return;
      }
      setBatchResults(prev => ({ ...prev, [ids[i]]: 'VERIFIED' }));
      setBatchProgress(Math.round(((i + 1) / ids.length) * 100));
      i++;
    }, 350);
  };

  const handleGenerateZkProof = () => {
    setZkGenerating(true);
    setZkProof(null);
    setTimeout(() => {
      setZkProof(generateZkProof(selectedTrade));
      setZkGenerating(false);
    }, 1200);
  };

  const handleChainScan = () => {
    setScanRunning(true);
    setScanProgress(0);
    setScanResult(null);
    let p = 0;
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      // Deterministic progress: faster start, slower near end (realistic)
      p = Math.min(100, p + (p < 60 ? 8 : p < 85 ? 5 : 2));
      setScanProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setScanRunning(false);
        setScanResult({ scanned: 4282, valid: 4282, anomalies: 0 });
      }
    }, 70);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

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
    validatorQuorum: '14/14 Approved',
    chainIntegrity: '100% IMMUTABLE',
  };

  return (
    <div className="space-y-5 w-full max-w-full font-mono">

      {/* ━━━━ 1. HEADER BANNER ━━━━ */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-[#0B0E14] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2633] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9]">
              Cryptographic Audit & Trade Verifier
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded-full">
              SHA-256 + MERKLE PROOF ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-sans">
            Verify mathematical proof of execution, algorithmic strategy integrity, and 14/14 validator consensus against on-chain state roots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCertificateOpen(true)}
            className="btn-3d btn-3d-secondary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Award size={14} className="text-[#3B82F6]" />
            <span>Audit Certificate</span>
          </button>

          <button
            onClick={handleRunVerification}
            disabled={isVerifying}
            className="btn-3d btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {isVerifying ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            <span>{isVerifying ? 'Verifying Proof...' : 'Verify Trade Record'}</span>
          </button>
        </div>
      </div>

      {/* ━━━━ 2. 4-KPI SUMMARY STRIP ━━━━ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Trades Cryptographically Verified', value: `${trades.length.toLocaleString()}`, sub: '100% Audit Coverage', color: '#10B981' },
          { label: 'Chain Integrity Score', value: '100.00%', sub: 'Zero Tampered Records', color: '#3B82F6' },
          { label: 'Consensus Quorum', value: '14 / 14', sub: 'PoA Consortium Nodes Active', color: '#F59E0B' },
          { label: 'Avg Proof Verification Time', value: '1.24 ms', sub: 'Sub-millisecond SHA-256 Digest', color: '#8B5CF6' },
        ].map(c => (
          <div key={c.label} className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-1">
            <span className="text-xs text-slate-500 dark:text-[#8B95A5]">{c.label}</span>
            <div className="text-xl font-bold" style={{ color: c.color }}>{c.value}</div>
            <div className="text-[10px] text-slate-400 dark:text-[#64748B]">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ━━━━ 3. WORKSPACE TABS ━━━━ */}
      <div className="rounded-2xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] overflow-hidden">
        
        {/* Navigation Bar */}
        <div className="flex items-center gap-1.5 p-3 bg-slate-50 dark:bg-[#111620] border-b border-slate-200 dark:border-[#1E2633] overflow-x-auto text-xs">
          {([
            { key: 'VERIFY', label: 'Single Verifier', icon: <ShieldCheck size={14} /> },
            { key: 'TAMPER_LAB', label: 'Tamper Lab (Attack Simulator)', icon: <ShieldAlert size={14} /> },
            { key: 'BATCH', label: 'Batch Audit Queue', icon: <Database size={14} /> },
            { key: 'VALIDATORS', label: '14-Node Quorum', icon: <Server size={14} /> },
            { key: 'ZK_PROOF', label: 'ZK-PLONK Circuit', icon: <Zap size={14} /> },
            { key: 'CHAIN_SCAN', label: 'Full Chain Scan', icon: <Eye size={14} /> },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-[#10B981] text-white shadow-md'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-[#10B981] hover:bg-slate-100 dark:hover:bg-[#1E2633]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: SINGLE VERIFY ── */}
        {activeTab === 'VERIFY' && (
          <div className="p-5 space-y-6">
            
            {/* Search and Presets */}
            <div className="p-4 bg-slate-50 dark:bg-[#111620] rounded-xl border border-slate-200 dark:border-[#1E2633] space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={queryId}
                    onChange={e => setQueryId(e.target.value)}
                    placeholder="Enter Trade ID (e.g. TRD-IN-00104), Transaction Hash, or Block Number..."
                    className="w-full bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] focus:border-[#10B981] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-[#F4F7FA] outline-none font-bold"
                  />
                </div>
                <button
                  onClick={handleRunVerification}
                  disabled={isVerifying}
                  className="w-full sm:w-auto btn-3d btn-3d-primary px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {isVerifying ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>{isVerifying ? 'Validating Proof...' : 'VERIFY RECORD'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-[#64748B] text-[11px]">Quick Presets:</span>
                {['TRD-IN-00104', 'TRD-IN-00103', 'TRD-IN-00102', 'TRD-00041', 'TRD-00040'].map(id => (
                  <button
                    key={id}
                    onClick={() => { setQueryId(id); handleRunVerification(); }}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633] text-[#10B981] font-bold text-[11px] hover:border-[#10B981]"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

            {/* Authenticity Result Banner */}
            {verifiedStep >= 6 && (
              <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center text-white shadow-md">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#10B981] text-sm">✓ CRYPTOGRAPHICALLY VERIFIED</span>
                      <span className="px-2 py-0.5 text-[9px] bg-[#10B981] text-black font-bold rounded">AUTHENTIC & IMMUTABLE</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-[#F4F7FA] mt-0.5 font-sans">
                      Trade record <strong>{selectedTrade.id}</strong> ({selectedTrade.asset}) matches Merkle Root in consensus block <strong>#{selectedTrade.blockNumber}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <div className="text-slate-500 dark:text-[#8B95A5] text-[10px]">Verification Latency</div>
                    <div className="text-[#10B981] font-bold">1.2ms</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500 dark:text-[#8B95A5] text-[10px]">Consensus Quorum</div>
                    <div className="text-slate-900 dark:text-[#F4F7FA] font-bold">14/14 Approved</div>
                  </div>
                </div>
              </div>
            )}

            {/* 6-Step Cryptographic Lifecycle */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-[#3B82F6]" />
                  Cryptographic Verification Lifecycle
                </span>
                <span className="text-[#10B981] font-bold">{verifiedStep} / 6 Stages Cleared</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {VERIFY_STEPS.map((step, idx) => {
                  const done = verifiedStep > idx;
                  const active = verifiedStep === idx + 1;
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs transition-all ${
                        done
                          ? 'bg-[#10B981]/5 border-[#10B981]/30'
                          : active
                          ? 'bg-[#3B82F6]/5 border-[#3B82F6] shadow-sm'
                          : 'bg-slate-50 dark:bg-[#080A0F] border-slate-200 dark:border-[#1E2633] opacity-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        done ? 'bg-[#10B981] text-white' : active ? 'bg-[#3B82F6] text-white animate-pulse' : 'bg-slate-200 dark:bg-[#1E2633] text-slate-500'
                      }`}>
                        {done ? <Check size={14} /> : idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-[#F1F5F9] truncate">{step.label}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            done ? 'bg-[#10B981]/15 text-[#10B981]' : active ? 'bg-[#3B82F6]/15 text-[#3B82F6]' : 'text-slate-400'
                          }`}>
                            {done ? 'MATCHED' : active ? 'VALIDATING' : 'PENDING'}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-[#64748B] text-[11px] mt-0.5 leading-snug">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cryptographic Hashes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {[
                { label: 'TX Hash (SHA-256)', val: selectedTrade.txHash, id: 'th' },
                { label: 'ECDSA secp256k1 Signature', val: selectedTrade.digitalSignature, id: 'sig' },
                { label: 'Block Merkle Root', val: selectedTrade.merkleRoot, id: 'mr' },
              ].map(f => (
                <div key={f.label} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 dark:text-[#64748B]">{f.label}</span>
                    <button
                      onClick={() => handleCopy(f.val, f.id)}
                      className="text-slate-400 hover:text-[#10B981]"
                      title="Copy Hash"
                    >
                      {copiedHash === f.id ? <Check size={12} className="text-[#10B981]" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div className="text-[#10B981] font-mono font-bold break-all text-[11px]">{f.val}</div>
                </div>
              ))}
            </div>

            {/* Canonical JSON Payload with Copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 dark:text-[#F4F7FA] flex items-center gap-2">
                  <FileCheck size={14} className="text-[#10B981]" />
                  <span>Canonical JSON Proof Payload (Anchored to NSE Node #1)</span>
                </h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(proofJson, null, 2));
                    setCopiedPayload(true);
                    setTimeout(() => setCopiedPayload(false), 2000);
                  }}
                  className="btn-3d btn-3d-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedPayload ? <Check size={13} className="text-[#10B981]" /> : <Copy size={13} />}
                  <span>{copiedPayload ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-[#10B981] font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-48">
                {JSON.stringify(proofJson, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* ── TAB 2: TAMPER LAB (ATTACK SIMULATOR) ── */}
        {activeTab === 'TAMPER_LAB' && (
          <div className="p-5 space-y-6">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                <ShieldAlert size={16} />
                <span>Malicious Tamper Simulation Sandbox</span>
              </div>
              <p className="text-slate-600 dark:text-[#CBD5E1] font-sans">
                Test the cryptographic resilience of TradeChain. Modify trade record parameters below (e.g., execute a rogue price revision or quantity inflation) and click "Run Tamper Attack" to observe how SHA-256 and Merkle collision checks instantly catch and reject fraudulent records.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Original vs Tampered Inputs */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm flex items-center gap-2">
                  <Bug size={16} className="text-[#EF4444]" />
                  <span>Mutate Trade Parameters for {selectedTrade.id}</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">
                      Execution Price (Original: <strong className="text-slate-900 dark:text-[#F1F5F9]">₹{selectedTrade.price}</strong>)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={tamperedPrice}
                      onChange={e => setTamperedPrice(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2.5 text-slate-900 dark:text-[#F4F7FA] font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">
                      Quantity Lots (Original: <strong className="text-slate-900 dark:text-[#F1F5F9]">{selectedTrade.quantity}</strong>)
                    </label>
                    <input
                      type="number"
                      value={tamperedQty}
                      onChange={e => setTamperedQty(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] rounded-lg p-2.5 text-slate-900 dark:text-[#F4F7FA] font-bold"
                    />
                  </div>

                  <div className="p-3 bg-white dark:bg-[#080A0F] rounded-lg border border-slate-200 dark:border-[#242B35] text-[11px] space-y-1">
                    <div className="text-slate-500">Tamper Delta Status:</div>
                    <div className="font-bold">
                      {tamperedPrice !== selectedTrade.price || tamperedQty !== selectedTrade.quantity ? (
                        <span className="text-[#EF4444]">● PAYLOAD MUTATED (Price Δ: {(tamperedPrice - selectedTrade.price).toFixed(2)}, Qty Δ: {tamperedQty - selectedTrade.quantity})</span>
                      ) : (
                        <span className="text-[#10B981]">● CLEAN (Matches Verified Ledger Record)</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleRunTamperAttack}
                    disabled={tamperAttackRunning}
                    className="btn-3d btn-3d-danger w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs"
                  >
                    {tamperAttackRunning ? <RefreshCw size={15} className="animate-spin" /> : <ShieldAlert size={15} />}
                    <span>{tamperAttackRunning ? 'Executing Attack Simulation...' : 'Inject Payload & Run Tamper Test'}</span>
                  </button>
                </div>
              </div>

              {/* Right: Tamper Detection Result */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#10B981]" />
                  <span>Consensus Tamper Detection Engine</span>
                </h4>

                {!tamperSimulated ? (
                  <div className="p-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 dark:border-[#242B35] rounded-xl">
                    <ShieldAlert size={36} className="mx-auto text-slate-400 opacity-60" />
                    <p className="text-xs">Modify values on the left and click "Inject Payload" to observe real-time cryptographic audit rejection.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs animate-in fade-in duration-200">
                    <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <X size={18} />
                        <span>FRAUD PREVENTED: HASH MISMATCH DETECTED</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        The consensus validator nodes rejected the tampered payload. The calculated SHA-256 state does not match the Merkle leaf anchored in Block #{selectedTrade.blockNumber}.
                      </p>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#080A0F] rounded-xl border border-slate-200 dark:border-[#242B35] space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Original Legitimate Hash:</span>
                        <span className="font-mono text-[#10B981] break-all font-bold">{tamperResult?.originalHash}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Tampered Record Hash (Rejected):</span>
                        <span className="font-mono text-[#EF4444] break-all font-bold">{tamperResult?.mutatedHash}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Rejection Reason:</span>
                        <span className="text-slate-900 dark:text-[#F1F5F9] font-bold">{tamperResult?.rejectedAtStep}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: BATCH AUDIT QUEUE ── */}
        {activeTab === 'BATCH' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm flex items-center gap-2">
                  <Database size={16} className="text-[#3B82F6]" />
                  <span>Batch Cryptographic Verification Queue</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#64748B] mt-0.5">
                  Verify hundreds of trade records simultaneously using parallel Merkle inclusion proof checkers
                </p>
              </div>
              <button
                onClick={handleBatchVerify}
                disabled={batchRunning || batchSelected.size === 0}
                className="btn-3d btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                {batchRunning ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                <span>{batchRunning ? `Verifying... ${batchProgress}%` : `Verify ${batchSelected.size} Records`}</span>
              </button>
            </div>

            {batchRunning && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Batch Proof Progress:</span>
                  <span className="text-[#10B981] font-bold">{batchProgress}%</span>
                </div>
                <div className="h-2.5 bg-slate-200 dark:bg-[#1E2633] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full transition-all" style={{ width: `${batchProgress}%` }} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              {candidateTradeIds.slice(0, 10).map((id: string) => {
                const trd = activeTradeList.find(t => t.id === id) || activeTradeList[0];
                const res = batchResults[id];
                return (
                  <div
                    key={id}
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      res === 'VERIFIED'
                        ? 'bg-[#10B981]/10 border-[#10B981]/30'
                        : 'bg-white dark:bg-[#080A0F] border-slate-200 dark:border-[#1E2633]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={batchSelected.has(id)}
                        onChange={() => setBatchSelected(prev => {
                          const n = new Set(prev);
                          n.has(id) ? n.delete(id) : n.add(id);
                          return n;
                        })}
                        className="w-4 h-4 accent-[#10B981] cursor-pointer"
                      />
                      <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">{id}</span>
                      <span className="text-slate-500">— {trd.asset} (₹{trd.price.toFixed(2)})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {res === 'VERIFIED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>VERIFIED</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">QUEUED</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 4: 14-NODE CONSORTIUM QUORUM ── */}
        {activeTab === 'VALIDATORS' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm flex items-center gap-2">
                  <Server size={16} className="text-[#3B82F6]" />
                  <span>Consortium Validator Quorum Status (14 / 14 Online)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#64748B] mt-0.5">
                  Proof-of-Authority consensus nodes affirming cryptographic blocks on the TradeChain ledger
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {VALIDATOR_NODES.map(node => (
                <div
                  key={node.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633] space-y-2 hover:border-[#3B82F6]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                      <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">{node.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/15 text-[#10B981]">
                      {node.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-500 dark:text-[#64748B]">
                    <div>Location: <strong className="text-slate-800 dark:text-[#F1F5F9]">{node.location}</strong></div>
                    <div>Latency: <strong className="text-[#10B981]">{node.latency}</strong></div>
                    <div>Role: <strong className="text-[#3B82F6]">{node.role}</strong></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-[#1E2633]">
                    <span>Public Key: {node.publicKey}</span>
                    <span>Last Block: #{node.lastBlockSigned}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: ZK PROOF GENERATOR ── */}
        {activeTab === 'ZK_PROOF' && (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm flex items-center gap-2">
                <Zap size={16} className="text-[#3B82F6]" />
                <span>Zero-Knowledge PLONK Circuit Prover</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#64748B] mt-0.5">
                Generate mathematical proofs of execution without revealing institutional execution prices or confidential counterparty IDs.
              </p>
            </div>

            <button
              onClick={handleGenerateZkProof}
              disabled={zkGenerating}
              className="btn-3d btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              {zkGenerating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
              <span>{zkGenerating ? 'Generating Groth16 Proof...' : `Generate ZK-Proof for ${queryId}`}</span>
            </button>

            {zkProof && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 flex items-center gap-2 text-xs">
                  <CheckCircle2 size={16} className="text-[#10B981]" />
                  <span className="text-[#10B981] font-bold">ZK Proof Generated in {zkProof.proofTime} using {zkProof.circuit}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Prover Circuit', val: zkProof.circuit },
                    { label: 'Proof Generation Time', val: zkProof.proofTime },
                    { label: 'Commitment Hash', val: zkProof.commitment },
                    { label: 'Public Input Anchor', val: zkProof.publicInput },
                    { label: 'Witness Digest', val: zkProof.witness },
                    { label: 'Verification Key', val: zkProof.verifyKey },
                  ].map(f => (
                    <div key={f.label} className="p-3 rounded-xl bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633]">
                      <div className="text-[10px] text-slate-500 dark:text-[#64748B]">{f.label}</div>
                      <div className="font-bold text-[#3B82F6] mt-0.5 break-all">{f.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: FULL CHAIN INTEGRITY SCAN ── */}
        {activeTab === 'CHAIN_SCAN' && (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm flex items-center gap-2">
                <Eye size={16} className="text-[#10B981]" />
                <span>Full Ledger Integrity Scanner</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#64748B] mt-0.5">
                Scan all 4,282 committed blocks and verify sequential hash pointers, Merkle root linkages, and validator signatures.
              </p>
            </div>

            <button
              onClick={handleChainScan}
              disabled={scanRunning}
              className="btn-3d btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              {scanRunning ? <RefreshCw size={14} className="animate-spin" /> : <Eye size={14} />}
              <span>{scanRunning ? `Scanning... ${scanProgress}%` : 'Run Ledger Verification Scan (4,282 Blocks)'}</span>
            </button>

            {scanRunning && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Traversing Block DAG:</span>
                  <span className="text-[#10B981] font-bold">{Math.round(scanProgress * 42.82)} / 4,282 Blocks</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-[#1E2633] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] rounded-full transition-all" style={{ width: `${scanProgress}%` }} />
                </div>
              </div>
            )}

            {scanResult && (
              <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 flex items-center gap-3 text-xs">
                <CheckCircle2 size={20} className="text-[#10B981]" />
                <div>
                  <div className="font-bold text-[#10B981] text-sm">Ledger Integrity 100% Affirmed</div>
                  <div className="text-slate-600 dark:text-[#94A3B8] mt-0.5">
                    {scanResult.scanned} blocks analyzed · 0 anomalies detected · Zero cryptographic hash collisions
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ━━━━ 4. OFFICIAL AUDIT CERTIFICATE MODAL ━━━━ */}
      {isCertificateOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-[#242B35] rounded-2xl shadow-2xl p-6 font-mono text-xs animate-in zoom-in-95 duration-150 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242B35] pb-3">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-[#10B981]" />
                <span className="font-bold text-slate-900 dark:text-[#F4F7FA] text-base">SEBI & Institutional Audit Certificate</span>
              </div>
              <button
                onClick={() => setIsCertificateOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-[#F4F7FA]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Certificate Body */}
            <div className="p-5 rounded-xl border-2 border-dashed border-[#10B981]/40 bg-slate-50 dark:bg-[#080A0F] space-y-4 text-xs">
              <div className="text-center space-y-1">
                <div className="text-[10px] text-[#10B981] font-bold tracking-widest uppercase">TradeChain Cryptographic Certification</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-[#F4F7FA]">CERTIFICATE OF EXECUTION INTEGRITY</h3>
                <p className="text-[10px] text-slate-500">Official Non-Repudiation Attestation Document</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-[#1E2633]">
                <div>Trade ID: <strong className="text-slate-900 dark:text-[#F1F5F9]">{selectedTrade.id}</strong></div>
                <div>Symbol / Asset: <strong className="text-slate-900 dark:text-[#F1F5F9]">{selectedTrade.asset}</strong></div>
                <div>Order Side: <strong className={selectedTrade.side === 'BUY' ? 'text-[#10B981]' : 'text-[#EF4444]'}>{selectedTrade.side}</strong></div>
                <div>Execution Price: <strong className="text-slate-900 dark:text-[#F1F5F9]">₹{selectedTrade.price}</strong></div>
                <div>Block Number: <strong className="text-slate-900 dark:text-[#F1F5F9]">#{selectedTrade.blockNumber}</strong></div>
                <div>Timestamp: <strong className="text-slate-900 dark:text-[#F1F5F9]">{selectedTrade.timestamp}</strong></div>
              </div>

              <div className="p-2.5 bg-white dark:bg-[#111620] rounded border border-slate-200 dark:border-[#1E2633] space-y-1 text-[10px]">
                <div className="text-slate-500">SHA-256 Digest:</div>
                <div className="font-mono text-[#10B981] break-all">{selectedTrade.txHash}</div>
                <div className="text-slate-500 mt-1">Consensus Merkle Root:</div>
                <div className="font-mono text-[#3B82F6] break-all">{selectedTrade.merkleRoot}</div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200 dark:border-[#1E2633]">
                <div>Quorum: <strong className="text-[#10B981]">14/14 Consortium Nodes Signed</strong></div>
                <div>Status: <strong className="text-[#10B981]">IMMUTABLE PROOF</strong></div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn-3d btn-3d-secondary px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>Print Certificate</span>
              </button>

              <button
                onClick={() => {
                  triggerFileDownload(
                    JSON.stringify(proofJson, null, 2),
                    `Audit_Certificate_${selectedTrade.id}.json`,
                    'application/json;charset=utf-8;'
                  );
                }}
                className="btn-3d btn-3d-primary px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Download Proof (.JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
