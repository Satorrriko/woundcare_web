// frontend/src/services/api.js
const API_BASE_URL = 'http://3.25.71.234:5000/api';

export const apiService = {
  // 获取所有患者列表
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

  // 获取特定患者的数据
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
