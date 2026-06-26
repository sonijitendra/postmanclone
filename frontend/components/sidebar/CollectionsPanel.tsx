'use client';

import React, { useState } from 'react';
import { useCollections } from '../../features/collections/useCollections';
import { useUiStore } from '../../store/uiStore';
import { useTabStore } from '../../store/tabStore';
import { 
  Folder, FolderOpen, ChevronRight, ChevronDown, Plus, 
  Trash2, Edit, Download, PlusSquare, FileText, Search 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { METHOD_COLORS } from '../../lib/constants';
import { HttpMethod } from '../../types';

export default function CollectionsPanel() {
  const { 
    collections, isLoading, deleteCollection, deleteRequest, saveRequest 
  } = useCollections();
  const { setActiveModal, setSelectedCollectionId } = useUiStore();
  const { openNewTab } = useTabStore();

  const [expandedColIds, setExpandedColIds] = useState<Record<string, boolean>>({});
  const [filterText, setFilterText] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedColIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateCollection = () => {
    setSelectedCollectionId(null);
    setActiveModal('new-collection');
  };

  const handleRenameCollection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCollectionId(id);
    setActiveModal('new-collection');
  };

  const handleDeleteCollection = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this collection and all its requests?')) {
      try {
        await deleteCollection(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExportCollection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCollectionId(id);
    setActiveModal('export');
  };

  const handleAddRequestToCollection = async (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt('Enter request name:');
    if (!name || !name.trim()) return;

    try {
      const defaultReqPayload = {
        name: name.trim(),
        method: 'GET',
        url: '',
        headers: [],
        params: [],
        body: { type: 'none', content: '' },
        body_type: 'none',
        auth_type: 'none',
        auth_data: { type: 'none' },
      };
      const savedReq = await saveRequest({ collectionId: colId, data: defaultReqPayload });
      
      // Auto expand collection
      setExpandedColIds((prev) => ({ ...prev, [colId]: true }));
      
      // Open in tab
      openNewTab({
        title: savedReq.name,
        request_id: savedReq.id,
        method: savedReq.method,
        url: savedReq.url,
        headers: savedReq.headers.length > 0 ? savedReq.headers : [{ key: '', value: '', enabled: true }],
        params: savedReq.params.length > 0 ? savedReq.params : [{ key: '', value: '', enabled: true }],
        body: savedReq.body || { type: 'none', content: '', form_data: [] },
        auth: savedReq.auth_data || { type: 'none' },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRequest = async (reqId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this request?')) {
      try {
        await deleteRequest(reqId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenRequest = (req: any) => {
    openNewTab({
      title: req.name,
      request_id: req.id,
      method: req.method,
      url: req.url,
      headers: req.headers.length > 0 ? req.headers : [{ key: '', value: '', enabled: true }],
      params: req.params.length > 0 ? req.params : [{ key: '', value: '', enabled: true }],
      body: req.body || { type: 'none', content: '', form_data: [] },
      auth: req.auth_data || { type: 'none' },
    });
  };

  // Filter collections and requests
  const filteredCollections = collections.map((col) => {
    const matchedRequests = col.requests.filter(
      (r: any) => 
        r.name.toLowerCase().includes(filterText.toLowerCase()) ||
        r.url.toLowerCase().includes(filterText.toLowerCase()) ||
        r.method.toLowerCase().includes(filterText.toLowerCase())
    );
    
    const isColMatch = col.name.toLowerCase().includes(filterText.toLowerCase());

    if (isColMatch || matchedRequests.length > 0) {
      return {
        ...col,
        requests: matchedRequests,
        isMatches: true,
      };
    }
    return null;
  }).filter(Boolean) as any[];

  return (
    <div className="flex flex-1 flex-col overflow-hidden text-xs">
      
      {/* Search & Add Header */}
      <div className="flex flex-col gap-2 p-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded px-2 py-1">
          <Search className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
          <input
            type="text"
            placeholder="Filter collections..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-transparent text-xs text-[var(--text-primary)] outline-none"
          />
          {filterText && (
            <button 
              onClick={() => setFilterText('')}
              className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Clear
            </button>
          )}
        </div>

        <button
          onClick={handleCreateCollection}
          className="flex items-center justify-center gap-1.5 w-full rounded border border-dashed border-[var(--border-color)] hover:border-[var(--text-secondary)] py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/30 transition-all font-medium"
        >
          <PlusSquare className="h-3.5 w-3.5 text-[var(--pm-orange)]" />
          <span>Create Collection</span>
        </button>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-1.5 select-none">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="spinner"></div>
            <span className="text-[11px] text-[var(--text-tertiary)]">Loading collections...</span>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-tertiary)] italic">
            {filterText ? 'No matches found.' : 'No collections yet. Create one to begin!'}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {filteredCollections.map((col) => {
              const isExpanded = expandedColIds[col.id] || filterText !== '';
              return (
                <div key={col.id} className="flex flex-col">
                  
                  {/* Collection Title Row */}
                  <div
                    onClick={() => toggleExpand(col.id)}
                    className="group flex items-center justify-between rounded px-2 py-1.5 cursor-pointer hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
                      )}
                      
                      {isExpanded ? (
                        <FolderOpen className="h-3.5 w-3.5 text-[var(--pm-orange)] shrink-0" />
                      ) : (
                        <Folder className="h-3.5 w-3.5 text-[var(--pm-orange)] shrink-0" />
                      )}
                      <span className="font-semibold truncate">{col.name}</span>
                    </div>

                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 ml-1">
                      <button
                        onClick={(e) => handleAddRequestToCollection(col.id, e)}
                        className="rounded p-0.5 hover:bg-[var(--bg-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        title="Add Request"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleExportCollection(col.id, e)}
                        className="rounded p-0.5 hover:bg-[var(--bg-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        title="Export Collection"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleRenameCollection(col.id, e)}
                        className="rounded p-0.5 hover:bg-[var(--bg-active)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        title="Rename"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCollection(col.id, e)}
                        className="rounded p-0.5 hover:bg-[var(--bg-active)] text-red-500 hover:text-red-400"
                        title="Delete Collection"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Requests Sub-Tree */}
                  {isExpanded && (
                    <div className="flex flex-col border-l border-[var(--border-color)] ml-3.5 pl-1 mt-0.5 gap-0.5">
                      {col.requests.map((req: any) => {
                        const colors = METHOD_COLORS[req.method as HttpMethod] || METHOD_COLORS.GET;
                        return (
                          <div
                            key={req.id}
                            onClick={() => handleOpenRequest(req)}
                            className="group flex items-center justify-between rounded pl-2.5 pr-2 py-1 cursor-pointer hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={cn("method-badge text-[9px] scale-[0.9] origin-left px-1 py-0.5 font-bold rounded shrink-0", colors.text, colors.bg, "border border-[var(--border-color)]")}>
                                {req.method}
                              </span>
                              <span className="truncate text-xs">{req.name}</span>
                            </div>
                            
                            <button
                              onClick={(e) => handleDeleteRequest(req.id, e)}
                              className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-[var(--bg-active)] text-red-500 hover:text-red-400 shrink-0 ml-1"
                              title="Delete Request"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                      {col.requests.length === 0 && (
                        <div className="text-[10px] text-[var(--text-tertiary)] italic pl-6 py-1">
                          No requests in collection.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
