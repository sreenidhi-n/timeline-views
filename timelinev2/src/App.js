import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Icon, divIcon, point } from "leaflet";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import 'leaflet-polylinedecorator';
import "./styles.css";
import "./App.css";
import ArrowLine from "./ArrowLine";

const customIcon = new Icon({
  iconUrl: require("./icons/placeholder.png"),
  iconSize: [38, 38]
});

const createClusterCustomIcon = function (cluster) {
  return new divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: "custom-marker-cluster",
    iconSize: point(33, 33, true)
  });
};

function SetViewOnMarkers({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const latLngs = markers.map(marker => marker.geocode);
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds);
    }
  }, [markers, map]);
  return null;
}

function ArrowConnector({ markers }) {
  const sortedMarkers = [...markers].sort((a, b) => a.timestamp - b.timestamp);
  
  return sortedMarkers.slice(0, -1).map((marker, index) => (
    <ArrowLine
      key={index}
      positions={[marker.geocode, sortedMarkers[index + 1].geocode]}
      color="red"
    />
  ));
}

export default function App() {
  const [imageMarkers, setImageMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(Date.now()-7*24*60*60*1000));
  const [endDate, setEndDate] = useState(new Date());  

  const fetchImageData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/images');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Oops, we haven't got JSON!");
      }
      const imageJson = await response.json();
      console.log('Received data:', imageJson);
  
      const markers = imageJson.map(image => ({
        geocode: [image.latitude, image.longitude],
        popUp: `
          <div>
            <img src="http://localhost:3001${image.thumbnailUrl}" alt="${image.fileName}" style="width:100%; max-width:200px; height:auto;"/>
            <p>Image: ${image.fileName}</p>
            <p>Date: ${new Date(image.timestamp).toLocaleString()}</p>
          </div>
        `,
        timestamp: new Date(image.timestamp)
      }));
  
      setImageMarkers(markers);
    } catch (error) {
      console.error('Error fetching image data:', error);
      setError(`Failed to load image data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImageData();
  }, []);

  const filteredMarkers = imageMarkers.filter(marker => {
    return marker.timestamp >= startDate && marker.timestamp <= new Date(endDate.getTime() + 86400000);
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (imageMarkers.length === 0) {
    return <div>No images with valid GPS data found.</div>;
  }

  return (
    <div className="app-container">
      <div className="date-picker-container" style={{display: "block !important", zIndex:"99"}}>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
        />
      </div>
      <div className="gap"></div>
      <div className="map-container" >
        <MapContainer center={[0, 0]} zoom={5} >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
            {filteredMarkers.map((marker, index) => (
              <Marker key={index} position={marker.geocode} icon={customIcon}>
                <Popup minWidth={220}>
                  <div dangerouslySetInnerHTML={{ __html: marker.popUp }} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
          <ArrowConnector markers={filteredMarkers} />
          <SetViewOnMarkers markers={filteredMarkers} />
        </MapContainer>
      </div>
    </div>
  );
}