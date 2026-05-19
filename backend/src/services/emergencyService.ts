import prisma from '../lib/prisma';
import { CustomError } from '../middleware/errorHandler';
import { BloodType } from '@prisma/client';

export const getEmergencyProfileByNationalId = async (nationalId: string) => {
  const user = await prisma.user.findUnique({
    where: { nationalId },
    include: {
      emergencyProfile: true
    }
  });

  if (!user || !user.emergencyProfile) {
    const error = new Error('Emergency profile not found for this national ID') as CustomError;
    error.statusCode = 404;
    error.code = 'PROFILE_NOT_FOUND';
    throw error;
  }

  return {
    ...user.emergencyProfile,
    user: {
      name: user.name,
      phone: user.phone,
      nationalId: user.nationalId
    }
  };
};

export const getEmergencyProfileByUserId = async (userId: string) => {
  const profile = await prisma.emergencyProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true, phone: true, nationalId: true }
      }
    }
  });

  if (!profile) {
    const error = new Error('Emergency profile not found') as CustomError;
    error.statusCode = 404;
    error.code = 'PROFILE_NOT_FOUND';
    throw error;
  }

  return profile;
};

export const upsertEmergencyProfile = async (userId: string, data: any) => {
  const { bloodType, allergies, chronicConditions, pastSurgeries, emergencyContact, notes } = data;

  if (!bloodType) {
    const error = new Error('Blood type is required') as CustomError;
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const profile = await prisma.emergencyProfile.upsert({
    where: { userId },
    update: {
      bloodType: bloodType as BloodType,
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      pastSurgeries: pastSurgeries || [],
      emergencyContact,
      notes
    },
    create: {
      userId,
      bloodType: bloodType as BloodType,
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      pastSurgeries: pastSurgeries || [],
      emergencyContact,
      notes
    }
  });

  return profile;
};
