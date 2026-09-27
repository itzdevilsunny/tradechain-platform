import React, { useState } from 'react';
import { CandlestickData } from '../../types/trading';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Line, 
  ComposedChart,
  ReferenceLine
} from 'recharts';

interface TradingChartProps {
  candles: CandlestickData[];
  selectedPair: string;
  onSelectPair: (pair: string) => void;
  price: number;
  priceChangePct: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  selectedPair,
  onSelectPair,
  price,
  priceChangePct
}) => {
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1H' | '4H' | '1D'>('15m');
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);

  const minPrice = Math.min(...candles.map(c => c.low)) * 0.998;
  const maxPrice = Math.max(...candles.map(c => c.high)) * 1.002;

  // Custom Candlestick shape renderer
  const CustomCandleShape = (props: any) => {
    const { x, width, payload } = props;
    if (!payload || !props.yAxis) return null;

    const { open, close, high, low } = payload;
    const isGreen = close >= open;

    const yAxis = props.yAxis;
    const yOpen = yAxis.scale(open);
    const yClose = yAxis.scale(close);
    const yHigh = yAxis.scale(high);
    const yLow = yAxis.scale(low);

    const bodyTop = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 2);
    const centerX = x + width / 2;

    const color = isGreen ? '#10B981' : '#EF4444';

    return (
      <g>
        <line
          x1={centerX}
          y1={yHigh}
          x2={centerX}
          y2={yLow}
          stroke={color}
          strokeWidth={1.5}
        />
        <rect
          x={x + 2}
          y={bodyTop}
          width={Math.max(width - 4, 3)}
          height={bodyHeight}
          fill={color}
          stroke={color}
          rx={1}
        />
      </g>
    );
  };

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#111620] border border-slate-200 dark:border-[#1E2633] space-y-4 shadow-sm">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1E2633] pb-3">
        {/* Indian Market Symbol & Live Price */}
        <div className="flex items-center gap-3">
          <select
            value={selectedPair}
            onChange={(e) => onSelectPair(e.target.value)}
            className="bg-slate-100 dark:bg-[#161D2A] border border-slate-200 dark:border-[#1E2633] text-slate-900 dark:text-[#F1F5F9] text-xs font-mono font-bold rounded-lg px-3 py-1.5 outline-none focus:border-[#3B82F6] cursor-pointer"
          >
            <option value="NIFTY 50 Futures">NIFTY 50 Futures (NSE)</option>
            <option value="BANK NIFTY Futures">BANK NIFTY Futures (NSE)</option>
            <option value="FIN NIFTY Futures">FIN NIFTY Futures (NSE)</option>
            <option value="SENSEX Futures">SENSEX Futures (BSE)</option>
            <option value="NIFTY 24800 CE">NIFTY 24800 CE (NSE F&O)</option>
            <option value="BANKNIFTY 51500 PE">BANKNIFTY 51500 PE (NSE F&O)</option>
            <option value="RELIANCE Eq">RELIANCE Eq (NSE)</option>
            <option value="TCS Eq">TCS Eq (NSE)</option>
            <option value="BTC/INR">BTC / INR (Mudrex/CoinSwitch)</option>
          </select>

          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-lg font-bold text-slate-900 dark:text-[#F1F5F9]">
              ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-bold ${priceChangePct >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(2)}%
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-[#64748B] pl-2 border-l border-slate-200 dark:border-[#1E2633]">
            <span>EMA(20): <span className="text-[#3B82F6] font-bold">24,845</span></span>
            <span>EMA(50): <span className="text-[#8B5CF6] font-bold">24,790</span></span>
          </div>
        </div>

        {/* Timeframe selector & Overlay Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`btn-3d px-2.5 py-1 text-[11px] font-mono font-bold rounded-md transition-all ${
              showEMA20 ? 'btn-3d-primary text-white' : 'btn-3d-secondary text-slate-500 dark:text-[#64748B]'
            }`}
          >
            EMA 20
          </button>
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`btn-3d px-2.5 py-1 text-[11px] font-mono font-bold rounded-md transition-all ${
              showEMA50 ? 'btn-3d-purple text-white' : 'btn-3d-secondary text-slate-500 dark:text-[#64748B]'
            }`}
          >
            EMA 50
          </button>

          {/* Timeframe Buttons */}
          <div className="flex bg-slate-100 dark:bg-[#161D2A] p-1 rounded-lg border border-slate-200 dark:border-[#1E2633] text-xs font-mono gap-1">
            {(['1m', '5m', '15m', '1H', '4H', '1D'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`btn-3d px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  timeframe === tf ? 'btn-3d-primary text-white' : 'btn-3d-secondary text-slate-600 dark:text-[#94A3B8]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Candlestick Chart Window */}
      <div className="h-72 w-full bg-slate-50 dark:bg-[#080A0F] rounded-xl p-2 border border-slate-200 dark:border-[#1E2633] relative">
        <div className="absolute right-3 top-4 z-10 font-mono text-[10px] text-[#10B981] bg-[#10B981]/15 px-2.5 py-1 rounded-md border border-[#10B981]/40 flex items-center gap-1.5 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
          NSE LIVE: ₹{price.toFixed(2)}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={candles} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="time" 
              stroke="#64748B" 
              tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
              tickLine={false}
              axisLine={{ stroke: '#1E2633' }}
            />
            <YAxis 
              domain={[minPrice, maxPrice]} 
              orientation="right" 
              stroke="#64748B" 
              tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickFormatter={(val) => val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              tickLine={false}
              axisLine={{ stroke: '#1E2633' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0B0E14', 
                borderColor: '#1E2633', 
                borderRadius: '8px', 
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
                color: '#F1F5F9'
              }}
              formatter={(val: any) => [typeof val === 'number' ? `₹${val.toLocaleString('en-IN')}` : val]}
            />
            
            <ReferenceLine y={price} stroke="#3B82F6" strokeDasharray="3 3" opacity={0.7} />

            <Bar
              dataKey="close"
              shape={<CustomCandleShape />}
              isAnimationActive={false}
            />

            {showEMA20 && (
              <Line 
                type="monotone" 
                dataKey="ema20" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            )}

            {showEMA50 && (
              <Line 
                type="monotone" 
                dataKey="ema50" 
                stroke="#8B5CF6" 
                strokeWidth={2} 
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Sub-chart: Indian Market Volume Chart */}
      <div className="h-20 w-full bg-slate-50 dark:bg-[#080A0F] rounded-xl p-2 border border-slate-200 dark:border-[#1E2633]">
        <div className="text-[10px] font-mono text-slate-500 dark:text-[#64748B] mb-1 flex items-center justify-between">
          <span>NSE INTRADAY VOLUME (49,800 Contracts)</span>
          <span className="font-bold text-slate-700 dark:text-[#94A3B8]">VOL EMA(20)</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={candles} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <Bar 
              dataKey="volume" 
              fill="#10B981" 
              opacity={0.7} 
              radius={[2, 2, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
