import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AWS from 'aws-sdk';
import styled from 'styled-components';
import CaseCard from '../components/CaseCard';

// AWS configuration
const AWSConfig = {
  region: 'ap-southeast-2',
  credentials: new AWS.Credentials(
    'AKIAQKGGXM7RYAIFTVDD',
    'vGN7vNDPgjg1wwGYEJ2FdhysUe0s+XH9vtU25gwA'
  ),
};

AWS.config.update(AWSConfig);
const s3 = new AWS.S3();

const PatientContainer = styled.div`
  padding: 20px;
  margin: 0 40%
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

function Patient() {
  const { patientId } = useParams();
  const [patients, setPatients] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [patientId]);

  const fetchImages = async () => {
    const params = {
      Bucket: 'test12345464',
    };

    try {
      const data = await s3.listObjectsV2(params).promise();
      const urlsPromises = data.Contents.map(file =>
        s3.getSignedUrlPromise('getObject', {
          Bucket: params.Bucket,
          Key: file.Key,
          Expires: 60 * 5,
        })
      );

      const urls = await Promise.all(urlsPromises);
      const processedPatients = processPatientData(data.Contents, urls);

      setPatients(processedPatients);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const processPatientData = (contents, urls) => {
    return contents.reduce((acc, file, index) => {
      const relativePath = file.Key.replace('images/', '');
      const parts = relativePath.split('_');
      if (parts.length !== 6) {
        return acc;
      }
      const pId = parts[0];
      const uuid = parts[1];
      const position = parts[2];
      const datePart = parts[3];
      const timePart = parts[4];
      const areaPart = parts[5].replace('.jpg', '').replace('area', '').replace('.svg', '');
      const fileExtension = file.Key.split('.').pop();
      const date = `${datePart.substring(0, 4)}-${datePart.substring(4, 6)}-${datePart.substring(6, 8)}`;
      const time = timePart;

      if (!acc[pId]) {
        acc[pId] = { id: pId, cases: {} };
      }
      if (!acc[pId].cases[uuid]) {
        acc[pId].cases[uuid] = [];
      }

      acc[pId].cases[uuid].push({
        name: file.Key,
        url: urls[index],
        position,
        date,
        time,
        area: areaPart,
      });

      return acc;
    }, {});
  };

  // Filter patient data based on the current patientId
  const currentPatient = patients[patientId];

  return (
    <PatientContainer>
      <Title>Patient Information: {patientId}</Title>
      {currentPatient ? (
        Object.entries(currentPatient.cases).map(([uuid, images]) => (
          <CaseCard
            key={`${patientId}-${uuid}`}
            patientId={patientId}
            images={images}
            onImageClick={setSelectedImage}
          />
        ))
      ) : (
        <p>No data available for this patient.</p>
      )}
    </PatientContainer>
  );
}

export default Patient;