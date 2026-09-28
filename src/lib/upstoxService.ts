/**
 * TradeChain Upstox Pro v2 Broker Gateway Service
 * Handles live authentication, profile retrieval, margin telemetry, and order placement.
 */

export interface UpstoxTokenDetails {
  token: string;
  userId?: string;
  issuer?: string;
  issuedAt?: string;
  expiresAt?: string;
  isExpired?: boolean;
}

export interface UpstoxConnectionStatus {
  connected: boolean;
  statusCode?: number;
  status: 'CONNECTED' | 'IP_RESTRICTED' | 'EXPIRED' | 'UNAUTHENTICATED' | 'ERROR';
  message: string;
  tokenDetails: UpstoxTokenDetails;
  funds?: {
    availableMargin: number;
    usedMargin: number;
    totalCollateral: number;
  };
  profile?: {
    userName: string;
    email: string;
    broker: string;
  };
}

class UpstoxService {
  private static instance: UpstoxService;
  private token: string = '';

  private constructor() {
    this.token = this.loadToken();
  }

  public static getInstance(): UpstoxService {
    if (!UpstoxService.instance) {
      UpstoxService.instance = new UpstoxService();
    }
    return UpstoxService.instance;
  }

  public loadToken(): string {
    const fromStorage = typeof window !== 'undefined' ? localStorage.getItem('tradechain_upstox_token') : null;
    if (fromStorage && fromStorage.trim()) {
      this.token = fromStorage.trim();
      return this.token;
    }
    const envToken = (import.meta as any).env?.VITE_UPSTOX_ACCESS_TOKEN;
    if (envToken && envToken.trim()) {
      this.token = envToken.trim();
      return this.token;
    }
    return '';
  }

  public setToken(token: string): void {
    this.token = token.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('tradechain_upstox_token', this.token);
    }
  }

  public getToken(): string {
    if (!this.token) {
      this.loadToken();
    }
    return this.token;
  }

  public parseJwt(): UpstoxTokenDetails {
    const token = this.getToken();
    if (!token) {
      return { token: '' };
    }

    try {
      const parts = token.split('.');
      if (parts.length < 2) return { token };

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const parsed = JSON.parse(jsonPayload);

      const iat = parsed.iat ? new Date(parsed.iat * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : undefined;
      const exp = parsed.exp ? new Date(parsed.exp * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : undefined;
      const isExpired = parsed.exp ? Date.now() >= parsed.exp * 1000 : false;

      return {
        token,
        userId: parsed.sub || 'UPSTOX-USER',
        issuer: parsed.iss,
        issuedAt: iat,
        expiresAt: exp,
        isExpired
      };
    } catch (e) {
      return { token };
    }
  }

  private async fetchApi(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    };

    // Try relative endpoint via Vite / Vercel proxy first to avoid CORS
    const proxyUrl = `/api/upstox${endpoint}`;
    try {
      const res = await fetch(proxyUrl, { ...options, headers });
      if (res.status !== 404) {
        return res;
      }
    } catch {}

    // Direct fallback
    return fetch(`https://api.upstox.com${endpoint}`, { ...options, headers });
  }

  public async checkConnection(): Promise<UpstoxConnectionStatus> {
    const token = this.getToken();
    const tokenDetails = this.parseJwt();

    if (!token) {
      return {
        connected: false,
        status: 'UNAUTHENTICATED',
        message: 'No Upstox access token configured. Please enter your Upstox v2 JWT token.',
        tokenDetails
      };
    }

    if (tokenDetails.isExpired) {
      return {
        connected: false,
        status: 'EXPIRED',
        message: `Upstox token expired on ${tokenDetails.expiresAt}. Please refresh your token from Upstox Developer Portal.`,
        tokenDetails
      };
    }

    try {
      const res = await this.fetchApi('/v2/user/profile');
      const data = await res.json().catch(() => null);

      if (res.ok && data?.status === 'success') {
        const profile = data.data;
        return {
          connected: true,
          statusCode: res.status,
          status: 'CONNECTED',
          message: `Connected as ${profile?.user_name || tokenDetails.userId} (${profile?.broker || 'Upstox Pro'})`,
          tokenDetails,
          profile: {
            userName: profile?.user_name || tokenDetails.userId || 'Upstox Trader',
            email: profile?.email || '',
            broker: profile?.broker || 'Upstox Pro'
          }
        };
      }

      // Handle Upstox Specific Errors
      const errorCode = data?.errors?.[0]?.errorCode || data?.errors?.[0]?.error_code;
      const errorMsg = data?.errors?.[0]?.message || res.statusText;

      if (errorCode === 'UDAPI1221') {
        return {
          connected: false,
          statusCode: res.status,
          status: 'IP_RESTRICTED',
          message: 'Upstox Static IP Restriction (UDAPI1221): Your token is valid for user ' + (tokenDetails.userId || '6RA4GX') + ', but your Upstox App has IP whitelisting enabled. Requests must originate from your configured Static IP or an authorized server.',
          tokenDetails
        };
      }

      return {
        connected: false,
        statusCode: res.status,
        status: 'ERROR',
        message: `Upstox API responded with ${res.status}: ${errorMsg}`,
        tokenDetails
      };
    } catch (err: any) {
      return {
        connected: false,
        status: 'ERROR',
        message: `Network/CORS error reaching Upstox API: ${err.message}`,
        tokenDetails
      };
    }
  }

  public async getFundsAndMargin() {
    try {
      const res = await this.fetchApi('/v2/user/get-funds-and-margin');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch Upstox funds:', e);
    }
    return null;
  }

  public async getPositions() {
    try {
      const res = await this.fetchApi('/v2/portfolio/short-term-positions');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch Upstox positions:', e);
    }
    return null;
  }

  public async placeOrder(order: {
    symbol: string;
    quantity: number;
    transaction_type: 'BUY' | 'SELL';
    order_type: 'MARKET' | 'LIMIT' | 'SL-M';
    price?: number;
  }) {
    const payload = {
      quantity: order.quantity,
      product: 'I', // Intraday
      validity: 'DAY',
      price: order.price || 0,
      tag: 'TradeChainQuant',
      instrument_token: order.symbol,
      order_type: order.order_type,
      transaction_type: order.transaction_type,
      disclosed_quantity: 0,
      trigger_price: 0,
      is_amo: false
    };

    try {
      const res = await this.fetchApi('/v2/order/place', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { status: 'error', message: err.message };
    }
  }
}

export const upstoxService = UpstoxService.getInstance();
