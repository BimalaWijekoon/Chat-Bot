// src/components/Login.jsx
import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Modal from './Modal'; // Assuming you have a Modal component for showing messages

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Use email and password for login
      });

      if (!response.ok) {
        throw new Error('Failed to log in');
      }

      const data = await response.json();
      localStorage.setItem('email', data.user.email); // Store user email in localStorage
      setModalMessage('Login successful.');
      setModalType('success');
      setShowModal(true);

      // Delay the navigation by 2 seconds and navigate to the chat page
      setTimeout(() => {
        navigate('/chat');
      }, 2000);
    } catch (error) {
      console.error('Error logging in:', error.message);
      setModalMessage('Failed to log in.');
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Navbar />
      <Modal show={showModal} handleClose={handleCloseModal} message={modalMessage} type={modalType} />
      <div className="login-page">
        <div className="login-outer-container">
          <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-sign-in-header">
                <h2>Sign In</h2>
              </div>
              <div className="login-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="login-form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-button">Submit</button>
              <div className="login-forgot-password">
                <a href="/Signup">No Account Yet?</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
