import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  Download, 
  User, 
  ShieldCheck, 
  Activity, 
  Calendar, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Terminal,
  ArrowUpDown
} from 'lucide-react';
import { auditService } from '../services/auditService';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const ACTION_COLORS = {
  USER_LOGIN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  USER_LOGOUT: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  USER_REGISTER: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  USER_CREATE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  USER_UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  USER_DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  RULE_CREATE: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  RULE_UPDATE: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  RULE_TOGGLE: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  ALERT_ACKNOWLEDGE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  ALERT_RESOLVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  INCIDENT_CREATE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  INCIDENT_STATUS_CHANGE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  NOTE_ADD: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  NOTE_UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  NOTE_DELETE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: pageSize,
      };
      if (userFilter.trim()) params.username = userFilter.trim();
      if (actionFilter !== 'ALL') params.action = actionFilter;

      const data = await auditService.getAuditLogs(params);
      if (data && data.content) {
        setLogs(data.content);
        setTotalElements(data.totalElements || data.content.length);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setLogs(data);
        setTotalElements(data.length);
        setTotalPages(Math.ceil(data.length / pageSize) || 1);
      } else {
        setLogs([]);
        setTotalElements(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, pageSize, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchAuditLogs();
  };

  const handleExportCsv = () => {
    if (!logs.length) return;
    const headers = ['ID', 'Timestamp', 'Username', 'Action', 'Description', 'IP Address'];
    const rows = logs.map((l) => [
      l.id,
      `"${l.timestamp || ''}"`,
      `"${l.username || ''}"`,
      `"${l.action || ''}"`,
      `"${(l.details || l.description || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cloudsentinel_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter(
      (l) =>
        l.username?.toLowerCase().includes(term) ||
        l.action?.toLowerCase().includes(term) ||
        (l.details || l.description || '')?.toLowerCase().includes(term) ||
        l.ipAddress?.toLowerCase().includes(term)
    );
  }, [logs, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            SOC COMPLIANCE & AUDIT TRAIL
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            Immutable administrative event logging, user actions, policy changes, and incident lifecycle tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={!logs.length}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-gray-500 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchAuditLogs}
            className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-gray-500 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="text-[11px] font-mono text-[var(--text-muted)] mb-1">AUDIT RECORDS</div>
          <div className="text-xl font-bold font-mono text-[var(--text-primary)]">{totalElements}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="text-[11px] font-mono text-[var(--text-muted)] mb-1">PAGE VIEW</div>
          <div className="text-xl font-bold font-mono text-cyan-400">{page + 1} / {totalPages || 1}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="text-[11px] font-mono text-[var(--text-muted)] mb-1">COMPLIANCE RETENTION</div>
          <div className="text-xl font-bold font-mono text-emerald-400">90 DAYS</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="text-[11px] font-mono text-[var(--text-muted)] mb-1">INTEGRITY HASH</div>
          <div className="text-xl font-bold font-mono text-purple-400 truncate">SHA-256</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail by actor, action description, or IP..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs font-mono text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="Filter by Actor..."
              className="w-36 px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs font-mono text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />

            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Action: All</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="USER_LOGOUT">USER_LOGOUT</option>
              <option value="USER_CREATE">USER_CREATE</option>
              <option value="USER_UPDATE">USER_UPDATE</option>
              <option value="USER_DELETE">USER_DELETE</option>
              <option value="RULE_CREATE">RULE_CREATE</option>
              <option value="RULE_UPDATE">RULE_UPDATE</option>
              <option value="ALERT_ACKNOWLEDGE">ALERT_ACKNOWLEDGE</option>
              <option value="ALERT_RESOLVE">ALERT_RESOLVE</option>
              <option value="INCIDENT_CREATE">INCIDENT_CREATE</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition-all cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-4">
            <LoadingSkeleton type="table" count={10} />
          </div>
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Audit Records Found"
            description="No administrative activities match your search parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Audit Details</th>
                  <th className="py-3 px-4">Origin IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredLogs.map((log) => {
                  const actionStyle = ACTION_COLORS[log.action] || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
                  
                  return (
                    <tr 
                      key={log.id} 
                      className="hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-[var(--text-secondary)]">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                      </td>
                      
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                            {log.username ? log.username[0].toUpperCase() : 'U'}
                          </div>
                          <span className="font-bold text-[var(--text-primary)]">
                            {log.username || 'SYSTEM'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${actionStyle}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[var(--text-secondary)] max-w-md break-words">
                        {log.details || log.description || 'Action completed successfully'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-cyan-400 font-bold">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3 bg-[var(--bg-input)] border-t border-[var(--border-color)] flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--text-muted)] text-[11px]">
            Showing {filteredLogs.length} of {totalElements} audit entries
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-[var(--text-secondary)]">
              Page {page + 1} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
