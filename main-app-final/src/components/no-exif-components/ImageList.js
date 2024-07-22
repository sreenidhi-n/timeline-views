import React from 'react';

const ImageList = ({ images, openModal }) => {
  return (
    <div className="image-list">
      {images.map(image => (
        <div key={image.filename} className="image-item">
          <img
          src={image.imageUrl || `/images/${image.filename}`}
          alt={image.filename}
          onClick={() => openModal(image)}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageList;