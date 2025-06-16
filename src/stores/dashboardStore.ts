import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { StreamingData, DashboardStats } from '../services/apiService';

interface DashboardState {
  streamingData: StreamingData | null;
  dashboardStats: DashboardStats | null;
  error: string | null;
  loading: boolean;
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  toggleStreaming: (action: 'start' | 'stop' | 'pause') => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  streamingData: null,
  dashboardStats: null,
  error: null,
  loading: false,
  
  fetchDashboardData: async () => {
    set({ loading: true });
    try {
      // Fetch streaming status
      const streamData = await apiService.getStreamingStatus();
      
      // Fetch dashboard stats
      const userId = localStorage.getItem('user_id') || undefined;
      const clientId = localStorage.getItem('client_id') || undefined;
      const stats = await apiService.getDashboardStats(userId, clientId);
      
      set({ 
        streamingData: streamData, 
        dashboardStats: stats || null, 
        error: null, 
        loading: false 
      });
    } catch (err) {
      set({ 
        error: 'Failed to fetch dashboard data', 
        loading: false 
      });
      console.error('Dashboard data fetch error:', err);
    }
  },
  
  toggleStreaming: async (action) => {
    try {
      await apiService.toggleStreaming(action);
      const newStatus = await apiService.getStreamingStatus();
      set({ streamingData: newStatus, error: null });
    } catch (err) {
      set({ error: `Failed to ${action} streaming` });
    }
  }
}));