import { useState, useEffect, useRef } from 'react';
import { loadSimonPatterns, updatePattern, resetPatternsToDefault, type BossPhase, type AttackPattern, type SimonPatterns } from '../utils/patternLoader';

type EditMode = 'view' | 'calibrate' | 'adjust';

interface PatternEditorState {
  patterns: SimonPatterns | null;
  selectedPhase: BossPhase;
  selectedPattern: AttackPattern | null;
  editMode: EditMode;
  capturedTimings: number[];
  error: string | null;
  hasUnsavedChanges: boolean;
}

export function PatternEditor() {
  const [state, setState] = useState<PatternEditorState>({
    patterns: null,
    selectedPhase: 'phase1',
    selectedPattern: null,
    editMode: 'view',
    capturedTimings: [],
    error: null,
    hasUnsavedChanges: false,
  });

  // Load patterns on mount
  useEffect(() => {
    try {
      const patterns = loadSimonPatterns();
      setState(prev => ({ ...prev, patterns }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load patterns' 
      }));
    }
  }, []);

  const selectPattern = (pattern: AttackPattern) => {
    setState(prev => ({
      ...prev,
      selectedPattern: pattern,
      editMode: 'view',
      capturedTimings: [],
      error: null
    }));
  };

  const startCalibration = () => {
    if (!state.selectedPattern) return;
    
    setState(prev => ({
      ...prev,
      editMode: 'calibrate',
      capturedTimings: [],
      error: null
    }));
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all patterns to defaults? This cannot be undone.')) {
      return;
    }

    try {
      const defaultPatterns = resetPatternsToDefault();
      setState(prev => ({
        ...prev,
        patterns: defaultPatterns,
        hasUnsavedChanges: false,
        selectedPattern: null,
        editMode: 'view'
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to reset patterns'
      }));
    }
  };


  const handleExportForJSON = () => {
    try {
      const currentPatterns = loadSimonPatterns();
      const jsonString = JSON.stringify(currentPatterns, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'simonPatterns.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setState(prev => ({
        ...prev,
        error: null
      }));
      
      alert('✅ Downloaded simonPatterns.json with your calibrated timings!\n\nTo make these changes permanent:\n1. Replace src/data/simonPatterns.json with the downloaded file\n2. Click "Reset to JSON Defaults" to clear localStorage\n3. Your calibrated patterns are now the new defaults!');
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export JSON'
      }));
    }
  };

  const handleRefreshPatterns = () => {
    try {
      const freshPatterns = loadSimonPatterns();
      setState(prev => ({
        ...prev,
        patterns: freshPatterns,
        selectedPattern: prev.selectedPattern ? 
          freshPatterns[prev.selectedPhase].find(p => p.id === prev.selectedPattern!.id) || null 
          : null,
        hasUnsavedChanges: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to refresh patterns'
      }));
    }
  };

  if (!state.patterns) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          {state.error ? (
            <div className="text-red-600">
              <h3 className="font-semibold">Error Loading Patterns</h3>
              <p className="text-sm mt-2">{state.error}</p>
            </div>
          ) : (
            <div className="text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p>Loading patterns...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pattern Editor</h2>
            <p className="text-gray-600 mt-1">
              Calibrate and adjust attack timing patterns
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleRefreshPatterns}
              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors text-sm"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleExportForJSON}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors text-sm"
            >
              � Export as JSON
            </button>
            <button
              onClick={handleResetToDefaults}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors text-sm"
            >
              🔄 Reset to JSON Defaults
            </button>
          </div>
        </div>

        {/* Data Source Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">📚 How Pattern Storage Works:</h4>
          <div className="text-blue-700 text-sm space-y-1">
            <div><strong>JSON File:</strong> Default patterns (src/data/simonPatterns.json)</div>
            <div><strong>Local Storage:</strong> Your calibrated customizations (temporary)</div>
            <div><strong>App Uses:</strong> Local storage customizations first, falls back to JSON defaults</div>
          </div>
          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded">
            <h5 className="text-sm font-medium text-purple-800 mb-1">💾 To Make Changes Permanent:</h5>
            <ol className="text-purple-700 text-xs space-y-1 list-decimal list-inside">
              <li>Calibrate your patterns here (saved to localStorage)</li>
              <li>Click "📋 Export as JSON" to download your calibrated patterns</li>
              <li>Replace <code className="bg-purple-100 px-1 rounded">src/data/simonPatterns.json</code> with the downloaded file</li>
              <li>Click "Reset to JSON Defaults" to use your new JSON file</li>
              <li>Your calibrated patterns are now the permanent defaults! 🎉</li>
            </ol>
          </div>
        </div>

        {state.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        )}

        {state.hasUnsavedChanges && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Changes Saved Successfully!</h3>
                <p className="text-green-700 text-sm mt-1">
                  Your pattern adjustments have been saved to local storage and are now active in the training mode.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase Selection */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Select Phase & Pattern</h3>
        
        <div className="flex gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="phase"
              value="phase1"
              checked={state.selectedPhase === 'phase1'}
              onChange={() => setState(prev => ({ 
                ...prev, 
                selectedPhase: 'phase1',
                selectedPattern: null,
                editMode: 'view'
              }))}
              className="mr-2"
            />
            Phase 1
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="phase"
              value="phase2"
              checked={state.selectedPhase === 'phase2'}
              onChange={() => setState(prev => ({ 
                ...prev, 
                selectedPhase: 'phase2',
                selectedPattern: null,
                editMode: 'view'
              }))}
              className="mr-2"
            />
            Phase 2
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {state.patterns[state.selectedPhase].map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => selectPattern(pattern)}
              className={`p-4 rounded-lg border-2 text-left transition-colors relative ${
                state.selectedPattern?.id === pattern.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{pattern.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {pattern.timings.length} events • {pattern.timings[pattern.timings.length - 1].toFixed(2)}s duration
                  </p>
                </div>
                {/* Check if this pattern has custom timings */}
                {(() => {
                  try {
                    const customPatterns = localStorage.getItem('simon-patterns-custom');
                    if (customPatterns) {
                      const parsed = JSON.parse(customPatterns);
                      const hasCustom = parsed[state.selectedPhase]?.find((p: any) => p.id === pattern.id);
                      if (hasCustom) {
                        return (
                          <div className="ml-2">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" title="Customized timing"></span>
                          </div>
                        );
                      }
                    }
                  } catch (e) {
                    // Ignore parsing errors
                  }
                  return null;
                })()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pattern Details */}
      {state.selectedPattern && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{state.selectedPattern.name}</h3>
              <p className="text-gray-600">Current Timings</p>
            </div>
            
            {state.editMode === 'view' && (
              <button
                onClick={startCalibration}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
              >
                🎯 Calibrate Timing
              </button>
            )}
          </div>

          <div className="space-y-2">
            {state.selectedPattern.timings.map((timing, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono">Event {index + 1}</span>
                <span className="font-mono text-lg">{timing.toFixed(3)}s</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calibration Mode */}
      {state.editMode === 'calibrate' && state.selectedPattern && (
        <CalibrationInterface
          pattern={state.selectedPattern}
          onComplete={(capturedTimings) => {
            setState(prev => ({
              ...prev,
              capturedTimings,
              editMode: 'adjust'
            }));
          }}
          onCancel={() => {
            setState(prev => ({
              ...prev,
              editMode: 'view',
              capturedTimings: []
            }));
          }}
        />
      )}

      {/* Adjustment Mode */}
      {state.editMode === 'adjust' && state.selectedPattern && (
        <TimingAdjustmentInterface
          pattern={state.selectedPattern}
          capturedTimings={state.capturedTimings}
          onSave={async (newTimings) => {
            try {
              const updatedPatterns = updatePattern(
                state.selectedPhase,
                state.selectedPattern!.id,
                newTimings
              );
              
              // Find the updated pattern
              const updatedPattern = updatedPatterns[state.selectedPhase]
                .find(p => p.id === state.selectedPattern!.id)!;
              
              setState(prev => ({
                ...prev,
                patterns: updatedPatterns,
                selectedPattern: updatedPattern,
                editMode: 'view',
                capturedTimings: [],
                hasUnsavedChanges: true
              }));

              // Show temporary success message
              setTimeout(() => {
                setState(prev => ({ ...prev, hasUnsavedChanges: false }));
              }, 3000);
            } catch (error) {
              setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to save pattern'
              }));
            }
          }}
          onDiscard={() => {
            setState(prev => ({
              ...prev,
              editMode: 'view',
              capturedTimings: []
            }));
          }}
          onRetry={() => {
            setState(prev => ({
              ...prev,
              editMode: 'calibrate',
              capturedTimings: []
            }));
          }}
        />
      )}
    </div>
  );
}

// Calibration Interface Component
function CalibrationInterface({ 
  pattern, 
  onComplete, 
  onCancel 
}: { 
  pattern: AttackPattern;
  onComplete: (timings: number[]) => void;
  onCancel: () => void;
}) {
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

function TimingAdjustmentInterface({
  pattern,
  capturedTimings,
  onSave,
  onDiscard,
  onRetry
}: {
  pattern: AttackPattern;
  capturedTimings: number[];
  onSave: (newTimings: number[]) => void;
  onDiscard: () => void;
  onRetry: () => void;
}) {
  const [adjustedTimings, setAdjustedTimings] = useState<number[]>([]);
  const [globalOffset, setGlobalOffset] = useState<number>(0);
  const [adjustmentMode, setAdjustmentMode] = useState<'offset' | 'replace' | 'manual'>('offset');
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Calculate suggested offset (difference between first captured and first original)
  useEffect(() => {
    if (capturedTimings.length > 0 && pattern.timings.length > 0) {
      const suggestedOffset = capturedTimings[0] - pattern.timings[0];
      setGlobalOffset(suggestedOffset);
      
      // Apply offset to original timings as default
      const offsetTimings = pattern.timings.map(t => t + suggestedOffset);
      setAdjustedTimings(offsetTimings);
    }
  }, [capturedTimings, pattern.timings]);

  const applyGlobalOffset = (offset: number) => {
    const offsetTimings = pattern.timings.map(t => Math.max(0, t + offset));
    setAdjustedTimings(offsetTimings);
    setGlobalOffset(offset);
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

      {/* Global Offset Control */}
      {adjustmentMode === 'offset' && (
        <div className="p-4 bg-blue-50 rounded-lg">
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
          <p className="text-sm text-blue-700 mt-2">
            Suggested offset: {(capturedTimings[0] - pattern.timings[0]).toFixed(3)}s
            (based on first event difference)
          </p>
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
