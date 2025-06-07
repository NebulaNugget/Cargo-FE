import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Clock,
  Users,
  CheckCircle,
  Activity,
  Shield,
  TrendingUp,
  AlertCircle,
  Settings,
  BarChart3,
  Zap,
  Globe,
  Server,
  Database
} from 'lucide-react';
import { apiService, StreamingData, DashboardStats } from '../services/apiService';

export default function Dashboard() {
  const [streamingData, setStreamingData] = useState<StreamingData | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch streaming status
        const streamData = await apiService.getStreamingStatus();
        setStreamingData(streamData);
        
        // Fetch dashboard stats
        const userId = localStorage.getItem('user_id') || undefined;
        const clientId = localStorage.getItem('client_id') || undefined;
        const stats = await apiService.getDashboardStats(userId, clientId);
        setDashboardStats(stats);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up WebSocket connection
    const ws = apiService.setupWebSocket((data) => {
      if (data.type === 'update') {
        setStreamingData(data.data);
      }
    });

    setWebsocket(ws);

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Fetch streaming status
      const streamData = await apiService.getStreamingStatus();
      setStreamingData(streamData);
      
      // Fetch dashboard stats
      const userId = localStorage.getItem('user_id') || undefined;
      const clientId = localStorage.getItem('client_id') || undefined;
      const stats = await apiService.getDashboardStats(userId, clientId);
      setDashboardStats(stats || null);
      
      setError(null);
    } catch (err) {
      setError('Failed to refresh dashboard data');
      console.error('Dashboard refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStreamingControl = async (action: 'start' | 'stop' | 'pause') => {
    try {
      await apiService.toggleStreaming(action);
      const newStatus = await apiService.getStreamingStatus();
      setStreamingData(newStatus);
      setError(null);
    } catch (err) {
      setError(`Failed to ${action} streaming`);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'online':
      case 'healthy':
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'paused':
      case 'queued':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'stopped':
      case 'error':
      case 'failed':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'running':
      case 'connected':
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getActionStatusColor = (status: string): string => {
    return getStatusColor(status);
  };

  return (
    <div className="min-h-screen lg:ml-60 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.8))] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div></div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg backdrop-blur-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
              <div className="ml-2">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-md p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats?.total_tasks.value || '-'}</p>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {dashboardStats?.total_tasks.change || '-'}
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-md p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats?.success_rate.value || '-'}</p>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {dashboardStats?.success_rate.change || '-'}
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-md p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats?.response_time.value || '-'}</p>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                  <Zap className="w-3 h-3" />
                  {dashboardStats?.response_time.optimized ? 'Optimized' : 'Normal'}
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-md p-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats?.active_users.value || '-'}</p>
                <p className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1">
                  <Globe className="w-3 h-3" />
                  Currently online
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Streaming Status - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <Server className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Streaming Operations</h2>
                    <p className="text-xs text-gray-600">Real-time cargo processing status</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              {streamingData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(streamingData.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          streamingData.status === 'active' ? 'bg-green-500 animate-pulse' :
                          streamingData.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        {streamingData.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStreamingControl('start')}
                        disabled={streamingData.status === 'active'}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                        title="Start Streaming"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStreamingControl('pause')}
                        disabled={streamingData.status === 'paused'}
                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                        title="Pause Streaming"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStreamingControl('stop')}
                        disabled={streamingData.status === 'stopped'}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-600"
                        title="Stop Streaming"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-700">
                        Current Task: {dashboardStats?.current_task?.name || streamingData.currentTask}
                      </p>
                      <span className="text-xs text-gray-600 font-medium">
                        {Math.round(streamingData.progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${streamingData.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-md p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">System Health</h3>
                <p className="text-xs text-gray-600">Infrastructure status</p>
              </div>
            </div>
            
            {dashboardStats?.system_health && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-800">API Server</span>
                  </div>
                  <span className="text-xs text-green-600 font-semibold">{dashboardStats.system_health.api_server.status}</span>
                </div>
                
                <div className={`flex items-center justify-between p-2.5 ${
                  dashboardStats.system_health.database.status === 'HEALTHY' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                } rounded-lg border`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 ${
                      dashboardStats.system_health.database.status === 'HEALTHY'
                        ? 'bg-green-500 animate-pulse'
                        : 'bg-red-500'
                    } rounded-full`}></div>
                    <span className={`text-xs font-medium ${
                      dashboardStats.system_health.database.status === 'HEALTHY'
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}>Database</span>
                  </div>
                  <span className={`text-xs font-semibold ${
                    dashboardStats.system_health.database.status === 'HEALTHY'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>{dashboardStats.system_health.database.status}</span>
                </div>
                
                <div className="flex items-center justify-between p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-blue-800">WebSocket</span>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold">{dashboardStats.system_health.websocket.status}</span>
                </div>
                
                <div className="flex items-center justify-between p-2.5 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs font-medium text-yellow-800">Cache</span>
                  </div>
                  <span className="text-xs text-yellow-600 font-semibold">{dashboardStats.system_health.cache.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-xs text-gray-600">Latest system operations and events</p>
              </div>
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View All →
            </button>
          </div>
          
          {dashboardStats?.recent_activity && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {dashboardStats.recent_activity.map((action, index) => (
                <div
                  key={action.id || index}
                  className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="text-xs font-semibold text-gray-900 truncate pr-2">
                      {action.name}
                    </h4>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getActionStatusColor(action.status)}`}>
                      {action.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(action.completed_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* Fallback to streaming data if dashboard stats aren't available */}
          {!dashboardStats?.recent_activity && streamingData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {streamingData.recentActions.map((action, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="text-xs font-semibold text-gray-900 truncate pr-2">
                      {action.action}
                    </h4>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getActionStatusColor(action.status)}`}>
                      {action.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(action.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}