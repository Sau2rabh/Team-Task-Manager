const mongoose = require('mongoose');
const Project = require('../models/Project');

const checkProjectRole = (roles) => {
  return async (req, res, next) => {
    const projectId = req.params.projectId || req.body?.projectId || req.params.id;

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: 'Invalid or missing Project ID' });
    }

    try {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      if (!project.members || !Array.isArray(project.members)) {
        console.error(`Malformed project data for ID: ${projectId}`);
        return res.status(500).json({ message: 'Project data is malformed' });
      }

      // Global Admin Override: Admins can see/edit everything
      if (req.user.role && req.user.role.toLowerCase() === 'admin') {
        req.project = project;
        return next();
      }

      // Find user in project members
      const member = project.members.find(m => m.user && m.user.toString() === req.user._id.toString());

      if (!member) {
        return res.status(403).json({ 
          message: 'User is not a member of this project and not a global admin',
          userId: req.user._id,
          projectId: projectId
        });
      }

      if (roles && roles.length > 0 && !roles.includes(member.role)) {
        return res.status(403).json({ message: 'User does not have permission for this action' });
      }

      req.project = project; // Pass project object to next middleware
      next();
    } catch (err) {
      console.error('❌ Error in checkProjectRole:', err.stack);
      return res.status(500).json({ message: 'Server error during role check', error: err.message });
    }
  };
};

module.exports = { checkProjectRole };
