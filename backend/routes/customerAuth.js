import express from 'express';
import {
    registerCustomer,
    loginCustomer,
    getCustomerProfile,
    updateCustomerProfile,
    changeCustomerPassword
} from '../controllers/customerAuthController.js';
import { protectCustomer } from '../middleware/customerAuth.js';

const router = express.Router();

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Protected routes
router.get('/profile', protectCustomer, getCustomerProfile);
router.put('/profile', protectCustomer, updateCustomerProfile);
router.put('/password', protectCustomer, changeCustomerPassword);

export default router;
