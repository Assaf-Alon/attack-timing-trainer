import type { Event, Press } from '../types';

interface TimelineProps {
  events: Event[];
  presses: Press[];
  currentTime: number;
  duration: number;
}

export function Timeline({ events, presses, currentTime, duration }: TimelineProps) {
  const timelineWidth = 800;
  const timelineHeight = 120;
  
  // Calculate positions
  const getPosition = (time: number) => {
    if (duration === 0) return 0;
    return (time / duration) * timelineWidth;
  };

  const currentPosition = getPosition(currentTime);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Timeline</h2>
      
      <div className="relative border border-gray-300 rounded" style={{ width: timelineWidth, height: timelineHeight }}>
        {/* Timeline background */}
        <div className="absolute inset-0 bg-gray-50"></div>
        
        {/* Event markers */}
        {events.map((event) => {
          const x = getPosition(event.time);
          const press = presses.find(p => p.eventId === event.id);
          
          return (
            <div
              key={event.id}
              className={`absolute w-1 h-full ${
                press
                  ? press.matched
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{ left: x }}
              title={`Event ${event.id}: ${event.time.toFixed(2)}s`}
            />
          );
        })}

        {/* Press markers */}
        {presses.map((press, index) => {
          const x = getPosition(press.time);
          
          return (
            <div
              key={index}
              className={`absolute w-2 h-2 rounded-full transform -translate-x-1 ${
                press.matched ? 'bg-green-600' : 'bg-orange-500'
              }`}
              style={{ 
                left: x, 
                top: '50%',
                transform: 'translateY(-50%) translateX(-50%)'
              }}
              title={`Press: ${press.time.toFixed(2)}s, Delta: ${press.delta.toFixed(1)}ms`}
            />
          );
        })}

        {/* Playhead */}
        <div
          className="absolute w-0.5 h-full bg-red-600"
          style={{ left: currentPosition }}
        />

        {/* Time labels */}
        <div className="absolute -bottom-6 left-0 text-xs text-gray-600">0s</div>
        <div className="absolute -bottom-6 right-0 text-xs text-gray-600">
          {duration.toFixed(1)}s
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500"></div>
          <span>Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500"></div>
          <span>Hit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>Your presses</span>
        </div>
      </div>
    </div>
  );
}
