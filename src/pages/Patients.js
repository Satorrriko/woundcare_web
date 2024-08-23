import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AWS from 'aws-sdk';
import styled from 'styled-components';
import CaseCard from '../components/CaseCard';

// Styled components for modal (保持不变)
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
`;

// AWS configuration
const AWSConfig = {
  region: 'ap-southeast-2',
  credentials: new AWS.Credentials(
    'AKIAYS2NUYPMDSPH6MHI',
    'AseuJMIvygKw4D8Nl/NvFP36O1hc9XuTstaYly/z'
  ),
};

AWS.config.update(AWSConfig);
const s3 = new AWS.S3();

function Patient() {
  const { patientId } = useParams();
  const [patients, setPatients] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [patientId]);

  const fetchImages = async () => {
    const params = {
      Bucket: 'woundcareapp',
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
      const pId = parts[0];
      const uuid = parts[1];
      const position = parts[2];
      const datePart = parts[3];
      const timePart = parts[4];
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
      });

      return acc;
    }, {});
  };

  const closeModal = () => setSelectedImage(null);

  return (
    <div className="PatientContainer">
      <h1>Patient Information</h1>
      {Object.entries(patients).map(([id, patientData]) => (
        Object.entries(patientData.cases).map(([uuid, images]) => (
          <CaseCard
            key={`${id}-${uuid}`}
            patientId={id}
            images={images}
            onImageClick={setSelectedImage}
          />
        ))
      ))}

      {selectedImage && (
        <ModalBackdrop onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <img src={selectedImage.url} alt="Selected" style={{ maxWidth: '100%', height: 'auto' }} />
            <p>Date: {selectedImage.date}</p>
            <p>Time: {selectedImage.time}</p>
            <p>Position: {selectedImage.position}</p>
            <button onClick={closeModal}>Close</button>
          </ModalContent>
        </ModalBackdrop>
      )}
    </div>
  );
}

export default Patient;