import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllColleges = async (req, res) => {
  try {
    const colleges = await prisma.college.findMany();
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCollegeById = async (req, res) => {
  try {
    const collegeId = parseInt(req.params.id);
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      include: { clubs: true, events: true },
    });
    if (!college) return res.status(404).json({ error: 'College not found' });
    res.json(college);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCollege = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Optionally check if code is unique before create to catch friendly error early
    const existingCollege = await prisma.college.findUnique({ where: { code } });
    if (existingCollege) {
      return res.status(409).json({ error: 'College code already exists' });
    }

    const college = await prisma.college.create({ data: { name, code } });
    res.status(201).json({ message: 'College created', college });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCollege = async (req, res) => {
  try {
    const collegeId = parseInt(req.params.id);
    const { name, code } = req.body;

    const existingCollege = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!existingCollege) return res.status(404).json({ error: 'College not found' });

    // Check for code uniqueness on update (if code changed)
    if (code && code !== existingCollege.code) {
      const codeExists = await prisma.college.findUnique({ where: { code } });
      if (codeExists) {
        return res.status(409).json({ error: 'College code already exists' });
      }
    }

    const college = await prisma.college.update({
      where: { id: collegeId },
      data: { name, code },
    });
    res.json({ message: 'College updated', college });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCollege = async (req, res) => {
  try {
    const collegeId = parseInt(req.params.id);
    const existingCollege = await prisma.college.findUnique({ where: { id: collegeId } });
    if (!existingCollege) return res.status(404).json({ error: 'College not found' });

    await prisma.college.delete({ where: { id: collegeId } });
    res.json({ message: 'College deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
