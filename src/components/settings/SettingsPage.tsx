import React, { useState } from 'react';
import {
  Settings, User, Bell, Shield, Palette, Key, Globe,
  Database, Save, RefreshCw, Eye, EyeOff, CheckCircle2,
  AlertTriangle, Zap, ChevronRight, Lock, Wifi, Volume2,
  VolumeX, Sun, Moon, Monitor, Smartphone, Mail, MessageSquare,
  Copy, Check, ExternalLink, ShieldAlert, Sparkles
} from 'lucide-react';
import { upstoxService, UpstoxConnectionStatus } from '../../lib/upstoxService';

type SettingsTab = 'PROFILE' | 'BROKER' | 'RISK' | 'NOTIFICATIONS' | 'APPEARANCE' | 'SECURITY' | 'API_KEYS';

const BROKERS = [
  { id: 'zerodha', name: 'Zerodha Kite', desc: 'Zerodha Kite Connect v2 · NSE/BSE Access', status: 'CONNECTED', color: '#10B981' },
  { id: 'upstox', name: 'Upstox Pro', desc: 'Upstox v3 API · Real-time WebSocket feed', status: 'CONNECTED', color: '#10B981' },
  { id: 'groww', name: 'Groww Direct', desc: 'Groww institutional API · MF + Equity', status: 'DISCONNECTED', color: '#EF4444' },
  { id: 'icici', name: 'ICICI Breeze', desc: 'ICICI Direct Breeze API · F&O Access', status: 'PENDING', color: '#F59E0B' },
];

const NOTIFICATION_CHANNELS = [
  { id: 'email', label: 'Email', icon: <Mail size={15} />, desc: 'sunny@tradechain.io' },
  { id: 'sms', label: 'SMS / WhatsApp', icon: <Smartphone size={15} />, desc: '+91 98765 43210' },
  { id: 'telegram', label: 'Telegram Bot', icon: <MessageSquare size={15} />, desc: '@TradeChain_Alerts' },
];

const NOTIFICATION_EVENTS = [
  { key: 'trade_exec', label: 'Trade Execution' },
  { key: 'trade_closed', label: 'Position Closed' },
  { key: 'stop_hit', label: 'Stop Loss Hit' },
  { key: 'target_hit', label: 'Target Achieved' },
  { key: 'risk_breach', label: 'Risk Limit Breach' },
  { key: 'block_commit', label: 'Block Committed' },
  { key: 'signal_gen', label: 'AI Signal Generated' },
  { key: 'system_alert', label: 'System Alert' },
];

const API_KEYS = [
  { id: 'K1', name: 'Zerodha Kite API Key', key: 'kj8***********************2af1', created: '2026-01-15', expires: '2027-01-15', status: 'ACTIVE' },
  { id: 'K2', name: 'Upstox v3 API Key', key: 'up_***********************d92b', created: '2026-03-01', expires: '2027-03-01', status: 'ACTIVE' },
  { id: 'K3', name: 'NSE Live Data API', key: 'nse_**********************8e3c', created: '2026-06-10', expires: '2026-12-10', status: 'EXPIRING' },
];

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('PROFILE');
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [upstoxToken, setUpstoxToken] = useState(() => upstoxService.getToken());
  const [upstoxStatus, setUpstoxStatus] = useState<UpstoxConnectionStatus | null>(null);
  const [isTestingUpstox, setIsTestingUpstox] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState({
    name: 'Sunny Prasad', email: 'sunny@tradechain.io', mobile: '+91 98765 43210',
    role: 'Admin / Developer', pan: 'ABCDE1234F', demat: 'IN300XXX12345678',
  });

  // Risk settings
  const [riskSettings, setRiskSettings] = useState({
    maxDailyLoss: 5.0, maxPositionSize: 10.0, maxDrawdown: 8.0,
    positionLimit: 5, lotSizeMultiplier: 1, trailingStopEnabled: true,
    autoSquareOffTime: '15:20', autoSquareOffEnabled: true,
    intraDayOnly: false, hedgingEnabled: true,
  });

  // Notification state
  const [notifChannels, setNotifChannels] = useState({ email: true, sms: true, telegram: false });
  const [notifEvents, setNotifEvents] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_EVENTS.map(e => [e.key, true]))
  );

  // Appearance state
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [chartStyle, setChartStyle] = useState<'candle' | 'line' | 'bar'>('candle');
  const [compactMode, setCompactMode] = useState(false);
  const [animations, setAnimations] = useState(true);

  const handleSave = () => {
    upstoxService.setToken(upstoxToken);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestUpstox = async () => {
    setIsTestingUpstox(true);
    upstoxService.setToken(upstoxToken);
    try {
      const res = await upstoxService.checkConnection();
      setUpstoxStatus(res);
    } finally {
      setIsTestingUpstox(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const SIDEBAR_TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'PROFILE', label: 'Profile', icon: <User size={15} /> },
    { id: 'BROKER', label: 'Broker Connections', icon: <Globe size={15} /> },
    { id: 'RISK', label: 'Risk Parameters', icon: <Shield size={15} /> },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'APPEARANCE', label: 'Appearance', icon: <Palette size={15} /> },
    { id: 'SECURITY', label: 'Security & Auth', icon: <Lock size={15} /> },
    { id: 'API_KEYS', label: 'API Key Manager', icon: <Key size={15} /> },
  ];

  const ACCENT_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#A78BFA', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];

  return (
    <div className="flex gap-5 w-full max-w-full font-mono min-h-[600px]">

      {/* ━━━━ LEFT SIDEBAR ━━━━ */}
      <div className="w-56 shrink-0 space-y-2">
        <div className="p-4 rounded-xl bg-[#11161D] border border-[#242B35] space-y-1">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#1E2633]">
            <div className="p-2 rounded-lg bg-[#F97316]/20 border border-[#F97316]/30">
              <Settings size={16} className="text-[#FB923C]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F4F7FA]">Settings</div>
              <div className="text-[10px] text-[#64748B]">Platform Config</div>
            </div>
          </div>
          {SIDEBAR_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-[#F97316]/15 border border-[#F97316]/40 text-[#FB923C] font-bold'
                  : 'text-[#8B95A5] hover:text-[#F4F7FA] hover:bg-[#1E2633]'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && <ChevronRight size={12} className="ml-auto" />}
            </button>
          ))}
        </div>

        {/* Save button */}
        <button onClick={handleSave}
          className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            saved ? 'bg-[#10B981] text-white' : 'bg-[#F97316] hover:bg-[#EA580C] text-white'
          }`}>
          {saved ? <><CheckCircle2 size={14} />Saved!</> : <><Save size={14} />Save Changes</>}
        </button>
      </div>

      {/* ━━━━ CONTENT AREA ━━━━ */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* ── PROFILE ── */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#11161D] border border-[#242B35] space-y-5">
              <h3 className="font-bold text-[#FB923C] flex items-center gap-2"><User size={16} /> User Profile</h3>

              {/* Avatar + role banner */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#1C1000] to-[#150C00] border border-[#F97316]/20">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F97316] to-[#3B82F6] flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-bold text-[#F4F7FA] text-sm">{profile.name}</div>
                  <div className="text-[#64748B] text-xs mt-0.5">{profile.role}</div>
                  <div className="flex gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">VERIFIED KYC</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#F97316]/15 text-[#FB923C] border border-[#F97316]/30">SEBI REG</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  { label: 'Full Name', key: 'name', value: profile.name },
                  { label: 'Email Address', key: 'email', value: profile.email },
                  { label: 'Mobile', key: 'mobile', value: profile.mobile },
                  { label: 'Role', key: 'role', value: profile.role },
                  { label: 'PAN Number', key: 'pan', value: profile.pan },
                  { label: 'Demat Account', key: 'demat', value: profile.demat },
                ].map(f => (
                  <div key={f.key} className="space-y-1">
                    <label className="text-[10px] text-[#64748B] uppercase tracking-wider">{f.label}</label>
                    <input
                      type="text"
                      value={f.value}
                      onChange={e => setProfile(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#242B35] text-[#F4F7FA] outline-none focus:border-[#F97316]/60 text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BROKER CONNECTIONS ── */}
        {activeTab === 'BROKER' && (
          <div className="space-y-4">
            {/* Live Upstox Pro API Gateway Dedicated Manager */}
            <div className="p-5 rounded-2xl bg-[#0B0E14] border border-[#242B35] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center font-bold text-[#8B5CF6]">
                    U
                  </div>
                  <div>
                    <h3 className="font-bold text-[#F4F7FA] text-sm">Upstox Pro v2 Broker Gateway</h3>
                    <p className="text-[11px] text-[#64748B]">Live institutional FIX gateway & execution socket</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestUpstox}
                    disabled={isTestingUpstox}
                    className="px-3 py-1.5 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isTestingUpstox ? 'animate-spin' : ''} />
                    <span>{isTestingUpstox ? 'Testing Gateway...' : 'Test Upstox Connection'}</span>
                  </button>
                </div>
              </div>

              {/* Token Input Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold">Upstox API JWT Access Token</label>
                  <button
                    onClick={() => setShowSecret(prev => ({ ...prev, upstox: !prev.upstox }))}
                    className="text-[10px] text-[#8B5CF6] hover:underline flex items-center gap-1"
                  >
                    {showSecret['upstox'] ? <EyeOff size={11} /> : <Eye size={11} />}
                    {showSecret['upstox'] ? 'Mask Token' : 'Reveal Token'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showSecret['upstox'] ? 'text' : 'password'}
                    value={upstoxToken}
                    onChange={(e) => setUpstoxToken(e.target.value)}
                    placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
                    className="w-full px-3 py-2 rounded-lg bg-[#080A0F] border border-[#242B35] text-[#F4F7FA] font-mono text-xs outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>

              {/* Decoded Token Details */}
              {(() => {
                const details = upstoxService.parseJwt();
                if (!details.userId) return null;
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-[#11161D] border border-[#1E2633] text-[11px]">
                    <div>
                      <span className="text-[#64748B] block text-[9px] uppercase">Client Code (Sub)</span>
                      <strong className="text-[#F4F7FA] font-mono">{details.userId}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[9px] uppercase">Issuer (ISS)</span>
                      <span className="text-[#8B95A5] font-mono">{details.issuer || 'udapi-gateway'}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[9px] uppercase">Expires At</span>
                      <span className={details.isExpired ? 'text-[#EF4444] font-bold' : 'text-[#10B981]'}>{details.expiresAt || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[9px] uppercase">Token State</span>
                      <span className={`font-bold ${details.isExpired ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                        {details.isExpired ? 'EXPIRED' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Status Banner */}
              {upstoxStatus && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  upstoxStatus.status === 'CONNECTED'
                    ? 'bg-[#051A0F] border-[#10B981]/40 text-[#10B981]'
                    : upstoxStatus.status === 'IP_RESTRICTED'
                    ? 'bg-[#1C1000] border-[#F59E0B]/40 text-[#F59E0B]'
                    : 'bg-[#1E0B0B] border-[#EF4444]/40 text-[#EF4444]'
                }`}>
                  {upstoxStatus.status === 'CONNECTED' ? (
                    <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                  ) : upstoxStatus.status === 'IP_RESTRICTED' ? (
                    <AlertTriangle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
                  ) : (
                    <ShieldAlert size={16} className="text-[#EF4444] shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-bold">
                      {upstoxStatus.status === 'CONNECTED'
                        ? 'Upstox Pro Gateway Operational'
                        : upstoxStatus.status === 'IP_RESTRICTED'
                        ? 'Upstox Static IP Whitelisting Active (UDAPI1221)'
                        : 'Upstox Connection Notice'}
                    </div>
                    <div className="text-[11px] leading-relaxed opacity-90">{upstoxStatus.message}</div>
                    {upstoxStatus.status === 'IP_RESTRICTED' && (
                      <p className="text-[10px] text-[#8B95A5] mt-1 pt-1 border-t border-[#F59E0B]/20">
                        Tip: In your Upstox Developer Console app settings, update the allowed Static IP to match your current public IP, or route orders through the TradeChain gateway server.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#11161D] border border-[#242B35] space-y-4">
              <h3 className="font-bold text-[#FB923C] flex items-center gap-2"><Globe size={16} /> All Broker Integrations</h3>
              <p className="text-xs text-[#64748B]">Manage institutional broker integrations. All credentials are AES-256 encrypted at rest.</p>
              <div className="space-y-3">
                {BROKERS.map(b => (
                  <div key={b.id} className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-4 ${
                    b.status === 'CONNECTED' ? 'bg-[#051A0F] border-[#10B981]/30' :
                    b.status === 'PENDING' ? 'bg-[#1C1000] border-[#F59E0B]/30' :
                    'bg-[#0D1117] border-[#242B35] opacity-70'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border ${
                        b.status === 'CONNECTED' ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]' :
                        b.status === 'PENDING' ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]' :
                        'bg-[#64748B]/15 border-[#64748B]/30 text-[#64748B]'
                      }`}>
                        {b.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-[#F4F7FA]">{b.name}</div>
                        <div className="text-[#64748B]">{b.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        b.status === 'CONNECTED' ? 'bg-[#10B981]/15 text-[#10B981]' :
                        b.status === 'PENDING' ? 'bg-[#F59E0B]/15 text-[#F59E0B]' :
                        'bg-[#64748B]/15 text-[#64748B]'
                      }`}>{b.status}</span>
                      <button className={`px-3 py-1.5 rounded-lg font-bold text-[10px] border transition-all ${
                        b.status === 'CONNECTED'
                          ? 'border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10'
                          : 'border-[#F97316]/40 text-[#FB923C] hover:bg-[#F97316]/10'
                      }`}>
                        {b.status === 'CONNECTED' ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RISK PARAMETERS ── */}
        {activeTab === 'RISK' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#11161D] border border-[#242B35] space-y-5">
              <h3 className="font-bold text-[#FB923C] flex items-center gap-2"><Shield size={16} /> Risk Parameter Configuration</h3>
              <div className="p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="text-[#F59E0B]" />
                <span className="text-[#F59E0B] font-bold">Changes to risk parameters take effect immediately and apply to all live strategies.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Numeric sliders */}
                {[
                  { label: 'Max Daily Loss (%)', key: 'maxDailyLoss', min: 0.5, max: 20, step: 0.5, value: riskSettings.maxDailyLoss, unit: '%' },
                  { label: 'Max Position Size (%)', key: 'maxPositionSize', min: 1, max: 50, step: 1, value: riskSettings.maxPositionSize, unit: '%' },
                  { label: 'Max Drawdown (%)', key: 'maxDrawdown', min: 1, max: 30, step: 0.5, value: riskSettings.maxDrawdown, unit: '%' },
                  { label: 'Max Open Positions', key: 'positionLimit', min: 1, max: 20, step: 1, value: riskSettings.positionLimit, unit: 'positions' },
                ].map(r => (
                  <div key={r.key} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] text-[#64748B] uppercase tracking-wider">{r.label}</label>
                      <span className="font-bold text-[#FB923C]">{r.value}{r.unit !== 'positions' ? '' : ` ${r.unit}`}</span>
                    </div>
                    <input type="range" min={r.min} max={r.max} step={r.step} value={r.value}
                      onChange={e => setRiskSettings(prev => ({ ...prev, [r.key]: parseFloat(e.target.value) }))}
                      className="w-full accent-orange-500 h-1.5 rounded-full" />
                    <div className="flex justify-between text-[9px] text-[#374151]">
                      <span>{r.min}</span><span>{r.max}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: 'trailingStopEnabled', label: 'Trailing Stop Loss', desc: 'Auto-trail SL as trade moves in profit' },
                  { key: 'autoSquareOffEnabled', label: 'Auto Square-Off', desc: `Force close all positions at ${riskSettings.autoSquareOffTime}` },
                  { key: 'intraDayOnly', label: 'Intraday Only Mode', desc: 'Block overnight positions (F&O)' },
                  { key: 'hedgingEnabled', label: 'Hedging Enabled', desc: 'Allow simultaneous BUY + SELL positions' },
                ].map(t => (
                  <div key={t.key} className="flex items-center justify-between p-3 rounded-xl bg-[#0D1117] border border-[#1E2633]">
                    <div className="text-xs">
                      <div className="font-bold text-[#F4F7FA]">{t.label}</div>
                      <div className="text-[#64748B] text-[10px] mt-0.5">{t.desc}</div>
                    </div>
                    <button
                      onClick={() => setRiskSettings(prev => ({ ...prev, [t.key]: !prev[t.key as keyof typeof prev] }))}
                      className={`w-11 h-6 rounded-full transition-all relative shrink-0 ml-3 ${riskSettings[t.key as keyof typeof riskSettings] ? 'bg-[#F97316]' : 'bg-[#1E2633]'}`}
                    >
                      <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all ${riskSettings[t.key as keyof typeof riskSettings] ? 'left-[22px]' : 'left-[3px]'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#11161D] border border-[#242B35] space-y-5">
              <h3 className="font-bold text-[#FB923C] flex items-center gap-2"><Bell size={16} /> Notification Preferences</h3>

              {/* Channels */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-[#64748B] uppercase tracking-wider">Delivery Channels</h4>
                {NOTIFICATION_CHANNELS.map(ch => (
                  <div key={ch.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0D1117] border border-[#1E2633] text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F97316]/15 border border-[#F97316]/30 flex items-center justify-center text-[#FB923C]">
                        {ch.icon}
                      </div>
                      <div>
                        <div className="font-bold text-[#F4F7FA]">{ch.label}</div>
                        <div className="text-[#64748B] text-[10px]">{ch.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifChannels(prev => ({ ...prev, [ch.id]: !prev[ch.id as keyof typeof prev] }))}
                      className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${notifChannels[ch.id as keyof typeof notifChannels] ? 'bg-[#F97316]' : 'bg-[#1E2633]'}`}
                    >
                      <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all ${notifChannels[ch.id as keyof typeof notifChannels] ? 'left-[22px]' : 'left-[3px]'}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Event Triggers */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-[#64748B] uppercase tracking-wider">Alert Triggers</h4>
                <div className="grid grid-cols-2 gap-2">
                  {NOTIFICATION_EVENTS.map(ev => (
                    <div key={ev.key} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D1117] border border-[#1E2633] text-xs">
                      <span className="text-[#8B95A5]">{ev.label}</span>
                      <button
                        onClick={() => setNotifEvents(prev => ({ ...prev, [ev.key]: !prev[ev.key] }))}
                        className={`w-9 h-5 rounded-full transition-all relative shrink-0 ${notifEvents[ev.key] ? 'bg-[#F97316]' : 'bg-[#1E2633]'}`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-[3px] transition-all ${notifEvents[ev.key] ? 'left-[18px]' : 'left-[3px]'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── APPEARANCE ── */}
        {activeTab === 'APPEARANCE' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#11161D] border border-[#242B35] space-y-5">
              <h3 className="font-bold text-[#FB923C] flex items-center gap-2"><Palette size={16} /> Appearance & Theme</h3>

              {/* Theme */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#64748B] uppercase tracking-wider">Interface Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'light', 'system'] as const).map(t => (
                    <button key={t} onClick={() => setTheme(t)}
                      className={`py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        theme === t ? 'bg-[#F97316]/15 border-[#F97316] text-[#FB923C]' : 'bg-[#0D1117] border-[#242B35] text-[#64748B] hover:border-[#F97316]/40'
                      }`}>
                      {t === 'dark' ? <Moon size={16} /> : t === 'light' ? <Sun size={16} /> : <Monitor size={16} />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent color */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#64748B] uppercase tracking-wider">Accent Color</label>
                <div className="flex gap-3 flex-wrap">
                  {ACCENT_COLORS.map(c => (
                    <button key={c} onClick={() => setAccentColor(c)}
                      className={`w-8 h-8 rounded-full transition-all ring-offset-[#11161D] ring-offset-2 ${accentColor === c ? 'ring-2 ring-white' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              {/* Chart style */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#64748B] uppercase tracking-wider">Default Chart Style</label>
                <div className="flex gap-2">
                  {(['candle', 'line', 'bar'] as const).map(s => (
                    <button key={s} onClick={() => setChartStyle(s)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                        chartStyle === s ? 'bg-[#F97316]/15 border-[#F97316] text-[#FB923C]' : 'border-[#242B35] text-[#64748B] hover:border-[#F97316]/40'
                      }`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                {[
                  { label: 'Compact View Mode', desc: 'Reduce padding for more data density', key: 'compact', value: compactMode, set: setCompactMode },
                  { label: 'UI Animations', desc: 'Smooth transitions and micro-animations', key: 'anim', value: animations, set: setAnimations },
                ].map(t => (
                  <div key={t.key} className="flex items-center justify-between p-3 rounded-xl bg-[#0D1117] border border-[#1E2633] text-xs">
                    <div>
                      <div className="font-bold text-[#F4F7FA]">{t.label}</div>
                      <div className="text-[#64748B] text-[10px]">{t.desc}</div>
                    </div>
                    <button onClick={() => t.set((p: boolean) => !p)}
                      className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${t.value ? 'bg-[#F97316]' : 'bg-[#1E2633]'}`}>
                      <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all ${t.value ? 'left-[22px]' : 'left-[3px]'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECURITY ── */}
        {activeTab === 'SECURITY' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#11161D] border border-[#242B35] space-y-5">
              <h3 className="font-bold text-[#FB923C] flex items-center gap-2"><Lock size={16} /> Security & Authentication</h3>

              <div className="p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-xs flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#10B981]" />
                <span className="text-[#10B981] font-bold">2FA Active · Last Login: 2026-09-27 10:58:15 IST · Device: Chrome / Windows 11</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 2FA */}
                <div className="p-4 rounded-xl bg-[#0D1117] border border-[#1E2633] space-y-3">
                  <div className="font-bold text-[#F4F7FA]">Two-Factor Authentication</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[#10B981] font-bold">Enabled via Google Authenticator</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 font-bold text-[10px] transition-all">
                    Disable 2FA
                  </button>
                </div>

                {/* Session */}
                <div className="p-4 rounded-xl bg-[#0D1117] border border-[#1E2633] space-y-3">
                  <div className="font-bold text-[#F4F7FA]">Session Management</div>
                  <div className="space-y-1.5">
                    {[
                      { dev: 'Chrome / Windows 11', ip: '103.x.x.x', time: 'Now (Current)', active: true },
                      { dev: 'Mobile / Android', ip: '49.x.x.x', time: '2026-09-26 08:30', active: false },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#11161D] border border-[#242B35]">
                        <div>
                          <div className="text-[#F4F7FA] font-bold">{s.dev}</div>
                          <div className="text-[#64748B] text-[10px]">{s.ip} · {s.time}</div>
                        </div>
                        {s.active ? <span className="text-[9px] text-[#10B981] font-bold">ACTIVE</span> :
                          <button className="text-[9px] text-[#EF4444] font-bold hover:underline">Revoke</button>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Change Password */}
                <div className="p-4 rounded-xl bg-[#0D1117] border border-[#1E2633] space-y-3 md:col-span-2">
                  <div className="font-bold text-[#F4F7FA]">Change Password</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                      <div key={label} className="space-y-1">
                        <label className="text-[10px] text-[#64748B]">{label}</label>
                        <div className="relative">
                          <input type={showSecret[label] ? 'text' : 'password'} placeholder="••••••••"
                            className="w-full px-3 py-2 rounded-lg bg-[#0A0C12] border border-[#242B35] text-[#F4F7FA] outline-none focus:border-[#F97316]/60 pr-9 text-xs" />
                          <button onClick={() => setShowSecret(p => ({ ...p, [label]: !p[label] }))}
                            className="absolute right-2.5 top-2 text-[#64748B] hover:text-[#F4F7FA]">
                            {showSecret[label] ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs transition-all">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── API KEYS ── */}
        {activeTab === 'API_KEYS' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#11161D] border border-[#242B35] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-bold text-[#FB923C] flex items-center gap-2"><Key size={16} /> API Key Manager</h3>
                <button className="px-3.5 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-all flex items-center gap-1.5">
                  <Zap size={13} /> Generate New Key
                </button>
              </div>
              <p className="text-xs text-[#64748B]">
                Manage API keys for broker connections, Groq inference, and external integrations. All keys are encrypted in Vault.
              </p>

              {/* Dedicated Groq Cloud AI Key Card */}
              <div className="p-4 rounded-xl border border-[#8B5CF6]/40 bg-[#0E0C18] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center font-bold text-[#8B5CF6]">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-[#F4F7FA] text-xs">Groq Cloud AI Inference Key</div>
                      <div className="text-[10px] text-[#8B95A5]">Powers real-time TradeChain Quant Copilot (GPT-OSS-120B / Qwen 3.8)</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    LIVE MODEL READY
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type={showSecret['groq_settings'] ? 'text' : 'password'}
                    value={localStorage.getItem('tradechain_groq_key') || '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'}
                    onChange={(e) => {
                      localStorage.setItem('tradechain_groq_key', e.target.value);
                      handleSave();
                    }}
                    placeholder="gsk_..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#080A0F] border border-[#242B35] text-[#F4F7FA] font-mono text-xs outline-none focus:border-[#8B5CF6]"
                  />
                  <button
                    onClick={() => setShowSecret(prev => ({ ...prev, groq_settings: !prev.groq_settings }))}
                    className="px-2.5 py-1.5 rounded-lg border border-[#242B35] text-[#8B95A5] hover:text-[#F4F7FA] text-xs"
                  >
                    {showSecret['groq_settings'] ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {API_KEYS.map(k => (
                  <div key={k.id} className={`p-4 rounded-xl border text-xs ${
                    k.status === 'ACTIVE' ? 'bg-[#0D1117] border-[#1E2633]' : 'bg-[#1C1000] border-[#F59E0B]/30'
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="font-bold text-[#F4F7FA]">{k.name}</div>
                        <div className="text-[#64748B] mt-0.5 font-mono">{showSecret[k.id] ? k.key.replace(/\*/g, 'a1b2c3') : k.key}</div>
                        <div className="text-[10px] text-[#64748B] mt-1">
                          Created: {k.created} · Expires: <span className={k.status === 'EXPIRING' ? 'text-[#F59E0B] font-bold' : 'text-[#64748B]'}>{k.expires}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${k.status === 'ACTIVE' ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'}`}>
                          {k.status}
                        </span>
                        <button onClick={() => setShowSecret(p => ({ ...p, [k.id]: !p[k.id] }))}
                          className="p-1.5 rounded-lg border border-[#242B35] text-[#64748B] hover:text-[#F4F7FA] transition-all">
                          {showSecret[k.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button className="px-2.5 py-1.5 rounded-lg border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 text-[10px] font-bold transition-all">
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[#0A0818] border border-[#4F46E5]/20 text-xs flex items-start gap-2.5">
                <Lock size={14} className="text-[#818CF8] shrink-0 mt-0.5" />
                <span className="text-[#64748B]">
                  Keys are masked by default. Click <Eye size={11} className="inline" /> to reveal. All key access events are recorded in the <strong className="text-[#818CF8]">Audit Log</strong>.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
