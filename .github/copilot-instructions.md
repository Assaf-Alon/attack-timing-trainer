# Repository Overview: Boss Attack Timing Trainer

## Purpose
This is a React + TypeScript web application designed for practicing precise keypress timings based on boss attack patterns. The application helps users train their timing accuracy for hitting specific moments in attack sequences.

## Key Features
- **Simon Pattern Training**: Predefined attack patterns for Phase 1 and Phase 2 bosses (TODO: Phase 3)
- **Precise Timing System**: Uses Web Audio API for low-latency audio cues and performance.now() for accurate timing
- **Real-time Feedback**: Visual timeline with live playhead showing hit/miss indicators
- **Customizable Settings**: Adjustable playback speed, tolerance windows, and pre-roll delays
- **Performance Analytics**: Per-event accuracy tracking, summary statistics, and CSV export
- **Manual Input**: Support for custom timing configurations via text area

## Architecture

### Tech Stack
- **React 18** with TypeScript for the UI framework
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling and responsive design
- **Web Audio API** for precise click sound generation
- **Performance API** for accurate timing measurements


### Core Components

#### `SimonSimulator.tsx`
Main orchestrator component that:
- Manages events, presses, and playback options state
- Handles spacebar keypress detection during playback
- Coordinates between all child components
- Implements the core timing matching logic with tolerance windows

#### `usePlayback.ts` Hook
Custom hook that drives the playback system:
- Manages Web Audio context for click sounds
- Handles timing loop with requestAnimationFrame
- Provides start/stop/reset functionality
- Calculates adjusted time based on speed and pre-roll settings
- Auto-stops playback after last event

#### `Feedback.tsx`
Results and analytics component:
- Displays per-event accuracy with hit/miss indicators
- Shows summary statistics (accuracy %, average error, hits ratio)
- Provides CSV export functionality for detailed analysis
- Real-time updates as events are played

### Data Flow

1. **Input**: User selects Simon patterns or enters manual timings
2. **Parsing**: Timing strings are parsed into Event objects with IDs and timestamps
3. **Playback**: usePlayback hook manages audio clicks and time progression
4. **Input Capture**: Spacebar presses are captured and matched to nearest unmatched events
5. **Feedback**: Results are calculated and displayed in real-time
6. **Export**: Detailed results can be exported as CSV for analysis

### Simon Patterns

The application includes predefined patterns for:

**Phase 1 Patterns:**
- Short Combo: 4 events over ~4.6 seconds
- Powerful Combo: 3 events over ~2.2 seconds  
- Punch Combo: 5 events over ~6.7 seconds
- Long Combo: 6 events over ~5.1 seconds

**Phase 2 Patterns:**
- TODO

### Configuration Options

- **Playback Speed**: 0.5x to 2.0x multiplier for practice at different speeds
- **Tolerance Window**: Configurable millisecond window for hit detection
- **Pre-roll Delay**: Countdown time before events start

### Timing Logic

The core timing system:
1. Uses performance.now() for high-precision timestamps
2. Matches keypresses to the closest unmatched event within tolerance
3. Calculates delta time between expected and actual press
4. Marks presses as matched/unmatched based on tolerance window
5. Prevents double-matching of events

### Key Files to Understand
1. `SimonSimulator.tsx` - Main component with core logic
2. `usePlayback.ts` - Timing and audio system
3. `types.ts` - Data structure definitions
4. `Feedback.tsx` - Results display logic

### Notes
This codebase follows React best practices with TypeScript, uses modern hooks patterns, and maintains clear separation of concerns between UI, timing, and data management.
