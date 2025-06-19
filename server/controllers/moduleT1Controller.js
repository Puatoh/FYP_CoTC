// server/controllers/moduleT1Controller.js
const ModuleT1 = require('../models/moduleT1Model');

/**
 * Create a new ModuleT1 (Admin only)
 * POST /api/modules/tingkatan1
 * Body: { title: String, description?: String }
 */
exports.createModule = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const newModule = new ModuleT1({
      title: title.trim(),
      description: description?.trim() || '',
      createdBy: req.user._id
    });
    await newModule.save();
    return res.status(201).json(newModule);
  } catch (err) {
    console.error('createModule error:', err);
    return res.status(500).json({ message: 'Server error creating module' });
  }
};

/**
 * Get all Modules (any authenticated user)
 * GET /api/modules/tingkatan1
 */
exports.getAllModules = async (req, res) => {
  try {
    const modules = await ModuleT1.find()
      .sort({ createdAt: -1 })
      .select('-__v');
    return res.json(modules);
  } catch (err) {
    console.error('getAllModules error:', err);
    return res.status(500).json({ message: 'Server error fetching modules' });
  }
};

/**
 * Get single Module by ID (any authenticated user)
 * GET /api/modules/tingkatan1/:moduleId
 */
exports.getModuleById = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const mod = await ModuleT1.findById(moduleId).select('-__v');
    if (!mod) return res.status(404).json({ message: 'Module not found' });
    return res.json(mod);
  } catch (err) {
    console.error('getModuleById error:', err);
    return res.status(500).json({ message: 'Server error fetching module' });
  }
};

/**
 * Update a Module (Admin only)
 * PUT /api/modules/tingkatan1/:moduleId
 */
exports.updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description } = req.body;
    const mod = await ModuleT1.findById(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    if (title && title.trim()) mod.title = title.trim();
    mod.description = typeof description === 'string' ? description.trim() : mod.description;
    await mod.save();
    return res.json(mod);
  } catch (err) {
    console.error('updateModule error:', err);
    return res.status(500).json({ message: 'Server error updating module' });
  }
};

/**
 * Delete a Module (Admin only)
 * DELETE /api/modules/tingkatan1/:moduleId
 * ---> Also should delete all exercises inside that module (optional).
 */
exports.deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const mod = await ModuleT1.findByIdAndDelete(moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    // Optionally remove all exercises that reference this module:
    const Exercise = require('../models/exerciseModel');
    await Exercise.deleteMany({ moduleId });

    return res.json({ message: 'Module (and its exercises) deleted' });
  } catch (err) {
    console.error('deleteModule error:', err);
    return res.status(500).json({ message: 'Server error deleting module' });
  }
};
