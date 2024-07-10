const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const ExifImage = require('exif').ExifImage;
const cors = require('cors');

const app = express();
app.use(cors());

// Serve static files from the 'pics' directory
app.use('/thumbnails', express.static(path.join(__dirname, 'pics')));

function convertDMSToDD(dmsArray, direction) {
  if (!Array.isArray(dmsArray) || dmsArray.length !== 3) {
    return null;
  }
  
  const [degrees, minutes, seconds] = dmsArray;
  let dd = degrees + minutes / 60 + seconds / 3600;
  
  if (direction === 'S' || direction === 'W') {
    dd = dd * -1;
  }
  
  return parseFloat(dd.toFixed(6));
}

function parseExifDate(dateString) {
  if (!dateString) return null;
  
  const [datePart, timePart] = dateString.split(' ');
  const [year, month, day] = datePart.split(':');
  const [hour, minute, second] = timePart ? timePart.split(':') : [0, 0, 0];
  
  return new Date(year, month - 1, day, hour, minute, second);
}

app.get('/api/images', async (req, res) => {
  try {
    const files = await fs.readdir(path.join(__dirname, 'pics'));
    const imageData = await Promise.all(
      files.map(file => new Promise(async (resolve) => {
        try {
          const filePath = path.join(__dirname, 'pics', file);
          const stats = await fs.stat(filePath);
          
          new ExifImage({ image: filePath }, (error, exifData) => {
            if (error) {
              console.warn(`No EXIF data found for file: ${file}`, error.message);
              resolve({ 
                fileName: file, 
                latitude: null, 
                longitude: null, 
                timestamp: stats.mtime.toISOString(),
                thumbnailUrl: `/thumbnails/${file}`
              });
            } else {
              let latitude = null;
              let longitude = null;
              let timestamp = stats.mtime.toISOString();

              if (exifData && exifData.gps && exifData.gps.GPSLatitude && exifData.gps.GPSLongitude) {
                latitude = convertDMSToDD(exifData.gps.GPSLatitude, exifData.gps.GPSLatitudeRef);
                longitude = convertDMSToDD(exifData.gps.GPSLongitude, exifData.gps.GPSLongitudeRef);
              }

              if (exifData && exifData.exif && exifData.exif.DateTimeOriginal) {
                const parsedDate = parseExifDate(exifData.exif.DateTimeOriginal);
                if (parsedDate) {
                  timestamp = parsedDate.toISOString();
                }
              }

              resolve({ 
                fileName: file, 
                latitude, 
                longitude, 
                timestamp,
                thumbnailUrl: `/thumbnails/${file}`
              });
            }
          });
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
          resolve({ fileName: file, latitude: null, longitude: null, timestamp: null, thumbnailUrl: null });
        }
      }))
    );

    const filteredImageData = imageData.filter(image => image.latitude !== null && image.longitude !== null);
    res.json(filteredImageData);
  } catch (error) {
    console.error('Error reading images directory:', error);
    res.status(500).json({ error: 'Failed to fetch image data' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});