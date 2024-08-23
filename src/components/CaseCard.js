import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CardContainer = styled.div`
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
  max-width: 100%;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const PatientId = styled.h2`
  font-size: 1.2rem;
  color: #333;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ChartContainer = styled.div`
  flex: 1;
  height: 200px;
  min-width: 300px;
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LatestImage = styled.img`
  max-width: 200px;
  height: auto;
  border-radius: 4px;
  cursor: pointer;
`;

const ImageInfo = styled.p`
  margin-top: 10px;
  font-size: 0.9rem;
  color: #666;
`;

const parseImageInfo = (fileName) => {
  const parts = fileName.split('_');
  return {
    uuid: parts[1],
    position: parts[2],
    date: `${parts[3]}`,
    time: `${parts[4]}`
  };
};

const CaseCard = ({ patientId, images, onImageClick }) => {
  const [chartData, setChartData] = useState([]);
  const [latestImage, setLatestImage] = useState(null);

  // 使用 useMemo 优化性能
  const sortedImages = useMemo(() => 
    [...images].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [images]
  );

  useEffect(() => {
    // 生成模拟的折线图数据
    const generateChartData = () => {
      return sortedImages.map((img) => ({
        date: img.date,
        value: Math.floor(Math.random() * 100) // 模拟数据，实际应用中替换为真实数据
      }));
    };

    setLatestImage(sortedImages[0]);
    setChartData(generateChartData());
  }, [sortedImages]);

  const latestImageInfo = latestImage ? parseImageInfo(latestImage.name) : null;

  return (
    <CardContainer>
      <CardHeader>
        <PatientId>Patient ID: {patientId}</PatientId>
      </CardHeader>
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
            <>
              <LatestImage 
                src={latestImage.url} 
                alt="Latest wound image" 
                onClick={() => onImageClick(latestImage)}
              />
              <ImageInfo>
                Position: {latestImageInfo.position}, 
                Last update: {latestImageInfo.date} {latestImageInfo.time}
              </ImageInfo>
            </>
          )}
        </ImageContainer>
      </CardContent>
    </CardContainer>
  );
};

export default CaseCard;