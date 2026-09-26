import React from 'react';
import { NavPage } from '../../types/trading';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Bot, 
  Layers, 
  Activity, 
  PieChart, 
  ShieldCheck, 
  Blocks, 
  Receipt, 
  Box, 
  CheckCircle2, 
  BarChart3, 
  Server, 
  FileText, 
  Settings, 
  ChevronRight,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activePage: NavPage;
  onSelectPage: (page: NavPage) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  isOpen,
  onCloseMobile
}) => {
  const mainNavItems: Array<{ id: NavPage; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
    { id: 'markets', label: 'Markets', icon: <TrendingUp size={16} /> },
    { id: 'bot', label: 'Trading Bot', icon: <Bot size={16} />, badge: 'LIVE' },
    { id: 'strategies', label: 'Strategies', icon: <Layers size={16} /> },
    { id: 'backtesting', label: 'Backtesting', icon: <Activity size={16} /> },
    { id: 'portfolio', label: 'Portfolio', icon: <PieChart size={16} /> },
    { id: 'risk', label: 'Risk Management', icon: <ShieldCheck size={16} /> },
  ];

  const blockchainNavItems: Array<{ id: NavPage; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'blockchain', label: 'Blockchain Ledger', icon: <Blocks size={16} /> },
    { id: 'transactions', label: 'Transactions', icon: <Receipt size={16} /> },
    { id: 'blocks', label: 'Blocks', icon: <Box size={16} /> },
    { id: 'verify', label: 'Audit & Verify', icon: <CheckCircle2 size={16} />, badge: 'PROOF' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
  ];

  const systemNavItems: Array<{ id: NavPage; label: string; icon: React.ReactNode }> = [
    { id: 'monitoring', label: 'System Health', icon: <Server size={16} /> },
    { id: 'audit', label: 'Audit Log', icon: <FileText size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  const handleNavClick = (page: NavPage) => {
    onSelectPage(page);
    onCloseMobile();
  };

  return (
    <aside className={`
      fixed lg:static top-0 left-0 z-40 h-screen w-64 
      bg-white dark:bg-[#0B0E14] border-r border-slate-200 dark:border-[#1E2633]
      flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-lg
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Top Header Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-[#1E2633] flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavClick('overview')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#10B981] flex items-center justify-center shadow-md">
            <Shield className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight font-mono text-slate-900 dark:text-[#F1F5F9]">TRADECHAIN</span>
              <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-wider uppercase bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">PRO</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-[#64748B] tracking-wide font-mono">Institutional v2.4</p>
          </div>
        </div>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Main Workspace Group */}
        <div>
          <h3 className="px-2 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-[#475569] mb-1.5">
            Main Workspace
          </h3>
          <nav className="space-y-1">
            {mainNavItems.map(item => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-mono transition-all duration-150
                    ${isActive 
                      ? 'bg-[#2563EB] text-white font-bold shadow-sm' 
                      : 'text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#161D2A] hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-[#64748B]'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${isActive ? 'bg-white/20 text-white' : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Blockchain Audit Group */}
        <div>
          <h3 className="px-2 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-[#475569] mb-1.5">
            Blockchain Audit
          </h3>
          <nav className="space-y-1">
            {blockchainNavItems.map(item => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-mono transition-all duration-150
                    ${isActive 
                      ? 'bg-[#2563EB] text-white font-bold shadow-sm' 
                      : 'text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#161D2A] hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-[#64748B]'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${isActive ? 'bg-white/20 text-white' : 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Infrastructure Group */}
        <div>
          <h3 className="px-2 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-[#475569] mb-1.5">
            System & Logs
          </h3>
          <nav className="space-y-1">
            {systemNavItems.map(item => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-mono transition-all duration-150
                    ${isActive 
                      ? 'bg-[#2563EB] text-white font-bold shadow-sm' 
                      : 'text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#161D2A] hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-[#64748B]'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Area: System Status & User Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1E2633] space-y-2.5 bg-slate-100 dark:bg-[#080A0F]/60">
        {/* System Health Widget */}
        <div 
          onClick={() => handleNavClick('monitoring')}
          className="p-2 rounded-lg bg-white dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] flex items-center justify-between cursor-pointer hover:border-[#3B82F6] transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className="text-[11px] font-mono text-slate-800 dark:text-[#F1F5F9] font-bold">All Systems Operational</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-[#64748B] font-bold">24ms</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm">
              SP
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9] leading-none">Sunny Prasad</p>
              <p className="text-[10px] text-slate-500 dark:text-[#64748B] mt-0.5 font-mono">Admin / Developer</p>
            </div>
          </div>
          <button 
            onClick={() => handleNavClick('settings')}
            className="p-1 rounded text-slate-400 dark:text-[#64748B] hover:text-slate-900 dark:hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
