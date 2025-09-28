import { useCallback, useEffect, useState, useRef } from 'react';
import { TimingInput } from './FileLoader';
import { Controls } from './Controls';
import { Timeline } from './Timeline';
import { Feedback } from './Feedback';
import { usePlayback } from '../hooks/usePlayback';
import type { Event, Press, PlaybackOptions } from '../types';

export function SimonSimulator() {
  const [events, setEvents] = useState<Event[]>([]);
  const [presses, setPresses] = useState<Press[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);
  const [currentVideoPath, setCurrentVideoPath] = useState<string | null>(null);
  const [options, setOptions] = useState<PlaybackOptions>({
    toleranceMs: 100,
    preRollSeconds: 1.0,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const { start, stop, reset, now, isPlaying } = usePlayback(events, options);

  // Calculate timeline duration (add 2 seconds after the last event for auto-stop)
  const duration = events.length > 0 ? Math.max(...events.map(e => e.time)) + 2 : 10;

  // Handle space key presses
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && isPlaying) {
      event.preventDefault();
      
      const pressTime = now;
      let bestMatch: { event: Event; delta: number } | null = null;
      let nearestEvent: { event: Event; delta: number } | null = null;
      
      // Find the closest unmatched event within tolerance, and also track the nearest event overall
      for (const eventItem of events) {
        if (presses.some(p => p.eventId === eventItem.id && p.matched)) {
          continue; // Skip already matched events
        }
        
        const delta = (pressTime - eventItem.time) * 1000; // Convert to ms
        
        // Track nearest event regardless of tolerance for miss feedback
        if (!nearestEvent || Math.abs(delta) < Math.abs(nearestEvent.delta)) {
          nearestEvent = { event: eventItem, delta };
        }
        
        // Check if within tolerance for matching
        if (Math.abs(delta) <= options.toleranceMs) {
          if (!bestMatch || Math.abs(delta) < Math.abs(bestMatch.delta)) {
            bestMatch = { event: eventItem, delta };
          }
        }
      }

      const newPress: Press = {
        eventId: bestMatch?.event.id ?? nearestEvent?.event.id ?? null,
        time: pressTime,
        delta: bestMatch?.delta ?? nearestEvent?.delta ?? 0,
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

  // Synchronize video with playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideoPath) return;

    if (isPlaying && now >= 0) {
      // Timeline has started (after pre-roll delay)
      const videoTime = now;
      
      // Only sync if there's a significant difference (avoid constant adjustments)
      const timeDiff = Math.abs(video.currentTime - videoTime);
      if (timeDiff > 0.1) {
        video.currentTime = videoTime;
      }
      
      // Start video playback
      if (video.paused) {
        video.playbackRate = 1.0;
        video.play().catch(console.error);
      }
    } else if (isPlaying && now < 0) {
      // Pre-roll period - keep video paused at start
      video.currentTime = 0;
      if (!video.paused) {
        video.pause();
      }
    } else if (!isPlaying) {
      // Playback stopped - pause video
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isPlaying, now, currentVideoPath]);

  // Reset video when playback resets
  useEffect(() => {
    const video = videoRef.current;
    if (video && !isPlaying && now === 0) {
      video.currentTime = 0;
      video.playbackRate = 1.0;
    }
  }, [isPlaying, now]);

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
        <TimingInput 
          onEventsLoaded={setEvents} 
          onErrorChange={setInputError}
          onVideoChange={setCurrentVideoPath}
        />
        
        {/* Video Display */}
        {currentVideoPath && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Attack Pattern Video</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex justify-center">
                <video
                  ref={videoRef}
                  key={currentVideoPath}
                  src={currentVideoPath}
                  preload="metadata"
                  className="rounded-lg shadow-md max-w-full h-auto"
                  style={{ maxHeight: '400px', maxWidth: '100%' }}
                  onError={() => console.error('Error loading video:', currentVideoPath)}
                  onLoadedMetadata={() => {
                    // Ensure video starts at the beginning when loaded
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                  onEnded={() => {
                    // Loop video if timeline is still running
                    if (isPlaying && now >= 0 && videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.play().catch(console.error);
                    }
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-sm text-gray-600 text-center mt-3">
                📹 {isPlaying 
                  ? (now < 0 
                    ? `Video will start in ${Math.abs(now).toFixed(1)}s` 
                    : 'Video synced with timeline')
                  : 'Video will sync with timeline when you press Play'}
              </p>
            </div>
          </div>
        )}
        
        {/* Timeline */}
        {events.length > 0 && (
          <Timeline
            events={events}
            presses={presses}
            currentTime={now}
            duration={duration}
          />
        )}
        
        {/* Controls */}
        <Controls
          isPlaying={isPlaying}
          options={options}
          hasError={inputError !== null}
          onPlay={handlePlay}
          onStop={stop}
          onReset={handleReset}
          onOptionsChange={setOptions}
        />
        
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
          <li>Adjust tolerance window and pre-roll delay as needed</li>
          <li>Click Play and wait for the pre-roll countdown</li>
          <li>Press SPACEBAR when you hear each click sound</li>
          <li>View your timing accuracy in real-time and export results as CSV</li>
        </ol>
      </div>
    </div>
  );
}
