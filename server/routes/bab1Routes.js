const express = require('express');
const router = express.Router();
const bab1Controller = require('../controllers/bab1Controller');
const { verifyAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save to /uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
router.post('/', verifyAdmin, upload.single('pdf'), bab1Controller.createBab1);
router.get('/', bab1Controller.getAllBab1); // Public
router.put('/:id', verifyAdmin, upload.single('pdf'), bab1Controller.updateBab1);
router.delete('/:id', verifyAdmin, bab1Controller.deleteBab1);

module.exports = router;
