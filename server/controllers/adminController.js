const User = require('../models/userModel');
const Attempt = require('../models/attemptModel');
const Exercise = require('../models/exerciseModel');

exports.getAllStudentsWithProgress = async (req, res) => {
  try {
    // 1. Get all students
    const students = await User.find({ role: 'student' }).select('username email');

    // 2. Get all exercises (used to calculate total exercise count)
    const allExercises = await Exercise.find().select('_id');
    const totalExercises = allExercises.length;

    // 3. For each student, calculate how many unique exercises they attempted
    const enriched = await Promise.all(
      students.map(async (student) => {
        const attempts = await Attempt.find({ studentId: student._id });

        // Flatten all answered exercise IDs from all module attempts
        const attemptedExerciseIds = new Set();
        attempts.forEach(attempt => {
          attempt.answers.forEach(answer => {
            attemptedExerciseIds.add(String(answer.exerciseId));
          });
        });

        const completedCount = attemptedExerciseIds.size;
        const percent = totalExercises > 0
          ? Math.round((completedCount / totalExercises) * 100)
          : 0;

        return {
          username: student.username,
          email: student.email,
          exerciseStats: `${completedCount} / ${totalExercises} (${percent}%)`,
        };
      })
    );

    return res.json(enriched);
  } catch (err) {
    console.error('Error fetching students with progress:', err);
    return res.status(500).json({ message: 'Server error fetching student progress' });
  }
};
