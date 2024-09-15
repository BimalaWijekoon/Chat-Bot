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
});

const User = mongoose.model('User', userSchema);

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

    res.status(200).json({ message: 'Login successful', user }); // Return user data upon successful login
  } catch (error) {
    console.error('Error logging in:', error.message);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
