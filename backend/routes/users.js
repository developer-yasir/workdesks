import express from 'express';
import {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deactivateUser
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User management routes
router.route('/')
    .get(requireRole(['super_admin', 'company_admin', 'company_manager']), getUsers)
    .post(requireRole(['super_admin', 'company_admin']), createUser);

router.route('/:id')
    .get(getUser)
    .put(requireRole(['super_admin', 'company_admin', 'company_manager']), updateUser)
    .delete(requireRole(['super_admin', 'company_admin']), deactivateUser);

export default router;
