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

export default router;