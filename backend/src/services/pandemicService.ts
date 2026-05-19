import prisma from '../lib/prisma';
import { CustomError } from '../middleware/errorHandler';
import { AlertSeverity } from '@prisma/client';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface CreateCaseInput {
  outbreakName: string;
  region: string;
  confirmedCount: number;
  activeCount: number;
  recoveredCount: number;
  deathCount: number;
  reportedBy: string;
}

interface UpdateCapacityInput {
  totalBeds?: number | undefined;
  occupiedBeds?: number | undefined;
  icuTotal?: number | undefined;
  icuOccupied?: number | undefined;
}

interface CreateAlertInput {
  title: string;
  description: string;
  severity: AlertSeverity;
  region?: string | undefined;
  publishedBy: string;
}

interface PatchAlertInput {
  title?: string | undefined;
  description?: string | undefined;
  severity?: AlertSeverity | undefined;
  region?: string | undefined;
  isActive?: boolean | undefined;
}

// ─── Pandemic Cases ─────────────────────────────────────────────────────────────

export const getAllCases = async () => {
  return prisma.pandemicCase.findMany({
    orderBy: { reportedAt: 'desc' }
  });
};

export const createCase = async (data: CreateCaseInput) => {
  const { outbreakName, region, confirmedCount, activeCount, recoveredCount, deathCount, reportedBy } = data;

  if (!outbreakName || !region || !reportedBy) {
    const error = new Error('outbreakName, region, and reportedBy are required') as CustomError;
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (confirmedCount < 0 || activeCount < 0 || recoveredCount < 0 || deathCount < 0) {
    const error = new Error('Counts cannot be negative') as CustomError;
    error.statusCode = 400;
    error.code = 'INVALID_COUNT';
    throw error;
  }

  return prisma.pandemicCase.create({
    data: { outbreakName, region, confirmedCount, activeCount, recoveredCount, deathCount, reportedBy }
  });
};

// ─── Hospital Capacity ──────────────────────────────────────────────────────────

export const getAllCapacity = async () => {
  return prisma.hospitalCapacity.findMany({
    orderBy: { hospitalName: 'asc' }
  });
};

export const updateCapacity = async (id: string, data: UpdateCapacityInput) => {
  const { totalBeds, occupiedBeds, icuTotal, icuOccupied } = data;

  if (occupiedBeds !== undefined && totalBeds !== undefined && occupiedBeds > totalBeds) {
    const error = new Error('Occupied beds cannot exceed total beds') as CustomError;
    error.statusCode = 400;
    error.code = 'INVALID_CAPACITY';
    throw error;
  }

  if (icuOccupied !== undefined && icuTotal !== undefined && icuOccupied > icuTotal) {
    const error = new Error('ICU occupied cannot exceed ICU total') as CustomError;
    error.statusCode = 400;
    error.code = 'INVALID_CAPACITY';
    throw error;
  }

  try {
    return await prisma.hospitalCapacity.update({
      where: { id },
      data: {
        ...(totalBeds !== undefined && { totalBeds }),
        ...(occupiedBeds !== undefined && { occupiedBeds }),
        ...(icuTotal !== undefined && { icuTotal }),
        ...(icuOccupied !== undefined && { icuOccupied }),
      }
    });
  } catch (err: unknown) {
    const prismaError = err as { code?: string };
    if (prismaError.code === 'P2025') {
      const error = new Error('Hospital capacity record not found') as CustomError;
      error.statusCode = 404;
      error.code = 'RECORD_NOT_FOUND';
      throw error;
    }
    throw err;
  }
};

// ─── Outbreak Alerts ────────────────────────────────────────────────────────────

export const getAllAlerts = async () => {
  return prisma.outbreakAlert.findMany({
    where: { isActive: true },
    orderBy: { publishedAt: 'desc' }
  });
};

export const createAlert = async (data: CreateAlertInput) => {
  const { title, description, severity, region, publishedBy } = data;

  if (!title || !description || !severity || !publishedBy) {
    const error = new Error('title, description, severity, and publishedBy are required') as CustomError;
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  return prisma.outbreakAlert.create({
    data: { title, description, severity, publishedBy, ...(region !== undefined && { region }) }
  });
};

export const patchAlert = async (id: string, data: PatchAlertInput) => {
  try {
    return await prisma.outbreakAlert.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.severity !== undefined && { severity: data.severity }),
        ...(data.region !== undefined && { region: data.region }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      }
    });
  } catch (err: unknown) {
    const prismaError = err as { code?: string };
    if (prismaError.code === 'P2025') {
      const error = new Error('Alert not found') as CustomError;
      error.statusCode = 404;
      error.code = 'ALERT_NOT_FOUND';
      throw error;
    }
    throw err;
  }
};
