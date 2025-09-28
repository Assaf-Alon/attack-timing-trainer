import { useState } from 'react';
import type { QuickEditInterfaceProps } from './types';
import { GlobalOffsetControl } from '../GlobalOffsetControl';
import { TimingComparisonTable } from '../TimingComparisonTable';

export function QuickEditInterface({ 
  pattern, 
  onSave, 
  onCancel 
}: QuickEditInterfaceProps) {
  const [editedTimings, setEditedTimings] = useState<number[]>(pattern.timings);

  const handleGlobalOffset = (newTimings: number[]) => {
    setEditedTimings(newTimings);
  };

  const handleIndividualTimingChange = (index: number, value: number) => {
    const newTimings = [...editedTimings];
    newTimings[index] = Math.max(0, value);
    
    // Ensure timings remain in ascending order
    for (let i = 0; i < newTimings.length - 1; i++) {
      if (newTimings[i] >= newTimings[i + 1]) {
        newTimings[i + 1] = newTimings[i] + 0.01;
      }
    }
    
    setEditedTimings(newTimings);
  };

  const handleSave = () => {
    onSave(editedTimings);
  };

  const hasChanges = editedTimings.some((timing, index) => 
    Math.abs(timing - pattern.timings[index]) > 0.001
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">⚙️ Quick Edit - {pattern.name}</h3>
        <p className="text-gray-600">
          Apply global offset or manually adjust individual timings without calibration.
        </p>
      </div>

      {/* Global Offset Control */}
      <GlobalOffsetControl
        timings={pattern.timings}
        onTimingsChange={handleGlobalOffset}
        label="Global Offset"
        className=""
      />

      {/* Timing Comparison Table */}
      <div>
        <h4 className="font-medium mb-3">Timing Details:</h4>
        <TimingComparisonTable
          originalTimings={pattern.timings}
          currentTimings={editedTimings}
          onTimingChange={handleIndividualTimingChange}
          editable={true}
        />
      </div>

      {/* Summary Stats */}
      {hasChanges && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Summary:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Average Change:</span>
              <div className="font-mono">
                {(editedTimings.reduce((sum, timing, index) => 
                  sum + Math.abs(timing - pattern.timings[index]), 0) / editedTimings.length
                ).toFixed(3)}s
              </div>
            </div>
            <div>
              <span className="text-gray-600">Max Change:</span>
              <div className="font-mono">
                {Math.max(...editedTimings.map((timing, index) => 
                  Math.abs(timing - pattern.timings[index])
                )).toFixed(3)}s
              </div>
            </div>
            <div>
              <span className="text-gray-600">Total Duration:</span>
              <div className="font-mono">
                {editedTimings[editedTimings.length - 1].toFixed(3)}s
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          💾 Save Changes
        </button>
      </div>
    </div>
  );
}
