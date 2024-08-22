import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AWS from 'aws-sdk';
import styled from 'styled-components';

// Styled components for modal
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
`;

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
  const [patient, setPatient] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  });  // Ensure re-fetching when patientId changes

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
      const patients = processPatientData(data.Contents, urls);

      setPatient(patients[patientId]);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const processPatientData = (contents, urls) => {
    return contents.reduce((acc, file, index) => {
      const relativePath = file.Key.replace('images/', '');
      const parts = relativePath.split('_');
      const pId = parts[0];
      const position = parts[1];
      const datePart = parts[2];
      const timePart = parts[3];
      const date = `${datePart.substring(0, 8)}`;
      const time = `${timePart.substring(0, 6)}`;

      if (!acc[pId]) {
        acc[pId] = { id: pId, positions: {} };
      }
      if (!acc[pId].positions[position]) {
        acc[pId].positions[position] = [];
      }

      acc[pId].positions[position].push({
        name: file.Key,
        url: urls[index],
        date: `${date.slice(6, 8)}/${date.slice(4, 6)}/${date.slice(0, 4)}`,
        time: `${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}`,
      });

      return acc;
    }, {});
  };

  const closeModal = () => setSelectedImage(null);

  return (
    <div className="PatientContainer">
      <h1>Patient Information</h1>
      <br />
      {patient ? (
        <div className="PatientInfo">
          <h2>PatientID: {patient.id}</h2>
          <br />
          {Object.entries(patient.positions).map(([position, images]) => (
            <div key={position}>
              <h3>+ {position}</h3>
              <br />
              <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                {images.map((img, index) => (
                  <div key={index}>
                    <img src={img.url} alt={`${position} on ${img.date} at ${img.time}`}
                         onClick={() => setSelectedImage(img)}
                         style={{ width: '100px', height: 'auto' }} />
                    <p>Date: {img.date}</p>
                    <p>Time: {img.time}</p>
                    <br />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No patient data available.</p>
      )}

      {selectedImage && (
        <ModalBackdrop onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <img src={selectedImage.url} alt="Selected" style={{ width: '600px', height: 'auto' }} />
            <p>Date: {selectedImage.date}</p>
            <p>Time: {selectedImage.time}</p>
            <button onClick={closeModal}>Close</button>
          </ModalContent>
        </ModalBackdrop>
      )}
    </div>
  );
}

export default Patient;