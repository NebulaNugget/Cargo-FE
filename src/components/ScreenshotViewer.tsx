import React, { useState } from 'react';
import { Monitor, Wifi, WifiOff, Download, Maximize2, Minimize2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScreenshotWebSocket } from '../hooks/useScreenshotWebSocket';
import type { ScreenshotViewerProps, ScreenshotData } from '../types/screenshot';

export const ScreenshotViewer: React.FC<ScreenshotViewerProps> = ({
  taskId,
  token,
  className = '',
  autoConnect = true,
  maxScreenshots = 10
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const {
    isConnected,
    isConnecting,
    error,
    screenshots,
    currentScreenshot,
    connectionAttempts,
    connect,
    disconnect,
    clearScreenshots,
    clearError
  } = useScreenshotWebSocket({
    taskId,
    token,
    autoConnect,
    maxScreenshots
  });

  // Update current index when new screenshots arrive
  React.useEffect(() => {
    if (screenshots.length > 0 && currentIndex >= screenshots.length) {
      setCurrentIndex(0);
    }
  }, [screenshots.length, currentIndex]);

  const getCurrentScreenshot = () => {
    if (screenshots.length === 0) return currentScreenshot;
    return screenshots[currentIndex]?.image || currentScreenshot;
  };

  const getCurrentScreenshotData = () => {
    return screenshots[currentIndex] || null;
  };

  const goToPrevious = () => {
    if (screenshots.length > 0) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : screenshots.length - 1));
    }
  };

  const goToNext = () => {
    if (screenshots.length > 0) {
      setCurrentIndex((prev) => (prev < screenshots.length - 1 ? prev + 1 : 0));
    }
  };

  const downloadScreenshot = (screenshot: ScreenshotData) => {
    try {
      const link = document.createElement('a');
      link.href = screenshot.image;
      link.download = screenshot.filename || `screenshot_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading screenshot:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const displayedScreenshot = getCurrentScreenshot();
  const currentScreenshotData = getCurrentScreenshotData();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Live Screenshots</h3>
          <span className="text-sm text-gray-500">Task: {taskId}</span>
          {screenshots.length > 0 && (
            <span className="text-xs text-gray-400">({currentIndex + 1}/{screenshots.length})</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className="flex items-center gap-1">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Connected</span>
              </>
            ) : isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-xs text-blue-600 font-medium">Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>
          
          {/* Control Buttons */}
          {!isConnected && !isConnecting && (
            <button
              onClick={connect}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Connect
            </button>
          )}
          
          {isConnected && (
            <button
              onClick={disconnect}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Disconnect
            </button>
          )}
          
          {screenshots.length > 0 && (
            <button
              onClick={clearScreenshots}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              title="Clear Screenshots"
            >
              Clear
            </button>
          )}
          
          {error && (
            <button
              onClick={clearError}
              className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              title="Clear Error"
            >
              Clear Error
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <span className="text-sm font-medium">Error: {error}</span>
              {connectionAttempts > 0 && (
                <span className="text-xs">({connectionAttempts}/5 attempts)</span>
              )}
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        {displayedScreenshot ? (
          <div className="space-y-4">
            {/* Current Screenshot */}
            <div className="relative">
              <img
                src={displayedScreenshot}
                alt="Current Screenshot"
                className={`w-full border border-gray-200 rounded-lg ${
                  isFullscreen 
                    ? 'fixed inset-4 z-50 bg-black object-contain max-h-screen max-w-screen' 
                    : 'object-contain max-h-[70vh]'
                }`}
                onClick={toggleFullscreen}
                style={{ cursor: 'pointer' }}
              />
              
              {/* Navigation Controls */}
              {screenshots.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    title="Previous Screenshot"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    title="Next Screenshot"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              
              {/* Overlay Controls */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={toggleFullscreen}
                  className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                
                {currentScreenshotData && (
                  <button
                    onClick={() => downloadScreenshot(currentScreenshotData)}
                    className="p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors"
                    title="Download Screenshot"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Screenshot Info */}
              {currentScreenshotData && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {new Date(currentScreenshotData.timestamp).toLocaleString()}
                </div>
              )}
            </div>

            {/* Screenshot Thumbnails */}
            {screenshots.length > 1 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Screenshot History</h4>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {screenshots.map((screenshot, index) => (
                    <div 
                      key={screenshot.id} 
                      className={`relative group flex-shrink-0 ${
                        index === currentIndex ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <img
                        src={screenshot.image}
                        alt={`Screenshot ${screenshot.id}`}
                        className="w-20 h-16 object-cover border border-gray-200 rounded cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={() => setCurrentIndex(index)}
                      />
                      <button
                        onClick={() => downloadScreenshot(screenshot)}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">
                        {new Date(screenshot.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {isConnected 
                ? 'Waiting for screenshots...' 
                : 'Connect to view live screenshots'
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40" 
          onClick={toggleFullscreen}
        />
      )}
    </div>
  );
};

export default ScreenshotViewer;