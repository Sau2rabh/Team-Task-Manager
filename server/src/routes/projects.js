const express = require('express');
const router = express.Router();
const { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject,
  addMember,
  updateMemberRole,
  getAiSuggestions,
  getTeam
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { checkProjectRole } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/team', getTeam);
router.post('/ai-suggestions', getAiSuggestions);

router.get('/:id', checkProjectRole(['Admin', 'Member']), getProjectById);
router.put('/:id', checkProjectRole(['Admin']), updateProject);
router.delete('/:id', checkProjectRole(['Admin']), deleteProject);
router.post('/:id/members', checkProjectRole(['Admin']), addMember);
router.patch('/:id/members', checkProjectRole(['Admin']), updateMemberRole);

module.exports = router;
