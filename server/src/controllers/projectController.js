const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Task = require('../models/Task');
const { emitActivity } = require('../socket/socket');
const { createNotification } = require('./notificationController');

exports.createProject = async (req, res) => {
  const { name, description, memberIds, category, dueDate, coverImage } = req.body;

  try {
    const members = [{ user: req.user._id, role: 'Admin' }];
    
    if (memberIds && Array.isArray(memberIds)) {
      memberIds.forEach(id => {
        if (id !== req.user._id.toString()) {
          members.push({ user: id, role: 'Member' });
        }
      });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members,
      category,
      dueDate,
      coverImage
    });

    // Create notifications for assigned members
    if (memberIds && Array.isArray(memberIds)) {
      const notificationPromises = memberIds
        .filter(id => id !== req.user._id.toString())
        .map(id => createNotification({
          recipient: id,
          sender: req.user._id,
          type: 'PROJECT_ASSIGNED',
          message: `You have been added to project: ${name}`,
          projectId: project._id
        }));
      await Promise.all(notificationPromises);
    }

    emitActivity('PROJECT_CREATED', {
      project: project.name,
      user: req.user.name
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .lean(); // Use lean for performance since we're adding properties

    const projectsWithStats = await Promise.all(projects.map(async (project) => {
      const totalTasks = await Task.countDocuments({ projectId: project._id });
      const completedTasks = await Task.countDocuments({ projectId: project._id, status: 'Completed' });
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        ...project,
        totalTasks,
        completedTasks,
        progress
      };
    }));

    res.json(projectsWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid Project ID format' });
  }
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .lean();
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const totalTasks = await Task.countDocuments({ projectId: project._id });
    const completedTasks = await Task.countDocuments({ projectId: project._id, status: 'Completed' });
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      ...project,
      totalTasks,
      completedTasks,
      progress
    });
  } catch (err) {
    console.error('Error in getProjectById:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    emitActivity('PROJECT_UPDATED', {
      project: project.name,
      user: req.user.name
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    emitActivity('PROJECT_DELETED', {
      project: project?.name || 'Unknown Project',
      user: req.user.name
    });

    res.json({ message: 'Project removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMember = async (req, res) => {
  const { email, role } = req.body;
  try {
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    const project = await Project.findById(req.params.id);
    const alreadyMember = project.members.find(m => m.user.toString() === userToAdd._id.toString());
    
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });

    project.members.push({ user: userToAdd._id, role: role || 'Member' });
    await project.save();

    // Create notification
    await createNotification({
      recipient: userToAdd._id,
      sender: req.user._id,
      type: 'PROJECT_ASSIGNED',
      message: `You have been added to project: ${project.name}`,
      projectId: project._id
    });

    emitActivity('MEMBER_ADDED', {
      project: project.name,
      member: userToAdd.name,
      user: req.user.name
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const memberIndex = project.members.findIndex(m => m.user.toString() === userId);
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in project' });
    }

    if (!['Admin', 'Member', 'Viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role type' });
    }

    project.members[memberIndex].role = role;
    await project.save();
    
    const updatedProject = await Project.findById(req.params.id).populate('members.user', 'name email');
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// AI Suggestion Logic (Simple Keyword-based)
exports.getAiSuggestions = async (req, res) => {
  const { name, description } = req.body;
  
  const nameStr = name || '';
  const descStr = description || '';
  
  const suggestions = [
    { title: 'Setup Development Environment', description: 'Configure project repository and dev tools' },
    { title: 'Project Planning', description: 'Define milestones and timelines' },
    { title: 'UI/UX Wireframing', description: 'Create initial design drafts' },
  ];

  if (nameStr.toLowerCase().includes('web') || nameStr.toLowerCase().includes('app')) {
    suggestions.push({ title: 'Frontend Setup', description: 'Initialize React/Next.js structure' });
    suggestions.push({ title: 'Backend API Design', description: 'Define REST endpoints and database schema' });
  }

  if (descStr.toLowerCase().includes('database') || descStr.toLowerCase().includes('sql') || descStr.toLowerCase().includes('mongo')) {
    suggestions.push({ title: 'Database Schema Design', description: 'Create data models and relationships' });
  }

  res.json(suggestions);
};

exports.getTeam = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email');
    
    // Extract unique members
    const membersMap = new Map();
    projects.forEach(p => {
      p.members.forEach(m => {
        if (m.user) {
          membersMap.set(m.user._id.toString(), {
            _id: m.user._id,
            name: m.user.name || 'Unknown User',
            email: m.user.email || '',
            role: m.role || 'Member'
          });
        }
      });
    });

    const teamList = Array.from(membersMap.values());

    // Fetch stats for each member
    const teamWithStats = await Promise.all(teamList.map(async (member) => {
      const totalTasks = await Task.countDocuments({ assignedTo: member._id });
      const completedTasks = await Task.countDocuments({ assignedTo: member._id, status: 'Completed' });
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        ...member,
        totalTasks,
        completedTasks,
        progress
      };
    }));

    res.json(teamWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
