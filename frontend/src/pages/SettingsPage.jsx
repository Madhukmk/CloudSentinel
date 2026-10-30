import React, { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Database, 
  Clock, 
  Trash2, 
  Save, 
  Check, 
  User, 
  Key, 
  HardDrive,
  Sliders,
  Cpu,
  Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import ConfirmDialog from '../components/ConfirmDialog';

const SettingsPage = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();

  // Local settings state
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('cs_sound_enabled') === 'true'
  );
  const [refreshInterval, setRefreshInterval] = useState(
    () => localStorage.getItem('cs_refresh_interval') || '10'
  );
  const [retentionDays, setRetentionDays] = useState('90');
  const [autoEscalateCritical, setAutoEscalateCritical] = useState(true);
  const [streamBufferSize, setStreamBufferSize] = useState('500');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [clearStorageConfirm, setClearStorageConfirm] = useState(false);

  const handleSaveSettings = () => {
    localStorage.setItem('cs_sound_enabled', soundEnabled);
    localStorage.setItem('cs_refresh_interval', refreshInterval);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleClearLocalStorage = () => {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    localStorage.clear();
    if (token) localStorage.setItem('token', token);
    if (userJson) localStorage.setItem('user', userJson);
    setClearStorageConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-cyan-400" />
            SOC PLATFORM CONFIGURATION & PREFERENCES
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
            Theme customization, telemetry streaming intervals, audio alert triggers, and ingestion storage policies
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
        >
          {savedFeedback ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{savedFeedback ? 'Settings Saved!' : 'Save Preferences'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Profile Snapshot */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-lg font-mono">
                {user?.username ? user.username[0].toUpperCase() : 'O'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono">
                  {user?.username || 'SOC Operator'}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold uppercase">
                  {user?.role || 'ANALYST'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-[var(--border-color)] font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">EMAIL</span>
                <span className="text-[var(--text-primary)] truncate max-w-[150px]">{user?.email || 'operator@siem.io'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">SESSION TOKEN</span>
                <span className="text-emerald-400 font-bold">ACTIVE (JWT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">ACCESS LEVEL</span>
                <span className="text-cyan-400 font-bold">{user?.role === 'ADMIN' ? 'Full Read/Write' : 'Analyst Triage'}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-primary)]">
              <HardDrive className="w-4 h-4 text-rose-400" />
              <span>Cache & Data Maintenance</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-mono leading-relaxed">
              Reset temporary client state, filter defaults, and theme preferences back to initial values.
            </p>
            <button
              onClick={() => setClearStorageConfirm(true)}
              className="w-full py-2 px-3 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Local Workspace Cache</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Settings Modules */}
        <div className="md:col-span-2 space-y-6">
          {/* Section 1: Appearance & SOC Theme */}
          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
              <Moon className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-mono">
                DISPLAY & THEME APPEARANCE
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Dark SOC Option */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#0B111E] border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-[#0B111E] border-gray-800 hover:border-gray-700 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Moon className="w-5 h-5 text-cyan-400" />
                  {theme === 'dark' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono">Dark SOC</div>
                  <div className="text-[10px] text-gray-400 font-mono">Default dark operations view</div>
                </div>
              </button>

              {/* Light Theme Option */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-100 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-100 border-gray-300 hover:border-gray-400 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  {theme === 'light' && <Check className="w-4 h-4 text-cyan-600" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 font-mono">Light SOC</div>
                  <div className="text-[10px] text-slate-500 font-mono">Daylight high-contrast view</div>
                </div>
              </button>

              {/* System Option */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-[var(--bg-input)] border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-[var(--bg-input)] border-[var(--border-color)] hover:border-gray-500 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Monitor className="w-5 h-5 text-purple-400" />
                  {theme === 'system' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)] font-mono">System Match</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">Auto-sync with OS mode</div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Real-time Telemetry & Audio Dispatch */}
          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
              <Bell className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-mono">
                TELEMETRY STREAM & NOTIFICATION DISPATCH
              </h2>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                <div>
                  <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Critical Alert Audio Chime</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Audible tone when incoming CRITICAL severity alert arrives via WebSocket
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
                >
                  {soundEnabled ? 'ENABLED' : 'MUTED'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                <div>
                  <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Background Polling Fallback</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    HTTP polling sync rate when WebSocket connection is offline or reconnecting
                  </div>
                </div>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none"
                >
                  <option value="5">5 Seconds</option>
                  <option value="10">10 Seconds</option>
                  <option value="30">30 Seconds</option>
                  <option value="60">60 Seconds</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                <div>
                  <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Live Stream Client Buffer Size</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Maximum log events preserved in browser memory before FIFO discard
                  </div>
                </div>
                <select
                  value={streamBufferSize}
                  onChange={(e) => setStreamBufferSize(e.target.value)}
                  className="px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none"
                >
                  <option value="250">250 entries</option>
                  <option value="500">500 entries</option>
                  <option value="1000">1000 entries</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Detection Engine & Retention Policy */}
          <div className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
              <Database className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-[var(--text-primary)] font-mono">
                DATA RETENTION & HEURISTIC POLICIES
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                <label className="text-[var(--text-muted)] text-[11px] block mb-1">
                  Log Audit Retention Period
                </label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-none"
                >
                  <option value="30">30 Days (PCI-DSS Minimum)</option>
                  <option value="60">60 Days (Internal Audit)</option>
                  <option value="90">90 Days (Enterprise Standard)</option>
                  <option value="180">180 Days (SOC 2 Type II)</option>
                  <option value="365">365 Days (Full Compliance)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)]">
                <label className="text-[var(--text-muted)] text-[11px] block mb-1">
                  Auto-Escalate Critical Incidents
                </label>
                <button
                  type="button"
                  onClick={() => setAutoEscalateCritical(!autoEscalateCritical)}
                  className={`w-full py-1.5 px-2.5 rounded text-xs font-bold border text-left transition-colors cursor-pointer ${
                    autoEscalateCritical
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-gray-800 text-gray-400 border-gray-700'
                  }`}
                >
                  {autoEscalateCritical ? '✓ Auto-Promote CRITICAL alerts' : 'Manual Triage Only'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Reset Cache Dialog */}
      <ConfirmDialog
        isOpen={clearStorageConfirm}
        onClose={() => setClearStorageConfirm(false)}
        onConfirm={handleClearLocalStorage}
        title="Reset Local Cache"
        message="This will reset local UI preferences, recent filter states, and theme selection to defaults. Your user session and database records will not be affected."
        confirmText="Reset Cache & Reload"
        confirmVariant="warning"
      />
    </div>
  );
};

export default SettingsPage;
