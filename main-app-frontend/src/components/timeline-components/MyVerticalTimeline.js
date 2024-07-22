import React, { useEffect, useState } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from '../../images/placeholder.png';
import './timeline.css';

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconSize: [33, 33],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MyVerticalTimeline = () => {
  const [items, setItems] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 2;

  const fetchImageDates = async (newPage) => {
    try {
      const response = await fetch('http://localhost:4000/api/get-image-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // directory: 'pics', // Ensure this matches your server's directory structure
          page: newPage,
          size: pageSize,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched image data:', data); // Log the fetched data
      setItems((prevItems) => [...prevItems, ...data]);
    } catch (error) {
      console.error('Error fetching image dates:', error);
      // Handle error state if needed
    }
  };

  useEffect(() => {
    fetchImageDates(page); // Initial load of photos when component mounts
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1
      ) {
        setPage((prevPage) => {
          const newPage = prevPage + 1;
          fetchImageDates(newPage);
          return newPage;
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredItems = items.filter(item => {
    const itemDate = new Date(item.timestamp);
    if (startDate && endDate) {
      return itemDate >= startDate && itemDate <= endDate;
    }
    return true;
  });

  const handleImageClick = (item) => {
    if (item.latitude !== null && item.longitude !== null) {
      setSelectedLocation([item.latitude, item.longitude]);
      setModalIsOpen(true);
      setMessage('');
      setShowMessage(false);
    } else {
      setMessage('This image does not have location data.');
      setShowMessage(true);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedLocation(null);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
        />
      </div>
      <VerticalTimeline>
        {filteredItems.map((item, index) => (
          <VerticalTimelineElement
            key={index}
            date={formatDate(item.timestamp)}
            iconStyle={{ background: '#7d9d9c', color: '#f0ece3' }}
            contentStyle={{ boxShadow: 'none'}}
            contentArrowStyle={{borderLeft: '15px solid #7d9d9c'}}
          >
            <div key={index} style={{fontFamily:"Medium" }}>
              <h3 className="vertical-timeline-element-title">{item.fileName}</h3>
              <p>{formatDate(item.timestamp)}</p>
              <img 
                src={`http://localhost:4000${item.thumbnailUrl}`}  // Adjust base URL as per your server configuration
                alt={item.fileName} 
                style={{ height: "200px", cursor: 'pointer' }} 
                onClick={() => handleImageClick(item)}
              />
            </div>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Image Location"
      >
        {selectedLocation && (
          <MapContainer center={selectedLocation} zoom={13} style={{ height: '400px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={selectedLocation} icon={customIcon}>
              <Popup>Image location</Popup>
            </Marker>
          </MapContainer>
        )}
        <button onClick={closeModal}>Close</button>
      </Modal>
      {showMessage && (
        <div className="error-message">
          {message}
        </div>
      )}
    </div>
  );
};

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    } else {
      return date.toLocaleString();
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return 'Invalid Date';
  }
};

export default MyVerticalTimeline;
