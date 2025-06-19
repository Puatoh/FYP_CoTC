// server/models/exerciseModel.js
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModuleT1',
    required: true
  },
  question: {
    type: String, // HTML allowed
    required: true
  },
  options: {
    type: [String],
    validate: [arr => arr.length >= 2 && arr.length <= 4, 'Options must be 2 to 4']
  },
  correctAnswers: {
    type: [Number], // indexes of correct options
    required: true,
    validate: [arr => arr.length >= 1, 'At least one correct answer required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ExerciseTingkatan1', exerciseSchema);
