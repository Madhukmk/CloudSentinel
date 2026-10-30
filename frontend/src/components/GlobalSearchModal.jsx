import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { 
  Search, 
  X, 
  Terminal, 
  ShieldAlert, 
  Flame, 
  Cpu, 
  Server, 
  ArrowRight,
  Clock,
  Loader2
} from 'lucide-react';
import SeverityBadge from './SeverityBadge';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  // Handle Cmd+K / Ctrl+K and ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await dashboardService.search(query.trim());
        setResults(data);
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  const logs = results?.logs?.items || [];
  const alerts = results?.alerts?.items || [];
  const incidents = results?.incidents?.items || [];
  const rules = results?.rules?.items || [];
  const sources = results?.sources?.items || [];
  const totalMatches = results?.totalMatches || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search IP, username, alert title, rule name, or log payload..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-gray-900 dark:text-gray-100 placeholder-gray-500"
          />
          {loading && <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700">
            ESC
          </span>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {!query && (
            <div className="py-10 text-center text-xs font-mono text-gray-400">
              <p>Type to search across telemetry logs, active alerts, cases, rules, and sources.</p>
              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-gray-500">
                <span>Try searching:</span>
                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800/80 text-cyan-500 cursor-pointer" onClick={() => setQuery('192.168.1.')}>192.168.1.</span>
                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800/80 text-cyan-500 cursor-pointer" onClick={() => setQuery('admin')}>admin</span>
                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800/80 text-cyan-500 cursor-pointer" onClick={() => setQuery('Brute')}>Brute</span>
              </div>
            </div>
          )}

          {query && !loading && totalMatches === 0 && (
            <div className="py-10 text-center text-xs font-mono text-gray-400">
              No matching security records found for "<strong className="text-gray-200">{query}</strong>".
            </div>
          )}

          {/* Alerts Results */}
          {alerts.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-800/80 mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Alerts ({results?.alerts?.count})
                </span>
                <button
                  onClick={() => handleSelect('/alerts')}
                  className="text-[10px] font-mono text-cyan-500 hover:underline flex items-center gap-1"
                >
                  View All &rarr;
                </button>
              </div>
              <div className="space-y-1.5">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleSelect('/alerts')}
                    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700/60 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <SeverityBadge severity={a.severity} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 font-mono">
                          {a.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                          Source: {a.sourceIp} &bull; Rule: {a.ruleName || 'Automated'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incidents Results */}
          {incidents.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-800/80 mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Incidents ({results?.incidents?.count})
                </span>
                <button
                  onClick={() => handleSelect('/incidents')}
                  className="text-[10px] font-mono text-cyan-500 hover:underline flex items-center gap-1"
                >
                  View All &rarr;
                </button>
              </div>
              <div className="space-y-1.5">
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => handleSelect('/incidents')}
                    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700/60 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                        {inc.status}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 font-mono">
                          {inc.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                          Assignee: {inc.assignedTo || 'Unassigned'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs Results */}
          {logs.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-800/80 mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Logs ({results?.logs?.count})
                </span>
                <button
                  onClick={() => handleSelect('/logs')}
                  className="text-[10px] font-mono text-cyan-500 hover:underline flex items-center gap-1"
                >
                  View All &rarr;
                </button>
              </div>
              <div className="space-y-1.5">
                {logs.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => handleSelect('/logs')}
                    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700/60 flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-gray-800 dark:text-gray-200">
                          {l.action}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {l.eventType}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                        {l.sourceIp} &rarr; {l.destinationIp || 'Internal'} {l.username ? `(${l.username})` : ''}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules Results */}
          {rules.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-800/80 mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-500 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Detection Rules ({rules.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {rules.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleSelect('/rules')}
                    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700/60 flex items-center justify-between transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 font-mono">
                        {r.ruleName}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                        Condition: {r.conditionType} &bull; Threshold: {r.threshold} &bull; Cooldown: {r.cooldownMinutes || r.timeWindow}m
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources Results */}
          {sources.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 dark:border-gray-800/80 mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  Log Sources ({sources.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {sources.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect('/sources')}
                    className="p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700/60 flex items-center justify-between transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 font-mono">
                        {s.name} ({s.ipAddress})
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                        Type: {s.sourceType} &bull; Status: {s.status}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-[#070B14] border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>Search query: {query ? `"${query}"` : 'None'}</span>
          <span>{totalMatches} matches found</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
