// competitionSeed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCompetitions() {
  console.log('Starting Competition Feature Seeding...');

  try {
    // ================================================================
    // FETCH EXISTING DATA FOR REFERENCES
    // ================================================================
    
    // Get gyms
    const gyms = await prisma.gym.findMany();
    if (gyms.length === 0) {
      console.log('No gyms found in database. Cannot create competitions.');
      return;
    }

    // Get gym owners (users with role 'gym_owner' or 'admin')
    const gymOwners = await prisma.user.findMany({
      where: {
        role: {
          in: ['gym_owner', 'admin']
        }
      }
    });
    
    // If no gym owners found, use the first user as a fallback
    let ownerId;
    if (gymOwners.length > 0) {
      ownerId = gymOwners[0].id;
    } else {
      const anyUser = await prisma.user.findFirst();
      if (!anyUser) {
        console.log('No users found in database. Cannot continue.');
        return;
      }
      ownerId = anyUser.id;
      console.log(`No gym owners found. Using ${anyUser.email} as fallback.`);
    }
    
    // Get all users for participants
    const users = await prisma.user.findMany();
    
    // Get exercises for competition tasks
    const exercises = await prisma.exercise.findMany();

    // ================================================================
    // CREATE COMPETITION DATA
    // ================================================================
    
    // 1. Create 10 competitions (spread across available gyms)
    console.log('Creating competitions...');
    
    const competitionTemplates = [
      {
        name: "Summer Fitness Challenge",
        description: "Get fit for summer with this 30-day full body challenge. Complete various exercises to earn points and improve your fitness level.",
        imageUrl: "https://example.com/images/competitions/summer-fitness.jpg",
        durationDays: 30
      },
      {
        name: "Strongman Competition",
        description: "Test your strength in this intense competition. Complete heavy lifting challenges to prove you're the strongest.",
        imageUrl: "https://example.com/images/competitions/strongman.jpg",
        durationDays: 14
      },
      {
        name: "Marathon Prep Challenge",
        description: "Prepare for marathon season with this running and endurance challenge. Track your distance and build stamina.",
        imageUrl: "https://example.com/images/competitions/marathon-prep.jpg",
        durationDays: 42
      },
      {
        name: "Weight Loss Challenge",
        description: "Join our 60-day weight loss challenge. Complete workouts and track your progress to achieve your goals.",
        imageUrl: "https://example.com/images/competitions/weight-loss.jpg",
        durationDays: 60
      },
      {
        name: "CrossFit Games Qualifier",
        description: "Train like a CrossFit athlete with these challenging workouts. Test your limits across multiple fitness domains.",
        imageUrl: "https://example.com/images/competitions/crossfit-games.jpg",
        durationDays: 21
      },
      {
        name: "30-Day Yoga Journey",
        description: "Improve flexibility, balance, and mental clarity with this yoga challenge. Daily poses and flows for all levels.",
        imageUrl: "https://example.com/images/competitions/yoga-journey.jpg",
        durationDays: 30
      },
      {
        name: "Bodyweight Master Challenge",
        description: "No equipment needed! Master bodyweight exercises in this 28-day challenge to build functional strength.",
        imageUrl: "https://example.com/images/competitions/bodyweight-master.jpg",
        durationDays: 28
      },
      {
        name: "Iron Pumpers Competition",
        description: "How much iron can you pump? Track your total lifting volume across key exercises in this strength challenge.",
        imageUrl: "https://example.com/images/competitions/iron-pumpers.jpg",
        durationDays: 14
      },
      {
        name: "Cardio Crusher Challenge",
        description: "Boost your cardiovascular fitness with this intense cardio program. Track distance, calories, and heart rate.",
        imageUrl: "https://example.com/images/competitions/cardio-crusher.jpg",
        durationDays: 21
      },
      {
        name: "Functional Fitness Showdown",
        description: "Improve everyday movement patterns with functional exercises. Build practical strength for real-life activities.",
        imageUrl: "https://example.com/images/competitions/functional-fitness.jpg",
        durationDays: 28
      }
    ];
    
    const competitions = [];
    
    for (let i = 0; i < competitionTemplates.length; i++) {
      const template = competitionTemplates[i];
      const targetGym = gyms[i % gyms.length]; // Distribute across available gyms
      
      // Create dates - mix of active, upcoming, and completed competitions
      const now = new Date();
      let startDate, endDate;
      
      if (i % 3 === 0) {
        // Active competition (already started, not yet ended)
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - Math.floor(template.durationDays / 3)); // Started 1/3 of the way through
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + template.durationDays);
      } else if (i % 3 === 1) {
        // Upcoming competition (starts in the future)
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() + 7 + (i * 2)); // Starts 7+ days from now
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + template.durationDays);
      } else {
        // Completed competition (already ended)
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() - (i * 3)); // Ended 3-30 days ago
        startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - template.durationDays);
      }
      
      const competition = await prisma.competition.create({
        data: {
          gymId: targetGym.id,
          name: template.name,
          description: template.description,
          startDate: startDate,
          endDate: endDate,
          imageUrl: template.imageUrl,
          maxParticipants: 50 + (i * 10), // Between 50-140 participants max
          isActive: i % 5 !== 0 // 80% are active
        }
      });
      
      competitions.push(competition);
      console.log(`Created competition: ${competition.name} at ${targetGym.name}`);
    }
    
    // 2. Create tasks for each competition (5-8 tasks per competition)
    console.log('Creating competition tasks...');
    
    const taskTemplates = {
      strength: [
        { name: "Total Weight Lifted", description: "Track the total weight lifted across all strength exercises", unit: "kg", baseTarget: 5000 },
        { name: "Push-up Challenge", description: "Complete as many push-ups as possible", unit: "reps", baseTarget: 1000 },
        { name: "Squat Challenge", description: "Accumulate squats with proper form", unit: "reps", baseTarget: 500 },
        { name: "Deadlift Volume", description: "Track total deadlift volume", unit: "kg", baseTarget: 2000 },
        { name: "Pull-up Master", description: "Complete pull-ups throughout the competition", unit: "reps", baseTarget: 100 },
        { name: "Bench Press Total", description: "Total weight on bench press", unit: "kg", baseTarget: 1500 },
        { name: "Dumbbell Complex", description: "Complete dumbbell complexes", unit: "rounds", baseTarget: 50 }
      ],
      cardio: [
        { name: "Running Distance", description: "Track your total running distance", unit: "km", baseTarget: 100 },
        { name: "Cycling Journey", description: "Track cycling distance indoors or outdoors", unit: "km", baseTarget: 200 },
        { name: "Rowing Challenge", description: "Accumulate distance on the rowing machine", unit: "km", baseTarget: 50 },
        { name: "Jump Rope Master", description: "Track minutes of jump rope completed", unit: "min", baseTarget: 120 },
        { name: "Swimming Challenge", description: "Track swimming distance", unit: "km", baseTarget: 10 },
        { name: "Stair Climber", description: "Track floors climbed on the stair machine", unit: "floors", baseTarget: 500 },
        { name: "HIIT Minutes", description: "Track minutes of high-intensity interval training", unit: "min", baseTarget: 300 }
      ],
      flexibility: [
        { name: "Stretching Time", description: "Accumulate minutes spent stretching", unit: "min", baseTarget: 300 },
        { name: "Yoga Sessions", description: "Complete yoga sessions", unit: "sessions", baseTarget: 20 },
        { name: "Split Progress", description: "Track progress towards full splits", unit: "cm", baseTarget: 20 },
        { name: "Mobility Routine", description: "Complete mobility routines", unit: "routines", baseTarget: 15 }
      ],
      endurance: [
        { name: "Plank Challenge", description: "Accumulate time in plank position", unit: "min", baseTarget: 60 },
        { name: "Wall Sit Duration", description: "Track time spent in wall sit position", unit: "min", baseTarget: 45 },
        { name: "Farmer's Walk", description: "Carry heavy weights for distance", unit: "km", baseTarget: 5 },
        { name: "Burpee Challenge", description: "Complete burpees throughout the competition", unit: "reps", baseTarget: 500 }
      ],
      general: [
        { name: "Workout Sessions", description: "Complete workout sessions", unit: "sessions", baseTarget: 20 },
        { name: "Active Minutes", description: "Track minutes of physical activity", unit: "min", baseTarget: 1500 },
        { name: "Calories Burned", description: "Track estimated calorie burn from exercise", unit: "kcal", baseTarget: 10000 },
        { name: "Steps Challenge", description: "Track daily steps", unit: "steps", baseTarget: 300000 },
        { name: "Class Attendance", description: "Attend gym classes", unit: "classes", baseTarget: 15 }
      ]
    };
    
    const allTasks = [];
    
    for (const competition of competitions) {
      // Determine competition focus based on name for theming tasks
      let focusCategories = ['general'];
      
      if (competition.name.includes('Strength') || competition.name.includes('Iron') || 
          competition.name.includes('Strong')) {
        focusCategories.push('strength');
      } else if (competition.name.includes('Cardio') || competition.name.includes('Marathon') || 
                competition.name.includes('Run')) {
        focusCategories.push('cardio');
      } else if (competition.name.includes('Yoga') || competition.name.includes('Flex')) {
        focusCategories.push('flexibility');
      } else if (competition.name.includes('CrossFit') || competition.name.includes('Functional')) {
        focusCategories.push('strength', 'cardio', 'endurance');
      } else if (competition.name.includes('Endurance') || competition.name.includes('Challenge')) {
        focusCategories.push('endurance', 'cardio');
      } else {
        // For general competitions, include a mix of categories
        focusCategories.push('strength', 'cardio');
      }
      
      // Determine how many tasks to create (5-8 per competition)
      const taskCount = 5 + Math.floor(Math.random() * 4);
      
      // Create tasks
      for (let i = 0; i < taskCount; i++) {
        // Select a category for this task
        const category = focusCategories[i % focusCategories.length];
        
        // Select a task template
        const templates = taskTemplates[category];
        const template = templates[i % templates.length];
        
        // Determine if we'll link this to an exercise (70% chance)
        let exerciseId = null;
        if (Math.random() < 0.7 && exercises.length > 0) {
          // Try to match by name/category, or just pick random one
          let matchingExercises = exercises.filter(e => 
            e.name.toLowerCase().includes(template.name.toLowerCase()) || 
            (e.category && e.category.toLowerCase() === category.toLowerCase())
          );
          
          if (matchingExercises.length === 0) {
            matchingExercises = exercises;
          }
          
          exerciseId = matchingExercises[Math.floor(Math.random() * matchingExercises.length)].id;
        }
        
        // Scale target value based on competition duration
        const durationFactor = competition.endDate - competition.startDate;
        const durationDays = durationFactor / (1000 * 60 * 60 * 24);
        const scaledTarget = Math.round(template.baseTarget * (durationDays / 30) * (0.8 + Math.random() * 0.4));
        
        // Create the task
        const task = await prisma.competitionTask.create({
          data: {
            competitionId: competition.id,
            exerciseId: exerciseId,
            name: template.name,
            description: template.description,
            targetValue: scaledTarget,
            unit: template.unit,
            pointsValue: 50 + Math.floor(Math.random() * 150) // 50-200 points
          }
        });
        
        allTasks.push(task);
        console.log(`Created task: ${task.name} for ${competition.name}`);
      }
    }
    
    // 3. Create participants (5-20 users per competition)
    console.log('Creating competition participants...');
    
    const participants = [];
    
    for (const competition of competitions) {
      // Determine how many participants for this competition (5-20)
      const participantCount = 5 + Math.floor(Math.random() * 16);
      const participantPool = [...users];
      
      for (let i = 0; i < participantCount && participantPool.length > 0; i++) {
        // Select random user from pool
        const randomIndex = Math.floor(Math.random() * participantPool.length);
        const user = participantPool[randomIndex];
        
        // Remove user from pool to avoid duplicates
        participantPool.splice(randomIndex, 1);
        
        // Determine join date (between competition start and now/end)
        const joinDate = new Date(competition.startDate);
        const now = new Date();
        const endDate = new Date(competition.endDate);
        const maxDate = now < endDate ? now : endDate;
        
        const dateRange = maxDate - joinDate;
        if (dateRange > 0) {
          joinDate.setTime(joinDate.getTime() + Math.random() * dateRange);
        }
        
        // Create participant record
        try {
          const participant = await prisma.competitionUser.create({
            data: {
              userId: user.id,
              competitionId: competition.id,
              joinDate: joinDate,
              totalPoints: 0,
              completionPct: 0,
              isActive: Math.random() < 0.9 // 90% active participation
            }
          });
          
          participants.push(participant);
          console.log(`Added user ${user.email} to competition ${competition.name}`);
        } catch (error) {
          // Skip if user is already in competition
          console.log(`Skipped adding user ${user.email} to competition (may be duplicate)`);
        }
      }
    }
    
    // 4. Create progress records for each participant-task combination
    console.log('Creating competition progress records...');
    
    for (const participant of participants) {
      // Get tasks for this competition
      const competitionTasks = allTasks.filter(task => task.competitionId === participant.competitionId);
      
      // Create progress for each task
      for (const task of competitionTasks) {
        // Determine progress level
        const competition = competitions.find(c => c.id === participant.competitionId);
        const now = new Date();
        const isCompetitionOver = now > competition.endDate;
        const isCompetitionActive = now >= competition.startDate && now <= competition.endDate;
        
        let progressPct;
        if (isCompetitionOver) {
          // For ended competitions, randomize completion (more likely to be complete)
          progressPct = Math.random() < 0.7 ? 1 : Math.random();
        } else if (isCompetitionActive) {
          // For active competitions, base progress on how far along the competition is
          const competitionDuration = competition.endDate - competition.startDate;
          const elapsed = now - competition.startDate;
          const timePct = elapsed / competitionDuration;
          
          // Progress typically follows time, but with some variation
          progressPct = Math.min(1, timePct * (0.5 + Math.random()));
        } else {
          // For future competitions, no progress
          progressPct = 0;
        }
        
        // Calculate current value
        const currentValue = Math.round(task.targetValue * progressPct * 100) / 100;
        const isCompleted = currentValue >= task.targetValue;
        
        // Determine completion date if completed
        let completionDate = null;
        if (isCompleted) {
          // Completion happened between start and now/end
          completionDate = new Date(participant.joinDate);
          const maxDate = new Date(Math.min(now, competition.endDate));
          
          const dateRange = maxDate - completionDate;
          if (dateRange > 0) {
            completionDate.setTime(completionDate.getTime() + Math.random() * dateRange);
          }
        }
        
        // Create progress record
        try {
          const progress = await prisma.competitionProgress.create({
            data: {
              participantId: participant.id,
              taskId: task.id,
              currentValue: currentValue,
              isCompleted: isCompleted,
              completionDate: completionDate,
              notes: isCompleted ? 
                ['Completed!', 'Achieved goal!', 'Target reached!', 'Success!'][Math.floor(Math.random() * 4)] : 
                Math.random() < 0.3 ? 
                  ['Making progress...', 'Working on it!', 'Getting there!', 'Almost there!'][Math.floor(Math.random() * 4)] : 
                  null
            }
          });
          
          console.log(`Created progress for user on task ${task.name}: ${currentValue}/${task.targetValue} ${task.unit}`);
        } catch (error) {
          console.log(`Error creating progress: ${error.message}`);
        }
      }
    }
    
    // 5. Calculate totals and rankings for each competition
    console.log('Calculating user totals and rankings...');
    
    for (const competition of competitions) {
      // Get all participants for this competition
      const competitionParticipants = participants.filter(p => p.competitionId === competition.id);
      
      for (const participant of competitionParticipants) {
        // Get all progress records for this participant
        const progressRecords = await prisma.competitionProgress.findMany({
          where: { participantId: participant.id },
          include: {
            task: true
          }
        });
        
        // Calculate points and completion percentage
        let totalPoints = 0;
        let completedTasks = 0;
        
        for (const progress of progressRecords) {
          if (progress.isCompleted) {
            totalPoints += progress.task.pointsValue;
            completedTasks++;
          } else {
            // Partial points for partial progress
            const progressPct = Number(progress.currentValue) / Number(progress.task.targetValue);
            if (progressPct > 0) {
              totalPoints += Math.floor(progress.task.pointsValue * progressPct);
            }
          }
        }
        
        const totalTasks = progressRecords.length;
        const completionPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        // Update participant with calculated values
        await prisma.competitionUser.update({
          where: { id: participant.id },
          data: {
            totalPoints: totalPoints,
            completionPct: completionPct
          }
        });
        
        console.log(`Updated totals for participant #${participant.id}: ${totalPoints} points, ${completionPct.toFixed(1)}% complete`);
      }
      
      // Update rankings
      const updatedParticipants = await prisma.competitionUser.findMany({
        where: { 
          competitionId: competition.id,
          isActive: true
        },
        orderBy: [
          { completionPct: 'desc' },
          { totalPoints: 'desc' }
        ]
      });
      
      // Assign ranks
      for (let i = 0; i < updatedParticipants.length; i++) {
        await prisma.competitionUser.update({
          where: { id: updatedParticipants[i].id },
          data: { rank: i + 1 }
        });
      }
      
      console.log(`Updated rankings for competition: ${competition.name}`);
    }
    
    // Summary of what was created
    console.log('\nCompetition Feature Seeding Completed!');
    console.log(`Created ${competitions.length} competitions`);
    console.log(`Created ${allTasks.length} competition tasks`);
    console.log(`Created ${participants.length} competition participants`);
    console.log(`Created progress records for all participants`);
    console.log(`Calculated totals and rankings for all competitions`);
    
  } catch (error) {
    console.error('Error during competition seeding:', error);
  }
}

seedCompetitions()
  .catch(e => {
    console.error('Error in competition seeding script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });