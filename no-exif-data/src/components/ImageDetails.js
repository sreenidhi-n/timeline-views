import React, { useState } from 'react';
import Modal from 'react-modal';

const ImageDetails = ({ image }) => {
  const { filename, imageUrl, metadata } = image;
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="image-details">
      <h2>Image Details</h2>
      <div>
        <img
          src={`http://localhost:5000${imageUrl}`}
          alt={filename}
          onClick={openModal}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        contentLabel="Image Metadata"
      >
        <h2>Image Metadata - {filename}</h2>
        <button onClick={closeModal}>Close</button>
        <div>
          <h3>Metadata:</h3>
          <ul>
            {Object.keys(metadata).map((key, index) => (
              <li key={index}>{key}: {metadata[key]}</li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default ImageDetails;
