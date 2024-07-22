import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import MainComponent from './Main';
import Location from './pages/location-page';
import NoEXIF from './pages/no-exif-page';
import TimelinePage from './pages/timeline-page';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Set the app element for react-modal

// Create router
const router = createBrowserRouter([
  { path: "/", element: <MainComponent /> },
  { path: "/location", element: <Location /> },
  { path: "/timeline", element: <TimelinePage /> },
  { path: "/noEXIF", element: <NoEXIF /> },
]);

// Create root and render
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

document.getElementById('root');

// If you're using reportWebVitals, include it here
// reportWebVitals();