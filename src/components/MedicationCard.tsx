import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {Medication} from '../types/medication';
import {format} from 'date-fns';

interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onPress,
}) => {
  const getNextReminderTime = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Find the next upcoming time today
    for (const time of medication.times.sort()) {
      const [hours, minutes] = time.split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;

      if (timeInMinutes > currentTime) {
        return time;
      }
    }

    // If no time left today, return first time tomorrow
    return medication.times.sort()[0];
  };

  const nextTime = medication.enabled ? getNextReminderTime() : null;

  return (
    <TouchableOpacity
      style={[styles.card, !medication.enabled && styles.disabledCard]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{medication.name}</Text>
          <Text style={styles.dosage}>{medication.dosage}</Text>
        </View>
        {!medication.enabled && (
          <View style={styles.disabledBadge}>
            <Text style={styles.disabledText}>Disabled</Text>
          </View>
        )}
      </View>

      <View style={styles.timesContainer}>
        <Text style={styles.timesLabel}>Reminder times:</Text>
        <View style={styles.times}>
          {medication.times.sort().map((time, index) => (
            <View key={index} style={styles.timeChip}>
              <Text style={styles.timeText}>{time}</Text>
            </View>
          ))}
        </View>
      </View>

      {nextTime && (
        <View style={styles.nextReminder}>
          <Text style={styles.nextReminderLabel}>Next reminder:</Text>
          <Text style={styles.nextReminderTime}>{nextTime}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  disabledCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 15,
    color: '#555',
  },
  disabledBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  disabledText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  timesContainer: {
    marginBottom: 12,
  },
  timesLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 6,
  },
  times: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  nextReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  nextReminderLabel: {
    fontSize: 13,
    color: '#555',
    marginRight: 8,
  },
  nextReminderTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1976d2',
  },
});
