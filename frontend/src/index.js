// src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';  // Import the main App component

// Render the App component into the root element of the HTML document
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')  // Ensure this matches the root ID in your public/index.html file
);
