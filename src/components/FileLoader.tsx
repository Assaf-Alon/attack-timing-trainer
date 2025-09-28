import { useState, useEffect } from 'react';
import { parseFile } from '../utils/parseFile';
import { loadSimonPatterns, type BossPhase, type AttackPattern, type SimonPatterns } from '../utils/patternLoader';
import type { Event } from '../types';

interface TimingInputProps {
  onEventsLoaded: (events: Event[]) => void;
  onErrorChange: (error: string | null) => void;
  onVideoChange: (videoPath: string | null) => void;
}

export function TimingInput({ onEventsLoaded, onErrorChange, onVideoChange }: TimingInputProps) {
  const [currentPhase, setCurrentPhase] = useState<BossPhase>('phase1');
  const [patterns, setPatterns] = useState<SimonPatterns | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);

  // Load patterns on component mount and set up refresh listener
  useEffect(() => {
    const loadPatternsData = () => {
      try {
        const loadedPatterns = loadSimonPatterns();
        setPatterns(loadedPatterns);
      } catch (error) {
        console.error('Failed to load patterns:', error);
        onErrorChange('Failed to load attack patterns');
      }
    };

    loadPatternsData();

    // Listen for pattern updates (custom event)
    const handlePatternUpdate = () => {
      loadPatternsData();
    };

    window.addEventListener('patternUpdated', handlePatternUpdate);
    return () => window.removeEventListener('patternUpdated', handlePatternUpdate);
  }, []);

  const handlePhaseChange = (phase: BossPhase) => {
    setCurrentPhase(phase);
    setSelectedPatternId(null); // Clear selected pattern when changing phase
    onVideoChange(null); // Notify parent that video is cleared
  };

  const loadPattern = (pattern: AttackPattern) => {
    const timingText = pattern.timings.join('\n');
    setSelectedPatternId(pattern.id); // Set the selected pattern
    onVideoChange(pattern.videoPath); // Notify parent of video change
    onErrorChange(null); // Notify parent that error is cleared
    parseAndLoadEvents(timingText);
  };

  const parseAndLoadEvents = (text: string) => {
    try {
      const times = parseFile(text);
      const events: Event[] = times.map((time, index) => ({
        id: index,
        time,
      }));
      
      onErrorChange(null); // Notify parent that error is cleared
      onEventsLoaded(events);
    } catch (error) {
      console.error('Error parsing timings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error parsing timings. Please check the format.';
      onErrorChange(errorMessage); // Notify parent of the error
      onEventsLoaded([]); // Clear events when there's an error
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Simon Timing Configuration</h2>
      
      {/* Phase Selection */}
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Simon Phase</h3>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="phase"
              value="phase1"
              checked={currentPhase === 'phase1'}
              onChange={() => handlePhaseChange('phase1')}
              className="mr-2"
            />
            Phase 1
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="phase"
              value="phase2"
              checked={currentPhase === 'phase2'}
              onChange={() => handlePhaseChange('phase2')}
              className="mr-2"
            />
            Phase 2
          </label>
        </div>
      </div>

      {/* Simon Pattern Buttons */}
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">
          {currentPhase === 'phase1' ? 'Phase 1 Patterns' : 'Phase 2 Patterns'}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {patterns ? patterns[currentPhase].map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => loadPattern(pattern)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                selectedPatternId === pattern.id
                  ? 'bg-blue-600 text-white ring-2 ring-blue-300 shadow-md'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
              }`}
            >
              {pattern.name}
              {selectedPatternId === pattern.id && (
                <span className="ml-1 text-xs">✓</span>
              )}
            </button>
          )) : (
            <div className="col-span-2 text-center text-gray-500 py-4">
              Loading patterns...
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Select a simon pattern above to load the timing configuration.
      </p>
    </div>
  );
}
