import React, { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import EXIF from 'exif-js';

const MapComponent = () => {
  const mapElement = useRef();
  const [map, setMap] = useState(null);
  const [imageData, setImageData] = useState([]);

  useEffect(() => {
    const loadMap = async () => {
      try {
        const map = tt.map({
          key: 'YYqKDJA48sYCoju3LvfiwQ0JPyGW4wQv',
          container: mapElement.current,
          center: [0, 0],
          zoom: 1,
          basePath: '/api'
        });

        map.on('load', () => {
          setMap(map);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    loadMap();
    loadImageData();
  }, []);

  useEffect(() => {
    if (map && imageData.length > 0) {
      plotLocations();
    }
  }, [map, imageData]);

  const loadImageData = async () => {
    const images = require.context('../gps', false, /\.(jpg|jpeg|png)$/);
    const imageFiles = images.keys().map(key => ({ path: key, src: images(key) }));

    const data = await Promise.all(imageFiles.map(async (image) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = image.src;
        img.onload = () => {
          EXIF.getData(img, function() {
            const lat = EXIF.getTag(this, "GPSLatitude");
            const lon = EXIF.getTag(this, "GPSLongitude");
            const timestamp = EXIF.getTag(this, "DateTimeOriginal");
            
            const latDec = lat ? convertDMSToDD(lat) : null;
            const lonDec = lon ? convertDMSToDD(lon) : null;
            
            if (latDec && lonDec && !isNaN(latDec) && !isNaN(lonDec)) {
              resolve({ lat: latDec, lon: lonDec, timestamp });
            } else {
              resolve(null);
            }
          });
        };
        img.onerror = () => resolve(null);
      });
    }));

    const validData = data.filter(item => item !== null);
    setImageData(validData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
  };

  const convertDMSToDD = (dms) => {
    const degrees = dms[0];
    const minutes = dms[1];
    const seconds = dms[2];
    
    let dd = degrees + minutes / 60 + seconds / (60 * 60);
    
    if (dms.length === 4 && (dms[3] === 'S' || dms[3] === 'W')) {
      dd = -dd;
    }
    
    return dd;
  };

  const plotLocations = () => {
    console.log('Plotting locations:', imageData);
    imageData.forEach((data, index) => {
      new tt.Marker().setLngLat([data.lon, data.lat]).addTo(map);

      if (index < imageData.length - 1) {
        const nextData = imageData[index + 1];
        const lineCoordinates = [
          [data.lon, data.lat],
          [nextData.lon, nextData.lat]
        ];

        console.log(`Adding line from ${data.lon},${data.lat} to ${nextData.lon},${nextData.lat}`);

        map.addSource(`line-source-${index}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: lineCoordinates
            }
          }
        });

        map.addLayer({
          id: `line-layer-${index}`,
          type: 'line',
          source: `line-source-${index}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#888',
            'line-width': 2
          }
        });
      }
    });

    if (imageData.length > 0) {
      const bounds = new tt.LngLatBounds();
      imageData.forEach((data) => bounds.extend([data.lon, data.lat]));
      map.fitBounds(bounds, { padding: 50 });
    }
  };

  return <div ref={mapElement} style={{ width: '100%', height: '800px' }} />;
};

export default MapComponent;