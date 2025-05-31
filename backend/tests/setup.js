//tests/setup.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use a separate test database
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:321123@localhost:5432/sustracker_test';
process.env.JWT_SECRET = 'e06c3e12d094a12d933cd65dc004df543e060e4f0c8b5356da9c7f32260a918102688eca0c3ee8860c0651a8b7716cd1d61472f588fd14aae65988e84fa63840';
process.env.NODE_ENV = 'test';
process.env.ENABLE_NOTIFICATIONS = 'false';

const prisma = new PrismaClient();

// Increase timeout for database operations
jest.setTimeout(30000);

beforeAll(async () => {
  try {
    // Clean up test database before running tests
    await cleanDatabase();
    
    // Create test users
    await createTestUsers();
    
    // Create test exercises
    await createTestExercises();
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Clean up and disconnect
    await cleanDatabase();
    await prisma.$disconnect();
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
});

beforeEach(async () => {
  try {
    // Clean up data between tests (except users and exercises) - in correct order
    await prisma.userBooking.deleteMany();
    await prisma.classSchedule.deleteMany();
    await prisma.gymClass.deleteMany();
    await prisma.userMembership.deleteMany();
    await prisma.membershipPayment.deleteMany();
    await prisma.membershipPlan.deleteMany();
    await prisma.competitionProgress.deleteMany();
    await prisma.competitionTask.deleteMany();
    await prisma.competitionUser.deleteMany();
    await prisma.competition.deleteMany();
    await prisma.gym.deleteMany();
    await prisma.actualExercise.deleteMany();
    await prisma.actualWorkout.deleteMany();
    await prisma.plannedExercise.deleteMany();
    await prisma.plannedWorkout.deleteMany();
    await prisma.dietEntry.deleteMany();
    await prisma.foodItem.deleteMany();
    await prisma.aiInteraction.deleteMany();
  } catch (error) {
    console.error('BeforeEach cleanup failed:', error);
  }
});

async function cleanDatabase() {
  try {
    // Delete in correct order to avoid foreign key constraints
    const tables = [
      'user_bookings',
      'class_schedules', 
      'gym_classes',
      'membership_payments',
      'user_memberships',
      'membership_plans',
      'competition_progress',
      'competition_tasks',
      'competition_users',
      'competitions',
      'gyms',
      'actual_exercises',
      'actual_workouts',
      'planned_exercises',
      'planned_workouts',
      'diet_entries',
      'food_items',
      'ai_interactions',
      'exercises',
      'users'
    ];

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
      } catch (error) {
        // Table might not exist or be empty, continue
        console.log(`Warning: Could not clean table ${table}`);
      }
    }

    // Reset sequences if needed
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), 1, false);`);
      } catch (error) {
        // Sequence might not exist, continue
      }
    }
  } catch (error) {
    console.error('Database cleanup failed:', error);
    throw error;
  }
}

async function createTestUsers() {
  try {
    global.testUsers = {
      admin: await prisma.user.create({
        data: {
          email: 'admin@test.com',
          passwordHash: await bcrypt.hash('password123', 10),
          displayName: 'Test Admin',
          role: 'admin'
        }
      }),
      gymOwner: await prisma.user.create({
        data: {
          email: 'owner@test.com',
          passwordHash: await bcrypt.hash('password123', 10),
          displayName: 'Test Gym Owner',
          role: 'gym_owner'
        }
      }),
      user: await prisma.user.create({
        data: {
          email: 'user@test.com',
          passwordHash: await bcrypt.hash('password123', 10),
          displayName: 'Test User',
          role: 'user'
        }
      })
    };
  } catch (error) {
    console.error('Failed to create test users:', error);
    throw error;
  }
}

async function createTestExercises() {
  try {
    global.testExercises = {
      pushup: await prisma.exercise.create({
        data: {
          name: 'Push-up',
          category: 'strength',
          description: 'Basic chest exercise'
        }
      }),
      squat: await prisma.exercise.create({
        data: {
          name: 'Squat',
          category: 'strength',
          description: 'Lower body exercise'
        }
      }),
      running: await prisma.exercise.create({
        data: {
          name: 'Running',
          category: 'cardio',
          description: 'Cardiovascular exercise'
        }
      })
    };
  } catch (error) {
    console.error('Failed to create test exercises:', error);
    throw error;
  }
}

global.prisma = prisma;