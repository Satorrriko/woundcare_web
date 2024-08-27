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
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  cursor: pointer;
`;

const EnlargedImageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
`;

const EnlargedImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
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
            <ThumbnailImage
              key={index}
              src={image.url}
              alt={`Wound image ${index + 1}`}
              onClick={() => handleImageClick(image)}
            />
          ))}
        </GalleryGrid>
      </ModalContent>
      {enlargedImage && (
        <EnlargedImageContainer onClick={closeEnlargedImage}>
          <EnlargedImage src={enlargedImage.url} alt="Enlarged wound image" />
          <CloseButton onClick={closeEnlargedImage}>&times;</CloseButton>
        </EnlargedImageContainer>
      )}
    </ModalBackdrop>
  );
};

export default ImageGalleryModal;