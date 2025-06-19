// server/controllers/forumT1ReplyController.js
const Reply = require('../models/forumT1ReplyModel');

// GET all replies for a comment
exports.getReplies = async (req, res) => {
  const { commentId } = req.params;
  const replies = await Reply.find({ comment: commentId }).sort('createdAt');
  res.json(replies);
};

// POST a new reply
exports.addReply = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userEmail = req.user.email;       // from verifyUser
  const userName  = req.user.username;    // assuming you populate it

  const reply = await Reply.create({
    comment:   commentId,
    authorEmail: userEmail,
    authorUsername: userName,
    content,
  });
  res.status(201).json(reply);
};

// PUT update a reply
exports.updateReply = async (req, res) => {
  const { replyId } = req.params;
  const { content } = req.body;
  const reply = await Reply.findById(replyId);
  if (!reply) return res.status(404).json({ message: 'Not found' });

  if (reply.authorEmail !== req.user.email)
    return res.status(403).json({ message: 'Forbidden' });

  reply.content = content;
  await reply.save();
  res.json(reply);
};

// DELETE a reply
exports.deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const reply = await Reply.findById(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    if (reply.authorEmail !== req.user.email) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Use deleteOne on the model to remove the document
    await Reply.deleteOne({ _id: replyId });
    return res.status(204).end();
  } catch (err) {
    console.error('Error in deleteReply:', err);
    return res.status(500).json({ message: 'Server error deleting reply' });
  }
};
