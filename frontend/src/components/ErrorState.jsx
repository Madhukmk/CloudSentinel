import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorState = ({
  title = 'Failed to Load Telemetry',
  message = 'An unexpected error occurred while communicating with the SOC backend.',
  onRetry,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center max-w-xl mx-auto my-6">
      <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold font-mono text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-xs text-rose-600 dark:text-rose-400/90 font-mono mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-mono text-xs font-semibold hover:bg-rose-600 transition-all shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
