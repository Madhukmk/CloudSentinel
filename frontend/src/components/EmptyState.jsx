import React from 'react';
import { Inbox, ShieldCheck } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Available',
  description = 'No records match your active criteria in this SOC telemetry view.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-bold font-mono text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-1">
        {title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md font-mono mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-mono text-xs font-semibold transition-all shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
