import { Router } from 'express';
import { register, login, getMe, getAllUsers } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, requireRole('admin'), getAllUsers);

export default router;