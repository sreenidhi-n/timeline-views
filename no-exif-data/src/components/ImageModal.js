import React from 'react';
import Modal from 'react-modal';

const ImageModal = ({ isOpen, closeModal, image }) => {
  const renderMetadata = (metadata) => {
    return (
      <ul>
        {Object.entries(metadata).map(([key, value]) => (
          value && <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Image Metadata"
      className="modal"
      overlayClassName="overlay"
    >
      {image && (
        <div className="modal-content">
          <h2>Image Metadata - {image.filename}</h2>
          <img
            src={`http://localhost:5000${image.imageUrl}`} 
            alt={image.filename}
            className="modal-image"
          />
          <div>
            <h3>Metadata:</h3>
            {renderMetadata(image.metadata)}
          </div>
          <button onClick={closeModal}>Close</button>
        </div>
      )}
    </Modal>
  );
};

export default ImageModal;
