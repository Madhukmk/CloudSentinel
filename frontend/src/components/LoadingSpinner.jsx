import React from 'react';
import { Shield } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading SOC Telemetry...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] text-center">
      <div className="relative flex items-center justify-center mb-4">
        {/* Outer pulsating radar ring */}
        <div className="absolute w-20 h-20 rounded-full border border-cyan-500/20 animate-ping opacity-30" />
        {/* Spinning gradient ring */}
        <div className="w-16 h-16 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-cyan-600/30 border-l-transparent animate-spin" />
        {/* Center Shield Icon */}
        <div className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-cyan-950/60 border border-cyan-500/30">
          <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-mono text-cyan-400/80 tracking-wider uppercase">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
