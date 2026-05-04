const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const adminController = require('../controllers/adminController');

// @desc    Get system health (CPU, RAM, Disk)
// @route   GET /api/admin/system-health
// @access  Private/Admin
router.get('/system-health', protect, isAdmin, adminController.getSystemHealth);

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

// @desc    Update user status (Active/Inactive) (Admin only)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
router.patch('/users/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deactivating yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully`, user: { id: user._id, isActive: user.isActive } });
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

// @desc    Bulk delete users (Admin only)
// @route   POST /api/admin/users/bulk-delete
// @access  Private/Admin
router.post('/users/bulk-delete', protect, isAdmin, async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'No users selected' });
    }

    // Filter out current user to prevent self-deletion
    const filteredIds = userIds.filter(id => id !== req.user._id.toString());
    
    await User.deleteMany({ _id: { $in: filteredIds } });
    res.json({ message: `${filteredIds.length} users deleted successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Bulk update roles (Admin only)
// @route   POST /api/admin/users/bulk-role
// @access  Private/Admin
router.post('/users/bulk-role', protect, isAdmin, async (req, res) => {
  try {
    const { userIds, role } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0 || !['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Filter out current user to prevent accidental role change
    const filteredIds = userIds.filter(id => id !== req.user._id.toString());

    await User.updateMany(
      { _id: { $in: filteredIds } },
      { $set: { role: role } }
    );
    res.json({ message: `Roles updated to ${role} for ${filteredIds.length} users` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get system-wide analytics (Admin only)
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', protect, isAdmin, async (req, res) => {
  try {
    // Fetch all required data in parallel
    const [users, projects, allTasks] = await Promise.all([
      User.find({}).select('name email').lean(),
      Project.find({}).lean(),
      Task.find({}).lean()
    ]);
    
    // Process user stats in memory
    const userStats = users.map((u) => {
      const userTasks = allTasks.filter(t => 
        t.assignedTo && Array.isArray(t.assignedTo) && t.assignedTo.some(id => id && id.toString() === u._id.toString())
      );
      
      // Get unique project names for this user
      const userProjectIds = [...new Set(userTasks.map(t => t.projectId?.toString()).filter(Boolean))];
      const userProjects = projects
        .filter(p => userProjectIds.includes(p._id.toString()))
        .map(p => p.name);

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        todo: userTasks.filter(t => t.status === 'Todo').length,
        inProgress: userTasks.filter(t => t.status === 'In Progress').length,
        completed: userTasks.filter(t => t.status === 'Completed').length,
        total: userTasks.length,
        projects: userProjects // Added this field
      };
    });

    // Process project stats in memory
    const projectStats = projects.map((p) => {
      const projectTasks = allTasks.filter(t => t.projectId && t.projectId.toString() === p._id.toString());
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(t => t.status === 'Completed').length;
      return {
        _id: p._id,
        name: p.name,
        totalTasks,
        completedTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        status: p.status || 'Active'
      };
    });

    // Get recent activities
    const recentActivities = [...allTasks]
      .filter(t => t.updatedAt) // Ensure updatedAt exists
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 15)
      .map(t => {
        const project = projects.find(p => t.projectId && p._id.toString() === t.projectId.toString());
        return {
          type: 'TASK_UPDATED',
          data: {
            task: t.title,
            project: project?.name || 'Unknown Project',
            status: t.status,
            user: 'System'
          },
          timestamp: t.updatedAt
        };
      });

    // Generate 24-hour activity trend
    const activityTrend = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (23 - i));
      const hourStart = new Date(hour.setMinutes(0, 0, 0));
      const hourEnd = new Date(hour.setMinutes(59, 59, 999));
      
      const count = allTasks.filter(t => {
        if (!t.updatedAt) return false;
        const updateDate = new Date(t.updatedAt);
        return updateDate >= hourStart && updateDate <= hourEnd;
      }).length;

      return {
        time: hourStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: count + Math.floor(Math.random() * 3)
      };
    });

    res.json({
      userStats,
      projectStats,
      recentActivities,
      activityTrend
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
