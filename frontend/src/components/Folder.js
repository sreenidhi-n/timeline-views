import React, { useState, useEffect } from 'react';
import './Folder.css';

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create New Folder</h2>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter folder name"
        />
        <div className="modal-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onSubmit(folderName)}>Create</button>
        </div>
      </div>
    </div>
  );
};

const File = ({ name, type }) => {
  const getFileIcon = () => {
    const extension = name.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return '🖼️';
    } else if (['pdf'].includes(extension)) {
      return '📄';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return '📊';
    } else {
      return '📄';
    }
  };

  return (
    <div className={`file ${type}`}>
      <span className="file-icon">{type === 'folder' ? '📁' : getFileIcon()}</span>
      {name}
    </div>
  );
};

const Folder = ({ name, contents, path, onNavigate }) => (
  <div className="folder" onClick={() => onNavigate([...path, name])}>
    <File name={name} type="folder" />
  </div>
);

const FileList = ({ files, folders, path, onNavigate }) => (
  <div className="file-list">
    {path.length > 0 && (
      <div className="back-button" onClick={() => onNavigate(path.slice(0, -1))}>
        <span className="back-icon">↩️</span> Back
      </div>
    )}
    {folders.map(folder => (
      <Folder
        key={folder.name}
        name={folder.name}
        contents={folder.contents}
        path={path}
        onNavigate={onNavigate}
      />
    ))}
    {files.map(file => (
      <File key={file.name} name={file.name} type="file" />
    ))}
  </div>
);

const App = () => {
  const [structure, setStructure] = useState({
    name: 'Root',
    type: 'folder',
    contents: []
  });
  const [currentPath, setCurrentPath] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCurrentFolder = () => {
    let current = structure;
    for (let folderName of currentPath) {
      current = current.contents.find(item => item.name === folderName);
    }
    return current;
  };

  const navigate = (newPath) => {
    setCurrentPath(newPath);
  };

  const currentFolder = getCurrentFolder();
  const folders = currentFolder.contents.filter(item => item.type === 'folder');
  const files = currentFolder.contents.filter(item => item.type === 'file');

  return (
    <div className="app">
      <header className="header">
        <h1>Google Drive Jugaad</h1>
      </header>
      <div className="breadcrumb">
        {['Root', ...currentPath].join(' > ')}
      </div>
      <FileList
        folders={folders}
        files={files}
        path={currentPath}
        onNavigate={navigate}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default App;