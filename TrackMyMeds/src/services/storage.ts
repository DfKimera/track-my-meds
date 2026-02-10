import AsyncStorage from '@react-native-async-storage/async-storage';
import {Medication, ReminderHistory} from '../types/medication';

const MEDICATIONS_KEY = '@medications';
const HISTORY_KEY = '@reminder_history';

/**
 * Storage service for medications and reminder history
 */
export const StorageService = {
  /**
   * Get all medications
   */
  async getMedications(): Promise<Medication[]> {
    try {
      const data = await AsyncStorage.getItem(MEDICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting medications:', error);
      return [];
    }
  },

  /**
   * Save all medications
   */
  async saveMedications(medications: Medication[]): Promise<void> {
    try {
      await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
    } catch (error) {
      console.error('Error saving medications:', error);
      throw error;
    }
  },

  /**
   * Add a new medication
   */
  async addMedication(medication: Medication): Promise<void> {
    const medications = await this.getMedications();
    medications.push(medication);
    await this.saveMedications(medications);
  },

  /**
   * Update an existing medication
   */
  async updateMedication(updatedMedication: Medication): Promise<void> {
    const medications = await this.getMedications();
    const index = medications.findIndex(m => m.id === updatedMedication.id);
    if (index !== -1) {
      medications[index] = updatedMedication;
      await this.saveMedications(medications);
    }
  },

  /**
   * Delete a medication
   */
  async deleteMedication(id: string): Promise<void> {
    const medications = await this.getMedications();
    const filtered = medications.filter(m => m.id !== id);
    await this.saveMedications(filtered);
  },

  /**
   * Get a single medication by ID
   */
  async getMedicationById(id: string): Promise<Medication | undefined> {
    const medications = await this.getMedications();
    return medications.find(m => m.id === id);
  },

  /**
   * Get reminder history
   */
  async getHistory(): Promise<ReminderHistory[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  },

  /**
   * Add a history entry
   */
  async addHistory(entry: ReminderHistory): Promise<void> {
    try {
      const history = await this.getHistory();
      history.push(entry);

      // Keep only last 1000 entries to prevent unlimited growth
      const trimmed = history.slice(-1000);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error adding history:', error);
      throw error;
    }
  },

  /**
   * Get history for a specific medication
   */
  async getHistoryForMedication(medicationId: string): Promise<ReminderHistory[]> {
    const history = await this.getHistory();
    return history.filter(h => h.medicationId === medicationId);
  },

  /**
   * Clear all data (for testing/reset)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([MEDICATIONS_KEY, HISTORY_KEY]);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};
