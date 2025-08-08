import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export interface Screenshot {
  filename: string;
  path: string;
  size_bytes: number;
  created_at: string;
  download_url: string;
}

export interface TaskScreenshotsResponse {
  task_id: string;
  screenshots: Screenshot[];
  total_count: number;
  message?: string;
}
// Mock data for fallback
const mockData = {
  logs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      level: 'INFO' as const,
      message: 'Successfully processed shipment #12345',
      details: { shipmentId: '12345', status: 'completed' },
      source: 'ShipmentProcessor'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: 'WARNING' as const,
      message: 'Validation failed for document upload',
      details: { documentId: 'DOC789', error: 'Invalid format' },
      source: 'DocumentValidator'
    }
  ],
  streamingData: {
    status: 'active' as const,
    currentTask: 'Processing shipment documents',
    progress: 75,
    recentActions: [
      { action: 'Document validation', status: 'completed' as const, timestamp: new Date().toISOString() },
      { action: 'Data extraction', status: 'in_progress' as const, timestamp: new Date().toISOString() }
    ]
  }
};

// Types
export interface Log {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  details: Record<string, any>;
  source: string;
}
// Add Task interface
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
    status: string;
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
// Add new interface for dashboard stats
export interface DashboardStats {
  total_tasks: {
    value: number;
    change: string;
  };
  success_rate: {
    value: string;
    change: string;
  };
  response_time: {
    value: string;
    optimized: boolean;
  };
  active_users: {
    value: number;
    online: boolean;
  };
  current_task: {
    id: string;
    name: string;
    status: string;
  } | null;
  recent_activity: Array<{
    id: string;
    name: string;
    status: string;
    completed_at: string;
  }>;
  system_health: {
    api_server: {
      status: string;
      latency_ms: number;
    };
    database: {
      status: string;
      latency_ms: number;
    };
    websocket: {
      status: string;
    };
    cache: {
      status: string;
      usage_percent: number;
    };
  };
}

export interface StreamingData {
  status: 'active' | 'paused' | 'stopped';
  currentTask: string;
  progress: number;
  recentActions: Array<{
    action: string;
    status: 'completed' | 'in_progress' | 'failed';
    timestamp: string;
  }>;
}

export interface QueryResponse {
  task_id: string;
  status: string;
  message: string;
  estimated_completion_time?: number;
}
// Add a new interface for task results that will be fetched after submission
export interface TaskResult {
  id: string;
  status: string;
  client_id: string;
  user_id: string;
  workflow_type: string;
  query: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  context: {
    intent: string;
    confidence: number;
    marc1_intent: {
      intent_name: string;
      confidence: number;
      extracted_at: string;
      parameters: Record<string, any>;
    };
    raw_query: string;
  };
  current_state: {
    task_id: string;
    status: string;
    step_index: number;
    current_tool: string | null;
    error: string | null;
    metadata: Record<string, any>;
    outputs: Record<string, any>;
    parameters: Record<string, any>;
    requires_approval: boolean;
  };
  tools: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  history: any[];
  parameters: Record<string, any>;
  description: string | null;
  name: string | null;
  workflow_id: string | null;
}

export interface TasksResponse {
  items: Task[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}


class ApiService {
  private async request<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await axios({
        url: `${API_BASE_URL}${endpoint}`,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          ...options.headers,
        },
      });
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
private token = localStorage.getItem('token') || null;
 // Natural Language Query - updated to match backend
  async executeQuery(query: string, context: Record<string, any> = {}): Promise<QueryResponse> {
    try {
      return await this.request<QueryResponse>('/api/v1/ai/query', {
        method: 'POST',
        data: { 
          query,
          context,
          client_id: localStorage.getItem('client_id') || undefined,
          user_id: localStorage.getItem('user_id') || undefined
        },
      });
    } catch (error) {
      // Mock response for development
      return {
        task_id: `mock-${Date.now()}`,
        status: "accepted",
        message: "Query received and processing has begun (MOCK)",
        estimated_completion_time: 5
      };
    }
  }
   // Add a method to check task status
 async getTaskResult(taskId: string): Promise<TaskResult> {
  try {
    return await this.request<TaskResult>(`/api/v1/tasks/${taskId}`);
  } catch (error) {
    console.error('Failed to fetch task result:', error);
    // Mock response for development based on the actual structure
    return {
      id: taskId,
      status: "COMPLETED",
      client_id: "mock-client-id",
      user_id: "mock-user-id",
      workflow_type: "nlp_query",
      query: "Login to CargoWise with username: john.doe and password: secure123 environment: web",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      context: {
        intent: "cargowise_login",
        confidence: 0.95,
        marc1_intent: {
          intent_name: "cargowise_login",
          confidence: 0.95,
          extracted_at: new Date().toISOString(),
          parameters: {
            username: "john.doe",
            password: "secure123",
            environment: "web"
          }
        },
        raw_query: "Login to CargoWise with username: john.doe and password: secure123 environment: web"
      },
      current_state: {
        task_id: taskId,
        status: "COMPLETED",
        step_index: 0,
        current_tool: null,
        error: null,
        metadata: {
          execution_start_time: new Date().toISOString(),
          current_step: 0,
          total_steps: 1,
          last_update: new Date().toISOString()
        },
        outputs: {
          logged_in: true,
          username: "john.doe",
          environment: "web"
        },
        parameters: {
          username: "john.doe",
          password: "secure123",
          environment: "web"
        },
        requires_approval: false
      },
      tools: [{
        name: "cargowise_login",
        description: "Log into CargoWise",
        parameters: {
          username: "john.doe",
          password: "secure123",
          environment: "web"
        }
      }],
      history: [],
      parameters: {
        username: "john.doe",
        password: "secure123",
        environment: "web"
      },
      description: null,
      name: null,
      workflow_id: null
    };
  }
}

  // Logs
  async getLogs(filters?: { level?: string; startDate?: string; endDate?: string }): Promise<Log[]> {
    try {
      return await this.request<Log[]>('/api/v1/logs', {
        method: 'GET',
        params: filters,
      });
    } catch (error) {
      // Return mock logs
      return mockData.logs;
    }
  }

  // Streaming Status
  async getStreamingStatus(): Promise<StreamingData> {
    try {
      return await this.request<StreamingData>('/api/stream/status');
    } catch (error) {
      // Return mock streaming data
      return mockData.streamingData;
    }
  }

  // Start/Stop Streaming
  async toggleStreaming(action: 'start' | 'stop' | 'pause'): Promise<{ success: boolean }> {
    try {
      return await this.request<{ success: boolean }>('/api/stream/control', {
        method: 'POST',
        data: { action },
      });
    } catch (error) {
      // Mock response
      return { success: true };
    }
  }
  setupWebSocketForTask(onMessage: (data: any) => void): WebSocket | null{
  try {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/api/v1/task/${this.token}`)
    ws.onmessage = (event) => {
      console.log(event)
      const data = JSON.parse(event.data)
      onMessage(data)
    }

    ws.onerror=(error)=> {
     console.log(error) 
    }
    return ws
  } catch (error) {

    return null
  }
}
  // WebSocket connection for real-time updates
  setupWebSocket(onMessage: (data: any) => void): WebSocket | null {
    try {
      
      const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/api/v1/log_streaming/ws`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data)
        onMessage(data);
      };


      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Fallback to polling if WebSocket fails
        this.startPolling(onMessage);
      };

      return ws;
    } catch (error) {
      console.error('WebSocket setup failed:', error);
      // Fallback to polling
      this.startPolling(onMessage);
      return null;
    }
  }

  private startPolling(onMessage: (data: any) => void) {
    // Simulate real-time updates with polling
    setInterval(() => {
      onMessage({
        type: 'update',
        data: {
          ...mockData.streamingData,
          timestamp: new Date().toISOString()
        }
      });
    }, 5000);
  }

   // Add new method to get dashboard stats
  async getDashboardStats(userId?: string, clientId?: string): Promise<DashboardStats | undefined> {
    try {
      // Build query parameters
      const params: Record<string, string> = {};
      if (userId) params.user_id = userId;
      if (clientId) params.client_id = clientId;
      
      return await this.request<DashboardStats>('/api/v1/dashboard/stats', {
        method: 'GET',
        params
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return mock data for development
      // return mockData.dashboardStats;
      
    }
  }
 // Add methods for task control actions
  async pauseTask(taskId: string): Promise<Task> {
     console.log('API Service: Pausing task', taskId);
    try {
      return await this.request<Task>(`/api/v1/tasks/${taskId}/cancel`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to pause task:', error);
      throw error;
    }
  }

  async resumeTask(taskId: string): Promise<Task> {
    try {
      return await this.request<Task>(`/api/v1/tasks/${taskId}/resume`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Failed to resume task:', error);
      throw error;
    }
  }

  async rejectTask(taskId: string, reason: string): Promise<Task> {
    try {
      return await this.request<Task>(`/api/v1/tasks/${taskId}/reject`, {
        method: 'POST',
        data: { reason }
      });
    } catch (error) {
      console.error('Failed to reject task:', error);
      throw error;
    }
  }

  async editTask(taskId: string, parameters: Record<string, any>): Promise<Task> {
    try {
      return await this.request<Task>(`/api/v1/tasks/${taskId}/edit`, {
        method: 'POST',
        data: { parameters }
      });
    } catch (error) {
      console.error('Failed to edit task:', error);
      throw error;
    }
  }

  async approveTask(taskId: string, approvalData: Record<string, any> = {}): Promise<Task> {
    try {
      return await this.request<Task>(`/api/v1/tasks/${taskId}/approve`, {
        method: 'POST',
        data: approvalData
      });
    } catch (error) {
      console.error('Failed to approve task:', error);
      throw error;
    }
  }
  // Add method to fetch tasks with pagination and filters
  async getTasks(params: {
    limit?: number;
    offset?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<TasksResponse | undefined> {
    try {
      return await this.request<TasksResponse>('/api/v1/tasks', {
        method: 'GET',
        params,
      });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      // Return mock tasks data for development
  
    }
  }

// Add method to fetch task screenshots
async getTaskScreenshots(taskId: string): Promise<TaskScreenshotsResponse> {
  try {
    return await this.request<TaskScreenshotsResponse>(`/api/v1/tasks/${taskId}/screenshots`, {
      method: 'GET'
    });
  } catch (error) {
    console.error('Failed to fetch task screenshots:', error);
    throw error;
  }
}

// Add method to get screenshot download URL
getScreenshotUrl(taskId: string, filename: string): string {
  return `${API_BASE_URL}/api/v1/tasks/${taskId}/screenshots/${filename}`;
}

}

export const apiService = new ApiService(); 