import { 
  TradeRecord, 
  ActivePosition, 
  AISignalData, 
  BlockHeader, 
  StrategyConfig, 
  RiskRule, 
  SystemService, 
  AuditLogItem, 
  CandlestickData 
} from '../types/trading';

// Helper to format currency in Indian Rupee format (Lakhs / Thousands en-IN)
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount).replace('INR', '₹').trim();
};

// 1. Candlestick Data for NIFTY 50 Futures (Indian Stock Market)
export const INITIAL_CANDLESTICKS: CandlestickData[] = [
  { time: '09:15', open: 24720, high: 24760, low: 24710, close: 24745, volume: 14200, ema20: 24715, ema50: 24680 },
  { time: '09:30', open: 24745, high: 24790, low: 24740, close: 24780, volume: 18500, ema20: 24730, ema50: 24695 },
  { time: '09:45', open: 24780, high: 24810, low: 24775, close: 24800, volume: 22100, ema20: 24750, ema50: 24710 },
  { time: '10:00', open: 24800, high: 24835, low: 24795, close: 24825, volume: 28900, ema20: 24775, ema50: 24730 },
  { time: '10:15', open: 24825, high: 24860, low: 24815, close: 24840, volume: 31200, ema20: 24800, ema50: 24750 },
  { time: '10:30', open: 24840, high: 24875, low: 24830, close: 24860, volume: 27500, ema20: 24825, ema50: 24770 },
  { time: '10:45', open: 24860, high: 24890, low: 24845, close: 24875, volume: 35400, ema20: 24845, ema50: 24790 },
  { time: '11:00', open: 24875, high: 24910, low: 24865, close: 24895, volume: 41000, ema20: 24865, ema50: 24810 },
  { time: '11:15', open: 24895, high: 24930, low: 24885, close: 24915, volume: 38900, ema20: 24885, ema50: 24830 },
  { time: '11:30', open: 24915, high: 24940, low: 24900, close: 24910, volume: 24500, ema20: 24895, ema50: 24845 },
  { time: '11:45', open: 24910, high: 24925, low: 24890, close: 24895, volume: 21800, ema20: 24900, ema50: 24855 },
  { time: '12:00', open: 24895, high: 24945, low: 24890, close: 24935, volume: 46200, ema20: 24910, ema50: 24870 },
  { time: '12:15', open: 24935, high: 24965, low: 24925, close: 24955, volume: 51200, ema20: 24925, ema50: 24885 },
  { time: '12:30', open: 24955, high: 24980, low: 24940, close: 24970, volume: 49800, ema20: 24940, ema50: 24900 },
];

// 2. Verified Trade Records (Indian Market & Upstox/Groww/Zerodha Execution Model)
export const MOCK_TRADES: TradeRecord[] = [
  {
    id: 'TRD-IN-00104',
    asset: 'NIFTY 50 Futures',
    strategy: 'NIFTY EMA + RSI v1.2',
    side: 'BUY',
    price: 24850.40,
    quantity: 50, // 1 Lot NIFTY 50
    totalValue: 1242520.00,
    pnl: 3520.00,
    pnlPercentage: 1.42,
    stopLoss: 24750.00,
    takeProfit: 25000.00,
    status: 'ACTIVE',
    timestamp: '2026-09-26 10:15:30 IST',
    txHash: '0x8c7f91a92bc08912f4ca148803ef92e1a0b301c29e71f4b892a013d4fa44df2',
    blockNumber: 4281,
    blockHash: '00000ab92f8c14d97e3b901fc8129e7710bc44e1832049e7280a91f82c49b',
    merkleRoot: '9ab42ef71d5b128c704f1129bc4892c90a8e104192b719421de1994801ac',
    digitalSignature: '3045022100e4b859e2118fa39105b42a98f121d98a0c2834199180ab349f82180491c01',
    isVerified: true
  },
  {
    id: 'TRD-IN-00103',
    asset: 'BANK NIFTY Futures',
    strategy: 'Bank Nifty MACD v0.9',
    side: 'SELL',
    price: 53420.15,
    quantity: 15, // 1 Lot BANK NIFTY
    totalValue: 801302.25,
    pnl: 2697.75,
    pnlPercentage: 0.85,
    stopLoss: 53750.00,
    takeProfit: 52900.00,
    status: 'ACTIVE',
    timestamp: '2026-09-26 09:45:12 IST',
    txHash: '0x3d18e4bc0082f918e7b99c01192e48271018fa9c01192e8471b049a8b',
    blockNumber: 4280,
    blockHash: '00000f91e7c834a5d848102eb149204918e47b99c01192e8471b049a8b',
    merkleRoot: '71a42bc91000f129bc4892c90a8e104192b719421de1994801ac',
    digitalSignature: '304402201948ba10e429810f441c910283f121d98a0c2834199180ab349f82180491c02',
    isVerified: true
  },
  {
    id: 'TRD-IN-00102',
    asset: 'RELIANCE Eq (NSE)',
    strategy: 'Reliance VWAP v2.1',
    side: 'BUY',
    price: 2985.50,
    quantity: 100, // 100 Shares Reliance
    totalValue: 298550.00,
    pnl: 3550.00,
    pnlPercentage: 1.20,
    stopLoss: 2920.00,
    takeProfit: 3050.00,
    status: 'ACTIVE',
    timestamp: '2026-09-26 09:20:05 IST',
    txHash: '0x55ef01a89c31bde104a298f01b441c910283f121d98a0c2834199180ab',
    blockNumber: 4279,
    blockHash: '00000c41092e48271018fa9c01192e8471b049a8b000f91e7c834a5d8481',
    merkleRoot: '55c91000f129bc4892c90a8e104192b719421de1994801ac',
    digitalSignature: '3045022100a48b1192e48271018fa9c01192e8471b049a8b000f91e7c834a5d8481',
    isVerified: true
  },
  {
    id: 'TRD-IN-00101',
    asset: 'TCS Eq (NSE)',
    strategy: 'IT Sector Momentum',
    side: 'BUY',
    price: 4250.00,
    quantity: 50,
    totalValue: 212500.00,
    pnl: 1850.00,
    pnlPercentage: 0.87,
    stopLoss: 4180.00,
    takeProfit: 4350.00,
    status: 'CLOSED',
    timestamp: '2026-09-25 14:10:00 IST',
    txHash: '0x91f82c49b8c7f91a92bc08912f4ca148803ef92e1a0b301c29e71f4b892a013d',
    blockNumber: 4278,
    blockHash: '0000088192a013d4fa44df20000ab92f8c14d97e3b901fc8129e7710bc44',
    merkleRoot: '19421de1994801ac9ab42ef71d5b128c704f1129bc4892c90a8e104192b7',
    digitalSignature: '304402209148101f441c910283f121d98a0c2834199180ab349f82180491c03',
    isVerified: true
  }
];

// 3. Active Positions (NSE F&O / Equities)
export const MOCK_POSITIONS: ActivePosition[] = [
  {
    id: 'POS-NSE-01',
    asset: 'NIFTY 50 Futures',
    side: 'BUY',
    entryPrice: 24780.00,
    currentPrice: 24850.40,
    quantity: 50, // 1 Lot
    totalValue: 1242520.00,
    unrealizedPnl: 3520.00,
    unrealizedPnlPercent: 1.42,
    stopLoss: 24750.00,
    takeProfit: 25000.00,
    leverage: 5,
    openedAt: '09:30 IST (Upstox Gateway)'
  },
  {
    id: 'POS-NSE-02',
    asset: 'BANK NIFTY Futures',
    side: 'SELL',
    entryPrice: 53600.00,
    currentPrice: 53420.15,
    quantity: 15, // 1 Lot
    totalValue: 801302.25,
    unrealizedPnl: 2697.75,
    unrealizedPnlPercent: 0.85,
    stopLoss: 53750.00,
    takeProfit: 52900.00,
    leverage: 5,
    openedAt: '09:45 IST (Groww API)'
  },
  {
    id: 'POS-NSE-03',
    asset: 'RELIANCE Eq',
    side: 'BUY',
    entryPrice: 2950.00,
    currentPrice: 2985.50,
    quantity: 100,
    totalValue: 298550.00,
    unrealizedPnl: 3550.00,
    unrealizedPnlPercent: 1.20,
    stopLoss: 2920.00,
    takeProfit: 3050.00,
    leverage: 1,
    openedAt: '09:20 IST (Zerodha Kite)'
  }
];

// 4. AI Strategy Telemetry (Indian Intraday & Options Signal Engine)
export const MOCK_SIGNAL: AISignalData = {
  state: 'BUY',
  asset: 'NIFTY 50 Futures',
  confidence: 89,
  timestamp: '10:15:30 IST',
  strategyName: 'NIFTY EMA + RSI',
  strategyVersion: 'v1.2',
  strategyHash: '0x92ac71b04a871092eac431102948bbcca428',
  indicators: {
    ema20: 24800.00,
    ema50: 24750.00,
    rsi: 58.6,
    macdStatus: 'Bullish Crossover (+42.50)',
    macdHist: 18.4
  },
  rationale: 'NIFTY 50 EMA20 crossed above EMA50 during European market opening setup while RSI held at 58.6 with heavy institutional buying in HDFC Bank & Reliance. SEBI peak margin check cleared via Upstox API.'
};

// 5. Blockchain Blocks (Proof of Authority Consortium Ledger)
export const MOCK_BLOCKS: BlockHeader[] = [
  {
    blockNumber: 4281,
    timestamp: '2026-09-26 10:15:30 IST',
    txCount: 24,
    previousHash: '00000f91e7c834a5d848102eb149204918e47b99c01192e8471b049a8b',
    merkleRoot: '9ab42ef71d5b128c704f1129bc4892c90a8e104192b719421de1994801ac',
    blockHash: '00000ab92f8c14d97e3b901fc8129e7710bc44e1832049e7280a91f82c49b',
    nonce: 483921,
    status: 'VALID',
    validator: 'NSE-Node-Alpha (Consortium Node)',
    trades: MOCK_TRADES.slice(0, 2)
  },
  {
    blockNumber: 4280,
    timestamp: '2026-09-26 09:45:12 IST',
    txCount: 19,
    previousHash: '00000c41092e48271018fa9c01192e8471b049a8b000f91e7c834a5d8481',
    merkleRoot: '71a42bc91000f129bc4892c90a8e104192b719421de1994801ac',
    blockHash: '00000f91e7c834a5d848102eb149204918e47b99c01192e8471b049a8b',
    nonce: 194820,
    status: 'VALID',
    validator: 'BSE-Node-Beta (Consortium Node)',
    trades: [MOCK_TRADES[1]]
  },
  {
    blockNumber: 4279,
    timestamp: '2026-09-26 09:20:05 IST',
    txCount: 28,
    previousHash: '0000088192a013d4fa44df20000ab92f8c14d97e3b901fc8129e7710bc44',
    merkleRoot: '55c91000f129bc4892c90a8e104192b719421de1994801ac',
    blockHash: '00000c41092e48271018fa9c01192e8471b049a8b000f91e7c834a5d8481',
    nonce: 928410,
    status: 'VALID',
    validator: 'Mudrex-Node-Gamma (Consortium Node)',
    trades: [MOCK_TRADES[2]]
  },
  {
    blockNumber: 4278,
    timestamp: '2026-09-25 14:10:00 IST',
    txCount: 31,
    previousHash: '0000010928a013d4fa44df20000ab92f8c14d97e3b901fc8129e7710bc44',
    merkleRoot: '19421de1994801ac9ab42ef71d5b128c704f1129bc4892c90a8e104192b7',
    blockHash: '0000088192a013d4fa44df20000ab92f8c14d97e3b901fc8129e7710bc44',
    nonce: 382910,
    status: 'VALID',
    validator: 'NSE-Node-Alpha (Consortium Node)',
    trades: [MOCK_TRADES[3]]
  }
];

// 6. Indian Market Strategy Profiles
export const MOCK_STRATEGIES: StrategyConfig[] = [
  {
    id: 'STRAT-NSE-01',
    name: 'NIFTY EMA + RSI Momentum',
    version: 'v1.2.0',
    status: 'ACTIVE',
    hash: '0x92ac71b04a871092eac431102948bbcca428',
    winRate: 71.4,
    backtestReturn: 22.85,
    maxDrawdown: 6.42,
    totalTrades: 168,
    description: 'Intraday trend-following on NIFTY 50 & Bank NIFTY futures using 20/50 EMA cross with 14-period RSI filter.',
    parameters: {
      emaShort: 20,
      emaLong: 50,
      rsiPeriod: 14,
      rsiLower: 45,
      rsiUpper: 65,
      stopLossPct: 1.0,
      takeProfitPct: 2.5
    }
  },
  {
    id: 'STRAT-NSE-02',
    name: 'Bank Nifty MACD Breakout',
    version: 'v0.9.4',
    status: 'ACTIVE',
    hash: '0x1b44d21098ef42710a8b9e01192e48271018',
    winRate: 64.2,
    backtestReturn: 18.40,
    maxDrawdown: 8.20,
    totalTrades: 112,
    description: 'Exploits high-beta volatility momentum in Bank Nifty index options & futures on 15m MACD zero-line breakouts.',
    parameters: {
      emaShort: 12,
      emaLong: 26,
      rsiPeriod: 14,
      rsiLower: 40,
      rsiUpper: 70,
      stopLossPct: 1.5,
      takeProfitPct: 3.5
    }
  },
  {
    id: 'STRAT-NSE-03',
    name: 'Reliance VWAP Mean Reversion',
    version: 'v2.1.0',
    status: 'ACTIVE',
    hash: '0x71a42bc91000f129bc4892c90a8e104192b7',
    winRate: 74.8,
    backtestReturn: 26.50,
    maxDrawdown: 5.10,
    totalTrades: 245,
    description: 'Statistical arbitrage on heavy-weight NIFTY stocks (Reliance, HDFC Bank, TCS, ICICI Bank) returning to 1-minute VWAP bands.',
    parameters: {
      emaShort: 20,
      emaLong: 20,
      rsiPeriod: 14,
      rsiLower: 30,
      rsiUpper: 70,
      stopLossPct: 0.8,
      takeProfitPct: 2.0
    }
  }
];

// 7. SEBI Risk Guardrails & Exchange Rules
export const MOCK_RISK_RULES: RiskRule[] = [
  {
    id: 'RULE-IN-01',
    name: 'SEBI Maximum Daily Loss Cap',
    key: 'max_daily_loss',
    currentValue: '₹0.00',
    limitValue: '₹5,000.00 (5%)',
    enabled: true,
    status: 'SAFE',
    description: 'Automated emergency circuit breaker halting all bot execution if intraday loss reaches ₹5,000.'
  },
  {
    id: 'RULE-IN-02',
    name: 'Single Position Allocation Cap',
    key: 'max_position_size',
    currentValue: '₹24,850.40',
    limitValue: '₹25,000.00 (25%)',
    enabled: true,
    status: 'SAFE',
    description: 'Caps individual margin commitment per F&O contract or equity symbol to prevent concentration.'
  },
  {
    id: 'RULE-IN-03',
    name: 'NSE Exchange SL Order Lock',
    key: 'stop_loss_pct',
    currentValue: '1.0% Fixed',
    limitValue: '1.0% Stop Loss',
    enabled: true,
    status: 'SAFE',
    description: 'Mandatory automated Stop Loss order placing on Upstox / Groww / Zerodha broker gateways.'
  },
  {
    id: 'RULE-IN-04',
    name: 'Trailing Profit Lock-in Ladder',
    key: 'take_profit_pct',
    currentValue: '2.5%',
    limitValue: '2.5% Target / 0.5% Trail',
    enabled: true,
    status: 'SAFE',
    description: 'Automatically trails peak price once target is achieved to protect realized intraday profits.'
  },
  {
    id: 'RULE-IN-05',
    name: 'Max Concurrent Open Positions',
    key: 'max_open_positions',
    currentValue: '3 Active',
    limitValue: '3 Contracts Max',
    enabled: true,
    status: 'SAFE',
    description: 'Limits simultaneous exposure across NIFTY, Bank NIFTY, and Equity derivatives.'
  }
];

// 8. Microservices & Broker Gateways
export const MOCK_SYSTEM_SERVICES: SystemService[] = [
  {
    name: 'NSE & BSE Live Data Feed',
    status: 'OPERATIONAL',
    latencyMs: 12,
    uptimePct: 99.99,
    lastHeartbeat: '1 sec ago',
    details: 'Upstox & Groww Tick Stream synchronized (NSE F&O)'
  },
  {
    name: 'Algorithmic Execution Engine',
    status: 'OPERATIONAL',
    latencyMs: 6,
    uptimePct: 100.0,
    lastHeartbeat: '1 sec ago',
    details: 'FastAPI Algo Engine connected to Zerodha Kite & Upstox APIs'
  },
  {
    name: 'SEBI Pre-Trade Risk Engine',
    status: 'OPERATIONAL',
    latencyMs: 3,
    uptimePct: 100.0,
    lastHeartbeat: '1 sec ago',
    details: 'Peak margin check & intraday loss breaker ACTIVE'
  },
  {
    name: 'Consensus Blockchain Validator Node',
    status: 'OPERATIONAL',
    latencyMs: 18,
    uptimePct: 99.98,
    lastHeartbeat: '12 sec ago',
    details: 'PoA Consensus Block #4281 finalized with 14 attestations'
  },
  {
    name: 'Supabase PostgreSQL Ledger DB',
    status: 'OPERATIONAL',
    latencyMs: 14,
    uptimePct: 99.95,
    lastHeartbeat: '2 sec ago',
    details: 'Primary database active at trrdxwefrnjlzkrrnjdp.supabase.co'
  },
  {
    name: 'Broker WebSocket Gateway',
    status: 'OPERATIONAL',
    latencyMs: 9,
    uptimePct: 99.99,
    lastHeartbeat: 'Sub-second',
    details: 'Broadcasting live ticks across 248 active trader sessions'
  }
];

// 9. Enterprise Audit Log Trail
export const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'AUD-IN-901',
    timestamp: '2026-09-26 10:15:30',
    actor: 'Algo Engine (Upstox API)',
    event: 'TRADE_CREATED',
    entity: 'TRD-IN-00104 (NIFTY 50 Futures)',
    hash: '8c7f91a92bc08912f4ca148803ef92e1',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-IN-902',
    timestamp: '2026-09-26 10:15:31',
    actor: 'Blockchain Node',
    event: 'BLOCK_COMMITTED',
    entity: 'Consensus Block #4281',
    hash: '00000ab92f8c14d97e3b901fc8129e77',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-IN-903',
    timestamp: '2026-09-26 10:20:04',
    actor: 'Sunny Prasad (Admin)',
    event: 'STRATEGY_UPDATED',
    entity: 'NIFTY EMA + RSI v1.2',
    hash: '92ac71b04a871092eac431102948bbcc',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-IN-904',
    timestamp: '2026-09-26 10:30:12',
    actor: 'SEBI Risk Engine',
    event: 'RISK_LIMIT_MODIFIED',
    entity: 'Single Position Cap Limit',
    hash: 'e48271018fa9c01192e8471b049a8b00',
    status: 'SUCCESS'
  },
  {
    id: 'AUD-IN-905',
    timestamp: '2026-09-26 10:40:00',
    actor: 'External Auditor',
    event: 'VERIFICATION_EXECUTED',
    entity: 'Merkle Proof TRD-IN-00104',
    hash: '9ab42ef71d5b128c704f1129bc4892c9',
    status: 'SUCCESS'
  }
];
