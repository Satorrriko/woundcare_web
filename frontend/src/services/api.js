// frontend/src/services/api.js
const API_BASE_URL = '/api';

export const apiService = {
  // get all patients
  async getPatients() {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      return await response.json();
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // get patient data by patient ID
  async getPatientData(patientId) {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch patient data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching patient data:', error);
      throw error;
    }
  }
};
