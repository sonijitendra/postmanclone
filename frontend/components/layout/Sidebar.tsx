'use client';

import React from 'react';
import { useUiStore } from '../../store/uiStore';
import SidebarTabs from '../sidebar/SidebarTabs';
import CollectionsPanel from '../sidebar/CollectionsPanel';
import HistoryPanel from '../sidebar/HistoryPanel';
import { useResizable } from '../../hooks/useResizable';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar() {
  const { 
    sidebarWidth, 
    setSidebarWidth, 
    activeSidebarTab, 
    isSidebarCollapsed, 
    toggleSidebar 
  } = useUiStore();

  const { isResizing, startResizing } = useResizable({
    initialSize: sidebarWidth,
    direction: 'horizontal',
    minSize: 220,
    maxSize: 450,
    onResize: (size) => setSidebarWidth(size),
  });

  return (
    <div className="flex h-full relative shrink-0">
      
      {/* Collapsed Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -right-3 z-40 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-0.5 shadow-md transition-all cursor-pointer",
          isSidebarCollapsed ? "right-[-12px]" : ""
        )}
        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isSidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Main Sidebar Wrapper */}
      <div
        style={{ width: isSidebarCollapsed ? 0 : sidebarWidth }}
        className={cn(
          "flex h-full flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] overflow-hidden transition-all duration-200 select-none",
          isSidebarCollapsed ? "border-r-0" : ""
        )}
      >
        {!isSidebarCollapsed && (
          <>
            {/* Nav category tabs */}
            <SidebarTabs />

            {/* List Panels */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeSidebarTab === 'collections' ? (
                <CollectionsPanel />
              ) : (
                <HistoryPanel />
              )}
            </div>
          </>
        )}
      </div>

      {/* Resize Drag Handle */}
      {!isSidebarCollapsed && (
        <div
          onMouseDown={startResizing}
          className={cn(
            "resize-handle",
            isResizing ? "active" : ""
          )}
        />
      )}

    </div>
  );
}
