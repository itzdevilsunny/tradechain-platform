import { createClient } from '@supabase/supabase-js';
import { ActivePosition, TradeRecord, BlockHeader, StrategyConfig, AuditLogItem } from '../types/trading';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://trrdxwefrnjlzkrrnjdp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VKRd5g5ZvQoK8yI2Mq4Clg_YSo5bkFV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// 1. CONNECTION HEALTH CHECK
// ============================================================================
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('trades').select('id', { head: true });
    return !error;
  } catch (err) {
    console.warn('Supabase connection falling back to client-side state engine.', err);
    return false;
  }
}

// ============================================================================
// 2. POSITIONS (CRUD & REALTIME)
// ============================================================================
export async function fetchPositionsFromDB(): Promise<ActivePosition[] | null> {
  try {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .order('opened_at', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((row: any): ActivePosition => ({
      id: row.id,
      asset: row.asset,
      side: row.side,
      entryPrice: Number(row.entry_price),
      currentPrice: Number(row.current_price),
      quantity: Number(row.quantity),
      totalValue: Number(row.total_value),
      unrealizedPnl: Number(row.unrealized_pnl),
      unrealizedPnlPercent: Number(row.unrealized_pnl_percent),
      stopLoss: Number(row.stop_loss),
      takeProfit: Number(row.take_profit),
      leverage: row.leverage ? Number(row.leverage) : 1,
      openedAt: row.opened_at
    }));
  } catch (err) {
    console.warn('Failed to fetch positions from Supabase:', err);
    return null;
  }
}

export async function savePositionToDB(position: ActivePosition): Promise<void> {
  try {
    await supabase.from('positions').upsert({
      id: position.id,
      asset: position.asset,
      side: position.side,
      entry_price: position.entryPrice,
      current_price: position.currentPrice,
      quantity: position.quantity,
      total_value: position.totalValue,
      unrealized_pnl: position.unrealizedPnl,
      unrealized_pnl_percent: position.unrealizedPnlPercent,
      stop_loss: position.stopLoss,
      take_profit: position.takeProfit,
      leverage: position.leverage || 1,
      opened_at: position.openedAt,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error saving position to Supabase:', err);
  }
}

export async function deletePositionFromDB(positionId: string): Promise<void> {
  try {
    await supabase.from('positions').delete().eq('id', positionId);
  } catch (err) {
    console.warn('Error deleting position from Supabase:', err);
  }
}

// ============================================================================
// 3. TRADES (IMMUTABLE AUDITED LEDGER)
// ============================================================================
export async function fetchTradesFromDB(): Promise<TradeRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((row: any): TradeRecord => ({
      id: row.id,
      asset: row.asset,
      strategy: row.strategy,
      side: row.side,
      price: Number(row.price),
      quantity: Number(row.quantity),
      totalValue: Number(row.total_value),
      pnl: Number(row.pnl),
      pnlPercentage: Number(row.pnl_percentage),
      stopLoss: Number(row.stop_loss),
      takeProfit: Number(row.take_profit),
      status: row.status,
      timestamp: row.timestamp,
      txHash: row.tx_hash,
      blockNumber: Number(row.block_number),
      blockHash: row.block_hash,
      merkleRoot: row.merkle_root,
      digitalSignature: row.digital_signature,
      isVerified: Boolean(row.is_verified)
    }));
  } catch (err) {
    console.warn('Failed to fetch trades from Supabase:', err);
    return null;
  }
}

export async function saveTradeToDB(trade: TradeRecord): Promise<void> {
  try {
    await supabase.from('trades').insert({
      id: trade.id,
      asset: trade.asset,
      strategy: trade.strategy,
      side: trade.side,
      price: trade.price,
      quantity: trade.quantity,
      total_value: trade.totalValue,
      pnl: trade.pnl,
      pnl_percentage: trade.pnlPercentage,
      stop_loss: trade.stopLoss,
      take_profit: trade.takeProfit,
      status: trade.status,
      timestamp: trade.timestamp,
      tx_hash: trade.txHash,
      block_number: trade.blockNumber,
      block_hash: trade.blockHash,
      merkle_root: trade.merkleRoot,
      digital_signature: trade.digitalSignature,
      is_verified: trade.isVerified
    });
  } catch (err) {
    console.warn('Error saving trade to Supabase:', err);
  }
}

// ============================================================================
// 4. BLOCKS (PoA CONSORTIUM LEDGER)
// ============================================================================
export async function fetchBlocksFromDB(): Promise<BlockHeader[] | null> {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .order('block_number', { ascending: false });

    if (error || !data || data.length === 0) return null;

    return data.map((row: any): BlockHeader => ({
      blockNumber: Number(row.block_number),
      blockHash: row.block_hash,
      previousHash: row.previous_hash,
      merkleRoot: row.merkle_root,
      timestamp: row.timestamp,
      txCount: Number(row.tx_count),
      validator: row.validator,
      nonce: Number(row.nonce),
      status: row.status,
      trades: []
    }));
  } catch (err) {
    console.warn('Failed to fetch blocks from Supabase:', err);
    return null;
  }
}

export async function saveBlockToDB(block: BlockHeader): Promise<void> {
  try {
    await supabase.from('blocks').insert({
      block_number: block.blockNumber,
      block_hash: block.blockHash,
      previous_hash: block.previousHash,
      merkle_root: block.merkleRoot,
      timestamp: block.timestamp,
      tx_count: block.txCount,
      validator: block.validator,
      nonce: block.nonce,
      status: block.status
    });
  } catch (err) {
    console.warn('Error saving block to Supabase:', err);
  }
}

// ============================================================================
// 5. AUDIT LOGS (APPEND-ONLY)
// ============================================================================
export async function recordAuditLog(
  actor: string,
  event: 'TRADE_CREATED' | 'BLOCK_COMMITTED' | 'STRATEGY_UPDATED' | 'RISK_LIMIT_MODIFIED' | 'VERIFICATION_EXECUTED' | 'GOVERNANCE_ALERT',
  entity: string,
  hash: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    const newId = `AUD-${Date.now().toString().slice(-6)}`;
    await supabase.from('audit_logs').insert({
      id: newId,
      actor,
      event,
      entity,
      hash,
      status: 'SUCCESS',
      details,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error recording audit log in Supabase:', err);
  }
}
