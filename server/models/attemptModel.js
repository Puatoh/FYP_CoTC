const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExerciseTingkatan1',
    required: true
  },
  chosen: {
    type: [Number],
    required: true
  },
  correct: {
    type: Boolean,
    required: true
  }
});

const attemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModuleT1',
    required: true
  },
  answers: {
    type: [answerSchema],
    required: true
  },
  feedback: {
    type: String,
    default: ''
  },
  attemptedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Attempt', attemptSchema);
