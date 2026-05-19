import prisma from '../lib/prisma';
import { CustomError } from '../middleware/errorHandler';
import { BloodType } from '@prisma/client';

/**
 * Fetch all blood inventory across all hospitals.
 */
export const getInventory = async () => {
  const inventory = await prisma.bloodInventory.findMany({
    orderBy: { hospitalName: 'asc' }
  });
  return inventory;
};

/**
 * Update the units for a specific blood type in a given hospital.
 */
export const updateInventory = async (hospitalId: string, bloodType: BloodType, units: number) => {
  if (units < 0) {
    const error = new Error('Blood units cannot be negative') as CustomError;
    error.statusCode = 400;
    error.code = 'INVALID_UNITS';
    throw error;
  }

  try {
    const inventoryItem = await prisma.bloodInventory.update({
      where: {
        hospitalId_bloodType: {
          hospitalId,
          bloodType
        }
      },
      data: { units }
    });
    return inventoryItem;
  } catch (err: any) {
    if (err.code === 'P2025') { // Prisma code for Record not found
      const error = new Error('Inventory record not found for this hospital and blood type') as CustomError;
      error.statusCode = 404;
      error.code = 'INVENTORY_NOT_FOUND';
      throw error;
    }
    throw err;
  }
};

/**
 * Find eligible donors by blood type and optionally by region.
 */
export const findDonors = async (bloodType: BloodType, region?: string) => {
  const whereClause: any = {
    bloodType,
    isEligible: true
  };

  if (region) {
    whereClause.region = region;
  }

  const donors = await prisma.donorRecord.findMany({
    where: whereClause,
    include: {
      user: {
        select: { name: true, phone: true, email: true }
      }
    }
  });

  return donors;
};

/**
 * Record a blood donation for a donor.
 */
export const recordDonation = async (userId: string) => {
  const donorRecord = await prisma.donorRecord.findUnique({ where: { userId } });
  
  if (!donorRecord) {
    const error = new Error('Donor record not found for this user') as CustomError;
    error.statusCode = 404;
    error.code = 'DONOR_NOT_FOUND';
    throw error;
  }

  if (!donorRecord.isEligible) {
    const error = new Error('Donor is currently not eligible to donate') as CustomError;
    error.statusCode = 403;
    error.code = 'DONOR_INELIGIBLE';
    throw error;
  }

  const updatedDonor = await prisma.donorRecord.update({
    where: { userId },
    data: {
      lastDonationDate: new Date(),
      totalDonations: { increment: 1 }
    }
  });

  return updatedDonor;
};

/**
 * Create a new blood request.
 */
export const createBloodRequest = async (data: any) => {
  const { requestedBy, hospitalId, bloodType, units, notes } = data;

  if (!requestedBy || !hospitalId || !bloodType || !units) {
    const error = new Error('requestedBy, hospitalId, bloodType, and units are required') as CustomError;
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (units <= 0) {
    const error = new Error('Units must be a positive number') as CustomError;
    error.statusCode = 400;
    error.code = 'INVALID_UNITS';
    throw error;
  }

  const request = await prisma.bloodRequest.create({
    data: {
      requestedBy,
      hospitalId,
      bloodType: bloodType as BloodType,
      units,
      notes
    }
  });

  return request;
};

/**
 * Get all blood requests, optionally filtered by status.
 */
export const getBloodRequests = async (status?: string) => {
  const { RequestStatus } = await import('@prisma/client');

  const requests = await prisma.bloodRequest.findMany({
    ...(status ? { where: { status: status as any } } : {}),
    orderBy: { createdAt: 'desc' }
  });

  return requests;
};

/**
 * Update the status of a blood request.
 */
export const updateRequestStatus = async (id: string, status: string) => {
  const { RequestStatus } = await import('@prisma/client');

  const validStatuses = Object.values(RequestStatus);
  if (!validStatuses.includes(status as any)) {
    const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`) as CustomError;
    error.statusCode = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }

  try {
    const request = await prisma.bloodRequest.update({
      where: { id },
      data: { status: status as any }
    });
    return request;
  } catch (err: any) {
    if (err.code === 'P2025') {
      const error = new Error('Blood request not found') as CustomError;
      error.statusCode = 404;
      error.code = 'REQUEST_NOT_FOUND';
      throw error;
    }
    throw err;
  }
};
