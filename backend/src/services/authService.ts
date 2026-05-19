import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { Role } from '@prisma/client';
import { CustomError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

export const registerUser = async (data: any) => {
  const { nationalId, email, password, name, phone, region, role } = data;

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { nationalId }]
    }
  });

  if (existingUser) {
    const error = new Error('User with this email or national ID already exists') as CustomError;
    error.statusCode = 409; // Conflict
    error.code = 'USER_ALREADY_EXISTS';
    throw error;
  }

  // Hash password with explicitly required 12 salt rounds
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      nationalId,
      email,
      passwordHash,
      name,
      phone,
      region,
      role: role as Role || Role.PATIENT,
    }
  });

  // Generate token
  const token = signToken({ userId: user.id, role: user.role });

  // Exclude passwordHash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    const error = new Error('Invalid credentials') as CustomError;
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error('Invalid credentials') as CustomError;
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const token = signToken({ userId: user.id, role: user.role });
  
  // Exclude passwordHash from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token
  };
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    const error = new Error('User not found') as CustomError;
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
