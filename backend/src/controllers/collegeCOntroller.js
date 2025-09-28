// collegeController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all colleges
export const getAllColleges = async (req, res) => {
  try {
    const colleges = await prisma.college.findMany();
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get college by ID
export const getCollegeById = async (req, res) => {
  try {
    const college = await prisma.college.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { clubs: true, events: true }
    });
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.json(college);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create college (Admin)
export const createCollege = async (req, res) => {
  try {
    const { name, code } = req.body;
    const college = await prisma.college.create({ data: { name, code } });
    res.json({ message: 'College created', college });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update college (Admin)
export const updateCollege = async (req, res) => {
  try {
    const { name, code } = req.body;
    const college = await prisma.college.update({
      where: { id: parseInt(req.params.id) },
      data: { name, code }
    });
    res.json({ message: 'College updated', college });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete college (Admin)
export const deleteCollege = async (req, res) => {
  try {
    await prisma.college.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'College deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
