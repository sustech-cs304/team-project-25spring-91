// additional-seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function additionalSeed() {
  console.log('Starting Additional Data Seeding...');
  console.log('This will add new data while preserving existing data.');

  try {
    // ================================================================
    // CREATE ADDITIONAL USERS (ADMINS, GYM OWNERS, REGULAR USERS)
    // ================================================================
    
    console.log('Creating additional users...');
    
    const newUsersData = [
      // Additional Admins
      {
        email: 'admin2@example.com',
        password: 'password123',
        displayName: 'Sarah Admin',
        role: 'admin',
        gender: 'Female',
        heightCm: 168,
        weightKg: 62,
        dateOfBirth: '1985-03-15'
      },
      {
        email: 'admin3@example.com',
        password: 'password123',
        displayName: 'Michael Admin',
        role: 'admin',
        gender: 'Male',
        heightCm: 182,
        weightKg: 88,
        dateOfBirth: '1982-07-22'
      },
      
      // Additional Gym Owners
      {
        email: 'gymowner2@example.com',
        password: 'password123',
        displayName: 'David Fitness',
        role: 'gym_owner',
        gender: 'Male',
        heightCm: 178,
        weightKg: 82,
        dateOfBirth: '1980-11-30'
      },
      {
        email: 'gymowner3@example.com',
        password: 'password123',
        displayName: 'Lisa Strong',
        role: 'gym_owner',
        gender: 'Female',
        heightCm: 165,
        weightKg: 58,
        dateOfBirth: '1987-05-18'
      },
      {
        email: 'gymowner4@example.com',
        password: 'password123',
        displayName: 'Roberto Muscle',
        role: 'gym_owner',
        gender: 'Male',
        heightCm: 185,
        weightKg: 95,
        dateOfBirth: '1979-09-12'
      },
      {
        email: 'gymowner5@example.com',
        password: 'password123',
        displayName: 'Amanda Wellness',
        role: 'gym_owner',
        gender: 'Female',
        heightCm: 172,
        weightKg: 65,
        dateOfBirth: '1984-12-08'
      },
      
      // Additional Regular Users
      {
        email: 'user6@example.com',
        password: 'password123',
        displayName: 'Tom Wilson',
        role: 'user',
        gender: 'Male',
        heightCm: 175,
        weightKg: 78,
        dateOfBirth: '1995-01-20'
      },
      {
        email: 'user7@example.com',
        password: 'password123',
        displayName: 'Emily Chen',
        role: 'user',
        gender: 'Female',
        heightCm: 160,
        weightKg: 55,
        dateOfBirth: '1992-06-14'
      },
      {
        email: 'user8@example.com',
        password: 'password123',
        displayName: 'James Brown',
        role: 'user',
        gender: 'Male',
        heightCm: 183,
        weightKg: 85,
        dateOfBirth: '1988-04-10'
      },
      {
        email: 'user9@example.com',
        password: 'password123',
        displayName: 'Sophie Miller',
        role: 'user',
        gender: 'Female',
        heightCm: 167,
        weightKg: 60,
        dateOfBirth: '1996-08-25'
      },
      {
        email: 'user10@example.com',
        password: 'password123',
        displayName: 'Alex Johnson',
        role: 'user',
        gender: 'Other',
        heightCm: 170,
        weightKg: 68,
        dateOfBirth: '1993-11-03'
      },
      {
        email: 'user11@example.com',
        password: 'password123',
        displayName: 'Rachel Green',
        role: 'user',
        gender: 'Female',
        heightCm: 163,
        weightKg: 57,
        dateOfBirth: '1991-02-17'
      },
      {
        email: 'user12@example.com',
        password: 'password123',
        displayName: 'Kevin Martinez',
        role: 'user',
        gender: 'Male',
        heightCm: 180,
        weightKg: 90,
        dateOfBirth: '1989-07-09'
      },
      {
        email: 'user13@example.com',
        password: 'password123',
        displayName: 'Luna Park',
        role: 'user',
        gender: 'Female',
        heightCm: 158,
        weightKg: 52,
        dateOfBirth: '1997-12-12'
      },
      {
        email: 'user14@example.com',
        password: 'password123',
        displayName: 'Chris Anderson',
        role: 'user',
        gender: 'Male',
        heightCm: 177,
        weightKg: 73,
        dateOfBirth: '1994-03-28'
      },
      {
        email: 'user15@example.com',
        password: 'password123',
        displayName: 'Maya Patel',
        role: 'user',
        gender: 'Female',
        heightCm: 161,
        weightKg: 54,
        dateOfBirth: '1990-10-05'
      }
    ];
    
    const newUsers = [];
    
    for (const userData of newUsersData) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          passwordHash: hashedPassword,
          displayName: userData.displayName,
          role: userData.role,
          gender: userData.gender,
          heightCm: userData.heightCm,
          weightKg: userData.weightKg,
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
          imageUrl: `https://example.com/images/users/${userData.role}-${userData.email.split('@')[0]}.jpg`
        }
      });
      
      newUsers.push(user);
      console.log(`Created user: ${user.email} (${user.role})`);
    }
    
    // ================================================================
    // CREATE ADDITIONAL GYMS
    // ================================================================
    
    console.log('Creating additional gyms...');
    
    const gymOwners = newUsers.filter(u => u.role === 'gym_owner');
    const allGymOwners = await prisma.user.findMany({
      where: { role: 'gym_owner' }
    });
    
    const newGymsData = [
      {
        name: 'Elite Performance Center',
        address: '2020 Athletic Way, Sports District',
        description: 'High-performance training facility for serious athletes with Olympic-grade equipment.',
        contactInfo: 'info@eliteperformance.com | (555) 123-4567',
        imageUrl: 'https://example.com/images/gyms/elite-performance.jpg'
      },
      {
        name: 'Mindful Movement Studio',
        address: '1515 Zen Avenue, Peaceful Quarter',
        description: 'Holistic wellness center combining yoga, meditation, pilates, and mindfulness practices.',
        contactInfo: 'hello@mindfulmovement.com | (555) 234-5678',
        imageUrl: 'https://example.com/images/gyms/mindful-movement.jpg'
      },
      {
        name: 'Strength & Steel Gym',
        address: '3030 Iron Street, Industrial Zone',
        description: 'Traditional powerlifting and bodybuilding gym with heavy-duty equipment and expert coaching.',
        contactInfo: 'lift@strengthsteel.com | (555) 345-6789',
        imageUrl: 'https://example.com/images/gyms/strength-steel.jpg'
      },
      {
        name: 'Aqua Fitness Paradise',
        address: '4040 Pool Drive, Riverside',
        description: 'Complete aquatic fitness center with pools, water aerobics, and swimming programs.',
        contactInfo: 'splash@aquafitness.com | (555) 456-7890',
        imageUrl: 'https://example.com/images/gyms/aqua-fitness.jpg'
      },
      {
        name: 'Urban Calisthenics Park',
        address: '5050 Bodyweight Boulevard, City Center',
        description: 'Outdoor and indoor calisthenics training with bodyweight movement specialists.',
        contactInfo: 'move@urbancalisthenics.com | (555) 567-8901',
        imageUrl: 'https://example.com/images/gyms/urban-calisthenics.jpg'
      },
      {
        name: 'Hybrid Training Complex',
        address: '6060 Fusion Road, Tech District',
        description: 'Modern facility combining traditional strength training with functional movement and technology.',
        contactInfo: 'train@hybridcomplex.com | (555) 678-9012',
        imageUrl: 'https://example.com/images/gyms/hybrid-training.jpg'
      },
      {
        name: 'Women\'s Wellness Hub',
        address: '7070 Empowerment Street, Community Center',
        description: 'Women-focused fitness and wellness center with specialized programs and supportive environment.',
        contactInfo: 'empower@womenswellness.com | (555) 789-0123',
        imageUrl: 'https://example.com/images/gyms/womens-wellness.jpg'
      },
      {
        name: 'Recovery & Regeneration Center',
        address: '8080 Healing Lane, Wellness District',
        description: 'Specialized facility focusing on recovery, rehabilitation, and injury prevention.',
        contactInfo: 'recover@recoveryrgc.com | (555) 890-1234',
        imageUrl: 'https://example.com/images/gyms/recovery-center.jpg'
      }
    ];
    
    const newGyms = [];
    
    for (let i = 0; i < newGymsData.length; i++) {
      const gymData = newGymsData[i];
      const owner = allGymOwners[i % allGymOwners.length]; // Distribute gyms among owners
      
      const gym = await prisma.gym.create({
        data: {
          ...gymData,
          ownerId: owner.id
        }
      });
      
      newGyms.push(gym);
      console.log(`Created gym: ${gym.name} (Owner: ${owner.displayName})`);
    }
    
    // ================================================================
    // CREATE MEMBERSHIP PLANS FOR NEW GYMS
    // ================================================================
    
    console.log('Creating membership plans for new gyms...');
    
    const planTemplates = [
      {
        name: 'Basic Monthly',
        description: 'Basic access to gym facilities and equipment',
        durationDays: 30,
        basePrice: 35,
        maxBookingsPerWeek: 3
      },
      {
        name: 'Premium Monthly',
        description: 'Full access including all classes and premium amenities',
        durationDays: 30,
        basePrice: 65,
        maxBookingsPerWeek: null
      },
      {
        name: 'Annual Basic',
        description: 'Annual basic plan with significant savings',
        durationDays: 365,
        basePrice: 350,
        maxBookingsPerWeek: 3
      },
      {
        name: 'Annual Premium',
        description: 'Annual premium plan with unlimited access',
        durationDays: 365,
        basePrice: 650,
        maxBookingsPerWeek: null
      },
      {
        name: 'Student Monthly',
        description: 'Discounted plan for students with valid ID',
        durationDays: 30,
        basePrice: 25,
        maxBookingsPerWeek: 2
      }
    ];
    
    const membershipPlans = [];
    
    for (const gym of newGyms) {
      // Each gym gets 3-4 plans
      const plansToCreate = planTemplates.slice(0, 3 + Math.floor(Math.random() * 2));
      
      for (const template of plansToCreate) {
        const plan = await prisma.membershipPlan.create({
          data: {
            gymId: gym.id,
            name: template.name,
            description: template.description,
            durationDays: template.durationDays,
            price: template.basePrice + Math.floor(Math.random() * 20) - 10, // ±10 variation
            maxBookingsPerWeek: template.maxBookingsPerWeek,
            isActive: true
          }
        });
        
        membershipPlans.push(plan);
        console.log(`Created plan: ${plan.name} for ${gym.name}`);
      }
    }
    
    // ================================================================
    // CREATE GYM CLASSES FOR NEW GYMS
    // ================================================================
    
    console.log('Creating gym classes for new gyms...');
    
    const classTemplates = [
      { name: 'HIIT Blast', description: 'High-intensity interval training for maximum calorie burn', duration: 45, difficulty: 'intermediate' },
      { name: 'Strength Foundations', description: 'Learn proper form for basic strength exercises', duration: 60, difficulty: 'beginner' },
      { name: 'Advanced Powerlifting', description: 'Technical powerlifting training for experienced lifters', duration: 75, difficulty: 'advanced' },
      { name: 'Yoga Flow', description: 'Dynamic yoga sequences to improve flexibility and strength', duration: 60, difficulty: 'beginner' },
      { name: 'Spin & Burn', description: 'High-energy indoor cycling workout', duration: 45, difficulty: 'intermediate' },
      { name: 'Functional Movement', description: 'Improve everyday movement patterns and mobility', duration: 50, difficulty: 'intermediate' },
      { name: 'Bootcamp Challenge', description: 'Military-style fitness training for all levels', duration: 55, difficulty: 'intermediate' },
      { name: 'Meditation & Mindfulness', description: 'Guided meditation for mental wellness', duration: 30, difficulty: 'beginner' },
      { name: 'Aqua Aerobics', description: 'Low-impact water-based exercise program', duration: 45, difficulty: 'beginner' },
      { name: 'Calisthenics Mastery', description: 'Advanced bodyweight movement training', duration: 60, difficulty: 'advanced' }
    ];
    
    const gymClasses = [];
    
    for (const gym of newGyms) {
      // Each gym gets 4-6 classes
      const classCount = 4 + Math.floor(Math.random() * 3);
      const selectedClasses = [];
      
      while (selectedClasses.length < classCount) {
        const randomClass = classTemplates[Math.floor(Math.random() * classTemplates.length)];
        if (!selectedClasses.some(c => c.name === randomClass.name)) {
          selectedClasses.push(randomClass);
        }
      }
      
      for (const classTemplate of selectedClasses) {
        const gymClass = await prisma.gymClass.create({
          data: {
            gymId: gym.id,
            name: classTemplate.name,
            description: classTemplate.description,
            maxCapacity: 15 + Math.floor(Math.random() * 20), // 15-35 capacity
            durationMinutes: classTemplate.duration,
            membersOnly: Math.random() < 0.8, // 80% members only
            difficultyLevel: classTemplate.difficulty,
            isActive: true,
            imageUrl: `https://example.com/images/classes/${classTemplate.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
          }
        });
        
        gymClasses.push(gymClass);
        console.log(`Created class: ${gymClass.name} for ${gym.name}`);
      }
    }
    
    // ================================================================
    // CREATE CLASS SCHEDULES
    // ================================================================
    
    console.log('Creating class schedules...');
    
    const instructors = [
      'Alex Thompson', 'Jordan Lee', 'Sam Rivera', 'Casey Morgan', 'Taylor Swift',
      'Blake Anderson', 'Quinn Davis', 'Avery Johnson', 'Riley Chen', 'Dakota Smith'
    ];
    
    const classSchedules = [];
    
    // Create schedules for next 21 days
    for (let day = 0; day < 21; day++) {
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + day);
      
      for (const gymClass of gymClasses) {
        // 40% chance to schedule each class on any given day
        if (Math.random() < 0.4) {
          // Random time between 6 AM and 8 PM
          const hour = 6 + Math.floor(Math.random() * 15);
          const minute = Math.random() < 0.5 ? 0 : 30;
          
          const startTime = new Date(scheduleDate);
          startTime.setHours(hour, minute, 0, 0);
          
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
    
    console.log(`Created ${classSchedules.length} class schedules`);
    
    // ================================================================
    // CREATE USER MEMBERSHIPS
    // ================================================================
    
    console.log('Creating user memberships...');
    
    const regularUsers = newUsers.filter(u => u.role === 'user');
    const allUsers = await prisma.user.findMany({ where: { role: 'user' } });
    const allGyms = await prisma.gym.findMany({ include: { membershipPlans: true } });
    
    const userMemberships = [];
    
    for (const user of allUsers) {
      // Each user gets 1-3 memberships
      const membershipCount = 1 + Math.floor(Math.random() * 3);
      const selectedGyms = [];
      
      while (selectedGyms.length < membershipCount && selectedGyms.length < allGyms.length) {
        const randomGym = allGyms[Math.floor(Math.random() * allGyms.length)];
        if (!selectedGyms.some(g => g.id === randomGym.id)) {
          selectedGyms.push(randomGym);
        }
      }
      
      for (const gym of selectedGyms) {
        if (gym.membershipPlans.length === 0) continue;
        
        const plan = gym.membershipPlans[Math.floor(Math.random() * gym.membershipPlans.length)];
        
        // Determine membership status and dates
        const statusRand = Math.random();
        let status, startDate, endDate;
        
        if (statusRand < 0.7) { // 70% active
          status = 'active';
          startDate = new Date();
          startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60)); // Started 0-60 days ago
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + plan.durationDays);
        } else if (statusRand < 0.9) { // 20% expired
          status = 'expired';
          endDate = new Date();
          endDate.setDate(endDate.getDate() - Math.floor(Math.random() * 30)); // Ended 0-30 days ago
          startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - plan.durationDays);
        } else { // 10% cancelled
          status = 'cancelled';
          startDate = new Date();
          startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 90));
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + Math.floor(plan.durationDays * 0.6)); // Cancelled partway through
        }
        
        const membership = await prisma.userMembership.create({
          data: {
            userId: user.id,
            gymId: gym.id,
            planId: plan.id,
            startDate: startDate,
            endDate: endDate,
            status: status,
            autoRenew: status === 'active' && Math.random() < 0.6,
            bookingsUsedThisWeek: status === 'active' ? Math.floor(Math.random() * 3) : 0,
            lastBookingCountReset: new Date()
          }
        });
        
        userMemberships.push(membership);
        
        // Create payment record
        await prisma.membershipPayment.create({
          data: {
            membershipId: membership.id,
            amount: plan.price,
            paymentDate: startDate,
            paymentMethod: ['credit_card', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 3)],
            transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
            status: 'completed'
          }
        });
      }
    }
    
    console.log(`Created ${userMemberships.length} user memberships`);
    
    // ================================================================
    // CREATE USER BOOKINGS
    // ================================================================
    
    console.log('Creating user bookings...');
    
    const activeMemberships = userMemberships.filter(m => m.status === 'active');
    const bookings = [];
    
    for (const membership of activeMemberships) {
      // Find schedules for this gym
      const gymSchedules = classSchedules.filter(s => {
        return gymClasses.some(c => c.id === s.classId && c.gymId === membership.gymId);
      });
      
      if (gymSchedules.length === 0) continue;
      
      // Create 2-5 bookings per active membership
      const bookingCount = 2 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i < bookingCount; i++) {
        const schedule = gymSchedules[Math.floor(Math.random() * gymSchedules.length)];
        const now = new Date();
        
        let bookingStatus, attended;
        if (schedule.startTime > now) {
          bookingStatus = Math.random() < 0.9 ? 'confirmed' : 'cancelled';
          attended = false;
        } else {
          if (Math.random() < 0.8) {
            bookingStatus = 'attended';
            attended = true;
          } else {
            bookingStatus = 'missed';
            attended = false;
          }
        }
        
        const bookingTime = new Date(schedule.startTime);
        bookingTime.setDate(bookingTime.getDate() - Math.floor(Math.random() * 7));
        
        try {
          const booking = await prisma.userBooking.create({
            data: {
              userId: membership.userId,
              membershipId: membership.id,
              scheduleId: schedule.id,
              bookingTime: bookingTime,
              bookingStatus: bookingStatus,
              cancellationReason: bookingStatus === 'cancelled' ? 
                ['Schedule conflict', 'Feeling unwell', 'Work emergency'][Math.floor(Math.random() * 3)] : null,
              attended: attended
            }
          });
          
          bookings.push(booking);
          
          // Update schedule booking count
          if (bookingStatus === 'confirmed' || bookingStatus === 'attended') {
            await prisma.classSchedule.update({
              where: { id: schedule.id },
              data: { currentBookings: { increment: 1 } }
            });
          }
        } catch (error) {
          // Skip duplicate bookings
        }
      }
    }
    
    console.log(`Created ${bookings.length} user bookings`);
    
    // ================================================================
    // CREATE ADDITIONAL EXERCISES
    // ================================================================
    
    console.log('Creating additional exercises...');
    
    const newExercisesData = [
      { name: 'Barbell Row', category: 'strength', description: 'Back strengthening exercise using barbell' },
      { name: 'Overhead Press', category: 'strength', description: 'Shoulder and core strengthening exercise' },
      { name: 'Hip Thrust', category: 'strength', description: 'Glute strengthening exercise' },
      { name: 'Bulgarian Split Squat', category: 'strength', description: 'Single-leg strength exercise' },
      { name: 'Farmers Walk', category: 'strength', description: 'Full body strength and endurance exercise' },
      { name: 'Battle Ropes', category: 'cardio', description: 'High-intensity cardio and strength training' },
      { name: 'Box Jumps', category: 'cardio', description: 'Explosive leg power and cardio exercise' },
      { name: 'Rowing Machine', category: 'cardio', description: 'Full body cardiovascular exercise' },
      { name: 'Elliptical', category: 'cardio', description: 'Low-impact cardiovascular exercise' },
      { name: 'Stair Climber', category: 'cardio', description: 'Lower body focused cardio exercise' },
      { name: 'Pigeon Pose', category: 'flexibility', description: 'Hip opening yoga pose' },
      { name: 'Cat-Cow Stretch', category: 'flexibility', description: 'Spinal mobility exercise' },
      { name: 'Shoulder Rolls', category: 'flexibility', description: 'Shoulder mobility exercise' },
      { name: 'Hip Circles', category: 'flexibility', description: 'Hip mobility exercise' },
      { name: 'Single Leg Stand', category: 'balance', description: 'Basic balance exercise' },
      { name: 'Bosu Ball Squats', category: 'balance', description: 'Balance and strength exercise' },
      { name: 'Medicine Ball Slams', category: 'strength', description: 'Full body power exercise' },
      { name: 'Kettlebell Swings', category: 'strength', description: 'Hip hinge movement with kettlebell' },
      { name: 'Turkish Get-Up', category: 'strength', description: 'Complex full body movement' },
      { name: 'Burpees', category: 'cardio', description: 'Full body high-intensity exercise' }
    ];
    
    const newExercises = [];
    
    for (const exerciseData of newExercisesData) {
      const exercise = await prisma.exercise.upsert({
        where: { name: exerciseData.name },
        update: {},
        create: {
          ...exerciseData,
          imageUrl: `https://example.com/images/exercises/${exerciseData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        }
      });
      
      newExercises.push(exercise);
      console.log(`Created exercise: ${exercise.name}`);
    }
    
    // ================================================================
    // CREATE PLANNED WORKOUTS FOR NEW USERS
    // ================================================================
    
    console.log('Creating planned workouts for users...');
    
    const allExercises = await prisma.exercise.findMany();
    
    for (const user of regularUsers) {
      // Create 3-5 planned workouts per user
      const workoutCount = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < workoutCount; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i * 2 + Math.floor(Math.random() * 5));
        
        const workoutNames = [
          'Upper Body Power', 'Lower Body Strength', 'Full Body HIIT', 
          'Cardio Blast', 'Core Focus', 'Flexibility Flow', 
          'Push Day', 'Pull Day', 'Leg Day', 'Recovery Session'
        ];
        
        // Select 3-5 exercises for this workout
        const exerciseCount = 3 + Math.floor(Math.random() * 3);
        const selectedExercises = [];
        
        while (selectedExercises.length < exerciseCount) {
          const randomExercise = allExercises[Math.floor(Math.random() * allExercises.length)];
          if (!selectedExercises.some(e => e.id === randomExercise.id)) {
            selectedExercises.push(randomExercise);
          }
        }
        
        const plannedWorkout = await prisma.plannedWorkout.create({
          data: {
            userId: user.id,
            title: workoutNames[Math.floor(Math.random() * workoutNames.length)],
            scheduledDate: futureDate,
            estimatedDuration: 30 + Math.floor(Math.random() * 60), // 30-90 minutes
            plannedExercises: {
              create: selectedExercises.map(exercise => ({
                exerciseId: exercise.id,
                plannedSets: exercise.category === 'cardio' ? null : 3 + Math.floor(Math.random() * 2),
                plannedReps: exercise.category === 'cardio' ? null : 8 + Math.floor(Math.random() * 7),
                plannedWeight: exercise.category === 'strength' ? 20 + Math.floor(Math.random() * 80) : null,
                plannedDuration: exercise.category === 'cardio' || exercise.category === 'flexibility' ? 
                  5 + Math.floor(Math.random() * 20) : null,
                plannedCalories: 50 + Math.floor(Math.random() * 150)
              }))
            }
          }
        });
        
        console.log(`Created planned workout: ${plannedWorkout.title} for ${user.displayName}`);
      }
    }
    
    // ================================================================
    // CREATE ACTUAL WORKOUTS FOR NEW USERS
    // ================================================================
    
    console.log('Creating actual workouts for users...');
    
    for (const user of regularUsers) {
      // Create 5-10 completed workouts per user
      const workoutCount = 5 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < workoutCount; i++) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - (i * 2 + Math.floor(Math.random() * 5)));
        
        const workoutNames = [
          'Morning Session', 'Evening Workout', 'Quick HIIT', 
          'Strength Training', 'Cardio Session', 'Full Body Burn'
        ];
        
        // Select 3-4 exercises for this workout
        const exerciseCount = 3 + Math.floor(Math.random() * 2);
        const selectedExercises = [];
        
        while (selectedExercises.length < exerciseCount) {
          const randomExercise = allExercises[Math.floor(Math.random() * allExercises.length)];
          if (!selectedExercises.some(e => e.id === randomExercise.id)) {
            selectedExercises.push(randomExercise);
          }
        }
        
        const actualWorkout = await prisma.actualWorkout.create({
          data: {
            userId: user.id,
            title: workoutNames[Math.floor(Math.random() * workoutNames.length)],
            completedDate: pastDate,
            completedTime: new Date(pastDate.setHours(6 + Math.floor(Math.random() * 16), 0, 0, 0)),
            actualDuration: 25 + Math.floor(Math.random() * 70), // 25-95 minutes
            actualExercises: {
              create: selectedExercises.map(exercise => ({
                exerciseId: exercise.id,
                actualSets: exercise.category === 'cardio' ? null : 3 + Math.floor(Math.random() * 2),
                actualReps: exercise.category === 'cardio' ? null : 8 + Math.floor(Math.random() * 7),
                actualWeight: exercise.category === 'strength' ? 15 + Math.floor(Math.random() * 85) : null,
                actualDuration: exercise.category === 'cardio' || exercise.category === 'flexibility' ? 
                  5 + Math.floor(Math.random() * 25) : null,
                actualCalories: 40 + Math.floor(Math.random() * 160)
              }))
            }
          }
        });
        
        console.log(`Created actual workout: ${actualWorkout.title} for ${user.displayName}`);
      }
    }
    
    // ================================================================
    // CREATE ADDITIONAL FOOD ITEMS
    // ================================================================
    
    console.log('Creating additional food items...');
    
    const additionalFoodItems = [
      { name: 'Quinoa Salad', description: 'Mixed quinoa with vegetables', caloriesPerUnit: 220, servingUnit: 'cup' },
      { name: 'Protein Bar', description: 'High-protein energy bar', caloriesPerUnit: 190, servingUnit: 'bar' },
      { name: 'Green Smoothie', description: 'Spinach, banana, and protein powder smoothie', caloriesPerUnit: 180, servingUnit: 'smoothie' },
      { name: 'Grilled Steak', description: 'Lean beef steak, grilled', caloriesPerUnit: 250, servingUnit: '100g' },
      { name: 'Chia Pudding', description: 'Chia seeds with almond milk', caloriesPerUnit: 150, servingUnit: 'cup' },
      { name: 'Lentil Soup', description: 'Homemade lentil and vegetable soup', caloriesPerUnit: 160, servingUnit: 'cup' },
      { name: 'Trail Mix', description: 'Nuts, seeds, and dried fruit mix', caloriesPerUnit: 130, servingUnit: '30g' },
      { name: 'Veggie Burger', description: 'Plant-based burger patty', caloriesPerUnit: 170, servingUnit: 'patty' },
      { name: 'Greek Salad', description: 'Traditional Greek salad with feta', caloriesPerUnit: 190, servingUnit: 'bowl' },
      { name: 'Energy Balls', description: 'Oat and nut energy balls', caloriesPerUnit: 80, servingUnit: 'ball' }
    ];
    
    const newFoodItems = [];
    
    for (const foodData of additionalFoodItems) {
      const foodItem = await prisma.foodItem.upsert({
        where: { name: foodData.name },
        update: {},
        create: {
          ...foodData,
          imageUrl: `https://example.com/images/food/${foodData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        }
      });
      
      newFoodItems.push(foodItem);
      console.log(`Created food item: ${foodItem.name}`);
    }
    
    // ================================================================
    // CREATE DIET ENTRIES FOR NEW USERS
    // ================================================================
    
    console.log('Creating diet entries for new users...');
    
    const allFoodItems = await prisma.foodItem.findMany();
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    for (const user of regularUsers) {
      // Create 10 days of diet entries
      for (let day = 0; day < 10; day++) {
        const entryDate = new Date();
        entryDate.setDate(entryDate.getDate() - day);
        entryDate.setHours(0, 0, 0, 0);
        
        // 3-4 meals per day
        const dailyMeals = 3 + Math.floor(Math.random() * 2);
        const usedMealTypes = ['breakfast', 'lunch', 'dinner'];
        
        if (dailyMeals === 4) {
          usedMealTypes.push('snack');
        }
        
        for (const mealType of usedMealTypes) {
          // 1-2 food items per meal
          const foodCount = 1 + Math.floor(Math.random() * 2);
          
          for (let f = 0; f < foodCount; f++) {
            const randomFood = allFoodItems[Math.floor(Math.random() * allFoodItems.length)];
            const quantity = 0.5 + Math.round(Math.random() * 4) / 2; // 0.5 to 2.5
            const calories = parseFloat(randomFood.caloriesPerUnit) * quantity;
            
            await prisma.dietEntry.create({
              data: {
                userId: user.id,
                foodId: randomFood.id,
                quantity: quantity,
                calories: calories,
                consumptionDate: new Date(entryDate),
                mealType: mealType,
                notes: Math.random() < 0.3 ? 
                  ['Tasty!', 'Healthy choice', 'Post-workout meal', 'Quick breakfast'][Math.floor(Math.random() * 4)] : 
                  null
              }
            });
          }
        }
      }
      
      console.log(`Created diet entries for ${user.displayName}`);
    }
    
    // ================================================================
    // CREATE COMPETITIONS FOR NEW GYMS
    // ================================================================
    
    console.log('Creating competitions for new gyms...');
    
    const competitionTemplates = [
      {
        name: "New Year Fitness Revolution",
        description: "Start the year strong with this comprehensive fitness challenge",
        durationDays: 45,
        imageUrl: "https://example.com/images/competitions/new-year-revolution.jpg"
      },
      {
        name: "Spring Into Shape",
        description: "Get ready for spring with this energizing workout program",
        durationDays: 30,
        imageUrl: "https://example.com/images/competitions/spring-shape.jpg"
      },
      {
        name: "Beast Mode Challenge",
        description: "Unleash your inner beast with intense training sessions",
        durationDays: 21,
        imageUrl: "https://example.com/images/competitions/beast-mode.jpg"
      },
      {
        name: "Mindful Movement Journey",
        description: "Focus on mindful exercise and mental wellness",
        durationDays: 35,
        imageUrl: "https://example.com/images/competitions/mindful-movement.jpg"
      },
      {
        name: "Aqua Warriors Competition",
        description: "Water-based fitness challenge for all skill levels",
        durationDays: 28,
        imageUrl: "https://example.com/images/competitions/aqua-warriors.jpg"
      }
    ];
    
    const competitions = [];
    
    for (let i = 0; i < Math.min(newGyms.length, competitionTemplates.length); i++) {
      const template = competitionTemplates[i];
      const gym = newGyms[i];
      
      // Mix of active, upcoming, and completed competitions
      const now = new Date();
      let startDate, endDate;
      
      if (i % 3 === 0) {
        // Active
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 10);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + template.durationDays);
      } else if (i % 3 === 1) {
        // Upcoming
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() + 7);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + template.durationDays);
      } else {
        // Completed
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() - 5);
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - template.durationDays);
      }
      
      const competition = await prisma.competition.create({
        data: {
          gymId: gym.id,
          name: template.name,
          description: template.description,
          startDate: startDate,
          endDate: endDate,
          imageUrl: template.imageUrl,
          maxParticipants: 30 + Math.floor(Math.random() * 40),
          isActive: true
        }
      });
      
      competitions.push(competition);
      console.log(`Created competition: ${competition.name} at ${gym.name}`);
    }
    
    // ================================================================
    // CREATE AI INTERACTIONS FOR USERS
    // ================================================================
    
    console.log('Creating AI interactions for users...');
    
    const aiPrompts = [
      {
        prompt: "What's the best workout routine for building muscle?",
        response: "For building muscle, focus on compound exercises like squats, deadlifts, bench press, and rows. Aim for 3-4 sets of 6-12 reps with progressive overload. Train each muscle group 2-3 times per week with adequate rest between sessions.",
        type: "WORKOUT_PLAN"
      },
      {
        prompt: "How many calories should I eat to lose weight?",
        response: "To lose weight, create a moderate caloric deficit of 300-500 calories below your maintenance level. This typically means 1500-2000 calories per day depending on your size, age, and activity level. Focus on whole foods and adequate protein.",
        type: "DIET_ADVICE"
      },
      {
        prompt: "What exercises are good for beginners?",
        response: "Great beginner exercises include bodyweight squats, push-ups (modified if needed), lunges, planks, and walking. Start with 2-3 sets of 8-12 reps and focus on proper form over intensity.",
        type: "WORKOUT_PLAN"
      },
      {
        prompt: "How often should I work out?",
        response: "For general fitness, aim for 3-4 workout sessions per week with at least one rest day between intense sessions. This allows for proper recovery while maintaining consistency.",
        type: "GENERAL_QA"
      },
      {
        prompt: "What should I eat before a workout?",
        response: "Eat a light meal 1-2 hours before exercising, combining carbs and protein. Good options include banana with peanut butter, oatmeal with berries, or Greek yogurt with fruit.",
        type: "DIET_ADVICE"
      }
    ];
    
    for (const user of regularUsers) {
      // 2-4 AI interactions per user
      const interactionCount = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < interactionCount; i++) {
        const promptData = aiPrompts[Math.floor(Math.random() * aiPrompts.length)];
        
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30)); // Within last 30 days
        
        await prisma.aiInteraction.create({
          data: {
            userId: user.id,
            prompt: promptData.prompt,
            response: promptData.response,
            interactionType: promptData.type,
            createdAt: pastDate
          }
        });
      }
      
      console.log(`Created AI interactions for ${user.displayName}`);
    }
    
    // ================================================================
    // SUMMARY
    // ================================================================
    
    console.log('\n🎉 Additional Data Seeding Completed! 🎉');
    console.log('================================================');
    console.log(`✅ Created ${newUsers.length} new users:`);
    console.log(`   - ${newUsers.filter(u => u.role === 'admin').length} admins`);
    console.log(`   - ${newUsers.filter(u => u.role === 'gym_owner').length} gym owners`);
    console.log(`   - ${newUsers.filter(u => u.role === 'user').length} regular users`);
    console.log(`✅ Created ${newGyms.length} new gyms`);
    console.log(`✅ Created ${membershipPlans.length} membership plans`);
    console.log(`✅ Created ${gymClasses.length} gym classes`);
    console.log(`✅ Created ${classSchedules.length} class schedules`);
    console.log(`✅ Created ${userMemberships.length} user memberships`);
    console.log(`✅ Created ${bookings.length} user bookings`);
    console.log(`✅ Created ${newExercises.length} additional exercises`);
    console.log(`✅ Created planned and actual workouts for users`);
    console.log(`✅ Created ${newFoodItems.length} additional food items`);
    console.log(`✅ Created diet entries for users`);
    console.log(`✅ Created ${competitions.length} competitions`);
    console.log(`✅ Created AI interactions for users`);
    console.log('================================================');
    console.log('🚀 All data is logically connected and ready for testing!');
    
  } catch (error) {
    console.error('❌ Error during additional seeding:', error);
    throw error;
  }
}

additionalSeed()
  .catch(e => {
    console.error('❌ Critical error in additional seeding script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('📦 Database connection closed.');
  });