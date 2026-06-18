const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need when note was created
  }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Lead name must be at least 2 characters'],
      maxlength: [100, 'Lead name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'contacted', 'qualified', 'converted', 'lost'],
        message: '{VALUE} is not a valid lead status',
      },
      default: 'new',
    },
    source: {
      type: String,
      enum: {
        values: ['website', 'referral', 'social', 'advertisement', 'other'],
        message: '{VALUE} is not a valid lead source',
      },
      default: 'website',
    },
    value: {
      type: Number,
      min: [0, 'Lead value cannot be negative'],
      default: 0,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead must be assigned to an admin/manager'],
    },
    notes: [noteSchema],
  },
  {
    timestamps: true,
  }
);

// Indexing for faster searching and filtering
leadSchema.index({ name: 'text', email: 'text', company: 'text' });
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ assignedTo: 1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;
