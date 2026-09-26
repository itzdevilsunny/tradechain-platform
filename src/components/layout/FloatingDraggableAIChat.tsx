import React, { useState, useRef } from 'react';
import { Sparkles, Bot } from 'lucide-react';

interface FloatingDraggableAIChatProps {
  onToggleAIAssistant: () => void;
}

export const FloatingDraggableAIChat: React.FC<FloatingDraggableAIChatProps> = ({
  onToggleAIAssistant
}) => {
  // Default position: bottom-right
  const [position, setPosition] = useState<{ x: number; y: number }>(() => ({
    x: window.innerWidth - 80,
    y: window.innerHeight - 80
  }));

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { ...position };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.x;
      const dy = moveEvent.clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
      }

      const newX = Math.min(Math.max(10, initialPosRef.current.x + dx), window.innerWidth - 60);
      const newY = Math.min(Math.max(10, initialPosRef.current.y + dy), window.innerHeight - 60);

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only toggle if user didn't drag
    if (!hasMovedRef.current) {
      onToggleAIAssistant();
    }
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className="fixed z-50 cursor-grab active:cursor-grabbing group select-none touch-none"
      title="Drag anywhere • Click to open TradeChain Quant AI Assistant"
    >
      <button
        className="w-13 h-13 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] border-2 border-white/30 text-white shadow-2xl flex items-center justify-center transition-transform transform hover:scale-110 active:scale-95 shadow-glow-purple relative"
      >
        <Sparkles size={24} className="animate-pulse" />
        
        {/* Pulsing indicator ring */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#10B981] border border-white"></span>
        </span>
      </button>

      {/* Floating tooltip label */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 rounded-lg bg-[#0D1117] border border-[#242B35] text-[11px] font-mono font-bold text-white whitespace-nowrap shadow-xl pointer-events-none">
        <span>Quant AI Assistant</span>
      </div>
    </div>
  );
};
