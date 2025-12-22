import express from 'express';
import {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanyRelationships,
    createRelationship,
    updateRelationship
} from '../controllers/companyController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Company CRUD
router.route('/')
    .get(requireRole(['super_admin']), getCompanies)
    .post(requireRole(['super_admin']), createCompany);

router.route('/:id')
    .get(getCompany) // Any authenticated user can view their company
    .put(requireRole(['super_admin', 'company_admin']), updateCompany)
    .delete(requireRole(['super_admin']), deleteCompany);

// Company relationships
router.get('/:id/relationships', getCompanyRelationships);
router.post('/relationships', requireRole(['super_admin', 'company_admin']), createRelationship);
router.put('/relationships/:id', requireRole(['super_admin', 'company_admin']), updateRelationship);

export default router;
