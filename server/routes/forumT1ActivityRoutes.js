const express = require('express');
const router = express.Router();
const { getRecentActivity } = require('../controllers/forumT1ActivityController');
const { verifyUser } = require('../middleware/authMiddleware');

router.get('/activity', verifyUser, getRecentActivity);

module.exports = router;
