const express = require('express');
const router = express.Router();
const {
  createChallenge,
  updateChallenge,
  getChallengeById,
  getAllChallenges,
  submitChallengeAnswers,
  getChallengeLeaderboard,
  getStudentAttempts,
  getStudentAchievements,
  deleteChallenge
} = require('../controllers/challengeController');
const { verifyAdmin, verifyUser } = require('../middleware/authMiddleware');

router.get('/', verifyUser, getAllChallenges);
router.get('/:id', verifyUser, getChallengeById);
router.get('/challenge-attempts/student', verifyUser, getStudentAttempts);
router.get('/challenge-attempts/student/achievements', verifyUser, getStudentAchievements);
router.post('/', verifyAdmin, createChallenge);
router.put('/:id', verifyAdmin, updateChallenge);
router.delete('/:id', verifyAdmin, deleteChallenge);

router.post('/:id/submit', verifyUser, submitChallengeAnswers);
router.get('/:id/leaderboard', verifyUser, getChallengeLeaderboard);

module.exports = router;
