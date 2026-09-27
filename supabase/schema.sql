-- ============================================================================
-- TradeChain Institutional Platform — Complete Supabase PostgreSQL Schema
-- Platform: Indian Equities / F&O (NSE, BSE) & Cryptographic Audit Ledger
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. POSITIONS & ACTIVE MARGIN EXPOSURE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.positions (
    id VARCHAR(64) PRIMARY KEY,
    asset VARCHAR(64) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    entry_price NUMERIC(15, 2) NOT NULL,
    current_price NUMERIC(15, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_value NUMERIC(15, 2) NOT NULL,
    unrealized_pnl NUMERIC(15, 2) NOT NULL DEFAULT 0,
    unrealized_pnl_percent NUMERIC(8, 2) NOT NULL DEFAULT 0,
    stop_loss NUMERIC(15, 2) NOT NULL,
    take_profit NUMERIC(15, 2) NOT NULL,
    leverage INTEGER DEFAULT 1,
    broker VARCHAR(64) DEFAULT 'Upstox Pro API',
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. TRADE EXECUTION & CRYPTOGRAPHIC LEDGER
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trades (
    id VARCHAR(64) PRIMARY KEY,
    asset VARCHAR(64) NOT NULL,
    strategy VARCHAR(128) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    price NUMERIC(15, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_value NUMERIC(15, 2) NOT NULL,
    pnl NUMERIC(15, 2) NOT NULL DEFAULT 0,
    pnl_percentage NUMERIC(8, 2) NOT NULL DEFAULT 0,
    stop_loss NUMERIC(15, 2) NOT NULL,
    take_profit NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'CLOSED', 'CANCELLED')),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tx_hash VARCHAR(128) NOT NULL UNIQUE,
    block_number BIGINT NOT NULL,
    block_hash VARCHAR(128) NOT NULL,
    merkle_root VARCHAR(128) NOT NULL,
    digital_signature VARCHAR(256) NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trades_asset ON public.trades(asset);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_block_number ON public.trades(block_number);
CREATE INDEX IF NOT EXISTS idx_trades_tx_hash ON public.trades(tx_hash);

-- ============================================================================
-- 3. PROOF-OF-AUTHORITY (PoA) BLOCKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blocks (
    block_number BIGINT PRIMARY KEY,
    block_hash VARCHAR(128) NOT NULL UNIQUE,
    previous_hash VARCHAR(128) NOT NULL,
    merkle_root VARCHAR(128) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tx_count INTEGER NOT NULL DEFAULT 0,
    validator VARCHAR(128) NOT NULL,
    nonce BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL CHECK (status IN ('VALID', 'PENDING', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocks_hash ON public.blocks(block_hash);

-- ============================================================================
-- 4. STRATEGY LAB & PARAMETER INVARIANTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.strategies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    version VARCHAR(32) NOT NULL DEFAULT 'v1.0.0',
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'PAUSED', 'ARCHIVED')),
    hash VARCHAR(128) NOT NULL,
    win_rate NUMERIC(6, 2) NOT NULL DEFAULT 0,
    backtest_return NUMERIC(6, 2) NOT NULL DEFAULT 0,
    max_drawdown NUMERIC(6, 2) NOT NULL DEFAULT 0,
    total_trades INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. QUANTITATIVE BACKTEST SESSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.backtests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_id VARCHAR(64) REFERENCES public.strategies(id) ON DELETE CASCADE,
    strategy_name VARCHAR(128) NOT NULL,
    asset VARCHAR(64) NOT NULL,
    timeframe VARCHAR(20) NOT NULL DEFAULT '15m',
    total_return NUMERIC(8, 2) NOT NULL,
    win_rate NUMERIC(6, 2) NOT NULL,
    max_drawdown NUMERIC(6, 2) NOT NULL,
    profit_factor NUMERIC(6, 2) NOT NULL,
    sharpe_ratio NUMERIC(6, 2) NOT NULL,
    equity_curve JSONB DEFAULT '[]'::jsonb,
    strategy_hash VARCHAR(128) NOT NULL,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. SEBI RISK MANAGEMENT RULES & METRICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.risk_rules (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    key VARCHAR(64) NOT NULL UNIQUE,
    current_value VARCHAR(64) NOT NULL,
    limit_value VARCHAR(64) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SAFE', 'WARNING', 'VIOLATED')),
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. APPEND-ONLY ENTERPRISE AUDIT TRAIL
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor VARCHAR(128) NOT NULL,
    event VARCHAR(64) NOT NULL CHECK (event IN (
        'TRADE_CREATED',
        'BLOCK_COMMITTED',
        'STRATEGY_UPDATED',
        'RISK_LIMIT_MODIFIED',
        'VERIFICATION_EXECUTED',
        'GOVERNANCE_ALERT'
    )),
    entity VARCHAR(256) NOT NULL,
    hash VARCHAR(128) NOT NULL,
    prev_hash VARCHAR(128),
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON public.audit_logs(event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ============================================================================
-- 8. AI COPILOT SIGNALS & TELEMETRY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state VARCHAR(10) NOT NULL CHECK (state IN ('BUY', 'SELL', 'NEUTRAL')),
    asset VARCHAR(64) NOT NULL,
    confidence NUMERIC(5, 2) NOT NULL,
    strategy_name VARCHAR(128) NOT NULL,
    strategy_version VARCHAR(32) NOT NULL,
    strategy_hash VARCHAR(128) NOT NULL,
    indicators JSONB NOT NULL DEFAULT '{}'::jsonb,
    rationale TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. INTRADAY CANDLESTICK DATA (NSE 15M / 1D)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.market_candles (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(64) NOT NULL,
    timeframe VARCHAR(10) NOT NULL DEFAULT '15m',
    time_label VARCHAR(32) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    open NUMERIC(15, 2) NOT NULL,
    high NUMERIC(15, 2) NOT NULL,
    low NUMERIC(15, 2) NOT NULL,
    close NUMERIC(15, 2) NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    ema20 NUMERIC(15, 2),
    ema50 NUMERIC(15, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (symbol, timeframe, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_market_candles_sym_time ON public.market_candles(symbol, timeframe, timestamp DESC);

-- ============================================================================
-- 10. CONSORTIUM VALIDATOR NODES & SYSTEM SERVICES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.validator_nodes (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    location VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('PRIMARY', 'CONSORTIUM', 'AUDIT')),
    status VARCHAR(32) NOT NULL DEFAULT 'ONLINE',
    latency_ms NUMERIC(6, 2) NOT NULL DEFAULT 1.0,
    public_key VARCHAR(128) NOT NULL,
    last_block_signed BIGINT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_services (
    name VARCHAR(128) PRIMARY KEY,
    status VARCHAR(32) NOT NULL CHECK (status IN ('OPERATIONAL', 'DEGRADED', 'OUTAGE')),
    latency_ms NUMERIC(6, 2) NOT NULL,
    uptime_pct NUMERIC(6, 2) NOT NULL,
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details TEXT
);

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES (Idempotent & Safe to Re-run)
-- ============================================================================
ALTER TABLE IF EXISTS public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.backtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.risk_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.market_candles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.validator_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_services ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies to prevent "policy already exists" (42710) errors
DROP POLICY IF EXISTS "tradechain_positions_policy" ON public.positions;
DROP POLICY IF EXISTS "Public read positions" ON public.positions;
DROP POLICY IF EXISTS "Public read access for positions" ON public.positions;
DROP POLICY IF EXISTS "Anon manage positions" ON public.positions;
DROP POLICY IF EXISTS "Anon insert on positions" ON public.positions;
DROP POLICY IF EXISTS "Service role full access on positions" ON public.positions;

DROP POLICY IF EXISTS "tradechain_trades_policy" ON public.trades;
DROP POLICY IF EXISTS "Public read trades" ON public.trades;
DROP POLICY IF EXISTS "Public read access for trades" ON public.trades;
DROP POLICY IF EXISTS "Anon insert trades" ON public.trades;
DROP POLICY IF EXISTS "Anon insert on trades" ON public.trades;
DROP POLICY IF EXISTS "Service role full access on trades" ON public.trades;

DROP POLICY IF EXISTS "tradechain_blocks_policy" ON public.blocks;
DROP POLICY IF EXISTS "Public read blocks" ON public.blocks;
DROP POLICY IF EXISTS "Public read access for blocks" ON public.blocks;
DROP POLICY IF EXISTS "Service role full access on blocks" ON public.blocks;

DROP POLICY IF EXISTS "tradechain_strategies_policy" ON public.strategies;
DROP POLICY IF EXISTS "Public read strategies" ON public.strategies;
DROP POLICY IF EXISTS "Public read access for strategies" ON public.strategies;
DROP POLICY IF EXISTS "Service role full access on strategies" ON public.strategies;

DROP POLICY IF EXISTS "tradechain_backtests_policy" ON public.backtests;

DROP POLICY IF EXISTS "tradechain_risk_rules_policy" ON public.risk_rules;
DROP POLICY IF EXISTS "Public read risk_rules" ON public.risk_rules;
DROP POLICY IF EXISTS "Public read access for risk_rules" ON public.risk_rules;

DROP POLICY IF EXISTS "tradechain_audit_logs_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "Public read audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public read access for audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Anon insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Anon insert on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role full access on audit_logs" ON public.audit_logs;

DROP POLICY IF EXISTS "tradechain_ai_signals_policy" ON public.ai_signals;
DROP POLICY IF EXISTS "Public read ai_signals" ON public.ai_signals;
DROP POLICY IF EXISTS "Public read access for ai_signals" ON public.ai_signals;

DROP POLICY IF EXISTS "tradechain_candles_policy" ON public.market_candles;
DROP POLICY IF EXISTS "Public read market_candles" ON public.market_candles;
DROP POLICY IF EXISTS "Public read access for market_candles" ON public.market_candles;

DROP POLICY IF EXISTS "tradechain_validators_policy" ON public.validator_nodes;
DROP POLICY IF EXISTS "Public read validator_nodes" ON public.validator_nodes;
DROP POLICY IF EXISTS "Public read access for validator_nodes" ON public.validator_nodes;

DROP POLICY IF EXISTS "tradechain_services_policy" ON public.system_services;
DROP POLICY IF EXISTS "Public read system_services" ON public.system_services;
DROP POLICY IF EXISTS "Public read access for system_services" ON public.system_services;

-- Create clean universal read/write policies for the frontend web application (anon & authenticated)
CREATE POLICY "tradechain_positions_policy" ON public.positions FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "tradechain_trades_policy" ON public.trades FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "tradechain_blocks_policy" ON public.blocks FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "tradechain_strategies_policy" ON public.strategies FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "tradechain_backtests_policy" ON public.backtests FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "tradechain_risk_rules_policy" ON public.risk_rules FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "tradechain_audit_logs_policy" ON public.audit_logs FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "tradechain_ai_signals_policy" ON public.ai_signals FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "tradechain_candles_policy" ON public.market_candles FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "tradechain_validators_policy" ON public.validator_nodes FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);
CREATE POLICY "tradechain_services_policy" ON public.system_services FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 12. ENABLE SUPABASE REALTIME REPLICATION (Safe Against Duplicates)
-- ============================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.positions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.blocks;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_signals;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

-- ============================================================================
-- 13. SEED INITIAL INSTITUTIONAL DATA
-- ============================================================================

-- Active Positions
INSERT INTO public.positions (id, asset, side, entry_price, current_price, quantity, total_value, unrealized_pnl, unrealized_pnl_percent, stop_loss, take_profit, leverage, broker, opened_at)
VALUES 
('POS-IN-001', 'NIFTY 24800 CE', 'BUY', 142.50, 168.20, 100, 16820.00, 2570.00, 18.04, 115.00, 195.00, 1, 'Upstox Pro API', NOW() - INTERVAL '45 minutes'),
('POS-IN-002', 'BANKNIFTY 51500 PE', 'BUY', 285.00, 312.40, 60, 18744.00, 1644.00, 9.61, 240.00, 360.00, 1, 'Groww Trade API', NOW() - INTERVAL '1 hour 20 minutes')
ON CONFLICT (id) DO UPDATE SET
    current_price = EXCLUDED.current_price,
    unrealized_pnl = EXCLUDED.unrealized_pnl;

-- Block Headers
INSERT INTO public.blocks (block_number, block_hash, previous_hash, merkle_root, timestamp, tx_count, validator, nonce, status)
VALUES
(4282, '0x8f2a391eb4d02a019487cbf9281a0293847291a8', '0x17d9a3b84f29104c81726a938471029384719283', '0x9924fa82d1c7a4b8293740192837491029384729', NOW() - INTERVAL '5 minutes', 24, 'TradeChain NSE Node #1', 104928, 'VALID'),
(4281, '0x17d9a3b84f29104c81726a938471029384719283', '0xfa3910c84b291029384719283740192837491029', '0x8374619283749102938471029384729102938471', NOW() - INTERVAL '15 minutes', 32, 'BSE Clearing Attester #1', 98472, 'VALID')
ON CONFLICT (block_number) DO NOTHING;

-- Trade Records
INSERT INTO public.trades (id, asset, strategy, side, price, quantity, total_value, pnl, pnl_percentage, stop_loss, take_profit, status, timestamp, tx_hash, block_number, block_hash, merkle_root, digital_signature, is_verified)
VALUES
('TRD-IN-00104', 'NIFTY 24800 CE', 'VWAP Mean Reversion F&O', 'BUY', 142.50, 100, 14250.00, 2570.00, 18.04, 115.00, 195.00, 'ACTIVE', NOW() - INTERVAL '45 minutes', '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', 4282, '0x8f2a391eb4d02a019487cbf9281a0293847291a8', '0x9924fa82d1c7a4b8293740192837491029384729', '0x30450221008d3f66847291a0192837491029384729102938471029384710293847102938', TRUE),
('TRD-IN-00103', 'BANKNIFTY 51500 PE', 'EMA Trend Rider v2.1', 'BUY', 285.00, 60, 17100.00, 1644.00, 9.61, 240.00, 360.00, 'ACTIVE', NOW() - INTERVAL '1 hour 20 minutes', '0x4a91b2e83c1104cd8372b91fab2e83c1104cd8372b91fab2e83c1104cd8372b9', 4282, '0x8f2a391eb4d02a019487cbf9281a0293847291a8', '0x9924fa82d1c7a4b8293740192837491029384729', '0x304402207a9b8c1104cd8372b91fab2e83c1104cd8372b91fab2e83c1104cd8372b91fab', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Quantitative Strategies
INSERT INTO public.strategies (id, name, version, status, hash, win_rate, backtest_return, max_drawdown, total_trades, description, parameters)
VALUES
('STRAT-001', 'NIFTY VWAP Pullback', 'v2.4.1', 'ACTIVE', '0xa1f84b2910293847192837491029384710293847102938471029384710293847', 74.2, 31.8, 4.8, 420, 'Volume-weighted average price pullback algorithm tuned for Nifty options intraday scalping.', '{"emaShort": 20, "emaLong": 50, "rsiPeriod": 14, "rsiLower": 30, "rsiUpper": 70, "stopLossPct": 1.5, "takeProfitPct": 3.5}'::jsonb),
('STRAT-002', 'BankNifty 15M Breakout', 'v1.8.0', 'ACTIVE', '0xb4c9102938471928374910293847102938471029384710293847102938471029', 68.5, 27.4, 6.2, 310, 'High-momentum opening range breakout strategy capturing institutional morning flows.', '{"emaShort": 15, "emaLong": 45, "rsiPeriod": 14, "rsiLower": 35, "rsiUpper": 65, "stopLossPct": 2.0, "takeProfitPct": 4.5}'::jsonb),
('STRAT-003', 'Gamma Scalper Ultra', 'v3.0.2', 'PAUSED', '0xc982102938471928374910293847102938471029384710293847102938471029', 71.0, 22.9, 5.1, 185, 'Delta-neutral options gamma scalping engine with automated volatility stops.', '{"emaShort": 9, "emaLong": 21, "rsiPeriod": 14, "rsiLower": 28, "rsiUpper": 72, "stopLossPct": 1.2, "takeProfitPct": 2.8}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Risk Rules
INSERT INTO public.risk_rules (id, name, key, current_value, limit_value, enabled, status, description)
VALUES
('RISK-01', 'Max Portfolio Drawdown', 'max_drawdown', '3.8%', '5.0%', TRUE, 'SAFE', 'Automatic kill-switch triggers if daily equity drawdown exceeds 5%'),
('RISK-02', 'Single Position Margin Cap', 'position_cap', '₹35,564', '₹50,000', TRUE, 'SAFE', 'Limits maximum capital allocated to any single F&O contract'),
('RISK-03', 'Leverage Ceiling', 'max_leverage', '1.0x', '3.0x', TRUE, 'SAFE', 'Maximum intraday margin multiplier allowed by algorithmic controller'),
('RISK-04', 'Daily Order Count Cap', 'daily_order_cap', '38 orders', '100 orders', TRUE, 'SAFE', 'SEBI algorithmic order-to-trade ratio safeguard')
ON CONFLICT (id) DO NOTHING;

-- Audit Logs
INSERT INTO public.audit_logs (id, timestamp, actor, event, entity, hash, prev_hash, status, details)
VALUES
('AUD-001', NOW() - INTERVAL '15 minutes', 'Algo Engine (Upstox API)', 'TRADE_CREATED', 'TRD-IN-00104 (NIFTY 24800 CE)', '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069', '0x17d9a3b84f29104c81726a938471029384719283', 'SUCCESS', '{"broker": "Upstox Pro API", "qty": 100, "price": 142.50}'::jsonb),
('AUD-002', NOW() - INTERVAL '10 minutes', 'Consortium PoA Node #1', 'BLOCK_COMMITTED', 'Consensus Block #4282', '0x8f2a391eb4d02a019487cbf9281a0293847291a8', '0x17d9a3b84f29104c81726a938471029384719283', 'SUCCESS', '{"txCount": 24, "validator": "TradeChain NSE Node #1"}'::jsonb),
('AUD-003', NOW() - INTERVAL '5 minutes', 'SEBI Audit Node #3', 'VERIFICATION_EXECUTED', 'Merkle Proof TRD-IN-00104', '0x9924fa82d1c7a4b8293740192837491029384729', '0x8f2a391eb4d02a019487cbf9281a0293847291a8', 'SUCCESS', '{"status": "14/14 Quorum Approved", "latency": "1.2ms"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Validator Nodes (14 Consortium Members)
INSERT INTO public.validator_nodes (id, name, location, role, status, latency_ms, public_key, last_block_signed)
VALUES
('NODE-01', 'NSE Primary Gateway Node #1', 'Mumbai (BKC DC)', 'PRIMARY', 'ONLINE', 0.8, '0x02c4b...89f1a', 4282),
('NODE-02', 'BSE High-Frequency Clearing #1', 'Mumbai (Fort)', 'CONSORTIUM', 'ONLINE', 1.1, '0x03a8d...91e4b', 4282),
('NODE-03', 'SEBI Regulatory Audit Node', 'New Delhi (HQ)', 'AUDIT', 'ONLINE', 2.4, '0x0219c...fa27c', 4281),
('NODE-04', 'Upstox Pro Validator #4', 'Bengaluru DC', 'CONSORTIUM', 'ONLINE', 1.4, '0x0482e...11dc3', 4282),
('NODE-05', 'Groww Institutional Attester', 'Bengaluru DC', 'CONSORTIUM', 'ONLINE', 1.3, '0x03ff4...66a9b', 4282),
('NODE-06', 'Zerodha FIX Protocol Node', 'Bengaluru DC', 'CONSORTIUM', 'ONLINE', 1.5, '0x0289b...3371f', 4282),
('NODE-07', 'HDFC Securities Node #2', 'Mumbai Central', 'CONSORTIUM', 'ONLINE', 0.9, '0x0356c...4490a', 4281),
('NODE-08', 'ICICI Direct Clearing Attester', 'Hyderabad DC', 'CONSORTIUM', 'ONLINE', 1.8, '0x0277f...8821d', 4282),
('NODE-09', 'TradeChain Standby Node Alpha', 'Chennai DC', 'PRIMARY', 'ONLINE', 1.9, '0x0311a...9984e', 4282),
('NODE-10', 'Kotak Institutional Gateway', 'Mumbai (BKC)', 'CONSORTIUM', 'ONLINE', 1.0, '0x0421d...5502b', 4282),
('NODE-11', 'Axis Capital Validation Engine', 'Navi Mumbai', 'CONSORTIUM', 'ONLINE', 1.2, '0x0298e...7714a', 4281),
('NODE-12', 'MCX-SX Clearing Relay', 'Mumbai', 'CONSORTIUM', 'ONLINE', 1.1, '0x0381b...2299c', 4282),
('NODE-13', 'CDSL Depository Sync Node', 'Mumbai', 'AUDIT', 'ONLINE', 1.6, '0x0255a...0018f', 4282),
('NODE-14', 'NSDL Settlement Audit Attester', 'Lower Parel', 'AUDIT', 'ONLINE', 1.4, '0x0399f...6641e', 4282)
ON CONFLICT (id) DO NOTHING;

-- System Services
INSERT INTO public.system_services (name, status, latency_ms, uptime_pct, last_heartbeat, details)
VALUES
('NSE FIX 4.4 Engine', 'OPERATIONAL', 1.2, 99.98, NOW(), 'Direct leased-line co-location gateway active at BKC Data Center'),
('SHA-256 Merkle Invariant Engine', 'OPERATIONAL', 0.4, 100.0, NOW(), 'Zero hash collision delta across 4,282 verified blocks'),
('Supabase PostgreSQL Cluster', 'OPERATIONAL', 24.0, 99.99, NOW(), 'Primary database active at trrdxwefrnjlzkrrnjdp.supabase.co'),
('ZK-PLONK Prover Service', 'OPERATIONAL', 1.8, 99.95, NOW(), 'Groth16 proving circuit active over BN254 elliptic curve'),
('Upstox & Groww WebSocket Streams', 'OPERATIONAL', 3.6, 99.92, NOW(), 'Tick-level live order book & margin telemetry stream')
ON CONFLICT (name) DO UPDATE SET
    status = EXCLUDED.status,
    last_heartbeat = NOW();
