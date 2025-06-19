// server/models/forumT1ReplyModel.js
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumT1Comment',
    required: true,
  },
  authorEmail:    { type: String, required: true },
  authorUsername: { type: String, required: true },
  content:        { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ForumT1Reply', replySchema);
