const ForumT1        = require('../models/forumT1Model');
const ForumT1Comment = require('../models/forumT1CommentModel');

/** Build a nested tree from a flat list */
function buildCommentTree(flat) {
  const byId = {};
  flat.forEach(c => byId[c._id] = { ...c.toObject(), children: [] });
  const roots = [];
  flat.forEach(c => {
    if (c.parentComment) {
      const p = byId[c.parentComment];
      if (p) p.children.push(byId[c._id]);
    } else {
      roots.push(byId[c._id]);
    }
  });
  return roots;
}

/** GET   /api/forum-tingkatan-1/:topicId/comments */
exports.getCommentsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await ForumT1.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const all = await ForumT1Comment.find({ topicId }).sort('createdAt');
    return res.json(buildCommentTree(all));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error fetching comments' });
  }
};

/** POST  /api/forum-tingkatan-1/:topicId/comments */
exports.addComment = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content, parentComment = null } = req.body;
    const authorEmail    = req.headers.email;
    const authorUsername = req.user.username;

    if (!authorEmail) return res.status(401).json({ message: 'Missing email header' });
    if (!content?.trim())  return res.status(400).json({ message: 'Content is required' });

    const topic = await ForumT1.findById(topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    // if replying, validate parent
    let parentId = null;
    if (parentComment) {
      const p = await ForumT1Comment.findById(parentComment);
      if (!p || p.topicId.toString() !== topicId)
        return res.status(400).json({ message: 'Invalid parent comment' });
      parentId = parentComment;
    }

    const c = new ForumT1Comment({
      topicId,
      authorEmail,
      authorUsername,
      content: content.trim(),
      parentComment: parentId
    });
    await c.save();
    return res.status(201).json(c);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error adding comment' });
  }
};

/** PUT   /api/forum-tingkatan-1/:topicId/comments/:commentId */
exports.updateComment = async (req, res) => {
  try {
    const { topicId, commentId } = req.params;
    const { content } = req.body;
    const me = req.user.username;

    if (!content?.trim()) return res.status(400).json({ message: 'Content is required' });

    const c = await ForumT1Comment.findById(commentId);
    if (!c || c.topicId.toString() !== topicId)
      return res.status(404).json({ message: 'Comment not found' });

    if (c.authorUsername !== me)
      return res.status(403).json({ message: 'Forbidden: not your comment' });

    c.content = content.trim();
    await c.save();
    return res.json({ message: 'Comment updated', comment: c });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error updating comment' });
  }
};

/** DELETE /api/forum-tingkatan-1/:topicId/comments/:commentId */
exports.deleteComment = async (req, res) => {
  try {
    const { topicId, commentId } = req.params;
    const me = req.user.username;

    const c = await ForumT1Comment.findById(commentId);
    if (!c || c.topicId.toString() !== topicId)
      return res.status(404).json({ message: 'Comment not found' });

    if (c.authorUsername !== me)
      return res.status(403).json({ message: 'Forbidden: not your comment' });

    // recursively delete
    await (async function del(id) {
      const kids = await ForumT1Comment.find({ parentComment: id });
      for (let k of kids) await del(k._id);
      await ForumT1Comment.findByIdAndDelete(id);
    })(commentId);

    return res.json({ message: 'Comment and replies deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error deleting comment' });
  }
};
