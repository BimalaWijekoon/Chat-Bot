// src/components/Chat.js

import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, Card } from 'antd';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isChatStarted, setIsChatStarted] = useState(false); // For managing the welcome screen

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

  const startChat = () => {
    setIsChatStarted(true);
  };

  return (
    <div className="chat-container">
      {!isChatStarted ? (
        <div className="welcome-screen">
          <div className="bot-avatar" />
          <h2>Bop earthling</h2>
          <p>I'm Tom, I'm your personal assistant. I'm here to guide you on your project.</p>
          <Button type="primary" className="start-button" onClick={startChat}>
            Start now
          </Button>
        </div>
      ) : (
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className="message-bubble">
              {msg.user && (
                <div className="user-message bubble-right">
                  {msg.user}
                </div>
              )}
              {msg.bot && (
                <div className="bot-message bubble-left">
                  <div className="bot-avatar-small" />
                  {msg.bot}
                </div>
              )}
            </div>
          ))}
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
      )}
    </div>
  );
};

export default Chat;
