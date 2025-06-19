// server/models/moduleT1Model.js
const mongoose = require('mongoose');

const moduleT1Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true  // createdAt, updatedAt
});

module.exports = mongoose.model('ModuleT1', moduleT1Schema);
