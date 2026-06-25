'use client';

import React, { useEffect } from 'react';
import { useTabStore } from '../../store/tabStore';
import { Plus, X, FolderSync } from 'lucide-react';
import { cn } from '../../lib/utils';
import { METHOD_COLORS } from '../../lib/constants';

export default function RequestTabs() {
  const { 
    tabs, 
    activeTabId, 
    fetchTabs, 
    setActiveTabId, 
    openNewTab, 
    closeTab, 
    isTabsLoading 
  } = useTabStore();

  useEffect(() => {
    fetchTabs();
  }, []);

  const handleNewTab = () => {
    openNewTab();
  };

  return (
    <div className="tab-bar shrink-0 select-none">
      
      {/* Scrollable list */}
      <div className="flex flex-1 items-stretch overflow-x-auto select-none scrollbar-none">
        {isTabsLoading ? (
          <div className="flex items-center px-4 gap-2 text-xs text-[var(--text-tertiary)]">
            <div className="spinner h-3.5 w-3.5 border-1"></div>
            <span>Syncing workspace...</span>
          </div>
        ) : tabs.length === 0 ? (
          <div className="flex items-center px-4 text-xs text-[var(--text-tertiary)] italic">
            No active tabs. Click + to get started.
          </div>
        ) : (
          tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const colors = tab.unsaved_state 
              ? (METHOD_COLORS[tab.unsaved_state.method] || METHOD_COLORS.GET)
              : METHOD_COLORS.GET;

            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "tab-item group",
                  isActive ? "active" : ""
                )}
              >
                
                {/* Method badge */}
                {tab.unsaved_state && (
                  <span className={cn("text-[9px] font-bold shrink-0 scale-90 origin-left", colors.text)}>
                    {tab.unsaved_state.method}
                  </span>
                )}

                {/* Tab Title */}
                <span className="truncate pr-1 select-none text-xs flex-1">
                  {tab.title}
                </span>

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="tab-close text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  title="Close Tab"
                >
                  <X className="h-3 w-3" />
                </button>

              </div>
            );
          })
        )}
      </div>

      {/* Add Tab Button */}
      <button
        onClick={handleNewTab}
        className="flex items-center justify-center px-3.5 border-l border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
        title="Open New Tab (Ctrl+Y)"
      >
        <Plus className="h-4 w-4" />
      </button>

    </div>
  );
}
