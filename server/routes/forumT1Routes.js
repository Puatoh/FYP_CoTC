// server/routes/forumT1Routes.js
const express = require('express');
const router = express.Router();
const forumT1Controller = require('../controllers/forumT1Controller');
const { verifyUser, verifyAdmin } = require('../middleware/authMiddleware');

// Any existing user can read:
router.get('/', verifyUser, forumT1Controller.getAllForumT1);
router.get('/:id', verifyUser, forumT1Controller.getForumT1ById);

// Only admins can create, update, delete:
router.post('/', verifyAdmin, forumT1Controller.createForumT1);
router.put('/:id', verifyAdmin, forumT1Controller.updateForumT1);
router.delete('/:id', verifyAdmin, forumT1Controller.deleteForumT1);

module.exports = router;
