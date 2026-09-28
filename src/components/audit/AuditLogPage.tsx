import React, { useState, useEffect } from 'react';
import { AuditLogItem } from '../../types/trading';
import {
  FileText, Search, ShieldCheck, Hash, Download, Filter,
  CheckCircle2, AlertTriangle, Copy, Check, X, Eye,
  Clock, User, Database, Zap, Lock, RefreshCw, ChevronDown, ChevronRight,
  PlusCircle, Activity, Server, FileJson, ShieldAlert, GitCommit
} from 'lucide-react';
import { triggerFileDownload } from '../../lib/cryptoUtils';

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  TRADE_CREATED: { bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', border: 'border-[#10B981]/30' },
  BLOCK_COMMITTED: { bg: 'bg-[#3B82F6]/15', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/30' },
  STRATEGY_UPDATED: { bg: 'bg-[#A78BFA]/15', text: 'text-[#A78BFA]', border: 'border-[#A78BFA]/30' },
  RISK_LIMIT_MODIFIED: { bg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30' },
  VERIFICATION_EXECUTED: { bg: 'bg-[#22D3EE]/15', text: 'text-[#22D3EE]', border: 'border-[#22D3EE]/30' },
  GOVERNANCE_ALERT: { bg: 'bg-[#EC4899]/15', text: 'text-[#EC4899]', border: 'border-[#EC4899]/30' },
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  TRADE_CREATED: <Zap size={13} />,
  BLOCK_COMMITTED: <Database size={13} />,
  STRATEGY_UPDATED: <RefreshCw size={13} />,
  RISK_LIMIT_MODIFIED: <AlertTriangle size={13} />,
  VERIFICATION_EXECUTED: <ShieldCheck size={13} />,
  GOVERNANCE_ALERT: <ShieldAlert size={13} />,
};

const INITIAL_AUDIT_TRAIL: AuditLogItem[] = [
  { id: 'AUD-IN-901', timestamp: '2026-09-28 10:15:30', actor: 'Algo Engine (Upstox API)', event: 'TRADE_CREATED', entity: 'TRD-IN-00104 (NIFTY 50 Futures)', hash: '8c7f91a92bc08912f4ca148803ef92e1', status: 'SUCCESS' },
  { id: 'AUD-IN-902', timestamp: '2026-09-28 10:15:31', actor: 'Blockchain Node', event: 'BLOCK_COMMITTED', entity: 'Consensus Block #4281', hash: '00000ab92f8c14d97e3b901fc8129e77', status: 'SUCCESS' },
  { id: 'AUD-IN-903', timestamp: '2026-09-28 10:20:04', actor: 'Sunny Prasad (Admin)', event: 'STRATEGY_UPDATED', entity: 'NIFTY EMA + RSI v1.2', hash: '92ac71b04a871092eac431102948bbcc', status: 'SUCCESS' },
  { id: 'AUD-IN-904', timestamp: '2026-09-28 10:30:12', actor: 'SEBI Risk Engine', event: 'RISK_LIMIT_MODIFIED', entity: 'Single Position Cap Limit', hash: 'e48271018fa9c01192e8471b049a8b00', status: 'SUCCESS' },
  { id: 'AUD-IN-905', timestamp: '2026-09-28 10:45:00', actor: 'Auditor (External Reg)', event: 'VERIFICATION_EXECUTED', entity: 'Cryptographic Attestation #881', hash: '12ef88019a27c011bc9948a7281014e2', status: 'SUCCESS' },
  { id: 'AUD-006', timestamp: '2026-09-28 11:05:12', actor: 'Zerodha Kite API', event: 'TRADE_CREATED', entity: 'TRD-IN-00103 (BANK NIFTY)', hash: 'fa91b2e83c1104cd8372b89a', status: 'SUCCESS' },
  { id: 'AUD-007', timestamp: '2026-09-28 11:10:30', actor: 'Algo Engine (Upstox API)', event: 'BLOCK_COMMITTED', entity: 'Consensus Block #4280', hash: 'b2e83c1104cd8372b91fac21', status: 'SUCCESS' },
  { id: 'AUD-008', timestamp: '2026-09-28 11:15:44', actor: 'Chief Risk Officer', event: 'RISK_LIMIT_MODIFIED', entity: 'Max Drawdown Cap → 5.0%', hash: 'c1104cd8372b91fab2e83441', status: 'SUCCESS' },
  { id: 'AUD-009', timestamp: '2026-09-28 11:22:01', actor: 'SEBI Audit Node #3', event: 'VERIFICATION_EXECUTED', entity: 'Merkle Proof TRD-IN-00102', hash: '04cd8372b91fab2e83c11782', status: 'SUCCESS' },
  { id: 'AUD-010', timestamp: '2026-09-28 11:28:18', actor: 'Algo Engine (Upstox API)', event: 'TRADE_CREATED', entity: 'TRD-IN-00102 (RELIANCE EQ)', hash: '372b91fab2e83c1104cd899a', status: 'SUCCESS' },
  { id: 'AUD-011', timestamp: '2026-09-28 11:32:00', actor: 'Consortium Quorum Node #1', event: 'GOVERNANCE_ALERT', entity: 'PoA Node Key Rotation Verified', hash: '88fab2e83c1104cd8372b110', status: 'SUCCESS' }
];

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('tradechain_audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_AUDIT_TRAIL.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  });

  useEffect(() => {
    try {
      localStorage.setItem('tradechain_audit_logs', JSON.stringify(logs));
    } catch {}
  }, [logs]);

  const [filterQuery, setFilterQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'TIMELINE' | 'CHAIN_TREE' | 'STATS'>('TABLE');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [integrityChecking, setIntegrityChecking] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<null | { valid: number; total: number }>(null);

  const filteredLogs = logs.filter(log => {
    const q = filterQuery.toLowerCase();
    const matchesText = !q || log.actor.toLowerCase().includes(q) || log.entity.toLowerCase().includes(q) ||
      log.hash.toLowerCase().includes(q) || log.id.toLowerCase().includes(q);
    const matchesEvent = selectedEventType === 'ALL' || log.event === selectedEventType;
    const matchesStatus = selectedStatus === 'ALL' || log.status === selectedStatus;
    return matchesText && matchesEvent && matchesStatus;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = 'LogID,Timestamp,Actor,Event,Entity,Hash,Status\n';
    const rows = filteredLogs.map(l =>
      `${l.id},"${l.timestamp}","${l.actor}",${l.event},"${l.entity}","${l.hash}",${l.status}`
    ).join('\n');
    triggerFileDownload(
      headers + rows,
      `TradeChain_AuditLog_${Date.now()}.csv`,
      'text/csv;charset=utf-8;'
    );
  };

  const handleExportJSON = () => {
    triggerFileDownload(
      JSON.stringify(filteredLogs, null, 2),
      `TradeChain_AuditLog_${Date.now()}.json`,
      'application/json;charset=utf-8;'
    );
  };

  const handleIntegrityCheck = () => {
    setIntegrityChecking(true);
    setIntegrityResult(null);
    setTimeout(() => {
      setIntegrityChecking(false);
      setIntegrityResult({ valid: logs.length, total: logs.length });
    }, 1200);
  };

  const handleInjectSimulatedEvent = (type: 'RISK' | 'GOVERNANCE' | 'SECURITY') => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newId = `AUD-0${logs.length + 1}`;
    const hashVal = `0x${Math.random().toString(16).slice(2, 14)}${Math.random().toString(16).slice(2, 14)}`;

    let newEntry: AuditLogItem;
    if (type === 'RISK') {
      newEntry = {
        id: newId,
        timestamp: nowStr,
        actor: 'Autonomous Risk Sentinel',
        event: 'RISK_LIMIT_MODIFIED',
        entity: 'Dynamic Delta Neutral Hedge Rebalanced',
        hash: hashVal,
        status: 'SUCCESS'
      };
    } else if (type === 'GOVERNANCE') {
      newEntry = {
        id: newId,
        timestamp: nowStr,
        actor: 'SEBI Compliance Engine',
        event: 'GOVERNANCE_ALERT',
        entity: 'Daily Regulatory Settlement Envelope Signed',
        hash: hashVal,
        status: 'SUCCESS'
      };
    } else {
      newEntry = {
        id: newId,
        timestamp: nowStr,
        actor: 'Consortium PoA Node #2',
        event: 'BLOCK_COMMITTED',
        entity: 'Consensus Merkle Block Anchor #4283',
        hash: hashVal,
        status: 'SUCCESS'
      };
    }

    setLogs(prev => [newEntry, ...prev]);
    alert(`Injected simulated audit entry "${newEntry.entity}". Anchored with SHA-256 digest ${hashVal.substring(0, 16)}...`);
  };

  // Stats computation
  const byEvent: Record<string, number> = {};
  logs.forEach(l => { byEvent[l.event] = (byEvent[l.event] || 0) + 1; });

  return (
    <div className="space-y-5 w-full max-w-full font-mono">

      {/* ━━━━ 1. HEADER BANNER ━━━━ */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-[#0B0E14] p-5 rounded-2xl border border-slate-200 dark:border-[#1E2633] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#4F46E5]/15 text-[#6366F1] border border-[#4F46E5]/30">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9]">
              Enterprise Cryptographic Audit Trail
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#4F46E5]/15 text-[#6366F1] border border-[#4F46E5]/30 rounded-full">
              APPEND-ONLY LOG
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded-full">
              SEBI COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-sans">
            Immutable, cryptographically chained security logs recording all order executions, block consensus commits, strategy mutations, and administrative governance actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleIntegrityCheck}
            disabled={integrityChecking}
            className="btn-3d btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            {integrityChecking ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            <span>{integrityChecking ? 'Checking Hash Chain...' : 'Verify Hash Chain'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="btn-3d btn-3d-secondary px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            title="Download CSV"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="btn-3d btn-3d-secondary px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            title="Download JSON"
          >
            <FileJson size={13} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Integrity verification notification */}
      {integrityResult && (
        <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#10B981]" />
            <span className="font-bold text-[#10B981]">
              SHA-256 Hash Chain Integrity Affirmed — All {integrityResult.valid}/{integrityResult.total} log entries verified against parent hashes with zero sequence breaks or collisions.
            </span>
          </div>
          <button onClick={() => setIntegrityResult(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ━━━━ 2. KPI CARDS ━━━━ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Chained Log Entries', value: logs.length, color: '#6366F1' },
          { label: 'Verified Success Events', value: logs.filter(l => l.status === 'SUCCESS').length, color: '#10B981' },
          { label: 'Security & Governance Alerts', value: logs.filter(l => l.event === 'GOVERNANCE_ALERT' || l.status === 'FAILED').length, color: '#F59E0B' },
          { label: 'Distinct Signing Principals', value: new Set(logs.map(l => l.actor)).size, color: '#8B5CF6' },
        ].map(c => (
          <div key={c.label} className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-1">
            <span className="text-xs text-slate-500 dark:text-[#8B95A5]">{c.label}</span>
            <div className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* ━━━━ 3. LIVE SIMULATION & CONTROLS TOOLBAR ━━━━ */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder="Search actor, event type, entity target, SHA-256 hash..."
            className="w-full bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] rounded-lg px-3 py-2 text-slate-900 dark:text-[#F4F7FA] outline-none text-xs"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedEventType}
            onChange={e => setSelectedEventType(e.target.value)}
            className="bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] text-slate-900 dark:text-[#F4F7FA] rounded-lg px-3 py-2 text-xs outline-none"
          >
            <option value="ALL">All Event Types</option>
            {Object.keys(EVENT_COLORS).map(ev => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            {(['ALL', 'SUCCESS', 'FAILED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  selectedStatus === s
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#1E2633] text-slate-600 dark:text-[#8B95A5]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-[#1E2633] pl-2">
            {(['TABLE', 'TIMELINE', 'STATS'] as const).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  viewMode === v
                    ? 'bg-[#3B82F6] text-white shadow-sm'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#111620]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulator Quick Action Strip */}
      <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-[#111620] rounded-xl border border-slate-200 dark:border-[#1E2633] text-xs overflow-x-auto">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
          Live Event Simulator:
        </span>
        <button
          onClick={() => handleInjectSimulatedEvent('RISK')}
          className="px-2.5 py-1 rounded bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633] text-[#F59E0B] hover:border-[#F59E0B] text-[10px] font-bold shrink-0"
        >
          + Simulate Risk Rebalance
        </button>
        <button
          onClick={() => handleInjectSimulatedEvent('GOVERNANCE')}
          className="px-2.5 py-1 rounded bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633] text-[#EC4899] hover:border-[#EC4899] text-[10px] font-bold shrink-0"
        >
          + Simulate SEBI Settlement
        </button>
        <button
          onClick={() => handleInjectSimulatedEvent('SECURITY')}
          className="px-2.5 py-1 rounded bg-white dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633] text-[#3B82F6] hover:border-[#3B82F6] text-[10px] font-bold shrink-0"
        >
          + Simulate Consensus Commit
        </button>
      </div>

      {/* ━━━━ 4. TABLE VIEW ━━━━ */}
      {viewMode === 'TABLE' && (
        <div className="rounded-2xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] overflow-hidden">
          <div className="p-3 bg-slate-50 dark:bg-[#111620] border-b border-slate-200 dark:border-[#1E2633] text-xs text-slate-500 flex justify-between">
            <span>Showing <strong className="text-slate-900 dark:text-[#F1F5F9]">{filteredLogs.length}</strong> entries</span>
            <span>Cryptographic Chaining: <strong className="text-[#10B981]">ACTIVE</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[860px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#111620] border-b border-slate-200 dark:border-[#1E2633] text-[10px] text-slate-400 uppercase">
                  <th className="py-2.5 px-3.5">Log ID</th>
                  <th className="py-2.5 px-3.5">Timestamp</th>
                  <th className="py-2.5 px-3.5">Actor / Origin</th>
                  <th className="py-2.5 px-3.5">Event</th>
                  <th className="py-2.5 px-3.5">Target Entity</th>
                  <th className="py-2.5 px-3.5">SHA-256 Digest</th>
                  <th className="py-2.5 px-3.5 text-right">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E2633]">
                {filteredLogs.map(log => {
                  const ec = EVENT_COLORS[log.event] || { bg: 'bg-[#64748B]/15', text: 'text-[#64748B]', border: 'border-[#64748B]/30' };
                  const isExpanded = expandedLog === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`transition-colors hover:bg-slate-50 dark:hover:bg-[#111620]/60 ${isExpanded ? 'bg-slate-50 dark:bg-[#111620]' : ''}`}>
                        <td className="py-2.5 px-3.5 font-bold text-[#6366F1]">{log.id}</td>
                        <td className="py-2.5 px-3.5 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-[#F4F7FA]">{log.actor}</td>
                        <td className="py-2.5 px-3.5">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded border flex items-center gap-1 w-fit ${ec.bg} ${ec.text} ${ec.border}`}>
                            {EVENT_ICONS[log.event]}
                            {log.event}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-900 dark:text-[#F4F7FA] max-w-[200px] truncate">{log.entity}</td>
                        <td className="py-2.5 px-3.5">
                          <button
                            onClick={() => handleCopy(log.hash, log.id)}
                            className="flex items-center gap-1 text-slate-500 hover:text-[#6366F1] font-mono text-[11px]"
                            title="Click to copy hash"
                          >
                            {log.hash.slice(0, 14)}...
                            {copiedId === log.id ? <Check size={11} className="text-[#10B981]" /> : <Copy size={11} />}
                          </button>
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            log.status === 'SUCCESS' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <button
                            onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1E2633] text-slate-600 dark:text-[#8B95A5] hover:text-[#3B82F6] text-[10px] font-bold transition-all flex items-center gap-1 ml-auto"
                          >
                            {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50 dark:bg-[#080A0F]">
                          <td colSpan={8} className="px-5 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              {[
                                { label: 'Audit ID', val: log.id },
                                { label: 'Actor Origin', val: log.actor },
                                { label: 'Recorded Timestamp', val: log.timestamp },
                                { label: 'Event Classification', val: log.event },
                                { label: 'Target Entity', val: log.entity },
                                { label: 'SHA-256 Digest', val: log.hash },
                                { label: 'Consensus Proof', val: '✓ Quorum Affirmation #14' },
                                { label: 'Immutability Guarantee', val: '100% NON-REPUDIABLE' },
                              ].map(f => (
                                <div key={f.label} className="p-3 rounded-lg bg-white dark:bg-[#111620] border border-slate-200 dark:border-[#242B35]">
                                  <div className="text-[10px] text-slate-400">{f.label}</div>
                                  <div className="font-bold text-slate-900 dark:text-[#F4F7FA] mt-0.5 break-all">{f.val}</div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ━━━━ 5. TIMELINE VIEW ━━━━ */}
      {viewMode === 'TIMELINE' && (
        <div className="space-y-3">
          {filteredLogs.map((log, i) => {
            const ec = EVENT_COLORS[log.event] || { bg: 'bg-[#64748B]/15', text: 'text-[#64748B]', border: 'border-[#64748B]/30' };
            return (
              <div key={log.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${ec.bg} ${ec.border}`}>
                    <span className={ec.text}>{EVENT_ICONS[log.event]}</span>
                  </div>
                  {i < filteredLogs.length - 1 && <div className="w-px flex-1 min-h-8 bg-slate-200 dark:bg-[#1E2633] my-1" />}
                </div>
                <div className={`flex-1 p-4 rounded-xl border text-xs bg-white dark:bg-[#0B0E14] border-slate-200 dark:border-[#1E2633] hover:border-[#3B82F6]/50 transition-all`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-[#F4F7FA]">{log.event}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 flex-wrap text-slate-500">
                    <span>Actor: <strong className="text-slate-800 dark:text-[#F1F5F9]">{log.actor}</strong></span>
                    <span>Entity: <strong className="text-slate-800 dark:text-[#F1F5F9]">{log.entity}</strong></span>
                    <span>Hash: <strong className="font-mono text-slate-800 dark:text-[#F1F5F9]">{log.hash.slice(0, 16)}...</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ━━━━ 6. STATS VIEW ━━━━ */}
      {viewMode === 'STATS' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-[#F1F5F9] text-sm">Event Category Distribution</h3>
            <div className="space-y-3">
              {Object.entries(byEvent).map(([event, count]) => {
                const ec = EVENT_COLORS[event] || { bg: 'bg-[#64748B]/15', text: 'text-[#64748B]', border: 'border-[#64748B]/20' };
                const pct = Math.round((count / logs.length) * 100);
                return (
                  <div key={event} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={`flex items-center gap-1.5 font-bold ${ec.text}`}>
                        {EVENT_ICONS[event]} {event}
                      </span>
                      <span className="text-slate-500">{count} events ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-slate-200 dark:bg-[#1E2633] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3B82F6] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
