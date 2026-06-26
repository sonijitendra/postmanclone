'use client';

import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useCollections } from '../../features/collections/useCollections';
import { FolderOpen, X } from 'lucide-react';

export default function NewCollectionModal() {
  const { activeModal, setActiveModal, selectedCollectionId, setSelectedCollectionId } = useUiStore();
  const { collections, createCollection, updateCollection } = useCollections();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (activeModal === 'new-collection') {
      if (selectedCollectionId) {
        const existing = collections.find((c) => c.id === selectedCollectionId);
        if (existing) {
          setName(existing.name);
          setDescription(existing.description || '');
          setIsEditing(true);
          return;
        }
      }
      setName('');
      setDescription('');
      setIsEditing(false);
    }
  }, [activeModal, selectedCollectionId, collections]);

  if (activeModal !== 'new-collection') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (isEditing && selectedCollectionId) {
        await updateCollection({ id: selectedCollectionId, name, description });
      } else {
        await createCollection({ name, description });
      }
      setActiveModal(null);
      setSelectedCollectionId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setActiveModal(null);
    setSelectedCollectionId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-30" onClick={handleClose}>
      <form 
        onSubmit={handleSubmit}
        className="flex w-[400px] flex-col rounded-lg border border-[var(--border-color)] bg-[var(--bg-modal)] text-[var(--text-primary)] shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
            <FolderOpen className="h-4 w-4 text-[var(--pm-orange)]" />
            <span>{isEditing ? 'Rename Collection' : 'Create New Collection'}</span>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="rounded p-1 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Collection Name</label>
            <input
              type="text"
              placeholder="e.g. My REST API"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--pm-orange)]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Description (Optional)</label>
            <textarea
              placeholder="Describe this collection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--pm-orange)] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded bg-[var(--bg-tertiary)] px-3.5 py-1.5 text-xs font-semibold hover:bg-[var(--bg-hover)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded bg-[var(--pm-orange)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--pm-orange-hover)]"
          >
            {isEditing ? 'Save Changes' : 'Create Collection'}
          </button>
        </div>
      </form>
    </div>
  );
}
