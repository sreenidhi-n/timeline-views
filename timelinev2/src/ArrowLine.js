import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-polylinedecorator';

const ArrowLine = ({ positions, color = 'red' }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || positions.length < 2) return;

    const polyline = L.polyline(positions, {
      color: color,
      weight: 3,
    }).addTo(map);

    const decorator = L.polylineDecorator(polyline, {
      patterns: [
        {
          offset: '100%',
          repeat: 0,
          symbol: L.Symbol.arrowHead({
            pixelSize: 15,
            polygon: false,
            pathOptions: { 
              stroke: true,
              color: color,
              weight: 3
            }
          })
        }
      ]
    }).addTo(map);

    return () => {
      map.removeLayer(polyline);
      map.removeLayer(decorator);
    };
  }, [map, positions, color]);

  return null;
};

export default ArrowLine;