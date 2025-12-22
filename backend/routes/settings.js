import express from 'express';
import {
    getSettings,
    updateSettings,
    getEmailConfig,
    updateEmailConfig,
    testEmailConfig
} from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All routes are protected and require super_admin role
router.use(protect);
router.use(requireRole(['super_admin']));

// Settings routes
router.route('/')
    .get(getSettings)
    .put(updateSettings);

// Email configuration routes
router.route('/email')
    .get(getEmailConfig)
    .put(updateEmailConfig);

router.post('/email/test', testEmailConfig);

export default router;

