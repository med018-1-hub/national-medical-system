import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { BloodType } from '@prisma/client';

/**
 * Get the emergency profile for a specific user.
 * If no userId is provided in params, fetches the profile of the authenticated user.
 */
export const getEmergencyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.userId;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const profile = await prisma.emergencyProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, nationalId: true, phone: true }
        }
      }
    });

    if (!profile) {
      res.status(404).json({ error: 'Emergency profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error fetching emergency profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create or update the emergency profile for the authenticated user.
 */
export const upsertEmergencyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { bloodType, allergies, chronicConditions, pastSurgeries, emergencyContact, notes } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Ensure bloodType is provided since it's required in the schema
    if (!bloodType) {
      res.status(400).json({ error: 'Blood type is required' });
      return;
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

    res.status(200).json({
      message: 'Emergency profile saved successfully',
      profile
    });
  } catch (error) {
    console.error('Error saving emergency profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
