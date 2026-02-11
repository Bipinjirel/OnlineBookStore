const { db } = require('../config/firebase');

/**
 * Admin authorization middleware
 * Checks if user has isAdmin = true in Firestore
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Authentication required',
      });
    }

    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - User not found in database',
      });
    }

    const userData = userDoc.data();

    if (!userData.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Admin access required',
      });
    }

    req.userData = userData;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authorization',
    });
  }
};

const checkAdminStatus = async (req, res, next) => {
  try {
    if (!req.user || !req.user.uid) {
      req.isAdmin = false;
      return next();
    }

    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (userDoc.exists) {
      req.isAdmin = userDoc.data().isAdmin || false;
    } else {
      req.isAdmin = false;
    }

    next();
  } catch (error) {
    console.error('Check admin status error:', error.message);
    req.isAdmin = false;
    next();
  }
};

module.exports = { requireAdmin, checkAdminStatus };
