import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface FloatingDraggableAIChatProps {
  onToggleAIAssistant: () => void;
}

export const FloatingDraggableAIChat: React.FC<FloatingDraggableAIChatProps> = ({
  onToggleAIAssistant
}) => {
  // Initial position calculation for bottom-right with boundary padding
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 375;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 667;
    return {
      x: Math.max(16, screenW - 72),
      y: Math.max(16, screenH - 80)
    };
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // Keep button within visible viewport bounds on mobile rotation or screen resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(Math.max(12, prev.x), window.innerWidth - 64),
        y: Math.min(Math.max(12, prev.y), window.innerHeight - 64)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Mouse Drag Handling ---
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

      const newX = Math.min(Math.max(12, initialPosRef.current.x + dx), window.innerWidth - 64);
      const newY = Math.min(Math.max(12, initialPosRef.current.y + dy), window.innerHeight - 64);

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

  // --- Mobile Touch Drag Handling ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    initialPosRef.current = { ...position };

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isDraggingRef.current || moveEvent.touches.length !== 1) return;
      const t = moveEvent.touches[0];
      const dx = t.clientX - dragStartRef.current.x;
      const dy = t.clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true;
        if (moveEvent.cancelable) {
          moveEvent.preventDefault(); // Prevent body scrolling while dragging chatbot on mobile
        }
      }

      const newX = Math.min(Math.max(12, initialPosRef.current.x + dx), window.innerWidth - 64);
      const newY = Math.min(Math.max(12, initialPosRef.current.y + dy), window.innerHeight - 64);

      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  };

  const handleClick = () => {
    if (!hasMovedRef.current) {
      onToggleAIAssistant();
    }
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      className="fixed z-50 cursor-grab active:cursor-grabbing group select-none touch-none"
      title="Drag anywhere on screen • Tap to open TradeChain Quant AI Assistant"
    >
      <button
        type="button"
        className="w-13 h-13 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] border-2 border-white/30 text-white shadow-2xl flex items-center justify-center transition-transform transform hover:scale-105 active:scale-95 shadow-glow-purple relative"
      >
        <Sparkles size={22} className="animate-pulse" />
        
        {/* Pulsing online indicator */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#10B981] border border-white"></span>
        </span>
      </button>

      {/* Floating tooltip label (Desktop hover) */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 rounded-lg bg-[#0D1117] border border-[#242B35] text-[11px] font-mono font-bold text-white whitespace-nowrap shadow-xl pointer-events-none">
        <span>Quant AI Assistant</span>
      </div>
    </div>
  );
};

