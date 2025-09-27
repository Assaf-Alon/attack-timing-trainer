import { useCallback, useEffect, useState } from 'react';
import { TimingInput } from './FileLoader';
import { Controls } from './Controls';
import { Timeline } from './Timeline';
import { Feedback } from './Feedback';
import { usePlayback } from '../hooks/usePlayback';
import type { Event, Press, PlaybackOptions } from '../types';

export function SimonSimulator() {
  const [events, setEvents] = useState<Event[]>([]);
  const [presses, setPresses] = useState<Press[]>([]);
  const [options, setOptions] = useState<PlaybackOptions>({
    speed: 1.0,
    toleranceMs: 50,
    preRollSeconds: 3.0,
  });

  const { start, stop, reset, now, isPlaying } = usePlayback(events, options);

  // Calculate timeline duration (add 2 seconds after the last event for auto-stop)
  const duration = events.length > 0 ? Math.max(...events.map(e => e.time)) + 2 : 10;

  // Handle space key presses
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && isPlaying) {
      event.preventDefault();
      
      const pressTime = now;
      let bestMatch: { event: Event; delta: number } | null = null;
      
      // Find the closest unmatched event within tolerance
      for (const eventItem of events) {
        if (presses.some(p => p.eventId === eventItem.id && p.matched)) {
          continue; // Skip already matched events
        }
        
        const delta = (pressTime - eventItem.time) * 1000; // Convert to ms
        if (Math.abs(delta) <= options.toleranceMs) {
          if (!bestMatch || Math.abs(delta) < Math.abs(bestMatch.delta)) {
            bestMatch = { event: eventItem, delta };
          }
        }
      }

      const newPress: Press = {
        eventId: bestMatch?.event.id ?? null,
        time: pressTime,
        delta: bestMatch?.delta ?? 0,
        matched: bestMatch !== null,
      };

      setPresses(prev => [...prev, newPress]);
    }
  }, [isPlaying, now, events, presses, options.toleranceMs]);

  // Set up keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Reset presses when starting new playback
  const handlePlay = () => {
    setPresses([]);
    start();
  };

  const handleReset = () => {
    reset();
    setPresses([]);
  };

  return (
    <div>
      <div className="grid gap-6">
        {/* Timing Input */}
        <TimingInput onEventsLoaded={setEvents} />
        
        {/* Controls */}
        <Controls
          isPlaying={isPlaying}
          options={options}
          onPlay={handlePlay}
          onStop={stop}
          onReset={handleReset}
          onOptionsChange={setOptions}
        />
        
        {/* Timeline */}
        {events.length > 0 && (
          <Timeline
            events={events}
            presses={presses}
            currentTime={now}
            duration={duration}
          />
        )}
        
        {/* Feedback */}
        <Feedback
          presses={presses}
          events={events}
          toleranceMs={options.toleranceMs}
        />
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
        <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
          <li>Select simon phase (Phase 1 or Phase 2) and choose a pattern, or manually enter timings</li>
          <li>Adjust playback speed, tolerance window, and pre-roll delay as needed</li>
          <li>Click Play and wait for the pre-roll countdown</li>
          <li>Press SPACEBAR when you hear each click sound</li>
          <li>View your timing accuracy in real-time and export results as CSV</li>
        </ol>
      </div>
    </div>
  );
}
