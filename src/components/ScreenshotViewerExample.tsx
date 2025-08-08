import React, { useState } from 'react';
import { ScreenshotViewer } from './ScreenshotViewer';
import { Play, Square, Settings } from 'lucide-react';

/**
 * Example component demonstrating how to use the ScreenshotViewer
 * This shows integration with task management and configuration options
 */
export const ScreenshotViewerExample: React.FC = () => {
  const [taskId, setTaskId] = useState('task_123');
  const [isViewerActive, setIsViewerActive] = useState(false);
  const [maxScreenshots, setMaxScreenshots] = useState(10);
  const [showSettings, setShowSettings] = useState(false);

  const handleStartViewing = () => {
    if (!taskId.trim()) {
      alert('Please enter a valid Task ID');
      return;
    }
    setIsViewerActive(true);
  };

  const handleStopViewing = () => {
    setIsViewerActive(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Screenshot Viewer Demo</h1>
        <p className="text-gray-600 mb-6">
          This component demonstrates real-time screenshot viewing via WebSocket connection.
          Enter a task ID and start viewing to see live screenshots from the backend.
        </p>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="taskId" className="text-sm font-medium text-gray-700">
              Task ID:
            </label>
            <input
              id="taskId"
              type="text"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Enter task ID (e.g., task_123)"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isViewerActive}
            />
          </div>

          <div className="flex items-center gap-2">
            {!isViewerActive ? (
              <button
                onClick={handleStartViewing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                Start Viewing
              </button>
            ) : (
              <button
                onClick={handleStopViewing}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Square className="w-4 h-4" />
                Stop Viewing
              </button>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Viewer Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="maxScreenshots" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Screenshots to Keep
                </label>
                <input
                  id="maxScreenshots"
                  type="number"
                  min="1"
                  max="50"
                  value={maxScreenshots}
                  onChange={(e) => setMaxScreenshots(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of screenshots to keep in memory (1-50)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Connection Info
                </label>
                <div className="text-sm text-gray-600">
                  <p>WebSocket URL: <code className="bg-gray-200 px-1 rounded text-xs">ws://localhost:8000/api/v1/tasks/ws/{taskId}</code></p>
                  <p className="mt-1">Auth: Token from localStorage</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Screenshot Viewer */}
      {isViewerActive && (
        <ScreenshotViewer
          taskId={taskId}
          autoConnect={true}
          maxScreenshots={maxScreenshots}
          className="min-h-[600px]"
        />
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h2>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>1. Setup:</strong> Make sure your backend is running and the WebSocket endpoint is available.</p>
          <p><strong>2. Authentication:</strong> Ensure you have a valid token in localStorage or pass it as a prop.</p>
          <p><strong>3. Task ID:</strong> Enter the task ID that corresponds to a running task on your backend.</p>
          <p><strong>4. Connect:</strong> Click "Start Viewing" to establish the WebSocket connection.</p>
          <p><strong>5. View:</strong> Screenshots will appear automatically as they're sent from the backend.</p>
        </div>
      </div>

      {/* Integration Example */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Integration Example</h2>
        <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
          <code>{`import { ScreenshotViewer } from './components/ScreenshotViewer';

// Basic usage
<ScreenshotViewer 
  taskId="your-task-id" 
  autoConnect={true} 
/>

// With custom configuration
<ScreenshotViewer 
  taskId="your-task-id"
  token="your-auth-token"
  autoConnect={false}
  maxScreenshots={20}
  className="custom-styles"
/>

// Using the hook directly
import { useScreenshotWebSocket } from './hooks/useScreenshotWebSocket';

const { 
  isConnected, 
  screenshots, 
  currentScreenshot,
  connect,
  disconnect 
} = useScreenshotWebSocket({
  taskId: 'your-task-id',
  autoConnect: true
});`}</code>
        </pre>
      </div>
    </div>
  );
};

export default ScreenshotViewerExample;