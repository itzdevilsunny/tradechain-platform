import React, { useState } from 'react';
import { ActivePosition, TradeRecord } from '../../types/trading';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  PieChart as PieIcon, 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  ShieldAlert, 
  PlusCircle, 
  RefreshCw, 
  Layers, 
  Filter, 
  Search, 
  X, 
  Building2, 
  Coins, 
  CheckCircle2,
  Sliders,
  DollarSign,
  Download,
  AlertTriangle
} from 'lucide-react';

interface PortfolioOverviewProps {
  positions: ActivePosition[];
  trades: TradeRecord[];
  niftyPrice: number;
  onClosePosition: (posId: string) => void;
  onExecuteOrder?: (order: any) => void;
  onNavigateToMarkets?: () => void;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  positions,
  trades,
  niftyPrice,
  onClosePosition,
  onExecuteOrder,
  onNavigateToMarkets
}) => {
  // Cash balance state (customizable via Deposit/Withdraw modal)
  const [cashBalance, setCashBalance] = useState<number>(78500.00);
  const [activeTab, setActiveTab] = useState<'ALLOCATION' | 'PERFORMANCE' | 'SECTORS'>('ALLOCATION');
  const [assetFilter, setAssetFilter] = useState<'ALL' | 'NSE_EQUITY' | 'DERIVATIVES' | 'CRYPTO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Deposit / Withdraw Modal State
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [marginAmount, setMarginAmount] = useState<number>(25000);
  const [marginAction, setMarginAction] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');

  // Compute live portfolio metrics from positions
  const investedCapital = positions.reduce((sum, p) => sum + (p.entryPrice * p.quantity), 0);
  const unrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const currentPositionsMarketValue = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
  const totalPortfolioValue = Math.round((cashBalance + currentPositionsMarketValue) * 100) / 100;
  
  // Cumulative realized P&L from trades
  const realizedPnl = Math.round(trades.reduce((sum, t) => sum + (t.pnl || 0), 0) * 100) / 100 + 16807.92;

  // Margin Exposure Ratio
  const marginExposurePct = Math.min(100, Math.round((investedCapital / Math.max(1, totalPortfolioValue)) * 1000) / 10);
  const marginHealthStatus = marginExposurePct < 60 ? 'HEALTHY' : marginExposurePct < 85 ? 'MODERATE' : 'HIGH RISK';

  // Build dynamic asset allocation dataset
  const positionAllocations = positions.map(p => {
    const val = p.currentPrice * p.quantity;
    let color = '#3B82F6';
    if (p.asset.includes('NIFTY')) color = '#3B82F6';
    else if (p.asset.includes('BANK')) color = '#8B5CF6';
    else if (p.asset.includes('RELIANCE')) color = '#EC4899';
    else if (p.asset.includes('TCS')) color = '#06B6D4';
    else if (p.asset.includes('BTC') || p.asset.includes('ETH')) color = '#F59E0B';
    
    return {
      name: p.asset,
      value: Math.round(val),
      color
    };
  });

  const allocationData = [
    ...positionAllocations,
    { name: 'Unallocated Cash Margin', value: Math.round(cashBalance), color: '#10B981' }
  ];

  // Sector breakdown dataset
  const sectorData = [
    { sector: 'Index Derivatives', value: Math.round(positions.filter(p => p.asset.includes('NIFTY')).reduce((acc, p) => acc + p.currentPrice * p.quantity, 0)), color: '#3B82F6' },
    { sector: 'Banking & Financials', value: Math.round(positions.filter(p => p.asset.includes('BANK') || p.asset.includes('HDFC')).reduce((acc, p) => acc + p.currentPrice * p.quantity, 0)), color: '#8B5CF6' },
    { sector: 'IT & Technology', value: Math.round(positions.filter(p => p.asset.includes('TCS') || p.asset.includes('INFY')).reduce((acc, p) => acc + p.currentPrice * p.quantity, 0)), color: '#06B6D4' },
    { sector: 'Energy & Heavy Ops', value: Math.round(positions.filter(p => p.asset.includes('RELIANCE')).reduce((acc, p) => acc + p.currentPrice * p.quantity, 0)), color: '#EC4899' },
    { sector: 'Crypto Assets', value: Math.round(positions.filter(p => p.asset.includes('BTC') || p.asset.includes('SOL') || p.asset.includes('ETH')).reduce((acc, p) => acc + p.currentPrice * p.quantity, 0)), color: '#F59E0B' },
    { sector: 'Liquid Cash Reserve', value: Math.round(cashBalance), color: '#10B981' }
  ].filter(s => s.value > 0);

  // Capital Growth Trajectory dataset (30-day historical)
  const performanceHistory = Array.from({ length: 30 }).map((_, idx) => {
    const day = idx + 1;
    const dateStr = `${day < 10 ? '0' + day : day} Sep`;
    const sineVal = Math.sin(idx * 0.35) * 8500;
    const growthVal = totalPortfolioValue * (0.82 + (idx / 30) * 0.18) + sineVal;
    return {
      date: dateStr,
      portfolioValue: Math.round(growthVal),
      cashMargin: Math.round(cashBalance * (0.9 + (idx / 60)))
    };
  });

  const handleApplyMarginChange = () => {
    if (marginAction === 'DEPOSIT') {
      setCashBalance(prev => prev + marginAmount);
    } else {
      if (marginAmount > cashBalance) {
        alert('Insufficient unallocated cash balance to withdraw.');
        return;
      }
      setCashBalance(prev => prev - marginAmount);
    }
    setIsMarginModalOpen(false);
  };

  const filteredPositions = positions.filter(p => {
    const matchesSearch = p.asset.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (assetFilter === 'NSE_EQUITY') return matchesSearch && (p.asset.includes('RELIANCE') || p.asset.includes('TCS') || p.asset.includes('HDFC'));
    if (assetFilter === 'DERIVATIVES') return matchesSearch && p.asset.includes('NIFTY');
    if (assetFilter === 'CRYPTO') return matchesSearch && (p.asset.includes('BTC') || p.asset.includes('ETH') || p.asset.includes('SOL'));
    return matchesSearch;
  });

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-[#11161D] p-5 rounded-xl border border-slate-200 dark:border-[#242B35] shadow-sm w-full overflow-hidden">
        <div className="min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-2">
            <PieIcon size={20} className="text-[#3B82F6] shrink-0" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#F4F7FA] font-mono tracking-tight truncate">
              Institutional Asset Allocation & Portfolio Matrix
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded shrink-0">
              REAL-TIME MARGIN SYNCED
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8B95A5] mt-1 font-sans truncate">
            Live capital deployment, cross-margin exposure management & sector concentration analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setMarginAction('DEPOSIT');
              setIsMarginModalOpen(true);
            }}
            className="btn-3d btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-md"
          >
            <PlusCircle size={14} />
            <span>Manage Margin</span>
          </button>

          {onNavigateToMarkets && (
            <button
              onClick={onNavigateToMarkets}
              className="btn-3d btn-3d-secondary px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm"
            >
              <ArrowUpRight size={14} />
              <span>Markets Desk</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono w-full overflow-hidden">
        
        {/* Total Portfolio Value */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Total Portfolio</span>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F4F7FA] truncate">
            {formatCurrency(totalPortfolioValue)}
          </div>
          <span className="text-[10px] text-[#10B981] font-bold block truncate">
            Equity + Cash Margin
          </span>
        </div>

        {/* Available Cash Margin */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Available Cash</span>
          <div className="text-base sm:text-lg font-bold text-[#10B981] truncate">
            {formatCurrency(cashBalance)}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5] block truncate">
            {((cashBalance / totalPortfolioValue) * 100).toFixed(1)}% Liquid Reserve
          </span>
        </div>

        {/* Invested Capital */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Invested Capital</span>
          <div className="text-base sm:text-lg font-bold text-[#3B82F6] truncate">
            {formatCurrency(investedCapital)}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5] block truncate">
            {positions.length} Active Positions
          </span>
        </div>

        {/* Unrealized P&L */}
        <div className={`p-4 rounded-xl bg-white dark:bg-[#11161D] border space-y-1 shadow-sm overflow-hidden ${
          unrealizedPnl >= 0 ? 'border-[#10B981]/40' : 'border-[#EF4444]/40'
        }`}>
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Unrealized P&L</span>
          <div className={`text-base sm:text-lg font-bold truncate ${unrealizedPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(unrealizedPnl)}
          </div>
          <span className={`text-[10px] font-bold block truncate ${unrealizedPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {investedCapital > 0 ? `${((unrealizedPnl / investedCapital) * 100).toFixed(2)}% Return` : '0.00%'}
          </span>
        </div>

        {/* Realized P&L */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Realized P&L</span>
          <div className={`text-base sm:text-lg font-bold truncate ${realizedPnl >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {realizedPnl >= 0 ? '+' : ''}{formatCurrency(realizedPnl)}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#8B95A5] block truncate">Cumulative Booked</span>
        </div>

        {/* Exposure & Margin Health */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-1 shadow-sm overflow-hidden">
          <span className="text-xs text-slate-500 dark:text-[#8B95A5] block truncate">Margin Utilization</span>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F4F7FA] truncate">
            {marginExposurePct}%
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${
              marginHealthStatus === 'HEALTHY' ? 'bg-[#10B981]' : marginHealthStatus === 'MODERATE' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
            }`}></span>
            <span className="text-[10px] text-slate-400 dark:text-[#8B95A5] font-bold uppercase truncate">{marginHealthStatus}</span>
          </div>
        </div>

      </div>

      {/* Main Analytics Tabs & Donut Allocation Chart Workspace */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm w-full overflow-hidden">
        
        {/* Tab Header Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#3B82F6]" />
            <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider">
              {activeTab === 'ALLOCATION' && 'Asset Distribution & Capital Breakdown'}
              {activeTab === 'PERFORMANCE' && 'Cumulative Portfolio Growth Trajectory'}
              {activeTab === 'SECTORS' && 'Sector Concentration Spectrum'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#080A0F] p-1 rounded-lg border border-slate-200 dark:border-[#242B35]">
            <button
              onClick={() => setActiveTab('ALLOCATION')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'ALLOCATION'
                  ? 'bg-white dark:bg-[#1E2631] text-[#3B82F6] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Asset Allocation
            </button>
            <button
              onClick={() => setActiveTab('PERFORMANCE')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'PERFORMANCE'
                  ? 'bg-white dark:bg-[#1E2631] text-[#10B981] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Growth Curve
            </button>
            <button
              onClick={() => setActiveTab('SECTORS')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                activeTab === 'SECTORS'
                  ? 'bg-white dark:bg-[#1E2631] text-[#8B5CF6] shadow-sm'
                  : 'text-slate-500 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-[#F4F7FA]'
              }`}
            >
              Sectors
            </button>
          </div>
        </div>

        {/* Tab 1: Asset Allocation Donut Chart & Legend Grid */}
        {activeTab === 'ALLOCATION' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-72 w-full bg-slate-50 dark:bg-[#080A0F] rounded-xl p-3 border border-slate-200 dark:border-[#1E2631] flex items-center justify-center relative overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#080A0F" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0D1117', 
                      borderColor: '#242B35', 
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono',
                      color: '#F4F7FA',
                      borderRadius: '8px'
                    }} 
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Capital Value']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-mono block">PORTFOLIO</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-[#F4F7FA]">
                  {formatCurrency(totalPortfolioValue)}
                </span>
              </div>
            </div>

            {/* Allocation Legend List */}
            <div className="space-y-2.5 font-mono text-xs flex flex-col justify-center">
              {allocationData.map(item => {
                const pct = ((item.value / totalPortfolioValue) * 100).toFixed(1);
                return (
                  <div key={item.name} className="p-3 rounded-xl bg-slate-50 dark:bg-[#151B23] border border-slate-200 dark:border-[#242B35] flex items-center justify-between transition-all hover:border-[#3B82F6]/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="font-bold text-slate-900 dark:text-[#F4F7FA] truncate">{item.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 dark:text-[#F4F7FA] block">₹{item.value.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500 dark:text-[#8B95A5] font-bold">
                        {pct}% Weight
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Historical Growth Area Chart */}
        {activeTab === 'PERFORMANCE' && (
          <div className="h-72 w-full bg-slate-50 dark:bg-[#080A0F] rounded-xl p-3 border border-slate-200 dark:border-[#1E2631] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceHistory} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis 
                  stroke="#64748B" 
                  width={85}
                  tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                  domain={['auto', 'auto']} 
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0D1117', 
                    borderColor: '#242B35', 
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: '#F4F7FA',
                    borderRadius: '8px'
                  }} 
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Total Capital']}
                />
                <Area type="monotone" dataKey="portfolioValue" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#portfolioGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 3: Sector Concentration Spectrum */}
        {activeTab === 'SECTORS' && (
          <div className="h-72 w-full bg-slate-50 dark:bg-[#080A0F] rounded-xl p-3 border border-slate-200 dark:border-[#1E2631] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{ top: 15, right: 15, left: 10, bottom: 0 }}>
                <XAxis dataKey="sector" stroke="#64748B" tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis 
                  stroke="#64748B" 
                  width={80}
                  tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0D1117', 
                    borderColor: '#242B35', 
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: '#F4F7FA',
                    borderRadius: '8px'
                  }} 
                  formatter={(val: any) => [formatCurrency(Number(val)), 'Sector Value']}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>

      {/* Active Portfolio Positions & Margin Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] space-y-4 shadow-sm font-mono w-full overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-xs text-slate-900 dark:text-[#F4F7FA] uppercase tracking-wider flex items-center gap-2">
            <Coins size={16} className="text-[#10B981]" />
            <span>Active Position Margin Matrix ({filteredPositions.length} Open Positions)</span>
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter asset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] text-slate-900 dark:text-[#F4F7FA] outline-none w-36 focus:w-48 transition-all"
              />
            </div>

            {/* Asset Class Filter Pills */}
            <div className="flex items-center gap-1">
              {(['ALL', 'NSE_EQUITY', 'DERIVATIVES', 'CRYPTO'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setAssetFilter(f)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    assetFilter === f 
                      ? 'bg-[#2563EB] text-white shadow-sm' 
                      : 'bg-slate-100 dark:bg-[#161D2A] text-slate-500 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#1E2631]'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Holdings Table */}
        <div className="w-full overflow-x-auto border border-slate-100 dark:border-[#1E2631] rounded-lg">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#242B35] bg-slate-50 dark:bg-[#080A0F] text-[10px] text-slate-500 dark:text-[#8B95A5] uppercase">
                <th className="py-2.5 px-3.5">Position ID</th>
                <th className="py-2.5 px-3.5">Asset Pair</th>
                <th className="py-2.5 px-3.5">Side</th>
                <th className="py-2.5 px-3.5">Entry Price</th>
                <th className="py-2.5 px-3.5">Live Price</th>
                <th className="py-2.5 px-3.5">Qty / Size</th>
                <th className="py-2.5 px-3.5">Market Value</th>
                <th className="py-2.5 px-3.5">Unrealized P&L</th>
                <th className="py-2.5 px-3.5">SL / TP</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E2633]">
              {filteredPositions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                    No active positions matching current filter.
                  </td>
                </tr>
              ) : (
                filteredPositions.map((pos) => {
                  const isProfit = pos.unrealizedPnl >= 0;
                  const mktVal = pos.currentPrice * pos.quantity;
                  return (
                    <tr key={pos.id} className="hover:bg-slate-50 dark:hover:bg-[#161D2A] transition-colors whitespace-nowrap">
                      <td className="py-2.5 px-3.5 font-bold text-[#3B82F6]">{pos.id}</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-[#F1F5F9]">{pos.asset}</td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pos.side === 'BUY' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                        }`}>
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-900 dark:text-[#F1F5F9]">₹{pos.entryPrice.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3.5 text-slate-900 dark:text-[#F1F5F9] font-bold">₹{pos.currentPrice.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3.5 text-slate-500 dark:text-[#94A3B8]">{pos.quantity}</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-[#F1F5F9]">₹{mktVal.toLocaleString('en-IN')}</td>
                      <td className={`py-2.5 px-3.5 font-bold ${isProfit ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        {isProfit ? '+' : ''}₹{pos.unrealizedPnl.toLocaleString('en-IN')} ({pos.unrealizedPnlPercent}%)
                      </td>
                      <td className="py-2.5 px-3.5 text-[10px] text-slate-400">
                        ₹{pos.stopLoss} / ₹{pos.takeProfit}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={() => onClosePosition(pos.id)}
                          className="px-2.5 py-1 rounded bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444] hover:text-white font-bold text-[10px] transition-all"
                        >
                          Close Position
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Margin Deposit / Withdraw Modal */}
      {isMarginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#11161D] border border-slate-200 dark:border-[#242B35] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#242B35] pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="text-[#3B82F6]" size={18} />
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#F4F7FA]">
                  Manage Portfolio Margin Capital
                </h3>
              </div>
              <button 
                onClick={() => setIsMarginModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-[#F4F7FA]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Action Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMarginAction('DEPOSIT')}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      marginAction === 'DEPOSIT' 
                        ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]' 
                        : 'bg-slate-50 dark:bg-[#080A0F] text-slate-500 border-slate-200 dark:border-[#242B35]'
                    }`}
                  >
                    + Deposit Cash Margin
                  </button>
                  <button
                    onClick={() => setMarginAction('WITHDRAW')}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      marginAction === 'WITHDRAW' 
                        ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]' 
                        : 'bg-slate-50 dark:bg-[#080A0F] text-slate-500 border-slate-200 dark:border-[#242B35]'
                    }`}
                  >
                    - Withdraw Capital
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-500 dark:text-[#8B95A5] block mb-1">Amount (INR)</label>
                <input
                  type="number"
                  step="5000"
                  value={marginAmount}
                  onChange={(e) => setMarginAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] font-bold text-slate-900 dark:text-[#F4F7FA] outline-none"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#080A0F] border border-slate-200 dark:border-[#242B35] space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Current Cash Reserve:</span>
                  <span className="font-bold text-[#10B981]">₹{cashBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Post-Action Cash:</span>
                  <span className="font-bold text-[#3B82F6]">
                    ₹{(marginAction === 'DEPOSIT' ? cashBalance + marginAmount : cashBalance - marginAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsMarginModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-[#F4F7FA] text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyMarginChange}
                className="btn-3d btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Confirm Transaction
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
