// server/routes/courses.ts
import express from 'express';
import { Course } from 'shared';
import CourseModel, { ICourse } from '../models/Course';
import { authenticateToken } from '../middleware/auth';
import exp from 'constants';

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

export default router;