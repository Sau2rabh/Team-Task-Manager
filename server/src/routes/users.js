const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Multer Config for profile photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed!'));
  }
});

// @desc    Search users by email or name
// @route   GET /api/users/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query || '', $options: 'i' } },
        { email: { $regex: query || '', $options: 'i' } }
      ],
      _id: { $ne: req.user._id } // Don't include yourself
    }).select('name email').limit(10);
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get all users (minimal info)
// @route   GET /api/users
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, skills, socialLinks } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Upload profile avatar
// @route   POST /api/users/avatar
// @access  Private
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

    const user = await User.findById(req.user._id);
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    user.profilePicture = avatarUrl;
    await user.save();

    res.json({ avatarUrl, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get user performance stats
// @route   GET /api/users/profile-stats
// @access  Private
router.get('/profile-stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Tasks Completed
    const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'Completed' });

    // 2. Active Projects
    const activeProjects = await Project.countDocuments({ 'members.user': userId });

    // 3. On-time Rate
    const allCompletedTasks = await Task.find({ assignedTo: userId, status: 'Completed' });
    let onTimeCount = 0;
    allCompletedTasks.forEach(task => {
      if (!task.dueDate || new Date(task.updatedAt) <= new Date(task.dueDate)) {
        onTimeCount++;
      }
    });
    const onTimeRate = allCompletedTasks.length > 0 
      ? Math.round((onTimeCount / allCompletedTasks.length) * 100) 
      : 100;

    // 4. Points Earned (Simple logic: 50 per completed task)
    const pointsEarned = completedTasks * 50;

    res.json({
      completedTasks,
      activeProjects,
      onTimeRate: `${onTimeRate}%`,
      pointsEarned: pointsEarned.toLocaleString()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const topUsers = await User.find({})
      .select('name email xp level profilePicture')
      .sort({ level: -1, xp: -1 })
      .limit(10);
    
    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
