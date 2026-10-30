import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Search, 
  Filter, 
  PlusCircle, 
  Radio, 
  Eye, 
  RefreshCw, 
  Clock, 
  ShieldAlert, 
  Check, 
  Copy, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  Database, 
  SlidersHorizontal, 
  X,
  FileCode,
  ArrowRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import JsonViewer from '../components/JsonViewer';
import { logService } from '../services/logService';
import { useSocket } from '../context/WebSocketContext';

const EVENT_TYPES = [
  'ALL',
  'LOGIN',
  'FIREWALL',
  'APPLICATION',
  'DATABASE',
  'NETWORK',
  'PORT_ACCESS',
  'SECURITY_ALERT',
];

const SEVERITIES = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const SAMPLE_TEMPLATES = [
  {
    name: 'Palo Alto FW Block',
    data: {
      sourceName: 'Perimeter Firewall Cluster',
      sourceIp: '203.0.113.19',
      destinationIp: '10.0.0.1',
      username: 'anonymous',
      eventType: 'FIREWALL',
      action: 'CONNECTION_BLOCKED',
      severity: 'MEDIUM',
      message: 'Inbound syn flood probe dropped by firewall policy #104',
      protocol: 'TCP',
      port: 8080,
    },
  },
  {
    name: 'SSH Auth Failure',
    data: {
      sourceName: 'Production Web Server 01',
      sourceIp: '192.168.1.105',
      destinationIp: '192.168.1.20',
      username: 'root',
      eventType: 'LOGIN',
      action: 'LOGIN_FAILED',
      severity: 'HIGH',
      message: 'Failed password for root from 192.168.1.105 port 54228 ssh2',
      protocol: 'TCP',
      port: 22,
    },
  },
  {
    name: 'WAF SQLi Attempt',
    data: {
      sourceName: 'Production Web Server 01',
      sourceIp: '198.51.100.4',
      destinationIp: '192.168.1.20',
      username: 'guest',
      eventType: 'SECURITY_ALERT',
      action: 'SQL_INJECTION_DETECTED',
      severity: 'CRITICAL',
      message: 'WAF Block: SQL Injection signature detected in query param ?id=1 UNION SELECT',
      protocol: 'HTTPS',
      port: 443,
    },
  },
  {
    name: 'RDP Port 3389 Probe',
    data: {
      sourceName: 'Perimeter Firewall Cluster',
      sourceIp: '10.10.4.52',
      destinationIp: '10.0.0.15',
      username: 'anonymous',
      eventType: 'PORT_ACCESS',
      action: 'SUSPICIOUS_PORT_ACCESS',
      severity: 'HIGH',
      message: 'Attempted connection to restricted RDP port 3389',
      protocol: 'TCP',
      port: 3389,
    },
  },
];

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveStream, setIsLiveStream] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedEventType, setSelectedEventType] = useState('ALL');
  const [sourceIpFilter, setSourceIpFilter] = useState('');

  // Expandable row state
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  // Manual Ingestion modal
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [ingestForm, setIngestForm] = useState(SAMPLE_TEMPLATES[0].data);
  const [ingesting, setIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(false);

  const { liveLogs } = useSocket();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: 0,
        size: 150,
      };
      if (selectedSeverity !== 'ALL') params.severity = selectedSeverity;
      if (selectedEventType !== 'ALL') params.eventType = selectedEventType;
      if (search.trim()) params.keyword = search.trim();
      if (sourceIpFilter.trim()) params.sourceIp = sourceIpFilter.trim();

      const data = await logService.getLogs(params);
      const list = Array.isArray(data) ? data : (data?.content || []);
      setLogs(list);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError('Unable to retrieve normalized telemetry logs from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLiveStream) {
      fetchLogs();
    }
  }, [selectedSeverity, selectedEventType, sourceIpFilter]);

  // Live WebSocket updates
  useEffect(() => {
    if (isLiveStream && liveLogs && liveLogs.length > 0) {
      const newest = liveLogs[0];
      setLogs((prev) => [newest, ...prev.filter((l) => l.id !== newest.id)].slice(0, 150));
    }
  }, [liveLogs, isLiveStream]);

  const handleManualIngest = async (e) => {
    e.preventDefault();
    try {
      setIngesting(true);
      setIngestSuccess(false);
      await logService.ingestLog(ingestForm);
      setIngestSuccess(true);
      setTimeout(() => {
        setIsIngestModalOpen(false);
        setIngestSuccess(false);
        fetchLogs();
      }, 1000);
    } catch (err) {
      console.error('Manual ingestion failed:', err);
    } finally {
      setIngesting(false);
    }
  };

  const toggleExpandRow = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.sourceIp?.toLowerCase().includes(q) ||
      log.destinationIp?.toLowerCase().includes(q) ||
      log.username?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.rawLog?.toLowerCase().includes(q) ||
      log.sourceName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-gray-900 dark:text-white uppercase">
              SECURITY LOG EXPLORER
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-bold">
              {filteredLogs.length} LOGS
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
            Normalized Security Telemetry, Raw Payload Inspection & Forensic Queries
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live stream toggle */}
          <button
            onClick={() => setIsLiveStream(!isLiveStream)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-2 ${
              isLiveStream
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-[#0F172A] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-cyan-500'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveStream ? 'animate-pulse text-emerald-500' : ''}`} />
            <span>{isLiveStream ? 'LIVE STREAMING' : 'STATIC SNAPSHOT'}</span>
          </button>

          {/* Ingest Test Event modal button */}
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-mono font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Ingest Telemetry</span>
          </button>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition-all shadow-sm"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchLogs} />}

      {/* Filter and Query Bar */}
      <div className="soc-card p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Search by IP, username, action, payload text..."
              className="soc-input w-full pl-9 pr-4 py-2 text-xs font-mono"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            {sourceIpFilter && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                <span>IP: {sourceIpFilter}</span>
                <button onClick={() => setSourceIpFilter('')} className="hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Event Type:</span>
              <select
                value={selectedEventType}
                onChange={(e) => {
                  setSelectedEventType(e.target.value);
                  setCurrentPage(0);
                }}
                className="soc-input px-2.5 py-1.5 text-xs font-mono"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Severity:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => {
                  setSelectedSeverity(e.target.value);
                  setCurrentPage(0);
                }}
                className="soc-input px-2.5 py-1.5 text-xs font-mono"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Logs Table */}
      {loading && logs.length === 0 ? (
        <TableSkeleton rows={8} cols={6} />
      ) : paginatedLogs.length === 0 ? (
        <div className="soc-card p-8">
          <EmptyState
            icon={Terminal}
            title="No Security Logs Matching Filter"
            description="Try relaxing your search terms or click below to ingest a sample telemetry event."
            actionLabel="Reset Search & Filters"
            onAction={() => {
              setSearch('');
              setSelectedSeverity('ALL');
              setSelectedEventType('ALL');
              setSourceIpFilter('');
            }}
          />
        </div>
      ) : (
        <div className="soc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#0B0F19] text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px]">
                  <th className="p-3 w-8" />
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Source IP &rarr; Destination</th>
                  <th className="p-3">User / Identity</th>
                  <th className="p-3 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {paginatedLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpandRow(log.id)}
                        className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/40 cursor-pointer transition-colors ${
                          isExpanded ? 'bg-cyan-500/5 dark:bg-cyan-500/10' : ''
                        }`}
                      >
                        <td className="p-3 text-center text-gray-400">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-cyan-500" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </td>
                        <td className="p-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-[11px]">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td className="p-3">
                          <SeverityBadge severity={log.severity} size="sm" />
                        </td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[10px]">
                            {log.eventType}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-gray-900 dark:text-gray-100">
                          {log.action}
                        </td>
                        <td className="p-3 font-bold">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSourceIpFilter(log.sourceIp);
                            }}
                            className="text-cyan-600 dark:text-cyan-400 hover:underline"
                            title="Filter by this source IP"
                          >
                            {log.sourceIp}
                          </span>
                          {log.destinationIp && (
                            <span className="text-gray-500 dark:text-gray-400 font-normal">
                              {' '}&rarr; {log.destinationIp}
                              {log.port ? `:${log.port}` : ''}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-purple-600 dark:text-purple-400">
                          {log.username || '-'}
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center justify-end gap-1 font-semibold">
                            <span>Details</span>
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable Row Content: Normalized + Raw JSON Viewer */}
                      {isExpanded && (
                        <tr className="bg-gray-50/90 dark:bg-[#070B14]">
                          <td colSpan={8} className="p-4 border-b border-gray-200 dark:border-gray-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
                              {/* Left: Normalized Structured Metadata */}
                              <div className="soc-card p-4 space-y-3 text-xs font-mono">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
                                  <span className="font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <Database className="w-3.5 h-3.5 text-cyan-500" />
                                    Normalized Schema Attributes
                                  </span>
                                  <span className="text-[10px] text-gray-400">Log ID #{log.id}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <div>
                                    <span className="text-gray-400 block">Origin Source:</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{log.sourceName || 'Perimeter Agent'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block">Protocol / Port:</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{log.protocol || 'TCP'}:{log.port || 'Any'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block">Source IP Address:</span>
                                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{log.sourceIp}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block">Destination IP:</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{log.destinationIp || 'Internal Gateway'}</span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                                  <span className="text-gray-400 block text-[10px]">Event Action:</span>
                                  <span className="font-bold text-gray-800 dark:text-gray-200">{log.action} ({log.eventType})</span>
                                </div>
                              </div>

                              {/* Right: Raw JSON Payload Viewer */}
                              <div>
                                <JsonViewer
                                  data={log.rawLog || log.normalizedData || log}
                                  title="Raw Log Stream Payload"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 bg-gray-50/60 dark:bg-[#0B0F19] border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-gray-500">
            <div className="flex items-center gap-2">
              <span>Displaying</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, filteredLogs.length)}
              </span>
              <span>of</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{filteredLogs.length} events</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-gray-800 dark:text-gray-200 px-2">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingest Telemetry Modal */}
      {isIngestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
              <span className="font-mono font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-500" />
                INGEST CUSTOM TELEMETRY LOG
              </span>
              <button
                onClick={() => setIsIngestModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets */}
            <div className="mb-4">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-2">
                Select Telemetry Simulation Preset:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => setIngestForm(tmpl.data)}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-cyan-500/50 bg-gray-50 dark:bg-[#070B14] text-left hover:text-cyan-500 transition-all truncate"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleManualIngest} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Source Name</label>
                  <input
                    type="text"
                    value={ingestForm.sourceName}
                    onChange={(e) => setIngestForm({ ...ingestForm, sourceName: e.target.value })}
                    className="soc-input w-full p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Source IP</label>
                  <input
                    type="text"
                    value={ingestForm.sourceIp}
                    onChange={(e) => setIngestForm({ ...ingestForm, sourceIp: e.target.value })}
                    className="soc-input w-full p-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                  <select
                    value={ingestForm.eventType}
                    onChange={(e) => setIngestForm({ ...ingestForm, eventType: e.target.value })}
                    className="soc-input w-full p-2"
                  >
                    {EVENT_TYPES.filter((t) => t !== 'ALL').map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Action</label>
                  <input
                    type="text"
                    value={ingestForm.action}
                    onChange={(e) => setIngestForm({ ...ingestForm, action: e.target.value })}
                    className="soc-input w-full p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                  <select
                    value={ingestForm.severity}
                    onChange={(e) => setIngestForm({ ...ingestForm, severity: e.target.value })}
                    className="soc-input w-full p-2"
                  >
                    {SEVERITIES.filter((s) => s !== 'ALL').map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Message Payload</label>
                <textarea
                  value={ingestForm.message}
                  onChange={(e) => setIngestForm({ ...ingestForm, message: e.target.value })}
                  rows={2}
                  className="soc-input w-full p-2"
                  required
                />
              </div>

              {ingestSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Telemetry successfully normalized and ingested! Evaluators running...</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsIngestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={ingesting}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold disabled:opacity-50"
                >
                  {ingesting ? 'Transmitting...' : 'Ingest Log Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;
