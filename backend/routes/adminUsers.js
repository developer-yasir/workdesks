import express from 'express';
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserStats
} from '../controllers/adminUserController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All routes are protected and require super_admin role
router.use(protect);
router.use(requireRole(['super_admin']));

// User statistics
router.get('/stats', getUserStats);

// User management routes
router.route('/')
    .get(getAllUsers)
    .post(createUser);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

router.put('/:id/status', toggleUserStatus);

export default router;

