export type Event = { 
  id: number; 
  time: number; 
}

export type Press = { 
  eventId: number | null; 
  time: number; 
  delta: number; 
  matched: boolean; 
}

export type PlaybackOptions = {
  speed: number;
  toleranceMs: number;
  preRollSeconds: number;
}

export type PlaybackState = {
  isPlaying: boolean;
  now: number;
}
