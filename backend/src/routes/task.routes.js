import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  createTask, getTasksByProject, getTaskById,
  updateTask, deleteTask, updateTaskStatus
} from '../controllers/task.controller.js';

const router = Router({ mergeParams: true });
router.use(protect);

router.route('/')
  .get(getTasksByProject)
  .post(requireRole('admin'), createTask);

router.route('/:taskId')
  .get(getTaskById)
  .put(requireRole('admin'), updateTask)
  .delete(requireRole('admin'), deleteTask);

router.patch('/:taskId/status', updateTaskStatus);

export default router;