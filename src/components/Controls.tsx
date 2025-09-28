import type { PlaybackOptions } from '../types';

interface ControlsProps {
  isPlaying: boolean;
  options: PlaybackOptions;
  hasError: boolean;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  onOptionsChange: (options: PlaybackOptions) => void;
}

export function Controls({
  isPlaying,
  options,
  hasError,
  onPlay,
  onStop,
  onReset,
  onOptionsChange,
}: ControlsProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Controls</h2>
      
      {/* Playback buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={isPlaying ? onStop : onPlay}
          disabled={!isPlaying && hasError}
          title={hasError && !isPlaying ? 'Please fix the timing input errors before playing' : ''}
          className={`px-4 py-2 rounded font-medium ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : hasError
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </button>
        
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"
        >
          Reset
        </button>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tolerance Window (ms)
          </label>
          <input
            type="number"
            min="10"
            max="500"
            value={options.toleranceMs}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                toleranceMs: parseInt(e.target.value) || 100,
              })
            }
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pre-roll Delay (seconds)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.5"
            value={options.preRollSeconds}
            onChange={(e) =>
              onOptionsChange({
                ...options,
                preRollSeconds: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>
    </div>
  );
}
