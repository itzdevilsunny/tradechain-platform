import React from 'react';
import { MOCK_SYSTEM_SERVICES } from '../../lib/mockData';
import { Server, Activity, Cpu, ShieldCheck, Zap, Database, Globe } from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11161D] p-5 rounded-xl border border-[#242B35]">
        <div>
          <div className="flex items-center gap-2">
            <Server size={20} className="text-[#3B82F6]" />
            <h2 className="text-lg font-bold text-[#F4F7FA] font-mono tracking-tight">
              System Infrastructure Telemetry
            </h2>
          </div>
          <p className="text-xs text-[#8B95A5] mt-1">
            Real-time status monitoring for high-frequency trading engine microservices.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 font-mono text-xs font-bold text-[#10B981] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
          ALL SYSTEMS OPERATIONAL
        </span>
      </div>

      {/* Infrastructure Telemetry Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <span className="text-xs text-[#8B95A5] block">Network Latency</span>
          <span className="text-xl font-bold text-[#10B981]">24 ms</span>
          <p className="text-[10px] text-[#5F6978]">Sub-second Execution</p>
        </div>

        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <span className="text-xs text-[#8B95A5] block">API Throughput</span>
          <span className="text-xl font-bold text-[#F4F7FA]">1,284 req/min</span>
          <p className="text-[10px] text-[#5F6978]">Zero Dropped Packets</p>
        </div>

        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <span className="text-xs text-[#8B95A5] block">Blockchain Sync</span>
          <span className="text-xl font-bold text-[#10B981]">100% Synced</span>
          <p className="text-[10px] text-[#5F6978]">Consensus Block #4281</p>
        </div>

        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <span className="text-xs text-[#8B95A5] block">Last Block Finalized</span>
          <span className="text-xl font-bold text-[#3B82F6]">12 sec ago</span>
          <p className="text-[10px] text-[#5F6978]">Node-Alpha-01 Validator</p>
        </div>
      </div>

      {/* Services Operational Cards */}
      <div className="p-5 rounded-xl bg-[#11161D] border border-[#242B35] space-y-4 shadow-fintech">
        <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider">
          Microservice Health Vector (6 Services Active)
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {MOCK_SYSTEM_SERVICES.map((srv, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-[#151B23] border border-[#242B35] flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                  <Zap size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F4F7FA]">{srv.name}</span>
                    <span className="px-2 py-0.5 text-[9px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded font-bold">
                      {srv.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B95A5] mt-0.5">{srv.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[#8B95A5] block text-[10px]">Ping Latency</span>
                  <span className="font-bold text-[#10B981]">{srv.latencyMs} ms</span>
                </div>

                <div className="text-right">
                  <span className="text-[#8B95A5] block text-[10px]">90-Day Uptime</span>
                  <span className="font-bold text-[#F4F7FA]">{srv.uptimePct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
