const Attempt = require('../models/attemptModel');
const User = require('../models/userModel');

exports.getAttemptsByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const attempts = await Attempt.find({ moduleId })
      .populate('studentId', 'username email');

    const simplified = attempts.map((att) => ({
      _id: att._id,
      student: att.studentId, // has .username and .email
      answers: att.answers,
      feedback: att.feedback
    }));

    res.json(simplified);
  } catch (err) {
    console.error('getAttemptsByModule error:', err);
    res.status(500).json({ message: 'Server error fetching attempts' });
  }
};
