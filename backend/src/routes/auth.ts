import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 * @example curl -X POST http://localhost:5000/api/v1/auth/register -H "Content-Type: application/json" -d '{"nationalId":"123456789", "email":"test@test.com", "password":"password123", "name":"John Doe"}'
 */
router.post('/register', register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 * @example curl -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com", "password":"password123"}'
 */
router.post('/login', login);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged in user profile
 * @access  Private (Requires JWT)
 * @example curl -X GET http://localhost:5000/api/v1/auth/me -H "Authorization: Bearer YOUR_TOKEN_HERE"
 */
router.get('/me', authenticate, getMe);

export default router;
