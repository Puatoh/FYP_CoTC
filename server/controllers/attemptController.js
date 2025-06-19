const Attempt = require('../models/attemptModel');

// POST /api/attempts/tingkatan1/:moduleId
exports.createAttempt = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { moduleId } = req.params;
    const { answers } = req.body;

    // prevent re-attempt
    const exists = await Attempt.findOne({ studentId, moduleId });
    if (exists) {
      return res.status(400).json({ message: 'Anda telah menghantar jawapan.' });
    }

    const newAttempt = new Attempt({
      studentId,
      moduleId,
      answers
    });
    await newAttempt.save();
    return res.status(201).json(newAttempt);
  } catch (err) {
    console.error('createAttempt error:', err);
    return res.status(500).json({ message: 'Server error recording attempt' });
  }
};

// GET /api/attempts/tingkatan1/:moduleId
exports.getAttempt = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { moduleId } = req.params;
    const attempt = await Attempt.findOne({ studentId, moduleId });
    if (!attempt) {
      return res.status(404).json({ message: 'No attempt found' });
    }
    return res.json(attempt);
  } catch (err) {
    console.error('getAttempt error:', err);
    return res.status(500).json({ message: 'Server error fetching attempt' });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { feedback } = req.body;
    const att = await Attempt.findById(attemptId);
    if (!att) return res.status(404).json({ message: 'Attempt not found' });
    att.feedback = feedback.trim();
    await att.save();
    return res.json(att);
  } catch (err) {
    console.error('updateFeedback error:', err);
    res.status(500).json({ message: 'Server error updating feedback' });
  }
};