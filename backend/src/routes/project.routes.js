import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  createProject, getProjects, getProjectById,
  updateProject, deleteProject, addMember, removeMember
} from '../controllers/project.controller.js';

const router = Router();
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(requireRole('admin'), createProject);

router.route('/:id')
  .get(getProjectById)
  .put(requireRole('admin'), updateProject)
  .delete(requireRole('admin'), deleteProject);

router.post('/:id/members', requireRole('admin'), addMember);
router.delete('/:id/members/:userId', requireRole('admin'), removeMember);

export default router;