# Project: Boss Attack Timing Trainer

A React + TypeScript web app for practicing precise keypress timings based on a list of event timestamps.

## Tech stack

* **React** with TypeScript
* **Vite** (preferred) or CRA for project setup
* **Tailwind CSS** for simple, elegant styling
* **Web Audio API** for precise click sounds

---

## File & Directory Structure

```
src/
  App.tsx
  index.tsx
  components/
    FileLoader.tsx
    Timeline.tsx
    Controls.tsx
    Feedback.tsx
  hooks/
    usePlayback.ts
  utils/
    parseFile.ts
  types.ts
```

---

## File responsibilities

### `src/App.tsx`

* Root component.
* Holds global state:

  * `events: Event[]` (parsed from patterns or manual input)
  * `results: Press[]` (keypress results for the current run)
* Renders:

  * `<TimingInput />` for pattern selection and manual timing input
  * `<Controls />` to start/stop/reset playback
  * `<Timeline />` to visualize event markers and live playhead
  * `<Feedback />` to show per-event accuracy stats

### `src/index.tsx`

* Standard ReactDOM render for `<App />`.

---

### `src/components/FileLoader.tsx`

* UI: Pattern selector with phase tabs and preset buttons, plus manual timing text input.
* Loads predefined simon patterns or parses manual text input into array of floats.
* Passes parsed `Event[]` up via a prop callback.t web app for practicing precise keypress timings based on a list of event timestamps.

---

### `src/components/Controls.tsx`

* Buttons for Play, Pause, Reset.
* Inputs for:

  * playback speed (default 1.0x, range 0.5–2.0x)
  * tolerance window (ms)
  * pre-roll delay (seconds)
* Exposes callbacks to App.

---

### `src/components/Timeline.tsx`

* Displays:

  * horizontal timeline with markers for each event time
  * moving playhead that updates during playback
  * press markers when user presses a key
* Visual feedback (color markers for hit/miss).

---

### `src/components/Feedback.tsx`

* Displays per-event results:

  * event time
  * delta of best press in ms
  * whether it was within tolerance
* Shows summary stats: mean error, % within tolerance.
* Export button: downloads CSV file of results.

---

### `src/hooks/usePlayback.ts`

* Custom hook that drives the playback loop.
* API:

  ```ts
  const { start, stop, reset, now } = usePlayback(events, options)
  ```
* Responsibilities:

  * Start playback from t=0 with pre-roll.
  * Keep track of elapsed time (`now`).
  * Trigger Web Audio click when an event is reached.
  * Handle speed multiplier.
  * Manage `requestAnimationFrame` loop.

---

### `src/utils/parseFile.ts`

* Function to parse raw `.txt` into array of floats.
* Ignore empty lines and comments (`#`).
* Return sorted times.
* Signature:

  ```ts
  export function parseFile(text: string): number[]
  ```

---

### `src/types.ts`

* Common TypeScript types:

  ```ts
  export type Event = { id: number; time: number }  
  export type Press = { eventId: number | null; time: number; delta: number; matched: boolean }  
  ```

---

## App Behavior

1. **Pattern input**: user selects predefined pattern or enters manual timings, parsed into `events`.
   Example file contents:

   ```
   2.11
   2.67
   3.05
   5.00
   8.23
   ```

2. **Playback**:

   * User presses Play.
   * App waits for optional pre-roll delay.
   * `usePlayback` tracks elapsed time.
   * For each event time, app plays a short audio click and updates `<Timeline />`.

3. **Key press capture**:

   * Global listener for Space key (default).
   * On press, record actual time.
   * Match press to nearest unmatched event within tolerance window.
   * Store delta (press - expected).

4. **Feedback**:

   * After each press, show delta in `<Feedback />`.
   * End of run: show summary stats and per-event results.

5. **Repeat loop**:

   * Reset button to restart run.
   * Optional: loop a segment (future enhancement).

6. **Export**:

   * User can download CSV with columns:

     ```
     event_id,event_time,press_time,delta_ms,matched
     ```

---

## Stretch Goals (optional, for later)

* Loop over a single attack or segment repeatedly.
* Visual calibration test (measure press latency offset).
* Tap-tempo mode (enter your own timings).
* Sync events to background music.

---

## Notes for Copilot

* Keep UI simple but clean; use Tailwind for layout & styling.
* Use Web Audio API for low-latency clicks (`AudioContext`).
* Use `performance.now()` for timing, not `Date.now()`.
* Timeline and Feedback must update in real-time via `requestAnimationFrame`.
* Focus first on *minimal viable version*:

  * Select pattern → Play → Spacebar presses → Show deltas.
