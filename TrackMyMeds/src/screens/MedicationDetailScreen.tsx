import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Medication, ReminderHistory} from '../types/medication';
import {StorageService} from '../services/storage';
import {SchedulerService} from '../services/scheduler';
import {format} from 'date-fns';

export const MedicationDetailScreen = ({navigation, route}: any) => {
  const {medicationId} = route.params;
  const [medication, setMedication] = useState<Medication | null>(null);
  const [history, setHistory] = useState<ReminderHistory[]>([]);

  const loadData = async () => {
    try {
      const med = await StorageService.getMedicationById(medicationId);
      if (med) {
        setMedication(med);
        const hist = await StorageService.getHistoryForMedication(medicationId);
        setHistory(hist.reverse().slice(0, 20)); // Show last 20 entries
      } else {
        Alert.alert('Error', 'Medication not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading medication detail:', error);
      Alert.alert('Error', 'Failed to load medication details');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [medicationId]),
  );

  const handleEdit = () => {
    navigation.navigate('AddMedication', {medication});
  };

  const handleToggleEnabled = async () => {
    if (!medication) return;

    try {
      const updated = {...medication, enabled: !medication.enabled};
      await StorageService.updateMedication(updated);

      if (updated.enabled) {
        await SchedulerService.scheduleMedication(updated);
      } else {
        await SchedulerService.cancelMedication(updated.id);
      }

      setMedication(updated);
    } catch (error) {
      console.error('Error toggling medication:', error);
      Alert.alert('Error', 'Failed to update medication');
    }
  };

  const handleDelete = () => {
    if (!medication) return;

    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${medication.name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteMedication(medication.id);
              await SchedulerService.cancelMedication(medication.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Error', 'Failed to delete medication');
            }
          },
        },
      ],
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'taken':
        return '✓';
      case 'snoozed':
        return '⏰';
      case 'skipped':
        return '⊘';
      default:
        return '•';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'taken':
        return '#4CAF50';
      case 'snoozed':
        return '#2196F3';
      case 'skipped':
        return '#999';
      default:
        return '#999';
    }
  };

  if (!medication) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{medication.name}</Text>
        <Text style={styles.dosage}>{medication.dosage}</Text>
        {!medication.enabled && (
          <View style={styles.disabledBadge}>
            <Text style={styles.disabledText}>Disabled</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reminder Times</Text>
        <View style={styles.times}>
          {medication.times.sort().map((time, index) => (
            <View key={index} style={styles.timeChip}>
              <Text style={styles.timeText}>{time}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
          <Text style={styles.actionButtonText}>Edit Medication</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            medication.enabled ? styles.disableButton : styles.enableButton,
          ]}
          onPress={handleToggleEnabled}>
          <Text style={styles.actionButtonText}>
            {medication.enabled ? 'Disable Reminders' : 'Enable Reminders'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}>
          <Text style={styles.actionButtonText}>Delete Medication</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent History</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyHistory}>No history yet</Text>
        ) : (
          history.map(entry => (
            <View key={entry.id} style={styles.historyItem}>
              <View
                style={[
                  styles.historyIcon,
                  {backgroundColor: getActionColor(entry.action)},
                ]}>
                <Text style={styles.historyIconText}>
                  {getActionIcon(entry.action)}
                </Text>
              </View>
              <View style={styles.historyContent}>
                <Text style={styles.historyAction}>
                  {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                </Text>
                <Text style={styles.historyTime}>
                  {format(new Date(entry.actionTime), 'MMM d, h:mm a')}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 18,
    color: '#555',
  },
  disabledBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  disabledText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  times: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  enableButton: {
    backgroundColor: '#4CAF50',
  },
  disableButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyHistory: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    paddingVertical: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyIconText: {
    fontSize: 18,
    color: 'white',
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 13,
    color: '#777',
  },
});
