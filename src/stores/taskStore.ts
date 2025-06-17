import { create } from 'zustand';
import { apiService } from '../services/apiService';

// Task status types
export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'ALL';

// Task interface updated to match the actual data structure
export interface Task {
  id: string;
  workflow_type: string;
  query: string;
  parameters: Record<string, any>;
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  context: {
    intent: string;
    confidence: number;
    marc1_intent?: {
      intent_name: string;
      confidence: number;
      parameters: Record<string, any>;
      raw_query: string;
      extracted_at: string;
    };
  };
  metadata: Record<string, any>;
  current_state: {
    task_id: string;
    status: TaskStatus;
    step_index: number;
    current_tool: string | null;
    parameters: Record<string, any>;
    outputs: Record<string, any>;
    error: string | null;
    context: Record<string, any>;
    updated_at: string;
    requires_approval: boolean;
    metadata: Record<string, any>;
  };
  history: Array<any>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  user_id: string;
  client_id: string;
}

// Pagination interface
interface Pagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// Task store state interface
interface TaskStoreState {
  tasks: Task[];
  filteredTasks: Task[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  
  // Filters
  statusFilter: string;
  startDateFilter: string;
  endDateFilter: string;
  searchTerm: string;
  
  // Actions
  fetchTasks: (page?: number) => Promise<void>;
  setStatusFilter: (status: string) => void;
  setStartDateFilter: (date: string) => void;
  setEndDateFilter: (date: string) => void;
  setSearchTerm: (term: string) => void;
  applyFilters: () => void;
}

export const useTaskStore = create<TaskStoreState>((set, get) => ({
  tasks: [],
  filteredTasks: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    limit: 10, // Default page size
    offset: 0,
    has_more: false
  },
  
  // Filters
  statusFilter: 'ALL',
  startDateFilter: '',
  endDateFilter: '',
  searchTerm: '',
  
  // Fetch tasks with pagination
  fetchTasks: async (page = 1) => {
    const { statusFilter, startDateFilter, endDateFilter, pagination } = get();
    const limit = pagination.limit;
    const offset = (page - 1) * limit;
    
    set({ loading: true, error: null });
    
    try {
      // Build query parameters
      const params: Record<string, any> = {
        limit,
        offset
      };
      
      if (statusFilter && statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      
      if (startDateFilter) {
        params.start_date = startDateFilter;
      }
      
      if (endDateFilter) {
        params.end_date = endDateFilter;
      }
      
      // Use apiService instead of direct axios call
      const response = await apiService.getTasks(params);
      
      set({ 
        tasks: response.items, 
        filteredTasks: response.items,
        pagination: response.pagination,
        loading: false 
      });
      
      // Apply any existing search filter
      get().applyFilters();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ 
        error: 'Failed to fetch tasks. Please try again later.',
        loading: false 
      });
    }
  },
  
  // Set status filter
  setStatusFilter: (status) => {
    set({ statusFilter: status });
  },
  
  // Set start date filter
  setStartDateFilter: (date) => {
    set({ startDateFilter: date });
  },
  
  // Set end date filter
  setEndDateFilter: (date) => {
    set({ endDateFilter: date });
  },
  
  // Set search term
  setSearchTerm: (term) => {
    set({ searchTerm: term });
    get().applyFilters();
  },
  
  // Apply filters (for client-side filtering)
  applyFilters: () => {
    const { tasks, searchTerm } = get();
    
    if (!searchTerm.trim()) {
      set({ filteredTasks: tasks });
      return;
    }
    
    const filtered = tasks.filter(task => 
      (task.query && task.query.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.workflow_type && task.workflow_type.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    set({ filteredTasks: filtered });
  }
}));