const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Get all leads with filtering, searching, sorting, and pagination
 * @route   GET /api/leads
 * @access  Private
 */
const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      source,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by source
    if (source) {
      query.source = source;
    }

    // Search query (text search or partial regex search)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination calculations
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortQuery = { [sortBy]: sortOrder };

    // Fetch leads and total count
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email role')
      .populate('notes.createdBy', 'name email')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    const totalLeads = await Lead.countDocuments(query);
    const totalPages = Math.ceil(totalLeads / limitNum);

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: totalLeads,
      pages: totalPages,
    };

    return sendSuccess(res, 200, 'Leads retrieved successfully', leads, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single lead by ID
 * @route   GET /api/leads/:id
 * @access  Private
 */
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('notes.createdBy', 'name email');

    if (!lead) {
      return sendError(res, 404, 'Lead not found');
    }

    return sendSuccess(res, 200, 'Lead details retrieved successfully', lead);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new lead
 * @route   POST /api/leads
 * @access  Private (Admin, Manager)
 */
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, company, status, source, value, assignedTo } = req.body;

    // Assign to logged-in user if not specified
    const assignedUserId = assignedTo || req.user._id;

    // Create lead
    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      status: status || 'new',
      source: source || 'website',
      value: value || 0,
      assignedTo: assignedUserId,
    });

    // Populate user info for returning response
    await lead.populate('assignedTo', 'name email role');

    // Log activity
    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      action: 'created',
      description: `Lead '${lead.name}' created and assigned to ${lead.assignedTo.name}`,
    });

    return sendSuccess(res, 201, 'Lead created successfully', lead);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a lead
 * @route   PUT /api/leads/:id
 * @access  Private (Admin, Manager)
 */
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return sendError(res, 404, 'Lead not found');
    }

    const originalLead = lead.toObject();
    const updates = {};
    const fieldsToUpdate = ['name', 'email', 'phone', 'company', 'status', 'source', 'value', 'assignedTo'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
        if (originalLead[field]?.toString() !== req.body[field]?.toString()) {
          updates[field] = {
            old: originalLead[field],
            new: req.body[field],
          };
        }
      }
    });

    // If no fields changed
    if (Object.keys(updates).length === 0) {
      return sendSuccess(res, 200, 'No modifications made', lead);
    }

    // Save changes
    const updatedLead = await lead.save();
    await updatedLead.populate('assignedTo', 'name email role');
    await updatedLead.populate('notes.createdBy', 'name email');

    // Log activity
    let description = `Lead details updated by ${req.user.name}`;
    let actionType = 'updated';

    if (updates.status) {
      actionType = 'status_changed';
      description = `Lead status changed from '${updates.status.old}' to '${updates.status.new}' by ${req.user.name}`;
    }

    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      action: actionType,
      description,
      changes: updates,
    });

    return sendSuccess(res, 200, 'Lead updated successfully', updatedLead);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update lead status only
 * @route   PATCH /api/leads/:id/status
 * @access  Private (Admin, Manager)
 */
const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return sendError(res, 404, 'Lead not found');
    }

    const oldStatus = lead.status;
    if (oldStatus === status) {
      return sendSuccess(res, 200, 'Status remains unchanged', lead);
    }

    lead.status = status;
    await lead.save();
    await lead.populate('assignedTo', 'name email role');
    await lead.populate('notes.createdBy', 'name email');

    // Log Activity
    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      action: 'status_changed',
      description: `Lead status updated from '${oldStatus}' to '${status}' by ${req.user.name}`,
      changes: {
        status: { old: oldStatus, new: status },
      },
    });

    return sendSuccess(res, 200, 'Lead status updated successfully', lead);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a lead
 * @route   DELETE /api/leads/:id
 * @access  Private (Admin only)
 */
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return sendError(res, 404, 'Lead not found');
    }

    // Delete lead
    await Lead.deleteOne({ _id: req.params.id });

    // Log activity
    await Activity.create({
      leadId: req.params.id,
      userId: req.user._id,
      action: 'deleted',
      description: `Lead '${lead.name}' deleted by ${req.user.name}`,
    });

    return sendSuccess(res, 200, `Lead '${lead.name}' deleted successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add follow-up note to lead
 * @route   POST /api/leads/:id/notes
 * @access  Private (Admin, Manager)
 */
const addLeadNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return sendError(res, 404, 'Lead not found');
    }

    // Add note to embedded array
    lead.notes.push({
      content,
      createdBy: req.user._id,
    });

    await lead.save();
    
    // Populate references
    await lead.populate('assignedTo', 'name email role');
    await lead.populate('notes.createdBy', 'name email');

    // Log Activity
    await Activity.create({
      leadId: lead._id,
      userId: req.user._id,
      action: 'note_added',
      description: `Note added to Lead '${lead.name}' by ${req.user.name}`,
    });

    return sendSuccess(res, 201, 'Note added successfully', lead);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  addLeadNote,
};
