import React from 'react';
import MapComponent from './components/MapComponent';
import Navigation from './components/Navigation'; 

function App() {
  return (
    <div>
        <Navigation />
      <br></br>
      <div>
        <MapComponent />
      </div>
    </div>
  );
}

export default App;