import { Router } from 'express';
import {
  getBloodInventory,
  updateBloodInventory,
  getDonors,
  donate,
  requestBlood,
  getAllBloodRequests,
  patchRequestStatus
} from '../controllers/bloodController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { auditLog } from '../middleware/audit';
import { Role } from '@prisma/client';

const router = Router();

// All blood bank routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/blood/inventory
 * @desc    Get all blood inventory across hospitals
 * @access  Private (DOCTOR, ER_STAFF, BLOOD_OFFICER, ADMIN)
 * @example curl -X GET http://localhost:5000/api/v1/blood/inventory -H "Authorization: Bearer TOKEN"
 */
router.get('/inventory', authorize([Role.DOCTOR, Role.ER_STAFF, Role.BLOOD_OFFICER, Role.ADMIN]), getBloodInventory);

/**
 * @route   PUT /api/v1/blood/inventory/:hospitalId/:bloodType
 * @desc    Update blood inventory units for a specific hospital & blood type
 * @access  Private (BLOOD_OFFICER, ADMIN)
 * @example curl -X PUT http://localhost:5000/api/v1/blood/inventory/HOSP_ID/O_POS -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"units": 50}'
 */
router.put('/inventory/:hospitalId/:bloodType', authorize([Role.BLOOD_OFFICER, Role.ADMIN]), auditLog('UPDATE_BLOOD_INVENTORY', 'BloodInventory'), updateBloodInventory);

/**
 * @route   GET /api/v1/blood/donors?bloodType=O_POS&region=Riyadh
 * @desc    Find eligible donors by blood type and optional region
 * @access  Private (DOCTOR, ER_STAFF, BLOOD_OFFICER, ADMIN)
 * @example curl -X GET "http://localhost:5000/api/v1/blood/donors?bloodType=O_POS&region=Riyadh" -H "Authorization: Bearer TOKEN"
 */
router.get('/donors', authorize([Role.DOCTOR, Role.ER_STAFF, Role.BLOOD_OFFICER, Role.ADMIN]), getDonors);

/**
 * @route   POST /api/v1/blood/donate
 * @desc    Record a blood donation for a user
 * @access  Private (BLOOD_OFFICER, ADMIN)
 * @example curl -X POST http://localhost:5000/api/v1/blood/donate -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"userId": "USER_ID"}'
 */
router.post('/donate', authorize([Role.BLOOD_OFFICER, Role.ADMIN]), auditLog('RECORD_DONATION', 'DonorRecord'), donate);

/**
 * @route   POST /api/v1/blood/requests
 * @desc    Submit a new blood request
 * @access  Private (DOCTOR, ER_STAFF, ADMIN)
 * @example curl -X POST http://localhost:5000/api/v1/blood/requests -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"requestedBy":"USER_ID","hospitalId":"HOSP_ID","bloodType":"O_POS","units":3}'
 */
router.post('/requests', authorize([Role.DOCTOR, Role.ER_STAFF, Role.ADMIN]), auditLog('CREATE_BLOOD_REQUEST', 'BloodRequest'), requestBlood);

/**
 * @route   GET /api/v1/blood/requests?status=PENDING
 * @desc    Get all blood requests, optionally filtered by status
 * @access  Private (BLOOD_OFFICER, ADMIN)
 * @example curl -X GET "http://localhost:5000/api/v1/blood/requests?status=PENDING" -H "Authorization: Bearer TOKEN"
 */
router.get('/requests', authorize([Role.BLOOD_OFFICER, Role.ADMIN]), getAllBloodRequests);

/**
 * @route   PATCH /api/v1/blood/requests/:id/status
 * @desc    Update blood request status (approve, reject, fulfill)
 * @access  Private (BLOOD_OFFICER, ADMIN)
 * @example curl -X PATCH http://localhost:5000/api/v1/blood/requests/REQUEST_ID/status -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"status": "APPROVED"}'
 */
router.patch('/requests/:id/status', authorize([Role.BLOOD_OFFICER, Role.ADMIN]), auditLog('UPDATE_REQUEST_STATUS', 'BloodRequest'), patchRequestStatus);

export default router;
