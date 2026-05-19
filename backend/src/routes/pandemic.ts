import { Router } from 'express';
import {
  getCases,
  addCase,
  getCapacity,
  updateHospitalCapacity,
  getAlerts,
  addAlert,
  updateAlert
} from '../controllers/pandemicController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { auditLog } from '../middleware/audit';
import { Role } from '@prisma/client';

const router = Router();

// ─── Pandemic Cases ─────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/pandemic/cases
 * @desc    Get all pandemic cases
 * @access  Public
 * @example curl -X GET http://localhost:5000/api/v1/pandemic/cases
 */
router.get('/cases', getCases);

/**
 * @route   POST /api/v1/pandemic/cases
 * @desc    Create a new pandemic case record
 * @access  Private (PANDEMIC_COORDINATOR)
 * @example curl -X POST http://localhost:5000/api/v1/pandemic/cases -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"outbreakName":"COVID-21","region":"Riyadh","confirmedCount":500,"activeCount":200,"recoveredCount":280,"deathCount":20}'
 */
router.post(
  '/cases',
  authenticate,
  authorize([Role.PANDEMIC_COORDINATOR]),
  auditLog('CREATE_PANDEMIC_CASE', 'PandemicCase'),
  addCase
);

// ─── Hospital Capacity ──────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/pandemic/capacity
 * @desc    Get all hospital capacity records
 * @access  Public
 * @example curl -X GET http://localhost:5000/api/v1/pandemic/capacity
 */
router.get('/capacity', getCapacity);

/**
 * @route   PUT /api/v1/pandemic/capacity/:id
 * @desc    Update a hospital capacity record
 * @access  Private (PANDEMIC_COORDINATOR)
 * @example curl -X PUT http://localhost:5000/api/v1/pandemic/capacity/HOSP_ID -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"occupiedBeds":180,"icuOccupied":30}'
 */
router.put(
  '/capacity/:id',
  authenticate,
  authorize([Role.PANDEMIC_COORDINATOR]),
  auditLog('UPDATE_HOSPITAL_CAPACITY', 'HospitalCapacity'),
  updateHospitalCapacity
);

// ─── Outbreak Alerts ────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/pandemic/alerts
 * @desc    Get all active outbreak alerts
 * @access  Public
 * @example curl -X GET http://localhost:5000/api/v1/pandemic/alerts
 */
router.get('/alerts', getAlerts);

/**
 * @route   POST /api/v1/pandemic/alerts
 * @desc    Publish a new outbreak alert
 * @access  Private (PANDEMIC_COORDINATOR, ADMIN)
 * @example curl -X POST http://localhost:5000/api/v1/pandemic/alerts -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"title":"High Risk Alert","description":"Spread detected","severity":"RED","region":"Jeddah"}'
 */
router.post(
  '/alerts',
  authenticate,
  authorize([Role.PANDEMIC_COORDINATOR, Role.ADMIN]),
  auditLog('CREATE_OUTBREAK_ALERT', 'OutbreakAlert'),
  addAlert
);

/**
 * @route   PATCH /api/v1/pandemic/alerts/:id
 * @desc    Update an existing outbreak alert
 * @access  Private (PANDEMIC_COORDINATOR, ADMIN)
 * @example curl -X PATCH http://localhost:5000/api/v1/pandemic/alerts/ALERT_ID -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"isActive":false}'
 */
router.patch(
  '/alerts/:id',
  authenticate,
  authorize([Role.PANDEMIC_COORDINATOR, Role.ADMIN]),
  auditLog('UPDATE_OUTBREAK_ALERT', 'OutbreakAlert'),
  updateAlert
);

export default router;
