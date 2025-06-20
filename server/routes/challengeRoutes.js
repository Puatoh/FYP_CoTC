const express = require('express');
const router = express.Router();
const {
  createChallenge,
  updateChallenge,
  getChallengeById,
  getAllChallenges,
  submitChallengeAnswers,
  getChallengeLeaderboard
} = require('../controllers/challengeController');
const { verifyAdmin, verifyUser } = require('../middleware/authMiddleware');

router.get('/', verifyUser, getAllChallenges);
router.get('/:id', verifyUser, getChallengeById);
router.post('/', verifyAdmin, createChallenge);
router.post('/:id/submit', verifyUser, submitChallengeAnswers);
router.put('/:id', verifyAdmin, updateChallenge);

router.get('/:id/leaderboard', verifyUser, getChallengeLeaderboard);

module.exports = router;
