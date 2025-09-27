import { useState, useEffect } from 'react';
import { loadSimonPatterns, updatePattern, resetPatternsToDefault, exportPatternsToFile, type BossPhase, type AttackPattern, type SimonPatterns } from '../utils/patternLoader';

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

  const handleExportPatterns = () => {
    try {
      const jsonString = exportPatternsToFile();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'simon-patterns-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to export patterns'
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
          
          <div className="flex gap-2">
            <button
              onClick={handleExportPatterns}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors"
            >
              Export Backup
            </button>
            <button
              onClick={handleResetToDefaults}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>

        {state.error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
            <p className="text-red-700 text-sm">{state.error}</p>
          </div>
        )}

        {state.hasUnsavedChanges && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
            <p className="text-yellow-700 text-sm">
              ⚠️ You have unsaved changes. They are automatically saved to local storage.
            </p>
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
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                state.selectedPattern?.id === pattern.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <h4 className="font-medium">{pattern.name}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {pattern.timings.length} events • {pattern.timings[pattern.timings.length - 1].toFixed(2)}s duration
              </p>
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

// Placeholder components that we'll implement next
function CalibrationInterface({ 
  pattern, 
  onComplete, 
  onCancel 
}: { 
  pattern: AttackPattern;
  onComplete: (timings: number[]) => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">🎯 Calibration Mode</h3>
      <p className="text-gray-600 mb-4">
        This feature is coming soon! It will allow you to:
      </p>
      <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
        <li>Watch the attack pattern video</li>
        <li>Press spacebar to capture your timing</li>
        <li>Compare your captured timing with the original</li>
      </ul>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
        >
          Back to View
        </button>
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
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">⚙️ Timing Adjustment</h3>
      <p className="text-gray-600 mb-4">
        This feature is coming soon! It will allow you to:
      </p>
      <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
        <li>Compare original vs captured timings</li>
        <li>Apply global offset adjustments</li>
        <li>Fine-tune individual event timings</li>
        <li>Preview changes before saving</li>
      </ul>
      <div className="flex gap-2">
        <button
          onClick={onDiscard}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
        >
          Discard
        </button>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium transition-colors"
        >
          Retry Calibration
        </button>
      </div>
    </div>
  );
}
