import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// Route for registering a new user
router.post('/register', register);

// Route for authenticating an existing user
router.post('/login', login);

export default router;
