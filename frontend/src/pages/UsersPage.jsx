import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Shield, 
  UserCheck, 
  UserX, 
  Edit2, 
  Trash2, 
  Key, 
  Check, 
  X,
  Lock,
  Mail,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ANALYST',
    status: 'ACTIVE',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'ANALYST',
      status: 'ACTIVE',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // blank unless updating
      role: user.role || 'ANALYST',
      status: user.status || 'ACTIVE',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      setSubmitting(true);
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Don't overwrite if empty
        const updated = await userService.updateUser(editingUser.id, payload);
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
      } else {
        if (!formData.password) {
          setFormError('Password is required for new accounts');
          setSubmitting(false);
          return;
        }
        const created = await userService.createUser(formData);
        setUsers((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const updated = await userService.updateUser(user.id, {
        name: user.name,
        email: user.email,
        role: user.role,
        status: newStatus,
      });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
      );
    });
  }, [users, roleFilter, search]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === 'ADMIN').length;
    const analysts = users.filter((u) => u.role === 'ANALYST').length;
    const active = users.filter((u) => u.status === 'ACTIVE').length;
    return { total, admins, analysts, active };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            SOC IDENTITY & USER ACCESS MANAGEMENT
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            Role-based access control (RBAC), operator identities, analyst privilege tiering, and security audits
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add SOC Operator</span>
          </button>

          <button
            onClick={fetchUsers}
            className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-gray-500 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="text-[11px] font-mono text-[var(--text-muted)] mb-1">TOTAL OPERATORS</div>
          <div className="text-xl font-bold font-mono text-[var(--text-primary)]">{stats.total}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="text-[11px] font-mono text-[var(--text-muted)] mb-1">ADMINISTRATORS</div>
          <div className="text-xl font-bold font-mono text-purple-400">{stats.admins}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="text-[11px] font-mono text-[var(--text-muted)] mb-1">SOC ANALYSTS</div>
          <div className="text-xl font-bold font-mono text-cyan-400">{stats.analysts}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div className="text-[11px] font-mono text-[var(--text-muted)] mb-1">ACTIVE ACCOUNTS</div>
          <div className="text-xl font-bold font-mono text-emerald-400">{stats.active}</div>
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
              placeholder="Search user accounts by name, email, or role..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs font-mono text-[var(--text-primary)] placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">Role: All Roles</option>
              <option value="ADMIN">Role: ADMIN</option>
              <option value="ANALYST">Role: ANALYST</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-4">
            <LoadingSkeleton type="table" count={6} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Users Found"
            description="No operator accounts match your search query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[var(--bg-input)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider border-b border-[var(--border-color)]">
                <tr>
                  <th className="py-3 px-4">Operator Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role / Permissions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser && (currentUser.email === u.email || currentUser.username === u.name);
                  const isAdminRole = u.role === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isAdminRole 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          }`}>
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 text-[9px] border border-cyan-500/30">
                                  YOU
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-500" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          isAdminRole
                            ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                            : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                        }`}>
                          <Shield className="w-3 h-3" />
                          <span>{u.role}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => !isSelf && handleToggleStatus(u)}
                          disabled={isSelf}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                          } ${isSelf ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                          title={isSelf ? 'Cannot toggle your own status' : 'Click to toggle status'}
                        >
                          {u.status === 'ACTIVE' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{u.status}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-[var(--text-secondary)]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-cyan-400 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setUserToDelete(u);
                              setDeleteConfirmOpen(true);
                            }}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isSelf
                                ? 'opacity-30 cursor-not-allowed bg-gray-900 border-gray-800 text-gray-600'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 cursor-pointer'
                            }`}
                            title={isSelf ? 'Cannot delete your own account' : 'Delete User'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Create / Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingUser ? `Modify Operator: ${editingUser.name}` : 'Create New SOC Operator Account'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <div>
              <label className="text-[var(--text-muted)] text-[11px] block mb-1">Operator Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-[11px] block mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="operator@cloudsentinel.io"
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-[var(--text-muted)] text-[11px] block mb-1">
                {editingUser ? 'New Password (leave blank to keep existing)' : 'Account Password *'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? '••••••••' : 'Minimum 6 characters'}
                className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                {...(!editingUser ? { required: true } : {})}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[var(--text-muted)] text-[11px] block mb-1">Role Tier *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                >
                  <option value="ANALYST">ANALYST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="text-[var(--text-muted)] text-[11px] block mb-1">Account Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
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
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                {submitting ? 'Saving...' : editingUser ? 'Update Operator' : 'Create Operator'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Revoke Operator Access"
        message={`Are you sure you want to permanently delete user account "${userToDelete?.name}" (${userToDelete?.email})? All audit logs created by this user will be preserved.`}
        confirmText="Revoke Access"
        confirmVariant="danger"
      />
    </div>
  );
};

export default UsersPage;
