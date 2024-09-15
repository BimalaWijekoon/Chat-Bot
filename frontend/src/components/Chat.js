// src/components/Chat.js

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button, Input } from 'antd';
import './Chat.css';
import Navbar from "./NavbarChat";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
      <>
      <Navbar />
      <div className="chat-page">
        <div className="chat-container">
          <div className="chat-window">
            {messages.map((msg, index) => (
                <div key={index} className={`message-bubble ${msg.user ? 'bubble-right' : 'bubble-left'}`}>
                  {msg.user ? (
                      <div className="user-message">{msg.user}</div>
                  ) : (
                      <div className="bot-message">
                        <div className="bot-avatar-small"/>
                        {msg.bot}
                      </div>
                  )}
                </div>
            ))}
            <div ref={messagesEndRef}/>
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
