import { Router } from 'express';
import { getEmergencyProfile, upsertEmergencyProfile } from '../controllers/patient.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Apply authentication middleware to all routes in this file
router.use(authenticate);

// GET /api/patients/profile - Patient gets their own profile
router.get('/profile', requireRole([Role.PATIENT]), getEmergencyProfile);

// PUT /api/patients/profile - Patient updates their own profile
router.put('/profile', requireRole([Role.PATIENT]), upsertEmergencyProfile);

// GET /api/patients/profile/:userId - Medical staff can view a specific patient's profile
router.get(
  '/profile/:userId', 
  requireRole([Role.DOCTOR, Role.ER_STAFF, Role.ADMIN]), 
  getEmergencyProfile
);

export default router;
