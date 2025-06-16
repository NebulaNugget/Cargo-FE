// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  client_id?: string;
  client_name?: string;
  client_email?: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';

// Authentication types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Message types for NaturalLanguageQuery
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isProcessing?: boolean;
  error?: string | null;
  taskData?: any; // TaskResult type
  status?: string;
  taskId?: string;
  taskStatus?: string;
  relatedUserMessageId?: string;
  response?: {
    confidence: number;
    latency: number;
    intent?: string;
    parameters?: Record<string, any>;
    outputs?: Record<string, any>;
  };
}

// Task tracking
export interface PendingTask {
  taskId: string;
  messageId: string;
  userMessageId?: string;
  pollingInterval?: ReturnType<typeof setInterval>;
  logPollingInterval?: ReturnType<typeof setInterval>;
}

// Task logs
export interface TaskLog {
  timestamp: Date;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  data?: Record<string, any>;
}

// Optional: If you need the enum values as constants for runtime usage,
// you can create const objects that are compatible with the types above
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER'
} as const;