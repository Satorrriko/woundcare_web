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
  height: 250px;
  margin-bottom: 20px;
`;

const ImageContainer = styled.div`
  width: 150px;
  height: 150px;
  flex-shrink: 0;
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

const ImageOverlay = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
`;

const BaseImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
`;

const SvgOverlay = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
`;

const parseImageInfo = (fileName) => {
  const parts = fileName.split('_');
  return {
    caseId: parts[1],
    position: parts[2],
    date: parts[3],
    time: parts[4],
    area: parts[5].replace('.jpg', '').replace('area', '').replace('.svg', ''),
    fileExtension: parts[5].split('.').pop()
  };
};

const formatTimestamp = (date, time) => {
  return `${date.slice(0,4)}/${date.slice(4,6)}/${date.slice(6,8)} ${time.slice(0,2)}:${time.slice(2,4)}`;
};

const CaseCard = ({ patientId, images, onDetailClick }) => {
  const [showGallery, setShowGallery] = useState(false);

  const processedImages = useMemo(() => {
    const imageMap = new Map();
    images.forEach(img => {
      const info = parseImageInfo(img.name);
      const key = `${info.caseId}_${info.date}_${info.time}`;
      if (!imageMap.has(key)) {
        imageMap.set(key, { ...info, jpg: null, svg: null });
      }
      if (info.fileExtension === 'jpg') {
        imageMap.get(key).jpg = img.url;
      } else if (info.fileExtension === 'svg') {
        imageMap.get(key).svg = img.url;
      }
    });
    return Array.from(imageMap.values());
  }, [images]);

  const sortedImages = useMemo(() =>
    [...processedImages].sort((a, b) => 
      (String(a.date) + String(a.time)) - (String(b.date) + String(b.time))
    ),
    [processedImages]
  );

  const chartData = useMemo(() => {
    return sortedImages.map((img) => ({
      timestamp: formatTimestamp(img.date, img.time),
      area: parseFloat(img.area),
      date: img.date,
      time: img.time
    }));
  }, [sortedImages]);

  const progress = useMemo(() => {
    const firstValue = parseFloat(chartData[0]?.area) || 0;
    const lastValue = parseFloat(chartData[chartData.length - 1]?.area) || 0;
    return firstValue ? Math.round((1 - lastValue / firstValue) * 100) : 0;
  }, [chartData]);

  const latestImage = sortedImages[sortedImages.length - 1];

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
        <PatientId>Position: {latestImage ? latestImage.position : 'N/A'}</PatientId>
        <Progress>Progress: {progress}%</Progress>
      </CardHeader>
      <Divider />
      <CardContent>
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 25
              }}
            >
              <XAxis 
                dataKey="timestamp"
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                fontSize={12}
              />
              <YAxis 
                domain={['auto', 'auto']}
                padding={{ top: 20, bottom: 20 }}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="area" 
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ImageContainer>
          {latestImage && (
            <ImageOverlay>
              <BaseImage src={latestImage.jpg} alt="Latest wound image" />
              <SvgOverlay src={latestImage.svg} alt="SVG overlay" />
            </ImageOverlay>
          )}
        </ImageContainer>
      </CardContent>
      <CardFooter>
        <Timestamp>
          Last update: {latestImage ? formatTimestamp(latestImage.date, latestImage.time) : 'N/A'}
        </Timestamp>
        <Timestamp>
          {latestImage ? `Case ID: ${latestImage.caseId}` : 'N/A'}
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
