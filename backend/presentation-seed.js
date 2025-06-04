// presentation-seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function presentationSeed() {
  console.log('🎯 Starting Presentation-Focused Data Seeding...');
  console.log('Creating rich data for demo user and gym owner...');

  try {
    // ================================================================
    // CREATE THE DEMO USER - MAIN CHARACTER FOR USER PRESENTATION
    // ================================================================
    
    const demoUserData = {
      email: 'demo.user@fittrack.com',
      password: 'demo123',
      displayName: 'Alex Morgan',
      role: 'user',
      gender: 'Other',
      heightCm: 175,
      weightKg: 72,
      dateOfBirth: '1995-06-15'
    };

    const demoUser = await prisma.user.upsert({
      where: { email: demoUserData.email },
      update: {
        displayName: demoUserData.displayName,
        role: demoUserData.role,
        gender: demoUserData.gender,
        heightCm: demoUserData.heightCm,
        weightKg: demoUserData.weightKg,
        dateOfBirth: new Date(demoUserData.dateOfBirth),
        imageUrl: 'https://example.com/images/users/demo-user-alex.jpg'
      },
      create: {
        email: demoUserData.email,
        passwordHash: await bcrypt.hash(demoUserData.password, 10),
        displayName: demoUserData.displayName,
        role: demoUserData.role,
        gender: demoUserData.gender,
        heightCm: demoUserData.heightCm,
        weightKg: demoUserData.weightKg,
        dateOfBirth: new Date(demoUserData.dateOfBirth),
        imageUrl: 'https://example.com/images/users/demo-user-alex.jpg'
      }
    });

    console.log(`✅ Created DEMO USER: ${demoUser.email} (${demoUser.displayName})`);

    // ================================================================
    // CREATE THE DEMO GYM OWNER - MAIN CHARACTER FOR GYM OWNER PRESENTATION
    // ================================================================
    
    const demoOwnerData = {
      email: 'demo.owner@fittrack.com',
      password: 'demo123',
      displayName: 'Jordan Elite',
      role: 'gym_owner',
      gender: 'Other',
      heightCm: 180,
      weightKg: 78,
      dateOfBirth: '1985-09-22'
    };

    const demoOwner = await prisma.user.upsert({
      where: { email: demoOwnerData.email },
      update: {
        displayName: demoOwnerData.displayName,
        role: demoOwnerData.role,
        gender: demoOwnerData.gender,
        heightCm: demoOwnerData.heightCm,
        weightKg: demoOwnerData.weightKg,
        dateOfBirth: new Date(demoOwnerData.dateOfBirth),
        imageUrl: 'https://example.com/images/users/demo-owner-jordan.jpg'
      },
      create: {
        email: demoOwnerData.email,
        passwordHash: await bcrypt.hash(demoOwnerData.password, 10),
        displayName: demoOwnerData.displayName,
        role: demoOwnerData.role,
        gender: demoOwnerData.gender,
        heightCm: demoOwnerData.heightCm,
        weightKg: demoOwnerData.weightKg,
        dateOfBirth: new Date(demoOwnerData.dateOfBirth),
        imageUrl: 'https://example.com/images/users/demo-owner-jordan.jpg'
      }
    });

    console.log(`✅ Created DEMO GYM OWNER: ${demoOwner.email} (${demoOwner.displayName})`);

    // ================================================================
    // CREATE DEMO GYM OWNER'S GYMS (3 GYMS)
    // ================================================================
    
    const demoGymsData = [
      {
        name: 'Elite Performance Hub',
        address: '1234 Champions Avenue, Downtown District',
        description: 'Premier fitness facility with state-of-the-art equipment, expert trainers, and comprehensive wellness programs. Perfect for serious athletes and fitness enthusiasts.',
        contactInfo: 'info@eliteperformancehub.com | (555) 100-2000',
        imageUrl: 'https://example.com/images/gyms/elite-performance-hub.jpg'
      },
      {
        name: 'Zen Wellness Sanctuary',
        address: '5678 Peaceful Lane, Wellness Quarter',
        description: 'Holistic wellness center combining yoga, meditation, pilates, and therapeutic services in a tranquil environment.',
        contactInfo: 'welcome@zenwellness.com | (555) 200-3000',
        imageUrl: 'https://example.com/images/gyms/zen-wellness-sanctuary.jpg'
      },
      {
        name: 'Urban Strength Factory',
        address: '9012 Power Street, Industrial Zone',
        description: 'Hardcore strength training facility with Olympic lifting platforms, powerlifting equipment, and expert coaching.',
        contactInfo: 'lift@urbanstrength.com | (555) 300-4000',
        imageUrl: 'https://example.com/images/gyms/urban-strength-factory.jpg'
      }
    ];

    const demoGyms = [];
    for (const gymData of demoGymsData) {
      const gym = await prisma.gym.create({
        data: {
          ...gymData,
          ownerId: demoOwner.id
        }
      });
      demoGyms.push(gym);
      console.log(`✅ Created gym: ${gym.name} for ${demoOwner.displayName}`);
    }

    // ================================================================
    // CREATE MEMBERSHIP PLANS FOR DEMO GYMS
    // ================================================================
    
    const membershipPlans = [];
    
    for (const gym of demoGyms) {
      const plansData = [
        {
          name: 'Basic Monthly',
          description: 'Access to gym facilities and basic equipment',
          durationDays: 30,
          price: 49.99,
          maxBookingsPerWeek: 3
        },
        {
          name: 'Premium Monthly',
          description: 'Full access including all classes and premium amenities',
          durationDays: 30,
          price: 89.99,
          maxBookingsPerWeek: null
        },
        {
          name: 'Annual Premium',
          description: 'Annual premium membership with best value and unlimited access',
          durationDays: 365,
          price: 899.99,
          maxBookingsPerWeek: null
        }
      ];
      
      for (const planData of plansData) {
        const plan = await prisma.membershipPlan.create({
          data: {
            gymId: gym.id,
            ...planData,
            isActive: true
          }
        });
        membershipPlans.push(plan);
        console.log(`✅ Created plan: ${plan.name} for ${gym.name}`);
      }
    }

    // ================================================================
    // CREATE GYM CLASSES FOR DEMO GYMS
    // ================================================================
    
    const gymClassesData = [
      // Elite Performance Hub classes
      {
        name: 'HIIT Intensity',
        description: 'High-intensity interval training for maximum results',
        duration: 45,
        difficulty: 'intermediate',
        maxCapacity: 20
      },
      {
        name: 'Strength Foundations',
        description: 'Learn proper strength training techniques',
        duration: 60,
        difficulty: 'beginner',
        maxCapacity: 15
      },
      {
        name: 'Elite Athlete Training',
        description: 'Advanced training for competitive athletes',
        duration: 75,
        difficulty: 'advanced',
        maxCapacity: 12
      },
      {
        name: 'Functional Fitness',
        description: 'Real-world movement patterns and exercises',
        duration: 50,
        difficulty: 'intermediate',
        maxCapacity: 18
      },
      
      // Zen Wellness Sanctuary classes
      {
        name: 'Morning Yoga Flow',
        description: 'Energizing yoga sequence to start your day',
        duration: 60,
        difficulty: 'beginner',
        maxCapacity: 25
      },
      {
        name: 'Meditation & Mindfulness',
        description: 'Guided meditation for mental clarity',
        duration: 30,
        difficulty: 'beginner',
        maxCapacity: 30
      },
      {
        name: 'Pilates Core',
        description: 'Core strengthening through Pilates methods',
        duration: 45,
        difficulty: 'intermediate',
        maxCapacity: 15
      },
      
      // Urban Strength Factory classes
      {
        name: 'Powerlifting Basics',
        description: 'Learn the big three: squat, bench, deadlift',
        duration: 75,
        difficulty: 'intermediate',
        maxCapacity: 10
      },
      {
        name: 'Olympic Lifting',
        description: 'Technical Olympic weightlifting training',
        duration: 90,
        difficulty: 'advanced',
        maxCapacity: 8
      }
    ];
    
    const gymClasses = [];
    let classIndex = 0;
    
    for (const gym of demoGyms) {
      const classesPerGym = gym.name === 'Elite Performance Hub' ? 4 : 
                           gym.name === 'Zen Wellness Sanctuary' ? 3 : 2;
      
      for (let i = 0; i < classesPerGym; i++) {
        const classData = gymClassesData[classIndex++];
        const gymClass = await prisma.gymClass.create({
          data: {
            gymId: gym.id,
            name: classData.name,
            description: classData.description,
            maxCapacity: classData.maxCapacity,
            durationMinutes: classData.duration,
            membersOnly: true,
            difficultyLevel: classData.difficulty,
            isActive: true,
            imageUrl: `https://example.com/images/classes/${classData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
          }
        });
        gymClasses.push(gymClass);
        console.log(`✅ Created class: ${gymClass.name} for ${gym.name}`);
      }
    }

    // ================================================================
    // CREATE CLASS SCHEDULES (RICH SCHEDULE DATA)
    // ================================================================
    
    const instructors = [
      'Sarah Thompson', 'Mike Rodriguez', 'Emma Wilson', 'Alex Chen', 
      'Jordan Parker', 'Maya Singh', 'Chris Johnson', 'Luna Martinez'
    ];
    
    const classSchedules = [];
    
    // Create schedules for next 14 days
    for (let day = 0; day < 14; day++) {
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + day);
      
      for (const gymClass of gymClasses) {
        // Different schedule patterns for different classes
        let shouldSchedule = false;
        
        if (gymClass.name.includes('Morning Yoga')) {
          shouldSchedule = day % 2 === 0; // Every other day
        } else if (gymClass.name.includes('HIIT') || gymClass.name.includes('Functional')) {
          shouldSchedule = [1, 3, 5].includes(day % 7); // Mon, Wed, Fri
        } else if (gymClass.name.includes('Strength') || gymClass.name.includes('Powerlifting')) {
          shouldSchedule = [2, 4, 6].includes(day % 7); // Tue, Thu, Sat
        } else {
          shouldSchedule = Math.random() < 0.4; // 40% chance for others
        }
        
        if (shouldSchedule) {
          // Different time slots based on class type
          let hour;
          if (gymClass.name.includes('Morning')) {
            hour = 7 + Math.floor(Math.random() * 2); // 7-8 AM
          } else if (gymClass.name.includes('Meditation')) {
            hour = 6 + Math.floor(Math.random() * 3); // 6-8 AM or evening
            if (Math.random() < 0.3) hour = 18 + Math.floor(Math.random() * 2); // 6-7 PM
          } else {
            hour = 9 + Math.floor(Math.random() * 11); // 9 AM - 7 PM
          }
          
          const startTime = new Date(scheduleDate);
          startTime.setHours(hour, Math.random() < 0.5 ? 0 : 30, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + gymClass.durationMinutes);
          
          const schedule = await prisma.classSchedule.create({
            data: {
              classId: gymClass.id,
              startTime: startTime,
              endTime: endTime,
              instructor: instructors[Math.floor(Math.random() * instructors.length)],
              currentBookings: 0,
              isCancelled: false
            }
          });
          
          classSchedules.push(schedule);
        }
      }
    }
    
    console.log(`✅ Created ${classSchedules.length} class schedules`);

    // ================================================================
    // CREATE SUPPORTING USERS FOR COMPETITIONS AND LEADERBOARDS
    // ================================================================
    
    const supportingUsersData = [
      { email: 'competitor1@gym.com', name: 'Riley Johnson', heightCm: 170, weightKg: 65 },
      { email: 'competitor2@gym.com', name: 'Sam Davis', heightCm: 178, weightKg: 82 },
      { email: 'competitor3@gym.com', name: 'Casey Wilson', heightCm: 165, weightKg: 58 },
      { email: 'competitor4@gym.com', name: 'Taylor Brown', heightCm: 182, weightKg: 88 },
      { email: 'competitor5@gym.com', name: 'Morgan Lee', heightCm: 168, weightKg: 70 },
      { email: 'competitor6@gym.com', name: 'Avery Martinez', heightCm: 175, weightKg: 75 },
      { email: 'competitor7@gym.com', name: 'Blake Thompson', heightCm: 172, weightKg: 68 },
      { email: 'competitor8@gym.com', name: 'Quinn Anderson', heightCm: 180, weightKg: 85 }
    ];
    
    const supportingUsers = [];
    
    for (const userData of supportingUsersData) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          passwordHash: await bcrypt.hash('password123', 10),
          displayName: userData.name,
          role: 'user',
          gender: 'Other',
          heightCm: userData.heightCm,
          weightKg: userData.weightKg,
          dateOfBirth: new Date('1990-01-01'),
          imageUrl: `https://example.com/images/users/${userData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        }
      });
      supportingUsers.push(user);
    }
    
    console.log(`✅ Created ${supportingUsers.length} supporting users for competitions`);

    // ================================================================
    // CREATE DEMO USER'S MEMBERSHIPS (ACTIVE IN ALL 3 DEMO GYMS)
    // ================================================================
    
    const demoUserMemberships = [];
    
    for (const gym of demoGyms) {
      const premiumPlan = membershipPlans.find(p => p.gymId === gym.id && p.name === 'Premium Monthly');
      
      const membership = await prisma.userMembership.create({
        data: {
          userId: demoUser.id,
          gymId: gym.id,
          planId: premiumPlan.id,
          startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Started 15 days ago
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Ends in 15 days
          status: 'active',
          autoRenew: true,
          bookingsUsedThisWeek: 2,
          lastBookingCountReset: new Date()
        }
      });
      
      demoUserMemberships.push(membership);
      
      // Create payment record
      await prisma.membershipPayment.create({
        data: {
          membershipId: membership.id,
          amount: premiumPlan.price,
          paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          paymentMethod: 'credit_card',
          transactionId: `TXN${Date.now()}${gym.id}`,
          status: 'completed'
        }
      });
      
      console.log(`✅ Created active membership for demo user at ${gym.name}`);
    }

    // ================================================================
    // CREATE MEMBERSHIPS FOR SUPPORTING USERS
    // ================================================================
    
    for (const user of supportingUsers) {
      // Each supporting user gets membership at 1-2 demo gyms
      const gymCount = 1 + Math.floor(Math.random() * 2);
      const selectedGyms = [];
      
      while (selectedGyms.length < gymCount) {
        const randomGym = demoGyms[Math.floor(Math.random() * demoGyms.length)];
        if (!selectedGyms.some(g => g.id === randomGym.id)) {
          selectedGyms.push(randomGym);
        }
      }
      
      for (const gym of selectedGyms) {
        const randomPlan = membershipPlans.filter(p => p.gymId === gym.id)[Math.floor(Math.random() * 3)];
        
        await prisma.userMembership.create({
          data: {
            userId: user.id,
            gymId: gym.id,
            planId: randomPlan.id,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'active',
            autoRenew: Math.random() < 0.7,
            bookingsUsedThisWeek: Math.floor(Math.random() * 3),
            lastBookingCountReset: new Date()
          }
        });
      }
    }

    // ================================================================
    // CREATE RICH WORKOUT HISTORY FOR DEMO USER (STATISTICS DATA)
    // ================================================================
    
    const allExercises = await prisma.exercise.findMany();
    
    // Create 25 actual workouts for demo user over the past 3 months
    for (let i = 0; i < 25; i++) {
      const workoutDate = new Date();
      workoutDate.setDate(workoutDate.getDate() - (i * 3 + Math.floor(Math.random() * 3))); // Every 3-6 days
      
      const workoutTitles = [
        'Morning Strength Session', 'Evening HIIT', 'Upper Body Focus', 
        'Leg Day Crusher', 'Full Body Burn', 'Cardio & Core',
        'Push Day', 'Pull Day', 'Power Session', 'Recovery Workout'
      ];
      
      // 3-5 exercises per workout
      const exerciseCount = 3 + Math.floor(Math.random() * 3);
      const selectedExercises = [];
      
      while (selectedExercises.length < exerciseCount) {
        const randomExercise = allExercises[Math.floor(Math.random() * allExercises.length)];
        if (!selectedExercises.some(e => e.id === randomExercise.id)) {
          selectedExercises.push(randomExercise);
        }
      }
      
      const actualWorkout = await prisma.actualWorkout.create({
        data: {
          userId: demoUser.id,
          title: workoutTitles[Math.floor(Math.random() * workoutTitles.length)],
          completedDate: workoutDate,
          completedTime: new Date(workoutDate.setHours(7 + Math.floor(Math.random() * 12), 0, 0, 0)),
          actualDuration: 35 + Math.floor(Math.random() * 50), // 35-85 minutes
          actualExercises: {
            create: selectedExercises.map(exercise => {
              // Progressive overload - more recent workouts have higher weights/reps
              const progressFactor = 1 + (25 - i) * 0.02; // Up to 50% improvement
              
              return {
                exerciseId: exercise.id,
                actualSets: exercise.category === 'cardio' ? null : 3 + Math.floor(Math.random() * 2),
                actualReps: exercise.category === 'cardio' ? null : 
                  Math.floor((8 + Math.floor(Math.random() * 7)) * progressFactor),
                actualWeight: exercise.category === 'strength' ? 
                  Math.floor((20 + Math.floor(Math.random() * 60)) * progressFactor) : null,
                actualDuration: exercise.category === 'cardio' || exercise.category === 'flexibility' ? 
                  5 + Math.floor(Math.random() * 20) : null,
                actualCalories: Math.floor((50 + Math.random() * 150) * progressFactor)
              };
            })
          }
        }
      });
      
      if (i % 5 === 0) {
        console.log(`✅ Created workout ${i + 1}/25 for demo user`);
      }
    }

    // ================================================================
    // CREATE PLANNED WORKOUTS FOR DEMO USER (FUTURE WORKOUTS)
    // ================================================================
    
    for (let i = 1; i <= 8; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i * 2); // Every other day
      
      const exerciseCount = 3 + Math.floor(Math.random() * 3);
      const selectedExercises = [];
      
      while (selectedExercises.length < exerciseCount) {
        const randomExercise = allExercises[Math.floor(Math.random() * allExercises.length)];
        if (!selectedExercises.some(e => e.id === randomExercise.id)) {
          selectedExercises.push(randomExercise);
        }
      }
      
      await prisma.plannedWorkout.create({
        data: {
          userId: demoUser.id,
          title: `Planned Session ${i}`,
          scheduledDate: futureDate,
          estimatedDuration: 45 + Math.floor(Math.random() * 30),
          plannedExercises: {
            create: selectedExercises.map(exercise => ({
              exerciseId: exercise.id,
              plannedSets: exercise.category === 'cardio' ? null : 3 + Math.floor(Math.random() * 2),
              plannedReps: exercise.category === 'cardio' ? null : 8 + Math.floor(Math.random() * 7),
              plannedWeight: exercise.category === 'strength' ? 25 + Math.floor(Math.random() * 75) : null,
              plannedDuration: exercise.category === 'cardio' || exercise.category === 'flexibility' ? 
                10 + Math.floor(Math.random() * 15) : null,
              plannedCalories: 60 + Math.floor(Math.random() * 140)
            }))
          }
        }
      });
    }
    
    console.log(`✅ Created 8 planned workouts for demo user`);

    // ================================================================
    // CREATE COMPREHENSIVE DIET DATA FOR DEMO USER
    // ================================================================
    
    const allFoodItems = await prisma.foodItem.findMany();
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // Create 21 days of diet data
    for (let day = 0; day < 21; day++) {
      const entryDate = new Date();
      entryDate.setDate(entryDate.getDate() - day);
      entryDate.setHours(0, 0, 0, 0);
      
      // Realistic meal pattern
      const meals = [
        { type: 'breakfast', foods: 2, baseCalories: 300 },
        { type: 'lunch', foods: 3, baseCalories: 450 },
        { type: 'dinner', foods: 3, baseCalories: 500 },
        { type: 'snack', foods: 1, baseCalories: 150 }
      ];
      
      // Skip snack 30% of the time
      if (Math.random() < 0.3) {
        meals.pop();
      }
      
      for (const meal of meals) {
        for (let f = 0; f < meal.foods; f++) {
          const randomFood = allFoodItems[Math.floor(Math.random() * allFoodItems.length)];
          const quantity = 0.5 + Math.round(Math.random() * 3) / 2; // 0.5 to 2.0
          const calories = parseFloat(randomFood.caloriesPerUnit) * quantity;
          
          await prisma.dietEntry.create({
            data: {
              userId: demoUser.id,
              foodId: randomFood.id,
              quantity: quantity,
              calories: calories,
              consumptionDate: new Date(entryDate),
              mealType: meal.type,
              notes: f === 0 && Math.random() < 0.4 ? 
                ['Pre-workout fuel', 'Post-workout recovery', 'Healthy choice', 'Delicious!'][Math.floor(Math.random() * 4)] : 
                null
            }
          });
        }
      }
      
      if (day % 7 === 0) {
        console.log(`✅ Created diet entries for ${Math.floor(day / 7) + 1} week(s)`);
      }
    }

    // ================================================================
    // CREATE COMPETITIONS WITH DEMO USER PARTICIPATION
    // ================================================================
    
    const competitionsData = [
      {
        name: "Elite Performance Challenge",
        description: "30-day comprehensive fitness challenge testing strength, endurance, and consistency",
        gymId: demoGyms[0].id, // Elite Performance Hub
        durationDays: 30,
        imageUrl: "https://example.com/images/competitions/elite-performance-challenge.jpg"
      },
      {
        name: "Mindful Movement Journey",
        description: "21-day wellness challenge focusing on yoga, meditation, and mindful movement",
        gymId: demoGyms[1].id, // Zen Wellness Sanctuary
        durationDays: 21,
        imageUrl: "https://example.com/images/competitions/mindful-movement-journey.jpg"
      },
      {
        name: "Iron Warrior Competition",
        description: "14-day intense strength building competition for serious lifters",
        gymId: demoGyms[2].id, // Urban Strength Factory
        durationDays: 14,
        imageUrl: "https://example.com/images/competitions/iron-warrior-competition.jpg"
      }
    ];
    
    const competitions = [];
    
    for (let i = 0; i < competitionsData.length; i++) {
      const compData = competitionsData[i];
      
      // Create different competition states
      const now = new Date();
      let startDate, endDate;
      
      if (i === 0) {
        // Active competition (started 10 days ago)
        startDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
        endDate = new Date(startDate.getTime() + compData.durationDays * 24 * 60 * 60 * 1000);
      } else if (i === 1) {
        // Recently completed competition
        endDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        startDate = new Date(endDate.getTime() - compData.durationDays * 24 * 60 * 60 * 1000);
      } else {
        // Upcoming competition
        startDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
        endDate = new Date(startDate.getTime() + compData.durationDays * 24 * 60 * 60 * 1000);
      }
      
      const competition = await prisma.competition.create({
        data: {
          gymId: compData.gymId,
          name: compData.name,
          description: compData.description,
          startDate: startDate,
          endDate: endDate,
          imageUrl: compData.imageUrl,
          maxParticipants: 50,
          isActive: true
        }
      });
      
      competitions.push(competition);
      console.log(`✅ Created competition: ${competition.name}`);
    }

    // ================================================================
    // CREATE COMPETITION TASKS
    // ================================================================
    
    const taskTemplates = [
      // Elite Performance Challenge tasks
      [
        { name: "Total Weight Lifted", description: "Accumulate total weight across all exercises", unit: "kg", target: 15000 },
        { name: "Workout Sessions", description: "Complete workout sessions", unit: "sessions", target: 20 },
        { name: "Calories Burned", description: "Burn calories through exercise", unit: "kcal", target: 12000 },
        { name: "HIIT Minutes", description: "Complete high-intensity interval training", unit: "min", target: 300 },
        { name: "Push-up Challenge", description: "Complete push-ups with proper form", unit: "reps", target: 1000 }
      ],
      // Mindful Movement Journey tasks
      [
        { name: "Yoga Sessions", description: "Complete yoga practice sessions", unit: "sessions", target: 15 },
        { name: "Meditation Minutes", description: "Practice mindfulness meditation", unit: "min", target: 420 },
        { name: "Flexibility Time", description: "Time spent on stretching and flexibility", unit: "min", target: 300 },
        { name: "Mindful Steps", description: "Take mindful walking steps", unit: "steps", target: 50000 }
      ],
      // Iron Warrior Competition tasks
      [
        { name: "Deadlift Volume", description: "Total weight deadlifted", unit: "kg", target: 5000 },
        { name: "Squat Challenge", description: "Total weight squatted", unit: "kg", target: 4500 },
        { name: "Bench Press Total", description: "Total weight bench pressed", unit: "kg", target: 3000 },
        { name: "Strength Sessions", description: "Complete strength training sessions", unit: "sessions", target: 10 }
      ]
    ];
    
    const allTasks = [];
    
    for (let i = 0; i < competitions.length; i++) {
      const competition = competitions[i];
      const tasks = taskTemplates[i];
      
      for (const taskData of tasks) {
        const task = await prisma.competitionTask.create({
          data: {
            competitionId: competition.id,
            name: taskData.name,
            description: taskData.description,
            targetValue: taskData.target,
            unit: taskData.unit,
            pointsValue: 100 + Math.floor(Math.random() * 100)
          }
        });
        allTasks.push(task);
      }
    }
    
    console.log(`✅ Created ${allTasks.length} competition tasks`);

    // ================================================================
    // CREATE COMPETITION PARTICIPANTS & PROGRESS
    // ================================================================
    
    const allCompetitionUsers = [demoUser, ...supportingUsers];
    
    for (const competition of competitions) {
      // Get users who have membership at this gym
      const gymMembers = await prisma.userMembership.findMany({
        where: { 
          gymId: competition.gymId,
          status: 'active'
        },
        include: { user: true }
      });
      
      const eligibleUsers = gymMembers.map(m => m.user);
      
      // Add demo user if not already included and has membership
      if (!eligibleUsers.some(u => u.id === demoUser.id)) {
        const demoUserMembership = demoUserMemberships.find(m => m.gymId === competition.gymId);
        if (demoUserMembership) {
          eligibleUsers.push(demoUser);
        }
      }
      
      // Add some supporting users to create a good leaderboard
      const additionalUsers = supportingUsers.filter(u => !eligibleUsers.some(eu => eu.id === u.id));
      eligibleUsers.push(...additionalUsers.slice(0, 6));
      
      const participants = [];
      
      for (const user of eligibleUsers.slice(0, 12)) { // Max 12 participants per competition
        const joinDate = new Date(competition.startDate);
        if (competition.startDate < new Date()) {
          // For active/completed competitions, join between start and now
          const joinRange = Math.min(new Date() - competition.startDate, 5 * 24 * 60 * 60 * 1000);
          joinDate.setTime(joinDate.getTime() + Math.random() * joinRange);
        }
        
        const participant = await prisma.competitionUser.create({
          data: {
            userId: user.id,
            competitionId: competition.id,
            joinDate: joinDate,
            totalPoints: 0,
            completionPct: 0,
            isActive: true
          }
        });
        
        participants.push(participant);
      }
      
      // Create progress for each participant
      const competitionTasks = allTasks.filter(t => t.competitionId === competition.id);
      
      for (const participant of participants) {
        for (const task of competitionTasks) {
          const now = new Date();
          const isCompetitionOver = now > competition.endDate;
          const isCompetitionActive = now >= competition.startDate && now <= competition.endDate;
          
          let progressPct;
          
          // Demo user gets good progress, others get varied progress
          if (participant.userId === demoUser.id) {
            if (isCompetitionOver) {
              progressPct = 0.8 + Math.random() * 0.2; // 80-100% completion
            } else if (isCompetitionActive) {
              const timePassed = (now - competition.startDate) / (competition.endDate - competition.startDate);
              progressPct = Math.min(1, timePassed * (0.8 + Math.random() * 0.4)); // Ahead of schedule
            } else {
              progressPct = 0;
            }
          } else {
            if (isCompetitionOver) {
              progressPct = Math.random() < 0.7 ? Math.random() : Math.random() * 0.3; // Varied completion
            } else if (isCompetitionActive) {
              const timePassed = (now - competition.startDate) / (competition.endDate - competition.startDate);
              progressPct = Math.min(1, timePassed * (0.3 + Math.random() * 0.8)); // Varied progress
            } else {
              progressPct = 0;
            }
          }
          
          const currentValue = Math.round(task.targetValue * progressPct * 100) / 100;
          const isCompleted = currentValue >= task.targetValue;
          
          let completionDate = null;
          if (isCompleted) {
            completionDate = new Date(participant.joinDate);
            const maxDate = new Date(Math.min(now, competition.endDate));
            const dateRange = maxDate - completionDate;
            if (dateRange > 0) {
              completionDate.setTime(completionDate.getTime() + Math.random() * dateRange);
            }
          }
          
          await prisma.competitionProgress.create({
            data: {
              participantId: participant.id,
              taskId: task.id,
              currentValue: currentValue,
              isCompleted: isCompleted,
              completionDate: completionDate,
              notes: isCompleted ? 'Target achieved!' : 
                     progressPct > 0.5 ? 'Making great progress!' : null
            }
          });
        }
        
        // Calculate and update participant totals
        const progressRecords = await prisma.competitionProgress.findMany({
          where: { participantId: participant.id },
          include: { task: true }
        });
        
        let totalPoints = 0;
        let completedTasks = 0;
        
        for (const progress of progressRecords) {
          if (progress.isCompleted) {
            totalPoints += progress.task.pointsValue;
            completedTasks++;
          } else {
            const progressPct = Number(progress.currentValue) / Number(progress.task.targetValue);
            if (progressPct > 0) {
              totalPoints += Math.floor(progress.task.pointsValue * progressPct);
            }
          }
        }
        
        const completionPct = progressRecords.length > 0 ? 
          (completedTasks / progressRecords.length) * 100 : 0;
        
        await prisma.competitionUser.update({
          where: { id: participant.id },
          data: {
            totalPoints: totalPoints,
            completionPct: completionPct
          }
        });
      }
      
      // Update rankings
      const rankedParticipants = await prisma.competitionUser.findMany({
        where: { 
          competitionId: competition.id,
          isActive: true
        },
        orderBy: [
          { completionPct: 'desc' },
          { totalPoints: 'desc' }
        ]
      });
      
      for (let i = 0; i < rankedParticipants.length; i++) {
        await prisma.competitionUser.update({
          where: { id: rankedParticipants[i].id },
          data: { rank: i + 1 }
        });
      }
      
      console.log(`✅ Created ${participants.length} participants for ${competition.name}`);
    }

    // ================================================================
    // CREATE USER BOOKINGS FOR DEMO USER
    // ================================================================
    
    // Get schedules for gyms where demo user has memberships
    const demoUserSchedules = classSchedules.filter(schedule => 
      gymClasses.some(gc => 
        gc.id === schedule.classId && 
        demoGyms.some(dg => dg.id === gc.gymId)
      )
    );
    
    // Create 8-12 bookings for demo user
    const bookingCount = 8 + Math.floor(Math.random() * 5);
    const selectedSchedules = [];
    
    while (selectedSchedules.length < bookingCount && selectedSchedules.length < demoUserSchedules.length) {
      const randomSchedule = demoUserSchedules[Math.floor(Math.random() * demoUserSchedules.length)];
      if (!selectedSchedules.some(s => s.id === randomSchedule.id)) {
        selectedSchedules.push(randomSchedule);
      }
    }
    
    for (const schedule of selectedSchedules) {
      const gymClass = gymClasses.find(gc => gc.id === schedule.classId);
      const membership = demoUserMemberships.find(m => m.gymId === gymClass.gymId);
      
      const now = new Date();
      let bookingStatus, attended;
      
      if (schedule.startTime > now) {
        bookingStatus = 'confirmed';
        attended = false;
      } else {
        if (Math.random() < 0.9) { // 90% attendance rate for demo user
          bookingStatus = 'attended';
          attended = true;
        } else {
          bookingStatus = 'missed';
          attended = false;
        }
      }
      
      const bookingTime = new Date(schedule.startTime);
      bookingTime.setDate(bookingTime.getDate() - Math.floor(Math.random() * 5)); // Booked 0-5 days in advance
      
      await prisma.userBooking.create({
        data: {
          userId: demoUser.id,
          membershipId: membership.id,
          scheduleId: schedule.id,
          bookingTime: bookingTime,
          bookingStatus: bookingStatus,
          attended: attended
        }
      });
      
      // Update schedule booking count
      if (bookingStatus === 'confirmed' || bookingStatus === 'attended') {
        await prisma.classSchedule.update({
          where: { id: schedule.id },
          data: { currentBookings: { increment: 1 } }
        });
      }
    }
    
    console.log(`✅ Created ${selectedSchedules.length} bookings for demo user`);

    // ================================================================
    // CREATE AI INTERACTIONS FOR DEMO USER
    // ================================================================
    
    const aiInteractions = [
      {
        prompt: "What's the best way to improve my deadlift form?",
        response: "To improve your deadlift form, focus on these key points: Keep your back straight and chest up, grip the bar with hands shoulder-width apart, drive through your heels, and keep the bar close to your body throughout the movement. Start with lighter weights to perfect your technique before increasing the load.",
        type: "WORKOUT_PLAN"
      },
      {
        prompt: "How much protein should I eat daily for muscle building?",
        response: "For muscle building, aim for 1.6-2.2 grams of protein per kilogram of body weight daily. Based on your weight of 72kg, that's approximately 115-158 grams of protein per day. Distribute this across 3-4 meals for optimal muscle protein synthesis.",
        type: "DIET_ADVICE"
      },
      {
        prompt: "Can you create a 4-day workout split for me?",
        response: "Here's a 4-day workout split: Day 1: Upper Body Push (chest, shoulders, triceps), Day 2: Lower Body (quads, glutes, calves), Day 3: Upper Body Pull (back, biceps), Day 4: Lower Body (hamstrings, glutes, calves). Include 1-2 rest days between sessions for recovery.",
        type: "WORKOUT_PLAN"
      },
      {
        prompt: "What are good post-workout meals?",
        response: "Excellent post-workout meals include: Grilled chicken with quinoa and vegetables, Greek yogurt with berries and granola, or a protein smoothie with banana and oats. Aim to eat within 2 hours post-workout, combining protein (20-30g) with carbs for optimal recovery.",
        type: "DIET_ADVICE"
      },
      {
        prompt: "How do I stay motivated to exercise regularly?",
        response: "To stay motivated: Set specific, achievable goals; track your progress; find activities you enjoy; workout with friends or join classes; reward yourself for milestones; and remember that consistency matters more than perfection. Start small and build habits gradually.",
        type: "GENERAL_QA"
      }
    ];
    
    for (let i = 0; i < aiInteractions.length; i++) {
      const interaction = aiInteractions[i];
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - (i * 5 + Math.floor(Math.random() * 3))); // Spread over time
      
      await prisma.aiInteraction.create({
        data: {
          userId: demoUser.id,
          prompt: interaction.prompt,
          response: interaction.response,
          interactionType: interaction.type,
          createdAt: pastDate
        }
      });
    }
    
    console.log(`✅ Created ${aiInteractions.length} AI interactions for demo user`);

    // ================================================================
    // SUMMARY AND CREDENTIALS
    // ================================================================
    
    console.log('\n🎉 PRESENTATION DATA SEEDING COMPLETED! 🎉');
    console.log('================================================');
    console.log('📋 DEMO CREDENTIALS FOR PRESENTATION:');
    console.log('================================================');
    console.log('');
    console.log('👤 DEMO USER (for user features presentation):');
    console.log(`   📧 Email: ${demoUser.email}`);
    console.log(`   🔑 Password: demo123`);
    console.log(`   👤 Name: ${demoUser.displayName}`);
    console.log('');
    console.log('🏋️ DEMO GYM OWNER (for gym owner features presentation):');
    console.log(`   📧 Email: ${demoOwner.email}`);
    console.log(`   🔑 Password: demo123`);
    console.log(`   👤 Name: ${demoOwner.displayName}`);
    console.log('');
    console.log('🏢 DEMO OWNER\'S GYMS:');
    demoGyms.forEach((gym, index) => {
      console.log(`   ${index + 1}. ${gym.name}`);
    });
    console.log('');
    console.log('📊 DATA SUMMARY FOR DEMO USER:');
    console.log('   ✅ 3 Active gym memberships');
    console.log('   ✅ 25 Completed workouts (3 months history)');
    console.log('   ✅ 8 Planned future workouts');
    console.log('   ✅ 21 days of diet tracking data');
    console.log('   ✅ Active participation in 3 competitions');
    console.log('   ✅ Multiple class bookings');
    console.log('   ✅ 5 AI interaction conversations');
    console.log('   ✅ Rich statistics data for dashboard');
    console.log('');
    console.log('📊 DATA SUMMARY FOR DEMO GYM OWNER:');
    console.log('   ✅ 3 Owned gyms with different specialties');
    console.log('   ✅ 9 Membership plans across gyms');
    console.log('   ✅ 9 Different gym classes');
    console.log('   ✅ Rich class schedules for 2 weeks');
    console.log('   ✅ 3 Active competitions with participants');
    console.log('   ✅ Multiple user memberships and bookings');
    console.log('   ✅ Revenue and booking data');
    console.log('================================================');
    console.log('🚀 Ready for beautiful frontend presentation!');
    console.log('💡 All features have realistic, interconnected data');

  } catch (error) {
    console.error('❌ Error during presentation seeding:', error);
    throw error;
  }
}

presentationSeed()
  .catch(e => {
    console.error('❌ Critical error in presentation seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('📦 Database connection closed.');
  });