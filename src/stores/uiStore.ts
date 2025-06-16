import { create } from 'zustand';

interface UIState {
  // Global loading states
  isLoading: boolean;
  loadingMessage: string | null;
  
  // Modal states
  activeModal: string | null;
  modalData: any;
  
  // Sidebar state
  isSidebarOpen: boolean;
  
  // Actions
  setLoading: (isLoading: boolean, message?: string | null) => void;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isLoading: false,
  loadingMessage: null,
  activeModal: null,
  modalData: null,
  isSidebarOpen: false,
  
  // Actions
  setLoading: (isLoading, message = null) => set({ isLoading, loadingMessage: message }),
  
  openModal: (modalId, data = null) => set({ 
    activeModal: modalId, 
    modalData: data 
  }),
  
  closeModal: () => set({ 
    activeModal: null, 
    modalData: null 
  }),
  
  toggleSidebar: () => set((state) => ({ 
    isSidebarOpen: !state.isSidebarOpen 
  })),
  
  setSidebarOpen: (isOpen) => set({ 
    isSidebarOpen: isOpen 
  })
}));