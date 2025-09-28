import { useState, useEffect, useRef } from 'react';
import type { TimingAdjustmentInterfaceProps } from './types';

export function TimingAdjustmentInterface({
  pattern,
  capturedTimings,
  onSave,
  onDiscard,
  onRetry
}: TimingAdjustmentInterfaceProps) {
  const [adjustedTimings, setAdjustedTimings] = useState<number[]>([]);
  const [baseTimings, setBaseTimings] = useState<number[]>([]);  // Base timings for offset calculation
  const [globalOffset, setGlobalOffset] = useState<number>(0);
  const [adjustmentMode, setAdjustmentMode] = useState<'offset' | 'replace' | 'manual'>('manual');
  const [offsetSource, setOffsetSource] = useState<'original' | 'captured'>('captured'); // New: what to apply offset to
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize with captured timings as suggested values
  useEffect(() => {
    if (capturedTimings.length > 0 && pattern.timings.length > 0) {
      // Start with captured timings as the base
      const paddedCaptured = [...capturedTimings];
      while (paddedCaptured.length < pattern.timings.length) {
        const lastCaptured = paddedCaptured[paddedCaptured.length - 1] || 0;
        const originalGap = pattern.timings[paddedCaptured.length] - pattern.timings[paddedCaptured.length - 1];
        paddedCaptured.push(lastCaptured + originalGap);
      }
      const finalCaptured = paddedCaptured.slice(0, pattern.timings.length);
      
      setAdjustedTimings(finalCaptured);
      setBaseTimings(finalCaptured);
      setGlobalOffset(0); // Start with no offset since we're using captured as base
    }
  }, [capturedTimings, pattern.timings]);

  const applyGlobalOffset = (offset: number) => {
    const offsetTimings = baseTimings.map(t => Math.max(0, t + offset));
    setAdjustedTimings(offsetTimings);
    setGlobalOffset(offset);
  };
  
  const changeOffsetSource = (source: 'original' | 'captured') => {
    setOffsetSource(source);
    const newBase = source === 'original' ? pattern.timings : capturedTimings.length > 0 ? 
      (() => {
        const paddedCaptured = [...capturedTimings];
        while (paddedCaptured.length < pattern.timings.length) {
          const lastCaptured = paddedCaptured[paddedCaptured.length - 1] || 0;
          const originalGap = pattern.timings[paddedCaptured.length] - pattern.timings[paddedCaptured.length - 1];
          paddedCaptured.push(lastCaptured + originalGap);
        }
        return paddedCaptured.slice(0, pattern.timings.length);
      })() : pattern.timings;
    
    setBaseTimings(newBase);
    setGlobalOffset(0); // Reset offset when switching source
    setAdjustedTimings(newBase);
  };

  const replaceWithCaptured = () => {
    // Pad with original timings if captured has fewer events
    const paddedTimings = [...capturedTimings];
    while (paddedTimings.length < pattern.timings.length) {
      const lastCaptured = paddedTimings[paddedTimings.length - 1] || 0;
      const originalGap = pattern.timings[paddedTimings.length] - pattern.timings[paddedTimings.length - 1];
      paddedTimings.push(lastCaptured + originalGap);
    }
    setAdjustedTimings(paddedTimings.slice(0, pattern.timings.length));
  };

  const updateIndividualTiming = (index: number, value: number) => {
    const newTimings = [...adjustedTimings];
    newTimings[index] = Math.max(0, value);
    
    // Ensure timings remain in ascending order
    for (let i = 0; i < newTimings.length - 1; i++) {
      if (newTimings[i] >= newTimings[i + 1]) {
        newTimings[i + 1] = newTimings[i] + 0.01;
      }
    }
    
    setAdjustedTimings(newTimings);
  };

  const calculateDifferences = () => {
    return adjustedTimings.map((adjusted, index) => {
      const original = pattern.timings[index];
      return adjusted - original;
    });
  };

  const handleSave = () => {
    if (adjustedTimings.length === pattern.timings.length) {
      onSave(adjustedTimings);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">⚙️ Timing Adjustment - {pattern.name}</h3>
        <p className="text-gray-600">
          Compare your captured timings with the original and choose how to adjust them.
        </p>
      </div>

      {/* Video Display with Timestamp */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-3">Reference Video with Precise Timing</h4>
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex justify-center mb-3">
            <video
              ref={videoRef}
              src={pattern.videoPath}
              controls
              loop
              className="rounded-lg shadow-md max-w-full h-auto"
              style={{ maxHeight: '300px', maxWidth: '100%' }}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentVideoTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentVideoTime(0);
                }
              }}
              onError={() => console.error('Error loading video:', pattern.videoPath)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          {/* Precise Timestamp Display */}
          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-gray-100 rounded-lg px-4 py-2">
              <div className="text-sm text-gray-600">Current Time:</div>
              <div className="font-mono text-lg font-bold text-blue-600">
                {currentVideoTime.toFixed(3)}s
              </div>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    const roundedTime = Math.round(currentVideoTime * 1000) / 1000;
                    navigator.clipboard?.writeText(roundedTime.toFixed(3));
                  }
                }}
                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs transition-colors"
                title="Copy current time to clipboard"
              >
                📋 Copy Time
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use video scrubber or play/pause to find exact attack moments. 
              Click "Copy Time" to get precise timestamp.
            </p>
          </div>

          {/* Quick Jump to Events */}
          <div className="mt-3 border-t pt-3 space-y-2">
            <div>
              <div className="text-sm text-gray-600 mb-2">Quick Jump to Original Events:</div>
              <div className="flex flex-wrap gap-1 justify-center">
                {pattern.timings.map((timing, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = timing;
                        setCurrentVideoTime(timing);
                      }
                    }}
                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs transition-colors"
                  >
                    E{index + 1}: {timing.toFixed(3)}s
                  </button>
                ))}
              </div>
            </div>
            
            {capturedTimings.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Quick Jump to Your Captured Events:</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {capturedTimings.map((timing, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = timing;
                          setCurrentVideoTime(timing);
                        }
                      }}
                      className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs transition-colors"
                    >
                      C{index + 1}: {timing.toFixed(3)}s
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Adjustment Mode Selection */}
      <div>
        <h4 className="font-medium mb-3">Adjustment Method:</h4>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setAdjustmentMode('offset');
              applyGlobalOffset(globalOffset);
            }}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              adjustmentMode === 'offset'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Global Offset
          </button>
          <button
            onClick={() => {
              setAdjustmentMode('replace');
              replaceWithCaptured();
            }}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              adjustmentMode === 'replace'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Replace with Captured
          </button>
          <button
            onClick={() => setAdjustmentMode('manual')}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              adjustmentMode === 'manual'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Manual Fine-tuning
          </button>
        </div>
      </div>

      {/* Global Offset Control */}
      {adjustmentMode === 'offset' && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="mb-4">
            <label className="block font-medium text-blue-900 mb-2">
              Base timings to adjust:
            </label>
            <div className="flex gap-3 mb-2">
              <button
                onClick={() => changeOffsetSource('original')}
                className={`px-3 py-1 rounded font-medium text-sm transition-colors ${
                  offsetSource === 'original'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                }`}
              >
                📋 Original Pattern
              </button>
              <button
                onClick={() => changeOffsetSource('captured')}
                className={`px-3 py-1 rounded font-medium text-sm transition-colors ${
                  offsetSource === 'captured'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                }`}
              >
                🎯 Your Recording
              </button>
            </div>
            <p className="text-xs text-blue-600 mb-3">
              {offsetSource === 'original' 
                ? 'Start with the original pattern and adjust it with an offset'
                : 'Start with your recorded timings and adjust them with an offset'
              }
            </p>
          </div>
          
          <label className="block font-medium text-blue-900 mb-2">
            Global Offset (seconds):
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min={-5}
              max={5}
              step={0.001}
              value={globalOffset}
              onChange={(e) => applyGlobalOffset(Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              step={0.001}
              value={globalOffset.toFixed(3)}
              onChange={(e) => applyGlobalOffset(Number(e.target.value))}
              className="w-24 px-2 py-1 border border-gray-300 rounded text-center font-mono"
            />
          </div>
          <div className="flex justify-between items-center text-sm text-blue-700 mt-2">
            <span>
              {offsetSource === 'original' 
                ? `Applying ${globalOffset >= 0 ? '+' : ''}${globalOffset.toFixed(3)}s to original pattern timings`
                : `Applying ${globalOffset >= 0 ? '+' : ''}${globalOffset.toFixed(3)}s to your recorded timings`
              }
            </span>
            {capturedTimings.length > 0 && (
              <button
                onClick={() => {
                  const suggestedOffset = offsetSource === 'original' 
                    ? capturedTimings[0] - pattern.timings[0]  // To make original match captured
                    : pattern.timings[0] - capturedTimings[0]; // To make captured match original
                  applyGlobalOffset(suggestedOffset);
                }}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition-colors"
              >
                Apply Suggested ({(offsetSource === 'original' 
                  ? capturedTimings[0] - pattern.timings[0] 
                  : pattern.timings[0] - capturedTimings[0]).toFixed(3)}s)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timing Comparison Table */}
      <div>
        <h4 className="font-medium mb-3">Timing Comparison:</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-gray-50 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Event</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Original</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Captured</th>
                <th className="border border-gray-300 px-3 py-2 text-center">New Value</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Difference</th>
              </tr>
            </thead>
            <tbody>
              {pattern.timings.map((originalTiming, index) => {
                const capturedTiming = capturedTimings[index];
                const adjustedTiming = adjustedTimings[index];
                const difference = calculateDifferences()[index];

                return (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-3 py-2 font-medium">
                      Event {index + 1}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-mono">
                      {originalTiming.toFixed(3)}s
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-mono">
                      {capturedTiming ? capturedTiming.toFixed(3) + 's' : '-'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {adjustmentMode === 'manual' ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step={0.001}
                            value={adjustedTiming?.toFixed(3) || '0'}
                            onChange={(e) => updateIndividualTiming(index, Number(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center font-mono text-xs"
                          />
                          <button
                            onClick={() => {
                              if (videoRef.current) {
                                updateIndividualTiming(index, currentVideoTime);
                              }
                            }}
                            className="px-1 py-0.5 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs transition-colors"
                            title="Use current video time"
                          >
                            📹
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono">{adjustedTiming?.toFixed(3) || '0'}s</span>
                      )}
                    </td>
                    <td className={`border border-gray-300 px-3 py-2 text-center font-mono ${
                      Math.abs(difference) > 0.1 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {difference >= 0 ? '+' : ''}{difference?.toFixed(3) || '0'}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Summary:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Average Difference:</span>
            <div className="font-mono">
              {(calculateDifferences().reduce((a, b) => a + Math.abs(b), 0) / calculateDifferences().length).toFixed(3)}s
            </div>
          </div>
          <div>
            <span className="text-gray-600">Max Difference:</span>
            <div className="font-mono">
              {Math.max(...calculateDifferences().map(Math.abs)).toFixed(3)}s
            </div>
          </div>
          <div>
            <span className="text-gray-600">Total Events:</span>
            <div className="font-mono">{adjustedTimings.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Duration:</span>
            <div className="font-mono">
              {adjustedTimings.length > 0 ? adjustedTimings[adjustedTimings.length - 1].toFixed(3) : '0'}s
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <button
            onClick={onDiscard}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
          >
            Discard Changes
          </button>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium transition-colors"
          >
            Retry Calibration
          </button>
        </div>
        
        <button
          onClick={handleSave}
          disabled={adjustedTimings.length !== pattern.timings.length}
          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💾 Save New Timings
        </button>
      </div>
    </div>
  );
}
