/**
 * Medication data model
 */
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[]; // Array of time strings like "09:00", "21:00"
  enabled: boolean;
  createdAt: string;
}

/**
 * Reminder history entry
 */
export interface ReminderHistory {
  id: string;
  medicationId: string;
  scheduledTime: string;
  action: 'taken' | 'snoozed' | 'skipped';
  actionTime: string;
}

/**
 * Type for reminder actions
 */
export type ReminderAction = 'taken' | 'snoozed' | 'skipped';
