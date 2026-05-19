import { Router } from 'express';
import { listUsers, changeUserRole, listAuditLogs } from '../controllers/adminController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { auditLog } from '../middleware/audit';
import { Role } from '@prisma/client';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(authorize([Role.ADMIN]));

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with optional filters (role, page, limit)
 * @access  Private (ADMIN)
 * @example curl -X GET "http://localhost:5000/api/v1/admin/users?role=DOCTOR&page=1&limit=10" -H "Authorization: Bearer TOKEN"
 */
router.get('/users', listUsers);

/**
 * @route   PATCH /api/v1/admin/users/:id/role
 * @desc    Change a user's role
 * @access  Private (ADMIN)
 * @example curl -X PATCH http://localhost:5000/api/v1/admin/users/USER_ID/role -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"role":"DOCTOR"}'
 */
router.patch(
  '/users/:id/role',
  auditLog('CHANGE_USER_ROLE', 'User'),
  changeUserRole
);

/**
 * @route   GET /api/v1/admin/audit
 * @desc    Get audit logs with optional filters (userId, entity, page, limit)
 * @access  Private (ADMIN)
 * @example curl -X GET "http://localhost:5000/api/v1/admin/audit?entity=EmergencyProfile&page=1" -H "Authorization: Bearer TOKEN"
 */
router.get('/audit', listAuditLogs);

export default router;
