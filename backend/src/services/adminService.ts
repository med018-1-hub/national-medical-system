import prisma from '../lib/prisma';
import { CustomError } from '../middleware/errorHandler';
import { Role } from '@prisma/client';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface GetUsersOptions {
  page?: number | undefined;
  limit?: number | undefined;
  role?: Role | undefined;
}

interface GetAuditLogsOptions {
  page?: number | undefined;
  limit?: number | undefined;
  userId?: string | undefined;
  entity?: string | undefined;
}

// ─── User Management ────────────────────────────────────────────────────────────

export const getAllUsers = async (options: GetUsersOptions) => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const skip = (page - 1) * limit;

  const whereClause = options.role !== undefined ? { role: options.role } : {};

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nationalId: true,
        email: true,
        name: true,
        phone: true,
        region: true,
        role: true,
        createdAt: true,
        updatedAt: true
        // passwordHash is intentionally excluded
      }
    }),
    prisma.user.count({ where: whereClause })
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const updateUserRole = async (userId: string, newRole: Role) => {
  const validRoles = Object.values(Role);
  if (!validRoles.includes(newRole)) {
    const error = new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`) as CustomError;
    error.statusCode = 400;
    error.code = 'INVALID_ROLE';
    throw error;
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        nationalId: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true
        // passwordHash is intentionally excluded
      }
    });
    return user;
  } catch (err: unknown) {
    const prismaError = err as { code?: string };
    if (prismaError.code === 'P2025') {
      const error = new Error('User not found') as CustomError;
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    throw err;
  }
};

// ─── Audit Logs ─────────────────────────────────────────────────────────────────

export const getAuditLogs = async (options: GetAuditLogsOptions) => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 50;
  const skip = (page - 1) * limit;

  const whereClause = {
    ...(options.userId !== undefined && { userId: options.userId }),
    ...(options.entity !== undefined && { entity: options.entity })
  };

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    }),
    prisma.auditLog.count({ where: whereClause })
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
