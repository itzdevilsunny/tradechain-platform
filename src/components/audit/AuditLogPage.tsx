import React, { useState } from 'react';
import { MOCK_AUDIT_LOGS } from '../../lib/mockData';
import { AuditLogItem } from '../../types/trading';
import { FileText, Search, Filter, ShieldCheck, Hash, ExternalLink } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => {
    const matchesText = log.actor.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.hash.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(filterQuery.toLowerCase());

    const matchesEvent = selectedEventType === 'ALL' || log.event === selectedEventType;

    return matchesText && matchesEvent;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11161D] p-5 rounded-xl border border-[#242B35]">
        <div>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-[#F4F7FA] font-mono tracking-tight">
              Enterprise Audit Trail & Security Ledger
            </h2>
          </div>
          <p className="text-xs text-[#8B95A5] mt-1">
            Immutable, append-only security logs recording all engine mutations and block commits.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/30 font-mono text-xs font-bold text-[#3B82F6] flex items-center gap-1.5">
          <ShieldCheck size={16} />
          CRYPTOGRAPHIC COMPLIANCE READY
        </span>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] flex flex-wrap items-center justify-between gap-3 shadow-fintech">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-[#5F6978]" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by actor, entity, hash or log ID..."
              className="w-full bg-[#080A0F] border border-[#242B35] focus:border-[#3B82F6] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-[#F4F7FA] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#8B95A5]">Event Type:</span>
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="bg-[#080A0F] border border-[#242B35] text-[#F4F7FA] rounded-lg px-3 py-2 outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="TRADE_CREATED">TRADE_CREATED</option>
            <option value="BLOCK_COMMITTED">BLOCK_COMMITTED</option>
            <option value="STRATEGY_UPDATED">STRATEGY_UPDATED</option>
            <option value="RISK_LIMIT_MODIFIED">RISK_LIMIT_MODIFIED</option>
            <option value="VERIFICATION_EXECUTED">VERIFICATION_EXECUTED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-3 shadow-fintech">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[#242B35] text-[#5F6978] uppercase text-[10px] tracking-wider bg-[#080A0F]/50">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Actor / Principal</th>
                <th className="py-2.5 px-3">Event Signature</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Cryptographic Hash</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2631]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#151B23] transition-colors">
                  <td className="py-3 px-3 text-[#8B95A5]">{log.timestamp}</td>
                  <td className="py-3 px-3 font-bold text-[#F4F7FA]">{log.actor}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 rounded">
                      {log.event}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#F4F7FA] font-medium">{log.entity}</td>
                  <td className="py-3 px-3 text-[#5F6978] text-[11px] font-mono">{log.hash.slice(0, 16)}...</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
