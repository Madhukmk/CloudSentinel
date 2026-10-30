import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Plus, 
  Power, 
  Clock, 
  Trash2, 
  Search, 
  RefreshCw, 
  Edit2, 
  Lock, 
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  X
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { ruleService } from '../services/ruleService';
import { useAuth } from '../hooks/useAuth';

const CONDITION_TYPES = [
  { value: 'FAILED_LOGINS', label: 'Failed Logins from Same IP (Brute Force Detection)' },
  { value: 'FAILED_LOGINS_SAME_USER', label: 'Failed Logins for Same Username (Targeted Credential Stuffing)' },
  { value: 'SUSPICIOUS_PORT', label: 'Suspicious Port Probes (SSH, Telnet, RDP, Metasploit Ports)' },
  { value: 'CRITICAL_EVENT', label: 'Immediate Escalation on Critical Severity Telemetry' },
  { value: 'REPEATED_EVENT', label: 'Volumetric Flooding / DoS Rate Anomaly' },
  { value: 'CORRELATION', label: 'Multi-Stage Correlation: Brute Force followed by Valid Login' },
];

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const RulesPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  // Modal State (Create & Edit)
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);

  // Form Fields
  const [ruleName, setRuleName] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('LOGIN');
  const [conditionType, setConditionType] = useState('FAILED_LOGINS');
  const [threshold, setThreshold] = useState(5);
  const [timeWindow, setTimeWindow] = useState(5);
  const [cooldownMinutes, setCooldownMinutes] = useState(5);
  const [severity, setSeverity] = useState('HIGH');
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete Dialog State
  const [deleteRuleId, setDeleteRuleId] = useState(null);

  const { isAdmin } = useAuth();

  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ruleService.getRules();
      setRules(data || []);
    } catch (err) {
      console.error('Failed to load detection rules:', err);
      setError('Unable to fetch detection rule catalogue from engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openCreateModal = () => {
    setEditingRuleId(null);
    setRuleName('');
    setDescription('');
    setEventType('LOGIN');
    setConditionType('FAILED_LOGINS');
    setThreshold(5);
    setTimeWindow(5);
    setCooldownMinutes(5);
    setSeverity('HIGH');
    setEnabled(true);
    setEditorModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.ruleName || rule.name || '');
    setDescription(rule.description || '');
    setEventType(rule.eventType || 'LOGIN');
    setConditionType(rule.conditionType || 'FAILED_LOGINS');
    setThreshold(rule.threshold || rule.thresholdCount || 5);
    setTimeWindow(rule.timeWindow || rule.timeWindowMinutes || 5);
    setCooldownMinutes(rule.cooldownMinutes || rule.timeWindow || 5);
    setSeverity(rule.severity || 'HIGH');
    setEnabled(rule.enabled ?? true);
    setEditorModalOpen(true);
  };

  const handleToggle = async (ruleId) => {
    if (!isAdmin) return;
    try {
      setTogglingId(ruleId);
      const updated = await ruleService.toggleRule(ruleId);
      setRules((prev) =>
        prev.map((r) => (r.id === ruleId ? { ...r, enabled: updated.enabled } : r))
      );
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteRuleId) return;
    try {
      await ruleService.deleteRule(deleteRuleId);
      setRules((prev) => prev.filter((r) => r.id !== deleteRuleId));
    } catch (err) {
      console.error('Failed to delete rule:', err);
    } finally {
      setDeleteRuleId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      setSaving(true);
      const payload = {
        ruleName: ruleName.trim(),
        description: description.trim(),
        eventType,
        conditionType,
        threshold: parseInt(threshold, 10),
        timeWindow: parseInt(timeWindow, 10),
        cooldownMinutes: parseInt(cooldownMinutes, 10),
        severity,
        enabled,
      };

      if (editingRuleId) {
        const updated = await ruleService.updateRule(editingRuleId, payload);
        setRules((prev) => prev.map((r) => (r.id === editingRuleId ? updated : r)));
      } else {
        const created = await ruleService.createRule(payload);
        setRules((prev) => [...prev, created]);
      }
      setEditorModalOpen(false);
    } catch (err) {
      console.error('Failed to save rule:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredRules = rules.filter((r) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = (r.ruleName || r.name || '').toLowerCase();
    const desc = (r.description || '').toLowerCase();
    const cond = (r.conditionType || '').toLowerCase();
    return name.includes(term) || desc.includes(term) || cond.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-cyan-400" />
              DETECTION ENGINE RULES
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
              {filteredRules.length} HEURISTICS
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            Sliding Time Windows, Threshold Aggregations, Deduplication Cooldown & Threat Correlation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={openCreateModal}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Rule</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] font-mono text-xs">
              <Lock className="w-3.5 h-3.5" />
              <span>Analyst Read-Only Mode</span>
            </div>
          )}

          <button
            onClick={fetchRules}
            disabled={loading}
            className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            title="Refresh Rules"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchRules} />}

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules by name, condition, or description..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs font-mono text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={6} />
      ) : filteredRules.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No Detection Rules Configured"
          description="No threat detection rules found matching your search. Create a new rule to begin automated anomaly detection."
          actionLabel={isAdmin ? 'Create New Detection Rule' : undefined}
          onAction={isAdmin ? openCreateModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRules.map((rule) => {
            const isEnabled = rule.enabled;
            const rName = rule.ruleName || rule.name;
            const rCooldown = rule.cooldownMinutes || rule.timeWindow || 5;

            return (
              <div
                key={rule.id}
                className={`p-5 rounded-xl bg-[var(--bg-card)] border transition-all flex flex-col justify-between shadow-sm ${
                  isEnabled ? 'border-cyan-500/40 hover:border-cyan-500/70' : 'border-[var(--border-color)] opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={rule.severity} size="sm" />
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                        isEnabled
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}>
                        {isEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 text-[var(--text-muted)]">
                        <button
                          onClick={() => openEditModal(rule)}
                          className="p-1 hover:text-cyan-400 transition-colors cursor-pointer"
                          title="Edit Rule Configuration"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteRuleId(rule.id)}
                          className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono line-clamp-1 mt-2">
                    {rName}
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] font-mono mt-1 line-clamp-2 leading-relaxed">
                    {rule.description || 'Automated security detection rule matching raw telemetry events.'}
                  </p>

                  {/* Rule Parameters Badge Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[var(--border-color)] text-[11px] font-mono">
                    <div className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                      <span className="text-[var(--text-muted)] block text-[9px] uppercase">Threshold</span>
                      <span className="font-bold text-cyan-400">{rule.threshold || rule.thresholdCount || 1} hits</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                      <span className="text-[var(--text-muted)] block text-[9px] uppercase">Window</span>
                      <span className="font-bold text-[var(--text-primary)]">{rule.timeWindow || rule.timeWindowMinutes || 5} min</span>
                    </div>

                    <div className="p-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]" title="Alert deduplication cooldown to prevent flooding">
                      <span className="text-[var(--text-muted)] block text-[9px] uppercase">Cooldown</span>
                      <span className="font-bold text-amber-400">{rCooldown} min</span>
                    </div>
                  </div>

                  <div className="mt-2.5 text-[10px] font-mono text-[var(--text-muted)] truncate">
                    Condition: <strong className="text-[var(--text-secondary)]">{rule.conditionType}</strong>
                  </div>
                </div>

                {/* Bottom Toggle switch */}
                {isAdmin && (
                  <div className="pt-3 mt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                    <span className="text-xs font-mono text-[var(--text-muted)]">Evaluation Pipeline</span>
                    <button
                      onClick={() => handleToggle(rule.id)}
                      disabled={togglingId === rule.id}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isEnabled
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isEnabled ? 'Disable' : 'Enable'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rule Editor Modal (Create / Edit) */}
      {editorModalOpen && (
        <Modal
          isOpen={editorModalOpen}
          onClose={() => setEditorModalOpen(false)}
          title={editingRuleId ? 'TUNE DETECTION RULE' : 'CREATE DETECTION RULE'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[var(--text-muted)] text-[11px] mb-1">Rule Name *</label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="e.g. Distributed SSH Brute Force Detection"
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-[var(--text-muted)] text-[11px] mb-1">Detection Evaluator Strategy *</label>
              <select
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
              >
                {CONDITION_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[var(--text-muted)] text-[11px] mb-1">Threshold (Hits)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] text-[11px] mb-1">Time Window (Min)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] text-[11px] mb-1" title="Deduplication cooldown period">
                  Cooldown (Min)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={cooldownMinutes}
                  onChange={(e) => setCooldownMinutes(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[var(--text-muted)] text-[11px] mb-1">Severity Rating</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] text-[11px] mb-1">Telemetry Type</label>
                <input
                  type="text"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--text-muted)] text-[11px] mb-1">Operational Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain detection signature, threat rationale, and containment advice..."
                rows={3}
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setEditorModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingRuleId ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Rule Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteRuleId}
        title="Delete Detection Rule"
        message="Are you sure you want to permanently delete this detection rule? Automated evaluation for this threat signature will immediately cease."
        confirmText="Delete Rule"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeleteRuleId(null)}
      />
    </div>
  );
};

export default RulesPage;
