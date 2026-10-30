import React, { useState, useEffect, useRef } from 'react';
import { 
  Crosshair, 
  Terminal, 
  Zap, 
  ShieldAlert, 
  Flame, 
  Play, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Radio,
  Clock,
  Sparkles,
  History,
  Shield,
  Layers,
  Check,
  Send,
  Cpu
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import { demoService } from '../services/demoService';
import { useSocket } from '../context/WebSocketContext';
import { Link } from 'react-router-dom';

const PIPELINE_STEPS = [
  { id: 1, label: 'Payload Genesis', desc: 'Craft adversary packet' },
  { id: 2, label: 'Telemetry Stream', desc: 'Transmit to SIEM pipeline' },
  { id: 3, label: 'Engine Evaluation', desc: 'Rule evaluator processing' },
  { id: 4, label: 'Alert Triggered', desc: 'SOC dispatch & STOMP broadcast' },
];

const SimulationPage = () => {
  const [bruteForceIp, setBruteForceIp] = useState('192.168.1.105');
  const [portScanIp, setPortScanIp] = useState('10.10.4.52');
  const [correlationIp, setCorrelationIp] = useState('172.16.8.99');

  const [loadingType, setLoadingType] = useState(null);
  const [activeStep, setActiveStep] = useState(0); // 0 = idle, 1..4
  const [recentSimulations, setRecentSimulations] = useState([]);
  
  const [consoleLogs, setConsoleLogs] = useState([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      text: '[SIMULATOR INITIALIZED] CloudSentinel Cyber Attack Lab ready for safe telemetry injection.',
      type: 'info',
    },
  ]);

  const terminalEndRef = useRef(null);
  const { liveAlerts, connected } = useSocket();

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // Stream live alerts into the attack console
  useEffect(() => {
    if (liveAlerts && liveAlerts.length > 0) {
      const newest = liveAlerts[0];
      setConsoleLogs((prev) => [
        {
          id: Date.now() + Math.random(),
          time: new Date().toLocaleTimeString(),
          text: `[SIEM ALERT TRIGGERED] ${newest.title} (Severity: ${newest.severity}) - Source IP: ${newest.sourceIp}`,
          type: 'alert',
        },
        ...prev,
      ].slice(0, 100));
    }
  }, [liveAlerts]);

  const addLog = (text, type = 'info') => {
    setConsoleLogs((prev) => [
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        text,
        type,
      },
      ...prev,
    ].slice(0, 100));
  };

  const recordSimulation = (name, ip, severity) => {
    setRecentSimulations((prev) => [
      {
        id: Date.now(),
        name,
        ip,
        severity,
        time: new Date().toLocaleTimeString(),
        status: 'Triggered'
      },
      ...prev.slice(0, 4)
    ]);
  };

  const runPipelineAnimation = async () => {
    setActiveStep(1);
    await new Promise((r) => setTimeout(r, 350));
    setActiveStep(2);
    await new Promise((r) => setTimeout(r, 400));
    setActiveStep(3);
    await new Promise((r) => setTimeout(r, 450));
    setActiveStep(4);
    setTimeout(() => setActiveStep(0), 4000);
  };

  const handleRunBruteForce = async () => {
    try {
      setLoadingType('bruteforce');
      addLog(`[ATTACK START] Launching Distributed Brute Force authentication attack from ${bruteForceIp}...`, 'warning');
      runPipelineAnimation();
      const res = await demoService.simulateBruteForce(bruteForceIp);
      addLog(`[PAYLOAD SENT] 6 rapid failed login telemetry frames transmitted for IP ${bruteForceIp}`, 'success');
      addLog(`[BACKEND RESPONSE] ${res || 'Telemetry evaluated by BruteForceRuleEvaluator'}`, 'info');
      recordSimulation('Distributed Brute Force', bruteForceIp, 'HIGH');
    } catch (err) {
      addLog(`[ERROR] Brute force simulation failed: ${err.message}`, 'error');
      setActiveStep(0);
    } finally {
      setLoadingType(null);
    }
  };

  const handleRunPortScan = async () => {
    try {
      setLoadingType('portscan');
      addLog(`[ATTACK START] Initiating perimeter port scan probing RDP port 3389 from ${portScanIp}...`, 'warning');
      runPipelineAnimation();
      const res = await demoService.simulatePortScan(portScanIp);
      addLog(`[PAYLOAD SENT] Suspicious port access telemetry dispatched for IP ${portScanIp}`, 'success');
      addLog(`[BACKEND RESPONSE] ${res || 'Telemetry evaluated by SuspiciousPortRuleEvaluator'}`, 'info');
      recordSimulation('Perimeter Port Scan (RDP)', portScanIp, 'HIGH');
    } catch (err) {
      addLog(`[ERROR] Port scan simulation failed: ${err.message}`, 'error');
      setActiveStep(0);
    } finally {
      setLoadingType(null);
    }
  };

  const handleRunCorrelation = async () => {
    try {
      setLoadingType('correlation');
      addLog(`[ATTACK START] Injecting Multi-Stage Credential Breach Sequence from ${correlationIp}...`, 'warning');
      addLog(`[STAGE 1] Transmitting 5 failed authentication attempts for target 'root'`, 'info');
      runPipelineAnimation();
      const res = await demoService.simulateCorrelation(correlationIp);
      addLog(`[STAGE 2] Injected SUCCESSFUL authentication token from same source IP ${correlationIp}`, 'success');
      addLog(`[CORRELATION ENGINE] Multi-event correlation rule fired! CRITICAL alert generated`, 'alert');
      recordSimulation('Multi-Stage Breach Correlation', correlationIp, 'CRITICAL');
    } catch (err) {
      addLog(`[ERROR] Correlation simulation failed: ${err.message}`, 'error');
      setActiveStep(0);
    } finally {
      setLoadingType(null);
    }
  };

  const handleClearTerminal = () => {
    setConsoleLogs([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: '[TERMINAL BUFFER RESET] Ready for simulation triggers.',
        type: 'info',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] font-mono flex items-center gap-2.5">
              <Crosshair className="w-6 h-6 text-rose-500" />
              CYBER ATTACK LAB & SIMULATION
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
              Synthetic Mode
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-mono">
            Interactive adversary attack simulator to validate detection heuristics, window evaluators & real-time dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[var(--text-secondary)]">
              STOMP Broker: <strong className={connected ? 'text-emerald-400' : 'text-rose-400'}>{connected ? 'LIVE' : 'OFFLINE'}</strong>
            </span>
          </div>

          <Link
            to="/alerts"
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <span>Triage Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Attack Execution Pipeline Stepper */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        <div className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Simulation Ingestion Pipeline</span>
          {activeStep > 0 && (
            <span className="text-emerald-400 animate-pulse font-normal">
              — Step {activeStep} of 4 in progress...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {PIPELINE_STEPS.map((step) => {
            const isDone = activeStep > step.id;
            const isCurrent = activeStep === step.id;
            
            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-[var(--bg-input)] border-[var(--border-color)] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isCurrent ? 'bg-cyan-500 text-slate-950' : isDone ? 'bg-emerald-500 text-slate-950' : 'bg-gray-800 text-gray-400'
                  }`}>
                    0{step.id}
                  </span>
                  {isDone && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  {isCurrent && <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                </div>
                <div className={`text-xs font-mono font-bold ${isCurrent ? 'text-cyan-400' : isDone ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>
                  {step.label}
                </div>
                <div className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario 1: Brute Force */}
        <div className="rounded-xl bg-[var(--bg-card)] border border-rose-500/30 p-5 flex flex-col justify-between shadow-sm hover:border-rose-500/60 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <Zap className="w-5 h-5" />
              </div>
              <SeverityBadge severity="HIGH" size="sm" />
            </div>

            <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono tracking-tight mb-1">
              Distributed Brute Force
            </h3>

            <p className="text-xs text-[var(--text-secondary)] font-mono mb-4">
              Injects 6 rapid consecutive authentication failures to trigger sliding-window threshold.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[var(--text-muted)] text-[11px] block mb-1">Attacking Source IP</label>
                <input
                  type="text"
                  value={bruteForceIp}
                  onChange={(e) => setBruteForceIp(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-cyan-400 font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] space-y-1">
                <div>Evaluator: <strong className="text-[var(--text-primary)]">BruteForceRuleEvaluator</strong></div>
                <div>Condition: <strong className="text-amber-400">&ge; 5 failed logins / 5 min</strong></div>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunBruteForce}
            disabled={loadingType === 'bruteforce'}
            className="w-full mt-5 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loadingType === 'bruteforce' ? 'Injecting Telemetry...' : 'Launch Attack'}</span>
          </button>
        </div>

        {/* Scenario 2: Port Reconnaissance */}
        <div className="rounded-xl bg-[var(--bg-card)] border border-amber-500/30 p-5 flex flex-col justify-between shadow-sm hover:border-amber-500/60 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <SeverityBadge severity="HIGH" size="sm" />
            </div>

            <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono tracking-tight mb-1">
              Perimeter Port Scan (RDP 3389)
            </h3>

            <p className="text-xs text-[var(--text-secondary)] font-mono mb-4">
              Simulates perimeter reconnaissance probes targeting restricted ports (RDP 3389, SSH 22, Telnet 23).
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[var(--text-muted)] text-[11px] block mb-1">Attacking Source IP</label>
                <input
                  type="text"
                  value={portScanIp}
                  onChange={(e) => setPortScanIp(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-cyan-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] space-y-1">
                <div>Evaluator: <strong className="text-[var(--text-primary)]">SuspiciousPortRuleEvaluator</strong></div>
                <div>Condition: <strong className="text-amber-400">Restricted Ports (3389, 22, 23)</strong></div>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunPortScan}
            disabled={loadingType === 'portscan'}
            className="w-full mt-5 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loadingType === 'portscan' ? 'Injecting Telemetry...' : 'Launch Attack'}</span>
          </button>
        </div>

        {/* Scenario 3: Correlation Breach */}
        <div className="rounded-xl bg-[var(--bg-card)] border border-purple-500/40 p-5 flex flex-col justify-between shadow-sm hover:border-purple-500/70 transition-all">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Flame className="w-5 h-5" />
              </div>
              <SeverityBadge severity="CRITICAL" size="sm" />
            </div>

            <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono tracking-tight mb-1">
              Multi-Stage Breach Correlation
            </h3>

            <p className="text-xs text-[var(--text-secondary)] font-mono mb-4">
              Executes complex correlation: 5 failed logins followed immediately by valid session from same IP.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[var(--text-muted)] text-[11px] block mb-1">Attacking Source IP</label>
                <input
                  type="text"
                  value={correlationIp}
                  onChange={(e) => setCorrelationIp(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-lg text-cyan-400 font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] space-y-1">
                <div>Evaluator: <strong className="text-[var(--text-primary)]">CorrelationEngineService</strong></div>
                <div>Condition: <strong className="text-rose-400">5+ Fails &rarr; 1 Success Correlation</strong></div>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunCorrelation}
            disabled={loadingType === 'correlation'}
            className="w-full mt-5 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loadingType === 'correlation' ? 'Correlating Event...' : 'Launch Attack'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Terminal Console & Simulation Run History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Console (2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-[#080C14] border border-[var(--border-color)] overflow-hidden shadow-2xl font-mono text-xs flex flex-col h-80">
          <div className="bg-[#0D121F] px-4 py-2.5 border-b border-gray-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-gray-200">
                SOC Adversary Injection Console & Telemetry Stream
              </span>
            </div>

            <button
              onClick={handleClearTerminal}
              className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="p-4 space-y-1.5 overflow-y-auto flex-1 font-mono text-xs">
            {consoleLogs.map((log) => {
              let color = 'text-gray-300';
              if (log.type === 'warning') color = 'text-amber-400';
              if (log.type === 'success') color = 'text-emerald-400';
              if (log.type === 'alert') color = 'text-rose-400 font-bold bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/30';
              if (log.type === 'error') color = 'text-red-400';

              return (
                <div key={log.id} className="flex items-start gap-2.5">
                  <span className="text-gray-600 text-[10px] shrink-0 pt-0.5">{log.time}</span>
                  <span className={`${color} leading-relaxed break-all`}>{log.text}</span>
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Recent Simulation History (1 col) */}
        <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] p-4 flex flex-col justify-between h-80">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-primary)]">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Simulation Run History</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Session</span>
            </div>

            {recentSimulations.length === 0 ? (
              <div className="py-12 text-center text-xs font-mono text-[var(--text-muted)]">
                No simulations launched in this session yet. Launch an attack above.
              </div>
            ) : (
              <div className="space-y-2.5 font-mono text-xs">
                {recentSimulations.map((sim) => (
                  <div key={sim.id} className="p-2.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[var(--text-primary)] text-[11px] truncate max-w-[150px]">
                        {sim.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        Target: <span className="text-cyan-400">{sim.ip}</span> • {sim.time}
                      </div>
                    </div>
                    <SeverityBadge severity={sim.severity} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[var(--border-color)] text-[10px] font-mono text-[var(--text-muted)] text-center">
            Simulated logs will persist in the database and trigger detection rules.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;
