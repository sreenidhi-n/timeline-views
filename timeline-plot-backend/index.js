const express = require('express');
const bodyParser = require('body-parser');
const { processImages } = require('./exifReader');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/get-image-dates', async (req, res) => {
  const { directory } = req.body;
  console.log(`Received directory: ${directory}`);
  
  try {
    if (!directory) {
      throw new Error('Directory path is required');
    }

    const files = fs.readdirSync(directory);
    const imagePaths = files
      .filter(file => /\.(jpe?g|png)$/i.test(file)) // Filter only image files
      .map(file => ({
        path: path.join(directory, file),
        name: file
      }));
    
    console.log(`Found image files: ${imagePaths}`);
    
    const imageDates = await processImages(imagePaths);
    // Sort images by DateTimeOriginal
    imageDates.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    console.log(`Processed image dates: ${JSON.stringify(imageDates)}`);
    
    res.json(imageDates);
  } catch (error) {
    console.error('Error processing images:', error);
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
