const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

app.use(cors());

const imagesDirectory = path.join(__dirname, 'pics');

const getImagesFromDirectory = () => {
  const files = fs.readdirSync(imagesDirectory);
  const formats = ['.jpg', '.jpeg', '.png', '.gif','.tiff','.tif', '.bmp', '.ico', '.webp','raw'];
  return files
    .filter(file => formats.some(ext => file.toLowerCase().endsWith(ext)))
    .map(file => {
      const filePath = path.join(imagesDirectory, file);
      const fileData = fs.readFileSync(filePath);
      return fileData.toString('base64');
    });
};

const generateRandomFolders = (numFolders = 3) => {
  const folders = [];
  const images = getImagesFromDirectory();
  for (let i = 0; i < numFolders; i++) {
    const numFiles = Math.min(Math.floor(Math.random() * 10) + 1, images.length); 
    const files = images.slice(0, numFiles);
    folders.push({
      Folder_name: `Folder_${i + 1}`,
      Number_of_files: numFiles,
      File_Array: files,
    });
  }
  return folders;
};

app.get('/folders', (req, res) => {
  const folders = generateRandomFolders(2 + Math.floor(Math.random() * 2));
  res.json(folders);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
