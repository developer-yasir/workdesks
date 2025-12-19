import express from 'express';
import {
    createTeam,
    getTeams,
    getTeam,
    updateTeam,
    addAgentToTeam,
    removeAgentFromTeam
} from '../controllers/teamController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Team management routes
router.route('/')
    .get(getTeams)
    .post(requireRole(['super_admin', 'company_admin']), createTeam);

router.route('/:id')
    .get(getTeam)
    .put(requireRole(['super_admin', 'company_admin', 'company_manager']), updateTeam);

// Agent management in teams
router.post('/:id/agents', requireRole(['super_admin', 'company_admin', 'company_manager']), addAgentToTeam);
router.delete('/:id/agents/:agentId', requireRole(['super_admin', 'company_admin', 'company_manager']), removeAgentFromTeam);

export default router;
