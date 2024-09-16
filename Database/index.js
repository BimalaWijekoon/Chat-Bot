require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(helmet());

// MongoDB connection setup
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// User Schema definition
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  relative: { type: String, required: true },
  relativeNum: { type: String, required: true },
  telephone: { type: String, required: true },
  relativeEmail: { type: String, required: true },
  profilePicture: { type: String },
  lastLogin: { type: String, default: '00:00:00 0000-00-00' },  // Add lastLogin field with default value
  lastLogout: { type: String, default: '00:00:00 0000-00-00' } // Add lastLogout field with default value
});

const User = mongoose.model('User', userSchema);

// Chat History Schema definition
const chatHistorySchema = new mongoose.Schema({
  email: { type: String, required: true },
  sessionId: { type: String, required: true },
  messages: { type: Array, required: true },
  savedAt: { type: Date, default: Date.now },
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

// Route to fetch all user details by email
app.get('/user-details', async (req, res) => {
  const { email } = req.query; // Get the email from the query parameters
  try {
    const user = await User.findOne({ email }); // Fetch all user details
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Route to save chat history
app.post('/save-chat', async (req, res) => {
  const { email, sessionId, messages } = req.body;
  try {
    const existingChat = await ChatHistory.findOne({ email, sessionId });
    if (existingChat) {
      // Update existing chat
      existingChat.messages = messages;
      existingChat.savedAt = new Date();
      await existingChat.save();
      res.status(200).json({ message: 'Chat history updated successfully.' });
    } else {
      // Create a new chat
      const newChatHistory = new ChatHistory({ email, sessionId, messages });
      await newChatHistory.save();
      res.status(201).json({ message: 'Chat history saved successfully.' });
    }
  } catch (error) {
    console.error('Error saving chat history:', error.message);
    res.status(500).json({ error: 'Failed to save chat history' });
  }
});

// Route to get previous chat histories for a user
app.get('/get-previous-chats', async (req, res) => {
  const { email } = req.query;
  try {
    const chats = await ChatHistory.find({ email }).sort({ savedAt: -1 }); // Sort by savedAt descending
    if (!chats || chats.length === 0) {
      return res.status(404).json({ error: 'No chat history found' });
    }
    res.status(200).json({ chats });
  } catch (error) {
    console.error('Error fetching previous chats:', error.message);
    res.status(500).json({ error: 'Failed to fetch previous chats' });
  }
});

// Route to get specific chat history by sessionId
app.get('/get-chat-history', async (req, res) => {
  const { email, sessionId } = req.query;
  try {
    const chat = await ChatHistory.findOne({ email, sessionId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat history not found' });
    }
    res.status(200).json(chat);
  } catch (error) {
    console.error('Error fetching chat history:', error.message);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Route to sign up a new user
app.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, relative, relativeNum, telephone, relativeEmail, profilePicture } = req.body;

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      relative,
      relativeNum,
      telephone,
      relativeEmail,
      profilePicture: profilePicture || null, // Set to null if not provided
      lastLogin: '00:00:00 0000-00-00', // Initialize lastLogin time to default
      lastLogout: '00:00:00 0000-00-00' // Initialize lastLogout time to default
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully.' });

  } catch (error) {
    console.error('Error signing up:', error.message);
    res.status(500).json({ error: 'Failed to sign up' });
  }
});

// Route to log in a user using email and password
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Use email instead of employeeId
    const user = await User.findOne({ email }); // Find the user by email

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Update lastLogin with the current date and time
    user.lastLogin = new Date().toLocaleString('en-US', { timeZone: 'UTC' }); // Use UTC to ensure consistent time format
    await user.save();

    res.status(200).json({ message: 'Login successful', user }); // Return user data upon successful login
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Route to update logout time for a user
app.post('/update-logout-time', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update lastLogout with the current date and time
    user.lastLogout = new Date().toLocaleString('en-US', { timeZone: 'UTC' }); // Use UTC to ensure consistent time format
    await user.save();

    res.status(200).json({ message: 'Logout time updated successfully.' });
  } catch (error) {
    console.error('Error updating logout time:', error.message);
    res.status(500).json({ error: 'Failed to update logout time' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
