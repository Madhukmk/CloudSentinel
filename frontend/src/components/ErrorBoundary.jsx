import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SOC Error Boundary] Captured render error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 rounded-2xl bg-[var(--bg-card)] border border-rose-500/40 shadow-2xl font-mono text-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                SOC Interface Render Exception
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                The component encountered an unexpected runtime error.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-rose-400 mb-5 break-words font-mono text-[11px]">
            {this.state.error?.message || 'Unknown view exception'}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer transition-all shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Workspace</span>
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] hover:text-cyan-400 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
