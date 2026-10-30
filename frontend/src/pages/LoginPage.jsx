import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { 
  Shield, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Key, 
  HelpCircle,
  Terminal,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@cloudsentinel.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoAccs, setShowDemoAccs] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide your SOC operator email and access token.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to SIEM backend (http://localhost:8088). Ensure Spring Boot has finished starting.');
      } else {
        setError(
          err.response?.data?.message || 
          'Authentication failed. Verify SOC operator credentials and access status.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = async (demoEmail, demoPassword, autoSignIn = false) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    if (autoSignIn) {
      try {
        setLoading(true);
        await login(demoEmail, demoPassword);
        navigate(from, { replace: true });
      } catch (err) {
        if (!err.response) {
          setError('Cannot connect to SIEM backend (http://localhost:8088). Ensure Spring Boot has finished starting.');
        } else {
          setError(
            err.response?.data?.message || 
            'Authentication failed. Verify SOC operator credentials and access status.'
          );
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070B14] text-gray-900 dark:text-gray-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors">
      {/* Background Cyber Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar with Theme Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeSwitcher />
      </div>

      {/* Brand Header */}
      <div className="w-full max-w-md mb-6 text-center z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 mb-3 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black tracking-wider font-mono uppercase">
          CLOUD<span className="text-cyan-600 dark:text-cyan-400">SENTINEL</span>
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
          Security Operations Platform &bull; Cloud SIEM
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0F172A]/90 border border-gray-200 dark:border-gray-800 backdrop-blur-xl shadow-2xl p-6 sm:p-8 z-10 relative">
        <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-100 dark:border-gray-800 text-xs font-mono text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold">
            <Terminal className="w-4 h-4" />
            SECURE SOC ACCESS
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            TLS 1.3 / JWT
          </span>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Operator Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@cloudsentinel.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#070B14] border border-gray-300 dark:border-gray-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
                Password / Security Token
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#070B14] border border-gray-300 dark:border-gray-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating Operator...</span>
            ) : (
              <>
                <span>Sign In to SOC Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Developer / Demo Quick-Login Accordion */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setShowDemoAccs(!showDemoAccs)}
            className="w-full flex items-center justify-between text-[11px] font-mono text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-500" />
              Pre-Configured Demo Accounts
            </span>
            {showDemoAccs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDemoAccs && (
            <div className="grid grid-cols-2 gap-2 mt-3 animate-in fade-in">
              <div
                onClick={() => handleQuickFill('admin@cloudsentinel.com', 'Admin@123', true)}
                className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition-all cursor-pointer group"
                title="Click to 1-Click Login as SOC Admin"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold font-mono">SOC Admin</span>
                  </div>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                    Login &rarr;
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate">admin@cloudsentinel.com</p>
                <p className="text-[10px] text-cyan-700 dark:text-cyan-300 font-mono font-medium mt-0.5">Key: <code className="bg-cyan-500/10 px-1 py-0.2 rounded font-mono">Admin@123</code></p>
              </div>

              <div
                onClick={() => handleQuickFill('analyst@cloudsentinel.com', 'Analyst@123', true)}
                className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all cursor-pointer group"
                title="Click to 1-Click Login as SOC Analyst"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold font-mono">SOC Analyst</span>
                  </div>
                  <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    Login &rarr;
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate">analyst@cloudsentinel.com</p>
                <p className="text-[10px] text-purple-700 dark:text-purple-300 font-mono font-medium mt-0.5">Key: <code className="bg-purple-500/10 px-1 py-0.2 rounded font-mono">Analyst@123</code></p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider mb-2">
              Credential Recovery Procedure
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono leading-relaxed mb-4">
              In enterprise SOC environments, password and credential resets are managed via the SOC Administrator or Active Directory / Okta SSO provider.
              <br /><br />
              Please contact your SOC Lead or log in using the pre-configured administrator account (<strong className="text-cyan-500">admin@cloudsentinel.com</strong>) to reset passwords.
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-mono font-bold transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400 dark:text-gray-600 font-mono z-10 text-center">
        CloudSentinel SIEM Platform &bull; NIST SP 800-61 / ISO 27001 Ready
      </p>
    </div>
  );
};

export default LoginPage;
