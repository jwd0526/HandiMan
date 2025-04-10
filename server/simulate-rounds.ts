// server/simulate-rounds.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Course, CreateRoundInput } from 'shared';
import RoundModel from './models/Round';
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

// Generate a random score between min and max
function randomScore(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random date within a specified range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Calculate differential using course rating and slope
function calculateDifferential(score: number, rating: number, slope: number): number {
  const differential = ((score - rating) * 113) / slope;
  return Math.round(differential * 10) / 10;
}

// Generate a single round
function generateRound(userId: string, course: Course, startDate: Date, endDate: Date): CreateRoundInput {
  // Select a random tee
  const teeIndex = Math.floor(Math.random() * course.tees.length);
  const selectedTee = course.tees[teeIndex];
  
  // Generate random stats
  const score = randomScore(70, 100);  // Score range
  const putts = randomScore(28, 36);   // Putts range
  const fairways = randomScore(5, selectedTee.numberOfFairways);  // Fairways hit range
  const greens = randomScore(6, 18);   // Greens in regulation range
  
  // Generate random date
  const date = randomDate(startDate, endDate);
  
  // Generate notes
  const notes = Math.random() > 0.7 ? `Practice round. Score: ${score}` : undefined;
  
  return {
    course,
    date,
    tees: selectedTee.name,
    score,
    putts,
    fairways,
    greens,
    notes,
    addedBy: userId,
  };
}

// Generate random notes for a given score
function generateNotes(score: number): string | undefined {
  const noteTemplates = [
    `Played well despite the ${score}. Driver was solid.`,
    `Struggled with putting. Need practice.`,
    `Good iron play today. Score: ${score}`,
    `Windy conditions affected my game.`,
    `Hit ${Math.floor(score / 5)} fairways. Consistent day.`,
    `Cold weather round. Proud of this ${score}.`,
    `Tournament round. Nervous at first.`,
    `Practice round focusing on course management.`
  ];
  
  // 30% chance of having notes
  if (Math.random() > 0.7) {
    const noteIndex = Math.floor(Math.random() * noteTemplates.length);
    return noteTemplates[noteIndex];
  }
  
  return undefined;
}

// Main function to simulate rounds
async function simulateRounds() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const userEmail = args[0] || 'test@example.com';
    const roundCount = parseInt(args[1]) || 20;
    
    console.log(`Simulating ${roundCount} rounds for user: ${userEmail}`);
    
    // Find the user
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      console.error(`User with email ${userEmail} not found`);
      process.exit(1);
    }
    
    // Find available courses
    const courses = await CourseModel.find({});
    if (courses.length === 0) {
      console.error('No courses found. Please add courses first.');
      process.exit(1);
    }
    
    console.log(`Found ${courses.length} courses and user ID: ${user._id}`);
    
    // Date range for rounds (last 6 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    // Generate and save rounds
    const rounds = [];
    for (let i = 0; i < roundCount; i++) {
      // Select a random course
      const courseIndex = Math.floor(Math.random() * courses.length);
      const course = courses[courseIndex];
      
      // Convert course Mongoose document to Course type with proper string IDs
      const courseObj = {
        ...course.toObject(),
        _id: course._id.toString(),
        addedBy: course.addedBy.toString()
      };
      
      // Generate round data
      const roundData = generateRound(user._id.toString(), courseObj, startDate, endDate);
      
      // Create round instance
      const round = new RoundModel({
        ...roundData,
        course: course._id
      });
      
      // Calculate differential
      const selectedTee = course.tees.find(t => t.name === roundData.tees);
      if (selectedTee) {
        round.differential = calculateDifferential(
          roundData.score, 
          selectedTee.rating, 
          selectedTee.slope
        );
      }
      
      // Save round
      await round.save();
      rounds.push(round);
      
      console.log(`Created round #${i + 1}: ${roundData.score} at ${course.name}`);
    }
    
    console.log(`Successfully created ${rounds.length} rounds for user ${userEmail}`);
    return rounds;
  } catch (error) {
    console.error('Error simulating rounds:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the simulation
simulateRounds().then(() => {
  console.log('Simulation completed successfully');
  process.exit(0);
}).catch(err => {
  console.error('Simulation failed:', err);
  process.exit(1);
});