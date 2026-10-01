import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TradeChain Runtime ErrorBoundary Caught]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('tradechain_positions');
      localStorage.removeItem('tradechain_trades');
    } catch {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#080A0F] text-[#F4F7FA] flex items-center justify-center p-6 font-sans antialiased selection:bg-[#3B82F6]/30">
          <div className="max-w-xl w-full bg-[#0D111A] border border-[#EF4444]/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EF4444]/10 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20" />
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  System Diagnostics Alert
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30">
                    FAIL-SAFE ACTIVE
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  An interface component encountered an unhandled state. The cryptographic ledger and market data engine remain secure.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6 bg-[#06080C] border border-slate-800 rounded-xl p-4 font-mono text-xs text-rose-300 overflow-x-auto max-h-40">
                <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800 pb-1">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Stack Diagnostics</span>
                </div>
                <div className="font-semibold text-rose-400">{this.state.error.toString()}</div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 text-slate-500 whitespace-pre-wrap text-[11px]">
                    {this.state.errorInfo.componentStack.slice(0, 500)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-all border border-slate-700 active:scale-[0.98]"
                title="Clear local state cache and return home"
              >
                <Home className="w-4 h-4" />
                Reset & Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
