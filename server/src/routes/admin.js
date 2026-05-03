const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update user role (Admin only)
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
router.patch('/users/:id/role', protect, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user: { id: user._id, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get system-wide analytics (Admin only)
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', protect, isAdmin, async (req, res) => {
  try {
    const Task = require('../models/Task');
    const User = require('../models/User');
    const Project = require('../models/Project');

    // Get all users
    const users = await User.find({}).select('name email');
    
    // Get stats for each user
    const userStats = await Promise.all(users.map(async (u) => {
      const tasks = await Task.find({ assignedTo: u._id });
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        todo: tasks.filter(t => t.status === 'Todo').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        total: tasks.length
      };
    }));

    // Get all projects
    const projects = await Project.find({});
    const projectStats = await Promise.all(projects.map(async (p) => {
      const totalTasks = await Task.countDocuments({ projectId: p._id });
      const completedTasks = await Task.countDocuments({ projectId: p._id, status: 'Completed' });
      return {
        _id: p._id,
        name: p.name,
        totalTasks,
        completedTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        status: p.status || 'Active'
      };
    }));

    // Get recent activities (last 15 updated tasks)
    const recentTasks = await Task.find({})
      .sort({ updatedAt: -1 })
      .limit(15)
      .populate('projectId', 'name');
    
    const recentActivities = recentTasks.map(t => ({
      type: 'TASK_UPDATED',
      data: {
        task: t.title,
        project: t.projectId?.name || 'Unknown Project',
        status: t.status,
        user: 'System' // We don't store the last modifier in Task model yet, so use 'System' or similar
      },
      timestamp: t.updatedAt
    }));

    res.json({
      userStats,
      projectStats,
      recentActivities
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
