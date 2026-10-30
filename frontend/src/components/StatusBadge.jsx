import React from 'react';

const StatusBadge = ({ status }) => {
  const st = (status || 'UNKNOWN').toUpperCase();

  const styles = {
    // Alert statuses
    NEW: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    ACKNOWLEDGED: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
    RESOLVED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    FALSE_POSITIVE: 'bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/30',

    // Incident statuses
    OPEN: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    INVESTIGATING: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 font-semibold',
    CLOSED: 'bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/30',

    // Source / User statuses
    ACTIVE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    INACTIVE: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    ENABLED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    DISABLED: 'bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/30',
    ONLINE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    WARNING: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    OFFLINE: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${
        styles[st] || 'bg-slate-700/20 text-slate-700 dark:text-slate-300 border-slate-600/30'
      }`}
    >
      {st.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
