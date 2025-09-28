import type { BossPhase, AttackPattern, SimonPatterns } from '../../utils/patternLoader';

export type EditMode = 'view' | 'calibrate' | 'quickEdit' | 'adjust';

export interface PatternEditorState {
  patterns: SimonPatterns | null;
  selectedPhase: BossPhase;
  selectedPattern: AttackPattern | null;
  editMode: EditMode;
  capturedTimings: number[];
  error: string | null;
  hasUnsavedChanges: boolean;
}

export interface CalibrationInterfaceProps {
  pattern: AttackPattern;
  onComplete: (timings: number[]) => void;
  onCancel: () => void;
}

export interface TimingAdjustmentInterfaceProps {
  pattern: AttackPattern;
  capturedTimings: number[];
  onSave: (newTimings: number[]) => void;
  onDiscard: () => void;
  onRetry: () => void;
}

export interface QuickEditInterfaceProps {
  pattern: AttackPattern;
  onSave: (newTimings: number[]) => void;
  onCancel: () => void;
}
