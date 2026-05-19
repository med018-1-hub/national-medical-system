import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { Role } from '@prisma/client';

/**
 * Handle user registration
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nationalId, email, password, name, phone, region, role } = req.body;

    // Check if the user already exists (by email or nationalId)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { nationalId }]
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email or national ID already exists' });
      return;
    }

    // Hash the password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create the new user in the database
    const user = await prisma.user.create({
      data: {
        nationalId,
        email,
        passwordHash,
        name,
        phone,
        region,
        role: role as Role || Role.PATIENT, // default role is PATIENT
      }
    });

    // Generate a JWT token for the new user
    const token = signToken({ userId: user.id, role: user.role });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

/**
 * Handle user login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify the password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate a JWT token for the authenticated user
    const token = signToken({ userId: user.id, role: user.role });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};
