import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Search, 
  Plus, 
  MessageSquare, 
  Clock, 
  User, 
  Send, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ChevronRight, 
  ArrowRight,
  Shield,
  Activity
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { incidentService } from '../services/incidentService';

const STATUS_FILTERS = ['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];

const IncidentsPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Investigation Workspace State
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Create Incident Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState('HIGH');
  const [newAssignee, setNewAssignee] = useState('analyst@cloudsentinel.com');
  const [creating, setCreating] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      const data = await incidentService.getIncidents(params);
      const list = Array.isArray(data) ? data : (data?.content || []);
      setIncidents(list);
      if (list.length > 0 && !selectedIncident) {
        openInvestigation(list[0]);
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError('Unable to load security incidents from SOC repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedStatus]);

  const openInvestigation = async (incident) => {
    setSelectedIncident(incident);
    try {
      const noteList = await incidentService.getNotes(incident.id);
      setNotes(noteList || []);
    } catch (err) {
      console.error('Failed to load incident notes:', err);
      setNotes([]);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedIncident) return;

    try {
      setAddingNote(true);
      const added = await incidentService.addNote(selectedIncident.id, newNote.trim());
      setNotes((prev) => [...prev, added]);
      setNewNote('');
    } catch (err) {
      console.error('Failed to post note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingNoteText.trim() || !selectedIncident) return;
    try {
      const updated = await incidentService.updateNote(selectedIncident.id, noteId, editingNoteText.trim());
      setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, note: editingNoteText.trim() } : n)));
      setEditingNoteId(null);
      setEditingNoteText('');
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!selectedIncident) return;
    try {
      await incidentService.deleteNote(selectedIncident.id, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedIncident) return;
    try {
      setUpdatingStatus(true);
      const updated = await incidentService.updateIncident(selectedIncident.id, {
        status: newStatus,
        assignedTo: selectedIncident.assignedTo,
      });
      setSelectedIncident((prev) => ({ ...prev, status: newStatus }));
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === selectedIncident.id ? { ...inc, status: newStatus } : inc))
      );
    } catch (err) {
      console.error('Failed to update incident status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const created = await incidentService.createIncident({
        title: newTitle.trim(),
        description: newDescription.trim(),
        severity: newSeverity,
        assignedTo: newAssignee.trim(),
      });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      await fetchIncidents();
      if (created) openInvestigation(created);
    } catch (err) {
      console.error('Failed to create incident:', err);
    } finally {
      setCreating(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      inc.title?.toLowerCase().includes(term) ||
      inc.description?.toLowerCase().includes(term) ||
      inc.assignedTo?.toLowerCase().includes(term)
    );
  });

  // KPI counters
  const totalCount = incidents.length;
  const openCount = incidents.filter((i) => i.status === 'OPEN').length;
  const investigatingCount = incidents.filter((i) => i.status === 'INVESTIGATING').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;
  const closedCount = incidents.filter((i) => i.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-gray-900 dark:text-white uppercase">
              INCIDENT RESPONSE WORKSPACE
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
              SOC ESCALATIONS
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
            Formal Case Management, Chronological Investigation & Remediation Tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Open Incident</span>
          </button>

          <button
            onClick={fetchIncidents}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition-all shadow-sm"
            title="Refresh Incidents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchIncidents} />}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
        <div className="soc-card p-3 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 uppercase">Total Cases</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totalCount}</span>
        </div>
        <div className="soc-card p-3 border-amber-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-amber-500 uppercase">Open</span>
          <span className="text-xl font-bold text-amber-500 mt-1">{openCount}</span>
        </div>
        <div className="soc-card p-3 border-purple-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-purple-500 uppercase">Investigating</span>
          <span className="text-xl font-bold text-purple-500 mt-1">{investigatingCount}</span>
        </div>
        <div className="soc-card p-3 border-emerald-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-500 uppercase">Resolved</span>
          <span className="text-xl font-bold text-emerald-500 mt-1">{resolvedCount}</span>
        </div>
        <div className="soc-card p-3 border-gray-500/30 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[10px] text-gray-400 uppercase">Closed</span>
          <span className="text-xl font-bold text-gray-400 mt-1">{closedCount}</span>
        </div>
      </div>

      {/* Main Investigation Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Incident List & Search (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="soc-card p-3 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cases by title, assignee, description..."
                className="soc-input w-full pl-9 pr-3 py-2 text-xs font-mono"
              />
            </div>

            {/* Filter tags */}
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {STATUS_FILTERS.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedStatus === st
                      ? 'bg-amber-500 text-white font-bold shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:text-amber-500'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2.5 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1">
            {loading ? (
              <TableSkeleton rows={4} cols={2} />
            ) : filteredIncidents.length === 0 ? (
              <div className="soc-card p-6">
                <EmptyState
                  icon={CheckCircle2}
                  title="No Incidents in Queue"
                  description="No security incidents match the active filter criteria."
                />
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => openInvestigation(inc)}
                    className={`soc-card p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500/60 bg-amber-500/5 dark:bg-amber-500/10 shadow-md'
                        : 'hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={inc.severity} size="sm" />
                        <StatusBadge status={inc.status} />
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">
                        #{inc.id}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white font-mono line-clamp-1">
                      {inc.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono line-clamp-2 mt-1">
                      {inc.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-cyan-500" />
                        <span>{inc.assignedTo || 'Unassigned'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{inc.createdAt ? new Date(inc.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Case Workspace & Investigation Timeline (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="soc-card p-6 space-y-6">
              {/* Incident Header & Lifecycle Controls */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={selectedIncident.severity} />
                    <StatusBadge status={selectedIncident.status} />
                    <span className="text-xs font-mono text-gray-400 font-semibold">
                      Case #{selectedIncident.id}
                    </span>
                  </div>

                  {/* Status transition dropdown / buttons */}
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        disabled={updatingStatus || selectedIncident.status === st}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          selectedIncident.status === st
                            ? 'bg-cyan-500 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-cyan-500'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <h2 className="text-base font-bold text-gray-900 dark:text-white font-mono mt-3">
                  {selectedIncident.title}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono mt-1 leading-relaxed">
                  {selectedIncident.description}
                </p>
              </div>

              {/* Visual Incident Investigation Timeline (Section 13 requirement) */}
              <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-[#070B14]/80 border border-gray-200 dark:border-gray-800 font-mono">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
                  <Activity className="w-3.5 h-3.5 text-cyan-500" />
                  Visual Incident Response Timeline
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#0B0F19] border border-cyan-500/30">
                    <div className="flex items-center gap-1 text-[10px] text-cyan-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      <span>1. Alert Triggered</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {selectedIncident.createdAt ? new Date(selectedIncident.createdAt).toLocaleTimeString() : 'Origin'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#0B0F19] border border-purple-500/30">
                    <div className="flex items-center gap-1 text-[10px] text-purple-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>2. Assigned</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {selectedIncident.assignedTo || 'Lead Analyst'}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#0B0F19] border border-amber-500/30">
                    <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>3. Investigation</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
                      {notes.length} analyst note(s)
                    </p>
                  </div>

                  <div className={`p-2.5 rounded-lg bg-white dark:bg-[#0B0F19] border ${
                    selectedIncident.status === 'RESOLVED' || selectedIncident.status === 'CLOSED'
                      ? 'border-emerald-500/40 text-emerald-500'
                      : 'border-gray-200 dark:border-gray-800 text-gray-400'
                  }`}>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <span className={`w-2 h-2 rounded-full ${
                        selectedIncident.status === 'RESOLVED' || selectedIncident.status === 'CLOSED' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`} />
                      <span>4. Resolution</span>
                    </div>
                    <p className="text-[11px] mt-1 truncate">
                      {selectedIncident.resolvedAt ? new Date(selectedIncident.resolvedAt).toLocaleTimeString() : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analyst Investigation Notes Section (Section 14 requirement) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-500" />
                    Analyst Investigation Log ({notes.length})
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">
                    Chronological Audit
                  </span>
                </div>

                {/* Notes Timeline Stream */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {notes.length === 0 ? (
                    <p className="py-6 text-center text-xs font-mono text-gray-400">
                      No analyst notes logged for this incident yet. Document your initial triage findings below.
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-[#070B14] border border-gray-200 dark:border-gray-800 text-xs font-mono space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-cyan-600 dark:text-cyan-400">
                              {note.authorName || 'Analyst'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'Just now'}
                            </span>
                          </div>

                          {/* Edit / Delete actions */}
                          <div className="flex items-center gap-1 text-gray-400">
                            {editingNoteId !== note.id && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteText(note.note);
                                  }}
                                  className="p-1 hover:text-cyan-500 rounded"
                                  title="Edit Note"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1 hover:text-rose-500 rounded"
                                  title="Delete Note"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {editingNoteId === note.id ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              value={editingNoteText}
                              onChange={(e) => setEditingNoteText(e.target.value)}
                              className="soc-input w-full p-2 text-xs font-mono"
                              rows={2}
                            />
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="px-2 py-1 rounded text-[11px] border border-gray-300 dark:border-gray-700"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleUpdateNote(note.id)}
                                className="px-2 py-1 rounded text-[11px] bg-cyan-500 text-white font-bold"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {note.note}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="pt-2">
                  <div className="relative">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add investigation findings, root cause notes, firewall containment actions..."
                      rows={3}
                      className="soc-input w-full p-3 pr-12 text-xs font-mono"
                      required
                    />
                    <button
                      type="submit"
                      disabled={addingNote || !newNote.trim()}
                      className="absolute right-3 bottom-3 p-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-all disabled:opacity-40 shadow-sm"
                      title="Append Note"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="soc-card p-12 text-center">
              <EmptyState
                icon={Flame}
                title="Select Incident to Investigate"
                description="Select an active incident from the left queue to review its visual timeline, analyst logs, and containment progress."
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Incident Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
              <span className="font-mono font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                CREATE INCIDENT CASE
              </span>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Case Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Credential Stuffing Campaign"
                  className="soc-input w-full p-2.5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="soc-input w-full p-2.5"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="soc-input w-full p-2.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Scope & Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summarize initial findings, affected assets, and recommended containment steps..."
                  rows={4}
                  className="soc-input w-full p-2.5"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold disabled:opacity-50"
                >
                  {creating ? 'Creating Case...' : 'Open Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
