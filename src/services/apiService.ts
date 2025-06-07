import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
}

export const apiService = new ApiService(); 