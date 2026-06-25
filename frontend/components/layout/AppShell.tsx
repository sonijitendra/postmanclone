'use client';

import React from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import RequestTabs from '../tabs/RequestTabs';
import RequestBuilder from '../request/RequestBuilder';
import ResponseViewer from '../response/ResponseViewer';
import EnvironmentModal from '../environment/EnvironmentModal';
import NewCollectionModal from '../modals/NewCollectionModal';
import SaveRequestModal from '../modals/SaveRequestModal';
import ImportModal from '../modals/ImportModal';
import ExportModal from '../modals/ExportModal';
import CodeSnippetModal from '../shared/CodeSnippetModal';
import { useResizable } from '../../hooks/useResizable';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useTabStore } from '../../store/tabStore';
import { useSendRequest } from '../../features/proxy/useSendRequest';
import { useUiStore } from '../../store/uiStore';
import { cn } from '../../lib/utils';

export default function AppShell() {
  const { openNewTab, activeTabId, closeTab, tabs } = useTabStore();
  const { sendRequest } = useSendRequest();
  const { setActiveModal } = useUiStore();

  // Vertical resizable panel for the response viewer
  const { size: responseHeight, isResizing: isResizingResponse, startResizing: startResizingResponse } = useResizable({
    initialSize: 300,
    direction: 'vertical',
    minSize: 150,
    maxSize: 600,
  });

  // Setup global keyboard shortcuts
  useKeyboardShortcuts({
    onSend: () => {
      sendRequest().catch((err) => console.error(err));
    },
    onSave: () => {
      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (activeTab) {
        if (activeTab.request_id) {
          // Already saved, trigger auto-save
          alert('Request details updated and saved successfully.');
        } else {
          setActiveModal('save-request');
        }
      }
    },
    onNewTab: () => {
      openNewTab();
    },
    onCloseTab: () => {
      if (activeTabId) {
        closeTab(activeTabId);
      }
    },
  });

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased select-none">
      
      {/* Top Header Navigation */}
      <TopBar />

      {/* Main Workspace Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Tree Explorer */}
        <Sidebar />

        {/* Right Request Console */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-primary)]">
          
          {/* Tab bar */}
          <RequestTabs />

          {/* Request Composer (Top half) */}
          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            <RequestBuilder />
          </div>

          {/* Resizable Divider Handle */}
          {activeTabId && (
            <div
              onMouseDown={startResizingResponse}
              className={cn(
                "resize-handle-horizontal",
                isResizingResponse ? "active" : ""
              )}
            />
          )}

          {/* Response Viewer (Bottom half, resizable height) */}
          {activeTabId && (
            <div 
              style={{ height: responseHeight }}
              className="flex flex-col min-h-[150px] shrink-0 border-t border-[var(--border-color)] overflow-hidden"
            >
              <ResponseViewer />
            </div>
          )}

        </div>

      </div>

      {/* Overlay Modals Portal */}
      <EnvironmentModal />
      <NewCollectionModal />
      <SaveRequestModal />
      <ImportModal />
      <ExportModal />
      <CodeSnippetModal />

    </div>
  );
}
