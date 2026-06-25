'use client';

import React from 'react';
import { useUiStore, SidebarTab } from '../../store/uiStore';
import { Folder, History } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SidebarTabs() {
  const { activeSidebarTab, setActiveSidebarTab } = useUiStore();

  const tabs: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'collections',
      label: 'Collections',
      icon: <Folder className="h-4 w-4" />,
    },
    {
      id: 'history',
      label: 'History',
      icon: <History className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs font-semibold select-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveSidebarTab(tab.id)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2.5 transition-colors border-b-2",
            activeSidebarTab === tab.id
              ? "border-b-[var(--pm-orange)] text-[var(--pm-orange)] bg-[var(--bg-primary)]"
              : "border-b-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
