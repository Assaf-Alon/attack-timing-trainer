# Boss Attack Timing Trainer

A React + TypeScript web application for practicing precise keypress timings based on boss attack patterns.

## Features

- **Simon Patterns**: Predefined simon patterns for Phase 1 and Phase 2 with quick-load buttons
- **Manual Timing Input**: Text area for custom timing configurations
- **Precise Timing**: Uses Web Audio API for low-latency click sounds and `performance.now()` for accurate timing
- **Real-time Feedback**: Visual timeline showing your keypresses vs expected events
- **Customizable Settings**: 
  - Tolerance window (configurable in ms)
  - Pre-roll delay
- **Performance Analytics**: 
  - Per-event accuracy tracking
  - Summary statistics (accuracy %, average error)
  - CSV export of results
- **Visual Timeline**: Live playhead with color-coded hit/miss markers

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Usage

1. **Select Simon Pattern**: 
   - Choose between Phase 1 and Phase 2 using radio buttons
   - Click on predefined simon patterns to load their timings
   - Or manually enter custom timings in the text area
   - Format: One timestamp per line (in seconds)
   - Comments starting with `#` are ignored

2. **Configure Settings**: 
   - Set tolerance window (how precise you need to be)
   - Configure pre-roll delay (countdown before events start)

3. **Practice**: 
   - Click "Play" to start
   - Wait for pre-roll countdown
   - Press SPACEBAR when you hear each click sound
   - Watch real-time feedback on the timeline

4. **Review Results**: 
   - Check your accuracy in the Results panel
   - Export detailed CSV for analysis

## Simon Patterns

The application includes predefined simon patterns for two phases:

**Phase 1 Patterns:**
- Melee Combo
- Short Combo (phase 1) 
- Long Combo (phase 1)
- Powerful Combo (phase 1)

**Phase 2 Patterns:**
- Lightspeed Combo
- Sword of Lumiere
- Short Combo (phase 2)
- Long Combo (phase 2) 
- Powerful Combo (phase 2)

You can also manually enter custom timings in the text area. Format should be one timestamp per line:

```
# Comments start with #
1.01
2.02  
3.03
4.04
```

Times are in seconds from the start of playback.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling  
- **Web Audio API** for precise click sounds
- **Performance API** for accurate timing

## Architecture

- `src/App.tsx` - Main application component and state management
- `src/components/` - UI components (TimingInput, Controls, Timeline, Feedback)
- `src/hooks/usePlayback.ts` - Custom hook for playback timing and audio
- `src/utils/parseFile.ts` - File parsing utilities
- `src/types.ts` - TypeScript type definitions
