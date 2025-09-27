import { useState } from 'react';
import { parseFile } from '../utils/parseFile';
import type { Event } from '../types';

type BossPhase = 'phase1' | 'phase2';

interface AttackPattern {
  name: string;
  timings: string;
}

const ATTACK_PATTERNS: Record<BossPhase, AttackPattern[]> = {
  phase1: [
    { name: 'Melee Combo', timings: '1.01\n2.02\n3.03' },
    { name: 'Short Combo (phase 1)', timings: '1.01\n2.02' },
    { name: 'Long Combo (phase 1)', timings: '1.01\n2.02\n3.03\n4.04\n5.05' },
    { name: 'Powerful Combo (phase 1)', timings: '1.01\n3.03\n5.05\n7.07' },
  ],
  phase2: [
    { name: 'Lightspeed Combo', timings: '1.01\n1.51\n2.01\n2.51' },
    { name: 'Sword of Lumiere', timings: '1.01\n2.02\n3.03\n4.04\n6.06' },
    { name: 'Short Combo (phase 2)', timings: '1.01\n1.81' },
    { name: 'Long Combo (phase 2)', timings: '1.01\n1.81\n2.61\n3.41\n4.21' },
    { name: 'Powerful Combo (phase 2)', timings: '1.01\n2.52\n4.03\n5.54' },
  ],
};

interface TimingInputProps {
  onEventsLoaded: (events: Event[]) => void;
}

export function TimingInput({ onEventsLoaded }: TimingInputProps) {
  const [currentPhase, setCurrentPhase] = useState<BossPhase>('phase1');
  const [timingText, setTimingText] = useState('');

  const handlePhaseChange = (phase: BossPhase) => {
    setCurrentPhase(phase);
  };

  const loadPattern = (pattern: AttackPattern) => {
    setTimingText(pattern.timings);
    parseAndLoadEvents(pattern.timings);
  };

  const parseAndLoadEvents = (text: string) => {
    try {
      const times = parseFile(text);
      const events: Event[] = times.map((time, index) => ({
        id: index,
        time,
      }));
      
      onEventsLoaded(events);
    } catch (error) {
      console.error('Error parsing timings:', error);
      alert('Error parsing timings. Please check the format.');
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    setTimingText(text);
    if (text.trim()) {
      parseAndLoadEvents(text);
    } else {
      onEventsLoaded([]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Attack Timing Configuration</h2>
      
      {/* Phase Selection */}
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">Boss Phase</h3>
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

      {/* Attack Pattern Buttons */}
      <div className="mb-4">
        <h3 className="text-md font-medium mb-2">
          {currentPhase === 'phase1' ? 'Phase 1 Attacks' : 'Phase 2 Attacks'}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ATTACK_PATTERNS[currentPhase].map((pattern) => (
            <button
              key={pattern.name}
              onClick={() => loadPattern(pattern)}
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium transition-colors"
            >
              {pattern.name}
            </button>
          ))}
        </div>
      </div>

      {/* Timing Text Area */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Attack Timings (seconds, one per line)
        </label>
        <textarea
          value={timingText}
          onChange={handleTextChange}
          placeholder="Enter attack timings in seconds, one per line:&#10;1.01&#10;2.02&#10;3.03"
          className="w-full h-32 p-3 border border-gray-300 rounded-md text-sm font-mono resize-vertical"
        />
      </div>

      <p className="text-sm text-gray-600">
        Select an attack pattern above or manually enter timing values. Comments starting with # are ignored.
      </p>
    </div>
  );
}
