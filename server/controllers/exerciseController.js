// server/controllers/exerciseController.js
const ExerciseT1 = require('../models/exerciseModel');
const ModuleT1   = require('../models/moduleT1Model');

/**
 * Create a new exercise under a given Module (Admin only)
 * POST /api/exercises/tingkatan1/:moduleId
 * Body: { question, options, correctAnswers }
 */
exports.createExercise = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { question, options, correctAnswers } = req.body;
    // Ensure module exists:
    const mod = await ModuleT1.findById(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    // Build exercise
    const newEx = new ExerciseT1({
      moduleId,
      question: question.trim(),
      options: options.map((o) => o.trim()),
      correctAnswers,
      createdBy: req.user._id
    });
    await newEx.save();
    return res.status(201).json(newEx);
  } catch (err) {
    console.error('createExercise error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Server error creating exercise' });
  }
};

/**
 * Get all exercises for a given module (any logged‐in user)
 * GET /api/exercises/tingkatan1/:moduleId
 */
exports.getExercisesByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    // Ensure module exists
    const mod = await ModuleT1.findById(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    const list = await ExerciseT1.find({ moduleId }).sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    console.error('getExercisesByModule error:', err);
    return res.status(500).json({ message: 'Server error fetching exercises' });
  }
};

/**
 * Get single exercise by ID (any logged‐in user)
 * GET /api/exercises/tingkatan1/:moduleId/:exerciseId
 */
exports.getExerciseById = async (req, res) => {
  try {
    const { moduleId, exerciseId } = req.params;
    // ensure module exists:
    const mod = await ModuleT1.findById(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    const ex = await ExerciseT1.findOne({ _id: exerciseId, moduleId });
    if (!ex) return res.status(404).json({ message: 'Exercise not found' });
    return res.json(ex);
  } catch (err) {
    console.error('getExerciseById error:', err);
    return res.status(500).json({ message: 'Server error fetching exercise' });
  }
};

/**
 * Update an exercise (Admin only)
 * PUT /api/exercises/tingkatan1/:moduleId/:exerciseId
 */
exports.updateExercise = async (req, res) => {
  try {
    const { moduleId, exerciseId } = req.params;
    const { question, options, correctAnswers } = req.body;

    // Ensure module exists
    const mod = await ModuleT1.findById(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    const ex = await ExerciseT1.findOne({ _id: exerciseId, moduleId });
    if (!ex) return res.status(404).json({ message: 'Exercise not found' });

    if (question) ex.question = question.trim();
    if (Array.isArray(options)) ex.options = options.map((o) => o.trim());
    if (Array.isArray(correctAnswers)) ex.correctAnswers = correctAnswers;
    await ex.save();
    return res.json(ex);
  } catch (err) {
    console.error('updateExercise error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Server error updating exercise' });
  }
};

/**
 * Delete an exercise (Admin only)
 * DELETE /api/exercises/tingkatan1/:moduleId/:exerciseId
 */
exports.deleteExercise = async (req, res) => {
  try {
    const { moduleId, exerciseId } = req.params;
    // Ensure module exists
    const mod = await ModuleT1.findById(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    const ex = await ExerciseT1.findOneAndDelete({ _id: exerciseId, moduleId });
    if (!ex) return res.status(404).json({ message: 'Exercise not found' });
    return res.json({ message: 'Exercise deleted' });
  } catch (err) {
    console.error('deleteExercise error:', err);
    return res.status(500).json({ message: 'Server error deleting exercise' });
  }
};
