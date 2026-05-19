import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { BloodType } from '@prisma/client';

/**
 * Get blood inventory across hospitals.
 * Optional query params: hospitalId, bloodType
 */
export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId, bloodType } = req.query;
    
    const whereClause: any = {};
    if (hospitalId) whereClause.hospitalId = String(hospitalId);
    if (bloodType) whereClause.bloodType = bloodType as BloodType;

    const inventory = await prisma.bloodInventory.findMany({
      where: whereClause,
      orderBy: { hospitalName: 'asc' }
    });

    res.status(200).json(inventory);
  } catch (error) {
    console.error('Error fetching blood inventory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update blood inventory units for a specific hospital and blood type.
 * Typically accessed by BLOOD_OFFICER or ADMIN.
 */
export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hospitalId, hospitalName, bloodType, units, threshold } = req.body;

    if (!hospitalId || !bloodType || units === undefined) {
      res.status(400).json({ error: 'Hospital ID, blood type, and units are required' });
      return;
    }

    const inventory = await prisma.bloodInventory.upsert({
      where: {
        hospitalId_bloodType: {
          hospitalId,
          bloodType: bloodType as BloodType
        }
      },
      update: {
        units: Number(units),
        ...(threshold !== undefined && { threshold: Number(threshold) })
      },
      create: {
        hospitalId,
        hospitalName: hospitalName || 'Unknown Hospital',
        bloodType: bloodType as BloodType,
        units: Number(units),
        threshold: threshold !== undefined ? Number(threshold) : 10
      }
    });

    res.status(200).json({ message: 'Inventory updated successfully', inventory });
  } catch (error) {
    console.error('Error updating blood inventory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Find eligible donors by blood type and region.
 * Helpful for emergency blood drives.
 */
export const findDonors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bloodType, region } = req.query;

    if (!bloodType) {
      res.status(400).json({ error: 'Blood type is required to search for donors' });
      return;
    }

    const whereClause: any = {
      bloodType: bloodType as BloodType,
      isEligible: true
    };

    if (region) {
      whereClause.region = String(region);
    }

    const donors = await prisma.donorRecord.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, phone: true, email: true }
        }
      }
    });

    res.status(200).json(donors);
  } catch (error) {
    console.error('Error finding donors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
