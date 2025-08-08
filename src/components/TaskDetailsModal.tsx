import { X, CheckCircle, XCircle, Clock, Play, Terminal, AlertCircle ,Eye, ChevronLeft, ChevronRight, Download} from 'lucide-react';
import { Task } from '../stores/taskStore';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { apiService, Screenshot } from '../services/apiService';
interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailsModal({ task, isOpen, onClose }: TaskDetailsModalProps) {
  const [showScreenshots, setShowScreenshots] = useState(false);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [loadingScreenshots, setLoadingScreenshots] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  if (!isOpen || !task) return null;
  // Handle View Stream button click
  const handleViewStream = async () => {
    if (!task) return;
    
    setLoadingScreenshots(true);
    setScreenshotError(null);
    
    try {
      const response = await apiService.getTaskScreenshots(task.id);
      setScreenshots(response.screenshots);
      setCurrentScreenshotIndex(0);
      setShowScreenshots(true);
    } catch (error) {
      console.error('Error fetching screenshots:', error);
      setScreenshotError('Failed to load screenshots. Please try again.');
    } finally {
      setLoadingScreenshots(false);
    }
  };

  // Navigate to previous screenshot
  const goToPrevious = () => {
    setCurrentScreenshotIndex((prev) => 
      prev > 0 ? prev - 1 : screenshots.length - 1
    );
  };

  // Navigate to next screenshot
  const goToNext = () => {
    setCurrentScreenshotIndex((prev) => 
      prev < screenshots.length - 1 ? prev + 1 : 0
    );
  };

  // Download current screenshot
  const downloadScreenshot = () => {
    if (screenshots[currentScreenshotIndex]) {
      const screenshot = screenshots[currentScreenshotIndex];
      const url = apiService.getScreenshotUrl(task.id, screenshot.filename);
      const link = document.createElement('a');
      link.href = url;
      link.download = screenshot.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Close screenshot viewer
  const closeScreenshots = () => {
    setShowScreenshots(false);
    setScreenshots([]);
    setCurrentScreenshotIndex(0);
    setScreenshotError(null);
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
        return <Clock className="w-4 h-4 mr-1" />;
      case 'RUNNING':
        return <Play className="w-4 h-4 mr-1" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 mr-1" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };
// If showing screenshots, render the screenshot viewer
if (showScreenshots) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Screenshot Viewer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Task Screenshots</h2>
            {screenshots.length > 0 && (
              <span className="text-sm text-gray-500">
                {currentScreenshotIndex + 1} of {screenshots.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {screenshots.length > 0 && (
              <button
                onClick={downloadScreenshot}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download Screenshot"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={closeScreenshots}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Screenshot Content */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 relative">
          {screenshots.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No screenshots available for this task</p>
            </div>
          ) : (
            <>
              {/* Navigation Buttons */}
              {screenshots.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}
              
              {/* Screenshot Image */}
              <div className="max-w-full max-h-full p-4">
                <img
                  src={apiService.getScreenshotUrl(task.id, screenshots[currentScreenshotIndex].filename)}
                  alt={`Screenshot ${currentScreenshotIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    console.error('Failed to load screenshot:', e);
                  }}
                />
              </div>
            </>
          )}
        </div>
        
        {/* Screenshot Info Footer */}
        {screenshots.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                <span className="font-medium">{screenshots[currentScreenshotIndex].filename}</span>
                <span className="ml-2">({(screenshots[currentScreenshotIndex].size_bytes / 1024).toFixed(1)} KB)</span>
              </div>
              <div>
                {format(parseISO(screenshots[currentScreenshotIndex].created_at), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Task Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-md ${getStatusBadgeColor(task.current_state.status)}`}>
              {getStatusIcon(task.current_state.status)}
              {task.current_state.status}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-100">
              <Terminal className="w-4 h-4 mr-1" />
              {task.workflow_type || 'Unknown'}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {task.query || 'No query'}
          </h3>
          
          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
            <span>Created: {formatDate(task.created_at)}</span>
            <span>•</span>
            <span>Updated: {formatDate(task.current_state.updated_at)}</span>
            {task.completed_at && (
              <>
                <span>•</span>
                <span>Completed: {formatDate(task.completed_at)}</span>
              </>
            )}
          </div>
        </div>
          {/* Error Display for Screenshots */}
          {screenshotError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                <div className="ml-2">
                  <p className="text-sm text-red-700">{screenshotError}</p>
                </div>
              </div>
            </div>
          )}
          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              {/* Intent & Confidence */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Intent Information</h4>
                
                <div className="space-y-2">
                  {task.context?.intent && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Intent:</span>
                      <span className="text-sm font-medium text-gray-900">{task.context.intent}</span>
                    </div>
                  )}
                  
                  {task.context?.confidence && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {(task.context.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  
                  {task.context?.marc1_intent && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">MARC1 Intent:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {task.context.marc1_intent.intent_name}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">MARC1 Confidence:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {(task.context.marc1_intent.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Parameters */}
              {task.parameters && Object.keys(task.parameters).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Parameters</h4>
                  
                  <div className="space-y-2">
                    {Object.entries(task.parameters).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-600">{key}:</span>
                        <span className="text-sm font-medium text-gray-900 max-w-[60%] truncate">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tools */}
              {task.tools && task.tools.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Tools</h4>
                  
                  <div className="space-y-3">
                    {task.tools.map((tool, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-3 bg-white">
                        <div className="font-medium text-sm text-gray-900 mb-1">{tool.name}</div>
                        <div className="text-xs text-gray-500 mb-2">{tool.description}</div>
                        
                        {Object.keys(tool.parameters).length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">Parameters:</div>
                            <div className="space-y-1">
                              {Object.entries(tool.parameters).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-xs">
                                  <span className="text-gray-600">{key}:</span>
                                  <span className="text-gray-900 max-w-[60%] truncate">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column */}
            <div>
              {/* Current State */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Current State</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Step Index:</span>
                    <span className="text-sm font-medium text-gray-900">{task.current_state.step_index}</span>
                  </div>
                  
                  {task.current_state.current_tool && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Tool:</span>
                      <span className="text-sm font-medium text-gray-900">{task.current_state.current_tool}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Requires Approval:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {task.current_state.requires_approval ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Outputs */}
              {task.current_state.outputs && Object.keys(task.current_state.outputs).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Outputs</h4>
                  
                  <div className="space-y-2">
                    {Object.entries(task.current_state.outputs).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-600">{key}:</span>
                        <span className="text-sm font-medium text-gray-900 max-w-[60%] truncate">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/*rejection info*/}
              {task.current_state.metadata.rejection_reason &&(
                <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-100">
                   <h4 className="text-sm font-medium text-gray-700 mb-3">Rejection State</h4>
                  <div className="space-y-2">
                   <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rejection Reason:</span>
                    <span className="text-sm font-medium text-gray-900 max-w-[60%] truncate">
                      {task.current_state.metadata.rejection_reason}
                    </span>
                   </div>
                   <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rejection Date:</span>
                    <span className="text-sm font-medium text-gray-900 max-w-[60%] truncate">
                      {formatDate(task.current_state.metadata.rejected_at)}
                    </span>
                   </div>
                   
                    
                    
                  </div>
                  
                </div>
              ) }
              {/* Error */}
              {task.current_state.error && (
                <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-1">Error</h4>
                      <p className="text-sm text-red-600">{task.current_state.error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Metadata */}
              {task.metadata && Object.keys(task.metadata).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Metadata</h4>
                  
                  <div className="space-y-2">
                    {Object.entries(task.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-600">{key}:</span>
                        <span className="text-sm font-medium text-gray-900 max-w-[60%] truncate">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button
            onClick={handleViewStream}
            disabled={loadingScreenshots}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Eye className={`w-4 h-4 ${loadingScreenshots ? 'animate-pulse' : ''}`} />
            {loadingScreenshots ? 'Loading...' : 'View Stream'}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}