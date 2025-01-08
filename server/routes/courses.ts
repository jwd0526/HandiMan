// server/routes/courses.ts
import express, { Request } from 'express';
import { Course, CreateCourseInput } from 'shared';
import CourseModel, { ICourse } from '../models/Course';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

function mapCourseToResponse(course: ICourse): Course {
  return {
    _id: course._id.toString(),
    name: course.name,
    location: course.location,
    tees: course.tees,
    addedBy: course.addedBy.toString(),
    createdAt: course.createdAt,
    updatedAt: course.updatedAt
  };
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    const query = search ? {
      $or: [
        { name: new RegExp(search as string, 'i') },
        { 'location.city': new RegExp(search as string, 'i') }
      ]
    } : {};

    const courses = await CourseModel.find(query).sort({ name: 1 }).limit(50);
    res.json({
      success: true,
      data: courses.map(mapCourseToResponse)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

router.post('/', authenticateToken, async (req: Request & { user?: { _id: string } }, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const courseData: CreateCourseInput = {
      ...req.body,
      addedBy: userId
    };

    const course = new CourseModel(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      data: mapCourseToResponse(course)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating course'
    });
  }
});

router.post('/:courseId/tees', authenticateToken, async (req: Request & { user?: { _id: string } }, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Find the course and verify ownership
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.addedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this course'
      });
    }

    // Validate tee data
    const teeData = req.body;
    if (!teeData.name || !teeData.rating || !teeData.slope || !teeData.numberOfFairways) {
      return res.status(400).json({
        success: false,
        message: 'Missing required tee information'
      });
    }

    // Validate tee data values
    if (typeof teeData.rating !== 'number' || teeData.rating < 0 || teeData.rating > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course rating. Must be between 0 and 100'
      });
    }

    if (typeof teeData.slope !== 'number' || teeData.slope < 55 || teeData.slope > 155) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slope rating. Must be between 55 and 155'
      });
    }

    if (typeof teeData.numberOfFairways !== 'number' || 
        !Number.isInteger(teeData.numberOfFairways) || 
        teeData.numberOfFairways < 0 || 
        teeData.numberOfFairways > 18) {
      return res.status(400).json({
        success: false,
        message: 'Invalid number of fairways. Must be an integer between 0 and 18'
      });
    }

    // Check if tee color already exists
    const teeExists = course.tees.some(tee => 
      tee.name.toLowerCase() === teeData.name.toLowerCase()
    );

    if (teeExists) {
      return res.status(400).json({
        success: false,
        message: 'Tee color already exists'
      });
    }

    // Add the new tee
    course.tees.push({
      name: teeData.name.trim(),
      rating: Number(teeData.rating),
      slope: Number(teeData.slope),
      numberOfFairways: Number(teeData.numberOfFairways)
    });

    await course.save();

    res.json({
      success: true,
      data: mapCourseToResponse(course)
    });
  } catch (error) {
    console.error('Error adding tee to course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding tee'
    });
  }
});

export default router;