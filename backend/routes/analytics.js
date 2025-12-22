import express from 'express';
import {
    getAgentPerformance,
    getTeamStatistics,
    getTicketTrends,
    getSLAMetrics
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All routes are protected and require admin/manager role
router.use(protect);
router.use(requireRole(['super_admin', 'company_admin', 'company_manager']));

router.get('/agent-performance', getAgentPerformance);
router.get('/team-statistics', getTeamStatistics);
router.get('/ticket-trends', getTicketTrends);
router.get('/sla-metrics', getSLAMetrics);

export default router;
