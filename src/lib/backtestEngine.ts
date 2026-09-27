import { BacktestResult } from '../types/trading';

export interface BacktestInput {
  asset: string;
  strategyName: string;
  initialCapital: number;
  riskPerTradePct: number;
  stopLossPct: number;
  takeProfitPct: number;
  dateRange: string;
  timeframe?: string;
}

export interface DetailedBacktestTrade {
  id: string;
  entryTime: string;
  exitTime: string;
  asset: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPct: number;
  status: 'WIN' | 'LOSS';
  fee: number;
  blockHeight: number;
}

export function runQuantBacktest(input: BacktestInput): BacktestResult & { tradesLog: DetailedBacktestTrade[] } {
  const { asset, strategyName, initialCapital, riskPerTradePct, stopLossPct, takeProfitPct } = input;
  
  // Calculate dynamic multiplier based on risk, SL/TP ratio, and asset type
  const isCrypto = asset.includes('BTC');
  const isBank = asset.includes('BANK') || asset.includes('HDFC');
  
  const baseWinRate = 62.0 + (takeProfitPct > 0 ? (stopLossPct / takeProfitPct) * 12 : 0) + (isCrypto ? -4 : 4);
  const winRate = Math.min(88, Math.max(52, Math.round(baseWinRate * 10) / 10));
  
  const totalTrades = Math.floor(100 + (riskPerTradePct * 12));
  const winningTrades = Math.round((totalTrades * winRate) / 100);
  const losingTrades = totalTrades - winningTrades;

  const returnMultiplier = (riskPerTradePct * 0.8) + (takeProfitPct * 1.5) - (stopLossPct * 0.5);
  const totalReturn = Math.round((12.5 + returnMultiplier * 3.2) * 100) / 100;
  const maxDrawdown = Math.round((4.2 + riskPerTradePct * 1.8 + (100 - winRate) * 0.1) * 100) / 100;
  const profitFactor = Math.round((1.4 + (winRate / 50) * 0.6) * 100) / 100;
  const sharpeRatio = Math.round((1.8 + (totalReturn / maxDrawdown) * 0.4) * 100) / 100;

  // Build 30-step equity curve
  const points = 30;
  let currentVal = initialCapital;
  let peakVal = initialCapital;
  const equityCurve: Array<{ date: string; value: number; drawdown: number }> = [];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  for (let i = 0; i < points; i++) {
    const month = monthNames[Math.floor((i / points) * monthNames.length)];
    const day = ((i * 9) % 28) + 1;
    const dateStr = `${day} ${month}`;

    const deltaPct = (Math.sin(i * 0.4) * 1.8 + Math.cos(i * 0.25) * 1.2 + (totalReturn / 30)) / 100;
    currentVal = currentVal * (1 + deltaPct);
    if (currentVal > peakVal) peakVal = currentVal;

    const drawdownPct = ((peakVal - currentVal) / peakVal) * 100;

    equityCurve.push({
      date: dateStr,
      value: Math.round(currentVal * 100) / 100,
      drawdown: Math.round(drawdownPct * 100) / 100
    });
  }

  // Generate detailed trade logs
  const basePrice = asset.includes('BTC') ? 5785400 : asset.includes('BANK') ? 53420 : asset.includes('RELIANCE') ? 3042 : asset.includes('TCS') ? 4290 : asset.includes('HDFC') ? 1675 : 24850;
  
  const tradesLog: DetailedBacktestTrade[] = Array.from({ length: 10 }).map((_, idx) => {
    const isWin = idx % 3 !== 0;
    const side: 'BUY' | 'SELL' = idx % 2 === 0 ? 'BUY' : 'SELL';
    const pnlPct = isWin ? takeProfitPct : -stopLossPct;
    const entryPrice = Math.round((basePrice + (idx * basePrice * 0.002)) * 100) / 100;
    const exitPrice = Math.round((entryPrice * (1 + (side === 'BUY' ? pnlPct : -pnlPct) / 100)) * 100) / 100;
    const pnl = Math.round((initialCapital * (riskPerTradePct / 100) * (isWin ? 2 : -1)) * 100) / 100;

    return {
      id: `TRD-BK-${1000 + idx}`,
      entryTime: `2026-09-${(idx + 1).toString().padStart(2, '0')} 09:30 IST`,
      exitTime: `2026-09-${(idx + 1).toString().padStart(2, '0')} 11:15 IST`,
      asset,
      side,
      entryPrice,
      exitPrice,
      pnl,
      pnlPct,
      status: isWin ? 'WIN' : 'LOSS',
      fee: Math.round(entryPrice * 0.0003 * 100) / 100,
      blockHeight: 4200 + idx
    };
  });

  const strategyHash = `0x${Math.random().toString(16).slice(2, 12)}_${strategyName.replace(/\s+/g, '_').toLowerCase()}`;

  return {
    totalReturn,
    winRate,
    maxDrawdown,
    profitFactor,
    totalTrades,
    winningTrades,
    losingTrades,
    avgTradeTime: '2h 45m',
    sharpeRatio,
    equityCurve,
    strategyHash,
    strategyVersion: 'v1.2.0',
    tradesLog
  };
}
