import React from 'react';
import { AlertTriangle, X, Radio, ArrowRight } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import { useNavigate } from 'react-router-dom';

const AlertToastContainer = ({ notifications = [], onDismiss }) => {
  const navigate = useNavigate();

  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((toast) => {
        const alert = toast.alert || {};
        const isCritical = alert.severity === 'CRITICAL';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl p-4 shadow-2xl backdrop-blur-xl border transition-all animate-in slide-in-from-bottom-5 duration-300 ${
              isCritical
                ? 'bg-rose-950/90 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
                : 'bg-[#0F172A]/95 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isCritical ? 'bg-rose-400' : 'bg-amber-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isCritical ? 'bg-rose-500' : 'bg-amber-500'
                  }`}></span>
                </span>
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-gray-300">
                  REAL-TIME DETECTION EVENT
                </span>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <SeverityBadge severity={alert.severity} size="sm" />
              <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1">
                {alert.title || 'Security Telemetry Alert'}
              </h4>
            </div>

            <p className="mt-1 text-xs text-gray-300 font-mono line-clamp-2">
              {alert.description}
            </p>

            <div className="mt-3 pt-2 border-t border-gray-700/50 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-mono">
                Src IP: <strong className="text-cyan-400">{alert.sourceIp || 'Internal'}</strong>
              </span>

              <button
                onClick={() => {
                  onDismiss(toast.id);
                  navigate('/alerts');
                }}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono font-medium flex items-center gap-1"
              >
                <span>Triage</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AlertToastContainer;
