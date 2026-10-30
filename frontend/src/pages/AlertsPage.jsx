import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Ban, 
  Eye, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  X,
  CheckSquare,
  Square,
  ArrowUpDown,
  FileCode,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import JsonViewer from '../components/JsonViewer';
import { alertService } from '../services/alertService';
import { incidentService } from '../services/incidentService';
import { logService } from '../services/logService';
import { useSocket } from '../context/WebSocketContext';
import { useNavigate } from 'react-router-dom';

const STATUS_FILTERS = ['ALL', 'NEW', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_POSITIVE'];
const SEVERITY_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState('detectedAt');
  const [sortAsc, setSortAsc] = useState(false);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Detail Drawer
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [associatedLog, setAssociatedLog] = useState(null);
  const [logLoading, setLogLoading] = useState(false);

  // Escalate to incident modal
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateAlert, setEscalateAlert] = useState(null);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState('HIGH');
  const [incidentAssignee, setIncidentAssignee] = useState('analyst@cloudsentinel.com');
  const [escalating, setEscalating] = useState(false);

  const { liveAlerts } = useSocket();
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: 0,
        size: 100, // Fetch top slice for SOC triage
      };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      const data = await alertService.getAlerts(params);
      const list = Array.isArray(data) ? data : (data?.content || []);
      setAlerts(list);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError('Failed to retrieve security alerts from SOC repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    setSelectedIds(new Set());
  }, [statusFilter, severityFilter]);

  // Prepend new alerts received via WebSocket
  useEffect(() => {
    if (liveAlerts && liveAlerts.length > 0) {
      const newest = liveAlerts[0];
      setAlerts((prev) => [newest, ...prev.filter((a) => a.id !== newest.id)]);
    }
  }, [liveAlerts]);

  // Fetch linked log when an alert is selected in the investigation drawer
  useEffect(() => {
    if (selectedAlert && selectedAlert.logId) {
      setLogLoading(true);
      logService.getLogById(selectedAlert.logId)
        .then((log) => setAssociatedLog(log))
        .catch(() => setAssociatedLog(null))
        .finally(() => setLogLoading(false));
    } else {
      setAssociatedLog(null);
    }
  }, [selectedAlert]);

  const handleStatusUpdate = async (id, action) => {
    try {
      let updated;
      if (action === 'ack') {
        updated = await alertService.acknowledge(id);
      } else if (action === 'res') {
        updated = await alertService.resolve(id);
      } else if (action === 'fp') {
        updated = await alertService.markFalsePositive(id);
      }
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
      );
      if (selectedAlert && selectedAlert.id === id) {
        setSelectedAlert((prev) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.error('Failed to update alert status:', err);
    }
  };

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAlerts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAlerts.map((a) => a.id)));
    }
  };

  const toggleSelectAlert = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    try {
      setBulkProcessing(true);
      const ids = Array.from(selectedIds);
      if (action === 'ack') {
        await alertService.bulkAcknowledge(ids);
      } else if (action === 'res') {
        await alertService.bulkResolve(ids);
      }
      // Update locally
      setAlerts((prev) =>
        prev.map((a) =>
          selectedIds.has(a.id)
            ? { ...a, status: action === 'ack' ? 'ACKNOWLEDGED' : 'RESOLVED' }
            : a
        )
      );
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Bulk action failed:', err);
    } finally {
      setBulkProcessing(false);
    }
  };

  const openEscalateModal = (alert) => {
    setEscalateAlert(alert);
    setIncidentTitle(`Incident: ${alert.title}`);
    setIncidentDescription(
      `Escalated from SIEM Alert #${alert.id} (${alert.ruleName || 'Automated Rule'}):\n${alert.description}\nOrigin Source IP: ${alert.sourceIp}`
    );
    setIncidentSeverity(alert.severity || 'HIGH');
    setEscalateModalOpen(true);
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    try {
      setEscalating(true);
      await incidentService.createIncident({
        alertId: escalateAlert.id,
        title: incidentTitle,
        description: incidentDescription,
        severity: incidentSeverity,
        assignedTo: incidentAssignee,
      });
      await handleStatusUpdate(escalateAlert.id, 'ack');
      setEscalateModalOpen(false);
      navigate('/incidents');
    } catch (err) {
      console.error('Failed to escalate to incident:', err);
    } finally {
      setEscalating(false);
    }
  };

  // Generate dynamic explanation based on rule data
  const getDetectionExplanation = (alert) => {
    const rule = alert.ruleName || '';
    if (rule.toLowerCase().includes('brute') || rule.toLowerCase().includes('failed')) {
      return `Multiple authentication failures (LOGIN_FAILED) originated from ${alert.sourceIp} exceeding the configured sliding threshold within 5 minutes.`;
    } else if (rule.toLowerCase().includes('port') || rule.toLowerCase().includes('suspicious')) {
      return `Targeted connection attempt recorded against a high-risk service port from external source IP ${alert.sourceIp}. Evaluated against the active network perimeter threat catalogue.`;
    } else if (rule.toLowerCase().includes('correlation') || rule.toLowerCase().includes('account takeover')) {
      return `Critical Multi-Stage Correlation: Multiple failed logins were closely followed by a successful login from ${alert.sourceIp}, matching an account compromise signature.`;
    } else if (rule.toLowerCase().includes('critical')) {
      return `Explicit CRITICAL telemetry severity marker encountered in raw ingestion payload. Elevated directly to high-priority alert without threshold waiting.`;
    }
    return `Security anomaly detected by automated rule "${rule}". Telemetry patterns violated defined baseline policies.`;
  };

  // Filtering & Sorting
  const filteredAlerts = alerts.filter((a) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      a.title?.toLowerCase().includes(term) ||
      a.ruleName?.toLowerCase().includes(term) ||
      a.sourceIp?.toLowerCase().includes(term) ||
      a.description?.toLowerCase().includes(term)
    );
  }).sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === 'detectedAt') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(filteredAlerts.length / pageSize) || 1;
  const paginatedAlerts = filteredAlerts.slice(
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
              THREAT ALERT CENTER
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold">
              {filteredAlerts.length} DETECTIONS
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
            Real-time Threat Triage, Correlation Analysis & Case Escalation
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 hover:border-cyan-500/40 text-gray-700 dark:text-gray-300 hover:text-cyan-500 text-xs font-mono font-medium transition-all shadow-sm flex items-center gap-2"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Sync Triage Feed</span>
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={fetchAlerts} />}

      {/* Filter and Search Bar */}
      <div className="soc-card p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Filter by title, rule, IP address, or details..."
              className="soc-input w-full pl-9 pr-4 py-2 text-xs font-mono"
            />
          </div>

          {/* Status and Severity Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="soc-input px-2.5 py-1.5 text-xs font-mono"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="soc-input px-2.5 py-1.5 text-xs font-mono"
              >
                {SEVERITY_FILTERS.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions Floating Bar when items selected */}
        {selectedIds.size > 0 && (
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-300 font-bold">
              <CheckSquare className="w-4 h-4" />
              <span>{selectedIds.size} alert(s) selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('ack')}
                disabled={bulkProcessing}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                Acknowledge All
              </button>

              <button
                onClick={() => handleBulkAction('res')}
                disabled={bulkProcessing}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                Resolve All
              </button>

              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-mono text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Alert Table */}
      {loading ? (
        <TableSkeleton rows={8} cols={7} />
      ) : paginatedAlerts.length === 0 ? (
        <div className="soc-card p-8">
          <EmptyState
            icon={ShieldCheck}
            title="No Security Alerts Found"
            description="Your environment currently has no security alerts matching the selected filters. Telemetry engine continues normal monitoring."
            actionLabel="Clear Filter Criteria"
            onAction={() => {
              setStatusFilter('ALL');
              setSeverityFilter('ALL');
              setSearch('');
            }}
          />
        </div>
      ) : (
        <div className="soc-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#0B0F19] text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px]">
                  <th className="p-3 w-10 text-center">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-400 hover:text-cyan-500"
                      title="Select all on current page"
                    >
                      {selectedIds.size === filteredAlerts.length && filteredAlerts.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-cyan-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3 cursor-pointer hover:text-cyan-500" onClick={() => { setSortField('severity'); setSortAsc(!sortAsc); }}>
                    <div className="flex items-center gap-1">
                      <span>Severity</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3">Alert Detection</th>
                  <th className="p-3">Detection Rule</th>
                  <th className="p-3">Source IP</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 cursor-pointer hover:text-cyan-500" onClick={() => { setSortField('detectedAt'); setSortAsc(!sortAsc); }}>
                    <div className="flex items-center gap-1">
                      <span>Detected At</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {paginatedAlerts.map((alert) => {
                  const isSelected = selectedIds.has(alert.id);
                  return (
                    <tr
                      key={alert.id}
                      className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors ${
                        isSelected ? 'bg-cyan-500/5 dark:bg-cyan-500/10' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleSelectAlert(alert.id)}
                          className="text-gray-400 hover:text-cyan-500"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-cyan-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <SeverityBadge severity={alert.severity} size="sm" />
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="text-left font-bold text-gray-900 dark:text-gray-100 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors line-clamp-1 cursor-pointer"
                        >
                          {alert.title}
                        </button>
                        <span className="text-[11px] text-gray-400 line-clamp-1">
                          #{alert.id} &bull; {alert.description}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700 dark:text-gray-300 font-semibold truncate max-w-xs">
                        {alert.ruleName || 'Heuristic Anomaly'}
                      </td>
                      <td className="p-3 text-cyan-600 dark:text-cyan-400 font-bold">
                        {alert.sourceIp || '127.0.0.1'}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={alert.status} />
                      </td>
                      <td className="p-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-[11px]">
                        {alert.detectedAt ? new Date(alert.detectedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-cyan-500/50 text-gray-500 hover:text-cyan-500 transition-all"
                            title="Inspect Alert Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {alert.status === 'NEW' && (
                            <button
                              onClick={() => handleStatusUpdate(alert.id, 'ack')}
                              className="px-2 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 text-[10px] font-bold transition-all"
                            >
                              ACK
                            </button>
                          )}

                          {alert.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleStatusUpdate(alert.id, 'res')}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-[10px] font-bold transition-all"
                            >
                              Resolve
                            </button>
                          )}

                          <button
                            onClick={() => openEscalateModal(alert)}
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
                            title="Escalate to Incident Case"
                          >
                            <Flame className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-3 bg-gray-50/60 dark:bg-[#0B0F19] border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-gray-500">
            <div className="flex items-center gap-2">
              <span>Showing</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, filteredAlerts.length)}
              </span>
              <span>of</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{filteredAlerts.length} alerts</span>
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

      {/* Slide-over Alert Investigation Drawer */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl h-full bg-white dark:bg-[#0F172A] border-l border-gray-200 dark:border-gray-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between space-y-6 animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SeverityBadge severity={selectedAlert.severity} />
                    <StatusBadge status={selectedAlert.status} />
                    <span className="text-xs font-mono text-gray-400">ID #{selectedAlert.id}</span>
                  </div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white font-mono">
                    {selectedAlert.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detection Explanation Box (Section 12 requirement) */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold font-mono mb-1">
                  <Activity className="w-4 h-4" />
                  <span>Detection Engine Analysis</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
                  {getDetectionExplanation(selectedAlert)}
                </p>
              </div>

              {/* Core Telemetry Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#070B14] border border-gray-200 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] uppercase">Origin Source IP</span>
                  <p className="font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{selectedAlert.sourceIp}</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#070B14] border border-gray-200 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] uppercase">Detection Rule</span>
                  <p className="font-bold text-purple-600 dark:text-purple-400 mt-0.5 truncate">{selectedAlert.ruleName || 'Automated'}</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#070B14] border border-gray-200 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] uppercase">Detection Timestamp</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                    {selectedAlert.detectedAt ? new Date(selectedAlert.detectedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#070B14] border border-gray-200 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] uppercase">Triaged By</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                    {selectedAlert.acknowledgedBy || 'Pending Triage'}
                  </p>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1 text-xs font-mono">
                <span className="text-gray-400 uppercase font-bold text-[10px]">Alert Details</span>
                <p className="p-3 rounded-xl bg-gray-50 dark:bg-[#070B14] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedAlert.description}
                </p>
              </div>

              {/* Associated Log Raw Payload */}
              <div className="space-y-2">
                <span className="text-gray-400 uppercase font-bold text-[10px] font-mono">
                  Originating Security Log Telemetry
                </span>
                {logLoading ? (
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse font-mono text-xs text-gray-400">
                    Loading linked log payload...
                  </div>
                ) : associatedLog ? (
                  <JsonViewer
                    data={associatedLog.rawLog || associatedLog.normalizedData || associatedLog}
                    title={`Log Event #${associatedLog.id} (${associatedLog.action || 'PAYLOAD'})`}
                  />
                ) : (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#070B14] border border-gray-200 dark:border-gray-800 text-xs text-gray-400 font-mono">
                    Direct log telemetry reference not indexed for this alert.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar in Drawer */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedAlert.status === 'NEW' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedAlert.id, 'ack')}
                    className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-mono text-xs font-bold transition-all shadow-sm"
                  >
                    Acknowledge
                  </button>
                )}

                {selectedAlert.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedAlert.id, 'res')}
                    className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-bold transition-all shadow-sm"
                  >
                    Mark Resolved
                  </button>
                )}

                {selectedAlert.status !== 'FALSE_POSITIVE' && (
                  <button
                    onClick={() => handleStatusUpdate(selectedAlert.id, 'fp')}
                    className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-mono text-xs transition-all"
                  >
                    False Positive
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  const alert = selectedAlert;
                  setSelectedAlert(null);
                  openEscalateModal(alert);
                }}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Flame className="w-4 h-4" />
                <span>Escalate Incident</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate to Incident Modal */}
      {escalateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-amber-500 font-mono font-bold text-sm">
                <Flame className="w-5 h-5" />
                <span>ESCALATE TO FORMAL INCIDENT</span>
              </div>
              <button
                onClick={() => setEscalateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Incident Title</label>
                <input
                  type="text"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="soc-input w-full p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                  <select
                    value={incidentSeverity}
                    onChange={(e) => setIncidentSeverity(e.target.value)}
                    className="soc-input w-full p-2.5"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Assignee Analyst</label>
                  <input
                    type="text"
                    value={incidentAssignee}
                    onChange={(e) => setIncidentAssignee(e.target.value)}
                    className="soc-input w-full p-2.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Investigation Scope & Summary</label>
                <textarea
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  rows={4}
                  className="soc-input w-full p-2.5"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEscalateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={escalating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                >
                  {escalating ? 'Creating Incident...' : 'Confirm Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
