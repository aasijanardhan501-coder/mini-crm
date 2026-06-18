const User     = require('../models/User');
const Lead     = require('../models/Lead');
const Activity = require('../models/Activity');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─── Helper: build safe user object (no password) ────────────────────────────
const safeUser = (user) => ({
  _id:        user._id,
  name:       user.name,
  email:      user.email,
  role:       user.role,
  createdAt:  user.createdAt,
  lastLogin:  user.lastLogin,
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check for existing account
    const exists = await User.findOne({ email });
    if (exists) {
      return sendError(res, 409, 'An account with this email already exists. Please sign in instead.');
    }

    // Create user (password hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'admin',
    });

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 201, 'Account created successfully! Welcome to Mini CRM.', {
      user: safeUser(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user — explicitly select password field (select: false in schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // ── Record last login timestamp ──────────────────────────────────────────
    user.lastLogin = new Date();
    await user.save({ validateModifiedOnly: true });

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 200, `Welcome back, ${user.name}!`, {
      user: safeUser(user),
      token,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getUserProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'Profile retrieved successfully', {
      user: safeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update logged-in user profile
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, 'User not found');

    if (req.body.name)  user.name  = req.body.name;

    if (req.body.email && req.body.email !== user.email) {
      const taken = await User.findOne({ email: req.body.email });
      if (taken) return sendError(res, 409, 'Email is already in use by another account');
      user.email = req.body.email;
    }

    if (req.body.password) {
      user.password = req.body.password; // pre-save hook will hash it
    }

    const updated = await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: safeUser(updated),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all users (for assignment dropdowns)
// @route   GET /api/auth/users
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role');
    return sendSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get CRM statistics for the logged-in user's profile
// @route   GET /api/auth/profile/stats
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getProfileStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Run all aggregations in parallel for performance
    const [leadStats, notesAdded] = await Promise.all([
      // ── Lead counts by status for this user ─────────────────────────────
      Lead.aggregate([
        { $match: { assignedTo: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // ── Notes added by this user across all leads ────────────────────────
      Lead.aggregate([
        { $unwind: { path: '$notes', preserveNullAndEmptyArrays: false } },
        { $match: { 'notes.createdBy': userId } },
        { $count: 'total' },
      ]),
    ]);

    // Parse lead aggregation results into a map
    const statusMap = leadStats.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {});

    const totalLeads     = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const contactedLeads = statusMap['contacted']  || 0;
    const convertedLeads = statusMap['converted']  || 0;
    const totalNotes     = notesAdded[0]?.total    || 0;

    return sendSuccess(res, 200, 'Profile stats retrieved successfully', {
      totalLeads,
      contactedLeads,
      convertedLeads,
      notesAdded: totalNotes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getProfileStats,
};
