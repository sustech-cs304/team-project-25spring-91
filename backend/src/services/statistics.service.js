// src/services/statistics.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

// Helper function to calculate volume
function calculateVolume(sets, reps, weight) {
  if (!sets || !reps || !weight) return 0;
  // Ensure weight is a number for calculation
  const numericWeight = typeof weight === 'number' ? weight : parseFloat(weight.toString());
  if (isNaN(numericWeight)) return 0;
  return (sets || 0) * (reps || 0) * numericWeight;
}

// Helper function to get ISO week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Helper function to parse week key "YYYY-WXX" into [year, week]
function parseWeekKey(weekKey) {
  const [year, weekPart] = weekKey.split('-');
  const week = parseInt(weekPart.substring(1), 10);
  return [parseInt(year, 10), week];
}

// Helper function to calculate difference between two week numbers
// This needs to be more robust for year changes.
function getWeeksDifference(year1, week1, year2, week2) {
    // Create dates for the start of each week for easier comparison
    // Monday of week1 in year1
    const date1 = new Date(year1, 0, 1 + (week1 - 1) * 7);
    while(date1.getDay() !== 1) { // 1 is Monday
        date1.setDate(date1.getDate() -1);
    }
    // Monday of week2 in year2
    const date2 = new Date(year2, 0, 1 + (week2 - 1) * 7);
     while(date2.getDay() !== 1) {
        date2.setDate(date2.getDate() -1);
    }
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
}


// Helper function to calculate weekly streaks
function calculateWeeklyStreaks(dates) {
  if (!dates || dates.length === 0) {
    return { longest: 0, current: 0 };
  }

  const uniqueWorkoutWeeks = new Set();
  dates.forEach(date => {
    const year = date.getFullYear();
    const weekNum = getWeekNumber(date);
    uniqueWorkoutWeeks.add(`${year}-W${String(weekNum).padStart(2, '0')}`);
  });

  const sortedWorkoutWeeks = Array.from(uniqueWorkoutWeeks).sort();

  if (sortedWorkoutWeeks.length === 0) {
    return { longest: 0, current: 0 };
  }

  let longestStreak = 0;
  let currentStreak = 0;
  let lastWeekYear = 0;
  let lastWeekNumber = 0;

  sortedWorkoutWeeks.forEach(weekKey => {
    const [year, weekNumber] = parseWeekKey(weekKey);

    if (
      currentStreak > 0 &&
      (year === lastWeekYear && weekNumber === lastWeekNumber + 1) ||
      (year === lastWeekYear + 1 && weekNumber === 1 && (lastWeekNumber === 52 || lastWeekNumber === 53))
    ) {
      currentStreak++;
    } else {
      currentStreak = 1; // Start a new streak
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
    lastWeekYear = year;
    lastWeekNumber = weekNumber;
  });

  // Calculate current streak based on today
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentWeekNumber = getWeekNumber(today);
  const currentWeekKey = `${currentYear}-W${String(currentWeekNumber).padStart(2, '0')}`;
  const previousWeekKey = `${currentYear}-W${String(currentWeekNumber - 1).padStart(2, '0')}`; // Simplified, needs year boundary check

  let actualCurrentStreak = 0;
  if (sortedWorkoutWeeks.includes(currentWeekKey)) {
    // User worked out this week, find the length of the streak ending this week
    let tempStreak = 0;
    for (let i = sortedWorkoutWeeks.length - 1; i >= 0; i--) {
        const [year, week] = parseWeekKey(sortedWorkoutWeeks[i]);
        if (i === sortedWorkoutWeeks.length -1 ||
            (year === parseWeekKey(sortedWorkoutWeeks[i+1])[0] && week === parseWeekKey(sortedWorkoutWeeks[i+1])[1] -1) ||
            (year === parseWeekKey(sortedWorkoutWeeks[i+1])[0] -1 && week >= 52 && parseWeekKey(sortedWorkoutWeeks[i+1])[1] === 1)
        ) {
            tempStreak++;
        } else {
            break;
        }
    }
    actualCurrentStreak = tempStreak;

  } else if (sortedWorkoutWeeks.includes(previousWeekKey)) {
    // User worked out last week but not this week, find the length of the streak ending last week
     let tempStreak = 0;
    for (let i = sortedWorkoutWeeks.length - 1; i >= 0; i--) {
        if (sortedWorkoutWeeks[i] === previousWeekKey) { // Start counting from previous week
             tempStreak = 1; // Reset and start from this point
             for (let j = i -1; j >=0; j--) { // Look backwards from previousWeekKey
                const [year, week] = parseWeekKey(sortedWorkoutWeeks[j]);
                const [prevYearStreak, prevWeekStreak] = parseWeekKey(sortedWorkoutWeeks[j+1]);
                 if (
                    (year === prevYearStreak && week === prevWeekStreak - 1) ||
                    (year === prevYearStreak - 1 && week >= 52 && prevWeekStreak === 1)
                ) {
                    tempStreak++;
                } else {
                    break;
                }
             }
             break; // Found the streak ending last week
        }
    }
    actualCurrentStreak = tempStreak;
  }
  // If neither this week nor last week had a workout, current streak is 0.

  return { longest: longestStreak, current: actualCurrentStreak };
}


// Optimized helper for monthly workout counts
async function getMonthlyWorkoutCountsForPeriod(userId, startDate, endDate) {
  const workouts = await prisma.actualWorkout.findMany({
    where: {
      userId,
      completedDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      completedDate: true,
    },
  });

  const monthlyCounts = {};
  workouts.forEach(workout => {
    const year = workout.completedDate.getFullYear();
    const month = workout.completedDate.getMonth(); // 0-11
    const key = `${year}-${month}`;
    monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
  });
  return monthlyCounts;
}

// Optimized helper for monthly volume
async function getMonthlyVolumeForPeriod(userId, startDate, endDate) {
  const exercisesInPeriod = await prisma.actualExercise.findMany({
    where: {
      actualWorkout: {
        userId,
        completedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    select: {
      actualSets: true,
      actualReps: true,
      actualWeight: true,
      actualWorkout: { // Need to select this to access completedDate
        select: { completedDate: true },
      },
    },
  });

  const monthlyVolumes = {};
  exercisesInPeriod.forEach(ex => {
    if (ex.actualWorkout && ex.actualWorkout.completedDate) { // Ensure actualWorkout and completedDate exist
      const year = ex.actualWorkout.completedDate.getFullYear();
      const month = ex.actualWorkout.completedDate.getMonth(); // 0-11
      const key = `${year}-${month}`;
      monthlyVolumes[key] = (monthlyVolumes[key] || 0) + calculateVolume(ex.actualSets, ex.actualReps, ex.actualWeight);
    }
  });
  return monthlyVolumes;
}

// Helper function to process best records from pre-fetched data
function processBestExerciseRecords(allActualExercises) {
  let heaviestWeight = { weight: 0, exercise: null, date: null };
  let mostReps = { reps: 0, exercise: null, date: null };
  let mostSets = { sets: 0, exercise: null, date: null };

  allActualExercises.forEach(ex => {
    const weight = ex.actualWeight ? parseFloat(ex.actualWeight.toString()) : 0;
    // Ensure actualWorkout and completedDate are available if you need the date
    const workoutDate = ex.actualWorkout?.completedDate;

    if (weight > parseFloat(heaviestWeight.weight?.toString() || '0')) {
      heaviestWeight = { weight: ex.actualWeight, exercise: ex.exercise, date: workoutDate };
    }
    if (ex.actualReps && ex.actualReps > mostReps.reps) {
      mostReps = { reps: ex.actualReps, exercise: ex.exercise, date: workoutDate };
    }
    if (ex.actualSets && ex.actualSets > mostSets.sets) {
      mostSets = { sets: ex.actualSets, exercise: ex.exercise, date: workoutDate };
    }
  });
  return { heaviestWeight, mostReps, mostSets };
}

// Helper function to get top most frequent exercises
async function getTopExercises(userId, limit) {
  const exerciseCounts = await prisma.actualExercise.groupBy({
    by: ['exerciseId'],
    where: {
      actualWorkout: {
        userId,
      },
    },
    _count: {
      exerciseId: true,
    },
    orderBy: {
      _count: {
        exerciseId: 'desc',
      },
    },
    take: limit,
  });

  if (exerciseCounts.length === 0) {
    return [];
  }

  const topExerciseIds = exerciseCounts.map((e) => e.exerciseId);

  const topExercisesDetails = await prisma.exercise.findMany({
    where: {
      id: {
        in: topExerciseIds,
      },
    },
    select: { id: true, name: true, category: true, imageUrl: true }, // Added imageUrl
  });

  // Map counts to details and maintain the order from groupBy
  return exerciseCounts.map((ec) => {
    const detail = topExercisesDetails.find((ted) => ted.id === ec.exerciseId);
    return {
      ...detail,
      count: ec._count.exerciseId,
    };
  });
}


const statisticsService = {
  getDashboardStatistics: async (userId) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const firstDayOfCurrentMonth = new Date(currentYear, currentDate.getMonth(), 1);
    const lastDayOfCurrentMonth = new Date(currentYear, currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const fiveYearsAgoStart = new Date(currentYear - 4, 0, 1); // Start of 5 years ago (e.g., if 2025, then 2021-01-01)

    const [
      completedWorkoutSessionsCount,
      plannedWorkoutsThisMonthCount,
      completedPlannedWorkoutsThisMonthCount,
      allWorkoutDatesForStreaks,
      allActualExercisesForBestRecordsAndVolume, // Combined fetch for best records and part of volume
      monthlyWorkoutCountsData,
      topExercisesData,
    ] = await Promise.all([
      prisma.actualWorkout.count({ where: { userId } }),
      prisma.plannedWorkout.count({
        where: {
          userId,
          scheduledDate: {
            gte: firstDayOfCurrentMonth,
            lte: lastDayOfCurrentMonth,
          },
        },
      }),
      prisma.actualWorkout.count({
        where: {
          userId,
          plannedId: { not: null },
          completedDate: {
            gte: firstDayOfCurrentMonth,
            lte: lastDayOfCurrentMonth,
          },
        },
      }),
      prisma.actualWorkout.findMany({
        where: { userId },
        select: { completedDate: true },
        orderBy: { completedDate: 'asc' },
      }),
      prisma.actualExercise.findMany({ // For Best Records and Monthly Volume
        where: { actualWorkout: { 
            userId,
            completedDate: { // For volume calculation over 5 years
                gte: fiveYearsAgoStart,
                lte: currentDate,
            }
        }},
        include: {
          exercise: { select: { id: true, name: true } },
          actualWorkout: { select: { completedDate: true } }, // Needed for date of best record and volume month
        },
      }),
      getMonthlyWorkoutCountsForPeriod(userId, fiveYearsAgoStart, currentDate),
      getTopExercises(userId, 3),
    ]);

    const dashboardData = {};
    dashboardData.completedWorkoutSessions = completedWorkoutSessionsCount;

    dashboardData.currentMonthCompletionRate =
      plannedWorkoutsThisMonthCount > 0
        ? Math.min(100, (completedPlannedWorkoutsThisMonthCount / plannedWorkoutsThisMonthCount) * 100)
        : 0;

    const workoutsByYear = [];
    for (let yearOffset = 0; yearOffset < 5; yearOffset++) {
      const year = currentYear - yearOffset;
      const yearEntry = { year, months: [] };
      for (let month = 0; month < 12; month++) { // month is 0-11
        const key = `${year}-${month}`;
        // Skip future months in current year for display
        if (year === currentYear && month > currentDate.getMonth()) {
             yearEntry.months.push({
                month: month + 1,
                monthName: new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
                count: 0,
            });
        } else {
            yearEntry.months.push({
                month: month + 1,
                monthName: new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
                count: monthlyWorkoutCountsData[key] || 0,
            });
        }
      }
      workoutsByYear.push(yearEntry);
    }
    dashboardData.workoutsByYear = workoutsByYear;
    dashboardData.monthlyCompletedWorkouts = workoutsByYear.find(y => y.year === currentYear)?.months || [];

    const streaks = calculateWeeklyStreaks(allWorkoutDatesForStreaks.map(w => w.completedDate));
    dashboardData.longestStreak = streaks.longest;
    dashboardData.currentStreak = streaks.current;
    
    // Process Best Records from the combined fetch
    dashboardData.bestRecords = processBestExerciseRecords(allActualExercisesForBestRecordsAndVolume);

    // Process Monthly Volume from the combined fetch
    const monthlyVolumeMap = {};
    allActualExercisesForBestRecordsAndVolume.forEach(ex => { // Reusing the fetched data
        if (ex.actualWorkout && ex.actualWorkout.completedDate) {
            const year = ex.actualWorkout.completedDate.getFullYear();
            const month = ex.actualWorkout.completedDate.getMonth(); // 0-11
            const key = `${year}-${month}`;
            monthlyVolumeMap[key] = (monthlyVolumeMap[key] || 0) + calculateVolume(ex.actualSets, ex.actualReps, ex.actualWeight);
        }
    });

    const volumeByYearProcessed = [];
    for (let yearOffset = 0; yearOffset < 5; yearOffset++) {
      const year = currentYear - yearOffset;
      const yearEntry = { year, months: [] };
      for (let month = 0; month < 12; month++) {
        const key = `${year}-${month}`;
         if (year === currentYear && month > currentDate.getMonth()) {
            yearEntry.months.push({
                month: month + 1,
                monthName: new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
                volume: 0,
            });
        } else {
            yearEntry.months.push({
                month: month + 1,
                monthName: new Date(year, month, 1).toLocaleString('default', { month: 'long' }),
                volume: monthlyVolumeMap[key] || 0,
            });
        }
      }
      volumeByYearProcessed.push(yearEntry);
    }
    dashboardData.volumeByYear = volumeByYearProcessed;
    dashboardData.monthlyVolume = volumeByYearProcessed.find(y => y.year === currentYear)?.months || [];

    dashboardData.topExercises = topExercisesData;

    return dashboardData;
  },

  getExerciseProgress: async (userId, exerciseId) => {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new ApiError(404, 'Exercise not found');
    }

    const exerciseHistory = await prisma.actualExercise.findMany({
      where: {
        exerciseId,
        actualWorkout: {
          userId,
        },
      },
      include: {
        actualWorkout: {
          select: {
            completedDate: true,
          },
        },
      },
      orderBy: {
        actualWorkout: {
          completedDate: 'asc',
        },
      },
    });

    const progressData = exerciseHistory.map((entry) => ({
      date: entry.actualWorkout.completedDate,
      sets: entry.actualSets || 0,
      reps: entry.actualReps || 0,
      weight: entry.actualWeight ? parseFloat(entry.actualWeight.toString()) : 0,
      volume: calculateVolume(entry.actualSets, entry.actualReps, entry.actualWeight),
    }));

    return {
      exercise,
      progressData,
    };
  },
};

module.exports = { statisticsService };