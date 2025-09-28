import { useState, useEffect, useRef } from 'react';
import type { CalibrationInterfaceProps } from './types';

export function CalibrationInterface({ 
  pattern, 
  onComplete, 
  onCancel 
}: CalibrationInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [capturedTimings, setCapturedTimings] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [instructions, setInstructions] = useState('Click Start Calibration to begin');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle spacebar capture
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && isRecording && startTime !== null) {
        event.preventDefault();
        
        const currentTime = (performance.now() - startTime) / 1000;
        
        setCapturedTimings(prev => {
          const newTimings = [...prev, currentTime];
          
        // Check if we've captured enough events
        if (newTimings.length >= pattern.timings.length) {
          setIsRecording(false);
          setInstructions(`Captured ${newTimings.length} events! Review and save or retry.`);
          
          // Pause video when calibration is complete
          if (videoRef.current) {
            videoRef.current.pause();
          }
        } else {
          setInstructions(`Event ${newTimings.length + 1}/${pattern.timings.length} - Press SPACEBAR on next attack`);
        }          return newTimings;
        });
      }
    };

    if (isRecording) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isRecording, startTime, pattern.timings.length]);

  const startCalibration = () => {
    setCapturedTimings([]);
    setStartTime(performance.now());
    setIsRecording(true);
    setInstructions(`Event 1/${pattern.timings.length} - Press SPACEBAR on first attack`);
    
    // Start video playback
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  };

  const stopCalibration = () => {
    setIsRecording(false);
    setStartTime(null);
    setInstructions('Calibration stopped');
    
    // Pause video playback
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleComplete = () => {
    if (capturedTimings.length > 0) {
      onComplete(capturedTimings);
    }
  };

  const handleRetry = () => {
    startCalibration();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">🎯 Calibration Mode - {pattern.name}</h3>
      
      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
          <li>Watch the video below and get familiar with the attack pattern</li>
          <li>Click "Start Calibration" - the video will automatically restart and play</li>
          <li>Press SPACEBAR at each attack moment ({pattern.timings.length} total)</li>
          <li>Video will pause when complete - review your timing and adjust if needed</li>
        </ol>
      </div>

      {/* Video Display */}
      <div className="mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-center">
            <video
              ref={videoRef}
              src={pattern.videoPath}
              controls
              loop
              className="rounded-lg shadow-md max-w-full h-auto"
              style={{ maxHeight: '300px', maxWidth: '100%' }}
              onError={() => console.error('Error loading video:', pattern.videoPath)}
              onLoadedMetadata={() => {
                // Reset video to start when loaded
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                }
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600 mb-2">
              📹 Study the attack pattern - {pattern.timings.length} events expected
            </p>
            {!isRecording && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.paused) {
                        videoRef.current.play().catch(console.error);
                      } else {
                        videoRef.current.pause();
                      }
                    }
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
                >
                  ⏯️ Play/Pause
                </button>
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
                >
                  ⏮️ Restart
                </button>
              </div>
            )}
            {isRecording && (
              <p className="text-sm text-green-600 font-medium">
                🎬 Video playing - Press SPACEBAR to capture timing
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Display */}
      <div className={`mb-6 p-4 rounded-lg border ${
        isRecording ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`font-medium ${
            isRecording ? 'text-green-800' : 'text-gray-700'
          }`}>
            {instructions}
          </span>
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700">Recording...</span>
            </div>
          )}
        </div>
        
        {capturedTimings.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Captured Events ({capturedTimings.length}/{pattern.timings.length}):
            </p>
            <div className="grid grid-cols-4 gap-2">
              {capturedTimings.map((timing, index) => (
                <div key={index} className="bg-white p-2 rounded border text-center">
                  <div className="text-xs text-gray-500">Event {index + 1}</div>
                  <div className="font-mono text-sm">{timing.toFixed(3)}s</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-between">
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isRecording}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>

        <div className="flex gap-2">
          {!isRecording && capturedTimings.length > 0 && (
            <>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
              >
                Continue to Adjustment
              </button>
            </>
          )}
          
          {!isRecording && capturedTimings.length === 0 && (
            <button
              onClick={startCalibration}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors"
            >
              Start Calibration
            </button>
          )}
          
          {isRecording && (
            <button
              onClick={stopCalibration}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
            >
              Stop Recording
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
