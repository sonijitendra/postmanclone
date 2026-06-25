'use client';

import React, { useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useEnvironmentStore } from '../../store/environmentStore';
import { Settings, Sun, Moon, Upload, Database, FolderCode } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function TopBar() {
  const { toggleTheme, theme, setActiveModal } = useUiStore();
  const { environments, activeEnvironmentId, fetchEnvironments, setActiveEnvironmentId } = useEnvironmentStore();

  useEffect(() => {
    fetchEnvironments();
  }, []);

  return (
    <header className="flex h-12 items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 select-none shrink-0">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-2">
        <FolderCode className="h-5 w-5 text-[var(--pm-orange)]" />
        <span className="font-bold tracking-wider text-sm text-[var(--text-primary)]">
          POSTMAN <span className="text-[var(--text-secondary)] font-normal">CLONE</span>
        </span>
      </div>

      {/* Workspace controls */}
      <div className="flex items-center gap-3">
        
        {/* Import Button */}
        <button
          onClick={() => setActiveModal('import')}
          className="flex items-center gap-1.5 rounded bg-[var(--bg-tertiary)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] transition-colors"
        >
          <Upload className="h-3.5 w-3.5 text-[var(--pm-orange)]" />
          <span>Import</span>
        </button>

        {/* Environment Selection Dropdown */}
        <div className="flex items-center gap-1 border-l border-[var(--border-color)] pl-3">
          <Database className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
          <select
            value={activeEnvironmentId || ''}
            onChange={(e) => setActiveEnvironmentId(e.target.value || null)}
            className="rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--pm-orange)] min-w-[130px] cursor-pointer"
          >
            <option value="">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name}
              </option>
            ))}
          </select>

          {/* Quick Edit Variables Gear Icon */}
          <button
            onClick={() => setActiveModal('variables')}
            className="rounded p-1.5 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Manage Environments"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded p-1.5 border border-[var(--border-color)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

      </div>
    </header>
  );
}
