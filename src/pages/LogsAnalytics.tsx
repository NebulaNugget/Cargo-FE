import { useState, useEffect } from 'react';
import {
  RefreshCw,
  Info,
  Filter,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Settings,
  Download,
  Search,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertCircle,
  Database,
  Server
} from 'lucide-react';

import type { Log } from '../services/apiService';
import { apiService } from '../services/apiService';

const LOG_LEVELS = ['INFO', 'WARNING', 'ERROR'] as const;
type LogLevel = typeof LOG_LEVELS[number];

export default function LogsAnalytics() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<LogLevel | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: { level?: LogLevel; startDate?: string; endDate?: string } = {};
      if (levelFilter) filters.level = levelFilter;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      const data = await apiService.getLogs(filters);
      setLogs(data);
    } catch (err) {
      setError('Failed to fetch logs. Please check your connection and try again.');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleClearFilters = () => {
    setLevelFilter('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getLogLevelColor = (level: LogLevel): string => {
    switch (level) {
      case 'INFO':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'WARNING':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'ERROR':
        return 'bg-red-50 text-red-700 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getLogLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'INFO':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'ERROR':
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Info className="w-3.5 h-3.5" />;
    }
  };

  const getLogStats = () => {
    const total = logs.length;
    const byLevel = logs.reduce((acc: Record<LogLevel, number>, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);

    return {
      total,
      byLevel,
      errorRate: total > 0 ? ((byLevel['ERROR'] || 0) / total) * 100 : 0,
      warningRate: total > 0 ? ((byLevel['WARNING'] || 0) / total) * 100 : 0,
    };
  };

  const filteredLogs = logs.filter(log => 
    searchTerm === '' || 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = getLogStats();

  return (
    <div className="min-h-screen lg:ml-60 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.8))] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Logs & Analytics
              </h1>
              <p className="text-sm text-gray-600">Monitor system events and performance metrics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-white hover:shadow-sm transition-all duration-200">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 hover:shadow-md transition-all duration-200 disabled:opacity-50 text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg p-4 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3" />
                  System events
                </p>
              </div>
              <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Database className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg p-4 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.errorRate.toFixed(1)}%</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                    style={{ width: `${Math.min(stats.errorRate, 100)}%` }}
                  />
                </div>
              </div>
              <div className="p-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <XCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg p-4 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Warnings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byLevel['WARNING'] || 0}</p>
                <p className="text-xs text-yellow-600 font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  {stats.warningRate.toFixed(1)}% of total
                </p>
              </div>
              <div className="p-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg p-4 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{(100 - stats.errorRate).toFixed(1)}%</p>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  System health
                </p>
              </div>
              <div className="p-2.5 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-gradient-to-r from-gray-500 to-gray-600 rounded-md">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Filter & Search</h3>
              <p className="text-xs text-gray-600">Customize your log view</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Search className="w-3 h-3 inline mr-1" />
                Search Logs
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search messages, sources..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <BarChart3 className="w-3 h-3 inline mr-1" />
                Log Level
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as LogLevel)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">All Levels</option>
                {LOG_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/90 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            <div className="flex flex-col justify-end gap-2">
              <button
                onClick={handleApplyFilters}
                className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg transition-all duration-200 text-xs font-medium"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-xs font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-md">
                <Server className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">System Logs</h3>
                <p className="text-xs text-gray-600">
                  Showing {filteredLogs.length} of {logs.length} logs
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <Activity className="w-3 h-3 inline mr-1" />
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <FileText className="w-3 h-3 inline mr-1" />
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <Server className="w-3 h-3 inline mr-1" />
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/90 divide-y divide-gray-200/50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mb-3" />
                        <p className="text-gray-500 font-medium text-sm">Loading system logs...</p>
                        <p className="text-xs text-gray-400 mt-1">Please wait while we fetch the latest data</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-300 mb-3" />
                        <p className="text-sm font-medium text-gray-500 mb-1">No logs found</p>
                        <p className="text-xs text-gray-400">
                          {logs.length === 0 
                            ? "No logs available for the selected period" 
                            : "No logs match your current search criteria"
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 font-medium">
                        {new Date(log.timestamp).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getLogLevelColor(log.level)}`}>
                          {getLogLevelIcon(log.level)}
                          {log.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 max-w-md">
                        <div className="line-clamp-2 leading-relaxed">
                          {log.message}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                          <Server className="w-3 h-3" />
                          {log.source}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}