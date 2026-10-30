import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AlertToastContainer from './AlertToastContainer';
import ErrorBoundary from './ErrorBoundary';
import { useSocket } from '../context/WebSocketContext';

const Layout = () => {
  const { notifications, dismissNotification } = useSocket();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-cyan-500/30 selection:text-cyan-400 transition-colors">
      {/* Top SOC Navbar */}
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      {/* Main Workspace: Collapsible Sidebar + Dynamic Route Views */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[var(--bg-app)]">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Floating Real-time Toast Alerts (STOMP /topic/alerts) */}
      <AlertToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
};

export default Layout;
