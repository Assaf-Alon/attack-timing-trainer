interface TimingComparisonTableProps {
  originalTimings: number[];
  currentTimings: number[];
  capturedTimings?: number[];
  onTimingChange?: (index: number, value: number) => void;
  editable?: boolean;
  className?: string;
}

export function TimingComparisonTable({
  originalTimings,
  currentTimings,
  capturedTimings,
  onTimingChange,
  editable = false,
  className = ''
}: TimingComparisonTableProps) {
  const handleTimingChange = (index: number, value: number) => {
    if (onTimingChange) {
      // Ensure timing is positive and maintain order
      const clampedValue = Math.max(0, value);
      onTimingChange(index, clampedValue);
    }
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse bg-gray-50 rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2 text-left">Event</th>
            <th className="border border-gray-300 px-3 py-2 text-center">Original</th>
            {capturedTimings && (
              <th className="border border-gray-300 px-3 py-2 text-center">Captured</th>
            )}
            <th className="border border-gray-300 px-3 py-2 text-center">Current</th>
            <th className="border border-gray-300 px-3 py-2 text-center">Difference</th>
          </tr>
        </thead>
        <tbody>
          {originalTimings.map((originalTiming, index) => {
            const currentTiming = currentTimings[index];
            const capturedTiming = capturedTimings?.[index];
            const difference = currentTiming - originalTiming;

            return (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-3 py-2 font-medium">
                  Event {index + 1}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center font-mono">
                  {originalTiming.toFixed(3)}s
                </td>
                {capturedTimings && (
                  <td className="border border-gray-300 px-3 py-2 text-center font-mono">
                    {capturedTiming ? capturedTiming.toFixed(3) + 's' : '-'}
                  </td>
                )}
                <td className="border border-gray-300 px-3 py-2 text-center">
                  {editable ? (
                    <input
                      type="number"
                      step={0.001}
                      value={currentTiming.toFixed(3)}
                      onChange={(e) => handleTimingChange(index, Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center font-mono text-xs"
                    />
                  ) : (
                    <span className="font-mono">{currentTiming.toFixed(3)}s</span>
                  )}
                </td>
                <td className={`border border-gray-300 px-3 py-2 text-center font-mono ${
                  Math.abs(difference) > 0.1 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {difference >= 0 ? '+' : ''}{difference.toFixed(3)}s
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
