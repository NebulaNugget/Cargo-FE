import { create } from 'zustand';
import { apiService } from '../services/apiService';
import type { Message, TaskLog, PendingTask } from '../types';

interface QueryState {
  messages: Message[];
  input: string;
  isLoading: boolean;
  copiedMessageId: string | null;
  pendingTasks: PendingTask[];
  activeLogTaskId: string | null;
  showLogsModal: boolean;
  taskLogs: TaskLog[];
  
  // Actions
  setInput: (input: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  executeQuery: (text: string) => Promise<void>;
  pollTaskStatus: (taskId: string, messageId: string, userMessageId: string) => void;
  copyToClipboard: (text: string, messageId: string) => Promise<void>;
  openLogsModal: (taskId: string) => void;
  closeLogsModal: () => void;
  fetchTaskLogs: (taskId: string) => Promise<void>;
  clearMessages: () => void;
}

export const useQueryStore = create<QueryState>((set, get) => ({
  messages: [],
  input: '',
  isLoading: false,
  copiedMessageId: null,
  pendingTasks: [],
  activeLogTaskId: null,
  showLogsModal: false,
  taskLogs: [],
  
  setInput: (input) => set({ input }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    )
  })),
  
  executeQuery: async (text) => {
    set({ isLoading: true });
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    // Add user message
    get().addMessage(userMessage);
    set({ input: '' });
    
    try {
      // Submit the query to the backend
      const response = await apiService.executeQuery(text);
      
      // Update the user message with the task_id
      get().updateMessage(userMessage.id, { taskId: response.task_id });
      
      // Generate a message ID for the AI response
      const aiMessageId = (Date.now() + 1).toString();
      
      // Start polling for the task result
      get().pollTaskStatus(response.task_id, aiMessageId, userMessage.id);
      
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.',
        sender: 'ai',
        timestamp: new Date(),
        error: error.message || 'Unknown error occurred'
      };
      get().addMessage(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
  
  pollTaskStatus: (taskId, messageId, userMessageId) => {
    // Create a placeholder message for the pending response
    const placeholderMessage: Message = {
      id: messageId,
      text: 'Processing your query...',
      sender: 'ai',
      timestamp: new Date(),
      isProcessing: true,
      taskData: { id: taskId } as any,
      relatedUserMessageId: userMessageId
    };
    
    get().addMessage(placeholderMessage);
    
    // Set up polling interval
    const interval = setInterval(async () => {
      try {
        const result = await apiService.getTaskResult(taskId);
        
        if (result.current_state.status === 'COMPLETED' || result.current_state.status === 'FAILED') {
          // Clear the interval
          clearInterval(interval);
          
          // Remove this task from pending tasks
          set((state) => ({
            pendingTasks: state.pendingTasks.filter(t => t.taskId !== taskId)
          }));
          
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
          get().updateMessage(messageId, {
            text: responseText,
            isProcessing: false,
            taskData: result,
            response: {
              confidence: result.context?.confidence || 0,
              latency: 0, // You might calculate this from timestamps
              intent: result.context?.intent,
              parameters: result.parameters,
              outputs: result.current_state?.outputs
            },
            status: result.current_state.status,
            error: result.current_state.status === 'FAILED' ? result.current_state?.error : undefined
          });
          
          // Update the user message with task status
          get().updateMessage(userMessageId, {
            taskStatus: result.current_state.status,
            taskId: taskId
          });
        }
      } catch (error) {
        console.error('Error polling task status:', error);
      }
    }, 2000); // Poll every 2 seconds
    
    // Add to pending tasks
    set((state) => ({
      pendingTasks: [...state.pendingTasks, { 
        taskId, 
        messageId,
        userMessageId, 
        pollingInterval: interval 
      }]
    }));
  },
  
  copyToClipboard: async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      set({ copiedMessageId: messageId });
      setTimeout(() => set({ copiedMessageId: null }), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  },
  
  openLogsModal: (taskId) => {
    set({ activeLogTaskId: taskId, showLogsModal: true });
    get().fetchTaskLogs(taskId);
    
    // Set up polling for logs if task is still processing
    const task = get().pendingTasks.find(t => t.taskId === taskId);
    if (task) {
      const logInterval = setInterval(() => {
        get().fetchTaskLogs(taskId);
      }, 3000); // Poll every 3 seconds
      
      // Store the interval so we can clear it later
      set((state) => ({
        pendingTasks: state.pendingTasks.map(t => 
          t.taskId === taskId ? { ...t, logPollingInterval: logInterval } : t
        )
      }));
    }
  },
  
  closeLogsModal: () => {
    const { activeLogTaskId, pendingTasks } = get();
    
    // Clear the polling interval if it exists
    if (activeLogTaskId) {
      const task = pendingTasks.find(t => t.taskId === activeLogTaskId);
      if (task && task.logPollingInterval) {
        clearInterval(task.logPollingInterval);
        set((state) => ({
          pendingTasks: state.pendingTasks.map(t => 
            t.taskId === activeLogTaskId ? { ...t, logPollingInterval: undefined } : t
          )
        }));
      }
    }
    
    set({ showLogsModal: false, activeLogTaskId: null });
  },
  
   fetchTaskLogs: async (taskId) => {
    try {
      // Fetch the task result
      const result = await apiService.getTaskResult(taskId);
      
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
      
      set({ taskLogs: newLogs });
    } catch (error) {
      console.error('Error fetching task logs:', error);
      set({ 
        taskLogs: [{
          timestamp: new Date(),
          message: 'Failed to fetch task logs',
          level: 'error'
        }]
      });
    }
  },
  
  clearMessages: () => set({ messages: [] })
}));