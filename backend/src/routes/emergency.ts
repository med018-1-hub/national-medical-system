import { Router } from 'express';
import { getByNationalId, getMe, updateMe, updateById } from '../controllers/emergencyController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { auditLog } from '../middleware/audit';
import { Role } from '@prisma/client';

const router = Router();

// All emergency routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/emergency/me
 * @desc    Get patient's own emergency profile
 * @access  Private (PATIENT)
 * @example curl -X GET http://localhost:5000/api/v1/emergency/me -H "Authorization: Bearer TOKEN"
 */
router.get('/me', authorize([Role.PATIENT]), getMe);

/**
 * @route   PUT /api/v1/emergency/me
 * @desc    Update patient's own emergency profile
 * @access  Private (PATIENT)
 * @example curl -X PUT http://localhost:5000/api/v1/emergency/me -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"bloodType": "O_POS"}'
 */
router.put('/me', authorize([Role.PATIENT]), auditLog('UPDATE_OWN_PROFILE', 'EmergencyProfile'), updateMe);

/**
 * @route   GET /api/v1/emergency/:nationalId
 * @desc    Get emergency profile by National ID
 * @access  Private (DOCTOR, ER_STAFF, ADMIN)
 * @example curl -X GET http://localhost:5000/api/v1/emergency/123456789 -H "Authorization: Bearer TOKEN"
 */
router.get('/:nationalId', authorize([Role.DOCTOR, Role.ER_STAFF, Role.ADMIN]), auditLog('VIEW_EMERGENCY_PROFILE', 'EmergencyProfile'), getByNationalId);

/**
 * @route   PUT /api/v1/emergency/:id
 * @desc    Update emergency profile by User ID
 * @access  Private (ADMIN)
 * @example curl -X PUT http://localhost:5000/api/v1/emergency/USER_ID -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"bloodType": "A_NEG"}'
 */
router.put('/:id', authorize([Role.ADMIN]), auditLog('UPDATE_EMERGENCY_PROFILE_BY_ADMIN', 'EmergencyProfile'), updateById);

export default router;
