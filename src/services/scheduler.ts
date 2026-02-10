import {Medication} from '../types/medication';
import {NotificationService} from './notifications';
import {StorageService} from './storage';

/**
 * Scheduler service for managing medication reminders
 */
export const SchedulerService = {
  /**
   * Schedule all notifications for a medication
   */
  async scheduleMedication(medication: Medication): Promise<void> {
    if (!medication.enabled) {
      console.log(`Medication ${medication.name} is disabled, skipping scheduling`);
      return;
    }

    try {
      for (const time of medication.times) {
        await NotificationService.scheduleNotification(medication, time);
      }
      console.log(`Scheduled all reminders for ${medication.name}`);
    } catch (error) {
      console.error('Error scheduling medication:', error);
      throw error;
    }
  },

  /**
   * Reschedule a medication (cancel old, schedule new)
   */
  async rescheduleMedication(medication: Medication): Promise<void> {
    try {
      await NotificationService.cancelMedicationNotifications(medication.id);
      await this.scheduleMedication(medication);
    } catch (error) {
      console.error('Error rescheduling medication:', error);
      throw error;
    }
  },

  /**
   * Cancel all notifications for a medication
   */
  async cancelMedication(medicationId: string): Promise<void> {
    try {
      await NotificationService.cancelMedicationNotifications(medicationId);
      console.log(`Cancelled all reminders for medication ${medicationId}`);
    } catch (error) {
      console.error('Error cancelling medication:', error);
      throw error;
    }
  },

  /**
   * Reschedule all active medications (on app restart)
   */
  async rescheduleAll(): Promise<void> {
    try {
      const medications = await StorageService.getMedications();
      const enabledMedications = medications.filter(m => m.enabled);

      console.log(`Rescheduling ${enabledMedications.length} active medications`);

      // Cancel all existing notifications first
      await NotificationService.cancelAllNotifications();

      // Schedule each enabled medication
      for (const medication of enabledMedications) {
        await this.scheduleMedication(medication);
      }

      console.log('All medications rescheduled successfully');
    } catch (error) {
      console.error('Error rescheduling all medications:', error);
      throw error;
    }
  },

  /**
   * Handle snooze action - schedule a one-time notification for 30 minutes later
   */
  async handleSnooze(medication: Medication, originalTime: string): Promise<void> {
    try {
      await NotificationService.scheduleSnoozeNotification(medication, originalTime);
      console.log(`Snoozed ${medication.name} for 30 minutes`);
    } catch (error) {
      console.error('Error handling snooze:', error);
      throw error;
    }
  },

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications(): Promise<any[]> {
    return await NotificationService.getScheduledNotifications();
  },
};
