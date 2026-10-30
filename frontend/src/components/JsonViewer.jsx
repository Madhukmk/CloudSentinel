import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, FileCode } from 'lucide-react';

const JsonViewer = ({ data, title = 'Payload Viewer', defaultExpanded = true }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(defaultExpanded);

  let formatted = '';
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      formatted = JSON.stringify(parsed, null, 2);
    } else {
      formatted = JSON.stringify(data, null, 2);
    }
  } catch (e) {
    formatted = String(data || '');
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-[#070B14] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-100/70 dark:bg-[#0B0F19]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs font-mono font-bold text-gray-700 dark:text-gray-300 hover:text-cyan-500"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <FileCode className="w-3.5 h-3.5 text-cyan-500" />
          <span>{title}</span>
        </button>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-gray-200 dark:hover:bg-gray-800/80 transition-all"
          title="Copy JSON Payload"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-emerald-500 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {expanded && (
        <pre className="p-3 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto max-h-72 leading-relaxed selection:bg-cyan-500/30">
          <code>{formatted}</code>
        </pre>
      )}
    </div>
  );
};

export default JsonViewer;
