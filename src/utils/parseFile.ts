/**
 * Parse raw .txt content into array of event times.
 * Ignores empty lines and comments (lines starting with #).
 * Returns sorted times.
 */
export function parseFile(text: string): number[] {
  const lines = text.split('\n');
  const times: number[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const time = parseFloat(trimmed);
    if (!isNaN(time)) {
      times.push(time);
    }
  }

  // Return sorted times
  return times.sort((a, b) => a - b);
}
