// server/simulate-courses.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CreateCourseInput } from 'shared';
import CourseModel from './models/Course';
import UserModel from './models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI must be defined in environment variables');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Pre-defined course data
const courses = [
  {
    name: 'Pebble Beach Golf Links',
    location: { city: 'Pebble Beach', state: 'CA', country: 'USA' },
    tees: [
      { name: 'Black', rating: 74.7, slope: 143, numberOfFairways: 14 },
      { name: 'Blue', rating: 72.6, slope: 138, numberOfFairways: 14 },
      { name: 'White', rating: 70.8, slope: 135, numberOfFairways: 14 }
    ]
  },
  {
    name: 'Augusta National Golf Club',
    location: { city: 'Augusta', state: 'GA', country: 'USA' },
    tees: [
      { name: 'Championship', rating: 76.2, slope: 148, numberOfFairways: 14 },
      { name: 'Member', rating: 73.5, slope: 140, numberOfFairways: 14 }
    ]
  },
  {
    name: 'St Andrews Old Course',
    location: { city: 'St Andrews', state: null, country: 'Scotland' },
    tees: [
      { name: 'Championship', rating: 73.1, slope: 132, numberOfFairways: 14 },
      { name: 'White', rating: 71.8, slope: 130, numberOfFairways: 14 }
    ]
  },
  {
    name: 'Torrey Pines South Course',
    location: { city: 'La Jolla', state: 'CA', country: 'USA' },
    tees: [
      { name: 'Black', rating: 75.3, slope: 144, numberOfFairways: 14 },
      { name: 'Blue', rating: 73.2, slope: 140, numberOfFairways: 14 },
      { name: 'White', rating: 71.5, slope: 135, numberOfFairways: 14 }
    ]
  },
  {
    name: 'Bethpage Black',
    location: { city: 'Farmingdale', state: 'NY', country: 'USA' },
    tees: [
      { name: 'Black', rating: 77.5, slope: 152, numberOfFairways: 14 },
      { name: 'Blue', rating: 74.3, slope: 144, numberOfFairways: 14 },
      { name: 'White', rating: 72.1, slope: 139, numberOfFairways: 14 }
    ]
  },
  {
    name: 'TPC Sawgrass',
    location: { city: 'Ponte Vedra Beach', state: 'FL', country: 'USA' },
    tees: [
      { name: 'Championship', rating: 75.8, slope: 146, numberOfFairways: 14 },
      { name: 'Blue', rating: 73.6, slope: 140, numberOfFairways: 14 },
      { name: 'White', rating: 71.4, slope: 136, numberOfFairways: 14 }
    ]
  },
  {
    name: 'Pinehurst No. 2',
    location: { city: 'Pinehurst', state: 'NC', country: 'USA' },
    tees: [
      { name: 'Championship', rating: 74.9, slope: 138, numberOfFairways: 14 },
      { name: 'Blue', rating: 72.7, slope: 134, numberOfFairways: 14 },
      { name: 'White', rating: 70.6, slope: 132, numberOfFairways: 14 }
    ]
  },
  {
    name: 'Oakland Hills South Course',
    location: { city: 'Bloomfield Hills', state: 'MI', country: 'USA' },
    tees: [
      { name: 'Championship', rating: 75.6, slope: 143, numberOfFairways: 14 },
      { name: 'Blue', rating: 73.8, slope: 139, numberOfFairways: 14 },
      { name: 'White', rating: 71.7, slope: 135, numberOfFairways: 14 }
    ]
  },
  {
    name: 'Royal County Down',
    location: { city: 'Newcastle', state: null, country: 'Northern Ireland' },
    tees: [
      { name: 'Championship', rating: 74.8, slope: 142, numberOfFairways: 14 },
      { name: 'White', rating: 72.5, slope: 137, numberOfFairways: 14 }
    ]
  },
  {
    name: 'Winged Foot West Course',
    location: { city: 'Mamaroneck', state: 'NY', country: 'USA' },
    tees: [
      { name: 'Championship', rating: 76.4, slope: 145, numberOfFairways: 14 },
      { name: 'Blue', rating: 74.2, slope: 140, numberOfFairways: 14 },
      { name: 'White', rating: 72.1, slope: 136, numberOfFairways: 14 }
    ]
  }
];

// Main function to create courses
async function createCourses() {
  try {
    // Get user email from command line arg, or use default
    const args = process.argv.slice(2);
    const userEmail = args[0] || 'test@example.com';
    
    console.log(`Creating courses for user: ${userEmail}`);
    
    // Find the user
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      console.error(`User with email ${userEmail} not found`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.email} with ID: ${user._id}`);
    
    // Check if courses already exist
    const existingCourseCount = await CourseModel.countDocuments();
    if (existingCourseCount > 0) {
      console.log(`There are already ${existingCourseCount} courses in the database.`);
      const shouldProceed = args[1] === 'force';
      
      if (!shouldProceed) {
        console.log('Skipping course creation. Pass "force" as the second argument to override.');
        process.exit(0);
      }
    }
    
    // Create courses
    const createdCourses = [];
    for (const courseData of courses) {
      // Check if course already exists
      const existingCourse = await CourseModel.findOne({
        name: courseData.name,
        'location.city': courseData.location.city,
        'location.state': courseData.location.state,
        'location.country': courseData.location.country
      });
      
      if (existingCourse) {
        console.log(`Course "${courseData.name}" already exists, skipping...`);
        createdCourses.push(existingCourse);
        continue;
      }
      
      // Create course with user as creator
      const course = new CourseModel({
        ...courseData,
        addedBy: user._id
      });
      
      await course.save();
      createdCourses.push(course);
      console.log(`Created course: ${course.name}`);
    }
    
    console.log(`Successfully created ${createdCourses.length} courses`);
    return createdCourses;
  } catch (error) {
    console.error('Error creating courses:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the course creation
createCourses().then(() => {
  console.log('Course creation completed successfully');
  process.exit(0);
}).catch(err => {
  console.error('Course creation failed:', err);
  process.exit(1);
});