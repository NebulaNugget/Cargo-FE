import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { User, UserRole } from '../types';

// Define the registration data type
interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(username, password);
          const { user, token } = response;
          
          // Store token in localStorage for immediate access
          localStorage.setItem('access_token', token);
          
          set({ 
            user: {
              ...user,
              role: user.role as UserRole
            },
            token, 
            isAuthenticated: true, 
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          // Clear any existing token on login failure
          localStorage.removeItem('access_token');
          
          set({ 
            user: null,
            token: null,
            error: error.message || 'Login failed', 
            isLoading: false,
            isAuthenticated: false 
          });
          throw error;
        }
      },
      
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          // Call logout service if it exists
          if (authService.logout) {
            await authService.logout();
          }
          
          // Clear localStorage
          localStorage.removeItem('access_token');
          
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          // Even if logout fails, clear local state
          localStorage.removeItem('access_token');
          
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            error: error.message || 'Logout failed', 
            isLoading: false 
          });
        }
      },
      
      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
            role: userData.role
          });
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({ 
            error: error.message || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },
      
      checkAuth: async () => {
        const currentToken = get().token || localStorage.getItem('access_token');
        
        if (!currentToken) {
          set({ 
            user: null,
            token: null,
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const userData = await authService.getCurrentUser();
          set({ 
            user: {
              ...userData,
              role: userData.role as UserRole
            },
            token: currentToken,
            isAuthenticated: true, 
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          // Token is invalid, clear everything
          localStorage.removeItem('access_token');
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        }
      },
      
      clearError: () => set({ error: null }),
      
      setUser: (user: User) => set({ user }),
      
      setToken: (token: string) => {
        localStorage.setItem('access_token', token);
        set({ token, isAuthenticated: true });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
    }
  )
);

// Export the RegisterData type for use in components
export type { RegisterData };