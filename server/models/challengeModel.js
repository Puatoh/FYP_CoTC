const mongoose = require('mongoose');

// ───── Subdocument: MCQ question ─────
const questionSchema = new mongoose.Schema({
  text: String,
  choices: [String],
  correct: [Number],
  points: { type: Number, default: 1 }
});

// ───── Main Challenge ─────
const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  rules: String,
  duration: Number,
  status: { type: String, enum: ['Draf', 'Aktif', 'Ditutup'], default: 'Draf' },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now }
});

// ───── Challenge Attempt ─────
const challengeAttemptSchema = new mongoose.Schema({
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // important!
  studentEmail: String,
  answers: Array,
  correctCount: Number,
  totalPoints: Number,
  submittedAt: Date,
});

// ───── Exports ─────
const Challenge = mongoose.model('Challenge', challengeSchema);
const ChallengeAttempt = mongoose.model('ChallengeAttempt', challengeAttemptSchema);

module.exports = {
  Challenge,
  ChallengeAttempt
};
