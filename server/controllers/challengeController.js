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

    // Restrict access if not "Aktif"
    if (challenge.status !== 'Aktif') {
      return res.status(403).json({ error: 'Challenge belum dibuka kepada pelajar' });
    }

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
  const { answers: submittedAnswers, startedAt } = req.body;
  const studentEmail = req.headers.email;

  try {
    const user = await User.findOne({ email: studentEmail });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const challenge = await Challenge.findById(id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    // 🧠 Prevent duplicate attempt
    const existing = await ChallengeAttempt.findOne({
      challenge: id,
      student: user._id,
    });
    if (existing) {
      return res.status(400).json({ error: 'Anda telah menyertai cabaran ini.' });
    }

    // Preprocess submitted answers into a Map for efficient lookup
    const submittedMap = new Map();
    for (const answer of submittedAnswers) {
      if (answer?.questionId) {
        submittedMap.set(String(answer.questionId), {
          selected: Array.isArray(answer.selected) ? answer.selected.map(Number) : [],
          usedHelp: answer.usedHelp || false,
        });
      }
    }

    const evaluatedAnswers = [];
    let correctCount = 0;
    let totalPoints = 0;

    for (const q of challenge.questions) {
      const qid = String(q._id);
      const submitted = submittedMap.get(qid) || { selected: [], usedHelp: false };
      const selected = submitted.selected;
      const usedHelp = submitted.usedHelp;

      const correct = q.correct.map(Number);

      const isCorrect =
        selected.length === correct.length &&
        selected.every((s) => correct.includes(s)) &&
        correct.every((c) => selected.includes(c));

      const pointsEarned = isCorrect ? q.points : 0;
      if (isCorrect) correctCount++;
      totalPoints += pointsEarned;

      //console.log(`QID: ${qid}, Selected: [${selected}], Correct: [${correct}], isCorrect: ${isCorrect}`);

      evaluatedAnswers.push({
        questionId: q._id,
        selected,
        correct,
        isCorrect,
        pointsEarned,
        usedHelp,
      });
    }

    await ChallengeAttempt.create({
      challenge: id,
      student: user._id,
      studentEmail: user.email,
      answers: evaluatedAnswers,
      correctCount,
      totalPoints,
      submittedAt: new Date(),
      startedAt: new Date(startedAt),
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
    const rawAttempts = await ChallengeAttempt.find({ challenge: id }).populate('student', 'username email');

// Map to store best attempt per student
const bestAttemptsMap = new Map();

for (const attempt of rawAttempts) {
  const key = String(attempt.student?._id || attempt.studentEmail);
  const existing = bestAttemptsMap.get(key);

  const isBetter =
    !existing ||
    attempt.totalPoints > existing.totalPoints ||
    (attempt.totalPoints === existing.totalPoints &&
     new Date(attempt.submittedAt) < new Date(existing.submittedAt));

  if (isBetter) {
    bestAttemptsMap.set(key, attempt);
  }
}

const bestAttempts = [...bestAttemptsMap.values()].sort((a, b) => {
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
  return new Date(a.submittedAt) - new Date(b.submittedAt);
});

const formatted = bestAttempts.map((a, index) => {
  const timeTakenMs = new Date(a.submittedAt) - new Date(a.startedAt || a.submittedAt);
  const minutes = Math.floor(timeTakenMs / 60000);
  const seconds = Math.floor((timeTakenMs % 60000) / 1000);

  return {
    rank: index + 1,
    studentName: a.student?.username || a.student?.email || a.studentEmail,
    totalPoints: a.totalPoints,
    correctCount: a.correctCount,
    submittedAt: a.submittedAt,
    timeTaken: `${minutes}m ${seconds}s`,
  };
});

res.status(200).json(formatted);

  } catch (err) {
    console.error('Leaderboard Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/challenge-attempts/student
exports.getStudentAttempts = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.headers.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const attempts = await ChallengeAttempt.find({ student: user._id });
    res.status(200).json(attempts);
  } catch (err) {
    console.error('Get Attempts Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getStudentAchievements = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Fetch all the student's attempts, with challenge populated
    const attempts = await ChallengeAttempt.find({ student: studentId })
      .populate('challenge')
      .lean();

    const achievements = [];

    for (const attempt of attempts) {
      if (!attempt.challenge) continue; // skip if challenge is missing (shouldn't happen)

      const allAttempts = await ChallengeAttempt.find({ challenge: attempt.challenge._id }).lean();

      // Find the best attempt per student
      const bestMap = new Map();
      for (const a of allAttempts) {
        const key = String(a.student);
        const existing = bestMap.get(key);
        const isBetter =
          !existing ||
          a.totalPoints > existing.totalPoints ||
          (a.totalPoints === existing.totalPoints &&
           new Date(a.submittedAt) < new Date(existing.submittedAt));
        if (isBetter) bestMap.set(key, a);
      }

      const sorted = [...bestMap.values()].sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      });

      const rank = sorted.findIndex(a => String(a.student) === String(studentId)) + 1;

      achievements.push({
        title: attempt.challenge.title,
        date: attempt.createdAt,
        rank: rank > 0 ? rank : 'N/A',
      });
    }

    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

exports.deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Challenge.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.status(200).json({ message: 'Challenge deleted successfully' });
  } catch (err) {
    console.error('Delete Challenge Error:', err);
    res.status(500).json({ error: 'Server error deleting challenge' });
  }
};