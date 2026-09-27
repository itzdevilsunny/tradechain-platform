import React, { useState, useEffect } from 'react';
import { CandlestickData } from '../../types/trading';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Layers, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart2, 
  RefreshCw,
  CheckCircle2,
  Sliders,
  DollarSign,
  Radio,
  Cpu
} from 'lucide-react';

interface MarketsTerminalProps {
  candles: CandlestickData[];
  niftyPrice: number;
  niftyChange: number;
  selectedPair: string;
  onSelectPair: (pair: string) => void;
  onOpenVerifyPage?: (tradeId: string) => void;
}

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  high: number;
  low: number;
  volume: string;
  oi: string;
  pcr: number;
  category: 'F&O' | 'EQUITY' | 'CRYPTO';
}

interface OrderBookRow {
  price: number;
  qty: number;
  total: number;
}

interface TimeAndSalesRow {
  time: string;
  price: number;
  qty: number;
  side: 'BUY' | 'SELL';
  broker: string;
  hash: string;
}

export const MarketsTerminal: React.FC<MarketsTerminalProps> = ({
  candles,
  niftyPrice,
  niftyChange,
  selectedPair,
  onSelectPair,
  onOpenVerifyPage
}) => {
  // Watchlist state
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { symbol: 'NIFTY 50 Futures', name: 'NIFTY 26OCT FUT', price: 24850.40, change: 0.64, high: 24920.00, low: 24780.50, volume: '4.2M', oi: '1.2M', pcr: 1.15, category: 'F&O' },
    { symbol: 'BANK NIFTY Futures', name: 'BANKNIFTY 26OCT FUT', price: 53420.15, change: 1.12, high: 53600.00, low: 53100.00, volume: '2.8M', oi: '890K', pcr: 1.28, category: 'F&O' },
    { symbol: 'RELIANCE IND', name: 'Reliance Industries Ltd', price: 3042.80, change: 0.85, high: 3065.00, low: 3020.00, volume: '8.5M', oi: '3.4M', pcr: 0.98, category: 'EQUITY' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4290.50, change: -0.32, high: 4320.00, low: 4270.00, volume: '3.1M', oi: '1.1M', pcr: 0.82, category: 'EQUITY' },
    { symbol: 'HDFC BANK', name: 'HDFC Bank Ltd', price: 1675.20, change: 1.45, high: 1688.00, low: 1650.00, volume: '12.4M', oi: '5.2M', pcr: 1.42, category: 'EQUITY' },
    { symbol: 'BTC / INR', name: 'Bitcoin / Indian Rupee', price: 5785400.00, change: 2.85, high: 5850000.00, low: 5620000.00, volume: '₹140Cr', oi: 'N/A', pcr: 1.05, category: 'CRYPTO' }
  ]);

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'F&O' | 'EQUITY' | 'CRYPTO'>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '1d'>('15m');
  const [chartType, setChartType] = useState<'candle' | 'area'>('candle');

  // Order Ticket Form State
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'SL-M'>('MARKET');
  const [orderQty, setOrderQty] = useState(25); // 1 NIFTY lot default
  const [orderLimitPrice, setOrderLimitPrice] = useState(niftyPrice);
  const [selectedBroker, setSelectedBroker] = useState<'Upstox Pro' | 'Groww API' | 'Zerodha Kite'>('Upstox Pro');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Live Time & Sales tape stream
  const [tapeStream, setTapeStream] = useState<TimeAndSalesRow[]>([
    { time: '08:41:02', price: 24850.40, qty: 50, side: 'BUY', broker: 'Upstox', hash: '0x8f2a...391e' },
    { time: '08:40:58', price: 24850.00, qty: 25, side: 'BUY', broker: 'Groww', hash: '0x4c1d...92ab' },
    { time: '08:40:45', price: 24849.50, qty: 100, side: 'SELL', broker: 'Zerodha', hash: '0x1e99...87cc' },
    { time: '08:40:30', price: 24851.10, qty: 75, side: 'BUY', broker: 'Upstox', hash: '0x6b77...04df' }
  ]);

  // Keep live tick updates synchronized
  useEffect(() => {
    setWatchlist(prev => prev.map(item => {
      if (item.symbol === 'NIFTY 50 Futures') {
        return { ...item, price: niftyPrice, change: niftyChange };
      }
      return item;
    }));
  }, [niftyPrice, niftyChange]);

  // Add random live ticks to Time & Sales
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
      const side: 'BUY' | 'SELL' = Math.random() > 0.45 ? 'BUY' : 'SELL';
      const delta = (Math.random() - 0.48) * 4;
      const price = Math.round((niftyPrice + delta) * 100) / 100;
      const qty = [25, 50, 75, 100, 150][Math.floor(Math.random() * 5)];
      const brokers = ['Upstox', 'Groww', 'Zerodha'];
      const broker = brokers[Math.floor(Math.random() * brokers.length)];
      const hash = `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`;

      setTapeStream(prev => [{ time: timeStr, price, qty, side, broker, hash }, ...prev.slice(0, 11)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [niftyPrice]);

  const activeWatchItem = watchlist.find(w => w.symbol === selectedPair) || watchlist[0];

  // Derived order book level 2 (5-level bid/ask depth)
  const bids: OrderBookRow[] = [
    { price: activeWatchItem.price - 0.25, qty: 350, total: 350 },
    { price: activeWatchItem.price - 0.75, qty: 820, total: 1170 },
    { price: activeWatchItem.price - 1.25, qty: 1450, total: 2620 },
    { price: activeWatchItem.price - 1.75, qty: 2100, total: 4720 },
    { price: activeWatchItem.price - 2.50, qty: 3800, total: 8520 }
  ];

  const asks: OrderBookRow[] = [
    { price: activeWatchItem.price + 0.25, qty: 420, total: 420 },
    { price: activeWatchItem.price + 0.75, qty: 650, total: 1070 },
    { price: activeWatchItem.price + 1.25, qty: 1200, total: 2270 },
    { price: activeWatchItem.price + 1.75, qty: 1850, total: 4120 },
    { price: activeWatchItem.price + 2.50, qty: 2900, total: 7020 }
  ];

  const filteredWatchlist = watchlist.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          item.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
    setOrderSuccessMsg(`Order Executed! ${orderSide} ${orderQty} Qty ${selectedPair} @ ₹${activeWatchItem.price.toLocaleString('en-IN')}. Hash: ${hash.substring(0, 14)}...`);
    setTimeout(() => setOrderSuccessMsg(null), 6000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Market Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#0B0E14] p-5 rounded-xl border border-slate-200 dark:border-[#1E2633] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white shadow-md">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-slate-900 dark:text-[#F1F5F9]">
                Live Markets & Level-2 Order Depth Terminal
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 rounded">
                NSE / BSE FIX API ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5 font-sans">
              Institutional order flow telemetry, depth visualization, and 1-click broker execution.
            </p>
          </div>
        </div>

        {/* Live Market Indicators Summary */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
            <span className="text-slate-500 dark:text-[#64748B] text-[10px] block">INDIA VIX</span>
            <span className="font-bold text-[#10B981]">12.84 (-1.8%)</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
            <span className="text-slate-500 dark:text-[#64748B] text-[10px] block">NIFTY PCR</span>
            <span className="font-bold text-[#3B82F6]">1.15 (Bullish)</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633]">
            <span className="text-slate-500 dark:text-[#64748B] text-[10px] block">SEBI Peak Margin</span>
            <span className="font-bold text-[#10B981]">100% OK</span>
          </div>
        </div>
      </div>

      {/* Main Terminal 3-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Watchlist & Search (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl p-4 flex flex-col h-[750px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E2633]">
            <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
              <Layers size={16} className="text-[#3B82F6]" />
              <span>Watchlist</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-[#161D2A] text-slate-600 dark:text-[#94A3B8] rounded border border-slate-200 dark:border-[#1E2633]">
              {filteredWatchlist.length} Assets
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative my-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search symbol, NIFTY..."
              className="w-full bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] focus:border-[#3B82F6] rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-900 dark:text-[#F1F5F9] outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-[#111620] rounded-lg mb-3 text-[10px] font-mono font-bold">
            {(['ALL', 'F&O', 'EQUITY', 'CRYPTO'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1 rounded text-center transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-[#2563EB] text-white shadow-xs' 
                    : 'text-slate-600 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Watchlist Scrollable Items */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredWatchlist.map(item => {
              const isSelected = item.symbol === selectedPair;
              return (
                <div
                  key={item.symbol}
                  onClick={() => onSelectPair(item.symbol)}
                  className={`
                    p-3 rounded-lg border transition-all cursor-pointer font-mono
                    ${isSelected 
                      ? 'bg-[#2563EB]/10 border-[#2563EB] shadow-xs' 
                      : 'bg-slate-50 dark:bg-[#111620] border-slate-200 dark:border-[#1E2633] hover:border-slate-400 dark:hover:border-[#334155]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-[#F1F5F9]">{item.symbol}</span>
                    <span className={`text-[11px] font-bold ${item.change >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-slate-500 dark:text-[#64748B] text-[10px]">{item.name}</span>
                    <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">
                      ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-400 dark:text-[#5F6978] pt-1.5 border-t border-slate-200 dark:border-[#1E2633]">
                    <span>Vol: {item.volume}</span>
                    <span>OI: {item.oi}</span>
                    <span>PCR: {item.pcr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: Interactive Chart & Technical Telemetry (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Chart Header Controls */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#1E2633]">
              <div className="flex items-center gap-3">
                <h2 className="font-mono font-bold text-base text-slate-900 dark:text-[#F1F5F9]">
                  {activeWatchItem.symbol}
                </h2>
                <span className="text-lg font-mono font-extrabold text-[#10B981]">
                  ₹{activeWatchItem.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${activeWatchItem.change >= 0 ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#EF4444]/15 text-[#EF4444]'}`}>
                  {activeWatchItem.change >= 0 ? '+' : ''}{activeWatchItem.change.toFixed(2)}%
                </span>
              </div>

              {/* Timeframe & Chart Type Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-[#111620] p-1 rounded-lg border border-slate-200 dark:border-[#1E2633] text-[11px] font-mono">
                  {(['1m', '5m', '15m', '1h', '1d'] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        selectedTimeframe === tf 
                          ? 'bg-[#2563EB] text-white shadow-xs' 
                          : 'text-slate-600 dark:text-[#8B95A5] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-[#111620] p-1 rounded-lg border border-slate-200 dark:border-[#1E2633] text-[11px] font-mono">
                  <button
                    onClick={() => setChartType('candle')}
                    className={`px-2 py-0.5 rounded font-bold ${chartType === 'candle' ? 'bg-[#2563EB] text-white' : 'text-slate-500'}`}
                  >
                    Candles
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-2 py-0.5 rounded font-bold ${chartType === 'area' ? 'bg-[#2563EB] text-white' : 'text-slate-500'}`}
                  >
                    Area
                  </button>
                </div>
              </div>
            </div>

            {/* High/Low/VWAP Stats Ribbon */}
            <div className="grid grid-cols-4 gap-2 my-3 text-[11px] font-mono bg-slate-50 dark:bg-[#111620] p-2.5 rounded-lg border border-slate-200 dark:border-[#1E2633]">
              <div>
                <span className="text-slate-500 dark:text-[#64748B] text-[10px] block">24H High</span>
                <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">₹{activeWatchItem.high.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-[#64748B] text-[10px] block">24H Low</span>
                <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">₹{activeWatchItem.low.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-[#64748B] text-[10px] block">VWAP</span>
                <span className="font-bold text-[#3B82F6]">₹{(activeWatchItem.price * 0.998).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-[#64748B] text-[10px] block">24H Volume</span>
                <span className="font-bold text-[#10B981]">{activeWatchItem.volume}</span>
              </div>
            </div>

            {/* SVG Visual Candlestick / Area Chart Simulation */}
            <div className="h-[430px] bg-slate-900 dark:bg-[#080A0F] border border-slate-200 dark:border-[#1E2633] rounded-lg p-4 relative overflow-hidden flex flex-col justify-between">
              
              {/* Technical Indicator Badges */}
              <div className="flex items-center gap-2 text-[10px] font-mono z-10">
                <span className="px-2 py-0.5 bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30 rounded font-bold">EMA(20): ₹24,845</span>
                <span className="px-2 py-0.5 bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 rounded font-bold">EMA(50): ₹24,790</span>
                <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 rounded font-bold">RSI(14): 58.4 (Bullish)</span>
              </div>

              {/* Chart SVG Drawing */}
              <div className="absolute inset-x-0 top-12 bottom-6 px-4">
                <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#1E2633" strokeDasharray="4 4" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#1E2633" strokeDasharray="4 4" />
                  <line x1="0" y1="180" x2="600" y2="180" stroke="#1E2633" strokeDasharray="4 4" />
                  <line x1="0" y1="240" x2="600" y2="240" stroke="#1E2633" strokeDasharray="4 4" />

                  {chartType === 'area' ? (
                    <>
                      <path
                        d="M 0 240 Q 100 200, 200 180 T 400 110 T 600 60 L 600 300 L 0 300 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M 0 240 Q 100 200, 200 180 T 400 110 T 600 60"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                      />
                    </>
                  ) : (
                    // Candlestick rendering
                    candles.map((c, i) => {
                      const x = 30 + i * 28;
                      const isUp = c.close >= c.open;
                      const yOpen = 240 - ((c.open - 24700) * 1.2);
                      const yClose = 240 - ((c.close - 24700) * 1.2);
                      const yHigh = 240 - ((c.high - 24700) * 1.2);
                      const yLow = 240 - ((c.low - 24700) * 1.2);
                      const bodyTop = Math.min(yOpen, yClose);
                      const bodyHeight = Math.max(3, Math.abs(yOpen - yClose));
                      const color = isUp ? '#10B981' : '#EF4444';

                      return (
                        <g key={i}>
                          <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.5" />
                          <rect
                            x={x - 6}
                            y={bodyTop}
                            width="12"
                            height={bodyHeight}
                            fill={color}
                            rx="1"
                          />
                        </g>
                      );
                    })
                  )}

                  {/* Pulsing price cursor line */}
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#10B981" strokeWidth="1.5" strokeDasharray="2 2" />
                  <circle cx="600" cy="60" r="5" fill="#10B981" className="animate-ping" />
                </svg>
              </div>

              {/* Bottom Time Axis */}
              <div className="flex justify-between text-[9px] font-mono text-slate-500 dark:text-[#64748B] z-10 pt-2 border-t border-slate-800">
                <span>09:15 IST</span>
                <span>10:30 IST</span>
                <span>11:45 IST</span>
                <span>13:00 IST</span>
                <span>14:15 IST</span>
                <span>15:30 IST</span>
              </div>
            </div>
          </div>

          {/* Time & Sales Live Feed Tape */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-[#1E2633]">
              <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                <Radio size={14} className="text-[#10B981] animate-pulse" />
                <span>Live Time & Sales Execution Stream</span>
              </h3>
              <span className="text-[10px] font-mono text-[#10B981] font-bold">100 Ticks/sec</span>
            </div>

            <div className="grid grid-cols-6 text-[10px] font-mono text-slate-400 dark:text-[#64748B] font-bold mb-1.5 px-2">
              <span>Time</span>
              <span>Price</span>
              <span>Qty</span>
              <span>Side</span>
              <span>Broker Gateway</span>
              <span>Merkle Proof Hash</span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {tapeStream.map((row, idx) => (
                <div 
                  key={idx} 
                  className="grid grid-cols-6 text-[11px] font-mono p-1.5 rounded bg-slate-50 dark:bg-[#111620] border border-slate-100 dark:border-[#1E2633]/60 items-center"
                >
                  <span className="text-slate-500 dark:text-[#8B95A5]">{row.time}</span>
                  <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">₹{row.price.toFixed(2)}</span>
                  <span className="text-slate-700 dark:text-[#CBD5E1] font-bold">{row.qty}</span>
                  <span className={`font-bold ${row.side === 'BUY' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {row.side}
                  </span>
                  <span className="text-[#3B82F6] font-bold">{row.broker}</span>
                  <span className="text-slate-400 dark:text-[#64748B] text-[10px] font-mono">{row.hash}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Level-2 Order Book & Quick Order Execution Ticket (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Level 2 Order Book */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-[#1E2633]">
              <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                <BarChart2 size={14} className="text-[#8B5CF6]" />
                <span>Level-2 Market Depth</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500 dark:text-[#64748B]">Spread: ₹0.50</span>
            </div>

            <div className="space-y-3 font-mono text-[11px]">
              {/* Asks (Sellers) Red */}
              <div>
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-[#64748B] mb-1">
                  <span>Ask Price (₹)</span>
                  <span>Qty</span>
                  <span>Total</span>
                </div>
                <div className="space-y-1">
                  {asks.slice().reverse().map((ask, idx) => (
                    <div key={idx} className="relative flex justify-between px-1.5 py-0.5 rounded overflow-hidden">
                      <div 
                        className="absolute right-0 top-0 bottom-0 bg-[#EF4444]/15" 
                        style={{ width: `${Math.min(100, (ask.qty / 4000) * 100)}%` }} 
                      />
                      <span className="font-bold text-[#EF4444] z-10">₹{ask.price.toFixed(2)}</span>
                      <span className="text-slate-700 dark:text-[#F1F5F9] z-10">{ask.qty}</span>
                      <span className="text-slate-500 dark:text-[#64748B] z-10">{ask.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Mid Market Price Bar */}
              <div className="py-2 bg-slate-100 dark:bg-[#111620] rounded text-center border border-slate-200 dark:border-[#1E2633]">
                <span className="font-bold text-xs text-[#10B981]">
                  MID: ₹{activeWatchItem.price.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-[#64748B] block">Buyers 64% • Sellers 36%</span>
              </div>

              {/* Bids (Buyers) Green */}
              <div>
                <div className="flex justify-between text-[9px] text-slate-400 dark:text-[#64748B] mb-1">
                  <span>Bid Price (₹)</span>
                  <span>Qty</span>
                  <span>Total</span>
                </div>
                <div className="space-y-1">
                  {bids.map((bid, idx) => (
                    <div key={idx} className="relative flex justify-between px-1.5 py-0.5 rounded overflow-hidden">
                      <div 
                        className="absolute right-0 top-0 bottom-0 bg-[#10B981]/15" 
                        style={{ width: `${Math.min(100, (bid.qty / 4000) * 100)}%` }} 
                      />
                      <span className="font-bold text-[#10B981] z-10">₹{bid.price.toFixed(2)}</span>
                      <span className="text-slate-700 dark:text-[#F1F5F9] z-10">{bid.qty}</span>
                      <span className="text-slate-500 dark:text-[#64748B] z-10">{bid.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 1-Click Order Execution Ticket */}
          <div className="bg-white dark:bg-[#0B0E14] border border-slate-200 dark:border-[#1E2633] rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-[#1E2633]">
              <h3 className="font-mono font-bold text-xs text-slate-900 dark:text-[#F1F5F9] flex items-center gap-2">
                <Zap size={14} className="text-[#2563EB]" />
                <span>1-Click Deskside Order Ticket</span>
              </h3>
            </div>

            {orderSuccessMsg && (
              <div className="p-2.5 mb-3 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[11px] font-mono text-[#10B981] animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 size={14} />
                  <span>Broker Execution Confirmed</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-700 dark:text-[#A7F3D0]">{orderSuccessMsg}</p>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-3 font-mono text-xs">
              
              {/* Side Selector (BUY vs SELL) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderSide('BUY')}
                  className={`py-2 rounded-lg font-bold transition-all btn-3d ${
                    orderSide === 'BUY' 
                      ? 'btn-3d-success text-white' 
                      : 'bg-slate-100 dark:bg-[#111620] text-slate-600 dark:text-[#8B95A5]'
                  }`}
                >
                  BUY (LONG)
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('SELL')}
                  className={`py-2 rounded-lg font-bold transition-all btn-3d ${
                    orderSide === 'SELL' 
                      ? 'btn-3d-danger text-white' 
                      : 'bg-slate-100 dark:bg-[#111620] text-slate-600 dark:text-[#8B95A5]'
                  }`}
                >
                  SELL (SHORT)
                </button>
              </div>

              {/* Order Type Selector */}
              <div>
                <label className="text-[10px] text-slate-500 dark:text-[#64748B] block mb-1">Order Type</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-[#111620] rounded-lg border border-slate-200 dark:border-[#1E2633] text-[10px] font-bold">
                  {(['MARKET', 'LIMIT', 'SL-M'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-1 rounded text-center ${
                        orderType === t ? 'bg-[#2563EB] text-white' : 'text-slate-600 dark:text-[#8B95A5]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Broker API Selection */}
              <div>
                <label className="text-[10px] text-slate-500 dark:text-[#64748B] block mb-1">Broker API Gateway</label>
                <select
                  value={selectedBroker}
                  onChange={(e) => setSelectedBroker(e.target.value as any)}
                  className="w-full bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-[#F1F5F9] outline-none font-bold"
                >
                  <option value="Upstox Pro">Upstox Pro v2 FIX API</option>
                  <option value="Groww API">Groww Trade Connect API</option>
                  <option value="Zerodha Kite">Zerodha KiteConnect API</option>
                </select>
              </div>

              {/* Quantity Input */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-[#64748B] mb-1">
                  <span>Quantity (Lots)</span>
                  <span>1 Lot = 25 Qty</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value))}
                    min="1"
                    className="flex-1 bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-[#F1F5F9] font-bold outline-none"
                  />
                  <div className="flex gap-1">
                    {[25, 50, 100].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setOrderQty(qty)}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633] text-[10px] font-bold text-slate-700 dark:text-[#94A3B8]"
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Total & Required Margin Preview */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] space-y-1 text-[10px]">
                <div className="flex justify-between text-slate-500 dark:text-[#64748B]">
                  <span>Order Value</span>
                  <span className="font-bold text-slate-900 dark:text-[#F1F5F9]">
                    ₹{(activeWatchItem.price * orderQty).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-[#64748B]">
                  <span>Req. Margin (15% Intraday)</span>
                  <span className="font-bold text-[#10B981]">
                    ₹{((activeWatchItem.price * orderQty) * 0.15).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Submit Execution Button */}
              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl font-mono font-bold text-xs text-white btn-3d shadow-lg flex items-center justify-center gap-2 ${
                  orderSide === 'BUY' ? 'btn-3d-success' : 'btn-3d-danger'
                }`}
              >
                <Zap size={14} />
                <span>EXECUTE {orderSide} ORDER</span>
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
