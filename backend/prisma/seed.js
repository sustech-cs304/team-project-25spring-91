//prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');
  
  // Create a test user (keeping your existing code)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      displayName: 'Test User',
      gender: 'Other',
      heightCm: 175,
      weightKg: 70
    }
  });
  
  console.log(`Created user: ${testUser.email}`);
  
  // Create some exercise categories
  const categories = ['strength', 'cardio', 'flexibility', 'balance'];
  
  // Create exercises (keeping your existing code)
  const exercisesData = [
    { name: 'Push-up', category: 'strength', description: 'Basic chest exercise using bodyweight' },
    { name: 'Squat', category: 'strength', description: 'Lower body exercise targeting quadriceps, hamstrings and glutes' },
    { name: 'Plank', category: 'strength', description: 'Core stabilizing exercise' },
    { name: 'Deadlift', category: 'strength', description: 'Compound exercise for posterior chain' },
    { name: 'Running', category: 'cardio', description: 'Cardiovascular exercise to improve endurance' },
    { name: 'Jumping Jacks', category: 'cardio', description: 'Full body cardio exercise' },
    { name: 'Mountain Climbers', category: 'cardio', description: 'Dynamic core exercise with cardio benefits' },
    { name: 'Hamstring Stretch', category: 'flexibility', description: 'Stretch for the back of your legs' },
    { name: 'Downward Dog', category: 'flexibility', description: 'Yoga pose that stretches the entire posterior chain' },
    { name: 'One-Leg Balance', category: 'balance', description: 'Stand on one leg to improve balance' }
  ];
  
  for (const exerciseData of exercisesData) {
    const exercise = await prisma.exercise.upsert({
      where: { name: exerciseData.name },
      update: {},
      create: exerciseData
    });
    
    console.log(`Created exercise: ${exercise.name}`);
  }
  
  // Create some sample workouts (keeping your existing code)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  // Sample workout 1 - Upper Body
  const upperBodyWorkout = await prisma.plannedWorkout.create({
    data: {
      userId: testUser.id,
      title: 'Upper Body Workout',
      scheduledDate: tomorrow,
      estimatedDuration: 45,
      plannedExercises: {
        create: [
          {
            exerciseId: 1, // Push-up
            plannedSets: 3,
            plannedReps: 12
          },
          {
            exerciseId: 3, // Plank
            plannedSets: 3,
            plannedDuration: 1 // 1 minute
          }
        ]
      }
    }
  });
  
  console.log(`Created planned workout: ${upperBodyWorkout.title}`);
  
  // Sample workout 2 - Cardio
  const cardioWorkout = await prisma.plannedWorkout.create({
    data: {
      userId: testUser.id,
      title: 'Cardio Session',
      scheduledDate: nextWeek,
      estimatedDuration: 30,
      plannedExercises: {
        create: [
          {
            exerciseId: 5, // Running
            plannedDuration: 20
          },
          {
            exerciseId: 6, // Jumping Jacks
            plannedSets: 3,
            plannedReps: 30
          }
        ]
      }
    }
  });
  
  console.log(`Created planned workout: ${cardioWorkout.title}`);
  
  // Sample completed workout
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  const completedWorkout = await prisma.actualWorkout.create({
    data: {
      userId: testUser.id,
      title: 'Full Body Workout',
      completedDate: lastWeek,
      actualDuration: 50,
      actualExercises: {
        create: [
          {
            exerciseId: 1, // Push-up
            actualSets: 3,
            actualReps: 10
          },
          {
            exerciseId: 2, // Squat
            actualSets: 3,
            actualReps: 15
          },
          {
            exerciseId: 3, // Plank
            actualSets: 3,
            actualDuration: 1
          }
        ]
      }
    }
  });
  
  console.log(`Created completed workout: ${completedWorkout.title}`);

  // =====================================================
  // NEW CODE FOR GYM APPOINTMENT SYSTEM STARTS HERE
  // =====================================================
  console.log('Starting gym appointment system seeding...');
  
  // Create 15 gyms with diverse options
  const gymLocations = [
    { name: 'FitZone Downtown', address: '123 Main St, Downtown', city: 'San Francisco', state: 'CA', zipCode: '94105', 
      description: 'A premium fitness center in the heart of downtown with state-of-the-art equipment and expert trainers.',
      contactInfo: 'info@fitzonedowntown.com', imageUrl: 'https://example.com/images/fitzonedowntown.jpg' },
    { name: 'PowerFit Elite', address: '456 Market St, Financial District', city: 'San Francisco', state: 'CA', zipCode: '94111',
      description: 'Elite training facility specializing in strength and performance optimization.',
      contactInfo: 'members@powerfit.com', imageUrl: 'https://example.com/images/powerfit.jpg' },
    { name: 'Yoga Haven', address: '789 Peaceful Ln, Sunset District', city: 'San Francisco', state: 'CA', zipCode: '94122',
      description: 'Tranquil yoga studio offering a variety of classes for all levels.',
      contactInfo: 'namaste@yogahaven.com', imageUrl: 'https://example.com/images/yogahaven.jpg' },
    { name: 'Iron Works Gym', address: '101 Heavy St, Industrial District', city: 'Oakland', state: 'CA', zipCode: '94607',
      description: 'Old school weightlifting gym with a focus on powerlifting and bodybuilding.',
      contactInfo: 'lift@ironworks.com', imageUrl: 'https://example.com/images/ironworks.jpg' },
    { name: 'Cardio Kingdom', address: '202 Runner\'s Ave, Marina', city: 'San Francisco', state: 'CA', zipCode: '94123',
      description: 'Specializing in cardio equipment and classes to improve endurance and heart health.',
      contactInfo: 'run@cardiokingdom.com', imageUrl: 'https://example.com/images/cardiokingdom.jpg' },
    { name: 'Flex Fitness', address: '303 Muscle Blvd, Mission District', city: 'San Francisco', state: 'CA', zipCode: '94110',
      description: 'Modern gym with a diverse range of equipment and group classes.',
      contactInfo: 'info@flexfitness.com', imageUrl: 'https://example.com/images/flexfitness.jpg' },
    { name: 'Zen Wellness Center', address: '404 Mindful Way, Japantown', city: 'San Francisco', state: 'CA', zipCode: '94115',
      description: 'Holistic wellness center combining fitness, meditation, and nutrition guidance.',
      contactInfo: 'wellness@zencenter.com', imageUrl: 'https://example.com/images/zenwellness.jpg' },
    { name: 'CrossFit Thunder', address: '505 Intensity Rd, SOMA', city: 'San Francisco', state: 'CA', zipCode: '94103', 
      description: 'High-intensity CrossFit box with expert coaches and a supportive community.',
      contactInfo: 'wod@crossfitthunder.com', imageUrl: 'https://example.com/images/crossfitthunder.jpg' },
    { name: 'Pilates Studio Plus', address: '606 Core St, Pacific Heights', city: 'San Francisco', state: 'CA', zipCode: '94115', 
      description: 'Specialized Pilates studio with reformers and expert instructors.',
      contactInfo: 'stretch@pilatesstudioplus.com', imageUrl: 'https://example.com/images/pilatesstudio.jpg' },
    { name: 'The Boxing Club', address: '707 Puncher\'s Lane, Dogpatch', city: 'San Francisco', state: 'CA', zipCode: '94107',
      description: 'Boxing gym offering technical training and high-energy fitness classes.',
      contactInfo: 'box@theboxingclub.com', imageUrl: 'https://example.com/images/boxingclub.jpg' },
    { name: 'SwimFit Aquatics', address: '808 Splash Ave, Richmond District', city: 'San Francisco', state: 'CA', zipCode: '94121',
      description: 'Aquatic center with lap pools, swimming lessons, and water aerobics.',
      contactInfo: 'swim@swimfit.com', imageUrl: 'https://example.com/images/swimfit.jpg' },
    { name: 'Golden Years Fitness', address: '909 Wisdom Way, Nob Hill', city: 'San Francisco', state: 'CA', zipCode: '94109',
      description: 'Fitness center specializing in programs for seniors and active aging.',
      contactInfo: 'active@goldenyears.com', imageUrl: 'https://example.com/images/goldenyears.jpg' },
    { name: 'Family Fitness Center', address: '1010 Together Terrace, Outer Sunset', city: 'San Francisco', state: 'CA', zipCode: '94122',
      description: 'Family-friendly gym with programs for all ages and childcare services.',
      contactInfo: 'family@familyfitness.com', imageUrl: 'https://example.com/images/familyfitness.jpg' },
    { name: 'Mountain Climbers Club', address: '1111 Peak Boulevard, Twin Peaks', city: 'San Francisco', state: 'CA', zipCode: '94131',
      description: 'Climbing gym with walls for all skill levels and training programs.',
      contactInfo: 'climb@mountainclimbers.com', imageUrl: 'https://example.com/images/mountainclimbers.jpg' },
    { name: 'Urban Athletic Club', address: '1212 City Sport Street, Hayes Valley', city: 'San Francisco', state: 'CA', zipCode: '94102',
      description: 'Modern athletic club combining luxury amenities with performance training.',
      contactInfo: 'info@urbanathletic.com', imageUrl: 'https://example.com/images/urbanathletic.jpg' }
  ];
  
  const gyms = [];
  
  for (const location of gymLocations) {
    const gym = await prisma.gym.create({
      data: {
        name: location.name,
        address: location.address,
        description: location.description,
        contactInfo: location.contactInfo,
        imageUrl: location.imageUrl
      }
    });
    
    gyms.push(gym);
    console.log(`Created gym: ${gym.name}`);
  }
  
  // Create membership plans for each gym - 45 total (3 per gym)
  const planTypes = [
    { name: 'Basic', durationDays: 30, priceMultiplier: 1, maxBookings: 3, description: 'Basic membership with access to main facilities and limited class bookings.' },
    { name: 'Standard', durationDays: 30, priceMultiplier: 1.5, maxBookings: 5, description: 'Standard membership with full access to facilities and increased class bookings.' },
    { name: 'Premium', durationDays: 30, priceMultiplier: 2, maxBookings: null, description: 'Premium membership with unlimited access to all facilities and unlimited class bookings.' },
    { name: 'Annual Basic', durationDays: 365, priceMultiplier: 10, maxBookings: 3, description: 'Annual basic membership with significant savings over monthly plan.' },
    { name: 'Annual Premium', durationDays: 365, priceMultiplier: 18, maxBookings: null, description: 'Annual premium membership with unlimited access and best value.' }
  ];
  
  const membershipPlans = [];
  
  for (const gym of gyms) {
    // First 3 plans are applied to all gyms
    for (let i = 0; i < 3; i++) {
      const planType = planTypes[i];
      const basePrice = 30 + Math.floor(Math.random() * 20); // Random base price between $30-$50
      
      const plan = await prisma.membershipPlan.create({
        data: {
          gymId: gym.id,
          name: planType.name,
          description: planType.description,
          durationDays: planType.durationDays,
          price: basePrice * planType.priceMultiplier,
          maxBookingsPerWeek: planType.maxBookings,
          isActive: true
        }
      });
      
      membershipPlans.push(plan);
      console.log(`Created membership plan: ${plan.name} for ${gym.name}`);
    }
    
    // Randomly add annual plans to some gyms
    if (Math.random() > 0.5) {
      const planType = planTypes[3]; // Annual Basic
      const basePrice = 30 + Math.floor(Math.random() * 20);
      
      const plan = await prisma.membershipPlan.create({
        data: {
          gymId: gym.id,
          name: planType.name,
          description: planType.description,
          durationDays: planType.durationDays,
          price: basePrice * planType.priceMultiplier,
          maxBookingsPerWeek: planType.maxBookings,
          isActive: true
        }
      });
      
      membershipPlans.push(plan);
      console.log(`Created membership plan: ${plan.name} for ${gym.name}`);
    }
    
    if (Math.random() > 0.7) {
      const planType = planTypes[4]; // Annual Premium
      const basePrice = 30 + Math.floor(Math.random() * 20);
      
      const plan = await prisma.membershipPlan.create({
        data: {
          gymId: gym.id,
          name: planType.name,
          description: planType.description,
          durationDays: planType.durationDays,
          price: basePrice * planType.priceMultiplier,
          maxBookingsPerWeek: planType.maxBookings,
          isActive: true
        }
      });
      
      membershipPlans.push(plan);
      console.log(`Created membership plan: ${plan.name} for ${gym.name}`);
    }
  }
  
  // Create classes for each gym - types of classes depend on gym specialty
  const classTypes = {
    general: [
      { name: 'HIIT', description: 'High-Intensity Interval Training combining cardio and strength', duration: 45, difficulty: 'intermediate' },
      { name: 'Circuit Training', description: 'Full body workout moving through different exercise stations', duration: 60, difficulty: 'intermediate' },
      { name: 'Body Pump', description: 'Barbell workout class focusing on low weight, high repetition', duration: 45, difficulty: 'beginner' },
      { name: 'Tabata', description: '20 seconds of intense exercise followed by 10 seconds of rest, repeated 8 times', duration: 30, difficulty: 'advanced' },
    ],
    cardio: [
      { name: 'Spin Class', description: 'Indoor cycling workout set to energizing music', duration: 45, difficulty: 'intermediate' },
      { name: 'Zumba', description: 'Dance fitness program featuring Latin and international music', duration: 60, difficulty: 'beginner' },
      { name: 'Cardio Kickboxing', description: 'High-energy workout combining martial arts and boxing', duration: 45, difficulty: 'intermediate' },
      { name: 'Aerobics', description: 'Traditional aerobic exercise class to improve cardiovascular health', duration: 60, difficulty: 'beginner' },
    ],
    strength: [
      { name: 'Powerlifting', description: 'Strength training focused on the three main powerlifting exercises', duration: 60, difficulty: 'advanced' },
      { name: 'Olympic Lifting', description: 'Technical Olympic weightlifting training', duration: 75, difficulty: 'advanced' },
      { name: 'Strongman', description: 'Functional strength training with unconventional implements', duration: 60, difficulty: 'advanced' },
      { name: 'Kettlebell Training', description: 'Full body workout using kettlebells', duration: 45, difficulty: 'intermediate' },
    ],
    mind_body: [
      { name: 'Vinyasa Yoga', description: 'Flowing yoga sequence connecting movement with breath', duration: 60, difficulty: 'beginner' },
      { name: 'Pilates Reformer', description: 'Pilates exercises performed on a reformer machine', duration: 45, difficulty: 'intermediate' },
      { name: 'Meditation', description: 'Guided meditation for mental wellness', duration: 30, difficulty: 'beginner' },
      { name: 'Tai Chi', description: 'Ancient Chinese martial art practiced for health benefits', duration: 60, difficulty: 'beginner' },
    ],
    specialty: [
      { name: 'Boxing Fundamentals', description: 'Learn basic boxing techniques and combinations', duration: 60, difficulty: 'beginner' },
      { name: 'Rock Climbing 101', description: 'Introduction to rock climbing techniques and safety', duration: 90, difficulty: 'beginner' },
      { name: 'Swim Technique', description: 'Improve your swimming technique with expert coaching', duration: 45, difficulty: 'beginner' },
      { name: 'Senior Fitness', description: 'Low-impact exercise designed for seniors', duration: 45, difficulty: 'beginner' },
    ]
  };
  
  function getClassesForGym(gymName) {
    if (gymName.includes('Yoga') || gymName.includes('Pilates') || gymName.includes('Zen')) {
      return [...classTypes.general.slice(0, 2), ...classTypes.mind_body];
    } else if (gymName.includes('CrossFit') || gymName.includes('Iron') || gymName.includes('Power')) {
      return [...classTypes.general.slice(0, 2), ...classTypes.strength];
    } else if (gymName.includes('Cardio') || gymName.includes('Run')) {
      return [...classTypes.general.slice(0, 2), ...classTypes.cardio];
    } else if (gymName.includes('Boxing')) {
      return [...classTypes.general.slice(0, 2), ...classTypes.cardio.slice(0, 2), ...classTypes.specialty.slice(0, 1)];
    } else if (gymName.includes('Swim')) {
      return [...classTypes.general.slice(0, 2), ...classTypes.specialty.slice(2, 3)];
    } else if (gymName.includes('Mountain') || gymName.includes('Climber')) {
      return [...classTypes.general.slice(0, 2), ...classTypes.specialty.slice(1, 2)];
    } else if (gymName.includes('Golden') || gymName.includes('Senior')) {
      return [...classTypes.general.slice(0, 1), ...classTypes.specialty.slice(3, 4), ...classTypes.mind_body.slice(2, 4)];
    } else {
      // For general gyms, create a mix
      return [
        ...classTypes.general, 
        classTypes.cardio[Math.floor(Math.random() * classTypes.cardio.length)],
        classTypes.mind_body[Math.floor(Math.random() * classTypes.mind_body.length)]
      ];
    }
  }
  
  const gymClasses = [];
  
  for (const gym of gyms) {
    const classesToCreate = getClassesForGym(gym.name);
    
    for (const classInfo of classesToCreate) {
      // 80% of classes are for members only
      const membersOnly = Math.random() < 0.8;
      // Random capacity between 5 and 30, or null for no limit
      const maxCapacity = Math.random() < 0.8 ? 5 + Math.floor(Math.random() * 26) : null;
      
      const gymClass = await prisma.gymClass.create({
        data: {
          gymId: gym.id,
          name: classInfo.name,
          description: classInfo.description,
          maxCapacity: maxCapacity,
          durationMinutes: classInfo.duration,
          membersOnly: membersOnly,
          difficultyLevel: classInfo.difficulty,
          isActive: true,
          imageUrl: `https://example.com/images/classes/${classInfo.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        }
      });
      
      gymClasses.push(gymClass);
      console.log(`Created class: ${gymClass.name} for ${gym.name}`);
    }
  }
  
  // Create class schedules - 200+ total to have plenty of options
  const instructors = [
    'John Smith', 'Sarah Johnson', 'Michael Lee', 'Emma Rodriguez', 'David Kim', 
    'Maria Garcia', 'James Wilson', 'Sophia Martinez', 'Robert Taylor', 'Jessica Brown',
    'Daniel Davis', 'Anna White', 'Thomas Moore', 'Olivia Jackson', 'Christopher Martin'
  ];
  
  // Helper function to generate time slots for a given day
  function generateTimeSlots(baseDate, count = 4) {
    const slots = [];
    const startHours = [7, 9, 12, 15, 17, 18, 19];
    
    // Randomly select count number of hours from startHours
    const selectedHours = [];
    while (selectedHours.length < count && startHours.length > 0) {
      const randomIndex = Math.floor(Math.random() * startHours.length);
      selectedHours.push(startHours.splice(randomIndex, 1)[0]);
    }
    
    selectedHours.sort((a, b) => a - b); // Sort hours in ascending order
    
    for (const hour of selectedHours) {
      const startTime = new Date(baseDate);
      startTime.setHours(hour, Math.random() < 0.5 ? 0 : 30, 0, 0);
      
      const endTime = new Date(startTime);
      // Add class duration (we'll just use a standard 60 min for simplicity)
      endTime.setMinutes(endTime.getMinutes() + 60);
      
      slots.push({ startTime, endTime });
    }
    
    return slots;
  }
  
  const classSchedules = [];
  
  // Generate schedules for the next 14 days
  for (let day = 0; day < 14; day++) {
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + day);
    scheduleDate.setHours(0, 0, 0, 0); // Reset time to beginning of the day
    
    // For each gym class, create 1-3 schedules on different days
    for (const gymClass of gymClasses) {
      // Only create schedules on certain days for each class
      if (Math.random() < 0.3) { // 30% chance to schedule a class on this day
        const timeSlots = generateTimeSlots(scheduleDate, 1);
        
        for (const slot of timeSlots) {
          const instructor = instructors[Math.floor(Math.random() * instructors.length)];
          
          const schedule = await prisma.classSchedule.create({
            data: {
              classId: gymClass.id,
              startTime: slot.startTime,
              endTime: slot.endTime,
              instructor: instructor,
              currentBookings: 0,
              isCancelled: false
            }
          });
          
          classSchedules.push(schedule);
          console.log(`Created schedule for ${gymClass.name} on ${schedule.startTime.toLocaleString()}`);
        }
      }
    }
  }
  
  // Create some user memberships and bookings
  // Let's create more test users first
  const additionalUsers = [
    { email: 'jane@example.com', name: 'Jane Doe', gender: 'Female', heightCm: 165, weightKg: 60 },
    { email: 'bob@example.com', name: 'Bob Johnson', gender: 'Male', heightCm: 180, weightKg: 85 },
    { email: 'alice@example.com', name: 'Alice Smith', gender: 'Female', heightCm: 170, weightKg: 65 },
    { email: 'carlos@example.com', name: 'Carlos Rodriguez', gender: 'Male', heightCm: 175, weightKg: 78 }
  ];
  
  const users = [testUser]; // Start with existing test user
  
  for (const userData of additionalUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        passwordHash: await bcrypt.hash('password123', 10),
        displayName: userData.name,
        gender: userData.gender,
        heightCm: userData.heightCm,
        weightKg: userData.weightKg
      }
    });
    
    users.push(user);
    console.log(`Created user: ${user.email}`);
  }
  
  // Create user memberships - each user will have 2-3 memberships
  const userMemberships = [];
  
  for (const user of users) {
    // Select 2-3 random gyms for this user
    const userGymCount = 2 + Math.floor(Math.random() * 2);
    const selectedGyms = [];
    
    while (selectedGyms.length < userGymCount && gyms.length > selectedGyms.length) {
      const randomGym = gyms[Math.floor(Math.random() * gyms.length)];
      if (!selectedGyms.some(g => g.id === randomGym.id)) {
        selectedGyms.push(randomGym);
      }
    }
    
    for (const gym of selectedGyms) {
      // Get membership plans for this gym
      const gymPlans = membershipPlans.filter(p => p.gymId === gym.id);
      if (gymPlans.length === 0) continue;
      
      // Choose a random plan
      const plan = gymPlans[Math.floor(Math.random() * gymPlans.length)];
      
      // Create membership with different statuses and dates
      const randomChoice = Math.random();
      let status, startDate, endDate;
      
      if (randomChoice < 0.7) { // 70% active memberships
        status = 'active';
        startDate = new Date();
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Started 0-30 days ago
        
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.durationDays);
      } else if (randomChoice < 0.9) { // 20% expired memberships
        status = 'expired';
        endDate = new Date();
        endDate.setDate(endDate.getDate() - Math.floor(Math.random() * 30)); // Ended 1-30 days ago
        
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - plan.durationDays);
      } else { // 10% cancelled memberships
        status = 'cancelled';
        startDate = new Date();
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60)); // Started 0-60 days ago
        
        // Cancelled partway through
        const fullDuration = plan.durationDays;
        const partialDuration = Math.floor(fullDuration * (0.3 + Math.random() * 0.5)); // Cancelled after 30-80% of duration
        
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + partialDuration);
      }
      
      const membership = await prisma.userMembership.create({
        data: {
          userId: user.id,
          gymId: gym.id,
          planId: plan.id,
          startDate: startDate,
          endDate: endDate,
          status: status,
          autoRenew: status === 'active' && Math.random() < 0.7, // 70% of active memberships auto-renew
          bookingsUsedThisWeek: status === 'active' ? Math.floor(Math.random() * 3) : 0,
          lastBookingCountReset: new Date() // Today
        }
      });
      
      userMemberships.push(membership);
      console.log(`Created ${status} membership for ${user.email} at ${gym.name}`);
      
      // Create payment records for this membership
      const paymentDate = new Date(startDate);
      const paymentAmount = plan.price;
      const paymentMethods = ['credit_card', 'paypal', 'bank_transfer'];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      const payment = await prisma.membershipPayment.create({
        data: {
          membershipId: membership.id,
          amount: paymentAmount,
          paymentDate: paymentDate,
          paymentMethod: paymentMethod,
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          status: 'completed'
        }
      });
      
      console.log(`Created payment record for membership #${membership.id}`);
    }
  }
  
  // Create bookings - focus on active memberships
  const activeMemberships = userMemberships.filter(m => m.status === 'active');
  const bookings = [];
  
  // For each active membership, create 2-5 bookings
  for (const membership of activeMemberships) {
    // Find applicable gym classes for this membership's gym
    const gymClassesForMembership = gymClasses.filter(c => c.gymId === membership.gymId);
    if (gymClassesForMembership.length === 0) continue;
    
    // Find schedules for these classes
    const schedulesForMembership = classSchedules.filter(s => 
      gymClassesForMembership.some(c => c.id === s.classId)
    );
    if (schedulesForMembership.length === 0) continue;
    
    // Create 2-5 bookings per membership
    const bookingCount = 2 + Math.floor(Math.random() * 4);
    
    // Split between upcoming, past, and cancelled
    for (let i = 0; i < bookingCount; i++) {
      // Randomly select a schedule
      const schedule = schedulesForMembership[Math.floor(Math.random() * schedulesForMembership.length)];
      
      // Determine booking status based on schedule date and random factors
      let bookingStatus, attended;
      const now = new Date();
      
      if (schedule.startTime > now) {
        // Future class
        if (Math.random() < 0.2) { // 20% chance of cancellation
          bookingStatus = 'cancelled';
          attended = false;
        } else {
          bookingStatus = 'confirmed';
          attended = false;
        }
      } else {
        // Past class
        if (Math.random() < 0.1) { // 10% chance user cancelled
          bookingStatus = 'cancelled';
          attended = false;
        } else if (Math.random() < 0.8) { // 80% chance user attended
          bookingStatus = 'attended';
          attended = true;
        } else { // 10% chance user missed
          bookingStatus = 'missed';
          attended = false;
        }
      }
      
      // Create booking with slightly randomized booking time
      const bookingTime = new Date(schedule.startTime);
      bookingTime.setDate(bookingTime.getDate() - Math.floor(Math.random() * 7)); // Booked 0-7 days in advance
      
      // Ensure booking time is after membership start date
      if (bookingTime < new Date(membership.startDate)) {
        bookingTime.setTime(new Date(membership.startDate).getTime() + 3600000); // 1 hour after membership start
      }
      
      // Ensure booking time is before now for past bookings
      if (schedule.startTime < now && bookingTime > now) {
        bookingTime.setTime(now.getTime() - 86400000); // 1 day before now
      }
      
      try {
        const booking = await prisma.userBooking.create({
          data: {
            userId: membership.userId,
            membershipId: membership.id,
            scheduleId: schedule.id,
            bookingTime: bookingTime,
            bookingStatus: bookingStatus,
            cancellationReason: bookingStatus === 'cancelled' ? 
              ['Schedule conflict', 'Feeling unwell', 'Transportation issues', 'Work emergency']
                [Math.floor(Math.random() * 4)] : null,
            attended: attended
          }
        });
        
        bookings.push(booking);
        console.log(`Created ${bookingStatus} booking for user #${membership.userId} at ${schedule.startTime.toLocaleString()}`);
        
        // Increment currentBookings for schedule if status is confirmed
        if (bookingStatus === 'confirmed' || bookingStatus === 'attended') {
          await prisma.classSchedule.update({
            where: { id: schedule.id },
            data: {
              currentBookings: {
                increment: 1
              }
            }
          });
        }
      } catch (error) {
        console.log(`Error creating booking: ${error.message}`);
      }
    }
  }
  
  console.log('Gym appointment system seeding completed!');
  console.log(`Created ${gyms.length} gyms`);
  console.log(`Created ${membershipPlans.length} membership plans`);
  console.log(`Created ${gymClasses.length} gym classes`);
  console.log(`Created ${classSchedules.length} class schedules`);
  console.log(`Created ${userMemberships.length} user memberships`);
  console.log(`Created ${bookings.length} bookings`);
  
  console.log('Database seeding completed!');
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });