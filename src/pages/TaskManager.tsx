import { useEffect, useState } from 'react';
import {
  ClipboardList,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Eye
} from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';
import { format, parseISO } from 'date-fns';
import TaskDetailsModal from '../components/TaskDetailsModal';

export default function TaskManager() {
  const {
    tasks,
    filteredTasks,
    loading,
    error,
    pagination,
    statusFilter,
    startDateFilter,
    endDateFilter,
    searchTerm,
    fetchTasks,
    setStatusFilter,
    setStartDateFilter,
    setEndDateFilter,
    setSearchTerm
  } = useTaskStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


    // Add new state to track which dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // Toggle dropdown visibility
  const toggleDropdown = (taskId: string) => {
    if (openDropdownId === taskId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(taskId);
    }
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTasks(page);
  };

  // Handle filter apply
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchTasks(1);
  };
 // Open task details modal
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Close task details modal
  const closeTaskDetails = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'RUNNING':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'RUNNING':
        return <Play className="w-3 h-3 mr-1" />;
      case 'COMPLETED':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'FAILED':
        return <XCircle className="w-3 h-3 mr-1" />;
      case 'CANCELLED':
        return <XCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const pageNumbers = [];
  
  // Generate page numbers for pagination
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
  }

  return (
    <div className="min-h-screen lg:ml-60 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.8))] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Task Manager
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">View and manage system tasks</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTasks(currentPage)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
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
                  placeholder="Search tasks..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 appearance-none min-w-[140px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="RUNNING">Running</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  placeholder="Start Date"
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 min-w-[140px]"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  placeholder="End Date"
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 min-w-[140px]"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>
              
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {loading && filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading tasks...
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                      No tasks found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {task.query || 'No query'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {task.context?.intent && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 mr-2">
                                Intent: {task.context.intent}
                              </span>
                            )}
                            {task.context?.confidence && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                                Confidence: {(task.context.confidence * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${getStatusBadgeColor(task.current_state.status)}`}>
                          {getStatusIcon(task.current_state.status)}
                          {task.current_state.status}
                        </span>
                        {task.current_state.error && (
                          <div className="text-xs text-red-500 mt-1 max-w-xs truncate">
                            {task.current_state.error}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                          <Terminal className="w-3 h-3 mr-1" />
                          {task.workflow_type || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(task.created_at)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(task.current_state.updated_at)}
                      </td>
                     
                       <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1 relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent the outside click handler
                              toggleDropdown(task.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openDropdownId === task.id && (
                            <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                              <button
                                onClick={() => {
                                  openTaskDetails(task);
                                  setOpenDropdownId(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                                View Details
                              </button>
                              {/* Add more dropdown options here as needed */}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filteredTasks.length > 0 && (
            <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between">
              <div className="text-xs text-gray-500 mb-3 sm:mb-0">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + filteredTasks.length, pagination.total)} of {pagination.total} tasks
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {pageNumbers.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={`px-3 py-1 text-sm rounded-md ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border border-blue-600'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } ${page === '...' ? 'cursor-default' : ''}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2 py-1 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
       <TaskDetailsModal 
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={closeTaskDetails}
      />
    </div>
  );
}