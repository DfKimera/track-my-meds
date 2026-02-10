import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Medication} from '../types/medication';
import {StorageService} from '../services/storage';
import {SchedulerService} from '../services/scheduler';
import {TimePickerInput} from '../components/TimePickerInput';

export const AddMedicationScreen = ({navigation, route}: any) => {
  const editingMedication: Medication | undefined = route.params?.medication;
  const isEditing = !!editingMedication;

  const [name, setName] = useState(editingMedication?.name || '');
  const [dosage, setDosage] = useState(editingMedication?.dosage || '');
  const [times, setTimes] = useState<string[]>(
    editingMedication?.times || ['09:00'],
  );
  const [enabled, setEnabled] = useState(
    editingMedication?.enabled ?? true,
  );
  const [saving, setSaving] = useState(false);

  const handleAddTime = () => {
    setTimes([...times, '09:00']);
  };

  const handleRemoveTime = (index: number) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    } else {
      Alert.alert('Error', 'You must have at least one reminder time');
    }
  };

  const handleTimeChange = (index: number, newTime: string) => {
    const newTimes = [...times];
    newTimes[index] = newTime;
    setTimes(newTimes);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return false;
    }
    if (!dosage.trim()) {
      Alert.alert('Error', 'Please enter the dosage');
      return false;
    }
    if (times.length === 0) {
      Alert.alert('Error', 'Please add at least one reminder time');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const medication: Medication = {
        id: editingMedication?.id || Date.now().toString(),
        name: name.trim(),
        dosage: dosage.trim(),
        times: times.sort(),
        enabled,
        createdAt: editingMedication?.createdAt || new Date().toISOString(),
      };

      if (isEditing) {
        await StorageService.updateMedication(medication);
        await SchedulerService.rescheduleMedication(medication);
      } else {
        await StorageService.addMedication(medication);
        await SchedulerService.scheduleMedication(medication);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Medication Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Aspirin"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Dosage *</Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g., 100mg, 2 tablets"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Reminder Times *</Text>
              <TouchableOpacity
                style={styles.addTimeButton}
                onPress={handleAddTime}>
                <Text style={styles.addTimeButtonText}>+ Add Time</Text>
              </TouchableOpacity>
            </View>

            {times.map((time, index) => (
              <TimePickerInput
                key={index}
                value={time}
                onChange={newTime => handleTimeChange(index, newTime)}
                onRemove={times.length > 1 ? () => handleRemoveTime(index) : undefined}
              />
            ))}
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.enabledToggle}
              onPress={() => setEnabled(!enabled)}>
              <View style={styles.toggleLeft}>
                <Text style={styles.label}>Enable Reminders</Text>
                <Text style={styles.toggleDescription}>
                  {enabled
                    ? 'Notifications are active'
                    : 'Notifications are paused'}
                </Text>
              </View>
              <View style={[styles.toggle, enabled && styles.toggleActive]}>
                <View
                  style={[
                    styles.toggleThumb,
                    enabled && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}>
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  addTimeButton: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addTimeButtonText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '600',
  },
  enabledToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  toggleLeft: {
    flex: 1,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccc',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
