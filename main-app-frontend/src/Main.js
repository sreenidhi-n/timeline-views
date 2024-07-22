import React from 'react';
import './Main.css';
import './fonts/Raleway-VariableFont_wght.ttf'

const MainComponent = () => {
  return (
    <div style={{fontFamily:"Medium", textAlign:"center", alignItems: "center" }}>
      <h1>Main Page</h1>
      <a href="/location" target="_blank" rel="noopener noreferrer">
        <button style={{fontFamily:"Medium", top:"30%", left:"35%", position:"absolute"}}><span>Open App 1 (Location) </span></button>
      </a>
      <a href="/timeline" target="_blank" rel="noopener noreferrer">
        <button style={{fontFamily:"Medium", top:"40%", left:"35%", position:"absolute"}}><span>Open App 2 (Timeline) </span></button>
      </a>
      <a href="/noEXIF" target="_blank" rel="noopener noreferrer">
        <button style={{fontFamily:"Medium", top:"50%", left:"35%", position:"absolute"}}><span>Open App 3 (No EXIF) </span></button>
      </a>
    </div>
  );
};

export default MainComponent;