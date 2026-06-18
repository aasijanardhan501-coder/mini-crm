const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  addLeadNote,
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createLeadValidator,
  updateLeadValidator,
  updateStatusValidator,
  addNoteValidator,
} = require('../validators/leadValidator');

// Helper to validate mongo ID parameter
const validateId = [
  param('id').isMongoId().withMessage('Invalid lead ID format'),
  validate,
];

// All routes require authentication
router.use(protect);

// GET /api/leads - List leads (all roles)
// POST /api/leads - Create lead (admin, manager)
router.route('/')
  .get(getLeads)
  .post(authorize('admin', 'manager'), createLeadValidator, validate, createLead);

// GET /api/leads/:id - Single lead detail (all roles)
// PUT /api/leads/:id - Update lead details (admin, manager)
// DELETE /api/leads/:id - Delete lead (admin only)
router.route('/:id')
  .get(validateId, getLeadById)
  .put(authorize('admin', 'manager'), updateLeadValidator, validate, updateLead)
  .delete(authorize('admin'), validateId, deleteLead);

// PATCH /api/leads/:id/status - Update lead status (admin, manager)
router.patch('/:id/status', authorize('admin', 'manager'), updateStatusValidator, validate, updateLeadStatus);

// POST /api/leads/:id/notes - Add notes to lead (admin, manager)
router.post('/:id/notes', authorize('admin', 'manager'), addNoteValidator, validate, addLeadNote);

module.exports = router;
