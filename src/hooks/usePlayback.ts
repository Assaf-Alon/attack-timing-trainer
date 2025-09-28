import { useCallback, useEffect, useRef, useState } from 'react';
import type { Event, PlaybackOptions, PlaybackState } from '../types';

/**
 * Custom hook that drives the playback loop.
 * Manages timing, audio clicks, and playback state.
 */
export function usePlayback(events: Event[], options: PlaybackOptions) {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    now: 0,
  });

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playedEventsRef = useRef<Set<number>>(new Set());

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play a click sound using Web Audio API
  const playClick = useCallback(() => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }, []);

  // Animation loop
  const tick = useCallback(() => {
    if (!state.isPlaying) return;

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const adjustedTime = elapsed - options.preRollSeconds;
    
    setState(prev => ({ ...prev, now: adjustedTime }));

    // Check for events to play
    events.forEach(event => {
      if (
        adjustedTime >= event.time && 
        !playedEventsRef.current.has(event.id)
      ) {
        playClick();
        playedEventsRef.current.add(event.id);
      }
    });

    // Auto-stop 2 seconds after the last event
    const lastEventTime = events.length > 0 ? Math.max(...events.map(e => e.time)) : 0;
    if (adjustedTime >= lastEventTime + 2) {
      setState(prev => ({ ...prev, isPlaying: false }));
      return;
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [state.isPlaying, events, options, playClick]);

  // Start playback
  const start = useCallback(() => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    startTimeRef.current = performance.now();
    playedEventsRef.current.clear();
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  // Stop playback
  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Reset playback
  const reset = useCallback(() => {
    stop();
    playedEventsRef.current.clear();
    setState({ isPlaying: false, now: 0 });
  }, [stop]);

  // Start animation loop when playing
  useEffect(() => {
    if (state.isPlaying) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isPlaying, tick]);

  return {
    start,
    stop,
    reset,
    now: state.now,
    isPlaying: state.isPlaying,
  };
}
