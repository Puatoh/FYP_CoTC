const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const attemptAdminCtrl = require('../controllers/attemptAdminController');

router.get(
  '/tingkatan1/:moduleId/admin',
  verifyAdmin,
  attemptAdminCtrl.getAttemptsByModule
);

module.exports = router;
