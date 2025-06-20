const mongoose = require('mongoose');

const ChallengeAttemptSchema = new mongoose.Schema({
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // must use 'student' not just 'studentEmail'
  studentEmail: String,
  answers: Array,
  correctCount: Number,
  totalPoints: Number,
  submittedAt: Date,
});

module.exports = mongoose.model('ChallengeAttempt', ChallengeAttemptSchema);
