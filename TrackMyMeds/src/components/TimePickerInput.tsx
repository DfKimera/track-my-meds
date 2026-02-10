import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';

interface TimePickerInputProps {
  value: string;
  onChange: (time: string) => void;
  onRemove?: () => void;
}

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  value,
  onChange,
  onRemove,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hours, setHours] = useState(parseInt(value.split(':')[0]) || 9);
  const [minutes, setMinutes] = useState(parseInt(value.split(':')[1]) || 0);

  const handleConfirm = () => {
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
    onChange(timeString);
    setShowPicker(false);
  };

  const handleOpen = () => {
    const [h, m] = value.split(':').map(Number);
    setHours(h || 9);
    setMinutes(m || 0);
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.timeButton} onPress={handleOpen}>
        <Text style={styles.timeText}>{value}</Text>
      </TouchableOpacity>

      {onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Select Time</Text>

            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <View style={styles.scrollContainer}>
                  {Array.from({length: 24}, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.pickerItem,
                        hours === i && styles.selectedItem,
                      ]}
                      onPress={() => setHours(i)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          hours === i && styles.selectedItemText,
                        ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.separator}>:</Text>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <View style={styles.scrollContainer}>
                  {Array.from({length: 60}, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.pickerItem,
                        minutes === i && styles.selectedItem,
                      ]}
                      onPress={() => setMinutes(i)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          minutes === i && styles.selectedItemText,
                        ]}>
                        {i.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.pickerActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPicker(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    fontSize: 24,
    color: '#d32f2f',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  scrollContainer: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  separator: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginHorizontal: 16,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#2196F3',
  },
  pickerItemText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  selectedItemText: {
    color: 'white',
    fontWeight: '700',
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
