const Task = require('../models/Task');
const Project = require('../models/Project');

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      projectId: req.body.projectId,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Get all projects user is part of
    const projects = await Project.find({ 'members.user': req.user._id });
    const projectIds = projects.map(p => p._id);

    const tasks = await Task.find({ projectId: { $in: projectIds } });

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    
    // Calculate a dynamic performance increase based on completion ratio
    // In a real app, this would compare with previous period data
    const performanceIncrease = totalTasks > 0 
      ? (completedTasks / totalTasks * 12.5).toFixed(1) 
      : "0.0";

    const stats = {
      totalTasks,
      completedTasks,
      inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
      todoTasks: tasks.filter(t => t.status === 'Todo').length,
      myTasks: tasks.filter(t => {
        if (!t.assignedTo) return false;
        const assignedId = t.assignedTo._id ? t.assignedTo._id.toString() : t.assignedTo.toString();
        return assignedId === req.user._id.toString();
      }).length,
      overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
      performanceIncrease,
      
      // Dynamic AI Insights
      insights: {
        urgentTask: tasks
          .filter(t => t.status !== 'Completed' && t.dueDate)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]?.title || 'None',
        suggestedFocus: projects.length > 0 
          ? projects[Math.floor(Math.random() * projects.length)].name 
          : 'Setup more projects',
        productivityTip: tasks.filter(t => t.status === 'Completed').length > 5 
          ? "You're on a roll! Keep the momentum." 
          : "Try breaking down large tasks into smaller ones."
      }
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('projectId', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
