import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LogsPage from './pages/LogsPage';
import AlertsPage from './pages/AlertsPage';
import IncidentsPage from './pages/IncidentsPage';
import RulesPage from './pages/RulesPage';
import SourcesPage from './pages/SourcesPage';
import SimulationPage from './pages/SimulationPage';
import AuditLogsPage from './pages/AuditLogsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WebSocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public authentication route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected SOC routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />
                <Route path="logs" element={<LogsPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="incidents" element={<IncidentsPage />} />
                <Route path="rules" element={<RulesPage />} />
                <Route path="sources" element={<SourcesPage />} />
                <Route path="simulation" element={<SimulationPage />} />
                <Route 
                  path="audit" 
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AuditLogsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="users" 
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <UsersPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
