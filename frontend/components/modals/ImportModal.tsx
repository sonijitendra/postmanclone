'use client';

import React, { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { Upload, FileCode, X, AlertCircle } from 'lucide-react';

export default function ImportModal() {
  const { activeModal, setActiveModal } = useUiStore();
  const queryClient = useQueryClient();

  const [importJson, setImportJson] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (activeModal !== 'import') return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Verify it is JSON
        JSON.parse(text);
        setImportJson(text);
      } catch (err) {
        setErrorMsg('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJson.trim()) return;

    setErrorMsg(null);
    setIsImporting(true);

    try {
      const parsed = JSON.parse(importJson);
      await apiService.importCollection(parsed);
      
      // Invalidate collections queries so the sidebar refreshes
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      
      // Close modal
      setActiveModal(null);
      setImportJson('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to import. Make sure the format is valid Postman v2.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-30">
      <form 
        onSubmit={handleImport}
        className="flex w-[500px] flex-col rounded-lg border border-[var(--border-color)] bg-[var(--bg-modal)] text-[var(--text-primary)] shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
            <Upload className="h-4 w-4 text-[var(--pm-orange)]" />
            <span>Import Postman Collection</span>
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
          <p className="text-[11px] text-[var(--text-secondary)]">
            Upload a Postman collection JSON file (v2 / v2.1 format) or paste the raw JSON text below.
          </p>

          {/* File upload */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] hover:border-[var(--text-secondary)] rounded-lg p-6 bg-[var(--bg-primary)] transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="h-7 w-7 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] mb-2" />
            <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
              Choose file to upload (JSON)
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 my-1">
            <div className="h-[1px] flex-1 bg-[var(--border-color)]"></div>
            <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">OR</span>
            <div className="h-[1px] flex-1 bg-[var(--border-color)]"></div>
          </div>

          {/* Text Area */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase">Raw Collection JSON</label>
            <textarea
              placeholder='Paste Postman collection JSON here...'
              rows={6}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--pm-orange)] resize-none"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-1.5 rounded bg-red-950/30 border border-red-900/50 p-2.5 text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
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
            disabled={isImporting || !importJson.trim()}
            className="rounded bg-[var(--pm-orange)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--pm-orange-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </form>
    </div>
  );
}
