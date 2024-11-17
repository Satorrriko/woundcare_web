// frontend/src/pages/Patients.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import CaseCard from '../components/CaseCard';
import { apiService } from '../services/api';

const PatientContainer = styled.div`
  padding: 20px;
  margin: 0 40%
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  padding: 20px;
  text-align: center;
  background-color: #ffe6e6;
  border-radius: 4px;
  margin: 20px 0;
`;

function Patient() {
  const { patientId } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getPatientData(patientId);
      setPatientData(data);
    } catch (err) {
      setError('Failed to load patient data. Please try again later.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PatientContainer>
        <LoadingSpinner>Loading patient data...</LoadingSpinner>
      </PatientContainer>
    );
  }

  if (error) {
    return (
      <PatientContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </PatientContainer>
    );
  }

  return (
    <PatientContainer>
      <Title>Patient Information: {patientId}</Title>
      {patientData && patientData.cases ? (
        Object.entries(patientData.cases).map(([caseId, caseData]) => (
          <CaseCard
            key={`${patientId}-${caseId}`}
            patientId={patientId}
            images={caseData.images}
          />
        ))
      ) : (
        <p>No data available for this patient.</p>
      )}
    </PatientContainer>
  );
}

export default Patient;