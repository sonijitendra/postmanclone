import { create } from 'zustand';
import { Tab, RequestState, KeyValuePair, HttpMethod, BodyType, AuthType, ProxyResponse } from '../types';
import { apiService } from '../services/api';

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  responses: Record<string, ProxyResponse | null>;
  loadingStates: Record<string, boolean>;
  isTabsLoading: boolean;
  error: string | null;

  fetchTabs: () => Promise<void>;
  setActiveTabId: (id: string) => Promise<void>;
  openNewTab: (initialState?: Partial<RequestState> & { title?: string; request_id?: string; history_id?: string }) => Promise<Tab>;
  closeTab: (id: string) => Promise<void>;
  reorderTabs: (tabIds: string[]) => Promise<void>;
  updateActiveTabRequest: (updater: (state: RequestState) => RequestState) => void;
  setResponse: (tabId: string, response: ProxyResponse | null) => void;
  setLoadingState: (tabId: string, loading: boolean) => void;
  saveActiveRequest: (collectionId: string, name: string) => Promise<void>;
}

export const createDefaultRequestState = (): RequestState => ({
  method: 'GET',
  url: '',
  headers: [{ key: '', value: '', enabled: true }],
  params: [{ key: '', value: '', enabled: true }],
  body: { type: 'none', content: '', form_data: [{ key: '', value: '', enabled: true }] },
  auth: { type: 'none' },
});

export const useTabStore = create<TabState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  responses: {},
  loadingStates: {},
  isTabsLoading: false,
  error: null,

  fetchTabs: async () => {
    set({ isTabsLoading: true, error: null });
    try {
      const data = await apiService.getTabs();
      // Ensure each tab has unsaved_state initialized
      const resolvedTabs = data.map((t) => ({
        ...t,
        unsaved_state: t.unsaved_state || createDefaultRequestState(),
      }));

      // Sort by sort_order
      resolvedTabs.sort((a, b) => a.sort_order - b.sort_order);

      const activeTab = resolvedTabs.find((t) => t.is_active);
      
      set({ 
        tabs: resolvedTabs, 
        activeTabId: activeTab ? activeTab.id : (resolvedTabs.length > 0 ? resolvedTabs[0].id : null),
        isTabsLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch tabs', isTabsLoading: false });
    }
  },

  setActiveTabId: async (id) => {
    const previousActiveId = get().activeTabId;
    if (previousActiveId === id) return;

    // Optimistically update frontend
    set((state) => ({
      activeTabId: id,
      tabs: state.tabs.map((t) => ({ ...t, is_active: t.id === id })),
    }));

    try {
      await apiService.updateTab(id, { is_active: true });
    } catch (err) {
      console.error('Failed to sync active tab with backend', err);
    }
  },

  openNewTab: async (initialState) => {
    const { tabs } = get();
    
    // Check if we are opening a saved request that's already open in a tab
    if (initialState?.request_id) {
      const existingTab = tabs.find((t) => t.request_id === initialState.request_id);
      if (existingTab) {
        await get().setActiveTabId(existingTab.id);
        return existingTab;
      }
    }

    const sortOrder = tabs.length;
    const requestState = {
      ...createDefaultRequestState(),
      ...initialState,
    };

    const newTabPayload = {
      tab_type: initialState?.request_id ? 'saved' : (initialState?.history_id ? 'history' : 'new'),
      title: initialState?.title || 'Untitled Request',
      request_id: initialState?.request_id,
      history_id: initialState?.history_id,
      unsaved_state: requestState,
      is_active: true,
      sort_order: sortOrder,
    };

    try {
      const createdTab = await apiService.createTab(newTabPayload);
      const resolvedTab = {
        ...createdTab,
        unsaved_state: createdTab.unsaved_state || requestState,
      };

      set((state) => ({
        tabs: [...state.tabs.map((t) => ({ ...t, is_active: false })), resolvedTab],
        activeTabId: resolvedTab.id,
      }));

      return resolvedTab;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create tab' });
      throw err;
    }
  },

  closeTab: async (id) => {
    const { tabs, activeTabId } = get();
    const tabIndex = tabs.findIndex((t) => t.id === id);
    if (tabIndex === -1) return;

    const remainingTabs = tabs.filter((t) => t.id !== id);
    let nextActiveId = activeTabId;

    if (activeTabId === id) {
      if (remainingTabs.length > 0) {
        // Active tab closed, switch to adjacent tab
        const nextActiveIndex = Math.min(tabIndex, remainingTabs.length - 1);
        nextActiveId = remainingTabs[nextActiveIndex].id;
      } else {
        nextActiveId = null;
      }
    }

    // Update locally first (optimistic UI)
    set((state) => {
      const updatedTabs = state.tabs.filter((t) => t.id !== id);
      if (nextActiveId) {
        return {
          tabs: updatedTabs.map((t) => ({ ...t, is_active: t.id === nextActiveId })),
          activeTabId: nextActiveId,
        };
      }
      return {
        tabs: updatedTabs,
        activeTabId: null,
      };
    });

    try {
      await apiService.closeTab(id);
      if (nextActiveId) {
        await apiService.updateTab(nextActiveId, { is_active: true });
      }
    } catch (err) {
      console.error('Failed to close tab on backend', err);
    }
  },

  reorderTabs: async (tabIds) => {
    // Reorder locally
    set((state) => {
      const idMap = new Map(tabIds.map((id, index) => [id, index]));
      const updatedTabs = [...state.tabs].sort((a, b) => {
        return (idMap.get(a.id) ?? 0) - (idMap.get(b.id) ?? 0);
      }).map((t, idx) => ({ ...t, sort_order: idx }));

      return { tabs: updatedTabs };
    });

    try {
      await apiService.reorderTabs(tabIds);
    } catch (err) {
      console.error('Failed to reorder tabs on backend', err);
    }
  },

  updateActiveTabRequest: (updater) => {
    const { activeTabId, tabs } = get();
    if (!activeTabId) return;

    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab || !activeTab.unsaved_state) return;

    const updatedState = updater(activeTab.unsaved_state);

    // Update in store
    set((state) => ({
      tabs: state.tabs.map((t) => 
        t.id === activeTabId 
          ? { ...t, unsaved_state: updatedState } 
          : t
      ),
    }));

    // Debounced sync with backend tab state
    // We do a fire-and-forget sync to preserve unsaved changes in the database
    apiService.updateTab(activeTabId, { unsaved_state: updatedState })
      .catch((err) => console.error('Failed to auto-save tab state', err));
  },

  setResponse: (tabId, response) => {
    set((state) => ({
      responses: {
        ...state.responses,
        [tabId]: response,
      },
    }));
  },

  setLoadingState: (tabId, loading) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [tabId]: loading,
      },
    }));
  },

  saveActiveRequest: async (collectionId, name) => {
    const { activeTabId, tabs } = get();
    if (!activeTabId) return;

    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (!activeTab || !activeTab.unsaved_state) return;

    const state = activeTab.unsaved_state;
    try {
      let savedRequest;
      if (activeTab.request_id) {
        // Update existing saved request
        savedRequest = await apiService.updateRequest(activeTab.request_id, {
          name,
          method: state.method,
          url: state.url,
          headers: state.headers,
          params: state.params,
          body: state.body,
          body_type: state.body.type,
          auth_type: state.auth.type,
          auth_data: state.auth,
        });
      } else {
        // Save new request to collection
        savedRequest = await apiService.saveRequest(collectionId, {
          name,
          method: state.method,
          url: state.url,
          headers: state.headers,
          params: state.params,
          body: state.body,
          body_type: state.body.type,
          auth_type: state.auth.type,
          auth_data: state.auth,
        });
      }

      // Update tab properties
      set((state) => ({
        tabs: state.tabs.map((t) => 
          t.id === activeTabId 
            ? { 
                ...t, 
                tab_type: 'saved',
                title: name,
                request_id: savedRequest.id 
              } 
            : t
        ),
      }));

      // Sync with backend tab
      await apiService.updateTab(activeTabId, {
        title: name,
        request_id: savedRequest.id,
        tab_type: 'saved',
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to save request' });
      throw err;
    }
  },
}));
