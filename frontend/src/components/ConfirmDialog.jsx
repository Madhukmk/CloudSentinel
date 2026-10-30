import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Destructive Action',
  message = 'Are you sure you want to proceed with this operation? This action cannot be reversed.',
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  isDanger,
  confirmVariant,
  loading = false,
  onConfirm,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleCancel = onCancel || onClose || (() => {});
  const displayConfirm = confirmText || confirmLabel || 'Confirm';
  const displayCancel = cancelText || cancelLabel || 'Cancel';
  const danger = isDanger !== undefined ? isDanger : confirmVariant === 'danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl p-6 relative">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              danger
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-sm font-bold font-mono text-[var(--text-primary)] uppercase tracking-wider">
              {title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed font-mono">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-color)]">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
          >
            {displayCancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md cursor-pointer ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            } disabled:opacity-50`}
          >
            {loading ? 'Processing...' : displayConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
