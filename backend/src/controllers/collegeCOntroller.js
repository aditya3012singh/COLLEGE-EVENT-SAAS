import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCollege = async (req, res) => {
  try {
    const { name, code , logo} = req.body;

    if(!name || !code){
      return  res.status(400).json({ 
        error: 'Name and code are required' ,
        required: ['name','code']
      });
    }

    const normalizedCode = code.toUpperCase().trim();
    const normalizedName = name.trim();

    // Optionally check if code is unique before create to catch friendly error early
    const existingCollege = await prisma.college.findUnique({ where: { normalizedCode } });
    if (existingCollege) {
      return res.status(409).json({ error: 'College code already exists' ,
        message: 'A college with this code already exists'
      });
    }

    const college = await prisma.college.create({
      data: { 
        name: normalizedName, 
        code: normalizedCode , 
        logo: logo?.trim() || null
      },
      select: { 
        id: true, 
        name: true, 
        code: true,
        logo: true,
        createdAt: true  
      }

      });
    res.status(201).json({ message: 'College created', college });
  } catch (err) {
    // ✅ 6. Handle known Prisma errors
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'College code must be unique' });
    }

    console.error('Create college error:', err);
    res.status(500).json({
      error: 'Failed to create college',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An internal server error occurred',
    });
  }
};


export const getAllColleges = async (req, res) => {
  try {
    const{limit=100, skip=0} = req.query;
    const colleges = await prisma.college.findMany({
      skip: Number(skip),
      take: Math.min(Number(limit), 100),
      select: { 
        id: true, 
        name: true, 
        code: true,
        logo: true,
        createdAt: true  
      },
      orderBy: { name: 'asc' }
    });
    res.status(200).json(
      {
        message: 'Colleges retrieved successfully',
        count: colleges.length,
        colleges
      }
    );
  } catch (err) {
    console.error('Get all colleges error:', err);
    res.status(500).json({
      error: 'Failed to fetch colleges',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An internal server error occurred',
    });
  }
};

export const getCollegeById = async (req, res) => {
  try {
    const collegeId = Number(req.params.id);
    if(!collegeId || isNaN(collegeId) || collegeId <=0){
      return res.status(400).json({ error: 'Invalid college ID' });
    }
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      select: {
        id:true,
        name: true,
        code:true,
        logo:true,
        createdAt:true,
        clubs: {
          select:{
            id:true,
            name:true,
            description:true,
            createdBy:true,
            createdAt:true
          }
        },
        events: {
          select:{
            id:true,
            title:true,
            description:true,
            dateTime:true,
            venue:true,
            createdBy:true,
            createdAt:true,
            isPaid:true,
          },
          take: 10,
          orderBy: { dateTime: 'desc'
          }
        }
      }
    });

    res.status(200).json({
      message: 'College fetched successfully',
      college,
    });
  } catch (err) {
    console.error('Get college by ID error:', err);
    res.status(500).json({
      error: 'Failed to fetch college details',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An internal server error occurred',
    });
  }
};



  export const updateCollege = async (req, res) => {
    try {
      const collegeId = Number(req.params.id);
      const { name, code, logo } = req.body;

      if(!collegeId || isNaN(collegeId) || collegeId <=0){
        return res.status(400).json({ error: 'Invalid college ID' });
      }

      if(!name || !code){
        return  res.status(400).json({ 
          error: 'Name and code are required' ,
          required: ['name','code']
        });
      }
      
      const existingCollege = await prisma.college.findUnique({ 
        where: { 
          id: collegeId 
        } 
      });

      if (!existingCollege) return res.status(404).json({ error: 'College not found' });

      // Check for code uniqueness on update (if code changed)
      if (code && code !== existingCollege.code) {
        const codeExists = await prisma.college.findUnique({ where: { code } });
        if (codeExists) {
          return res.status(409).json({ error: 'College code already exists' });
        }
      }

      const updatedCollege = await prisma.college.update({
        where:{
          id:collegeId,
        },
        data:{
          name: name.trim(),
          code: code.toUpperCase().trim(),
           ...(logo && { logo: logo.trim() }),
        },
        select: {
          id:true,
          name: true,
          code:true,
          logo:true,
          createdAt:true
        }
      });

      return res.satus(200).json({
        message: 'College updated successfully',
        college: updatedCollege,
      })
    } catch (err) {
    console.error('Update college error:', err);
    res.status(500).json({
      error: 'Failed to update college',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An internal server error occurred',
    });
  }
};



export const deleteCollege = async (req, res) => {
  try {
    const collegeId = Number(req.params.id);

    if(!collegeId || isNaN(collegeId) || collegeId <=0){
      return res.status(400).json({ error: 'Invalid college ID' });
    }

    const existingCollege = await prisma.college.findUnique({ 
      where: { 
        id: collegeId
      } 
    });

    if (!existingCollege) return res.status(404).json({ error: 'College not found' });

    try {
      const deletedCollege = await prisma.college.delete({
        where:{
          id:collegeId,
        },
        select: {
          id:true,
          name: true,
          code:true,
        }
      });
      return res.status(200).json({
        message: 'College deleted successfully',
        college: deletedCollege,
      });
    }
    catch (prismaErr) {
      // ✅ Handle foreign key constraint (P2003)
      if (prismaErr.code === 'P2003') {
        return res.status(409).json({
          error: 'Cannot delete college with associated records (clubs, events, or users)',
        });
      }

      throw prismaErr; // rethrow if not a known Prisma error
    }
  } catch (err) {
    console.error('Delete college error:', err);
    res.status(500).json({
      error: 'Failed to delete college',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An internal server error occurred',
    });
  }
};
