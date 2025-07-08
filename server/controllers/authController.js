const User = require('../models/userModel');
const admin = require('../firebaseAdmin');
const sendEmail = require('../utils/mailer');
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
const path = require('path');
const fs = require('fs');


exports.register = async (req, res) => {
  try {
    const { firebaseUid, username, email, role } = req.body;

    // Validate required fields
    if (!firebaseUid || !username || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Save user in MongoDB
    const newUser = new User({
      firebaseUid,
      username,
      email,
      role: role || 'student',
      photoURL: ''
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, firebaseUid, markVerified } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally update isVerified
    if (markVerified && !user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    res.json({
      username: user.username,
      role: user.role,
      isVerified: user.isVerified
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getRole = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      role: user.role,
      isVerified: user.isVerified,
      username: user.username
    });
  } catch (err) {
    console.error('Get role error:', err);
    return res.status(500).json({ message: 'Server error fetching user role' });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const userEmail = req.headers.email;
    if (!userEmail) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Missing email header' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      username: user.username,
      email: user.email,
      photoURL: user.photoURL || ''
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res
      .status(500)
      .json({ message: 'Server error during fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // We expect the frontend to send the logged-in user's email in headers.email
    const userEmail = req.headers.email;
    const { username: newUsername } = req.body;

    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized: Missing email header' });
    }

    if (!newUsername || typeof newUsername !== 'string') {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Trim and validate
    const trimmed = newUsername.trim();
    if (!usernameRegex.test(trimmed)) {
      return res
        .status(400)
        .json({ message: 'Username must be 3–20 alphanumeric characters' });
    }

    // Check if another user already has that username
    const existing = await User.findOne({ username: trimmed });
    if (existing && existing.email !== userEmail) {
      return res.status(400).json({ message: 'Username already taken' });
    }

     const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.username = trimmed;
    await user.save();
    return res.json({ message: 'Username updated successfully', username: trimmed });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    return res.status(500).json({ message: 'Server error during profile update' });
  }
};

// 5) Upload avatar (POST /profile/photo)
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userEmail = req.headers.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized: missing email header' });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // If existing image exists, delete it from disk:
    if (user.photoURL) {
      const oldFilename = path.basename(user.photoURL);
      const oldPath = path.join(__dirname, '..', 'uploads', 'profile', oldFilename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new URL
    user.photoURL = `${req.protocol}://${req.get('host')}/uploads/profile/${req.file.filename}`;
    await user.save();

    return res.json({ message: 'Profile photo uploaded', photoURL: user.photoURL });
  } catch (err) {
    console.error('Profile photo upload error:', err);
    return res.status(500).json({ message: 'Server error during photo upload' });
  }
};

exports.deleteProfilePhoto = async (req, res) => {
  try {
    const userEmail = req.headers.email;
    if (!userEmail) return res.status(401).json({ message: 'Unauthorized: Missing email header' });

    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.photoURL) {
      return res.status(400).json({ message: 'No photo to delete' });
    }

    const filename = path.basename(user.photoURL);
    const filePath = path.join(__dirname, '..', 'uploads', 'profile', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    user.photoURL = '';
    await user.save();

    return res.json({ message: 'Profile photo deleted' });
  } catch (err) {
    console.error('Profile photo delete error:', err);
    return res.status(500).json({ message: 'Server error during photo deletion' });
  }
};