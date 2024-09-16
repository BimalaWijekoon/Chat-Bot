// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavbarChat.css';
import Modal from './Modal'; // Import Modal component

const Navbar = ({ sessionId, messages, onNewChat, loadChatHistory, setSessionId, setMessages, sendBotMessage }) => { // Added sendBotMessage prop
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null); // State to store user details
  const [isModalVisible, setIsModalVisible] = useState(false); // State for controlling modal visibility
  const [modalMessage, setModalMessage] = useState(''); // State for modal message
  const [modalType, setModalType] = useState('info'); // State for modal type
  const [previousChats, setPreviousChats] = useState([]); // State to store previous chats

  // Fetch user details using their email from local storage
  useEffect(() => {
    const fetchUserDetails = async () => {
      const email = localStorage.getItem('email'); // Get the user's email from local storage
      if (email) {
        try {
          const response = await fetch(`http://localhost:5000/user-details?email=${email}`);
          if (response.ok) {
            const data = await response.json();
            setUserDetails(data); // Set the fetched user details
          } else {
            console.error('Error fetching user details:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching user details:', error.message);
        }
      }
    };

    fetchUserDetails();
    fetchPreviousChats(); // Fetch previous chats when component mounts
  }, []);

  // Function to fetch previous chats
  const fetchPreviousChats = async () => {
    const email = localStorage.getItem('email');
    if (email) {
      try {
        const response = await fetch(`http://localhost:5000/get-previous-chats?email=${email}`);
        if (response.ok) {
          const data = await response.json();
          setPreviousChats(data.chats); // Assuming the response contains an array of chats
        } else {
          console.error('Error fetching previous chats:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching previous chats:', error.message);
      }
    }
  };

  // Function to save chat history
  const saveChatHistory = async () => {
    const email = localStorage.getItem('email');

    if (email && sessionId && messages && messages.length > 0) {
      try {
        const response = await fetch('http://localhost:5000/save-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, sessionId, messages }),
        });

        if (!response.ok) {
          throw new Error('Failed to save chat history.');
        }

        console.log('Chat history saved successfully.');
        fetchPreviousChats(); // Refresh the list of previous chats
      } catch (error) {
        console.error('Error saving chat history:', error.message);
      }
    } else {
      console.error('Missing data to save chat history:', { email, sessionId, messages });
    }
  };

  // Logout function
  const handleLogout = async () => {
    if (sessionId && messages.length > 0) {
      await saveChatHistory(); // Save chat history before logging out
    }

    const email = localStorage.getItem('email');
    if (email) {
      try {
        // Update lastLogout time in the backend
        await fetch('http://localhost:5000/update-logout-time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        console.log('Logout time updated successfully.');
      } catch (error) {
        console.error('Error updating logout time:', error.message);
      }
    }

    // Clear local storage
    localStorage.clear();

    // Show modal message
    setModalMessage('User successfully logged out. Chat saved.');
    setModalType('success');
    setIsModalVisible(true);
  };

  // Handle modal OK button click
  const handleModalClose = () => {
    setIsModalVisible(false);
    // Redirect to the login page
    navigate('/login');
  };

  // Function to handle new chat creation
  const handleNewChat = async () => {
    if (sessionId && messages.length > 0) {
      await saveChatHistory(); // Save the current chat history before starting a new chat
    }

    // Generate new session ID
    const newSessionId = 'session-' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId); // Update session ID
    localStorage.setItem('sessionId', newSessionId); // Store new session ID in localStorage

    // Clear the chat messages
    setMessages([]);

    // Send a welcome message for the new chat session
    if (userDetails) {
      sendBotMessage(`Hello, ${userDetails.firstName}! Welcome to a new chat session. How can I assist you?`);
    }
  };

  // Function to handle loading a previous chat
  const handleLoadChat = (chatSessionId) => {
    if (loadChatHistory) {
      loadChatHistory(chatSessionId); // Call the loadChatHistory prop to load the selected chat
    } else {
      console.error('loadChatHistory is not a function');
    }
  };

  // Helper function to format date and time
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <>
      <nav className="chatnavbar">
        {/* Left side: User's welcome message */}
        <div className="chatnavbar-left">
          Welcome, {userDetails ? userDetails.firstName : 'Guest'}
        </div>

        {/* Middle: Bot name */}
        <div className="chatnavbar-brand">WarmWhisper</div>

        {/* Right side: Logout and New Chat buttons */}
        <div className="chatnavbar-right">
          {/* New Chat button */}
          <div className="nav-button" onClick={handleNewChat}>
            New Chat
          </div>

          {/* Previous Chats dropdown */}
          <div className="nav-dropdown">
            <div className="nav-button">Previous Chats</div>
            <div className="dropdown-content">
              {previousChats.length > 0 ? (
                previousChats.map((chat, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => handleLoadChat(chat.sessionId)}
                  >
                    Chat {index + 1} - {formatDateTime(chat.savedAt)}
                  </div>
                ))
              ) : (
                <div className="dropdown-item">No previous chats</div>
              )}
            </div>
          </div>

          {/* Logout button */}
          <div className="nav-button" onClick={handleLogout}>
            Logout
          </div>
        </div>
      </nav>

      {/* Modal for showing logout success message */}
      <Modal
        show={isModalVisible}
        handleClose={handleModalClose}
        type={modalType}
        message={modalMessage}
      />
    </>
  );
};

export default Navbar;
