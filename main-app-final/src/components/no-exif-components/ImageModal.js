import React from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    border: '1px solid black',
    zIndex: 1000,
    maxHeight: "80vh",
    overflowY: 'scroll',
    fontFamily: "Medium"
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 999,
    
  }
};

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
      style={customStyles}
      contentLabel="Image Metadata"
    >
      {image && (
        <div className="modal-content" style={{overflowY:"scroll"}}>
          <h2>Image Metadata - {image.filename}</h2>
          <img
            src={image.imageUrl}
            alt={image.filename}
            className="modal-image"
            style={{marginBottom: '20px' }}
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