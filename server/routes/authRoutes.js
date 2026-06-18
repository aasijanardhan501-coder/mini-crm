const express = require('express');
const router  = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getProfileStats,
} = require('../controllers/authController');

const { protect }  = require('../middleware/authMiddleware');
const validate     = require('../middleware/validateMiddleware');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
} = require('../validators/authValidator');

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post('/register', registerValidator, validate, registerUser);
router.post('/login',    loginValidator,    validate, loginUser);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get ('/profile',       protect, getUserProfile);
router.put ('/profile',       protect, updateProfileValidator, validate, updateUserProfile);
router.get ('/profile/stats', protect, getProfileStats);
router.get ('/users',         protect, getUsers);

module.exports = router;

