import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  ShieldAlert, 
  Flame, 
  Server, 
  RefreshCw, 
  Activity, 
  Crosshair, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Percent,
  Play,
  Pause,
  Filter,
  Search,
  Zap,
  Globe,
  Radio,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import { StatGridSkeleton, ChartSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { dashboardService } from '../services/dashboardService';
import { alertService } from '../services/alertService';
import { useSocket } from '../context/WebSocketContext';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Legend
} from 'recharts';

const SEVERITY_COLORS = {
  CRITICAL: '#F43F5E',
  HIGH: '#FB923C',
  MEDIUM: '#FBBF24',
  LOW: '#10B981',
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [eventsOverTime, setEventsOverTime] = useState([]);
  const [alertsBySeverity, setAlertsBySeverity] = useState([]);
  const [logsBySource, setLogsBySource] = useState([]);
  const [detectionActivity, setDetectionActivity] = useState([]);
  const [topIps, setTopIps] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live stream controls
  const [streamPaused, setStreamPaused] = useState(false);
  const [streamSeverity, setStreamSeverity] = useState('ALL');
  const [streamSearch, setStreamSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const streamEndRef = useRef(null);

  const { liveStats, liveAlerts, liveLogs, connectionStatus } = useSocket();

  const fetchDashboardData = async (range = timeRange) => {
    try {
      setLoading(true);
      setError(null);
      const results = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getEventsOverTime(range),
        dashboardService.getAlertsBySeverity(),
        dashboardService.getLogsBySource(),
        dashboardService.getDetectionActivity(),
        dashboardService.getTopSourceIps(),
        dashboardService.getRecentAlerts(),
        dashboardService.getRecentLogs(),
      ]);

      const [
        statsRes,
        eventsRes,
        severityRes,
        sourceRes,
        detectionRes,
        topIpsRes,
        alertsRes,
        logsRes,
      ] = results;

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      } else if (statsRes.status === 'rejected') {
        console.error('Stats request failed:', statsRes.reason);
        setError('Unable to synchronize telemetry metrics with SOC backend.');
      }

      if (eventsRes.status === 'fulfilled') setEventsOverTime(eventsRes.value || []);
      if (severityRes.status === 'fulfilled') setAlertsBySeverity(severityRes.value || []);
      if (sourceRes.status === 'fulfilled') setLogsBySource(sourceRes.value || []);
      if (detectionRes.status === 'fulfilled') setDetectionActivity(detectionRes.value || []);
      if (topIpsRes.status === 'fulfilled') setTopIps(topIpsRes.value || []);
      if (alertsRes.status === 'fulfilled') setRecentAlerts(alertsRes.value || []);
      if (logsRes.status === 'fulfilled') setRecentLogs(logsRes.value || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to synchronize telemetry metrics with SOC backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeRange);
  }, [timeRange]);

  // Update stats if received live via WebSocket
  useEffect(() => {
    if (liveStats) {
      setStats((prev) => ({ ...prev, ...liveStats }));
    }
  }, [liveStats]);

  // Prepend live alert if received
  useEffect(() => {
    if (liveAlerts && liveAlerts.length > 0) {
      const newest = liveAlerts[0];
      setRecentAlerts((prev) => [newest, ...prev.filter((a) => a.id !== newest.id)].slice(0, 10));
      setStats((prev) => prev ? { ...prev, activeAlerts: prev.activeAlerts + 1 } : prev);
    }
  }, [liveAlerts]);

  // Prepend live log if received
  useEffect(() => {
    if (liveLogs && liveLogs.length > 0 && !streamPaused) {
      const newest = liveLogs[0];
      setRecentLogs((prev) => [newest, ...prev.filter((l) => l.id !== newest.id)].slice(0, 25));
      setStats((prev) => prev ? { ...prev, totalLogs: prev.totalLogs + 1 } : prev);
    }
  }, [liveLogs, streamPaused]);

  // Auto-scroll stream if enabled
  useEffect(() => {
    if (autoScroll && streamEndRef.current && !streamPaused) {
      streamEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [recentLogs, autoScroll, streamPaused]);

  const handleTriage = async (alertId, action) => {
    try {
      if (action === 'ack') {
        await alertService.acknowledge(alertId);
      } else if (action === 'res') {
        await alertService.resolve(alertId);
      }
      setRecentAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, status: action === 'ack' ? 'ACKNOWLEDGED' : 'RESOLVED' }
            : a
        )
      );
    } catch (err) {
      console.error('Triage failed:', err);
    }
  };

  const filteredLogs = recentLogs.filter((log) => {
    if (streamSeverity !== 'ALL' && log.severity !== streamSeverity) return false;
    if (streamSearch.trim()) {
      const query = streamSearch.toLowerCase();
      const matchIp = log.sourceIp?.toLowerCase().includes(query);
      const matchAction = log.action?.toLowerCase().includes(query);
      const matchUser = log.username?.toLowerCase().includes(query);
      return matchIp || matchAction || matchUser;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-gray-900 dark:text-white uppercase">
              SOC COMMAND CENTER
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-bold">
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
            Real-time Threat Detection, Sensor Health & Incident Operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center bg-gray-100 dark:bg-[#0F172A] p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-mono">
            {['1h', '6h', '24h', '7d'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeRange === r
                    ? 'bg-cyan-500 text-white font-bold shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-cyan-500'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchDashboardData(timeRange)}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] text-gray-600 dark:text-gray-300 hover:text-cyan-500 hover:border-cyan-500/40 transition-all shadow-sm"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => fetchDashboardData(timeRange)} />}

      {/* 6 Real Backend KPI Cards */}
      {loading && !stats ? (
        <StatGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Security Events"
            value={stats?.totalLogs ?? 0}
            icon={Terminal}
            color="blue"
            subtitle={`${stats?.eventsToday ?? 0} today`}
            tooltip="Total normalized telemetry logs ingested across all sources"
          />

          <StatCard
            title="Critical Alerts"
            value={stats?.criticalAlerts ?? 0}
            icon={AlertTriangle}
            color="rose"
            trend={stats?.criticalAlerts > 0 ? 'URGENT' : 'ZERO'}
            trendUp={stats?.criticalAlerts === 0}
            subtitle="Requires immediate triage"
            tooltip="Active unmitigated critical security violations"
          />

          <StatCard
            title="High Alerts"
            value={stats?.highAlerts ?? 0}
            icon={ShieldAlert}
            color="amber"
            subtitle="Priority triage queue"
            tooltip="High severity threats detected by correlation rules"
          />

          <StatCard
            title="Open Incidents"
            value={stats?.openIncidents ?? 0}
            icon={Flame}
            color="purple"
            subtitle="Under investigation"
            tooltip="Formally escalated security incident investigations"
          />

          <StatCard
            title="Detection Rate"
            value={`${stats?.detectionRate ?? 0}%`}
            icon={Percent}
            color="cyan"
            subtitle={`${stats?.totalAlerts ?? stats?.activeAlerts ?? 0} alerts total`}
            tooltip="Percentage of ingested security events that generated alert detections"
          />

          <StatCard
            title="Active Sources"
            value={stats?.activeSources ?? 0}
            icon={Server}
            color="emerald"
            subtitle="Sensors transmitting"
            tooltip="Monitored firewalls, web servers, databases, and auth agents"
          />
        </div>
      )}

      {/* Charts Row 1: Events Over Time + Alerts by Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Events Over Time (Area Chart) */}
        <div className="lg:col-span-2 soc-card p-5">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" />
                Security Events Telemetry Trend ({timeRange.toUpperCase()})
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                Log ingestion volume distribution over the sliding window
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold">
              HOURLY BINS
            </span>
          </div>

          <div className="h-68 w-full pt-2">
            {eventsOverTime.length === 0 ? (
              <EmptyState title="No Telemetry Data" description="Ingesting live security events..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={eventsOverTime}>
                  <defs>
                    <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.25} />
                  <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1F2937',
                      borderRadius: '0.75rem',
                      color: '#F3F4F6',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="events"
                    name="Logs"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#eventGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Alerts by Severity (Donut Chart) */}
        <div className="soc-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                Alerts by Severity
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                Threat risk classification
              </p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {alertsBySeverity.every((s) => s.count === 0) ? (
              <EmptyState title="No Active Alerts" description="No security anomalies classified." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertsBySeverity}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={76}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="severity"
                  >
                    {alertsBySeverity.map((entry) => (
                      <Cell
                        key={entry.severity}
                        fill={SEVERITY_COLORS[entry.severity] || '#9CA3AF'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1F2937',
                      borderRadius: '0.75rem',
                      color: '#F3F4F6',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Severity Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            {alertsBySeverity.map((sev) => (
              <div key={sev.severity} className="flex items-center justify-between text-xs font-mono p-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: SEVERITY_COLORS[sev.severity] }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">{sev.severity}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-gray-100">{sev.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Logs by Source + Detection Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Logs by Source (Bar Chart) */}
        <div className="soc-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-2">
            <div>
              <h2 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-500" />
                Telemetry Volume by Source
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                Log counts per sensor origin device
              </p>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            {logsBySource.length === 0 ? (
              <EmptyState title="No Sources Found" description="Register a log source or launch attack lab." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={logsBySource}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="source" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1F2937',
                      borderRadius: '0.75rem',
                      color: '#F3F4F6',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar dataKey="count" name="Logs" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Detection Activity by Rule (Bar Chart) */}
        <div className="soc-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-2">
            <div>
              <h2 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                Detection Rule Trigger Breakdown
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                Threat rules generating active SOC detections
              </p>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            {detectionActivity.length === 0 ? (
              <EmptyState title="No Rule Detections" description="No detection rules currently triggered." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detectionActivity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis type="number" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="rule" type="category" width={140} stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1F2937',
                      borderRadius: '0.75rem',
                      color: '#F3F4F6',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Bar dataKey="count" name="Alerts" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Live Security Event Stream & Top Attack Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Security Event Stream Panel */}
        <div className="lg:col-span-2 soc-card p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h2 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-gray-100">
                LIVE SECURITY EVENT STREAM
              </h2>
            </div>

            {/* Stream Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Severity filter */}
              <select
                value={streamSeverity}
                onChange={(e) => setStreamSeverity(e.target.value)}
                className="soc-input px-2 py-1 text-xs font-mono"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {/* Search filter */}
              <div className="relative">
                <input
                  type="text"
                  value={streamSearch}
                  onChange={(e) => setStreamSearch(e.target.value)}
                  placeholder="Filter IP, action..."
                  className="soc-input pl-7 pr-2 py-1 text-xs font-mono w-32 sm:w-40"
                />
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-2" />
              </div>

              {/* Pause / Resume Button */}
              <button
                onClick={() => setStreamPaused(!streamPaused)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all ${
                  streamPaused
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                }`}
                title={streamPaused ? 'Resume Real-time Stream' : 'Pause Stream'}
              >
                {streamPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span>{streamPaused ? 'PAUSED' : 'STREAMING'}</span>
              </button>
            </div>
          </div>

          {/* Event Stream Log Rows */}
          <div className="space-y-2 overflow-y-auto max-h-96 pr-1 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Radio className="w-8 h-8 text-cyan-500 mx-auto mb-2 animate-pulse" />
                <p>Waiting for security telemetry stream packets...</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-[#070B14]/80 border border-gray-200/80 dark:border-gray-800/80 hover:border-cyan-500/40 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'NOW'}
                      </span>
                      <SeverityBadge severity={log.severity} size="sm" />
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {log.action}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {log.eventType}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-600 dark:text-gray-400">
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{log.sourceIp}</span>
                      {log.destinationIp && (
                        <span> &rarr; <span className="text-gray-700 dark:text-gray-300">{log.destinationIp}{log.port ? `:${log.port}` : ''}</span></span>
                      )}
                      {log.username && (
                        <span className="ml-2 text-purple-600 dark:text-purple-400">user: {log.username}</span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/logs"
                    className="text-gray-400 hover:text-cyan-500 p-1"
                    title="Inspect in Log Explorer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
            <div ref={streamEndRef} />
          </div>
        </div>

        {/* Top Attacking Source IPs */}
        <div className="soc-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
              <h2 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-500" />
                Top Source Addresses
              </h2>
              <span className="text-[10px] font-mono text-gray-400">FREQUENT ORIGINS</span>
            </div>

            <div className="space-y-3">
              {topIps.length === 0 ? (
                <EmptyState title="No Source IPs" description="Telemetry address map is clear." />
              ) : (
                topIps.map((item, idx) => {
                  const maxCount = topIps[0]?.count || 1;
                  const pct = Math.min(100, Math.round((item.count / maxCount) * 100));

                  return (
                    <div key={item.ip} className="space-y-1 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {idx + 1}. {item.ip}
                        </span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                          {item.count} events
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/simulation"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-mono font-bold transition-all shadow-sm"
            >
              <Crosshair className="w-4 h-4 text-cyan-500" />
              <span>Launch Attack Simulator &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
