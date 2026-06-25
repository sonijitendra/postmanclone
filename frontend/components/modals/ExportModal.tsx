'use client';

import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useCollections } from '../../features/collections/useCollections';
import { apiService } from '../../services/api';
import { Download, Copy, Check, X, FileCode } from 'lucide-react';

export default function ExportModal() {
  const { activeModal, setActiveModal, selectedCollectionId, setSelectedCollectionId } = useUiStore();
  const { collections } = useCollections();

  const [exportData, setExportData] = useState<any>(null);
  const [exportString, setExportString] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const collection = collections.find((c) => c.id === selectedCollectionId);

  useEffect(() => {
    if (activeModal === 'export' && selectedCollectionId) {
      setIsLoading(true);
      setExportData(null);
      setExportString('');
      apiService.exportCollection(selectedCollectionId)
        .then((data) => {
          setExportData(data);
          setExportString(JSON.stringify(data, null, 2));
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [activeModal, selectedCollectionId]);

  if (activeModal !== 'export') return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(exportString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!exportData || !collection) return;
    const blob = new Blob([exportString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.name.toLowerCase().replace(/\s+/g, '_')}.postman_collection.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setActiveModal(null);
    setSelectedCollectionId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-30">
      <div className="flex w-[520px] flex-col rounded-lg border border-[var(--border-color)] bg-[var(--bg-modal)] text-[var(--text-primary)] shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
            <FileCode className="h-4 w-4 text-[var(--pm-orange)]" />
            <span>Export Collection</span>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="rounded p-1 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="spinner"></div>
              <span className="text-xs text-[var(--text-secondary)]">Generating export file...</span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Collection <strong className="text-[var(--text-primary)]">{collection?.name}</strong> has been serialized to Postman v2.1 format. You can copy it or download the file.
              </p>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">Collection JSON</span>
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
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={exportString}
                  rows={10}
                  className="rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-[11px] font-mono text-[var(--text-primary)] outline-none resize-none focus:border-[var(--pm-orange)]"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
          <button
            onClick={handleClose}
            className="rounded bg-[var(--bg-tertiary)] px-3.5 py-1.5 text-xs font-semibold hover:bg-[var(--bg-hover)]"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={isLoading || !exportData}
            className="rounded bg-[var(--pm-orange)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--pm-orange-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download File</span>
          </button>
        </div>

      </div>
    </div>
  );
}
