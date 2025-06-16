import { create } from 'zustand';
import { authService } from '../services/authService';
import type { User } from '../types';

interface ExtendedUser extends User {
  is_active: boolean;
  created_at: string;
  updated_at: string;
  full_name?: string;
  can_execute_workflows: boolean;
  can_approve_tasks: boolean;
  can_modify_workflows: boolean;
  can_view_all_clients: boolean;
}

interface UserState {
  users: ExtendedUser[];
  filteredUsers: ExtendedUser[];
  currentUser: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  filterRole: string;
  filterStatus: string;
  
  // Actions
  fetchUsers: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setFilterRole: (role: string) => void;
  setFilterStatus: (status: string) => void;
  approveUser: (userId: string) => Promise<void>;
  disableUser: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  applyFilters: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  filteredUsers: [],
  currentUser: null,
  loading: false,
  error: null,
  searchTerm: '',
  filterRole: 'ALL',
  filterStatus: 'ALL',
  
  fetchUsers: async () => {
    set({ loading: true });
    try {
      // Get current user to check permissions
      const userData = await authService.getCurrentUser();
      
      // Get all users for the client
      const response = await authService.getClientUsers();
      
      set({ 
        currentUser: userData as ExtendedUser,
        users: response as ExtendedUser[], 
        filteredUsers: response as ExtendedUser[],
        error: null,
        loading: false
      });
    } catch (err: any) {
      set({ 
        error: err.message || 'Failed to fetch users', 
        loading: false 
      });
      console.error('Error fetching users:', err);
    }
  },
  
  setSearchTerm: (term) => {
    set({ searchTerm: term });
    get().applyFilters();
  },
  
  setFilterRole: (role) => {
    set({ filterRole: role });
    get().applyFilters();
  },
  
  setFilterStatus: (status) => {
    set({ filterStatus: status });
    get().applyFilters();
  },
  
  approveUser: async (userId) => {
    set({ loading: true });
    try {
      await authService.updateUserStatus(userId, true);
      
      // Update local state
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? { ...user, is_active: true } : user
        ),
        loading: false,
        error: null
      }));
      
      get().applyFilters();
    } catch (err: any) {
      set({ 
        error: err.message || 'Failed to approve user', 
        loading: false 
      });
    }
  },
  
  disableUser: async (userId) => {
    set({ loading: true });
    try {
      await authService.updateUserStatus(userId, false);
      
      // Update local state
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? { ...user, is_active: false } : user
        ),
        loading: false,
        error: null
      }));
      
      get().applyFilters();
    } catch (err: any) {
      set({ 
        error: err.message || 'Failed to disable user', 
        loading: false 
      });
    }
  },
  
  deleteUser: async (userId) => {
    set({ loading: true });
    try {
      await authService.deleteUser(userId);
      
      // Update local state
      set((state) => ({
        users: state.users.filter(user => user.id !== userId),
        loading: false,
        error: null
      }));
      
      get().applyFilters();
    } catch (err: any) {
      set({ 
        error: err.message || 'Failed to delete user', 
        loading: false 
      });
    }
  },
  
  applyFilters: () => {
    const { users, searchTerm, filterRole, filterStatus } = get();
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.first_name && user.first_name.toLowerCase().includes(term)) ||
        (user.last_name && user.last_name.toLowerCase().includes(term))
      );
    }
    
    // Apply role filter
    if (filterRole !== 'ALL') {
      result = result.filter(user => user.role === filterRole);
    }
    
    // Apply status filter
    if (filterStatus !== 'ALL') {
      const isActive = filterStatus === 'ACTIVE';
      result = result.filter(user => user.is_active === isActive);
    }
    
    set({ filteredUsers: result });
  }
}));