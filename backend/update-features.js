//update-features.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database update for new features...');
  
  // ================================================================
  // ADD USER ROLES - Update existing users with roles
  // ================================================================
  
  // Make the first test user an admin
  try {
    const adminUser = await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { 
        role: 'admin',
        imageUrl: 'https://example.com/images/users/admin-profile.jpg'
      }
    });
    console.log(`Updated user ${adminUser.email} as admin`);
  } catch (error) {
    console.log(`Couldn't update test@example.com: ${error.message}`);
  }
  
  // Create a gym owner user
  try {
    const gymOwnerUser = await prisma.user.upsert({
      where: { email: 'owner@example.com' },
      update: { 
        role: 'gym_owner',
        imageUrl: 'https://example.com/images/users/owner-profile.jpg'
      },
      create: {
        email: 'owner@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        displayName: 'Gym Owner',
        role: 'gym_owner',
        gender: 'Other',
        heightCm: 180,
        weightKg: 75,
        imageUrl: 'https://example.com/images/users/owner-profile.jpg'
      }
    });
    console.log(`Created/updated gym owner user: ${gymOwnerUser.email}`);
    
    // Assign gyms to the gym owner
    const gyms = await prisma.gym.findMany({
      take: 5,
      orderBy: { id: 'asc' }
    });
    
    for (const gym of gyms) {
      await prisma.gym.update({
        where: { id: gym.id },
        data: { ownerId: gymOwnerUser.id }
      });
      console.log(`Assigned gym "${gym.name}" to gym owner ${gymOwnerUser.email}`);
    }
  } catch (error) {
    console.log(`Couldn't create/update gym owner: ${error.message}`);
  }
  
  // Update other existing users as regular users with profile images
  const regularUsers = ['jane@example.com', 'bob@example.com', 'alice@example.com', 'carlos@example.com'];
  for (const [index, email] of regularUsers.entries()) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.user.update({
          where: { email },
          data: { 
            role: 'user',
            imageUrl: `https://example.com/images/users/user-${index + 1}.jpg`
          }
        });
        console.log(`Updated user ${email} as regular user`);
      }
    } catch (error) {
      console.log(`Couldn't update ${email}: ${error.message}`);
    }
  }
  
  // ================================================================
  // ADD IMAGES TO EXERCISES
  // ================================================================
  
  // Add images to existing exercises
  const exerciseIcons = {
    'Push-up': 'https://example.com/images/exercises/pushup.jpg',
    'Squat': 'https://example.com/images/exercises/squat.jpg',
    'Plank': 'https://example.com/images/exercises/plank.jpg',
    'Deadlift': 'https://example.com/images/exercises/deadlift.jpg',
    'Running': 'https://example.com/images/exercises/running.jpg',
    'Jumping Jacks': 'https://example.com/images/exercises/jumping-jacks.jpg',
    'Mountain Climbers': 'https://example.com/images/exercises/mountain-climbers.jpg',
    'Hamstring Stretch': 'https://example.com/images/exercises/hamstring-stretch.jpg',
    'Downward Dog': 'https://example.com/images/exercises/downward-dog.jpg',
    'One-Leg Balance': 'https://example.com/images/exercises/one-leg-balance.jpg'
  };
  
  try {
    const exercises = await prisma.exercise.findMany();
    
    for (const exercise of exercises) {
      await prisma.exercise.update({
        where: { id: exercise.id },
        data: {
          imageUrl: exerciseIcons[exercise.name] || `https://example.com/images/exercises/generic.jpg`
        }
      });
      console.log(`Added image to exercise: ${exercise.name}`);
    }
  } catch (error) {
    console.log(`Error updating exercise images: ${error.message}`);
  }
  
  // ================================================================
  // UPDATE PLANNED EXERCISES WITH CALORIES
  // ================================================================
  
  // Function to estimate calories based on exercise type, duration, etc.
  function estimateCalories(exercise, sets, reps, duration) {
    const baseCalories = {
      'strength': 5, // per rep
      'cardio': 10,  // per minute
      'flexibility': 3, // per minute
      'balance': 2   // per minute
    };
    
    const category = exercise.category || 'strength';
    
    if (category === 'cardio' || category === 'flexibility' || category === 'balance') {
      return duration ? duration * baseCalories[category] : 50;
    } else {
      // For strength exercises: sets * reps * baseCalories
      return sets && reps ? sets * reps * baseCalories[category] : 60;
    }
  }
  
  try {
    // Update existing planned exercises with calorie estimates
    const plannedExercises = await prisma.plannedExercise.findMany({
      include: { exercise: true }
    });
    
    for (const pe of plannedExercises) {
      const calories = estimateCalories(
        pe.exercise, 
        pe.plannedSets, 
        pe.plannedReps, 
        pe.plannedDuration
      );
      
      await prisma.plannedExercise.update({
        where: { id: pe.id },
        data: { plannedCalories: calories }
      });
      console.log(`Added ${calories} planned calories to ${pe.exercise.name}`);
    }
  } catch (error) {
    console.log(`Error updating planned exercise calories: ${error.message}`);
  }
  
  // ================================================================
  // UPDATE ACTUAL EXERCISES WITH CALORIES
  // ================================================================
  
  try {
    // Update existing actual exercises with calorie estimates
    const actualExercises = await prisma.actualExercise.findMany({
      include: { exercise: true }
    });
    
    for (const ae of actualExercises) {
      const calories = estimateCalories(
        ae.exercise, 
        ae.actualSets, 
        ae.actualReps, 
        ae.actualDuration
      );
      
      await prisma.actualExercise.update({
        where: { id: ae.id },
        data: { actualCalories: calories }
      });
      console.log(`Added ${calories} actual calories to ${ae.exercise.name}`);
    }
  } catch (error) {
    console.log(`Error updating actual exercise calories: ${error.message}`);
  }
  
  // ================================================================
  // CREATE A FEW NEW EXERCISES WITH IMAGES TO TEST NEW FEATURES
  // ================================================================
  
  try {
    const newExercises = [
      { 
        name: 'Dumbbell Press', 
        category: 'strength', 
        description: 'Upper body exercise focusing on chest and shoulders',
        imageUrl: 'https://example.com/images/exercises/dumbbell-press.jpg'
      },
      { 
        name: 'Flutter Kicks', 
        category: 'cardio', 
        description: 'Core and cardio exercise to elevate heart rate',
        imageUrl: 'https://example.com/images/exercises/flutter-kicks.jpg'
      },
      { 
        name: 'Cobra Stretch', 
        category: 'flexibility', 
        description: 'Back stretch that opens the chest and strengthens the spine',
        imageUrl: 'https://example.com/images/exercises/cobra-stretch.jpg'
      }
    ];
    
    for (const exerciseData of newExercises) {
      await prisma.exercise.upsert({
        where: { name: exerciseData.name },
        update: exerciseData,
        create: exerciseData
      });
      console.log(`Created/updated test exercise: ${exerciseData.name}`);
    }
  } catch (error) {
    console.log(`Error creating test exercises: ${error.message}`);
  }
  
  // ================================================================
  // CREATE A SAMPLE PLANNED WORKOUT WITH CALORIES FOR TESTING
  // ================================================================
  
  try {
    // Find our test user
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (user) {
      // Find exercises for our test workout
      const workoutExercises = await prisma.exercise.findMany({
        take: 3,
        orderBy: { id: 'desc' } // Take the newest exercises
      });
      
      if (workoutExercises.length > 0) {
        // Create a test planned workout with calories
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const testWorkout = await prisma.plannedWorkout.create({
          data: {
            userId: user.id,
            title: 'Test Calories Workout',
            scheduledDate: nextWeek,
            estimatedDuration: 45,
            plannedExercises: {
              create: [
                {
                  exerciseId: workoutExercises[0].id,
                  plannedSets: 4,
                  plannedReps: 10,
                  plannedWeight: 60,
                  plannedCalories: 200
                },
                {
                  exerciseId: workoutExercises[1].id,
                  plannedSets: 3,
                  plannedDuration: 10,
                  plannedCalories: 100
                },
                {
                  exerciseId: workoutExercises[2].id,
                  plannedSets: 2,
                  plannedDuration: 5,
                  plannedCalories: 30
                }
              ]
            }
          }
        });
        
        console.log(`Created test planned workout: ${testWorkout.title}`);
      }
    }
  } catch (error) {
    console.log(`Error creating test planned workout: ${error.message}`);
  }
  
  // ================================================================
  // CREATE A SAMPLE ACTUAL WORKOUT WITH CALORIES FOR TESTING
  // ================================================================
  
  try {
    // Find our test user
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (user) {
      // Find exercises for our test workout
      const workoutExercises = await prisma.exercise.findMany({
        take: 3,
        orderBy: { id: 'desc' } // Take the newest exercises
      });
      
      if (workoutExercises.length > 0) {
        // Create a test actual workout with calories
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const testWorkout = await prisma.actualWorkout.create({
          data: {
            userId: user.id,
            title: 'Test Completed Calories Workout',
            completedDate: yesterday,
            completedTime: new Date(yesterday.setHours(18, 0, 0, 0)),
            actualDuration: 40,
            actualExercises: {
              create: [
                {
                  exerciseId: workoutExercises[0].id,
                  actualSets: 3,
                  actualReps: 12,
                  actualWeight: 55,
                  actualCalories: 180
                },
                {
                  exerciseId: workoutExercises[1].id,
                  actualSets: 3,
                  actualDuration: 12,
                  actualCalories: 120
                },
                {
                  exerciseId: workoutExercises[2].id,
                  actualSets: 2,
                  actualDuration: 6,
                  actualCalories: 36
                }
              ]
            }
          }
        });
        
        console.log(`Created test actual workout: ${testWorkout.title}`);
      }
    }
  } catch (error) {
    console.log(`Error creating test actual workout: ${error.message}`);
  }
  
  console.log('Feature updates completed!');
}

main()
  .catch(e => {
    console.error('Error during feature updates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });