import React from 'react';

const WebSocketStatus = ({ status = 'OFFLINE' }) => {
  const isLive = status === 'LIVE';
  const isReconnecting = status === 'RECONNECTING';

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
        isLive
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          : isReconnecting
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
      }`}
      title={`SOC WebSocket Broker: ${status}`}
    >
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        {isReconnecting && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLive ? 'bg-emerald-500' : isReconnecting ? 'bg-amber-500' : 'bg-rose-500'
          }`}
        />
      </span>
      <span className="font-semibold text-[11px] tracking-wide">
        {status}
      </span>
    </div>
  );
};

export default WebSocketStatus;
