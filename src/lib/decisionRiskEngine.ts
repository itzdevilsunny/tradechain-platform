import { MLPredictionOutput } from './mlBrain';
import { ActivePosition, TradeRecord } from '../types/trading';

export interface RiskParameters {
  totalCapital: number;           // e.g. 100,000 INR
  maxRiskPerTradePct: number;     // e.g. 0.5% (0.005) or 1.0%
  maxDailyLossPct: number;        // e.g. 1.5% (1,500 INR on 100k)
  maxOpenPositions: number;       // e.g. 5
  trailingStopMultiplier: number; // e.g. 1.5 x ATR
  partialProfitRatio: number;     // e.g. 0.50 (take 50% profit at +1R)
}

export interface RiskAssessment {
  approved: boolean;
  rejectReason?: string;
  orderSizeQuantity: number;
  maxRiskAmount: number;
  entryPrice: number;
  stopLossPrice: number;
  target1Price: number; // +1R
  target2Price: number; // +2R
  riskPerShare: number;
  riskRewardRatio: number;
  killSwitchActive: boolean;
}

export interface PositionManagementDecision {
  action: 'HOLD' | 'TAKE_PARTIAL_PROFIT' | 'UPDATE_TRAILING_STOP' | 'STOP_LOSS_EXIT' | 'TARGET_EXIT';
  newStopLoss?: number;
  sharesToClose?: number;
  reason: string;
}

export const DEFAULT_RISK_PARAMS: RiskParameters = {
  totalCapital: 100000,
  maxRiskPerTradePct: 0.005, // 0.5% risk = ₹500 on ₹100,000 capital
  maxDailyLossPct: 0.015,    // 1.5% max daily drawdown = ₹1,500
  maxOpenPositions: 5,
  trailingStopMultiplier: 1.5,
  partialProfitRatio: 0.50,
};

/**
 * Deterministic Risk Engine: Evaluates trade candidacy and computes exact position sizing
 */
export function evaluateRiskAndSizing(
  prediction: MLPredictionOutput,
  currentPrice: number,
  openPositions: ActivePosition[],
  closedTradesToday: TradeRecord[],
  riskParams: RiskParameters = DEFAULT_RISK_PARAMS
): RiskAssessment {
  // 1. Check Daily Loss Limit (Kill Switch)
  const todayLosses = closedTradesToday
    .filter(t => t.pnl < 0)
    .reduce((sum, t) => sum + Math.abs(t.pnl), 0);
  const maxDailyLossAllowed = riskParams.totalCapital * riskParams.maxDailyLossPct;

  if (todayLosses >= maxDailyLossAllowed) {
    return {
      approved: false,
      rejectReason: `Daily loss limit breached (₹${todayLosses.toFixed(2)} / ₹${maxDailyLossAllowed.toFixed(2)}). Circuit breaker activated.`,
      orderSizeQuantity: 0,
      maxRiskAmount: 0,
      entryPrice: currentPrice,
      stopLossPrice: prediction.recommendedStopLoss,
      target1Price: prediction.recommendedTargetPrice,
      target2Price: prediction.recommendedTargetPrice,
      riskPerShare: 0,
      riskRewardRatio: prediction.riskRewardRatio,
      killSwitchActive: true,
    };
  }

  // 2. Check Open Position Limit
  if (openPositions.length >= riskParams.maxOpenPositions) {
    return {
      approved: false,
      rejectReason: `Maximum open positions limit (${riskParams.maxOpenPositions}) reached. Risk capacity full.`,
      orderSizeQuantity: 0,
      maxRiskAmount: 0,
      entryPrice: currentPrice,
      stopLossPrice: prediction.recommendedStopLoss,
      target1Price: prediction.recommendedTargetPrice,
      target2Price: prediction.recommendedTargetPrice,
      riskPerShare: 0,
      riskRewardRatio: prediction.riskRewardRatio,
      killSwitchActive: false,
    };
  }

  // 3. Check for Existing Open Position in the same symbol
  const existingPos = openPositions.find(p => p.asset === prediction.symbol);
  if (existingPos) {
    return {
      approved: false,
      rejectReason: `Already hold an active open position in ${prediction.symbol}. Pyramid orders disabled.`,
      orderSizeQuantity: 0,
      maxRiskAmount: 0,
      entryPrice: currentPrice,
      stopLossPrice: existingPos.stopLoss,
      target1Price: existingPos.takeProfit,
      target2Price: existingPos.takeProfit,
      riskPerShare: 0,
      riskRewardRatio: prediction.riskRewardRatio,
      killSwitchActive: false,
    };
  }

  // 4. Check Signal Edge & Regime Filter
  if (prediction.signal === 'HOLD') {
    return {
      approved: false,
      rejectReason: `ML ensemble predicts HOLD (P(neutral) = ${(prediction.probabilityNeutral * 100).toFixed(0)}%). No statistical edge.`,
      orderSizeQuantity: 0,
      maxRiskAmount: 0,
      entryPrice: currentPrice,
      stopLossPrice: prediction.recommendedStopLoss,
      target1Price: prediction.recommendedTargetPrice,
      target2Price: prediction.recommendedTargetPrice,
      riskPerShare: 0,
      riskRewardRatio: prediction.riskRewardRatio,
      killSwitchActive: false,
    };
  }

  if (prediction.marketRegime === 'HIGH_VOLATILITY') {
    return {
      approved: false,
      rejectReason: `High volatility regime detected. Institutional risk parameters require staying in cash.`,
      orderSizeQuantity: 0,
      maxRiskAmount: 0,
      entryPrice: currentPrice,
      stopLossPrice: prediction.recommendedStopLoss,
      target1Price: prediction.recommendedTargetPrice,
      target2Price: prediction.recommendedTargetPrice,
      riskPerShare: 0,
      riskRewardRatio: prediction.riskRewardRatio,
      killSwitchActive: false,
    };
  }

  // 5. Deterministic Stop Loss and Targets
  const stopLossPrice = prediction.recommendedStopLoss;
  const riskPerShare = Math.abs(currentPrice - stopLossPrice);

  if (riskPerShare <= 0) {
    return {
      approved: false,
      rejectReason: `Invalid stop loss distance (${riskPerShare}).`,
      orderSizeQuantity: 0,
      maxRiskAmount: 0,
      entryPrice: currentPrice,
      stopLossPrice,
      target1Price: currentPrice,
      target2Price: currentPrice,
      riskPerShare: 0,
      riskRewardRatio: 0,
      killSwitchActive: false,
    };
  }

  // Multi-stage targets: +1R (equal to risk) and +2R (double the risk)
  const isBuy = prediction.signal === 'BUY';
  const target1Price = isBuy ? Number((currentPrice + riskPerShare).toFixed(2)) : Number((currentPrice - riskPerShare).toFixed(2));
  const target2Price = isBuy ? Number((currentPrice + riskPerShare * 2).toFixed(2)) : Number((currentPrice - riskPerShare * 2).toFixed(2));

  // 6. Quantitative Position Sizing: Risk Amount = Capital * maxRiskPerTradePct
  const maxRiskAmount = riskParams.totalCapital * riskParams.maxRiskPerTradePct; // e.g. ₹500
  let orderSizeQuantity = Math.floor(maxRiskAmount / riskPerShare);

  // Fallback for high-priced assets (indices / high nominal stock prices)
  if (orderSizeQuantity < 1) {
    orderSizeQuantity = 1;
  }

  // Ensure total position value does not exceed available capital
  const totalPositionValue = orderSizeQuantity * currentPrice;
  if (totalPositionValue > riskParams.totalCapital * 0.40) {
    // Cap any single position at 40% of total capital portfolio
    orderSizeQuantity = Math.max(1, Math.floor((riskParams.totalCapital * 0.40) / currentPrice));
  }

  return {
    approved: true,
    orderSizeQuantity,
    maxRiskAmount: Number((orderSizeQuantity * riskPerShare).toFixed(2)),
    entryPrice: currentPrice,
    stopLossPrice,
    target1Price,
    target2Price,
    riskPerShare: Number(riskPerShare.toFixed(2)),
    riskRewardRatio: prediction.riskRewardRatio,
    killSwitchActive: false,
  };
}

/**
 * Continuous Dynamic Position Manager
 * Evaluates open positions on every tick for:
 * 1. Hard Stop-Loss Hit
 * 2. +1R Partial Profit Taking (lock in gains and move SL to breakeven)
 * 3. Dynamic ATR Trailing Stop
 * 4. +2R Target Reached
 */
export function monitorOpenPosition(
  position: ActivePosition,
  currentPrice: number,
  atr14: number
): PositionManagementDecision {
  const isLong = position.side === 'BUY';
  const entry = position.entryPrice;
  const initialRisk = Math.abs(entry - position.stopLoss);

  // 1. Hard Stop-Loss Check
  if (isLong && currentPrice <= position.stopLoss) {
    return {
      action: 'STOP_LOSS_EXIT',
      reason: `Hard stop-loss triggered at ₹${currentPrice} (SL was ₹${position.stopLoss}). Controlled exit.`,
    };
  } else if (!isLong && currentPrice >= position.stopLoss) {
    return {
      action: 'STOP_LOSS_EXIT',
      reason: `Hard stop-loss triggered at ₹${currentPrice} (SL was ₹${position.stopLoss}). Controlled exit.`,
    };
  }

  // 2. Full Target Hit (+2R or takeProfit price)
  if (isLong && currentPrice >= position.takeProfit) {
    return {
      action: 'TARGET_EXIT',
      reason: `Target +2R hit at ₹${currentPrice} (Target ₹${position.takeProfit}). Profit secured.`,
    };
  } else if (!isLong && currentPrice <= position.takeProfit) {
    return {
      action: 'TARGET_EXIT',
      reason: `Target +2R hit at ₹${currentPrice} (Target ₹${position.takeProfit}). Profit secured.`,
    };
  }

  // 3. Dynamic Trailing Stop Loss Management
  if (isLong) {
    // If trade has moved up by at least 1R, move stop loss to breakeven + buffer
    const profitR = (currentPrice - entry) / (initialRisk || 1);
    if (profitR >= 1.0) {
      const trailingSL = Number((currentPrice - 1.5 * atr14).toFixed(2));
      // Trailing SL must only ratchet UP, never down
      if (trailingSL > position.stopLoss && trailingSL > entry) {
        return {
          action: 'UPDATE_TRAILING_STOP',
          newStopLoss: trailingSL,
          reason: `Trailing stop ratcheted up to ₹${trailingSL} (+${profitR.toFixed(1)}R gained). Locking in profit.`,
        };
      }
    }
  } else {
    // Short position trailing SL
    const profitR = (entry - currentPrice) / (initialRisk || 1);
    if (profitR >= 1.0) {
      const trailingSL = Number((currentPrice + 1.5 * atr14).toFixed(2));
      if (trailingSL < position.stopLoss && trailingSL < entry) {
        return {
          action: 'UPDATE_TRAILING_STOP',
          newStopLoss: trailingSL,
          reason: `Trailing stop ratcheted down to ₹${trailingSL} (+${profitR.toFixed(1)}R gained). Locking in profit.`,
        };
      }
    }
  }

  return {
    action: 'HOLD',
    reason: `Position within safe boundaries. Unrealized PnL: ₹${position.unrealizedPnl.toFixed(2)}.`,
  };
}
