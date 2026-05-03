const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['Admin', 'Member'],
        default: 'Member',
      },
    },
  ],
  status: {
    type: String,
    enum: ['Active', 'Completed', 'On Hold', 'Archived'],
    default: 'Active',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  category: {
    type: String,
    enum: ['Development', 'Design', 'Marketing', 'Planning', 'Other'],
    default: 'Development',
  },
  dueDate: {
    type: Date,
  },
  coverImage: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
