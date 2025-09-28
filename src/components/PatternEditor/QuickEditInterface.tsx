import type { QuickEditInterfaceProps } from './types';
import { TimingAdjustmentInterface } from './TimingAdjustmentInterface';

export function QuickEditInterface({ 
  pattern, 
  onSave, 
  onCancel 
}: QuickEditInterfaceProps) {
  
  return (
    <TimingAdjustmentInterface
      pattern={pattern}
      capturedTimings={pattern.timings} // Use existing timings as "captured" timings
      onSave={onSave}
      onDiscard={onCancel}
      onRetry={onCancel} // In quick edit mode, retry just cancels back to pattern selection
      mode="quickEdit" // Use quick edit mode to hide Original column and Replace with Captured button
    />
  );
}
