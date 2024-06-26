import React from 'react';
import EXIF from 'exif-js'; // Assuming you use exif-js for EXIF data extraction

const ImageGallery = ({ images }) => {
  const sortedImages = images.sort((a, b) => a.timestamp - b.timestamp); // Sorting images by timestamp

  return (
    <div className="image-gallery">
      {sortedImages.map((image, index) => (
        <div key={index} className="image-item">
          <img src={process.env.PUBLIC_URL + image.src} alt={`Image ${index}`} />
          <div>
            <p>Timestamp: {new Date(image.timestamp).toLocaleString()}</p>
            <p>Location: {image.lat}, {image.lon}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;
