import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Shield,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { authService } from '../services/authService';
import { User, UserRole } from '../types';

// Extended user interface to include additional fields from your API response
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

export default function UserManagement() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Get current user to check permissions
        const userData = await authService.getCurrentUser();
        setCurrentUser(userData as ExtendedUser);
        
        // Get all users for the client
        const response = await authService.getClientUsers();
        setUsers(response as ExtendedUser[]);
        setFilteredUsers(response as ExtendedUser[]);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
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
    
    setFilteredUsers(result);
  }, [searchTerm, filterRole, filterStatus, users]);

  // Handle user actions
  const handleApproveUser = async (userId: string) => {
    try {
      setLoading(true);
      await authService.updateUserStatus(userId, true);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_active: true } : user
        )
      );
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to approve user');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableUser = async (userId: string) => {
    try {
      setLoading(true);
      await authService.updateUserStatus(userId, false);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_active: false } : user
        )
      );
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to disable user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await authService.deleteUser(userId);
      
      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const response = await authService.getClientUsers();
      setUsers(response as ExtendedUser[]);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh users');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
     
      case 'OPERATOR':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Check if current user can perform actions
  const canManageUsers = currentUser?.role === 'ADMIN' || currentUser?.can_approve_tasks;

  return (
  <div className="min-h-screen lg:ml-60 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.8))] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">Manage users and access permissions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
           
            <button
              onClick={() => {}}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
              <div className="ml-2">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 appearance-none min-w-[120px]"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Admin</option>
                
                  <option value="OPERATOR">Operator</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 appearance-none min-w-[120px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {loading && filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      No users found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            {user.first_name && user.last_name 
                              ? `${user.first_name[0]}${user.last_name[0]}`
                              : user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : user.username}
                            </div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getRoleBadgeColor(user.role)}`}>
                          {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                          user.is_active 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1">
                          {!user.is_active && canManageUsers && (
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              disabled={loading || user.id === currentUser?.id}
                              className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                              title="Approve User"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          
                          {user.is_active && canManageUsers && (
                            <button
                              onClick={() => handleDisableUser(user.id)}
                              disabled={loading || user.id === currentUser?.id}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors"
                              title="Disable User"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          
                          {canManageUsers && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={loading || user.id === currentUser?.id}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Stats */}
          <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div>
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <div className="flex items-center gap-4">
              <span>{users.filter(u => u.is_active).length} active</span>
              <span>{users.filter(u => !u.is_active).length} inactive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}