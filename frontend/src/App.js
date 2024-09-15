// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartupPage from '../src/components/StartupPage';
import Login from '../src/components/Login';
import Signup from '../src/components/Signup';
import ChatPage from '../src/components/Chat'; // Assuming ChatPage is your main chat component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartupPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
};

export default App;
