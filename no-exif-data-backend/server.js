const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const exif = require('exif-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use('/images', express.static(path.join(__dirname, 'pics')));

app.get('/api/images', (req, res) => {
  const imagesDirectory = path.join(__dirname, 'pics');

  fs.readdir(imagesDirectory, (err, files) => {
    if (err) {
      console.error('Error reading images directory:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const imageFiles = files.filter(file =>
      /\.(png|jpe?g|gif)$/.test(path.extname(file).toLowerCase())
    );

    const imagesMetadata = imageFiles.map(file => {
      const filePath = path.join(imagesDirectory, file);
      const buffer = fs.readFileSync(filePath);
      const parser = exif.create(buffer);
      const result = parser.parse();

      const metadata = {
        hasDateTime: result.tags.DateTimeOriginal !== undefined,
        hasLocation: result.tags.GPSLatitude !== undefined,
        dimensions: `${result.imageSize.width}x${result.imageSize.height}`,
        make: result.tags.Make,
        model: result.tags.Model,
      };

      return {
        filename: file,
        imageUrl: `/images/${file}`,
        metadata: metadata,
      };
    });

    const imagesWithoutDateTimeLocation = imagesMetadata.filter(image =>
      !image.metadata.hasDateTime && !image.metadata.hasLocation
    );

    res.json({ images: imagesWithoutDateTimeLocation });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
