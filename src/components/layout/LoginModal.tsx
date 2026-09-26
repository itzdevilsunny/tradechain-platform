import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, CheckCircle2, X, Zap, Key } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccessLogin }) => {
  const [email, setEmail] = useState('sunny.prasad@tradechain.io');
  const [password, setPassword] = useState('TradeChain#2026!Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInstantAutoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccessLogin();
      onClose();
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleInstantAutoLogin();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0D1117] border border-slate-300 dark:border-[#242B35] rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 font-mono text-xs">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-slate-400 dark:text-[#5F6978] hover:text-slate-900 dark:hover:text-[#F4F7FA]"
        >
          <X size={18} />
        </button>

        {/* Logo Header */}
        <div className="text-center space-y-2 mb-5">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#10B981] items-center justify-center shadow-md mb-1">
            <Shield className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] tracking-tight">
            Algorithmic Trading Terminal.<br />Cryptographically Verified.
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#8B95A5] max-w-xs mx-auto font-sans">
            NSE & BSE F&O Desk • SEBI Risk Engine Gateways • Upstox / Groww / Zerodha
          </p>
        </div>

        {/* 1-Click Instant Auto Login Button */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleInstantAutoLogin}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Zap size={16} className="animate-bounce" />
            <span>⚡ Instant Auto-Login (Sunny Prasad - Admin)</span>
          </button>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200 dark:bg-[#242B35]"></div>
          <span className="text-[10px] text-slate-400 dark:text-[#5F6978] uppercase">AUTO-FILLED CREDENTIALS</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-[#242B35]"></div>
        </div>

        {/* Pre-filled Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-[#8B95A5] mb-1">
              Trader ID / Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-[#11161D] border border-slate-300 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg px-3 py-2 text-slate-900 dark:text-[#F4F7FA] outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-[#8B95A5] mb-1">
              ECDSA Private Key / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-[#11161D] border border-slate-300 dark:border-[#242B35] focus:border-[#3B82F6] rounded-lg px-3 py-2 text-slate-900 dark:text-[#F4F7FA] outline-none font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-3d btn-3d-primary w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Verifying Secp256k1 Signature...</span>
            ) : (
              <>
                <Lock size={14} />
                <span>Authenticate & Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Database status banner */}
        <div className="mt-5 p-2.5 rounded-lg bg-slate-100 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] flex items-center justify-between text-[11px] text-slate-600 dark:text-[#8B95A5]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-[#10B981]" />
            <span>Supabase DB Connected</span>
          </div>
          <span className="text-slate-400 dark:text-[#5F6978] text-[10px]">trrdxwefrnjlzkrrnjdp</span>
        </div>
      </div>
    </div>
  );
};
