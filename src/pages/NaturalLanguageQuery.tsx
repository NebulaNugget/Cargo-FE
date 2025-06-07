import { useState, useRef, useEffect } from 'react';
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
  Copy,
  Check,
  Sparkles,
  Activity,
  X,
  FileText
} from 'lucide-react';
import type { QueryResponse, TaskResult } from '../services/apiService';
import { apiService } from '../services/apiService';
// Add a new interface for task logs
interface TaskLog {
  timestamp: Date;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
  data?: Record<string, any>;
}
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isProcessing?: boolean;
  error?: string|null;
  taskData?: TaskResult;
  status?: string;
  taskId?: string; // Store task ID for user messages
  taskStatus?: string; // Store task status for user messages
  relatedUserMessageId?: string; // For AI messages to reference user messages
  response?: {
    confidence: number;
    latency: number;
    intent?: string;
    parameters?: Record<string, any>;
    outputs?: Record<string, any>;
  };
}

// Add a new interface for task tracking
interface PendingTask {
 taskId: string;
  messageId: string;
    userMessageId?: string; // Add this field
    pollingInterval?: ReturnType<typeof setInterval>;
    logPollingInterval?: ReturnType<typeof setInterval>;
}

export default function NaturalLanguageQuery() {
 const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null)
    const [activeLogTaskId, setActiveLogTaskId] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
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
  // Function to fetch task logs
const fetchTaskLogs = async (taskId: string) => {
  try {
    // Fetch the task result
    const result = await apiService.getTaskResult(taskId);
    console.log(result.current_state.status)
    // Generate comprehensive logs based on the task state
    const newLogs: TaskLog[] = [];
    
    // Basic task information
    newLogs.push({
      timestamp: new Date(),
      message: `Task ID: ${result.id}`,
      level: 'info',
      data: { id: result.id }
    });
    
    newLogs.push({
      timestamp: new Date(),
      message: `Status: ${result.current_state.status}`,
      level: result.current_state.status === 'COMPLETED' ? 'success' : 
             result.current_state.status === 'FAILED' ? 'error' : 'info',
      data: { status: result.current_state.status }
    });
    
    // Client and user information
    if (result.client_id) {
      newLogs.push({
        timestamp: new Date(),
        message: `Client ID: ${result.client_id}`,
        level: 'info',
        data: { client_id: result.client_id }
      });
    }
    
    if (result.user_id) {
      newLogs.push({
        timestamp: new Date(),
        message: `User ID: ${result.user_id}`,
        level: 'info',
        data: { user_id: result.user_id }
      });
    }
    
    // Timestamps
    if (result.created_at) {
      newLogs.push({
        timestamp: new Date(),
        message: `Created at: ${new Date(result.created_at).toLocaleString()}`,
        level: 'info',
        data: { created_at: result.created_at }
      });
    }
    
    if (result.updated_at) {
      newLogs.push({
        timestamp: new Date(),
        message: `Last updated: ${new Date(result.updated_at).toLocaleString()}`,
        level: 'info',
        data: { updated_at: result.updated_at }
      });
    }
    
    if (result.completed_at) {
      newLogs.push({
        timestamp: new Date(),
        message: `Completed at: ${new Date(result.completed_at).toLocaleString()}`,
        level: 'success',
        data: { completed_at: result.completed_at }
      });
    }
    
    // Query information
    if (result.query) {
      newLogs.push({
        timestamp: new Date(),
        message: `Original query: ${result.query}`,
        level: 'info',
        data: { query: result.query }
      });
    }
    
    // Context information
    if (result.context) {
      newLogs.push({
        timestamp: new Date(),
        message: `Intent: ${result.context.intent || 'Unknown'}`,
        level: 'info',
        data: { intent: result.context.intent }
      });
      
      if (result.context.confidence) {
        newLogs.push({
          timestamp: new Date(),
          message: `Confidence: ${(result.context.confidence * 100).toFixed(2)}%`,
          level: result.context.confidence > 0.8 ? 'success' : 
                 result.context.confidence > 0.5 ? 'info' : 'warning',
          data: { confidence: result.context.confidence }
        });
      }
      
      // MARC1 intent details
      if (result.context.marc1_intent) {
        newLogs.push({
          timestamp: new Date(),
          message: `MARC1 Intent: ${result.context.marc1_intent.intent_name || 'Unknown'}`,
          level: 'info',
          data: { marc1_intent: result.context.marc1_intent.intent_name }
        });
        
        if (result.context.marc1_intent.confidence) {
          newLogs.push({
            timestamp: new Date(),
            message: `MARC1 Confidence: ${(result.context.marc1_intent.confidence * 100).toFixed(2)}%`,
            level: result.context.marc1_intent.confidence > 0.8 ? 'success' : 
                   result.context.marc1_intent.confidence > 0.5 ? 'info' : 'warning',
            data: { marc1_confidence: result.context.marc1_intent.confidence }
          });
        }
        
        if (result.context.marc1_intent.extracted_at) {
          newLogs.push({
            timestamp: new Date(),
            message: `MARC1 Extraction Time: ${new Date(result.context.marc1_intent.extracted_at).toLocaleString()}`,
            level: 'info',
            data: { marc1_extracted_at: result.context.marc1_intent.extracted_at }
          });
        }
        
        // MARC1 parameters
        if (result.context.marc1_intent.parameters && Object.keys(result.context.marc1_intent.parameters).length > 0) {
          newLogs.push({
            timestamp: new Date(),
            message: `MARC1 Parameters:`,
            level: 'info',
            data: { marc1_parameters: result.context.marc1_intent.parameters }
          });
          
          Object.entries(result.context.marc1_intent.parameters).forEach(([key, value]) => {
            if (key !== 'password') { // Skip sensitive data
              newLogs.push({
                timestamp: new Date(),
                message: `  - ${key}: ${value}`,
                level: 'info',
                data: { [key]: value }
              });
            } else {
              newLogs.push({
                timestamp: new Date(),
                message: `  - ${key}: [REDACTED]`,
                level: 'info',
                data: { [key]: '[REDACTED]' }
              });
            }
          });
        }
      }
    }
    
    // Current state information
    if (result.current_state) {
      newLogs.push({
        timestamp: new Date(),
        message: `Current Step: ${result.current_state.step_index + 1}`,
        level: 'info',
        data: { step_index: result.current_state.step_index }
      });
      
      if (result.current_state.current_tool) {
        newLogs.push({
          timestamp: new Date(),
          message: `Current Tool: ${result.current_state.current_tool}`,
          level: 'info',
          data: { current_tool: result.current_state.current_tool }
        });
      }
      
      if (result.current_state.requires_approval !== undefined) {
        newLogs.push({
          timestamp: new Date(),
          message: `Requires Approval: ${result.current_state.requires_approval ? 'Yes' : 'No'}`,
          level: result.current_state.requires_approval ? 'warning' : 'info',
          data: { requires_approval: result.current_state.requires_approval }
        });
      }
      
      // Metadata
      if (result.current_state.metadata && Object.keys(result.current_state.metadata).length > 0) {
        newLogs.push({
          timestamp: new Date(),
          message: `Execution Metadata:`,
          level: 'info',
          data: { metadata: result.current_state.metadata }
        });
        
        if (result.current_state.metadata.execution_start_time) {
          newLogs.push({
            timestamp: new Date(),
            message: `  - Execution Start: ${new Date(result.current_state.metadata.execution_start_time).toLocaleString()}`,
            level: 'info',
            data: { execution_start_time: result.current_state.metadata.execution_start_time }
          });
        }
        
        if (result.current_state.metadata.current_step !== undefined && result.current_state.metadata.total_steps !== undefined) {
          newLogs.push({
            timestamp: new Date(),
            message: `  - Progress: Step ${result.current_state.metadata.current_step + 1} of ${result.current_state.metadata.total_steps}`,
            level: 'info',
            data: { 
              current_step: result.current_state.metadata.current_step,
              total_steps: result.current_state.metadata.total_steps
            }
          });
        }
        
        if (result.current_state.metadata.last_update) {
          newLogs.push({
            timestamp: new Date(),
            message: `  - Last Update: ${new Date(result.current_state.metadata.last_update).toLocaleString()}`,
            level: 'info',
            data: { last_update: result.current_state.metadata.last_update }
          });
        }
      }
      
      // Parameters
      if (result.current_state.parameters && Object.keys(result.current_state.parameters).length > 0) {
        newLogs.push({
          timestamp: new Date(),
          message: `Task Parameters:`,
          level: 'info',
          data: { parameters: result.current_state.parameters }
        });
        
        Object.entries(result.current_state.parameters).forEach(([key, value]) => {
          if (key !== 'password') { // Skip sensitive data
            newLogs.push({
              timestamp: new Date(),
              message: `  - ${key}: ${value}`,
              level: 'info',
              data: { [key]: value }
            });
          } else {
            newLogs.push({
              timestamp: new Date(),
              message: `  - ${key}: [REDACTED]`,
              level: 'info',
              data: { [key]: '[REDACTED]' }
            });
          }
        });
      }
      
      // Outputs
      if (result.current_state.outputs && Object.keys(result.current_state.outputs).length > 0) {
        newLogs.push({
          timestamp: new Date(),
          message: `Task Outputs:`,
          level: 'info',
          data: { outputs: result.current_state.outputs }
        });
        
        Object.entries(result.current_state.outputs).forEach(([key, value]) => {
          newLogs.push({
            timestamp: new Date(),
            message: `  - ${key}: ${value}`,
            level: 'info',
            data: { [key]: value }
          });
        });
      }
      
      // Error
      if (result.current_state.error) {
        newLogs.push({
          timestamp: new Date(),
          message: `Error: ${result.current_state.error}`,
          level: 'error',
          data: { error: result.current_state.error }
        });
      }
    }
    
    // Tools information
    if (result.tools && result.tools.length > 0) {
      newLogs.push({
        timestamp: new Date(),
        message: `Available Tools (${result.tools.length}):`,
        level: 'info',
        data: { tools_count: result.tools.length }
      });
      
      result.tools.forEach((tool, index) => {
        newLogs.push({
          timestamp: new Date(),
          message: `Tool ${index + 1}: ${tool.name}`,
          level: 'info',
          data: { tool_name: tool.name }
        });
        
        if (tool.description) {
          newLogs.push({
            timestamp: new Date(),
            message: `  - Description: ${tool.description}`,
            level: 'info',
            data: { tool_description: tool.description }
          });
        }
        
        if (tool.parameters && Object.keys(tool.parameters).length > 0) {
          newLogs.push({
            timestamp: new Date(),
            message: `  - Parameters: ${Object.keys(tool.parameters).join(', ')}`,
            level: 'info',
            data: { tool_parameters: Object.keys(tool.parameters) }
          });
        }
      });
    }
    
    // Final status message
    if (result.current_state.status === 'COMPLETED') {
      newLogs.push({
        timestamp: new Date(),
        message: '✅ Task completed successfully',
        level: 'success'
      });
    } else if (result.current_state.status === 'FAILED') {
      newLogs.push({
        timestamp: new Date(),
        message: '❌ Task failed',
        level: 'error'
      });
    } else {
      newLogs.push({
        timestamp: new Date(),
        message: '⏳ Task is still processing',
        level: 'info'
      });
    }
    
    setTaskLogs(newLogs);
  } catch (error) {
    console.error('Error fetching task logs:', error);
    setTaskLogs([{
      timestamp: new Date(),
      message: 'Failed to fetch task logs',
      level: 'error'
    }]);
  }
};
  // Function to open logs modal for a specific task
  const openLogsModal = (taskId: string) => {
    setActiveLogTaskId(taskId);
    fetchTaskLogs(taskId);
    setShowLogsModal(true);
    
    // Set up polling for logs if task is still processing
    const task = pendingTasks.find(t => t.taskId === taskId);
    if (task) {
      const logInterval = setInterval(() => {
        fetchTaskLogs(taskId);
      }, 3000); // Poll every 3 seconds
      
      // Store the interval so we can clear it later
      setPendingTasks(prev => prev.map(t => 
        t.taskId === taskId ? { ...t, logPollingInterval: logInterval } : t
      ));
    }
  };

  // Function to close logs modal
  const closeLogsModal = () => {
    setShowLogsModal(false);
    
    // Clear the polling interval if it exists
    if (activeLogTaskId) {
      const task = pendingTasks.find(t => t.taskId === activeLogTaskId);
      if (task && task.logPollingInterval) {
        clearInterval(task.logPollingInterval);
        setPendingTasks(prev => prev.map(t => 
          t.taskId === activeLogTaskId ? { ...t, logPollingInterval: undefined } : t
        ));
      }
    }
    
    setActiveLogTaskId(null);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up polling intervals on component unmount
  useEffect(() => {
    return () => {
      pendingTasks.forEach(task => {
        if (task.pollingInterval) {
          clearInterval(task.pollingInterval);
        }
      });
    };
  }, [pendingTasks]);

 // Update the pollTaskStatus function to handle the new response structure
const pollTaskStatus = (taskId: string, messageId: string, userMessageId: string) => {
  // Create a placeholder message for the pending response
  const placeholderMessage: Message = {
    id: messageId,
    text: 'Processing your query...',
    sender: 'ai',
    timestamp: new Date(),
    isProcessing: true,
    taskData: { id: taskId } as TaskResult,
     relatedUserMessageId: userMessageId // Store reference to user message
  };
  
  setMessages(prev => [...prev, placeholderMessage]);
  
  // Set up polling interval
  const interval = setInterval(async () => {
    try {
      const result = await apiService.getTaskResult(taskId);
      
      if (result.current_state.status === 'COMPLETED' || result.current_state.status === 'FAILED') {
        // Clear the interval
        clearInterval(interval);
        
        // Remove this task from pending tasks
        setPendingTasks(prev => prev.filter(t => t.taskId !== taskId));
        
        // Format the response text based on the task data
        let responseText = '';
        
        if (result.current_state.status === 'COMPLETED') {
          // Extract the intent and parameters for a more informative response
          const intent = result.context?.intent || '';
          const outputs = result.current_state?.outputs || {};
          
          // Create a human-readable response based on the intent and outputs
          switch (intent.toLowerCase()) {
            case 'cargowise_login':
              responseText = `Successfully logged into CargoWise as ${outputs.username || 'user'} in the ${outputs.environment || 'default'} environment.`;
              break;
            // Add more intent-specific responses as needed
            default:
              // Generic response if we don't have a specific template
              responseText = `Task completed successfully. Intent: ${intent}`;
              if (Object.keys(outputs).length > 0) {
                responseText += `\n\nResults:\n${Object.entries(outputs)
                  .map(([key, value]) => `- ${key}: ${value}`)
                  .join('\n')}`;
              }
          }
        } else {
          // Handle failed tasks
          responseText = result.current_state?.error || 'Sorry, I could not process your query.';
        }
        
        // Update the message with the result
        setMessages((prev: Message[]) => prev.map((msg: Message) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              text: responseText,
              isProcessing: false,
              taskData: result, // Store the full task data
              response: {
                confidence: result.context?.confidence || 0,
                latency: 0, // You might calculate this from timestamps
                intent: result.context?.intent,
                parameters: result.parameters,
                outputs: result.current_state?.outputs
              },
               status: result.current_state.status,
              error: result.current_state.status === 'FAILED' ? result.current_state?.error : undefined
            };
          }
          // Update the user message with task status
          else if (msg.id === userMessageId) {
            return {
              ...msg,
              taskStatus: result.current_state.status,
              taskId: taskId
            };
          }
          return msg;
        }));
      }
    } catch (error) {
      console.error('Error polling task status:', error);
    }
  }, 2000); // Poll every 2 seconds
  
  // Add to pending tasks
  setPendingTasks(prev => [...prev, { taskId, messageId,userMessageId, pollingInterval: interval }]);
  
  return interval;
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    
    setInput('');
    setIsLoading(true);

    try {
      // Submit the query to the backend
      const response = await apiService.executeQuery(userMessage.text);
      console.log(response)
      // Update the user message with the task_id
    setMessages(prev => prev.map(msg => 
      msg.id === userMessage.id 
        ? { ...msg, taskId: response.task_id } 
        : msg
    ));
    
      // Generate a message ID for the AI response
      const aiMessageId = (Date.now() + 1).toString();
      
      // Start polling for the task result
    pollTaskStatus(response.task_id, aiMessageId, userMessage.id);
      
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
const renderMessage = (message: Message) => (
    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg p-4 ${
        message.sender === 'user' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
      {message.isProcessing ? (
        <div>
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{message.text}</span>
        </div>
         {/* Add View Logs button for processing messages */}
            {message.taskData?.id && (
              <button
                onClick={() => message.taskData?.id && openLogsModal(message.taskData.id)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2 px-2 py-1 bg-blue-50 rounded-md transition-colors"
              >
                <FileText className="w-3 h-3" />
                View Logs
              </button>
            )}
          </div>
        ) : (
        <div>
          <div className="whitespace-pre-wrap">{message.text}</div>
          
          {/* Display additional task information for AI responses */}
          {message.sender === 'ai' && message.response && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {message.response.intent && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Intent:</span> 
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">{message.response.intent}</span>
                  </div>
                )}
                
                {message.response.confidence && (
                  <div>
                    <span className="font-medium text-gray-700">Confidence:</span> 
                    <span className={`ml-1 ${getConfidenceColor(message.response.confidence)}`}>
                      {Math.round(message.response.confidence * 100)}%
                    </span>
                  </div>
                )}
                
                {message.taskData?.current_state?.status && (
                  <div>
                    <span className="font-medium text-gray-700">Status:</span> 
                    <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                      message.taskData.current_state.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {message.taskData.current_state.status}
                    </span>
                  </div>
                )}
                
                {/* Display tool information if available */}
                {message.taskData?.tools && message.taskData.tools.length > 0 && (
                  <div className="col-span-2 mt-1">
                    <span className="font-medium text-gray-700">Tool:</span> 
                    <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                      {message.taskData.tools[0].name}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Display parameters if available */}
              {message.response.parameters && Object.keys(message.response.parameters).length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-xs text-gray-700 mb-1">Parameters:</div>
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    {Object.entries(message.response.parameters)
                      .filter(([key]) => key !== 'password') // Don't display passwords
                      .map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-2 mb-1">
                          <div className="font-medium text-gray-600">{key}:</div>
                          <div className="col-span-2 text-gray-800">{String(value)}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {/* Display outputs if available */}
              {message.response.outputs && Object.keys(message.response.outputs).length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-xs text-gray-700 mb-1">Results:</div>
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    {Object.entries(message.response.outputs).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2 mb-1">
                        <div className="font-medium text-gray-600">{key}:</div>
                        <div className="col-span-2 text-gray-800">{String(value)}</div>
                      </div>
                    ))}
                  </div>
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
            {/* Add View Logs button for completed messages too */}
            {message.taskData?.id && (
              <button
                onClick={() => message.taskData?.id && openLogsModal(message.taskData.id)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2 px-2 py-1 bg-blue-50 rounded-md transition-colors"
              >
                <FileText className="w-3 h-3" />
                View Execution Logs
              </button>
            )}
        </div>
        )}
      </div>
    </div>
  );
    // ... existing code ...
  
  return (
    <div className="min-h-screen lg:ml-60 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.8))] -z-10"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-screen flex flex-col">
        {/* Header */}
        

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
                    log.message.includes('  - ') && (
                      !log.message.includes('Tool') && 
                      !log.message.includes('Execution') &&
                      !log.message.includes('Outputs:')
                    )
                  )
                  .map((log, index) => (
                    <div 
                      key={`param-${index}`} 
                      className={`p-1.5 rounded-md text-xs ${
                        log.message.includes('Parameters:') ? 'bg-blue-50 text-blue-800 border border-blue-100 font-medium' :
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
                    log.message.includes('Tool') || 
                    log.message.includes('Current Tool:') ||
                    log.message.includes('Current Step:') ||
                    log.message.includes('Execution') ||
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