import React, { useState } from 'react';

const ImageList = ({ images, openModal }) => {
  return (
    <div className="image-list">
      {images.map(image => (
        <div key={image.filename} className="image-item">
          <img
            src={`http://localhost:5000${image.imageUrl}`} 
            alt={image.filename}
            onClick={() => openModal(image)}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageList;
