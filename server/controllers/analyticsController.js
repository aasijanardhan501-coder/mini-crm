const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * @desc    Get dashboard overview stats (KPIs)
 * @route   GET /api/analytics/overview
 * @access  Private
 */
const getOverviewStats = async (req, res, next) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });

    // Calculate conversion rate percentage
    const conversionRate = totalLeads > 0 
      ? Math.round((convertedLeads / totalLeads) * 100) 
      : 0;

    // Pipeline Value Aggregation (sum of value for active/unconverted leads, or all leads)
    const pipelineSum = await Lead.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$value' },
        },
      },
    ]);

    const totalPipelineValue = pipelineSum.length > 0 ? pipelineSum[0].totalValue : 0;

    const data = {
      totalLeads,
      newLeads,
      convertedLeads,
      conversionRate,
      totalPipelineValue,
    };

    return sendSuccess(res, 200, 'Overview stats retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get lead counts grouped by status
 * @route   GET /api/analytics/leads-by-status
 * @access  Private
 */
const getLeadsByStatus = async (req, res, next) => {
  try {
    const statusData = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          value: { $sum: '$value' },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          value: 1,
          _id: 0,
        },
      },
    ]);

    return sendSuccess(res, 200, 'Leads by status retrieved successfully', statusData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get lead counts grouped by source
 * @route   GET /api/analytics/leads-by-source
 * @access  Private
 */
const getLeadsBySource = async (req, res, next) => {
  try {
    const sourceData = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          value: { $sum: '$value' },
        },
      },
      {
        $project: {
          source: '$_id',
          count: 1,
          value: 1,
          _id: 0,
        },
      },
    ]);

    return sendSuccess(res, 200, 'Leads by source retrieved successfully', sourceData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get lead creation trend over the last 6 months
 * @route   GET /api/analytics/leads-over-time
 * @access  Private
 */
const getLeadsOverTime = async (req, res, next) => {
  try {
    // Get date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of the month
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trendData = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          value: { $sum: '$value' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
          value: 1,
          _id: 0,
        },
      },
    ]);

    return sendSuccess(res, 200, 'Leads trend over time retrieved successfully', trendData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent activities across the CRM
 * @route   GET /api/analytics/recent-activity
 * @access  Private
 */
const getRecentActivities = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.leadId) {
      query.leadId = req.query.leadId;
    }

    const activities = await Activity.find(query)
      .populate('userId', 'name email role')
      .populate('leadId', 'name email status')
      .sort({ createdAt: -1 })
      .limit(10);

    return sendSuccess(res, 200, 'Recent activities retrieved successfully', activities);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverviewStats,
  getLeadsByStatus,
  getLeadsBySource,
  getLeadsOverTime,
  getRecentActivities,
};
