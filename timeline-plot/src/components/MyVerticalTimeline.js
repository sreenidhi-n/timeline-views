import React, { useEffect, useState } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

const MyVerticalTimeline = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchImageDates = async () => {
      try {
        const response = await fetch('http://localhost:3001/get-image-dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            directory: 'C:/Users/tejas/OneDrive/Desktop/timeline-views/jpg'
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched image data:', data);
        setItems(data);
      } catch (error) {
        console.error('Error fetching image dates:', error);
        setItems([]);
      }
    };

    fetchImageDates();
  }, []);

  return (
    <div>
      <VerticalTimeline>
        {items.map((item, index) => (
          <VerticalTimelineElement
            key={index}
            date={formatDate(item.date)}
            iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
            contentStyle={{ boxShadow: 'none' }}
          >
            <div key={index}>
              <h3 className="vertical-timeline-element-title">{item.name}</h3>
              <p>{formatDate(item.date)}</p>
              <img src = {require(`../jpg/${item.name}`)} alt={item.name} style={{height:"200px"}} />
            </div>
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
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
