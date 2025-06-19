// server/routes/exerciseRoutes.js
const express = require('express');
const router = express.Router();

const exerciseCtrl = require('../controllers/exerciseController');
const { verifyUser, verifyAdmin } = require('../middleware/authMiddleware');

/**
 * Base is “/api/exercises”, as mounted in server.js. We support:
 *   - GET    /tingkatan1/:moduleId              → list all exercises in that module
 *   - GET    /tingkatan1/:moduleId/:exerciseId   → get one exercise
 *   - POST   /tingkatan1/:moduleId               → create new exercise in that module
 *   - PUT    /tingkatan1/:moduleId/:exerciseId   → update an exercise
 *   - DELETE /tingkatan1/:moduleId/:exerciseId   → delete an exercise
 */

// Any logged-in user can read:
router.get(
  '/tingkatan1/:moduleId',
  verifyUser,
  exerciseCtrl.getExercisesByModule
);
router.get(
  '/tingkatan1/:moduleId/:exerciseId',
  verifyUser,
  exerciseCtrl.getExerciseById
);

// Only admins can create/update/delete:
router.post(
  '/tingkatan1/:moduleId',
  verifyAdmin,
  exerciseCtrl.createExercise
);
router.put(
  '/tingkatan1/:moduleId/:exerciseId',
  verifyAdmin,
  exerciseCtrl.updateExercise
);
router.delete(
  '/tingkatan1/:moduleId/:exerciseId',
  verifyAdmin,
  exerciseCtrl.deleteExercise
);

module.exports = router;
