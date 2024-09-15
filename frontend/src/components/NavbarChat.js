// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  // Get the user's name from local storage
  const userEmail = localStorage.getItem('email');

  // Logout function
  const handleLogout = () => {
    // Clear local storage
    localStorage.clear();
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* Left side: Logout button */}
      <div className="navbar-left">
        <span className="logout-link" onClick={handleLogout}>
          Logout
        </span>
      </div>

      {/* Middle: Bot name */}
      <div className="navbar-brand">WarmWhisper</div>

      {/* Right side: User's welcome message */}
      <div className="navbar-right">
        Welcome, {userEmail ? userEmail.split('@')[0] : 'Guest'}
      </div>
    </nav>
  );
};

export default Navbar;
