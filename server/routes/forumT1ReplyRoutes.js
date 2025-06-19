// server/routes/forumT1ReplyRoutes.js
const express = require('express');
const {
  getReplies,
  addReply,
  updateReply,
  deleteReply,
} = require('../controllers/forumT1ReplyController');
const { verifyUser, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

/**
 * All routes here are under:
 *   /api/forum-tingkatan-1/:topicId/comments/:commentId/replies
 * and require a valid user.
 */
router.use(verifyUser);

// GET   /               → list all replies for this comment
router.get('/', getReplies);

// POST  /               → create a new reply
router.post('/', addReply);

// PUT   /:replyId       → update an existing reply (author only)
router.put('/:replyId', updateReply);

// DELETE/:replyId       → delete an existing reply (author only)
router.delete('/:replyId', deleteReply);

module.exports = router;
