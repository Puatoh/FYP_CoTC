const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { uploadProfilePhoto } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

const storageProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Preserve extension
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  // Accept only jpg/jpeg/png
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png allowed'));
  }
};
const uploadProfile = multer({
  storage: storageProfile,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter
});



router.post('/register',      authController.register);
router.post('/login',         authController.login);
// // server/routes/authRoutes.js
// router.get('/me', verifyToken, authController.getMe);

// // server/controllers/authController.js
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findOne({ firebaseUid: req.uid });
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json({ username: user.username, role: user.role });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error fetching current user' });
//   }
// };

// CRUD avatar
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/profile/photo', uploadProfile.single('avatar'), authController.uploadProfilePhoto);
router.delete('/profile/photo', authController.deleteProfilePhoto);


module.exports = router;