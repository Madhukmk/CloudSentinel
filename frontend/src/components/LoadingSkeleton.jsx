import React from 'react';

export const SkeletonBox = ({ className = '', style }) => (
  <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800/60 ${className}`} style={style} />
);

export const StatGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="soc-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-8 w-8 rounded-lg" />
        </div>
        <SkeletonBox className="h-7 w-28" />
        <SkeletonBox className="h-3 w-36" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className="soc-card overflow-hidden">
    <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between">
      <SkeletonBox className="h-5 w-40" />
      <SkeletonBox className="h-5 w-24" />
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-800/60">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 flex items-center justify-between gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBox
              key={c}
              className={`h-4 ${c === 0 ? 'w-28' : c === 1 ? 'w-36' : 'w-20'}`}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton = ({ height = 'h-72' }) => (
  <div className={`soc-card p-5 ${height} flex flex-col justify-between`}>
    <div className="flex justify-between items-center">
      <SkeletonBox className="h-5 w-36" />
      <SkeletonBox className="h-4 w-20" />
    </div>
    <div className="flex items-end justify-between gap-2 h-44 pt-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonBox
          key={i}
          className="w-full"
          style={{ height: `${Math.max(20, (i * 17) % 100)}%` }}
        />
      ))}
    </div>
  </div>
);

export const CardsSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="soc-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-5 w-24" />
          <SkeletonBox className="h-5 w-16" />
        </div>
        <SkeletonBox className="h-5 w-44" />
        <SkeletonBox className="h-10 w-full" />
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-color)]">
          <SkeletonBox className="h-10 w-full" />
          <SkeletonBox className="h-10 w-full" />
          <SkeletonBox className="h-10 w-full" />
        </div>
      </div>
    ))}
  </div>
);

const LoadingSkeleton = ({ type = 'table', count = 6, rows = 5, cols = 5, height = 'h-72' }) => {
  if (type === 'cards' || type === 'grid') {
    return <CardsSkeleton count={count} />;
  }
  if (type === 'stats') {
    return <StatGridSkeleton count={count} />;
  }
  if (type === 'chart') {
    return <ChartSkeleton height={height} />;
  }
  return <TableSkeleton rows={rows || count} cols={cols} />;
};

export default LoadingSkeleton;
