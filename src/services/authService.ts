import axios from 'axios';
import type { User } from '../types';

// Base API URL - should be configured based on environment
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define interfaces based on your backend
interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  username: string;
  role: string;
}

interface UserResponse {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  full_name?: string;
  role: string;
  client_id: string;
  client_name: string;
  client_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  preferences: Record<string, any>;
  can_execute_workflows: boolean;
  can_approve_tasks: boolean;
  can_modify_workflows: boolean;
  can_view_all_clients: boolean;
}

// Authentication service functions
export const authService = {
  // Login user
  login: async (username: string, password: string) => {
    try {
      const response = await api.post<TokenResponse>('/api/v1/auth/login', { username, password });
      const tokenData = response.data;
      
      // Store token in localStorage
      localStorage.setItem('access_token', tokenData.access_token);
      localStorage.setItem('user_id', tokenData.user_id);
      localStorage.setItem('username', tokenData.username);
      localStorage.setItem('role', tokenData.role);
      
      
      // Get user details
      const userDetails = await authService.getCurrentUser();
      // Store additional user details
    localStorage.setItem('first_name', userDetails.first_name || '');
    localStorage.setItem('last_name', userDetails.last_name || '');
    localStorage.setItem('email', userDetails.email || '');
    localStorage.setItem('client_id', userDetails.client_id || '');
    localStorage.setItem('client_name', userDetails.client_name || '');
    localStorage.setItem('client_email', userDetails.client_email || '');
      
      return { user: userDetails, token: tokenData.access_token };
    } catch (error:any) {
      console.error('Login error:', error.response.data.detail);
      throw new Error(error.response.data.detail || 'Authentication failed. Please check your credentials.');
    }
  },

  // Register user
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    role?: string;
    client_id?: string;
  }) => {
    try {
      const response = await api.post<UserResponse>('/api/v1/auth/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.response?.data?.detail) {
        throw new Error(`Registration failed: ${error.response.data.detail}`);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  // Logout user
  logout: async () => {
  try {
    // Call the backend logout endpoint to invalidate the refresh token
    await api.post('/api/v1/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear all user data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');
    localStorage.removeItem('email');
    localStorage.removeItem('client_id');
    localStorage.removeItem('client_name');
    localStorage.removeItem('client_email');
  }
},

  // Get current user
  getCurrentUser: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>('/api/v1/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw new Error('Failed to get user information.');
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post<TokenResponse>('/api/v1/auth/refresh');
      const tokenData = response.data;
      
      // Update token in localStorage
      localStorage.setItem('access_token', tokenData.access_token);
      
      return tokenData;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout
      authService.logout();
      throw new Error('Session expired. Please login again.');
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Add these methods to your existing authService object

// Get all users for the current client
getClientUsers: async () => {
  try {
    const response = await api.get<UserResponse[]>('/api/v1/auth/users');
    return response.data;
  } catch (error) {
    console.error('Get client users error:', error);
    throw new Error('Failed to fetch users.');
  }
},

// Update user status (activate/deactivate)
updateUserStatus: async (userId: string, isActive: boolean) => {
  try {
    const response = await api.patch<UserResponse>(`/api/v1/auth/users/${userId}/status`, {
      is_active: isActive
    });
    return response.data;
  } catch (error) {
    console.error('Update user status error:', error);
    throw new Error(`Failed to ${isActive ? 'activate' : 'deactivate'} user.`);
  }
},

// Delete user
deleteUser: async (userId: string) => {
  try {
    await api.delete(`/api/v1/auth/users/${userId}`);
    return true;
  } catch (error) {
    console.error('Delete user error:', error);
    throw new Error('Failed to delete user.');
  }
},
};


