import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {Medication, ReminderAction} from '../types/medication';

interface ReminderDialogProps {
  visible: boolean;
  medication: Medication | null;
  scheduledTime: string;
  onAction: (action: ReminderAction) => void;
  onClose: () => void;
}

export const ReminderDialog: React.FC<ReminderDialogProps> = ({
  visible,
  medication,
  scheduledTime,
  onAction,
  onClose,
}) => {
  if (!medication) return null;

  const handleAction = (action: ReminderAction) => {
    onAction(action);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Time to take your medication</Text>

          <View style={styles.medicationInfo}>
            <Text style={styles.medicationName}>{medication.name}</Text>
            <Text style={styles.dosage}>{medication.dosage}</Text>
            <Text style={styles.time}>Scheduled: {scheduledTime}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={() => handleAction('taken')}>
              <Text style={styles.buttonText}>✓ Confirm Taken</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.snoozeButton]}
              onPress={() => handleAction('snoozed')}>
              <Text style={styles.buttonText}>⏰ Snooze 30 min</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={() => handleAction('skipped')}>
              <Text style={[styles.buttonText, styles.skipButtonText]}>
                Skip
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  medicationInfo: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  dosage: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  time: {
    fontSize: 14,
    color: '#777',
  },
  actions: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  snoozeButton: {
    backgroundColor: '#2196F3',
  },
  skipButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  skipButtonText: {
    color: '#666',
  },
});
