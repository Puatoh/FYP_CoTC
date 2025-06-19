// server/controllers/forumT1Controller.js
const ForumT1 = require('../models/forumT1Model');

/**
 * GET   /api/forum-tingkatan-1
 *   - Must run verifyUser first (so req.user is set). 
 *   - Returns a list of all topics (title, description, createdAt, updatedAt).
 */
exports.getAllForumT1 = async (req, res) => {
  try {
    const topics = await ForumT1.find().sort({ createdAt: -1 });
    return res.json(topics);
  } catch (err) {
    console.error('Get all ForumT1 error:', err);
    return res.status(500).json({ message: 'Server error while fetching topics' });
  }
};

/**
 * GET   /api/forum-tingkatan-1/:id
 *   - Must run verifyUser first.  
 *   - Returns a single topic by its _id.
 */
exports.getForumT1ById = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await ForumT1.findById(id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    return res.json(topic);
  } catch (err) {
    console.error('Get ForumT1 by ID error:', err);
    return res.status(500).json({ message: 'Server error while fetching topic' });
  }
};

/**
 * POST  /api/forum-tingkatan-1
 *   - Must run verifyAdmin first.  
 *   - Creates a new topic (title + description).
 */
exports.createForumT1 = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    const newTopic = new ForumT1({
      title: title.trim(),
      description: description.trim()
    });
    await newTopic.save();
    return res.status(201).json({ message: 'Topic created', topic: newTopic });
  } catch (err) {
    console.error('Create ForumT1 error:', err);
    return res.status(500).json({ message: 'Server error while creating topic' });
  }
};

/**
 * PUT   /api/forum-tingkatan-1/:id
 *   - Must run verifyAdmin first.  
 *   - Updates an existing topic’s title or description.
 */
exports.updateForumT1 = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const topic = await ForumT1.findById(id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (title) topic.title = title.trim();
    if (description) topic.description = description.trim();
    await topic.save();
    return res.json({ message: 'Topic updated', topic });
  } catch (err) {
    console.error('Update ForumT1 error:', err);
    return res.status(500).json({ message: 'Server error while updating topic' });
  }
};

/**
 * DELETE /api/forum-tingkatan-1/:id
 *   - Must run verifyAdmin first.  
 *   - Deletes the topic.
 */
exports.deleteForumT1 = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await ForumT1.findByIdAndDelete(id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    return res.json({ message: 'Topic deleted' });
  } catch (err) {
    console.error('Delete ForumT1 error:', err);
    return res.status(500).json({ message: 'Server error while deleting topic' });
  }
};
