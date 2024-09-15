// src/components/Navbar.jsx
import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">WarmWhisper</div>
      <div className="navbar-center">
        <a href="/login" className="nav-link">Login</a>
        <a href="/signup" className="nav-link">Sign Up</a>
      </div>
      <div className="navbar-right">Your Friendly Digital Companion</div>
    </nav>
  );
};

export default Navbar;
