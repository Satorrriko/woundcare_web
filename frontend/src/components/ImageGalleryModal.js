import React, { useState } from 'react';
import styled from 'styled-components';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const ImageCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
`;

const ThumbnailContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailSvgOverlay = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageInfo = styled.div`
  padding: 10px;
`;

const EnlargedImageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1100;
`;

const EnlargedImageWrapper = styled.div`
  position: relative;
  max-width: 90%;
  max-height: 80%;
`;

const EnlargedBaseImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const EnlargedSvgOverlay = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const EnlargedImageInfo = styled.div`
  color: white;
  margin-top: 20px;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const ImageGalleryModal = ({ images, onClose }) => {
  const [enlargedImage, setEnlargedImage] = useState(null);

  const handleImageClick = (image) => {
    setEnlargedImage(image);
  };

  const closeEnlargedImage = () => {
    setEnlargedImage(null);
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Image Gallery</h2>
        <GalleryGrid>
          {images.map((image, index) => (
            <ImageCard key={index} onClick={() => handleImageClick(image)}>
              <ThumbnailContainer>
                <ThumbnailImage src={image.jpg} alt={`Wound image ${index + 1}`} />
                <ThumbnailSvgOverlay src={image.svg} alt={`SVG overlay ${index + 1}`} />
              </ThumbnailContainer>
              <ImageInfo>
                <p>Date: {image.date}</p>
                <p>Time: {image.time}</p>
                <p>Area: {image.area} mm²</p>
              </ImageInfo>
            </ImageCard>
          ))}
        </GalleryGrid>
      </ModalContent>
      {enlargedImage && (
        <EnlargedImageContainer onClick={closeEnlargedImage}>
          <EnlargedImageWrapper>
            <EnlargedBaseImage src={enlargedImage.jpg} alt="Enlarged wound image" />
            <EnlargedSvgOverlay src={enlargedImage.svg} alt="Enlarged SVG overlay" />
          </EnlargedImageWrapper>
          <EnlargedImageInfo>
            <p>Date: {enlargedImage.date}</p>
            <p>Time: {enlargedImage.time}</p>
            <p>Area: {enlargedImage.area}</p>
            <p>Case ID: {enlargedImage.caseId}</p>
            <p>Position: {enlargedImage.position}</p>
          </EnlargedImageInfo>
          <CloseButton onClick={(e) => { e.stopPropagation(); closeEnlargedImage(); }}>&times;</CloseButton>
        </EnlargedImageContainer>
      )}
    </ModalBackdrop>
  );
};

export default ImageGalleryModal;
