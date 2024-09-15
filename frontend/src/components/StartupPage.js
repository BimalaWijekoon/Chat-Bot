// src/StartupPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StartupPage.css'; // Import the CSS file

const StartupPage = () => {
  const navigate = useNavigate(); // Use React Router's useNavigate hook

  const handleMoveOnClick = () => {
    navigate('/login'); // Navigate to the next page (ChatPage)
  };

  return (
    <div className="startup-container">
      <div className="startup-content">
        <h1 className="startup-title">Welcome to WarmWhisper</h1>
        <p className="startup-description">
          Meet your friendly digital companion, always here to listen, understand, and support you.
        </p>
        <button className="startup-button" onClick={handleMoveOnClick}>
          Move On, Friend
        </button>
      </div>
    </div>
  );
};

export default StartupPage;
