import { create } from 'zustand';

export type SidebarTab = 'collections' | 'history';
export type ModalType = 'save-request' | 'new-collection' | 'import' | 'export' | 'settings' | 'variables' | null;

interface UiState {
  sidebarWidth: number;
  activeSidebarTab: SidebarTab;
  activeModal: ModalType;
  selectedCollectionId: string | null;
  theme: 'dark' | 'light';
  isSidebarCollapsed: boolean;
  
  setSidebarWidth: (width: number) => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  setActiveModal: (modal: ModalType) => void;
  setSelectedCollectionId: (id: string | null) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarWidth: 280,
  activeSidebarTab: 'collections',
  activeModal: null,
  selectedCollectionId: null,
  theme: 'dark',
  isSidebarCollapsed: false,

  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  setSelectedCollectionId: (id) => set({ selectedCollectionId: id }),
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
    }
    return { theme: nextTheme };
  }),
  setTheme: (theme) => set(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
    return { theme };
  }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
}));
