import { useState, useEffect } from 'react';

interface GlobalOffsetControlProps {
  timings: number[];
  onTimingsChange: (newTimings: number[]) => void;
  className?: string;
  suggestedOffset?: number;
  label?: string;
}

export function GlobalOffsetControl({
  timings,
  onTimingsChange,
  className = '',
  suggestedOffset = 0,
  label = 'Global Offset'
}: GlobalOffsetControlProps) {
  const [offset, setOffset] = useState<number>(0);

  // Apply offset to timings
  const applyOffset = (newOffset: number) => {
    const offsetTimings = timings.map(t => Math.max(0, t + newOffset));
    setOffset(newOffset);
    onTimingsChange(offsetTimings);
  };

  // Reset to original timings when component mounts or timings change externally
  useEffect(() => {
    setOffset(0);
  }, [timings]);

  return (
    <div className={`p-4 bg-blue-50 rounded-lg ${className}`}>
      <label className="block font-medium text-blue-900 mb-2">
        {label} (seconds):
      </label>
      
      <div className="flex items-center space-x-3 mb-3">
        <input
          type="range"
          min={-5}
          max={5}
          step={0.001}
          value={offset}
          onChange={(e) => applyOffset(Number(e.target.value))}
          className="flex-1"
        />
        <input
          type="number"
          step={0.001}
          value={offset.toFixed(3)}
          onChange={(e) => applyOffset(Number(e.target.value))}
          className="w-24 px-2 py-1 border border-gray-300 rounded text-center font-mono"
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-blue-700">
          {offset >= 0 ? '+' : ''}{offset.toFixed(3)}s applied to all timings
        </span>
        
        {suggestedOffset !== 0 && (
          <button
            onClick={() => applyOffset(suggestedOffset)}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded font-medium transition-colors"
          >
            Apply Suggested ({suggestedOffset >= 0 ? '+' : ''}{suggestedOffset.toFixed(3)}s)
          </button>
        )}
      </div>
    </div>
  );
}
