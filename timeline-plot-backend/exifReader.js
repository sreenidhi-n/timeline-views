const ExifImage = require('exif').ExifImage;
const fs = require('fs');

const readExifData = (imagePath) => {
  return new Promise((resolve, reject) => {
    try {
      // Read image as a buffer
      const imageBuffer = fs.readFileSync(imagePath);
      
      // Use ExifImage constructor with image buffer
      new ExifImage({ image : imageBuffer }, function (error, exifData) {
        if (error) {
          reject(error);
        } else {
          const dateString = exifData.exif.DateTimeOriginal;
          if (!dateString) {
            reject(new Error('DateTimeOriginal not found in EXIF data'));
            return;
          }
          
          // Custom parsing for specific date formats
          let date;
          if (/^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
            // Format: "YYYY:MM:DD HH:MM:SS"
            const [datePart, timePart] = dateString.split(' ');
            const [year, month, day] = datePart.split(':');
            const [hour, minute, second] = timePart.split(':');
            date = new Date(year, month - 1, day, hour, minute, second);
          } else {
            // Default to using Date constructor (may not handle all cases)
            date = new Date(dateString);
          }
          
          if (isNaN(date.getTime())) {
            reject(new Error(`Invalid date format from EXIF data: ${dateString}`));
          } else {
            resolve(date.toISOString()); // Return ISO format string (or date object)
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

const processImages = async (imagePaths) => {
  const imageDates = [];
  for (const imagePath of imagePaths) {
    try {
      const date = await readExifData(imagePath.path); // Use imagePath.path
      if (date) {
        imageDates.push({ path: imagePath.path, name: imagePath.name, date }); // Include image name
      }
    } catch (error) {
      console.log(`Error reading EXIF data from ${imagePath.path}: `, error.message);
    }
  }
  return imageDates;
};

module.exports = { processImages };
