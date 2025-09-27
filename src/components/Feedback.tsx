import type { Press, Event } from '../types';

interface FeedbackProps {
  presses: Press[];
  events: Event[];
  toleranceMs: number;
}

export function Feedback({ presses, events }: FeedbackProps) {
  // Calculate summary stats
  const matchedPresses = presses.filter(p => p.matched);
  const avgError = matchedPresses.length > 0 
    ? matchedPresses.reduce((sum, p) => sum + Math.abs(p.delta), 0) / matchedPresses.length
    : 0;
  const accuracy = events.length > 0 ? (matchedPresses.length / events.length) * 100 : 0;

  const exportToCsv = () => {
    const headers = ['event_id', 'event_time', 'press_time', 'delta_ms', 'matched'];
    const rows = events.map(event => {
      const press = presses.find(p => p.eventId === event.id);
      return [
        event.id,
        event.time.toFixed(3),
        press ? press.time.toFixed(3) : '',
        press ? press.delta.toFixed(1) : '',
        press ? press.matched : false
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timing-results-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Results</h2>
        {presses.length > 0 && (
          <button
            onClick={exportToCsv}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium text-sm"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Summary stats */}
      {presses.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{accuracy.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{avgError.toFixed(1)}ms</div>
            <div className="text-sm text-gray-600">Avg Error</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{matchedPresses.length}/{events.length}</div>
            <div className="text-sm text-gray-600">Hits</div>
          </div>
        </div>
      )}

      {/* Per-event results */}
      {events.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-700 mb-2">Per-Event Results:</h3>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {events.map(event => {
              const press = presses.find(p => p.eventId === event.id);
              
              return (
                <div
                  key={event.id}
                  className={`flex justify-between items-center p-2 rounded text-sm ${
                    press
                      ? press.matched
                        ? 'bg-green-50 text-green-800'
                        : 'bg-red-50 text-red-800'
                      : 'bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>Event {event.id} ({event.time.toFixed(2)}s)</span>
                  {press ? (
                    <span className="font-medium">
                      {press.delta >= 0 ? '+' : ''}{press.delta.toFixed(1)}ms
                      {press.matched ? ' ✓' : ' ✗'}
                    </span>
                  ) : (
                    <span className="text-gray-500">No press</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          Load an event file to see results here.
        </p>
      )}
    </div>
  );
}
