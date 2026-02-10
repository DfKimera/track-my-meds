import React, {useEffect, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import notifee, {EventType} from '@notifee/react-native';
import {AppNavigator} from './src/navigation/AppNavigator';
import {NotificationService} from './src/services/notifications';
import {SchedulerService} from './src/services/scheduler';
import {StorageService} from './src/services/storage';
import {ReminderDialog} from './src/components/ReminderDialog';
import {Medication, ReminderAction, ReminderHistory} from './src/types/medication';

function App(): React.JSX.Element {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [currentMedication, setCurrentMedication] = useState<Medication | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string>('');

  useEffect(() => {
    initializeApp();
    setupNotificationListeners();

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize notification service
      await NotificationService.initialize();
      await NotificationService.setupIOSCategories();

      // Request permissions
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
      }

      // Reschedule all active medications on app start
      await SchedulerService.rescheduleAll();

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // Reschedule notifications when app comes to foreground
      await SchedulerService.rescheduleAll();
    }
  };

  const setupNotificationListeners = () => {
    // Foreground notification handler
    notifee.onForegroundEvent(async ({type, detail}) => {
      console.log('Foreground event:', type, detail);

      if (type === EventType.DELIVERED && detail.notification) {
        // Show in-app dialog when notification is delivered in foreground
        const medicationId = detail.notification.data?.medicationId as string;
        const time = detail.notification.data?.scheduledTime as string;

        if (medicationId && time) {
          const medication = await StorageService.getMedicationById(medicationId);
          if (medication) {
            setCurrentMedication(medication);
            setScheduledTime(time);
            setDialogVisible(true);
          }
        }
      } else if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        // Handle action button press
        await handleNotificationAction(
          detail.pressAction?.id || 'default',
          detail.notification?.data,
        );
      }
    });

    // Background notification handler
    notifee.onBackgroundEvent(async ({type, detail}) => {
      console.log('Background event:', type, detail);

      if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        await handleNotificationAction(
          detail.pressAction?.id || 'default',
          detail.notification?.data,
        );
      }
    });
  };

  const handleNotificationAction = async (
    actionId: string,
    data: any,
  ) => {
    const medicationId = data?.medicationId;
    const scheduledTime = data?.scheduledTime;

    if (!medicationId || !scheduledTime) {
      console.error('Missing medication data in notification');
      return;
    }

    const medication = await StorageService.getMedicationById(medicationId);
    if (!medication) {
      console.error('Medication not found:', medicationId);
      return;
    }

    let action: ReminderAction;

    switch (actionId) {
      case 'confirm':
        action = 'taken';
        break;
      case 'snooze':
        action = 'snoozed';
        await SchedulerService.handleSnooze(medication, scheduledTime);
        break;
      case 'skip':
        action = 'skipped';
        break;
      default:
        // Default action (tap on notification without action button)
        return;
    }

    // Record action in history
    await recordAction(medicationId, scheduledTime, action);
  };

  const handleDialogAction = async (action: ReminderAction) => {
    if (!currentMedication || !scheduledTime) return;

    if (action === 'snoozed') {
      await SchedulerService.handleSnooze(currentMedication, scheduledTime);
    }

    await recordAction(currentMedication.id, scheduledTime, action);
  };

  const recordAction = async (
    medicationId: string,
    scheduledTime: string,
    action: ReminderAction,
  ) => {
    try {
      const historyEntry: ReminderHistory = {
        id: Date.now().toString(),
        medicationId,
        scheduledTime,
        action,
        actionTime: new Date().toISOString(),
      };

      await StorageService.addHistory(historyEntry);
      console.log(`Recorded ${action} for medication ${medicationId}`);
    } catch (error) {
      console.error('Error recording action:', error);
    }
  };

  return (
    <>
      <AppNavigator />
      <ReminderDialog
        visible={dialogVisible}
        medication={currentMedication}
        scheduledTime={scheduledTime}
        onAction={handleDialogAction}
        onClose={() => setDialogVisible(false)}
      />
    </>
  );
}

export default App;
