const express = require('express');
const router = express.Router();
const { verifyUser } = require('../middleware/authMiddleware');
const attemptCtrl = require('../controllers/attemptController');

router.post(
  '/tingkatan1/:moduleId',
  verifyUser,
  attemptCtrl.createAttempt
);
router.get(
  '/tingkatan1/:moduleId',
  verifyUser,
  attemptCtrl.getAttempt
);
router.put(
  '/:attemptId/feedback',
  verifyUser,
  attemptCtrl.updateFeedback
);

module.exports = router;
