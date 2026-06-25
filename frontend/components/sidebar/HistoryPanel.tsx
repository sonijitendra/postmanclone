'use client';

import React from 'react';
import { useHistory } from '../../features/history/useHistory';
import { useTabStore } from '../../store/tabStore';
import { Trash2, Trash, History, ExternalLink, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { METHOD_COLORS } from '../../lib/constants';
import { apiService } from '../../services/api';

export default function HistoryPanel() {
  const { history, isLoading, deleteEntry, clearHistory } = useHistory();
  const { openNewTab } = useTabStore();

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear your entire request history? This cannot be undone.')) {
      try {
        await clearHistory();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteEntry(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenHistory = async (entry: any) => {
    try {
      const detail = await apiService.getHistoryDetail(entry.id);
      
      openNewTab({
        title: detail.url.split('/').pop() || detail.url || 'History Request',
        history_id: detail.id,
        method: detail.method,
        url: detail.url,
        headers: detail.request_headers && detail.request_headers.length > 0 
          ? detail.request_headers 
          : [{ key: '', value: '', enabled: true }],
        params: detail.request_params && detail.request_params.length > 0 
          ? detail.request_params 
          : [{ key: '', value: '', enabled: true }],
        body: detail.request_body || { type: 'none', content: '', form_data: [] },
        auth: detail.auth_data || { type: 'none' },
      });

      // If there's response cached in history, restore it in memory for this tab!
      // This is a highly professionalスタッフ touch!
      if (detail.response_status) {
        // We find the tab we just created. Since Zustand actions are synchronous in updates, 
        // we can schedule the response setting after the tab opens.
        setTimeout(() => {
          const { tabs } = useTabStore.getState();
          const newlyOpenedTab = tabs.find((t) => t.history_id === detail.id);
          if (newlyOpenedTab) {
            useTabStore.getState().setResponse(newlyOpenedTab.id, {
              status_code: detail.response_status,
              headers: detail.response_headers || {},
              body: detail.response_body || '',
              time_ms: detail.response_time_ms,
              size_bytes: detail.response_size_bytes,
              error: detail.error_message,
            });
          }
        }, 100);
      }
    } catch (err) {
      console.error('Failed to load history details', err);
    }
  };

  // Helper to format timestamps nicely
  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden text-xs">
      
      {/* Clear All Header */}
      <div className="flex items-center justify-between p-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 shrink-0">
        <span className="font-semibold text-[10px] text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
          <History className="h-3.5 w-3.5" />
          <span>Past Executions</span>
        </span>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-400 hover:underline px-1.5 py-0.5 rounded transition-all"
            title="Clear all history"
          >
            <Trash className="h-3 w-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-1.5 select-none">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="spinner"></div>
            <span className="text-[11px] text-[var(--text-tertiary)]">Loading history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-[var(--text-tertiary)]">
            <History className="h-8 w-8 mb-2 text-[var(--text-tertiary)]/50" />
            <p className="italic">No history records yet.</p>
            <p className="text-[10px] max-w-xs mt-1">Sent requests will automatically appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {history.map((entry) => {
              const colors = METHOD_COLORS[entry.method] || METHOD_COLORS.GET;
              
              // Status code styling classes
              let statusClass = 'text-[var(--text-secondary)] bg-[var(--bg-tertiary)]';
              if (entry.response_status) {
                const group = Math.floor(entry.response_status / 100);
                if (group === 2) statusClass = 'text-green-400 bg-green-950/20 border-green-900/30';
                else if (group === 3) statusClass = 'text-blue-400 bg-blue-950/20 border-blue-900/30';
                else if (group === 4) statusClass = 'text-yellow-400 bg-yellow-950/20 border-yellow-900/30';
                else if (group === 5) statusClass = 'text-red-400 bg-red-950/20 border-red-900/30';
              } else if (entry.error_message) {
                statusClass = 'text-red-400 bg-red-950/20 border-red-900/30';
              }

              return (
                <div
                  key={entry.id}
                  onClick={() => handleOpenHistory(entry)}
                  className="group flex flex-col gap-1 rounded border border-transparent hover:border-[var(--border-color)] p-2 cursor-pointer hover:bg-[var(--bg-hover)] transition-all"
                >
                  
                  {/* Top line: method + URL */}
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={cn("method-badge text-[9px] px-1 py-0.5 rounded font-bold shrink-0", colors.text, colors.bg)}>
                        {entry.method}
                      </span>
                      <span className="truncate text-xs font-mono text-[var(--text-primary)]" title={entry.url}>
                        {entry.url}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteEntry(entry.id, e)}
                      className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-[var(--bg-active)] text-red-500 hover:text-red-400 shrink-0 ml-1"
                      title="Delete from history"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Bottom line: status, time, date */}
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("px-1 py-0.2 rounded font-semibold border text-[9px]", statusClass)}>
                        {entry.response_status || (entry.error_message ? 'ERR' : '???')}
                      </span>
                      {entry.response_time_ms ? (
                        <span>{Math.round(entry.response_time_ms)} ms</span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1 text-[var(--text-tertiary)]">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{formatTimeAgo(entry.created_at)}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
