'use client';

import React, { useState, useEffect } from 'react';
import { useTabStore } from '../../store/tabStore';
import { useUiStore } from '../../store/uiStore';
import { useSendRequest } from '../../features/proxy/useSendRequest';
import { HTTP_METHODS } from '../../lib/constants';
import KeyValueTable from '../shared/KeyValueTable';
import { Send, Save, FileCode } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function RequestBuilder() {
  const { tabs, activeTabId, updateActiveTabRequest, loadingStates } = useTabStore();
  const { setActiveModal } = useUiStore();
  const { sendRequest } = useSendRequest();

  const [activeReqTab, setActiveReqTab] = useState<'params' | 'auth' | 'headers' | 'body'>('params');

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const state = activeTab?.unsaved_state;
  const isLoading = activeTabId ? !!loadingStates[activeTabId] : false;

  if (!activeTab || !state) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[var(--text-secondary)]">
        <Send className="h-10 w-10 text-[var(--text-tertiary)] mb-2" />
        <h4 className="font-semibold text-sm">No Request Open</h4>
        <p className="text-xs text-[var(--text-tertiary)] max-w-xs mt-1">
          Open a request from the sidebar or click the "+" button in the tab bar to create a new one.
        </p>
      </div>
    );
  }

  // ============================================
  // Bidirectional Param Syncing Logic
  // ============================================
  
  const handleUrlChange = (urlVal: string) => {
    // Parse query params from URL
    let parsedParams: any[] = [];
    const qMarkIdx = urlVal.indexOf('?');
    if (qMarkIdx !== -1) {
      const queryString = urlVal.slice(qMarkIdx + 1);
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        parsedParams.push({ key, value, enabled: true });
      });
    }

    // Keep the empty blank row at the end of params
    if (parsedParams.length === 0 || parsedParams[parsedParams.length - 1].key !== '') {
      parsedParams.push({ key: '', value: '', enabled: true });
    }

    updateActiveTabRequest((curr) => ({
      ...curr,
      url: urlVal,
      // Only replace params if we actually found search params in the url
      params: qMarkIdx !== -1 ? parsedParams : curr.params,
    }));
  };

  const handleParamsChange = (newParams: any[]) => {
    // Rebuild URL search string
    const baseUrl = state.url.split('?')[0];
    const enabledParams = newParams.filter((p) => p.key.trim() !== '' && p.enabled);
    
    let nextUrl = baseUrl;
    if (enabledParams.length > 0) {
      const searchParams = new URLSearchParams();
      enabledParams.forEach((p) => searchParams.append(p.key, p.value));
      nextUrl = `${baseUrl}?${searchParams.toString()}`;
    }

    updateActiveTabRequest((curr) => ({
      ...curr,
      url: nextUrl,
      params: newParams,
    }));
  };

  // ============================================
  // Form updates
  // ============================================

  const handleMethodChange = (methodVal: any) => {
    updateActiveTabRequest((curr) => ({ ...curr, method: methodVal }));
  };

  const handleHeadersChange = (newHeaders: any[]) => {
    updateActiveTabRequest((curr) => ({ ...curr, headers: newHeaders }));
  };

  const handleBodyTypeChange = (typeVal: any) => {
    updateActiveTabRequest((curr) => ({
      ...curr,
      body: { ...curr.body, type: typeVal },
    }));
  };

  const handleBodyContentChange = (contentVal: string) => {
    updateActiveTabRequest((curr) => ({
      ...curr,
      body: { ...curr.body, content: contentVal },
    }));
  };

  const handleBodyFormDataChange = (newFormData: any[]) => {
    updateActiveTabRequest((curr) => ({
      ...curr,
      body: { ...curr.body, form_data: newFormData },
    }));
  };

  const handleAuthChange = (field: string, val: any) => {
    updateActiveTabRequest((curr) => ({
      ...curr,
      auth: { ...curr.auth, [field]: val },
    }));
  };

  const handleSend = () => {
    if (!state.url.trim()) return;
    sendRequest().catch((err) => console.error(err));
  };

  const handleSave = () => {
    // If it's a saved request already, we can save it directly. Otherwise, show Save Modal.
    if (activeTab.request_id) {
      updateActiveTabRequest((curr) => curr); // Trigger auto save
      // Just notify user
      alert('Request details updated and saved successfully.');
    } else {
      setActiveModal('save-request');
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)] p-4 select-none shrink-0">
      
      {/* URL Entry & Method bar */}
      <div className="flex gap-2 items-center">
        
        {/* Method Select */}
        <select
          value={state.method}
          onChange={(e) => handleMethodChange(e.target.value)}
          className="rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-bold text-[var(--pm-orange)] outline-none cursor-pointer focus:border-[var(--pm-orange)]"
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* URL Input */}
        <div className="flex-1 flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded overflow-hidden focus-within:border-[var(--pm-orange)]">
          <input
            type="text"
            placeholder="Enter request URL (e.g. {{BASE_URL}}/posts)"
            value={state.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full text-xs font-mono bg-transparent text-[var(--text-primary)] outline-none px-3.5 py-2.5"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isLoading || !state.url.trim()}
          className="rounded bg-[var(--pm-orange)] hover:bg-[var(--pm-orange-hover)] text-white font-semibold text-xs px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-md shadow-[var(--pm-orange)]/10 shrink-0"
        >
          {isLoading ? (
            <>
              <div className="spinner h-3.5 w-3.5 border-white border-2"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </>
          )}
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold text-xs px-4 py-2.5 border border-[var(--border-color)] flex items-center gap-1.5 cursor-pointer shrink-0"
          title="Save Request (Ctrl+S)"
        >
          <Save className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
          <span>Save</span>
        </button>

        {/* Code Snippets Button */}
        <button
          onClick={() => setActiveModal('settings')}
          className="rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-semibold text-xs px-4 py-2.5 border border-[var(--border-color)] flex items-center gap-1.5 cursor-pointer shrink-0"
          title="Generate Code Snippet"
        >
          <FileCode className="h-3.5 w-3.5 text-[var(--pm-orange)]" />
          <span>Code</span>
        </button>

      </div>

      {/* Tab Headers (Params, Auth, Headers, Body) */}
      <div className="flex border-b border-[var(--border-color)] text-xs font-semibold select-none">
        <button
          onClick={() => setActiveReqTab('params')}
          className={cn(
            "px-4 py-2 border-b-2 transition-colors",
            activeReqTab === 'params' 
              ? "border-[var(--pm-orange)] text-[var(--pm-orange)]" 
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Params
        </button>
        <button
          onClick={() => setActiveReqTab('auth')}
          className={cn(
            "px-4 py-2 border-b-2 transition-colors",
            activeReqTab === 'auth' 
              ? "border-[var(--pm-orange)] text-[var(--pm-orange)]" 
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Auth
        </button>
        <button
          onClick={() => setActiveReqTab('headers')}
          className={cn(
            "px-4 py-2 border-b-2 transition-colors",
            activeReqTab === 'headers' 
              ? "border-[var(--pm-orange)] text-[var(--pm-orange)]" 
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Headers
        </button>
        <button
          onClick={() => setActiveReqTab('body')}
          className={cn(
            "px-4 py-2 border-b-2 transition-colors",
            activeReqTab === 'body' 
              ? "border-[var(--pm-orange)] text-[var(--pm-orange)]" 
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Body
        </button>
      </div>

      {/* Tab Contents Panel */}
      <div className="min-h-[140px] max-h-[220px] overflow-y-auto">
        
        {/* Params Tab */}
        {activeReqTab === 'params' && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Query Parameters</p>
            <KeyValueTable
              pairs={state.params}
              onChange={handleParamsChange}
              keyPlaceholder="Parameter Key"
              valuePlaceholder="Value"
            />
          </div>
        )}

        {/* Auth Tab */}
        {activeReqTab === 'auth' && (
          <div className="flex flex-col gap-3 max-w-md">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Authorization Type</label>
              <select
                value={state.auth.type}
                onChange={(e) => handleAuthChange('type', e.target.value)}
                className="rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--pm-orange)]"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>

            {state.auth.type === 'bearer' && (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Token</label>
                <input
                  type="text"
                  placeholder="Bearer Token (e.g. eyJhbGciOi... or {{TOKEN}})"
                  value={state.auth.token || ''}
                  onChange={(e) => handleAuthChange('token', e.target.value)}
                  className="rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--pm-orange)]"
                />
              </div>
            )}

            {state.auth.type === 'basic' && (
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Username</label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={state.auth.username || ''}
                    onChange={(e) => handleAuthChange('username', e.target.value)}
                    className="rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--pm-orange)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={state.auth.password || ''}
                    onChange={(e) => handleAuthChange('password', e.target.value)}
                    className="rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--pm-orange)]"
                  />
                </div>
              </div>
            )}

            {state.auth.type === 'none' && (
              <p className="text-xs text-[var(--text-tertiary)] italic">
                This request does not use authorization.
              </p>
            )}
          </div>
        )}

        {/* Headers Tab */}
        {activeReqTab === 'headers' && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">HTTP Headers</p>
            <KeyValueTable
              pairs={state.headers}
              onChange={handleHeadersChange}
              keyPlaceholder="Header Name"
              valuePlaceholder="Header Value"
            />
          </div>
        )}

        {/* Body Tab */}
        {activeReqTab === 'body' && (
          <div className="flex flex-col gap-3.5">
            {/* Body Type Selection */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold shrink-0">Body Format:</span>
              <div className="flex gap-2">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'raw_json', label: 'JSON' },
                  { id: 'raw_text', label: 'Text' },
                  { id: 'form_data', label: 'Form Data' },
                  { id: 'x_www_form_urlencoded', label: 'URL Encoded' }
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleBodyTypeChange(b.id as any)}
                    className={cn(
                      "rounded px-2.5 py-1 text-xs transition-colors",
                      state.body.type === b.id 
                        ? "bg-[var(--pm-orange-light)] text-[var(--pm-orange)] font-semibold" 
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Render sub panel according to selection */}
            {state.body.type === 'none' && (
              <p className="text-xs text-[var(--text-tertiary)] italic">
                This request has no body payload.
              </p>
            )}

            {(state.body.type === 'raw_json' || state.body.type === 'raw_text') && (
              <div className="flex flex-col gap-1.5">
                <textarea
                  placeholder={state.body.type === 'raw_json' ? '{\n  "key": "value"\n}' : 'Enter raw body content...'}
                  rows={5}
                  value={state.body.content || ''}
                  onChange={(e) => handleBodyContentChange(e.target.value)}
                  className="rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3.5 py-2.5 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--pm-orange)] resize-none"
                />
              </div>
            )}

            {state.body.type === 'form_data' && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Form Multipart Data</p>
                <KeyValueTable
                  pairs={state.body.form_data || []}
                  onChange={handleBodyFormDataChange}
                  keyPlaceholder="Field Name"
                  valuePlaceholder="Field Value"
                />
              </div>
            )}

            {state.body.type === 'x_www_form_urlencoded' && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">URL Encoded Form Data</p>
                <KeyValueTable
                  pairs={state.body.form_data || []}
                  onChange={handleBodyFormDataChange}
                  keyPlaceholder="Field Name"
                  valuePlaceholder="Field Value"
                />
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
