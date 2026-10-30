import React, { useState, useEffect, useMemo } from 'react';
import { 
  Server, 
  Plus, 
  Search, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Network,
  Clock,
  Edit2,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Power,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { sourceService } from '../services/sourceService';
import { useAuth } from '../hooks/useAuth';

const TYPE_ICONS = {
  SERVER: Cpu,
  APPLICATION: Activity,
  FIREWALL: ShieldCheck,
  DATABASE: Database,
  NETWORK_DEVICE: Network,
};

const SOURCE_TYPES = ['SERVER', 'APPLICATION', 'FIREWALL', 'DATABASE', 'NETWORK_DEVICE'];

const SourcesPage = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sourceType: 'SERVER',
    ipAddress: '',
    hostname: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Delete confirm dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState(null);
  
  // Copy state feedback
  const [copiedIp, setCopiedIp] = useState(null);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchSources = async () => {
    try {
      setLoading(true);
      const data = await sourceService.getSources();
      setSources(data || []);
    } catch (err) {
      console.error('Failed to load log sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingSource(null);
    setFormData({
      name: '',
      sourceType: 'SERVER',
      ipAddress: '',
      hostname: '',
      description: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (source) => {
    setEditingSource(source);
    setFormData({
      name: source.name || '',
      sourceType: source.sourceType || 'SERVER',
      ipAddress: source.ipAddress || '',
      hostname: source.hostname || '',
      description: source.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingSource) {
        const updated = await sourceService.updateSource(editingSource.id, formData);
        setSources((prev) => prev.map((s) => (s.id === editingSource.id ? updated : s)));
      } else {
        const created = await sourceService.createSource(formData);
        setSources((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Failed to save log source:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id, e) => {
    e.stopPropagation();
    try {
      const updated = await sourceService.toggleSource(id);
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error('Failed to toggle source status:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sourceToDelete) return;
    try {
      await sourceService.deleteSource(sourceToDelete.id);
      setSources((prev) => prev.filter((s) => s.id !== sourceToDelete.id));
      setDeleteConfirmOpen(false);
      setSourceToDelete(null);
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  };

  const handleCopyIp = (ip, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      if (selectedType !== 'ALL' && s.sourceType !== selectedType) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        s.name?.toLowerCase().includes(term) ||
        s.ipAddress?.toLowerCase().includes(term) ||
        s.hostname?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
      );
    });
  }, [sources, selectedType, statusFilter, search]);

  const stats = useMemo(() => {
    const total = sources.length;
    const active = sources.filter((s) => s.status === 'ACTIVE').length;
    const inactive = total - active;
    const typesCount = new Set(sources.map((s) => s.sourceType)).size;
    return { total, active, inactive, typesCount };
  }, [sources]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono flex items-center gap-2.5">
            <Server className="w-6 h-6 text-emerald-400" />
            TELEMETRY & LOG SOURCES
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            Fleet inventory of perimeter firewalls, compute clusters, databases, and network collectors
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Source</span>
            </button>
          )}

          <button
            onClick={fetchSources}
            className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-gray-500 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            title="Refresh Sources"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-1">
            <span>TOTAL ASSETS</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--text-primary)]">{stats.total}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-1">
            <span>HEALTHY / ACTIVE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{stats.active}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-1">
            <span>INACTIVE / OFFLINE</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">{stats.inactive}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] mb-1">
            <span>DEVICE CLASSES</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">{stats.typesCount}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search source by asset name, IP address, hostname or description..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs font-mono text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Status: Active</option>
              <option value="INACTIVE">Status: Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[var(--border-color)] text-xs font-mono">
          <span className="text-[var(--text-muted)] text-[11px] mr-1">Architecture:</span>
          {['ALL', ...SOURCE_TYPES].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                selectedType === type
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Sources Grid */}
      {loading && !sources.length ? (
        <LoadingSkeleton type="cards" count={6} />
      ) : filteredSources.length === 0 ? (
        <EmptyState 
          icon={Server} 
          title="No Telemetry Sources Found" 
          description={search ? "Try adjusting your search filters" : "Register your first perimeter device or server to ingest security telemetry."} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => {
            const Icon = TYPE_ICONS[source.sourceType] || Server;
            const isActive = source.status === 'ACTIVE';

            return (
              <div
                key={source.id}
                className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-xl border ${
                        isActive 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold tracking-wider text-[var(--text-muted)] uppercase">
                          {source.sourceType?.replace('_', ' ')}
                        </span>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono tracking-tight leading-snug">
                          {source.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={source.status || 'ACTIVE'} />
                    </div>
                  </div>

                  {source.description && (
                    <p className="text-xs text-[var(--text-secondary)] font-mono line-clamp-2 mb-4">
                      {source.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-[var(--border-color)] font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">IP ADDRESS</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-cyan-400 font-bold">{source.ipAddress}</span>
                      <button
                        onClick={(e) => handleCopyIp(source.ipAddress, e)}
                        className="text-gray-500 hover:text-cyan-400 transition-colors p-0.5"
                        title="Copy IP"
                      >
                        {copiedIp === source.ipAddress ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">HOSTNAME</span>
                    <span className="text-[var(--text-primary)] truncate max-w-[160px]">
                      {source.hostname || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[var(--text-muted)]">LAST SEEN</span>
                    <span className="text-[var(--text-secondary)]">
                      {source.lastSeenAt ? new Date(source.lastSeenAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[var(--border-color)]/60">
                    <button
                      onClick={() => navigate(`/logs?source=${source.name}`)}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      <span>View Logs</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => handleToggle(source.id, e)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isActive
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                            title={isActive ? 'Deactivate Source' : 'Activate Source'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleOpenEditModal(source)}
                            className="p-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-cyan-400 transition-all"
                            title="Edit Configuration"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSourceToDelete(source);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register / Edit Source Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingSource ? `Edit Log Source: ${editingSource.name}` : "Register New Telemetry Source"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-[var(--text-muted)] text-[11px] block mb-1">Source Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. AWS DMZ Application Load Balancer"
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[var(--text-muted)] text-[11px] block mb-1">Source Architecture Type *</label>
                <select
                  value={formData.sourceType}
                  onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[var(--text-muted)] text-[11px] block mb-1">IP Address *</label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  placeholder="10.0.4.15"
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-[11px] block mb-1">Hostname (FQDN)</label>
              <input
                type="text"
                value={formData.hostname}
                onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                placeholder="alb-prod.aws.internal"
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-[11px] block mb-1">Device Description</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Location, role, subnet, or telemetry forwarding specifics..."
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[var(--bg-input)] hover:bg-gray-800 text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {submitting ? 'Saving...' : editingSource ? 'Update Source' : 'Register Source'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Deregister Log Source"
        message={`Are you sure you want to remove telemetry source "${sourceToDelete?.name}" (${sourceToDelete?.ipAddress})? Ingested log history will be retained, but new telemetry from this asset will no longer be mapped.`}
        confirmText="Deregister Asset"
        confirmVariant="danger"
      />
    </div>
  );
};

export default SourcesPage;
