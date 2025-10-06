import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllClubs = async (req, res) => {
  try {
    const { collegeId, page = 1, limit = 20 } = req.query;
    const clubs = await prisma.club.findMany({
      where: collegeId ? { collegeId: parseInt(collegeId) } : {},
      include: { college: true, events: true },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getClubById = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: { college: true, events: true },
    });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createClub = async (req, res) => {
  try {
    const { name, collegeId } = req.body;
    const createdBy = req.user.id;

    // Optional: check if college exists
    const college = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!college) return res.status(400).json({ error: 'Invalid collegeId' });

    const club = await prisma.club.create({
      data: { name, collegeId, createdBy },
    });
    res.status(201).json({ message: 'Club created', club });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateClub = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);
    const { name } = req.body;

    // Check if club exists
    const existingClub = await prisma.club.findUnique({ where: { id: clubId } });
    if (!existingClub) return res.status(404).json({ error: 'Club not found' });

    const club = await prisma.club.update({
      where: { id: clubId },
      data: { name },
    });
    res.json({ message: 'Club updated', club });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteClub = async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);

    // Check if club exists
    const existingClub = await prisma.club.findUnique({ where: { id: clubId } });
    if (!existingClub) return res.status(404).json({ error: 'Club not found' });

    await prisma.club.delete({ where: { id: clubId } });
    res.json({ message: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
