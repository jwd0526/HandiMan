// server/routes/courses.ts
import express, { Request } from 'express';
import { Course } from 'shared';
import CourseModel, { ICourse } from '../models/Course';
import { authenticateToken } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
  };
}

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

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { search } = req.query;
    const query = search ? {
      $or: [
        { name: new RegExp(String(search), 'i') },
        { 'location.city': new RegExp(String(search), 'i') }
      ]
    } : {};

    const courses = await CourseModel.find(query).sort({ name: 1 }).limit(50);
    res.json({
      success: true,
      data: courses.map(mapCourseToResponse)
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses'
    });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const course = new CourseModel({
      ...req.body,
      addedBy: req.user._id
    });

    await course.save();
    res.status(201).json({
      success: true,
      data: mapCourseToResponse(course)
    });
  } catch (error) {
    if ((error as any).code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A course with this name and location already exists'
      });
    }

    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course'
    });
  }
});

export default router;