import React from 'react';

const SeverityBadge = ({ severity, size = 'md' }) => {
  const sev = (severity || 'LOW').toUpperCase();

  const styles = {
    LOW: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/40 shadow-sm',
    CRITICAL: 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.3)] font-bold',
  };

  const dotColors = {
    LOW: 'bg-emerald-500',
    MEDIUM: 'bg-amber-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-rose-500',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${
        styles[sev] || styles.LOW
      } ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[sev] || dotColors.LOW}`} />
      {sev}
    </span>
  );
};

export default SeverityBadge;
