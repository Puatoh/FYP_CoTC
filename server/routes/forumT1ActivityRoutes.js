const express = require('express');
const router = express.Router();
const { getRecentActivity } = require('../controllers/forumT1ActivityController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/activity', verifyAdmin, getRecentActivity);

module.exports = router;
