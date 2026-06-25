import { create } from 'zustand';
import { Environment, EnvironmentVariable } from '../types';
import { apiService } from '../services/api';

interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchEnvironments: () => Promise<void>;
  setActiveEnvironmentId: (id: string | null) => Promise<void>;
  createEnvironment: (name: string) => Promise<Environment>;
  deleteEnvironment: (id: string) => Promise<void>;
  updateVariables: (id: string, variables: { key: string; value: string; enabled: boolean }[]) => Promise<void>;
  getActiveVariables: () => EnvironmentVariable[];
}

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  environments: [],
  activeEnvironmentId: null,
  isLoading: false,
  error: null,

  fetchEnvironments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiService.getEnvironments();
      const active = data.find((e) => e.is_active);
      set({ 
        environments: data, 
        activeEnvironmentId: active ? active.id : null,
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch environments', isLoading: false });
    }
  },

  setActiveEnvironmentId: async (id) => {
    try {
      await apiService.activateEnvironment(id);
      set((state) => ({
        activeEnvironmentId: id,
        environments: state.environments.map((e) => ({
          ...e,
          is_active: e.id === id,
        })),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to activate environment' });
    }
  },

  createEnvironment: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const newEnv = await apiService.createEnvironment({ name, variables: [] });
      set((state) => ({
        environments: [...state.environments, newEnv],
        isLoading: false
      }));
      return newEnv;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create environment', isLoading: false });
      throw err;
    }
  },

  deleteEnvironment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteEnvironment(id);
      set((state) => {
        const nextActiveId = state.activeEnvironmentId === id ? null : state.activeEnvironmentId;
        return {
          environments: state.environments.filter((e) => e.id !== id),
          activeEnvironmentId: nextActiveId,
          isLoading: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete environment', isLoading: false });
      throw err;
    }
  },

  updateVariables: async (id, variables) => {
    try {
      const updatedVars = await apiService.updateVariables(id, variables);
      set((state) => ({
        environments: state.environments.map((e) => 
          e.id === id ? { ...e, variables: updatedVars } : e
        ),
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update environment variables' });
      throw err;
    }
  },

  getActiveVariables: () => {
    const { environments, activeEnvironmentId } = get();
    if (!activeEnvironmentId) return [];
    const activeEnv = environments.find((e) => e.id === activeEnvironmentId);
    return activeEnv ? activeEnv.variables : [];
  },
}));
