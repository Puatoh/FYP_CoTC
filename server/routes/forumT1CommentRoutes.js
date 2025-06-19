// server/routes/forumT1CommentRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/forumT1CommentController');
const { verifyUser } = require('../middleware/authMiddleware');

// All endpoints here require a valid user email:
router.use(verifyUser);

// GET   /api/forum-tingkatan-1/:topicId/comments
router.get('/', commentController.getCommentsByTopic);

// POST  /api/forum-tingkatan-1/:topicId/comments
router.post('/', commentController.addComment);

// PUT   /api/forum-tingkatan-1/:topicId/comments/:commentId
router.put('/:commentId', commentController.updateComment);

// DELETE /api/forum-tingkatan-1/:topicId/comments/:commentId
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;