// src/components/Chat.js

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button, Input } from 'antd';
import './Chat.css';
import Navbar from "./NavbarChat";
import BotAvatar from '../components/images/download.png'; // Import the bot avatar image

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  // Function to generate a unique session ID
  const generateSessionId = () => {
    return 'session-' + Math.random().toString(36).substr(2, 9);
  };

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch user details and load the most recent chat on login
  const fetchUserDetails = async () => {
    const email = localStorage.getItem('email'); // Assuming email is stored in localStorage after login
    if (email) {
      try {
        const response = await fetch(`http://localhost:5000/user-details?email=${email}`);
        if (!response.ok) throw new Error('Failed to fetch user details');

        const data = await response.json();
        setUserDetails(data); // Store user details including the profile picture

        // Determine the welcome message based on the lastLogout time
        if (data.lastLogout === '00:00:00 0000-00-00') {
          sendBotMessage(`Hello, ${data.firstName}! Welcome to WarmWhisper. I'm here to assist you with anything you need. How can I help you or how are you feeling today?`);
          setSessionId(generateSessionId()); // Generate a new session ID for new users
        } else {
          sendBotMessage(`Welcome back, ${data.firstName}! How are you? Do you feel better?`);
          await loadMostRecentChat(email); // Load the most recent chat for returning users
        }
      } catch (error) {
        console.error('Error fetching user details:', error.message);
      }
    }
  };

  // Function to load the most recent chat history
  const loadMostRecentChat = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/get-previous-chats?email=${email}`);
      if (!response.ok) throw new Error('Failed to load chat history');

      const data = await response.json();
      if (data.chats && data.chats.length > 0) {
        const mostRecentChat = data.chats[0]; // Get the most recent chat
        setMessages(mostRecentChat.messages);
        setSessionId(mostRecentChat.sessionId); // Set the session ID to the most recent one
      }
    } catch (error) {
      console.error('Error loading chat history:', error.message);
    }
  };

  // Function to send a bot message
  const sendBotMessage = (message) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { bot: message },
    ]);
  };

  // Fetch user details when the component mounts
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('messages', JSON.stringify(messages)); // Save messages to localStorage whenever they change
  }, [messages]);

  // Function to handle sending messages
  const sendMessage = async () => {
    if (userInput.trim() === '') return;

    // Display user's message
    const newMessages = [...messages, { user: userInput }];
    setMessages(newMessages);

    try {
      // Send the message to the Rasa server
      const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
        sender: 'user',
        message: userInput,
      });

      const botResponses = response.data.map((msg) => msg.text).filter(Boolean);

      if (botResponses.length > 0) {
        setMessages((prevMessages) => [
          ...prevMessages,
          ...botResponses.map((botResponse) => ({ bot: botResponse })),
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { bot: 'Sorry, I didn’t understand that. Could you please rephrase?' },
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { bot: 'Sorry, something went wrong. Please try again later.' },
      ]);
    }

    setUserInput('');
  };

  // Function to handle new chat creation
  const handleNewChat = async () => {
    // Save the current chat history before starting a new chat
    await saveChatHistory();

    // Generate new session ID
    const newSessionId = generateSessionId();
    setSessionId(newSessionId); // Update session ID
    localStorage.setItem('sessionId', newSessionId); // Store new session ID in localStorage

    // Clear the chat messages
    setMessages([]);

    // Send a welcome message for the new chat session
    if (userDetails) {
      sendBotMessage(`Hello, ${userDetails.firstName}! Welcome to a new chat session. How can I assist you?`);
    }
  };

  // Function to load a chat by session ID
  const loadChatHistory = async (chatSessionId) => {
    const email = localStorage.getItem('email');
    if (email && chatSessionId) {
      try {
        const response = await fetch(`http://localhost:5000/get-chat-history?email=${email}&sessionId=${chatSessionId}`);
        if (!response.ok) throw new Error('Failed to load chat history');

        const data = await response.json();
        setMessages(data.messages);
        setSessionId(chatSessionId);
      } catch (error) {
        console.error('Error loading chat history:', error.message);
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
      } catch (error) {
        console.error('Error saving chat history:', error.message);
      }
    } else {
      console.error('Missing data to save chat history:', { email, sessionId, messages });
    }
  };

  return (
    <>
      <Navbar
        sessionId={sessionId}
        messages={messages}
        onNewChat={handleNewChat}
        loadChatHistory={loadChatHistory}
        setSessionId={setSessionId}
        setMessages={setMessages}
        sendBotMessage={sendBotMessage}  // Pass sendBotMessage as a prop
      />
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-window">
            {messages.map((msg, index) => (
              <div key={index} className={`message-bubble ${msg.user ? 'bubble-right' : 'bubble-left'}`}>
                {msg.user ? (
                  <div className="user-message">
                    <div className="user-avatar-small">
                      {userDetails && userDetails.profilePicture ? (
                        <img
                          src={userDetails.profilePicture} // Directly use the fetched data
                          alt="User Avatar"
                          className="user-avatar-image"
                        />
                      ) : (
                        <div className="user-avatar-placeholder">U</div>
                      )}
                    </div>
                    {msg.user}
                  </div>
                ) : (
                  <div className="bot-message">
                    <div className="bot-avatar-small">
                      <img src={BotAvatar} alt="Bot Avatar" className="bot-avatar-image" />
                    </div>
                    {msg.bot}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-section">
            <Input
              className="chat-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onPressEnter={sendMessage}
              placeholder="Type your message..."
            />
            <Button type="primary" onClick={sendMessage} className="send-button">
              Send
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
