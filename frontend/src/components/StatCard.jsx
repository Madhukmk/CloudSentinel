import React from 'react';
import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'cyan',
  subtitle,
  trend,
  trendUp = true,
  tooltip,
  valueColor,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-[#0E1016] border border-zinc-800/80 rounded-2xl p-5 animate-pulse space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-3 w-28 bg-zinc-800 rounded" />
          <div className="h-7 w-7 bg-zinc-800 rounded-lg" />
        </div>
        <div className="h-8 w-24 bg-zinc-800 rounded mt-2" />
        <div className="h-3 w-36 bg-zinc-800 rounded" />
      </div>
    );
  }

  // Determine value color if not explicitly provided
  let determinedValueColor = 'text-white';
  if (valueColor) {
    determinedValueColor = valueColor;
  } else if (color === 'emerald' || color === 'green') {
    determinedValueColor = 'text-[#00E599]';
  } else if (color === 'rose' || color === 'red') {
    determinedValueColor = 'text-rose-400';
  } else if (color === 'amber' || color === 'yellow') {
    determinedValueColor = 'text-amber-400';
  }

  return (
    <div
      className="bg-[#0E1016] border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 transition-all duration-200 group relative flex flex-col justify-between shadow-sm"
      title={tooltip || title}
    >
      <div>
        {/* Top Header: Label on Left, Icon Badge on Right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
              {title}
            </span>
            {tooltip && (
              <HelpCircle className="w-3 h-3 text-zinc-500 opacity-60 hover:opacity-100 transition-opacity cursor-help" />
            )}
          </div>

          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700 transition-all shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Large Metric Value */}
        <div className="mt-3">
          <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${determinedValueColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value ?? '0'}
          </h3>
        </div>
      </div>

      {/* Subtitle / Context Note */}
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2 pt-1 text-xs text-zinc-400 font-mono truncate">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold ${
                trendUp ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </span>
          )}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
