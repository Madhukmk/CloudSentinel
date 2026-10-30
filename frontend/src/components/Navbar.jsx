import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../context/WebSocketContext';
import { 
  Shield, 
  Bell, 
  LogOut, 
  User, 
  Activity, 
  AlertTriangle,
  Clock,
  Radio,
  Search,
  Check,
  Trash2,
  Settings,
  Menu,
  ChevronDown
} from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import ThemeSwitcher from './ThemeSwitcher';
import WebSocketStatus from './WebSocketStatus';
import GlobalSearchModal from './GlobalSearchModal';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { 
    connectionStatus, 
    notifications, 
    unreadCount, 
    dismissNotification, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useSocket();

  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (item) => {
    markAsRead(item.id);
    setShowBellDropdown(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <>
      <header className="h-16 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
        {/* Left: Brand / System Status / Mobile toggle */}
        <div className="flex items-center gap-3 sm:gap-6">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-500 dark:text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-gray-900 dark:text-white text-base font-mono">
                  CLOUD<span className="text-cyan-500 dark:text-cyan-400">SENTINEL</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  SOC SIEM
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400 font-mono tracking-wide">
                Security Operations Center
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-gray-800">
            <WebSocketStatus status={connectionStatus} />

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono">
              <Radio className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
              <span>TELEMETRY: <strong className="text-cyan-600 dark:text-cyan-300">ACTIVE</strong></span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Trigger Button */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-gray-100/90 dark:bg-[#070B14] border border-gray-200 dark:border-gray-800 hover:border-cyan-500/50 text-gray-400 text-xs font-mono transition-all shadow-sm group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
              <span className="text-gray-500 dark:text-gray-400">Search security events, IPs, rules...</span>
            </span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Theme, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#0F172A] text-gray-600 dark:text-gray-300 hover:text-cyan-500"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Simulation Link */}
          <Link
            to="/simulation"
            className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-mono font-medium transition-all shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>ATTACK LAB</span>
          </Link>

          {/* Theme Switcher */}
          <ThemeSwitcher compact />

          {/* Live Alerts & Notification Center */}
          <div className="relative">
            <button
              onClick={() => setShowBellDropdown(!showBellDropdown)}
              className="relative p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#0F172A] hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-cyan-500 transition-all shadow-sm"
              title="Real-time Alerts Feed"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                  {unreadCount}
                </span>
              )}
            </button>

            {showBellDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    SOC Live Notification Feed
                  </span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                        title="Mark all as read"
                      >
                        <Check className="w-3 h-3" />
                        Mark Read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[10px] font-mono text-gray-400 hover:text-rose-500 flex items-center gap-1"
                        title="Clear all"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800/60 max-h-72 overflow-y-auto mt-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 font-mono">
                      No active threat alerts or notifications in queue
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`py-2.5 px-2 rounded-xl transition-all cursor-pointer ${
                          !item.read
                            ? 'bg-cyan-500/5 dark:bg-cyan-500/10'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <SeverityBadge severity={item.severity || item.alert?.severity} size="sm" />
                          <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 font-mono">
                          {item.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                  <Link
                    to="/alerts"
                    onClick={() => setShowBellDropdown(false)}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-mono font-medium block py-1"
                  >
                    Open Alert Triage Center &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Current User Card & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 sm:px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F172A] hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  {user?.name || 'Operator'}
                </p>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold">
                  {user?.role || 'ANALYST'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 font-mono text-xs">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'SOC User'}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                  <span className="mt-1 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    ROLE: {user?.role || 'ANALYST'}
                  </span>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setShowUserDropdown(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all"
                >
                  <Settings className="w-4 h-4 text-cyan-500" />
                  <span>Platform Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
