import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Medication} from '../types/medication';
import {StorageService} from '../services/storage';
import {SchedulerService} from '../services/scheduler';
import {MedicationCard} from '../components/MedicationCard';

export const HomeScreen = ({navigation}: any) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMedications = async () => {
    try {
      const meds = await StorageService.getMedications();
      setMedications(meds);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, []),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMedications();
    setRefreshing(false);
  };

  const handleMedicationPress = (medication: Medication) => {
    navigation.navigate('MedicationDetail', {medicationId: medication.id});
  };

  const handleAddMedication = () => {
    navigation.navigate('AddMedication');
  };

  const handleDeleteMedication = async (medication: Medication) => {
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
              await loadMedications();
            } catch (error) {
              console.error('Error deleting medication:', error);
              Alert.alert('Error', 'Failed to delete medication');
            }
          },
        },
      ],
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No medications yet</Text>
      <Text style={styles.emptyText}>
        Tap the + button below to add your first medication reminder
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Medications</Text>
        <Text style={styles.subtitle}>
          {medications.filter(m => m.enabled).length} active reminder
          {medications.filter(m => m.enabled).length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={medications}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <MedicationCard
            medication={item}
            onPress={() => handleMedicationPress(item)}
          />
        )}
        contentContainerStyle={
          medications.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddMedication}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#777',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
});
