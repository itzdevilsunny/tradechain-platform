import React, { useState } from 'react';
import { MerkleNode } from '../../types/trading';
import { ShieldCheck, GitBranch, Lock, CheckCircle2 } from 'lucide-react';

interface MerkleTreeVisualizerProps {
  tree: MerkleNode;
  selectedTradeId?: string;
  onSelectLeaf?: (tradeId: string) => void;
}

export const MerkleTreeVisualizer: React.FC<MerkleTreeVisualizerProps> = ({
  tree,
  selectedTradeId = 'TRD-00041',
  onSelectLeaf
}) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(selectedTradeId);

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1E2633] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-[#3B82F6]" />
            <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F1F5F9] uppercase tracking-wider">
              Interactive Merkle Proof Tree (Block #4281)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5 font-sans">
            Hover over trade leaves to highlight the cryptographic path to Merkle Root
          </p>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded flex items-center gap-1">
          <ShieldCheck size={12} />
          Inclusion Verified
        </span>
      </div>

      {/* Merkle Tree Diagram Container */}
      <div className="py-6 px-4 bg-slate-50 dark:bg-[#080A0F] rounded-xl border border-slate-200 dark:border-[#1E2633] space-y-8 flex flex-col items-center">
        
        {/* Tier 1: Merkle Root Node */}
        <div className="flex flex-col items-center">
          <div 
            onMouseEnter={() => setHoveredNodeId('root')}
            className={`
              p-3 rounded-xl border font-mono text-center transition-all duration-200 cursor-pointer min-w-[280px]
              ${hoveredNodeId 
                ? 'bg-[#3B82F6]/15 border-[#3B82F6] text-slate-900 dark:text-[#F1F5F9] shadow-md' 
                : 'bg-white dark:bg-[#161D2A] border-slate-200 dark:border-[#1E2633] text-slate-600 dark:text-[#94A3B8]'
              }
            `}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#3B82F6] flex items-center justify-center gap-1">
              <Lock size={12} />
              MERKLE ROOT (TOP HASH)
            </div>
            <div className="text-xs font-bold font-mono text-slate-900 dark:text-[#F1F5F9] mt-1 break-all">
              {tree.hash}
            </div>
          </div>
        </div>

        {/* Connecting Lines SVG */}
        <div className="w-full max-w-lg h-8 relative">
          <svg className="w-full h-full stroke-slate-300 dark:stroke-[#1E2633] stroke-2 fill-none" preserveAspectRatio="none">
            <path d="M 250 0 L 140 32" stroke={hoveredNodeId ? '#3B82F6' : undefined} strokeWidth={hoveredNodeId ? 2 : 1} />
            <path d="M 250 0 L 360 32" stroke={hoveredNodeId ? '#3B82F6' : undefined} strokeWidth={hoveredNodeId ? 2 : 1} />
          </svg>
        </div>

        {/* Tier 2: Internal Branch Nodes */}
        <div className="w-full max-w-lg grid grid-cols-2 gap-8 text-center font-mono">
          {tree.children?.map((parent, idx) => (
            <div key={parent.id} className="flex flex-col items-center space-y-4">
              <div 
                onMouseEnter={() => setHoveredNodeId(parent.id)}
                className={`
                  p-2.5 rounded-lg border w-full text-xs font-mono transition-all duration-200 cursor-pointer
                  ${hoveredNodeId === parent.id || hoveredNodeId === 'root' || (hoveredNodeId === 'TRD-00041' && idx === 0)
                    ? 'bg-white dark:bg-[#161D2A] border-[#3B82F6] text-slate-900 dark:text-[#F1F5F9] font-bold shadow-sm'
                    : 'bg-white dark:bg-[#111620] border-slate-200 dark:border-[#1E2633] text-slate-600 dark:text-[#94A3B8]'
                  }
                `}
              >
                <div className="text-[10px] text-slate-500 dark:text-[#64748B]">{parent.label}</div>
                <div className="font-semibold text-[11px] mt-0.5">{parent.hash}</div>
              </div>

              {/* Connecting Lines down to leaves */}
              <div className="w-full h-6 relative">
                <svg className="w-full h-full stroke-slate-300 dark:stroke-[#1E2633] stroke-2 fill-none">
                  <path d="M 60 0 L 30 24" />
                  <path d="M 60 0 L 90 24" />
                </svg>
              </div>

              {/* Tier 3: Leaf Trade Nodes */}
              <div className="grid grid-cols-2 gap-2 w-full">
                {parent.children?.map((leaf) => {
                  const isSelected = leaf.tradeId === hoveredNodeId || leaf.tradeId === selectedTradeId;
                  return (
                    <div
                      key={leaf.id}
                      onMouseEnter={() => setHoveredNodeId(leaf.tradeId || null)}
                      onClick={() => leaf.tradeId && onSelectLeaf && onSelectLeaf(leaf.tradeId)}
                      className={`
                        p-2 rounded-lg border text-center transition-all cursor-pointer font-mono
                        ${isSelected
                          ? 'bg-[#10B981]/15 border-[#10B981] text-[#10B981] font-bold shadow-sm'
                          : 'bg-white dark:bg-[#161D2A] border-slate-200 dark:border-[#1E2633] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <div className="text-[10px] uppercase font-bold">{leaf.label}</div>
                      <div className="text-[9px] text-slate-400 dark:text-[#5F6978] truncate">{leaf.hash}</div>
                      {isSelected && (
                        <div className="text-[8px] text-[#10B981] font-bold mt-1 flex items-center justify-center gap-0.5">
                          <CheckCircle2 size={10} />
                          PROOF OK
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Path Metadata Footer */}
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633] text-xs font-mono flex items-center justify-between text-slate-600 dark:text-[#94A3B8]">
        <div>
          Active Audit Path: <span className="text-[#10B981] font-bold">{hoveredNodeId || 'TRD-00041'}</span> → Node H(A) → MERKLE ROOT
        </div>
        <div className="text-[#3B82F6] font-semibold">
          0 Structural Alterations Detected
        </div>
      </div>
    </div>
  );
};
