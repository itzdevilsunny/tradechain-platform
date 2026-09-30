import { CandlestickData } from '../types/trading';

export type MarketRegime = 
  | 'TRENDING_UP' 
  | 'TRENDING_DOWN' 
  | 'SIDEWAYS' 
  | 'HIGH_VOLATILITY' 
  | 'LOW_VOLATILITY';

export interface QuantitativeFeatures {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Technical Averages
  ema9: number;
  ema20: number;
  ema50: number;
  ema200: number;
  // Oscillators
  rsi14: number;
  macd: number;
  macdSignal: number;
  macdHist: number;
  // Volatility & Bands
  vwap: number;
  atr14: number;
  atrPct: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  bbPercentB: number;
  bbBandwidth: number;
  // Trend Strength
  adx14: number;
  // Momentum & Returns
  return5m: number;
  return15m: number;
  return1h: number;
  return1d: number;
  logReturn: number;
  // Volume Dynamics
  volumeRatio: number; // Volume vs 20 SMA volume
  volumeAccel: number; // Current volume vs 5-candle avg
  // Volatility
  rollingVol14: number;
  // Market Regime Classification
  marketRegime: MarketRegime;
  regimeConfidence: number; // 0 to 1
  timestamp: string;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  if (data.length < period) return new Array(data.length).fill(data[data.length - 1]);

  const k = 2 / (period + 1);
  const emaArray: number[] = new Array(data.length);
  
  // Start with simple moving average
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  emaArray[period - 1] = sum / period;

  for (let i = period; i < data.length; i++) {
    emaArray[i] = data[i] * k + emaArray[i - 1] * (1 - k);
  }

  // Backfill initial elements for convenience
  for (let i = 0; i < period - 1; i++) {
    emaArray[i] = data[i];
  }

  return emaArray;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(diff)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - (100 / (1 + rs))).toFixed(2));
}

/**
 * Calculate MACD (12, 26, 9)
 */
export function calculateMACD(closes: number[]): { macd: number; signal: number; hist: number } {
  if (closes.length < 26) {
    return { macd: 0, signal: 0, hist: 0 };
  }

  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  
  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(ema12[i] - ema26[i]);
  }

  const signalLine = calculateEMA(macdLine, 9);
  const lastMacd = macdLine[macdLine.length - 1];
  const lastSignal = signalLine[signalLine.length - 1];
  const lastHist = lastMacd - lastSignal;

  return {
    macd: Number(lastMacd.toFixed(3)),
    signal: Number(lastSignal.toFixed(3)),
    hist: Number(lastHist.toFixed(3)),
  };
}

/**
 * Calculate Average True Range (ATR)
 */
export function calculateATR(candles: CandlestickData[], period: number = 14): number {
  if (candles.length < 2) return 1.0;

  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const cur = candles[i];
    const prev = candles[i - 1];
    const tr = Math.max(
      cur.high - cur.low,
      Math.abs(cur.high - prev.close),
      Math.abs(cur.low - prev.close)
    );
    trueRanges.push(tr);
  }

  if (trueRanges.length < period) {
    return Number((trueRanges.reduce((a, b) => a + b, 0) / trueRanges.length).toFixed(2));
  }

  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }

  return Number(atr.toFixed(2));
}

/**
 * Calculate VWAP (Volume Weighted Average Price)
 */
export function calculateVWAP(candles: CandlestickData[]): number {
  if (candles.length === 0) return 0;

  let cumulativeTypicalVol = 0;
  let cumulativeVol = 0;

  for (const c of candles) {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const vol = c.volume > 0 ? c.volume : 1;
    cumulativeTypicalVol += typicalPrice * vol;
    cumulativeVol += vol;
  }

  if (cumulativeVol === 0) return candles[candles.length - 1].close;
  return Number((cumulativeTypicalVol / cumulativeVol).toFixed(2));
}

/**
 * Calculate Bollinger Bands (20, 2)
 */
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number; middle: number; lower: number; percentB: number; bandwidth: number } {
  if (closes.length < period) {
    const last = closes[closes.length - 1] || 0;
    return { upper: last * 1.02, middle: last, lower: last * 0.98, percentB: 0.5, bandwidth: 0.04 };
  }

  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = mean + stdDevMultiplier * stdDev;
  const lower = mean - stdDevMultiplier * stdDev;
  const last = closes[closes.length - 1];

  const bandwidth = mean > 0 ? (upper - lower) / mean : 0;
  const percentB = upper !== lower ? (last - lower) / (upper - lower) : 0.5;

  return {
    upper: Number(upper.toFixed(2)),
    middle: Number(mean.toFixed(2)),
    lower: Number(lower.toFixed(2)),
    percentB: Number(percentB.toFixed(3)),
    bandwidth: Number(bandwidth.toFixed(4)),
  };
}

/**
 * Calculate Average Directional Index (ADX 14)
 */
export function calculateADX(candles: CandlestickData[], period: number = 14): number {
  if (candles.length <= period * 2) return 22.5;

  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const tr: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const cur = candles[i];
    const prev = candles[i - 1];

    const upMove = cur.high - prev.high;
    const downMove = prev.low - cur.low;

    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);

    tr.push(Math.max(
      cur.high - cur.low,
      Math.abs(cur.high - prev.close),
      Math.abs(cur.low - prev.close)
    ));
  }

  // Smooth TR, +DM, -DM
  let smoothTR = tr.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothPlusDM = plusDM.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothMinusDM = minusDM.slice(0, period).reduce((a, b) => a + b, 0);

  const dxList: number[] = [];

  for (let i = period; i < tr.length; i++) {
    smoothTR = smoothTR - (smoothTR / period) + tr[i];
    smoothPlusDM = smoothPlusDM - (smoothPlusDM / period) + plusDM[i];
    smoothMinusDM = smoothMinusDM - (smoothMinusDM / period) + minusDM[i];

    const plusDI = smoothTR > 0 ? (smoothPlusDM / smoothTR) * 100 : 0;
    const minusDI = smoothTR > 0 ? (smoothMinusDM / smoothTR) * 100 : 0;

    const diSum = plusDI + minusDI;
    const dx = diSum > 0 ? (Math.abs(plusDI - minusDI) / diSum) * 100 : 0;
    dxList.push(dx);
  }

  if (dxList.length < period) return 25.0;
  const adx = dxList.slice(-period).reduce((a, b) => a + b, 0) / period;
  return Number(adx.toFixed(2));
}

/**
 * Determine Institutional Market Regime
 */
export function classifyMarketRegime(
  price: number,
  ema20: number,
  ema50: number,
  rsi: number,
  macdHist: number,
  adx: number,
  bandwidth: number,
  atrPct: number
): { regime: MarketRegime; confidence: number } {
  // 1. Check High Volatility
  if (bandwidth > 0.08 || atrPct > 2.2) {
    return { regime: 'HIGH_VOLATILITY', confidence: Math.min(0.95, (bandwidth / 0.08) * 0.7 + 0.25) };
  }

  // 2. Check Low Volatility (Squeeze)
  if (bandwidth < 0.015 && atrPct < 0.45) {
    return { regime: 'LOW_VOLATILITY', confidence: 0.88 };
  }

  // 3. Trending Up
  if (price > ema20 && ema20 > ema50 && adx > 22 && rsi > 52 && macdHist > 0) {
    const conf = Math.min(0.95, 0.60 + (adx / 100) * 0.3 + (rsi > 60 ? 0.05 : 0));
    return { regime: 'TRENDING_UP', confidence: Number(conf.toFixed(2)) };
  }

  // 4. Trending Down
  if (price < ema20 && ema20 < ema50 && adx > 22 && rsi < 48 && macdHist < 0) {
    const conf = Math.min(0.95, 0.60 + (adx / 100) * 0.3 + (rsi < 40 ? 0.05 : 0));
    return { regime: 'TRENDING_DOWN', confidence: Number(conf.toFixed(2)) };
  }

  // 5. Default to Sideways / Consolidation
  return { regime: 'SIDEWAYS', confidence: 0.76 };
}

/**
 * Master Feature Extraction Pipeline
 * Extracts real-time quantitative feature vector from live candlestick sequence
 */
export function extractQuantitativeFeatures(
  symbol: string,
  candles: CandlestickData[]
): QuantitativeFeatures {
  if (!candles || candles.length === 0) {
    throw new Error(`Insufficient candle data to extract features for ${symbol}`);
  }

  const closes = candles.map(c => c.close);
  const n = closes.length;
  const currentPrice = closes[n - 1];
  const lastCandle = candles[n - 1];

  // Moving averages
  const ema9Arr = calculateEMA(closes, 9);
  const ema20Arr = calculateEMA(closes, 20);
  const ema50Arr = calculateEMA(closes, 50);
  const ema200Arr = calculateEMA(closes, Math.min(200, n));

  const ema9 = Number((ema9Arr[n - 1] || currentPrice).toFixed(2));
  const ema20 = Number((ema20Arr[n - 1] || currentPrice).toFixed(2));
  const ema50 = Number((ema50Arr[n - 1] || currentPrice).toFixed(2));
  const ema200 = Number((ema200Arr[n - 1] || currentPrice).toFixed(2));

  // Technical Oscillators
  const rsi14 = calculateRSI(closes, 14);
  const macdData = calculateMACD(closes);
  const vwap = calculateVWAP(candles);
  const atr14 = calculateATR(candles, 14);
  const atrPct = Number(((atr14 / currentPrice) * 100).toFixed(2));

  // Bollinger Bands
  const bb = calculateBollingerBands(closes, 20, 2);

  // ADX
  const adx14 = calculateADX(candles, 14);

  // Momentum returns
  const getReturn = (barsAgo: number) => {
    if (n <= barsAgo) return 0;
    const prev = closes[n - 1 - barsAgo];
    return Number((((currentPrice - prev) / prev) * 100).toFixed(3));
  };

  const return5m = getReturn(1); // 1 candle
  const return15m = getReturn(3); // 3 candles
  const return1h = getReturn(12); // 12 x 5m candles
  const return1d = getReturn(Math.min(75, n - 1)); // intraday / day return
  const prevClose = n > 1 ? closes[n - 2] : currentPrice;
  const logReturn = Number(Math.log(currentPrice / (prevClose || currentPrice)).toFixed(5));

  // Volume calculations
  const volumes = candles.map(c => c.volume || 1);
  const recentVol = lastCandle.volume || 1;
  const avgVol20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, volumes.length);
  const volumeRatio = Number((recentVol / (avgVol20 || 1)).toFixed(2));

  const avgVol5 = volumes.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, volumes.length);
  const volumeAccel = Number((recentVol / (avgVol5 || 1)).toFixed(2));

  // Rolling Realized Volatility
  const returnsSlice: number[] = [];
  for (let i = Math.max(1, n - 14); i < n; i++) {
    returnsSlice.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  }
  const meanRet = returnsSlice.reduce((a, b) => a + b, 0) / (returnsSlice.length || 1);
  const varRet = returnsSlice.reduce((sum, r) => sum + Math.pow(r - meanRet, 2), 0) / (returnsSlice.length || 1);
  const rollingVol14 = Number((Math.sqrt(varRet) * Math.sqrt(252 * 75) * 100).toFixed(2)); // Annualized %

  // Regime
  const { regime, confidence } = classifyMarketRegime(
    currentPrice,
    ema20,
    ema50,
    rsi14,
    macdData.hist,
    adx14,
    bb.bandwidth,
    atrPct
  );

  return {
    symbol,
    price: currentPrice,
    open: lastCandle.open,
    high: lastCandle.high,
    low: lastCandle.low,
    close: lastCandle.close,
    volume: recentVol,
    ema9,
    ema20,
    ema50,
    ema200,
    rsi14,
    macd: macdData.macd,
    macdSignal: macdData.signal,
    macdHist: macdData.hist,
    vwap,
    atr14,
    atrPct,
    bbUpper: bb.upper,
    bbMiddle: bb.middle,
    bbLower: bb.lower,
    bbPercentB: bb.percentB,
    bbBandwidth: bb.bandwidth,
    adx14,
    return5m,
    return15m,
    return1h,
    return1d,
    logReturn,
    volumeRatio,
    volumeAccel,
    rollingVol14,
    marketRegime: regime,
    regimeConfidence: confidence,
    timestamp: new Date().toISOString(),
  };
}
