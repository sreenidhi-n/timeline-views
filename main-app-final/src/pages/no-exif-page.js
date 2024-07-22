import React, { useState, useEffect } from 'react';
import ImageList from '../components/no-exif-components/ImageList';
import ImageModal from '../components/no-exif-components/ImageModal';
import './no-exif.css';

function NoEXIF() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/images-without-metadata');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setImages(data.images);
      } catch (error) {
        console.error('Error fetching images:', error);
        setError(error.message);
      }
    };

    fetchImages();
  }, []);

  const openModal = (image) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsOpen(false);
  };

  return (
    <div className="App">
      <h1>Image Viewer</h1>
      {error ? (
        <div className="error-message">Error fetching images: {error}</div>
      ) : (
        <ImageList images={images} openModal={openModal} />
      )}
      {selectedImage && (
        <ImageModal isOpen={isOpen} closeModal={closeModal} image={selectedImage} />
      )}
    </div>
  );
}

export default NoEXIF;
