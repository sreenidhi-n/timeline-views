import React, { useState, useEffect } from 'react';
import ImageList from './components/ImageList';
import ImageModal from './components/ImageModal';
import './App.css'; 

function App() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/images');
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
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="App">
      <h1>Image Viewer</h1>
      {error ? (
        <div className="error-message">Error fetching images: {error}</div>
      ) : (
        <ImageList images={images} openModal={openModal} />
      )}
      <ImageModal isOpen={selectedImage !== null} closeModal={closeModal} image={selectedImage} />
    </div>
  );
}

export default App;
