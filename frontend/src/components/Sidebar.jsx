import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Terminal, 
  ShieldAlert, 
  Flame, 
  Cpu, 
  Server, 
  Crosshair,
  ShieldCheck,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const operationalNav = [
    { name: 'SOC Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Live Logs', path: '/logs', icon: Terminal },
    { name: 'Threat Alerts', path: '/alerts', icon: ShieldAlert },
    { name: 'Incidents & Notes', path: '/incidents', icon: Flame },
    { name: 'Detection Engine', path: '/rules', icon: Cpu },
    { name: 'Log Sources', path: '/sources', icon: Server },
    { name: 'Attack Lab', path: '/simulation', icon: Crosshair, highlight: true },
  ];

  const adminNav = [
    { name: 'Audit Logs', path: '/audit', icon: FileText, adminOnly: true },
    { name: 'User Management', path: '/users', icon: Users, adminOnly: true },
  ];

  const systemNav = [
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const renderItem = (item) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === '/'}
        onClick={onCloseMobile}
        title={collapsed ? item.name : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all group relative ${
            isActive
              ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
              : item.highlight
              ? 'text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20'
              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/40 border border-transparent'
          } ${collapsed ? 'justify-center px-2' : ''}`
        }
      >
        <Icon
          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
            item.highlight ? 'text-rose-500' : ''
          }`}
        />
        {!collapsed && <span>{item.name}</span>}
        {item.highlight && !collapsed && (
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-500 dark:text-rose-300 font-bold border border-rose-500/30 animate-pulse">
            LAB
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-16 z-40 md:z-20 h-[calc(100vh-4rem)] flex flex-col justify-between shrink-0 bg-white dark:bg-[#090D16] border-r border-gray-200 dark:border-gray-800/80 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-4 overflow-y-auto flex-1">
          {/* DEFCON Prod indicator */}
          {!collapsed ? (
            <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#0F172A]/80 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                  DEFCON: 3 ELEVATED
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
                PROD
              </span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                title="DEFCON: 3 ELEVATED (PROD)"
              />
            </div>
          )}

          {/* Operational Menu */}
          <nav className="space-y-1">
            {!collapsed && (
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-mono">
                SOC Operations
              </p>
            )}
            {operationalNav.map(renderItem)}
          </nav>

          {/* Admin Menu (visible only to ADMIN) */}
          {isAdmin && (
            <nav className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800/80">
              {!collapsed && (
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono flex items-center justify-between">
                  <span>Governance</span>
                  <span className="text-[8px] bg-purple-500/10 border border-purple-500/30 px-1 rounded">ADMIN</span>
                </p>
              )}
              {adminNav.map(renderItem)}
            </nav>
          )}

          {/* System Settings Menu */}
          <nav className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800/80">
            {!collapsed && (
              <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-mono">
                Configuration
              </p>
            )}
            {systemNav.map(renderItem)}
          </nav>
        </div>

        {/* Bottom Section: Collapse Toggle & Swagger link */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800/80 space-y-2">
          {!collapsed && (
            <a
              href="http://localhost:8088/swagger-ui.html"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-cyan-500 text-xs font-mono transition-all border border-gray-200 dark:border-gray-800"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span>API Docs</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Collapse/Expand button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full hidden md:flex items-center justify-center gap-2 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-cyan-500 hover:bg-gray-100 dark:hover:bg-gray-800/60 font-mono text-xs transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
