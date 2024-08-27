import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ImageGalleryModal from './ImageGalleryModal';

const CardContainer = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
  width: 600px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const PatientId = styled.h2`
  font-size: 1.2rem;
  color: #333;
`;

const Progress = styled.span`
  font-size: 1rem;
  color: #666;
`;

const Divider = styled.hr`
  border: 0;
  height: 1px;
  background-color: #e0e0e0;
  margin: 10px 0;
`;

const CardContent = styled.div`
  display: flex;
  gap: 20px;
`;

const ChartContainer = styled.div`
  flex: 1;
  height: 200px;
`;

const ImageContainer = styled.div`
  width: 150px;
  height: 150px;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const Timestamp = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const DetailButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: #45a049;
  }
`;

const parseImageInfo = (fileName) => {
  const parts = fileName.split('_');
  return {
    caseId: `${parts[1]}`,
    position: `${parts[2]}`,
    date: `${parts[3]}`,
    time: `${parts[4]}`
  };
};

const CaseCard = ({ patientId, images, onDetailClick }) => {
  const [showGallery, setShowGallery] = useState(false);

  const sortedImages = useMemo(() => 
    [...images].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [images]
  );

  const chartData = useMemo(() => 
    sortedImages.map((img) => ({
      date: img.date,
      value: Math.floor(Math.random() * 100) // Replace with actual progress data
    })),
    [sortedImages]
  );

  const progress = useMemo(() => {
    const lastValue = chartData[chartData.length - 1]?.value;
    const firstValue = chartData[0]?.value;
    return firstValue ? Math.round((lastValue / firstValue) * 100) : 0;
  }, [chartData]);

  const latestImage = sortedImages[0];
  const latestImageInfo = latestImage ? parseImageInfo(latestImage.name) : null;

  const handleShowDetails = () => {
    setShowGallery(true);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  return (
    <CardContainer>
      <CardHeader>
        <PatientId>ID: {patientId}</PatientId>
        <patientId>Position: {latestImageInfo ? latestImageInfo.position : 'N/A'}</patientId>
        <Progress>Progress: {progress}%</Progress>
      </CardHeader>
      <Divider />
      <CardContent>
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ImageContainer>
          {latestImage && (
            <ImagePreview 
              src={latestImage.url} 
              alt="Latest wound image"
            />
          )}
        </ImageContainer>
      </CardContent>
      <CardFooter>
        <Timestamp>
          Last update: {latestImageInfo ? `${latestImageInfo.date} ${latestImageInfo.time}` : 'N/A'}
        </Timestamp>
        <Timestamp>
          {latestImageInfo ? `Case ID: ${latestImageInfo.caseId}` : 'N/A'}
        </Timestamp>
        <DetailButton onClick={handleShowDetails}>
          Show Details
        </DetailButton>
      </CardFooter>
      {showGallery && (
        <ImageGalleryModal 
          images={sortedImages} 
          onClose={handleCloseGallery}
        />
      )}
    </CardContainer>
  );
};

export default CaseCard;