const mongoose = require('mongoose');

/**
 * User Schema
 * - firebaseUid: UID from Firebase Authentication
 * - username: unique username for student/admin
 * - email: unique email address
 * - role: "student" or "admin"
 * - isVerified: account activation status after OTP verification
 * - photoURL: URL of uploaded avatar (if any)
 * - lastLoginAt: timestamp of last successful login
 * - loginAttempts: number of consecutive failed login attempts
 */

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
  },
  username: { 
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  photoURL: {
    type: String,      // Will hold the public URL to the uploaded image
    default: ''        // Empty string if no image
  },
  lastLoginAt: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
