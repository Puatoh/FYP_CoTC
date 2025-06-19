// server/middleware/authMiddleware.js
const User = require('../models/userModel');

/**
 * verifyUser:  
 *   - Expects `req.headers.email`.  
 *   - If missing or not found, 401.  
 *   - Otherwise sets `req.user = <UserDocument>` and next().
 */
exports.verifyUser = async (req, res, next) => {
  try {
    const userEmail = req.headers.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized: Missing email header' });
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    req.user = user; // attach the entire user document
    next();
  } catch (err) {
    console.error('AuthMiddleware.verifyUser error:', err);
    return res.status(500).json({ message: 'Server error during authorization' });
  }
};

/**
 * verifyAdmin:  
 *   - First calls verifyUser, then checks `req.user.role === 'admin'`.  
 *   - If not admin, 403.  Otherwise next().
 */
exports.verifyAdmin = async (req, res, next) => {
  try {
    // Re-use verifyUser first
    await exports.verifyUser(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
      }
      next();
    });
  } catch (err) {
    console.error('AuthMiddleware.verifyAdmin error:', err);
    return res.status(500).json({ message: 'Server error during admin check' });
  }
};
