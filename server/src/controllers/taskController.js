const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { emitActivity } = require('../socket/socket');
const { createNotification } = require('./notificationController');

exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      projectId: req.body.projectId,
    });

    task.activity.push({
      user: req.user._id,
      action: 'created the task',
      timestamp: new Date()
    });

    await task.save();
    
    emitActivity('TASK_CREATED', {
      task: task.title,
      user: req.user.name,
      projectId: req.body.projectId
    });

    // Create notification for assigned user
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: task.assignedTo,
        sender: req.user._id,
        type: 'TASK_ASSIGNED',
        message: `New task assigned: ${task.title}`,
        projectId: task.projectId
      });
    }

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
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const oldStatus = task.status;
    
    // Update fields
    Object.assign(task, req.body);

    // Log activity if status changed
    if (req.body.status && req.body.status !== oldStatus) {
      task.activity.push({
        user: req.user._id,
        action: `changed status from ${oldStatus} to ${req.body.status}`,
        timestamp: new Date()
      });
    }

    await task.save();
    
    emitActivity('TASK_UPDATED', {
      task: task.title,
      status: task.status,
      user: req.user.name
    });

    // Notify Admin if status is 'Completed'
    if (task.status === 'Completed' && oldStatus !== 'Completed') {
      const project = await Project.findById(task.projectId);
      if (project) {
        // Notify project creator and any project admin
        const adminIds = project.members
          .filter(m => m.role === 'Admin')
          .map(m => m.user.toString());
        
        if (!adminIds.includes(project.createdBy.toString())) {
          adminIds.push(project.createdBy.toString());
        }

        const notificationPromises = adminIds
          .filter(id => id !== req.user._id.toString()) 
          .map(adminId => createNotification({
            recipient: adminId,
            sender: req.user._id,
            type: 'TASK_COMPLETED',
            message: `${req.user.name} completed task: ${task.title}`,
            projectId: project._id
          }));
        
        await Promise.all(notificationPromises);
      }

      // Award XP to the user
      const user = await User.findById(req.user._id);
      if (user) {
        user.xp += 50;
        // Level up every 500 XP
        const newLevel = Math.floor(user.xp / 500) + 1;
        if (newLevel > user.level) {
          user.level = newLevel;
          // Notify user of level up
          await createNotification({
            recipient: user._id,
            type: 'STATUS_UPDATE',
            message: `🎉 Congratulations! You reached Level ${newLevel}!`,
          });
        }
        await user.save();
        
        // Notify user of XP gain and update their state
        const io = require('../socket/socket').getIo();
        io.to(user._id.toString()).emit('user_update', {
          xp: user.xp,
          level: user.level
        });
        io.emit('leaderboard_refresh');
      }
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    emitActivity('TASK_DELETED', {
      task: task?.title || 'Unknown Task',
      user: req.user.name
    });

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

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email')
      .populate('activity.user', 'name');
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date()
    });
    
    task.activity.push({
      user: req.user._id,
      action: `commented: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
      timestamp: new Date()
    });

    await task.save();
    
    const updatedTask = await Task.findById(req.params.id)
      .populate('comments.user', 'name email')
      .populate('activity.user', 'name');
    
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
