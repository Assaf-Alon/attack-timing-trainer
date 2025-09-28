import { useState, useEffect } from 'react';
import { loadSimonPatterns, updatePattern, resetPatternsToDefault, type AttackPattern } from '../utils/patternLoader';
import { CalibrationInterface } from './PatternEditor/CalibrationInterface';
import { QuickEditInterface } from './PatternEditor/QuickEditInterface';
import { TimingAdjustmentInterface } from './PatternEditor/TimingAdjustmentInterface';
import type { PatternEditorState } from './PatternEditor/types';

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
              📤 Export as JSON
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
              <div className="flex gap-2">
                <button
                  onClick={() => setState(prev => ({ ...prev, editMode: 'quickEdit' }))}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors"
                >
                  ⚙️ Quick Edit
                </button>
                <button
                  onClick={startCalibration}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
                >
                  🎯 Calibrate Timing
                </button>
              </div>
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

      {/* Quick Edit Mode */}
      {state.editMode === 'quickEdit' && state.selectedPattern && (
        <QuickEditInterface
          pattern={state.selectedPattern}
          onSave={(newTimings) => {
            try {
              const updatedPatterns = updatePattern(
                state.selectedPhase,
                state.selectedPattern!.id,
                newTimings
              );
              
              const updatedPattern = updatedPatterns[state.selectedPhase]
                .find(p => p.id === state.selectedPattern!.id)!;
              
              setState(prev => ({
                ...prev,
                patterns: updatedPatterns,
                selectedPattern: updatedPattern,
                editMode: 'view',
                hasUnsavedChanges: true
              }));

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
          onCancel={() => {
            setState(prev => ({
              ...prev,
              editMode: 'view'
            }));
          }}
        />
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
