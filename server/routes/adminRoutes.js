const express = require('express');
const router = express.Router();
const { getAllStudentsWithProgress } = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/students', verifyAdmin, getAllStudentsWithProgress);

module.exports = router;
