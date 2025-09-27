/**
 * Parse raw .txt content into array of event times.
 * Ignores empty lines and comments (lines starting with #).
 * Returns sorted times.
 * Throws an error if any non-comment, non-empty line contains invalid timing data.
 */
export function parseFile(text: string): number[] {
  // Check if the input is empty or only whitespace
  if (!text || !text.trim()) {
    throw new Error('Please enter timing values. Input cannot be empty.');
  }

  const lines = text.split('\n');
  const times: number[] = [];
  const invalidLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const time = parseFloat(trimmed);
    if (isNaN(time) || time < 0) {
      invalidLines.push(`Line ${i + 1}: "${trimmed}"`);
    } else {
      times.push(time);
    }
  }

  // If there are invalid lines, throw an error with details
  if (invalidLines.length > 0) {
    throw new Error(`Invalid timing values found:\n${invalidLines.join('\n')}\n\nPlease enter valid positive numbers (one per line).`);
  }

  // If no valid times were found after filtering comments and empty lines
  if (times.length === 0) {
    throw new Error('No valid timing values found. Please enter at least one positive number.');
  }

  // Return sorted times
  return times.sort((a, b) => a - b);
}
