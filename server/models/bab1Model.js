const mongoose = require('mongoose');

const bab1Schema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 100,
    default: ''
  },
  description: {
    type: String,
    maxlength: 100,
    default: ''
  },
  pdfUrl: {
    type: String,
    required: true
  }
}, { timestamps: true }); // Auto-manage createdAt, updatedAt

module.exports = mongoose.model('Bab1', bab1Schema);
