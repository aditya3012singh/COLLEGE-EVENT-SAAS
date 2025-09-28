// clubController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all clubs (optionally filtered by college)
export const getAllClubs = async (req, res) => {
  try {
    const { collegeId } = req.query;
    const clubs = await prisma.club.findMany({
      where: collegeId ? { collegeId: parseInt(collegeId) } : {},
      include: { college: true, events: true }
    });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get club by ID
export const getClubById = async (req, res) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { college: true, events: true }
    });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create club
export const createClub = async (req, res) => {
  try {
    const { name, collegeId } = req.body;
    const createdBy = req.user.id;
    const club = await prisma.club.create({
      data: { name, collegeId, createdBy }
    });
    res.json({ message: 'Club created', club });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update club
export const updateClub = async (req, res) => {
  try {
    const { name } = req.body;
    const club = await prisma.club.update({
      where: { id: parseInt(req.params.id) },
      data: { name }
    });
    res.json({ message: 'Club updated', club });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete club
export const deleteClub = async (req, res) => {
  try {
    await prisma.club.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
