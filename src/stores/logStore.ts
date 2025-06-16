import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { Log } from '../services/apiService';

interface LogState {
  logs: Log[];
  loading: boolean;
  error: string | null;
  levelFilter: string;
  startDate: string;
  endDate: string;
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;
  
  // Actions
  fetchLogs: () => Promise<void>;
  setLevelFilter: (level: string) => void;
  setDateRange: (start: string, end: string) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
}

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  loading: false,
  error: null,
  levelFilter: '',
  startDate: '',
  endDate: '',
  searchTerm: '',
   currentPage: 1,
  itemsPerPage: 10,
  fetchLogs: async () => {
    set({ loading: true, error: null });
    try {
      const { levelFilter, startDate, endDate } = get();
      
      const filters: any = {};
      if (levelFilter) filters.level = levelFilter;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      const data = await apiService.getLogs(filters);
      set({ logs: data, loading: false, currentPage:1  });
    } catch (err: any) {
      set({ 
        error: 'Failed to fetch logs. Please check your connection and try again.', 
        loading: false
      });
      console.error('Error fetching logs:', err);
    }
  },
  
  setLevelFilter: (level) => set({ levelFilter: level }),
  
  setDateRange: (start, end) => set({ startDate: start, endDate: end }),
  
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  clearFilters: () => set({ 
    levelFilter: '', 
    startDate: '', 
    endDate: '', 
    searchTerm: '' ,
    currentPage: 1
  }),
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setItemsPerPage: (items) => set({ itemsPerPage: items, currentPage: 1 }) // Reset to first page when changing items per page
}));