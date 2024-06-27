import React from 'react';
import MyVerticalTimeline from './components/MyVerticalTimeline';
import Navigation from './components/Navigation'; 


const App = () => {
  return (
    <div>
      <Navigation />
      <br></br>
      <div>
        <MyVerticalTimeline />
      </div>
    </div>
  );
};

export default App;
