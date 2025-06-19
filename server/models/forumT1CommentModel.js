const mongoose = require('mongoose');

const forumT1CommentSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumT1',
    required: true
  },
  // we'll store both so front‑end can choose either
  authorEmail: {
    type: String,
    required: true,
    trim: true
  },
  authorUsername: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  // Optional parent → nested replies
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumT1Comment',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ForumT1Comment', forumT1CommentSchema);