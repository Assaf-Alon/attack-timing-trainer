import { useState, useEffect } from 'react';
import { parseFile } from '../utils/parseFile';
import { loadSimonPatterns, toLegacyAttackPattern, type BossPhase, type AttackPattern, type SimonPatterns } from '../utils/patternLoader';
import type { Event } from '../types';

interface TimingInputProps {
  onEventsLoaded: (events: Event[]) => void;
  onErrorChange: (error: string | null) => void;
  onVideoChange: (videoPath: string | null) => void;
}

export function TimingInput({ onEventsLoaded, onErrorChange, onVideoChange }: TimingInputProps) {
  const [currentPhase, setCurrentPhase] = useState<BossPhase>('phase1');
  const [timingText, setTimingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<SimonPatterns | null>(null);

  // Load patterns on component mount
  useEffect(() => {
    try {
      const loadedPatterns = loadSimonPatterns();
      setPatterns(loadedPatterns);
    } catch (error) {
      console.error('Failed to load patterns:', error);
      setError('Failed to load attack patterns');
    }
  }, []);

  const handlePhaseChange = (phase: BossPhase) => {
    setCurrentPhase(phase);
    onVideoChange(null); // Notify parent that video is cleared
  };

  const loadPattern = (pattern: AttackPattern) => {
    const legacyPattern = toLegacyAttackPattern(pattern);
    setTimingText(legacyPattern.timings);
    onVideoChange(pattern.videoPath); // Notify parent of video change
    setError(null); // Clear any errors when loading a pattern
    onErrorChange(null); // Notify parent that error is cleared
    parseAndLoadEvents(legacyPattern.timings);
  };

  const parseAndLoadEvents = (text: string) => {
    try {
      const times = parseFile(text);
      const events: Event[] = times.map((time, index) => ({
        id: index,
        time,
      }));
      
      setError(null); // Clear any previous errors
      onErrorChange(null); // Notify parent that error is cleared
      onEventsLoaded(events);
    } catch (error) {
      console.error('Error parsing timings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error parsing timings. Please check the format.';
      setError(errorMessage);
      onErrorChange(errorMessage); // Notify parent of the error
      onEventsLoaded([]); // Clear events when there's an error
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    setTimingText(text);
    onVideoChange(null); // Notify parent that video is cleared
    parseAndLoadEvents(text);
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
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium transition-colors"
            >
              {pattern.name}
            </button>
          )) : (
            <div className="col-span-2 text-center text-gray-500 py-4">
              Loading patterns...
            </div>
          )}
        </div>
      </div>

      {/* Timing Text Area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Simon Timings (seconds, one per line)
        </label>
        <textarea
          value={timingText}
          onChange={handleTextChange}
          placeholder="Enter simon timings in seconds, one per line:&#10;1.01&#10;2.02&#10;3.03"
          className={`w-full h-32 p-3 border rounded-md text-sm font-mono resize-vertical ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {error && (
          <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Invalid Input</h3>
                <div className="mt-1 text-sm text-red-700 whitespace-pre-line">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Select a simon pattern above or manually enter timing values. Comments starting with # are ignored.
      </p>
    </div>
  );
}
