import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import {Medication, ReminderAction} from '../types/medication';

const CHANNEL_ID = 'medication-reminders';

/**
 * Notification service using notifee
 */
export const NotificationService = {
  /**
   * Initialize notification service and create Android channel
   */
  async initialize(): Promise<void> {
    try {
      // Create notification channel for Android
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Medication Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  },

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  },

  /**
   * Generate notification ID from medication ID and time
   */
  getNotificationId(medicationId: string, time: string): string {
    return `${medicationId}_${time.replace(':', '')}`;
  },

  /**
   * Schedule a notification for a specific medication time
   */
  async scheduleNotification(
    medication: Medication,
    time: string,
  ): Promise<void> {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const scheduledDate = new Date();
      scheduledDate.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledDate <= now) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: scheduledDate.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      const notificationId = this.getNotificationId(medication.id, time);

      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title: 'Time to take your medication',
          body: `${medication.name} - ${medication.dosage}`,
          android: {
            channelId: CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: '✓ Confirm Taken',
                pressAction: {
                  id: 'confirm',
                },
              },
              {
                title: '⏰ Snooze 30 min',
                pressAction: {
                  id: 'snooze',
                },
              },
              {
                title: 'Skip',
                pressAction: {
                  id: 'skip',
                },
              },
            ],
          },
          ios: {
            categoryId: 'medication-reminder',
            sound: 'default',
          },
          data: {
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            scheduledTime: time,
          },
        },
        trigger,
      );

      console.log(
        `Scheduled notification for ${medication.name} at ${time}`,
      );
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  },

  /**
   * Schedule a one-time snooze notification (30 minutes from now)
   */
  async scheduleSnoozeNotification(
    medication: Medication,
    originalTime: string,
  ): Promise<void> {
    try {
      const snoozeDate = new Date();
      snoozeDate.setMinutes(snoozeDate.getMinutes() + 30);

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: snoozeDate.getTime(),
      };

      const notificationId = `${medication.id}_snooze_${Date.now()}`;

      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title: 'Snoozed Medication Reminder',
          body: `${medication.name} - ${medication.dosage}`,
          android: {
            channelId: CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: '✓ Confirm Taken',
                pressAction: {
                  id: 'confirm',
                },
              },
              {
                title: '⏰ Snooze 30 min',
                pressAction: {
                  id: 'snooze',
                },
              },
              {
                title: 'Skip',
                pressAction: {
                  id: 'skip',
                },
              },
            ],
          },
          ios: {
            categoryId: 'medication-reminder',
            sound: 'default',
          },
          data: {
            medicationId: medication.id,
            medicationName: medication.name,
            dosage: medication.dosage,
            scheduledTime: originalTime,
            isSnoozed: 'true',
          },
        },
        trigger,
      );

      console.log(`Scheduled snooze notification for ${medication.name}`);
    } catch (error) {
      console.error('Error scheduling snooze notification:', error);
      throw error;
    }
  },

  /**
   * Cancel all notifications for a specific medication
   */
  async cancelMedicationNotifications(medicationId: string): Promise<void> {
    try {
      const triggerNotifications = await notifee.getTriggerNotifications();

      for (const notification of triggerNotifications) {
        if (
          notification.notification.id?.startsWith(medicationId) ||
          notification.notification.data?.medicationId === medicationId
        ) {
          await notifee.cancelNotification(notification.notification.id!);
        }
      }

      console.log(`Cancelled all notifications for medication ${medicationId}`);
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  },

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  },

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('Cancelled all notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  },

  /**
   * Get all scheduled trigger notifications (for debugging)
   */
  async getScheduledNotifications(): Promise<any[]> {
    try {
      return await notifee.getTriggerNotifications();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  },

  /**
   * Display a foreground notification (when app is open)
   */
  async displayForegroundNotification(
    medication: Medication,
    time: string,
  ): Promise<void> {
    try {
      await notifee.displayNotification({
        title: 'Time to take your medication',
        body: `${medication.name} - ${medication.dosage}`,
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
        },
        ios: {
          sound: 'default',
        },
        data: {
          medicationId: medication.id,
          medicationName: medication.name,
          dosage: medication.dosage,
          scheduledTime: time,
        },
      });
    } catch (error) {
      console.error('Error displaying foreground notification:', error);
    }
  },

  /**
   * Set up iOS notification categories (required for action buttons on iOS)
   */
  async setupIOSCategories(): Promise<void> {
    try {
      await notifee.setNotificationCategories([
        {
          id: 'medication-reminder',
          actions: [
            {
              id: 'confirm',
              title: '✓ Confirm Taken',
            },
            {
              id: 'snooze',
              title: '⏰ Snooze 30 min',
            },
            {
              id: 'skip',
              title: 'Skip',
            },
          ],
        },
      ]);
    } catch (error) {
      console.error('Error setting up iOS categories:', error);
    }
  },
};
