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

    // Create notifications for all assigned users
    if (task.assignedTo && task.assignedTo.length > 0) {
      const notificationPromises = task.assignedTo
        .filter(id => id.toString() !== req.user._id.toString())
        .map(recipientId => createNotification({
          recipient: recipientId,
          sender: req.user._id,
          type: 'TASK_ASSIGNED',
          message: `New task assigned: ${task.title}`,
          projectId: task.projectId
        }));
      await Promise.all(notificationPromises);
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
    
    // Calculate a dynamic performance increase
    const performanceIncrease = totalTasks > 0 
      ? (completedTasks / totalTasks * 12.5).toFixed(1) 
      : "0.0";

    // Calculate Trends and Chart Data (Real Calculation)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

    // Get tasks created in current period (0-7 days) and previous period (7-14 days)
    const currentTasks = tasks.filter(t => new Date(t.createdAt) >= sevenDaysAgo);
    const previousTasks = tasks.filter(t => new Date(t.createdAt) >= fourteenDaysAgo && new Date(t.createdAt) < sevenDaysAgo);

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? `+${current * 100}%` : "+0%";
      const change = ((current - previous) / previous) * 100;
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    const trends = {
      total: calculateTrend(currentTasks.length, previousTasks.length),
      completed: calculateTrend(
        tasks.filter(t => t.status === 'Completed' && new Date(t.updatedAt) >= sevenDaysAgo).length,
        tasks.filter(t => t.status === 'Completed' && new Date(t.updatedAt) >= fourteenDaysAgo && new Date(t.updatedAt) < sevenDaysAgo).length
      ),
      inProgress: calculateTrend(
        tasks.filter(t => t.status === 'In Progress' && new Date(t.updatedAt) >= sevenDaysAgo).length,
        tasks.filter(t => t.status === 'In Progress' && new Date(t.updatedAt) >= fourteenDaysAgo && new Date(t.updatedAt) < sevenDaysAgo).length
      ),
      overdue: calculateTrend(
        tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed' && new Date(t.updatedAt) >= sevenDaysAgo).length,
        tasks.filter(t => t.dueDate && new Date(t.dueDate) < sevenDaysAgo && t.status !== 'Completed' && new Date(t.updatedAt) >= fourteenDaysAgo && new Date(t.updatedAt) < sevenDaysAgo).length
      )
    };

    // Generate REAL 7-day chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const completedOnDay = tasks.filter(t => {
        const updateDate = new Date(t.updatedAt);
        return t.status === 'Completed' && updateDate.toDateString() === date.toDateString();
      }).length;

      const activeOnDay = tasks.filter(t => {
        const updateDate = new Date(t.updatedAt);
        return updateDate.toDateString() === date.toDateString();
      }).length;

      last7Days.push({
        name: dateStr,
        completed: completedOnDay,
        active: activeOnDay
      });
    }

    // Get recent team-wide activity
    const recentActivity = await Task.find({ projectId: { $in: projectIds } })
      .sort({ updatedAt: -1 })
      .limit(8)
      .populate('projectId', 'name')
      .populate('activity.user', 'name');

    const activityFeed = [];
    recentActivity.forEach(task => {
      if (task.activity && task.activity.length > 0) {
        const lastAction = task.activity[task.activity.length - 1];
        activityFeed.push({
          user: lastAction.user?.name || 'System',
          action: lastAction.action,
          task: task.title,
          project: task.projectId?.name,
          timestamp: lastAction.timestamp
        });
      }
    });

    // Calculate Member Workload
    const User = require('../models/User');
    const users = await User.find({ _id: { $in: Array.from(new Set(tasks.flatMap(t => t.assignedTo ? [t.assignedTo.toString()] : []))) } }).select('name email');
    
    const memberWorkload = users.map(u => {
      const userTasks = tasks.filter(t => 
        t.assignedTo?.some(at => (at._id ? at._id.toString() : at.toString()) === u._id.toString())
      );
      const completedCount = userTasks.filter(t => t.status === 'Completed').length;
      return {
        _id: u._id,
        name: u.name,
        taskCount: userTasks.length,
        completedCount,
        progress: userTasks.length > 0 ? Math.round((completedCount / userTasks.length) * 100) : 0
      };
    }).sort((a, b) => b.taskCount - a.taskCount).slice(0, 5);

    // Calculate Upcoming Deadlines (Due in next 48 hours)
    const fortyEightHoursFromNow = new Date(now.getTime() + (48 * 60 * 60 * 1000));
    const upcomingTasks = tasks
      .filter(t => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) > now && new Date(t.dueDate) <= fortyEightHoursFromNow)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3)
      .map(t => ({
        _id: t._id,
        title: t.title,
        dueDate: t.dueDate,
        priority: t.priority || 'Medium'
      }));

    const stats = {
      totalTasks,
      completedTasks,
      inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
      todoTasks: tasks.filter(t => t.status === 'Todo').length,
      myTasks: tasks.filter(t => {
        if (!t.assignedTo || t.assignedTo.length === 0) return false;
        return t.assignedTo.some(at => {
          const assignedId = at._id ? at._id.toString() : at.toString();
          return assignedId === req.user._id.toString();
        });
      }).length,
      overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
      performanceIncrease,
      chartData: last7Days,
      teamActivity: activityFeed.slice(0, 6),
      trends,
      memberWorkload,
      upcomingTasks,
      
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
