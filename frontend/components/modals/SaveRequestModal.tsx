'use client';

import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useTabStore } from '../../store/tabStore';
import { useCollections } from '../../features/collections/useCollections';
import { Save, FolderPlus, X } from 'lucide-react';

export default function SaveRequestModal() {
  const { activeModal, setActiveModal } = useUiStore();
  const { tabs, activeTabId, saveActiveRequest } = useTabStore();
  const { collections, createCollection } = useCollections();

  const [requestName, setRequestName] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Initial state setup when modal opens
  useEffect(() => {
    if (activeModal === 'save-request') {
      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (activeTab) {
        setRequestName(activeTab.title === 'Untitled Request' ? '' : activeTab.title);
        setSelectedCollectionId(activeTab.request_id ? 
          (collections.find((c) => c.requests.some((r) => r.id === activeTab.request_id))?.id || '') : 
          (collections.length > 0 ? collections[0].id : '')
        );
      }
      setIsCreatingCollection(false);
      setNewCollectionName('');
    }
  }, [activeModal, activeTabId, tabs, collections]);

  if (activeModal !== 'save-request') return null;

  const handleCreateCollection = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      const newCol = await createCollection({ name: newCollectionName });
      setSelectedCollectionId(newCol.id);
      setNewCollectionName('');
      setIsCreatingCollection(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = requestName.trim() || 'Untitled Request';
    
    if (!selectedCollectionId) {
      alert('Please select or create a collection first.');
      return;
    }

    try {
      await saveActiveRequest(selectedCollectionId, finalName);
      setActiveModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-30" onClick={() => setActiveModal(null)}>
      <form 
        onSubmit={handleSave}
        onClick={(e) => e.stopPropagation()}
        className="relative z-[60] flex w-[420px] flex-col rounded-lg border border-[var(--border-color)] bg-[var(--bg-modal)] text-[var(--text-primary)] shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
            <Save className="h-4 w-4 text-[var(--pm-orange)]" />
            <span>Save Request</span>
          </div>
          <button 
            type="button"
            onClick={() => setActiveModal(null)}
            className="rounded p-1 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3.5 p-4">
          
          {/* Request Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Request Name</label>
            <input
              type="text"
              placeholder="e.g. Get User Profile"
              required
              autoFocus
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              className="relative z-10 w-full rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-xs outline-none focus:border-[var(--pm-orange)]"
              style={{ color: 'var(--text-primary)', caretColor: 'var(--text-primary)' }}
            />
          </div>

          {/* Collection Selection */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Select Collection</label>
              <button 
                type="button"
                onClick={() => setIsCreatingCollection(!isCreatingCollection)}
                className="text-[10px] text-[var(--pm-orange)] hover:underline flex items-center gap-0.5"
              >
                <FolderPlus className="h-3 w-3" />
                <span>{isCreatingCollection ? 'Select Existing' : 'Create New'}</span>
              </button>
            </div>

            {isCreatingCollection ? (
              <div className="flex gap-1.5 mt-1">
                <input
                  type="text"
                  placeholder="New collection name..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="relative z-10 flex-1 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs outline-none focus:border-[var(--pm-orange)]"
                  style={{ color: 'var(--text-primary)', caretColor: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={handleCreateCollection}
                  className="rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] px-3 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            ) : (
              <select
                required
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="relative z-10 w-full rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-xs outline-none focus:border-[var(--pm-orange)]"
                style={{ color: 'var(--text-primary)', caretColor: 'var(--text-primary)' }}
              >
                <option value="" disabled>-- Choose a Collection --</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="rounded bg-[var(--bg-tertiary)] px-3.5 py-1.5 text-xs font-semibold hover:bg-[var(--bg-hover)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-[var(--pm-orange)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--pm-orange-hover)]"
          >
            Save Request
          </button>
        </div>
      </form>
    </div>
  );
}
