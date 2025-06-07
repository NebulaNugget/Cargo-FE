// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
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



// Optional: If you need the enum values as constants for runtime usage,
// you can create const objects that are compatible with the types above
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER'
} as const;
