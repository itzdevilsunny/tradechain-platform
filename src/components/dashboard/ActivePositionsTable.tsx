import React, { useState } from 'react';
import { ActivePosition } from '../../types/trading';
import { 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  XCircle, 
  Layers,
  Check,
  X
} from 'lucide-react';

interface ActivePositionsTableProps {
  positions: ActivePosition[];
  onSelectPosition: (posId: string) => void;
  onClosePosition: (posId: string) => void;
}

export const ActivePositionsTable: React.FC<ActivePositionsTableProps> = ({
  positions,
  onSelectPosition,
  onClosePosition
}) => {
  const [editingPos, setEditingPos] = useState<ActivePosition | null>(null);
  const [newSL, setNewSL] = useState<number>(0);
  const [newTP, setNewTP] = useState<number>(0);

  const handleOpenEdit = (pos: ActivePosition) => {
    setEditingPos(pos);
    setNewSL(pos.stopLoss);
    setNewTP(pos.takeProfit);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPos) {
      editingPos.stopLoss = newSL;
      editingPos.takeProfit = newTP;
      alert(`Updated SL (₹${newSL.toLocaleString('en-IN')}) and TP (₹${newTP.toLocaleString('en-IN')}) for ${editingPos.asset}`);
      setEditingPos(null);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#11161D] dark:bg-[#11161D] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 space-y-3 shadow-xl">
      
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[#3B82F6]" />
          <h3 className="font-mono font-bold text-xs text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900 uppercase tracking-wider">
            Active Margin Positions ({positions.length})
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-[#8B95A5] dark:text-[#8B95A5] light:text-slate-600">
            Exposure: <strong className="text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900">42.0%</strong>
          </span>
          <button 
            onClick={() => alert('Rebalancing portfolio: Risk weights re-aligned across 2 active pairs.')}
            className="btn-3d btn-3d-secondary px-2.5 py-1 rounded-lg text-xs font-bold text-[#3B82F6]"
          >
            Rebalance All
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-[#242B35] dark:border-[#242B35] light:border-slate-200 text-[#5F6978] dark:text-[#5F6978] light:text-slate-500 uppercase text-[10px] tracking-wider bg-[#080A0F]/50 dark:bg-[#080A0F]/50 light:bg-slate-50">
              <th className="py-2.5 px-3">Asset Pair</th>
              <th className="py-2.5 px-3">Side</th>
              <th className="py-2.5 px-3">Entry Price</th>
              <th className="py-2.5 px-3">Mark Price</th>
              <th className="py-2.5 px-3">Position Size</th>
              <th className="py-2.5 px-3">Unrealized P&L</th>
              <th className="py-2.5 px-3">Stop Loss</th>
              <th className="py-2.5 px-3">Take Profit</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2631] dark:divide-[#1E2631] light:divide-slate-200">
            {positions.map(pos => {
              const isProfit = pos.unrealizedPnl >= 0;
              return (
                <tr 
                  key={pos.id}
                  className="hover:bg-[#151B23] dark:hover:bg-[#151B23] light:hover:bg-slate-100 transition-colors group cursor-pointer"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 font-bold text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900">
                      <span>{pos.asset}</span>
                      {pos.leverage && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 rounded">
                          {pos.leverage}x
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#5F6978]">{pos.openedAt}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold
                      ${pos.side === 'BUY' 
                        ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' 
                        : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                      }
                    `}>
                      {pos.side === 'BUY' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {pos.side}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900">
                    ₹{pos.entryPrice.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 font-semibold text-[#F4F7FA] dark:text-[#F4F7FA] light:text-slate-900">
                    ₹{pos.currentPrice.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 text-[#8B95A5] dark:text-[#8B95A5] light:text-slate-600">
                    <div>{pos.quantity} {pos.asset.split('/')[0]}</div>
                    <div className="text-[10px] text-[#5F6978]">₹{pos.totalValue.toLocaleString('en-IN')}</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className={`font-bold ${isProfit ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {isProfit ? '+' : ''}₹{pos.unrealizedPnl.toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[10px] font-semibold ${isProfit ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      ({isProfit ? '+' : ''}{pos.unrealizedPnlPercent}%)
                    </div>
                  </td>

                  <td className="py-3 px-3 text-[#EF4444] font-bold">
                    ₹{pos.stopLoss.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 text-[#10B981] font-bold">
                    ₹{pos.takeProfit.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(pos);
                        }}
                        className="btn-3d btn-3d-secondary px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 text-[#3B82F6]"
                      >
                        <Sliders size={12} />
                        <span>Adjust</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClosePosition(pos.id);
                        }}
                        className="btn-3d btn-3d-danger px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 text-white"
                      >
                        <XCircle size={12} />
                        <span>Close</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Adjust TP/SL Modal */}
      {editingPos && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0D1117] dark:bg-[#0D1117] light:bg-white border border-[#242B35] dark:border-[#242B35] light:border-slate-300 rounded-2xl shadow-2xl p-5 font-mono text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#242B35] pb-3 mb-4">
              <span className="font-bold text-[#F4F7FA] text-sm">Adjust TP / SL — {editingPos.asset}</span>
              <button onClick={() => setEditingPos(null)} className="p-1 rounded text-[#8B95A5] hover:text-[#F4F7FA]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-[#8B95A5] block mb-1">Stop Loss Price (INR)</label>
                <input
                  type="number"
                  value={newSL}
                  onChange={(e) => setNewSL(Number(e.target.value))}
                  className="w-full bg-[#080A0F] border border-[#242B35] rounded-lg p-2.5 text-[#EF4444] font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[#8B95A5] block mb-1">Take Profit Price (INR)</label>
                <input
                  type="number"
                  value={newTP}
                  onChange={(e) => setNewTP(Number(e.target.value))}
                  className="w-full bg-[#080A0F] border border-[#242B35] rounded-lg p-2.5 text-[#10B981] font-bold outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="btn-3d btn-3d-primary w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <Check size={16} />
                  <span>Update Order Limits</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
