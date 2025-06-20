const User = require('../models/userModel');
const { Challenge, ChallengeAttempt } = require('../models/challengeModel');


exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createChallenge = async (req, res) => {
  try {
    const challenge = new Challenge(req.body);
    await challenge.save();
    res.status(201).json(challenge);
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
};

exports.updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!challenge) return res.status(404).json({ error: 'Not found' });
    res.json(challenge);
  } catch (err) {
    res.status(400).json({ error: 'Bad request' });
  }
};

exports.submitChallengeAnswers = async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;
  const studentEmail = req.headers.email;

  try {
    const user = await User.findOne({ email: studentEmail });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await ChallengeAttempt.findOne({ challenge: id, student: user._id });
    if (existing) return res.status(400).json({ error: 'Sudah disertai' });

    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalPoints = answers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);

    await ChallengeAttempt.create({
      challenge: id,
      student: user._id,        // ✅ must be ObjectId
      studentEmail: user.email, // optional fallback
      answers,
      correctCount,
      totalPoints,
      submittedAt: new Date(),
    });

    res.status(200).json({ message: 'Disimpan' });
  } catch (err) {
    console.error('Submit Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getChallengeLeaderboard = async (req, res) => {
  const { id } = req.params;
  try {
    const attempts = await ChallengeAttempt.find({ challenge: id })
      .populate('student', 'username email') // include email as fallback
      .sort({ totalPoints: -1, submittedAt: 1 });

    const formatted = attempts.map((a, index) => ({
      rank: index + 1,
      studentName: a.student?.username || a.student?.email || a.studentEmail,
      totalPoints: a.totalPoints,
      correctCount: a.correctCount,
      submittedAt: a.submittedAt,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
