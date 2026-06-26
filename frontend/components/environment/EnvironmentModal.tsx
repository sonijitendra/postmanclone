'use client';

import React, { useState, useEffect } from 'react';
import { useEnvironmentStore } from '../../store/environmentStore';
import { useUiStore } from '../../store/uiStore';
import { Trash2, Plus, X, Settings2, ShieldCheck, CheckSquare, Square } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function EnvironmentModal() {
  const { activeModal, setActiveModal } = useUiStore();
  const { 
    environments, 
    activeEnvironmentId, 
    fetchEnvironments, 
    setActiveEnvironmentId, 
    createEnvironment, 
    deleteEnvironment, 
    updateVariables 
  } = useEnvironmentStore();

  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [variables, setVariables] = useState<{ key: string; value: string; enabled: boolean }[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    if (activeModal === 'variables') {
      fetchEnvironments().then(() => {
        // Set selected environment to the active one by default, or the first one
        const active = useEnvironmentStore.getState().activeEnvironmentId;
        const envs = useEnvironmentStore.getState().environments;
        if (active) {
          setSelectedEnvId(active);
        } else if (envs.length > 0) {
          setSelectedEnvId(envs[0].id);
        }
      });
    }
  }, [activeModal]);

  // Load variables of selected environment
  useEffect(() => {
    if (selectedEnvId) {
      const env = environments.find((e) => e.id === selectedEnvId);
      if (env) {
        setVariables(env.variables.map((v) => ({ 
          key: v.key, 
          value: v.value, 
          enabled: v.enabled 
        })));
      }
    } else {
      setVariables([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEnvId]);

  if (activeModal !== 'variables') return null;

  const handleAddVariable = () => {
    setVariables([...variables, { key: '', value: '', enabled: true }]);
  };

  const handleUpdateVariable = (index: number, field: 'key' | 'value' | 'enabled', val: any) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: val };
    setVariables(updated);
  };

  const handleDeleteVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleCreateEnvironment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim()) return;
    try {
      const newEnv = await createEnvironment(newEnvName);
      setSelectedEnvId(newEnv.id);
      setNewEnvName('');
      setIsCreatingNew(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedEnvId) return;
    // Filter out variables with empty keys
    const filteredVars = variables.filter((v) => v.key.trim() !== '');
    try {
      await updateVariables(selectedEnvId, filteredVars);
      setActiveModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEnv = async (id: string) => {
    if (confirm('Are you sure you want to delete this environment?')) {
      try {
        await deleteEnvironment(id);
        const remaining = useEnvironmentStore.getState().environments;
        if (remaining.length > 0) {
          setSelectedEnvId(remaining[0].id);
        } else {
          setSelectedEnvId(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const selectedEnv = environments.find((e) => e.id === selectedEnvId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
      <div className="flex h-[550px] w-[800px] flex-col rounded-lg border border-[var(--border-color)] bg-[var(--bg-modal)] text-[var(--text-primary)] shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <Settings2 className="h-4 w-4 text-[var(--pm-orange)]" />
            <span>Manage Environments</span>
          </div>
          <button 
            onClick={() => setActiveModal(null)}
            className="rounded p-1 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar (List of Environments) */}
          <div className="w-[200px] border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-wider font-semibold text-[var(--text-secondary)]">
              <span>Environments</span>
              <button 
                onClick={() => setIsCreatingNew(true)}
                className="rounded p-1 hover:bg-[var(--bg-hover)] text-[var(--pm-orange)]"
                title="Create environment"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {isCreatingNew ? (
              <form onSubmit={handleCreateEnvironment} className="mb-2">
                <input
                  type="text"
                  placeholder="Env name..."
                  autoFocus
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-primary)] px-2 py-1 text-xs outline-none focus:border-[var(--pm-orange)]"
                />
                <div className="flex justify-end gap-1 mt-1.5">
                  <button 
                    type="button" 
                    onClick={() => setIsCreatingNew(false)} 
                    className="rounded bg-[var(--bg-tertiary)] px-2 py-0.5 text-[10px] hover:bg-[var(--bg-hover)]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="rounded bg-[var(--pm-orange)] px-2 py-0.5 text-[10px] text-white hover:bg-[var(--pm-orange-hover)]"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : null}

            <div className="flex flex-col gap-1">
              {environments.map((env) => (
                <div
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  className={cn(
                    "group flex items-center justify-between rounded px-2 py-1.5 text-xs cursor-pointer transition-colors",
                    selectedEnvId === env.id 
                      ? "bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium" 
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]/50 hover:text-[var(--text-primary)]"
                  )}
                >
                  <span className="truncate pr-1">{env.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEnv(env.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-[var(--bg-active)] text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {environments.length === 0 && !isCreatingNew && (
                <div className="text-[11px] text-[var(--text-tertiary)] text-center py-4">
                  No environments. Click + to create.
                </div>
              )}
            </div>
          </div>

          {/* Variables Workspace */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            {selectedEnv ? (
              <div className="flex flex-col flex-1">
                {/* Env Meta */}
                <div className="flex items-center justify-between mb-4 border-b border-[var(--border-color)] pb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{selectedEnv.name}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Define variables to use across request URL, headers, body, or auth (e.g. <code className="bg-[var(--bg-secondary)] px-1 rounded text-[var(--pm-orange)]">{"{{BASE_URL}}"}</code>).
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveEnvironmentId(activeEnvironmentId === selectedEnv.id ? null : selectedEnv.id)}
                    className={cn(
                      "flex items-center gap-1 text-xs rounded border px-2.5 py-1 transition-all",
                      activeEnvironmentId === selectedEnv.id
                        ? "border-[var(--pm-orange)] bg-[var(--pm-orange-light)] text-[var(--pm-orange)] font-semibold"
                        : "border-[var(--border-color)] hover:border-[var(--text-secondary)] text-[var(--text-secondary)]"
                    )}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{activeEnvironmentId === selectedEnv.id ? 'Active Environment' : 'Set Active'}</span>
                  </button>
                </div>

                {/* Variables Grid */}
                <div className="flex-1 overflow-x-auto min-h-[250px]">
                  <table className="kv-table text-xs">
                    <thead>
                      <tr>
                        <th className="w-[30px] text-center"></th>
                        <th className="w-[200px]">Variable Key</th>
                        <th>Current Value</th>
                        <th className="w-[50px] text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variables.map((variable, idx) => (
                        <tr key={idx} className="group hover:bg-[var(--bg-hover)]/20">
                          {/* Enabled Checkbox */}
                          <td className="text-center">
                            <button
                              onClick={() => handleUpdateVariable(idx, 'enabled', !variable.enabled)}
                              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                              {variable.enabled ? (
                                <CheckSquare className="h-3.5 w-3.5 text-[var(--pm-orange)]" />
                              ) : (
                                <Square className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </td>
                          {/* Key */}
                          <td>
                            <input
                              type="text"
                              value={variable.key}
                              onChange={(e) => handleUpdateVariable(idx, 'key', e.target.value)}
                              placeholder="e.g. BASE_URL"
                              className="w-full text-xs"
                            />
                          </td>
                          {/* Value */}
                          <td>
                            <input
                              type="text"
                              value={variable.value}
                              onChange={(e) => handleUpdateVariable(idx, 'value', e.target.value)}
                              placeholder="e.g. https://api.example.com"
                              className="w-full text-xs font-mono"
                            />
                          </td>
                          {/* Delete */}
                          <td className="text-center">
                            <button
                              onClick={() => handleDeleteVariable(idx)}
                              className="rounded p-1 hover:bg-[var(--bg-active)] text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {variables.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-6 text-[var(--text-tertiary)] italic">
                            No variables defined yet. Click "Add Variable" below.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Add Row Button */}
                <button
                  onClick={handleAddVariable}
                  className="flex items-center justify-center gap-1.5 self-start text-xs border border-dashed border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded px-3 py-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mt-3 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Variable</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center p-6 text-[var(--text-secondary)]">
                <Settings2 className="h-10 w-10 text-[var(--text-tertiary)] mb-2" />
                <h4 className="font-semibold text-sm">Select an Environment</h4>
                <p className="text-xs text-[var(--text-tertiary)] max-w-xs mt-1">
                  Create or select an environment from the sidebar list to manage its keys and values.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
          <button
            onClick={() => setActiveModal(null)}
            className="rounded bg-[var(--bg-tertiary)] px-3.5 py-1.5 text-xs font-semibold hover:bg-[var(--bg-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={!selectedEnvId}
            className="rounded bg-[var(--pm-orange)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--pm-orange-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
