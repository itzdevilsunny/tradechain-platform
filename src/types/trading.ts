export type NavPage = 
  | 'overview' 
  | 'markets' 
  | 'bot' 
  | 'strategies' 
  | 'backtesting' 
  | 'portfolio' 
  | 'risk' 
  | 'blockchain' 
  | 'transactions' 
  | 'blocks' 
  | 'verify' 
  | 'analytics' 
  | 'monitoring' 
  | 'audit' 
  | 'settings';

export type TradeSide = 'BUY' | 'SELL';
export type TradeStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED';
export type SignalState = 'BUY' | 'SELL' | 'NEUTRAL';

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
}

export interface TradeRecord {
  id: string; // e.g. TRD-00041
  asset: string; // e.g. BTC/USDT
  strategy: string; // e.g. EMA_RSI v1.2
  side: TradeSide;
  price: number;
  quantity: number;
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  stopLoss: number;
  takeProfit: number;
  status: TradeStatus;
  timestamp: string;
  txHash: string;
  blockNumber: number;
  blockHash: string;
  merkleRoot: string;
  digitalSignature: string;
  isVerified: boolean;
}

export interface ActivePosition {
  id: string;
  asset: string;
  side: TradeSide;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  totalValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  stopLoss: number;
  takeProfit: number;
  leverage?: number;
  openedAt: string;
}

export interface AISignalData {
  state: SignalState;
  asset: string;
  confidence: number; // e.g. 87%
  timestamp: string;
  strategyName: string;
  strategyVersion: string;
  strategyHash: string;
  indicators: {
    ema20: number;
    ema50: number;
    rsi: number;
    macdStatus: string;
    macdHist: number;
  };
  rationale: string;
}

export interface BlockHeader {
  blockNumber: number;
  timestamp: string;
  txCount: number;
  previousHash: string;
  merkleRoot: string;
  blockHash: string;
  nonce: number;
  status: 'VALID' | 'PENDING' | 'REJECTED';
  validator: string;
  trades: TradeRecord[];
}

export interface MerkleNode {
  id: string;
  hash: string;
  label: string;
  type: 'root' | 'internal' | 'leaf';
  children?: MerkleNode[];
  tradeId?: string;
}

export interface MerkleProof {
  tradeId: string;
  leafHash: string;
  proof: Array<{ hash: string; position: 'left' | 'right' }>;
  root: string;
  isValid: boolean;
}

export interface StrategyConfig {
  id: string;
  name: string;
  version: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  hash: string;
  winRate: number;
  backtestReturn: number;
  maxDrawdown: number;
  totalTrades: number;
  description: string;
  parameters: {
    emaShort: number;
    emaLong: number;
    rsiPeriod: number;
    rsiLower: number;
    rsiUpper: number;
    stopLossPct: number;
    takeProfitPct: number;
  };
}

export interface BacktestResult {
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgTradeTime: string;
  sharpeRatio: number;
  equityCurve: Array<{ date: string; value: number; drawdown: number }>;
  strategyHash: string;
  strategyVersion: string;
}

export interface RiskRule {
  id: string;
  name: string;
  key: string;
  currentValue: string;
  limitValue: string;
  enabled: boolean;
  status: 'SAFE' | 'WARNING' | 'VIOLATED';
  description: string;
}

export interface SystemService {
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  latencyMs: number;
  uptimePct: number;
  lastHeartbeat: string;
  details: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  event: 'TRADE_CREATED' | 'BLOCK_COMMITTED' | 'STRATEGY_UPDATED' | 'RISK_LIMIT_MODIFIED' | 'VERIFICATION_EXECUTED' | 'GOVERNANCE_ALERT';
  entity: string;
  hash: string;
  status: 'SUCCESS' | 'FAILED';
}
