import simonPatternsData from '../data/simonPatterns.json';

export type BossPhase = 'phase1' | 'phase2';

export interface AttackPattern {
  id: string;
  name: string;
  timings: number[];
  videoPath: string;
}

export interface SimonPatterns {
  phase1: AttackPattern[];
  phase2: AttackPattern[];
}

// Local storage key for pattern overrides
const PATTERNS_STORAGE_KEY = 'simon-patterns-custom';
const PATTERNS_BACKUP_KEY = 'simon-patterns-backup';

/**
 * Load Simon patterns with local storage overrides
 */
export function loadSimonPatterns(): SimonPatterns {
  try {
    // Check if there are custom patterns in localStorage
    const customPatterns = localStorage.getItem(PATTERNS_STORAGE_KEY);
    if (customPatterns) {
      const parsed = JSON.parse(customPatterns);
      // Validate the structure
      if (validatePatternsStructure(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load custom patterns from localStorage:', error);
  }

  // Fallback to default patterns
  return simonPatternsData as SimonPatterns;
}

/**
 * Save Simon patterns to local storage
 */
export function saveSimonPatterns(patterns: SimonPatterns): void {
  try {
    // Create backup of current patterns before saving
    const currentPatterns = loadSimonPatterns();
    localStorage.setItem(PATTERNS_BACKUP_KEY, JSON.stringify(currentPatterns));
    
    // Save new patterns
    localStorage.setItem(PATTERNS_STORAGE_KEY, JSON.stringify(patterns));
  } catch (error) {
    console.error('Failed to save patterns to localStorage:', error);
    throw new Error('Failed to save patterns. Storage might be full.');
  }
}

/**
 * Reset patterns to defaults
 */
export function resetPatternsToDefault(): SimonPatterns {
  try {
    localStorage.removeItem(PATTERNS_STORAGE_KEY);
    return simonPatternsData as SimonPatterns;
  } catch (error) {
    console.error('Failed to reset patterns:', error);
    throw new Error('Failed to reset patterns.');
  }
}

/**
 * Restore patterns from backup
 */
export function restorePatternsFromBackup(): SimonPatterns | null {
  try {
    const backup = localStorage.getItem(PATTERNS_BACKUP_KEY);
    if (backup) {
      const parsed = JSON.parse(backup);
      if (validatePatternsStructure(parsed)) {
        localStorage.setItem(PATTERNS_STORAGE_KEY, backup);
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to restore patterns from backup:', error);
    return null;
  }
}

/**
 * Update a specific pattern
 */
export function updatePattern(phase: BossPhase, patternId: string, newTimings: number[]): SimonPatterns {
  const patterns = loadSimonPatterns();
  const phasePatterns = patterns[phase];
  const patternIndex = phasePatterns.findIndex(p => p.id === patternId);
  
  if (patternIndex === -1) {
    throw new Error(`Pattern ${patternId} not found in ${phase}`);
  }

  // Validate timings
  if (!validateTimings(newTimings)) {
    throw new Error('Invalid timings: must be positive numbers in ascending order');
  }

  // Create updated patterns
  const updatedPatterns = {
    ...patterns,
    [phase]: phasePatterns.map((pattern, index) => 
      index === patternIndex 
        ? { ...pattern, timings: [...newTimings] }
        : pattern
    )
  };

  saveSimonPatterns(updatedPatterns);
  return updatedPatterns;
}

/**
 * Convert pattern timings to string format (for compatibility)
 */
export function patternToTimingString(pattern: AttackPattern): string {
  return pattern.timings.join('\n');
}

/**
 * Convert timings array to legacy AttackPattern format
 */
export function toLegacyAttackPattern(pattern: AttackPattern) {
  return {
    name: pattern.name,
    timings: patternToTimingString(pattern),
    videoPath: pattern.videoPath
  };
}

/**
 * Validate pattern structure
 */
function validatePatternsStructure(patterns: any): patterns is SimonPatterns {
  if (!patterns || typeof patterns !== 'object') return false;
  
  for (const phase of ['phase1', 'phase2']) {
    if (!Array.isArray(patterns[phase])) return false;
    
    for (const pattern of patterns[phase]) {
      if (!pattern.id || !pattern.name || !Array.isArray(pattern.timings) || !pattern.videoPath) {
        return false;
      }
      
      if (!validateTimings(pattern.timings)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Validate timing values
 */
function validateTimings(timings: number[]): boolean {
  if (timings.length === 0) return false;
  
  for (let i = 0; i < timings.length; i++) {
    const timing = timings[i];
    
    // Must be a positive number
    if (typeof timing !== 'number' || timing < 0 || !isFinite(timing)) {
      return false;
    }
    
    // Must be in ascending order
    if (i > 0 && timing <= timings[i - 1]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Export patterns to JSON file (for backup)
 */
export function exportPatternsToFile(): string {
  const patterns = loadSimonPatterns();
  return JSON.stringify(patterns, null, 2);
}

/**
 * Import patterns from JSON string
 */
export function importPatternsFromFile(jsonString: string): SimonPatterns {
  try {
    const patterns = JSON.parse(jsonString);
    if (!validatePatternsStructure(patterns)) {
      throw new Error('Invalid pattern file structure');
    }
    
    saveSimonPatterns(patterns);
    return patterns;
  } catch (error) {
    console.error('Failed to import patterns:', error);
    throw new Error('Failed to import patterns. Please check the file format.');
  }
}
