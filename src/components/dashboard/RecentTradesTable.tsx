import React from 'react';
import { TradeRecord } from '../../types/trading';
import { 
  ShieldCheck, 
  ChevronRight, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  Lock
} from 'lucide-react';

interface RecentTradesTableProps {
  trades: TradeRecord[];
  onSelectTrade: (trade: TradeRecord) => void;
  onNavigateToVerify: (tradeId: string) => void;
}

export const RecentTradesTable: React.FC<RecentTradesTableProps> = ({
  trades,
  onSelectTrade,
  onNavigateToVerify
}) => {
  return (
    <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-3 shadow-fintech">
      
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={16} className="text-[#10B981]" />
          <h3 className="font-mono font-bold text-xs text-[#F4F7FA] uppercase tracking-wider">
            Verified Execution Ledger ({trades.length} Recent)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="text-[#10B981] flex items-center gap-1 font-semibold">
            <ShieldCheck size={13} />
            100% Cryptographically Verified
          </span>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-[#242B35] text-[#5F6978] uppercase text-[10px] tracking-wider bg-[#080A0F]/50">
              <th className="py-2.5 px-3">Trade ID</th>
              <th className="py-2.5 px-3">Asset</th>
              <th className="py-2.5 px-3">Strategy Profile</th>
              <th className="py-2.5 px-3">Side</th>
              <th className="py-2.5 px-3">Execution Price</th>
              <th className="py-2.5 px-3">Quantity</th>
              <th className="py-2.5 px-3">Realized P&L</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">On-Chain Audit</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2631]">
            {trades.map(trade => {
              const isProfit = trade.pnl >= 0;
              return (
                <tr
                  key={trade.id}
                  onClick={() => onSelectTrade(trade)}
                  className="hover:bg-[#151B23] transition-colors cursor-pointer group"
                >
                  {/* Trade ID */}
                  <td className="py-3 px-3 font-bold text-[#F4F7FA] flex items-center gap-1.5">
                    <span className="text-[#3B82F6]">{trade.id}</span>
                  </td>

                  {/* Asset */}
                  <td className="py-3 px-3 text-[#F4F7FA] font-semibold">
                    {trade.asset}
                  </td>

                  {/* Strategy */}
                  <td className="py-3 px-3 text-[#8B95A5]">
                    {trade.strategy}
                  </td>

                  {/* Side */}
                  <td className="py-3 px-3">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold
                      ${trade.side === 'BUY' 
                        ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' 
                        : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                      }
                    `}>
                      {trade.side === 'BUY' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {trade.side}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-3 text-[#F4F7FA]">
                    ₹{trade.price.toLocaleString('en-IN')}
                  </td>

                  {/* Qty */}
                  <td className="py-3 px-3 text-[#8B95A5]">
                    {trade.quantity}
                  </td>

                  {/* P&L */}
                  <td className="py-3 px-3 font-bold">
                    <span className={isProfit ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                      {isProfit ? '+' : ''}₹{trade.pnl.toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-3 text-[#5F6978] text-[11px]">
                    {trade.timestamp.split(' ')[1]} UTC
                  </td>

                  {/* Blockchain badge */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded flex items-center gap-1">
                        <ShieldCheck size={11} />
                        VERIFIED
                      </span>
                      <span className="text-[10px] text-[#5F6978]">#{trade.blockNumber}</span>
                    </div>
                  </td>

                  {/* Right chevron */}
                  <td className="py-3 px-3 text-right">
                    <button className="text-[#5F6978] group-hover:text-[#3B82F6] transition-colors p-1">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
