// server/models/forumT1Model.js
const mongoose = require('mongoose');

const forumT1Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true  // auto‐creates createdAt and updatedAt
});

module.exports = mongoose.model('ForumT1', forumT1Schema);
