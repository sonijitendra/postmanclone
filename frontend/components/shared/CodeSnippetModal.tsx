'use client';

import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useTabStore } from '../../store/tabStore';
import { apiService } from '../../services/api';
import { useEnvironmentStore } from '../../store/environmentStore';
import { FileCode, Copy, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function CodeSnippetModal() {
  const { activeModal, setActiveModal } = useUiStore();
  const { tabs, activeTabId } = useTabStore();
  const { activeEnvironmentId } = useEnvironmentStore();

  const [curlSnippet, setCurlSnippet] = useState('');
  const [fetchSnippet, setFetchSnippet] = useState('');
  const [activeLang, setActiveLang] = useState<'curl' | 'fetch'>('curl');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    if (activeModal === 'settings' && activeTab && activeTab.unsaved_state) {
      // We use 'settings' as the modal type for code generation snippets to keep states clean
      setIsLoading(true);
      const state = activeTab.unsaved_state;
      
      const payload = {
        method: state.method,
        url: state.url,
        headers: state.headers.filter((h) => h.key.trim() !== ''),
        params: state.params.filter((p) => p.key.trim() !== ''),
        body: state.body,
        auth: state.auth,
      };

      Promise.all([
        apiService.generateCurl(payload),
        apiService.generateFetch(payload)
      ])
        .then(([curlData, fetchData]) => {
          setCurlSnippet(curlData.snippet);
          setFetchSnippet(fetchData.snippet);
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [activeModal, activeTabId]);

  if (activeModal !== 'settings') return null; // Using 'settings' for codegen snippets

  const handleCopy = () => {
    const code = activeLang === 'curl' ? curlSnippet : fetchSnippet;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-30">
      <div className="flex w-[600px] flex-col rounded-lg border border-[var(--border-color)] bg-[var(--bg-modal)] text-[var(--text-primary)] shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
            <FileCode className="h-4 w-4 text-[var(--pm-orange)]" />
            <span>Generate Code Snippets</span>
          </div>
          <button 
            type="button"
            onClick={() => setActiveModal(null)}
            className="rounded p-1 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveLang('curl')}
            className={cn(
              "px-4 py-2 text-xs font-semibold border-r border-[var(--border-color)] transition-colors",
              activeLang === 'curl' 
                ? "bg-[var(--bg-primary)] text-[var(--pm-orange)] border-b-2 border-b-[var(--pm-orange)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            )}
          >
            cURL Request
          </button>
          <button
            onClick={() => setActiveLang('fetch')}
            className={cn(
              "px-4 py-2 text-xs font-semibold border-r border-[var(--border-color)] transition-colors",
              activeLang === 'fetch' 
                ? "bg-[var(--bg-primary)] text-[var(--pm-orange)] border-b-2 border-b-[var(--pm-orange)]" 
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            )}
          >
            JavaScript Fetch
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 p-4 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="spinner"></div>
              <span className="text-xs text-[var(--text-secondary)]">Generating code snippet...</span>
            </div>
          ) : (
            <div className="flex flex-col flex-1 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">
                  {activeLang === 'curl' ? 'cURL command line' : 'Javascript Fetch code'}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-[var(--pm-orange)] hover:underline"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="rounded border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-[11px] font-mono text-[var(--text-primary)] overflow-x-auto max-h-[300px] whitespace-pre-wrap">
                <code>{activeLang === 'curl' ? curlSnippet : fetchSnippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
          <button
            onClick={() => setActiveModal(null)}
            className="rounded bg-[var(--bg-tertiary)] px-4 py-1.5 text-xs font-semibold hover:bg-[var(--bg-hover)]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
