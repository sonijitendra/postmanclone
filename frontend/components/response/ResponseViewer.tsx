'use client';

import React, { useState } from 'react';
import { useTabStore } from '../../store/tabStore';
import { cn, formatBytes, formatTime } from '../../lib/utils';
import { Copy, Check, Info, FileJson, Table, HelpCircle, Loader2 } from 'lucide-react';
import { STATUS_COLORS } from '../../lib/constants';

export default function ResponseViewer() {
  const { activeTabId, responses, loadingStates } = useTabStore();

  const [activeRespTab, setActiveRespTab] = useState<'body' | 'headers'>('body');
  const [copied, setCopied] = useState(false);

  const response = activeTabId ? responses[activeTabId] : null;
  const isLoading = activeTabId ? !!loadingStates[activeTabId] : false;

  // Formatting helpers
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const syntaxHighlight = (json: string) => {
    if (!json) return '';
    try {
      const obj = JSON.parse(json);
      const formatted = JSON.stringify(obj, null, 2);
      
      return formatted
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(
          /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
          (match) => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = 'json-key';
              } else {
                cls = 'json-string';
              }
            } else if (/true|false/.test(match)) {
              cls = 'json-boolean';
            } else if (/null/.test(match)) {
              cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
          }
        );
    } catch (e) {
      return json; // Fallback if not valid JSON
    }
  };

  // Loading indicator
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)]">
        <Loader2 className="h-8 w-8 text-[var(--pm-orange)] animate-spin mb-3" />
        <span className="text-xs font-medium">Sending request...</span>
        <span className="text-[10px] text-[var(--text-tertiary)] mt-1">Please wait for the backend proxy runner.</span>
      </div>
    );
  }

  // No response yet
  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)] select-none">
        <HelpCircle className="h-10 w-10 text-[var(--text-tertiary)]/75 mb-2.5" />
        <h4 className="font-semibold text-xs uppercase tracking-wider">No Response</h4>
        <p className="text-[11px] text-[var(--text-tertiary)] max-w-xs text-center mt-1">
          Click the "Send" button above to execute the request and inspect the response here.
        </p>
      </div>
    );
  }

  // Error state
  if (response.error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-primary)] p-6 text-center">
        <div className="rounded-full bg-red-950/20 border border-red-900/40 p-3 mb-3 text-red-500">
          <Info className="h-6 w-6" />
        </div>
        <h4 className="font-bold text-sm text-red-400">Could not send request</h4>
        <p className="text-xs text-[var(--text-secondary)] max-w-md mt-1 font-mono bg-[var(--bg-secondary)] px-3 py-2.5 rounded border border-[var(--border-color)]">
          {response.error}
        </p>
        <div className="text-[10px] text-[var(--text-tertiary)] max-w-xs mt-3">
          Check if the target URL is correct, has correct protocol (http/https), or if the server is accessible.
        </div>
      </div>
    );
  }

  // Successful response details
  const status = response.status_code || 0;
  const statusGroup = Math.floor(status / 100);
  
  let statusBadgeColor = 'text-[var(--text-secondary)] bg-[var(--bg-secondary)]';
  if (statusGroup === 2) statusBadgeColor = 'text-green-400 bg-green-950/25 border-green-900/30';
  else if (statusGroup === 3) statusBadgeColor = 'text-blue-400 bg-blue-950/25 border-blue-900/30';
  else if (statusGroup === 4) statusBadgeColor = 'text-yellow-400 bg-yellow-950/25 border-yellow-900/30';
  else if (statusGroup === 5) statusBadgeColor = 'text-red-400 bg-red-950/25 border-red-900/30';

  const isJsonResponse = response.headers?.['content-type']?.includes('json') || 
    response.body?.trim().startsWith('{') || 
    response.body?.trim().startsWith('[');

  const highlightedBody = isJsonResponse && response.body ? syntaxHighlight(response.body) : null;

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-primary)] text-xs overflow-hidden select-none">
      
      {/* Response Meta Header (Status, Time, Size) */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2 shrink-0 select-none">
        
        {/* Tab triggers */}
        <div className="flex border border-[var(--border-color)] rounded overflow-hidden">
          <button
            onClick={() => setActiveRespTab('body')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors",
              activeRespTab === 'body' 
                ? "bg-[var(--bg-primary)] text-[var(--pm-orange)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            )}
          >
            <FileJson className="h-3.5 w-3.5" />
            <span>Response Body</span>
          </button>
          <button
            onClick={() => setActiveRespTab('headers')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors",
              activeRespTab === 'headers' 
                ? "bg-[var(--bg-primary)] text-[var(--pm-orange)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            )}
          >
            <Table className="h-3.5 w-3.5" />
            <span>Headers ({Object.keys(response.headers || {}).length})</span>
          </button>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-3 select-none">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">Status:</span>
            <span className={cn("px-2 py-0.5 rounded font-bold border font-mono text-xs", statusBadgeColor)}>
              {status}
            </span>
          </div>

          {/* Time */}
          {response.time_ms !== undefined && (
            <div className="flex items-center gap-1.5 border-l border-[var(--border-color)] pl-3">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">Time:</span>
              <span className="font-semibold font-mono text-[var(--text-primary)]">
                {formatTime(response.time_ms)}
              </span>
            </div>
          )}

          {/* Size */}
          {response.size_bytes !== undefined && (
            <div className="flex items-center gap-1.5 border-l border-[var(--border-color)] pl-3">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">Size:</span>
              <span className="font-semibold font-mono text-[var(--text-primary)]">
                {formatBytes(response.size_bytes)}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Response Workspace */}
      <div className="flex-1 overflow-y-auto p-4 font-mono select-text relative">
        
        {/* Body Viewer */}
        {activeRespTab === 'body' && (
          <div className="flex flex-col gap-2.5 h-full">
            
            {/* Action buttons (Copy) */}
            {response.body && (
              <button
                onClick={() => handleCopy(response.body || '')}
                className="absolute top-4 right-4 z-10 flex items-center gap-1 text-[10px] border border-[var(--border-color)] hover:border-[var(--text-secondary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1.5 rounded transition-all select-none"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Body</span>
                  </>
                )}
              </button>
            )}

            {/* Formatted body */}
            {response.body ? (
              highlightedBody ? (
                <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed select-text pr-14">
                  <code dangerouslySetInnerHTML={{ __html: highlightedBody }} />
                </pre>
              ) : (
                <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] text-[var(--text-primary)] leading-relaxed select-text pr-14">
                  <code>{response.body}</code>
                </pre>
              )
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-[var(--text-tertiary)] italic select-none">
                Response body is empty.
              </div>
            )}

          </div>
        )}

        {/* Headers Table */}
        {activeRespTab === 'headers' && (
          <div className="flex flex-col">
            <table className="kv-table text-[11px] font-mono select-text">
              <thead>
                <tr>
                  <th className="w-[240px]">Header Key</th>
                  <th>Header Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers || {}).map(([key, value]) => (
                  <tr key={key} className="hover:bg-[var(--bg-hover)]/10">
                    <td className="font-semibold text-[var(--text-secondary)] border-b border-[var(--border-color)] py-2 px-3">{key}</td>
                    <td className="text-[var(--text-primary)] border-b border-[var(--border-color)] py-2 px-3">{value}</td>
                  </tr>
                ))}
                {Object.keys(response.headers || {}).length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center py-6 text-[var(--text-tertiary)] italic select-none">
                      No response headers returned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
