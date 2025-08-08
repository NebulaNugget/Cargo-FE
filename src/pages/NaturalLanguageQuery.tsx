import { useRef, useEffect,useState } from 'react';
import {
  Send,
  MessageSquare,
  AlertCircle,
  Loader2,
  Clock,
  TrendingUp,
  Zap,
  Brain,
  RefreshCw,
  Settings,
  Sparkles,
  Activity,
  X,
  FileText,
  Pause,
  
  Play,
  Edit,
  ThumbsDown,
  Check,
  Monitor,
  Eye
} from 'lucide-react';
import { apiService } from '../services/apiService';
import type { Message } from '../types'; // Assuming you've moved the interfaces to a types file
import { useQueryStore } from '../stores/queryStore';
import { ScreenshotViewer } from '../components/ScreenshotViewer';

// Add a TaskControlModal component
const TaskControlModal = ({ 
  mode, 
  taskId, 
  onClose, 
  onSubmit, 
  taskData 
}: { 
  mode: 'edit' | 'reject', 
  taskId: string, 
  onClose: () => void, 
  onSubmit: (data: any) => void,
  taskData?: any
}) => {
  console.log("control modal", taskData)
  const [reason, setReason] = useState('');
  // Initialize with empty object if no parameters exist
  const initialParameters = (mode === 'edit' && taskData?.parameters) 
    ? {...taskData.parameters} 
    : {};
  const [parameters, setParameters] = useState<Record<string, any>>(initialParameters);
  
  // Initialize parameters from task data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && taskData?.parameters) {
       console.log("Updating parameters from task data:", taskData.parameters);
     setParameters(prevParams => {
        // Only update if the parameters are different
        const paramsChanged = JSON.stringify(prevParams) !== JSON.stringify(taskData.parameters);
        return paramsChanged ? {...taskData.parameters} : prevParams;
      });
    }
  }, [mode]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'reject') {
      onSubmit({ reason });
    } else {
      onSubmit({ parameters });
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {mode === 'edit' ? 'Edit Task Parameters' : 'Reject Task'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {mode === 'reject' ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="Please provide a reason for rejecting this task..."
                required
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Parameters
              </label>
              <div className="space-y-3">
                {Object.entries(parameters).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={String(value)}
                      onChange={(e) => setParameters({
                        ...parameters,
                        [key]: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                mode === 'edit' 
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {mode === 'edit' ? 'Save Changes' : 'Reject Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default function NaturalLanguageQuery() {
  // Use the query store instead of local state
 const {
    messages,
    input,
    isLoading,
    copiedMessageId,
    pendingTasks,
    activeLogTaskId,
    showLogsModal,
    taskLogs,
    showTaskControlModal,
    activeControlTaskId,
    taskControlMode,
  
    setInput,
    executeQuery,
    copyToClipboard,
    openLogsModal,
    closeLogsModal,
    openTaskControlModal,
    closeTaskControlModal,
    pauseTask,
    resumeTask,
    rejectTask,
    editTask,
   approveTask,
    cancelTask

  } = useQueryStore();

  // State for screenshot viewer
  const [showScreenshotViewer, setShowScreenshotViewer] = useState(false);
  const [screenshotTaskId, setScreenshotTaskId] = useState<string | null>(null);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add effect to scroll logs to bottom when they update
  useEffect(() => {
    if (showLogsModal) {
      // logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [taskLogs, showLogsModal]);
 useEffect(() => {
    // Debug log to check messages and task data
    console.log('Messages updated:', messages);
    messages.forEach(msg => {
      if (msg.taskData) {
        console.log(`Message ${msg.id} has task data:`, msg.taskData);
        console.log(`Task status: ${msg.taskData.current_state?.status}`);
        console.log(`Requires approval: ${msg.taskData.current_state?.requires_approval}`);
      }
    });
  }, [messages]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
// Add new handleCancelTask function
const handleCancelTask = async (taskId: string) => {
  try {
    console.log('Cancelling task:', taskId);
    await cancelTask(taskId);
  } catch (error) {
    console.error('Failed to cancel task:', error);
  }
};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Use the executeQuery method from the store
    executeQuery(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLatencyColor = (latency: number): string => {
    if (latency <= 500) return 'text-green-600';
    if (latency <= 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

 
  // Handle task control actions
  const handlePauseTask = async (taskId: string) => {
    try {
         console.log('Pausing task:', taskId);
      await pauseTask(taskId);
    } catch (error) {
      console.error('Failed to pause task:', error);
    }
  };

  const handleResumeTask = async (taskId: string) => {
    try {
       console.log('Resuming task:', taskId);
      await resumeTask(taskId);
    } catch (error) {
      console.error('Failed to resume task:', error);
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      console.log('Approving task:', taskId);
      await approveTask(taskId);
    } catch (error) {
      console.error('Failed to approve task:', error);
    }
  };

  const handleRejectSubmit = async (data: { reason: string }) => {
    if (!activeControlTaskId) return;
    
    try {
      await rejectTask(activeControlTaskId, data.reason);
    } catch (error) {
      console.error('Failed to reject task:', error);
    }
  };

  const handleEditSubmit = async (data: { parameters: Record<string, any> }) => {
    if (!activeControlTaskId) return;
    
    try {
      await editTask(activeControlTaskId, data.parameters);
    } catch (error) {
      console.error('Failed to edit task:', error);
    }
  };

  // Get the active task data for the control modal
  const getActiveTaskData = () => {
    if (!activeControlTaskId) return null;
    
  
     console.log('Getting task data for:', activeControlTaskId);
    console.log('Available messages:', messages.length);
    
    const taskMessage = messages.find(msg => 
      msg.taskId === activeControlTaskId || 
      (msg.taskData && msg.taskData.id === activeControlTaskId)
    );
    
    console.log('Found message with task data:', taskMessage);
    // Make sure we're returning the full task data with parameters
    if (taskMessage?.taskData) {
      console.log('Task parameters:', taskMessage.taskData.current_state.parameters);
      return taskMessage.taskData;}
      // If we can't find the task data in messages, try to find it in AI responses
    const aiMessage = messages.find(msg => 
      msg.sender === 'ai' && 
      msg.taskData && 
      msg.taskData.id === activeControlTaskId
    );
    
    if (aiMessage?.taskData) {
      console.log('Found task data in AI message:', aiMessage.taskData.current_state.parameters);
      return aiMessage.taskData;
    }
      return null
  };

  // Render task control buttons based on task status
  const renderTaskControls = (message: Message) => {
    console.log('Rendering task controls for message:', message.id);
     if (!message.taskData) {
      console.log('No task data for message:', message.id);
      return null;
    }
    
    const taskId = message.taskData.id;
    const status = message.taskData.current_state.status;
    const requiresApproval = message.taskData.current_state.requires_approval;
//  console.log('Task controls for:', taskId, 'Status:', status, 'Requires approval:', requiresApproval);
//     console.log('Full task data:', JSON.stringify(message.taskData, null, 2));
     // Don't show controls for completed or failed tasks
  if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELED') {
    return null;
  }
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {/* cancel button - show when task is running */}
        {status === 'RUNNING' && (
          <button
            onClick={() => handleCancelTask(taskId)}
            className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-800 px-2 py-1 bg-yellow-50 rounded-md transition-colors"
          >
            <X className="w-3 h-3" />
            Cancel
          </button>
        )}
        
        {/* Resume button - show when task is paused and doesn't require approval */}
        {status === 'PAUSED' && !requiresApproval && (
          <button
            onClick={() => handleResumeTask(taskId)}
            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded-md transition-colors"
          >
            <Play className="w-3 h-3" />
            Resume
          </button>
        )}
        
        {/* Approve button - show when task requires approval */}
        {status === 'PAUSED' && requiresApproval && (
          <button
            onClick={() => handleApproveTask(taskId)}
            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded-md transition-colors"
          >
            <Check className="w-3 h-3" />
            Approve
          </button>
        )}
        
        {/* Edit button - show when task is paused */}
        {status === 'PAUSED' && (
          <button
            onClick={() => openTaskControlModal(taskId, 'edit')}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded-md transition-colors"
          >
            <Edit className="w-3 h-3" />
            Edit
          </button>
        )}
        
        {/* Reject button - show when task is paused */}
        {status === 'PAUSED' && (
          <button
            onClick={() => openTaskControlModal(taskId, 'reject')}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 px-2 py-1 bg-red-50 rounded-md transition-colors"
          >
            <ThumbsDown className="w-3 h-3" />
            Reject
          </button>
        )}
      </div>
    );
  };

  const renderMessage = (message: Message) => (
    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg p-4 ${
        message.sender === 'user' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
      {message.isProcessing && message.sender === 'ai' ? (
        <div>
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{message.text}</span>
          </div>
          {/* Add View Logs button for processing messages */}
          {message.taskData?.id && (
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => message.taskData?.id && openLogsModal(message.taskData.id)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded-md transition-colors"
              >
                <FileText className="w-3 h-3" />
                View Logs
              </button>
              {/* Screenshots button - show for all active tasks */}
              {message.taskData.current_state?.status && 
                   !['COMPLETED', 'FAILED', 'CANCELED'].includes(message.taskData.current_state.status) && (
                    <button
                      onClick={() => {
                        console.log('Opening screenshot viewer for task:', message.taskData!.id, 'Status:', message.taskData!.current_state?.status);
                        setScreenshotTaskId(message.taskData!.id);
                        setShowScreenshotViewer(true);
                      }}
                      className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 px-2 py-1 bg-purple-50 rounded-md transition-colors"
                    >
                      <Monitor className="w-3 h-3" />
                      Screenshots
                    </button>
                  )}
              {/* Add pause button for running tasks */}
              {message.taskData.current_state?.status === 'RUNNING' && (
                <button
                  onClick={() => message.taskData?.id && handleCancelTask(message.taskData.id)}
                  className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-800 px-2 py-1 bg-yellow-50 rounded-md transition-colors"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="whitespace-pre-wrap">{message.text}</div>
         
          {/* Display additional task information for AI responses */}
          {message.sender === 'ai' && message.taskData && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {message.response && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {message.response.intent && (
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Intent:</span> 
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">{message.response.intent}</span>
                    </div>
                  )}
                  
                  {message.response?.confidence && (
                    <div>
                      <span className="font-medium text-gray-700">Confidence:</span> 
                      <span className={`ml-1 ${getConfidenceColor(message.response.confidence)}`}>
                        {Math.round(message.response.confidence * 100)}%
                      </span>
                    </div>
                  )}
                  
                  {message.taskData.current_state?.status && (
                    <div>
                      <span className="font-medium text-gray-700">Status:</span> 
                      <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                        message.taskData.current_state.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800' 
                          : message.taskData.current_state.status === 'RUNNING'
                          ? 'bg-blue-100 text-blue-800'
                          : message.taskData.current_state.status === 'PAUSED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : message.taskData.current_state.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.taskData.current_state.status}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Add task control buttons */}
              {renderTaskControls(message)}
              
              {/* Add View Logs button */}
              {message.taskData?.id && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => message.taskData?.id && openLogsModal(message.taskData.id)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded-md transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    View Execution Logs
                  </button>
                  
                  {/* Screenshots button - show for all active tasks */}
                  {message.taskData.current_state?.status && 
                   !['COMPLETED', 'FAILED', 'CANCELED'].includes(message.taskData.current_state.status) && (
                    <button
                      onClick={() => {
                        console.log('Opening screenshot viewer for task:', message.taskData!.id, 'Status:', message.taskData!.current_state?.status);
                        setScreenshotTaskId(message.taskData!.id);
                        setShowScreenshotViewer(true);
                      }}
                      className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 px-2 py-1 bg-purple-50 rounded-md transition-colors"
                    >
                      <Monitor className="w-3 h-3" />
                      Screenshots
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Display error if present */}
          {message.error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
              <div className="flex items-start">
                <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>{message.error}</span>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
      
      


 
  return (
    <div className="min-h-screen lg:ml-60 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.8))] -z-10"></div>
     {/* Task Control Modal */}
      {showTaskControlModal && activeControlTaskId && taskControlMode && (
        <TaskControlModal
          mode={taskControlMode}
          taskId={activeControlTaskId}
          onClose={closeTaskControlModal}
          onSubmit={taskControlMode === 'edit' ? handleEditSubmit : handleRejectSubmit}
          taskData={getActiveTaskData()}
        />
      )}
      
      {/* Screenshot Viewer Modal */}
      {showScreenshotViewer && screenshotTaskId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-medium">Live Screenshots</h3>
                <span className="text-sm text-gray-500">Task: {screenshotTaskId}</span>
              </div>
              <button 
                onClick={() => {
                  setShowScreenshotViewer(false);
                  setScreenshotTaskId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ScreenshotViewer
                taskId={screenshotTaskId}
                autoConnect={true}
                maxScreenshots={15}
                className="h-full"
              />
            </div>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-screen flex flex-col">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Total Queries</p>
                <p className="text-lg font-semibold text-gray-900">{messages.filter(m => m.sender === 'user').length}</p>
                <p className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1.5">
                  <MessageSquare className="w-3 h-3" />
                  Active session
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Avg Response</p>
                <p className="text-lg font-semibold text-gray-900">
                  {messages.filter(m => m.response).length > 0 
                    ? Math.round(messages.filter(m => m.response).reduce((acc, m) => acc + (m.response?.latency || 0), 0) / messages.filter(m => m.response).length)
                    : 0}ms
                </p>
                <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1.5">
                  <Zap className="w-3 h-3" />
                  Optimized
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Avg Confidence</p>
                <p className="text-lg font-semibold text-gray-900">
                  {messages.filter(m => m.response).length > 0 
                    ? Math.round(messages.filter(m => m.response).reduce((acc, m) => acc + ((m.response?.confidence || 0) * 100), 0) / messages.filter(m => m.response).length)
                    : 0}%
                </p>
                <p className="text-xs text-purple-600 font-medium flex items-center gap-1 mt-1.5">
                  <TrendingUp className="w-3 h-3" />
                  AI Powered
                </p>
              </div>
              <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                <Brain className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm p-4 mb-4 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to AI Assistant</h3>
                <p className="text-center text-sm text-gray-600 max-w-md leading-relaxed mb-4">
                  Ask me anything about your logistics operations. I can help with shipment tracking, 
                  inventory management, route optimization, and more.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  <button 
                    onClick={() => setInput("What's the status of my recent shipments?")}
                    className="p-2.5 text-left bg-gray-50/80 hover:bg-gray-100/80 rounded-lg text-xs text-gray-700 transition-all duration-200 border border-gray-200/50"
                  >
                    Check shipment status
                  </button>
                  <button 
                    onClick={() => setInput("Show me inventory levels")}
                    className="p-2.5 text-left bg-gray-50/80 hover:bg-gray-100/80 rounded-lg text-xs text-gray-700 transition-all duration-200 border border-gray-200/50"
                  >
                    View inventory levels
                  </button>
                </div>
              </div>
            ) : (
              // Use the renderMessage function to render each message
              messages.map(renderMessage)
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm p-4">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about shipments, inventory, routes, or any logistics question..."
                className="w-full p-1 pr-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none bg-white/90 backdrop-blur-sm transition-all duration-200 text-sm"
                rows={2}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {isLoading && (
                <div className="flex items-center gap-1.5 text-purple-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="font-medium">Processing...</span>
                </div>
              )}
            </div>
          </form>
        </div>
        
        {/* Logs Modal */}
        {showLogsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Task Execution Details</h3>
                  <p className="text-xs text-gray-500">
                    {activeLogTaskId ? `Task ID: ${activeLogTaskId}` : ''}
                  </p>
                </div>
                <button 
                  onClick={closeLogsModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {taskLogs.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Loading task details...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Group logs by categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Basic Info Card */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Activity className="w-3.5 h-3.5 mr-1.5" />
                          Task Status
                        </h4>
                        <div className="space-y-1.5">
                          {taskLogs
                            .filter(log => 
                              log.message.includes('Status:') || 
                              log.message.includes('Created at:') || 
                              log.message.includes('Last updated:') ||
                              log.message.includes('Completed at:')
                            )
                            .map((log, index) => (
                              <div 
                                key={`status-${index}`} 
                                className={`p-1.5 rounded-md text-xs ${
                                  log.level === 'error' ? 'bg-red-50 text-red-800 border border-red-100' :
                                  log.level === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-100' :
                                  log.level === 'success' ? 'bg-green-50 text-green-800 border border-green-100' :
                                  'bg-white text-gray-800 border border-gray-100'
                                }`}
                              >
                                <div className="flex items-start">
                                  <span>{log.message}</span>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                      
                      {/* Intent Info Card */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Brain className="w-3.5 h-3.5 mr-1.5" />
                          Intent Information
                        </h4>
                        <div className="space-y-1.5">
                          {taskLogs
                            .filter(log => 
                              log.message.includes('Intent:') || 
                              log.message.includes('Confidence:') ||
                              log.message.includes('MARC1 Intent:') ||
                              log.message.includes('MARC1 Confidence:')
                            )
                            .map((log, index) => (
                              <div 
                                key={`intent-${index}`} 
                                className={`p-1.5 rounded-md text-xs ${
                                  log.level === 'error' ? 'bg-red-50 text-red-800 border border-red-100' :
                                  log.level === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-100' :
                                  log.level === 'success' ? 'bg-green-50 text-green-800 border border-green-100' :
                                  'bg-white text-gray-800 border border-gray-100'
                                }`}
                              >
                                <div className="flex items-start">
                                  <span>{log.message}</span>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                    
                                   {/* Parameters Section */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    Parameters & Inputs
                  </h4>
                  <div className="space-y-1.5">
                    {taskLogs
                      .filter(log => 
                        log.message.includes('Parameters:') || 
                        log.message.includes('MARC1 Parameters:') ||
                        (log.message.includes('  - ') && (
                          !log.message.includes('Tool ') && 
                          !log.message.includes('Execution') &&
                          !log.message.includes('Outputs:')
                        )) ||
                        log.message.includes('Original query:') ||
                        log.message.includes('Progress:') ||
                        log.message.includes('Last Update:')
                      )
                      .map((log, index) => (
                        <div 
                          key={`param-${index}`} 
                          className={`p-1.5 rounded-md text-xs ${
                            log.message.includes('Parameters:') || log.message.includes('MARC1 Parameters:') 
                              ? 'bg-blue-50 text-blue-800 border border-blue-100 font-medium' :
                            'bg-white text-gray-800 border border-gray-100'
                          }`}
                        >
                          <div className="flex items-start">
                            <span>{log.message}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                {/* Tools Section */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Tools & Execution
                  </h4>
                  <div className="space-y-1.5">
                    {taskLogs
                      .filter(log => 
                        log.message.includes('Tool ') || 
                        log.message.includes('Available Tools') ||
                        log.message.includes('Current Tool:') ||
                        log.message.includes('Current Step:') ||
                        log.message.includes('Execution') ||
                        log.message.includes('Description:') ||
                        log.message.includes('Progress:')
                      )
                      .map((log, index) => (
                        <div 
                          key={`tool-${index}`} 
                          className={`p-1.5 rounded-md text-xs ${
                            log.message.includes('Available Tools') || log.message.includes('Execution Metadata:') 
                              ? 'bg-purple-50 text-purple-800 border border-purple-100 font-medium' :
                            'bg-white text-gray-800 border border-gray-100'
                          }`}
                        >
                          <div className="flex items-start">
                            <span>{log.message}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                    
                    {/* Outputs Section */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                        Outputs & Results
                      </h4>
                      <div className="space-y-1.5">
                        {taskLogs
                          .filter(log => 
                            log.message.includes('Outputs:') || 
                            (log.message.includes('  - ') && log.message.includes('Outputs:')) ||
                            log.message.includes('Task completed') ||
                            log.message.includes('Task failed') ||
                            log.message.includes('Task is still')
                          )
                          .map((log, index) => (
                            <div 
                              key={`output-${index}`} 
                              className={`p-1.5 rounded-md text-xs ${
                                log.level === 'error' ? 'bg-red-50 text-red-800 border border-red-100' :
                                log.level === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-100' :
                                log.level === 'success' ? 'bg-green-50 text-green-800 border border-green-100' :
                                log.message.includes('Outputs:') ? 'bg-green-50 text-green-800 border border-green-100 font-medium' :
                                'bg-white text-gray-800 border border-gray-100'
                              }`}
                            >
                              <div className="flex items-start">
                                <span>{log.message}</span>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    
                    {/* Errors Section - Only show if there are errors */}
                    {taskLogs.some(log => log.level === 'error') && (
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                          <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                          Errors
                        </h4>
                        <div className="space-y-1.5">
                          {taskLogs
                            .filter(log => log.level === 'error')
                            .map((log, index) => (
                              <div 
                                key={`error-${index}`} 
                                className="p-1.5 rounded-md text-xs bg-white text-red-800 border border-red-100"
                              >
                                <div className="flex items-start">
                                  <span>{log.message}</span>
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div ref={logsEndRef} />
              </div>
              
              <div className="border-t p-4 flex justify-between items-center bg-gray-50 rounded-b-lg">
                <div className="flex items-center text-xs text-gray-500">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  <span>Auto-refreshing every 3 seconds</span>
                </div>
                <button
                  onClick={closeLogsModal}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
       
    </div>
  );
}