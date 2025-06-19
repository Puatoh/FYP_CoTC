// server/routes/moduleT1Routes.js
const express = require('express');
const router = express.Router();

const moduleCtrl = require('../controllers/moduleT1Controller');
const { verifyUser, verifyAdmin } = require('../middleware/authMiddleware');

// ANY authenticated user can READ all modules or a single module:
router.get('/tingkatan1', verifyUser, moduleCtrl.getAllModules);
router.get('/tingkatan1/:moduleId', verifyUser, moduleCtrl.getModuleById);

// ONLY admins can create/update/delete modules:
router.post('/tingkatan1', verifyAdmin, moduleCtrl.createModule);
router.put('/tingkatan1/:moduleId', verifyAdmin, moduleCtrl.updateModule);
router.delete('/tingkatan1/:moduleId', verifyAdmin, moduleCtrl.deleteModule);

module.exports = router;
