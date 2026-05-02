const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getTasksByProject, 
  updateTask, 
  deleteTask,
  getDashboardStats,
  getMyTasks
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { checkProjectRole } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/my', getMyTasks);

router.post('/', checkProjectRole(['Admin']), createTask);
router.get('/project/:projectId', checkProjectRole(['Admin', 'Member']), getTasksByProject);
router.put('/:id', updateTask); // Usually members can update status
router.delete('/:id', deleteTask);

module.exports = router;
