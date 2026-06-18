const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: {
        values: ['created', 'updated', 'status_changed', 'note_added', 'deleted'],
        message: '{VALUE} is not a valid activity action',
      },
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    changes: {
      type: Object, // Dynamic object to store { field: { old, new } } snapshots
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need to know when activity occurred
  }
);

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
