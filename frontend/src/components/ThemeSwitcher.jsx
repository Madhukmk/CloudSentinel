import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Laptop, Check } from 'lucide-react';

const ThemeSwitcher = ({ compact = false }) => {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const options = [
    { value: 'dark', label: 'Dark SOC Theme', icon: Moon, desc: 'Deep cyber contrast' },
    { value: 'light', label: 'Light SOC Theme', icon: Sun, desc: 'High visibility daylight' },
    { value: 'system', label: 'System Automatic', icon: Laptop, desc: 'Match OS preference' },
  ];

  const CurrentIcon = theme === 'system' ? Laptop : (effectiveTheme === 'dark' ? Moon : Sun);

  if (compact) {
    return (
      <button
        onClick={() => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-xl border border-gray-700/60 dark:border-gray-800 bg-gray-100 dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all"
        title={`Toggle Theme (Current: ${theme})`}
        aria-label="Toggle Theme"
      >
        <CurrentIcon className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-800 bg-white/80 dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 hover:border-cyan-500/50 text-xs font-mono transition-all shadow-sm"
        title="Theme settings"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
        <span className="capitalize">{theme}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono border-b border-gray-100 dark:border-gray-800 mb-1">
            Display Mode
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <div>
                    <p className="leading-tight">{opt.label}</p>
                    <p className="text-[10px] text-gray-400">{opt.desc}</p>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
