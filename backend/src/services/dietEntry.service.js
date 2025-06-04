// src/services/dietEntry.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const dietEntryService = {
  // Get user's diet entries (with filters and pagination)
  getUserDietEntries: async (
    userId,
    { startDate, endDate, mealType, page = 1, limit = 20 },
  ) => {
    const where = {
      userId,
      ...(startDate && { consumptionDate: { gte: new Date(startDate) } }),
      ...(endDate && { consumptionDate: { lte: new Date(endDate) } }),
      ...(mealType && { mealType: { contains: mealType, mode: 'insensitive' } }),
    };

    const totalItems = await prisma.dietEntry.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    const dietEntries = await prisma.dietEntry.findMany({
      where,
      orderBy: [ // <--- FIX HERE
        { consumptionDate: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        foodItem: true,
      },
    });

    return {
      dietEntries,
      totalItems,
      totalPages,
    };
  },

  // New: Get all user's diet entries (with filters, no pagination)
  getAllUserDietEntries: async (
    userId,
    { startDate, endDate, mealType },
  ) => {
    const where = {
      userId,
      ...(startDate && { consumptionDate: { gte: new Date(startDate) } }),
      ...(endDate && { consumptionDate: { lte: new Date(endDate) } }),
      ...(mealType && { mealType: { contains: mealType, mode: 'insensitive' } }),
    };

    const dietEntries = await prisma.dietEntry.findMany({
      where,
      orderBy: [ // <--- FIX HERE
        { consumptionDate: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        foodItem: true,
      },
    });

    return dietEntries;
  },

  // ... rest of your service methods (getDietEntryById, createDietEntry, etc.)
  // No changes needed in the other methods unless they also use multi-field orderBy

  getDietEntryById: async (entryId, userId) => {
    const dietEntry = await prisma.dietEntry.findUnique({
      where: { id: entryId },
      include: {
        foodItem: true,
      },
    });

    if (!dietEntry) {
      throw new ApiError(404, 'Diet entry not found');
    }

    if (dietEntry.userId !== userId) {
      throw new ApiError(
        403,
        'You do not have permission to access this diet entry',
      );
    }

    return dietEntry;
  },

  createDietEntry: async (userId, data) => {
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: data.foodId },
    });

    if (!foodItem) {
      throw new ApiError(404, 'Food item not found');
    }

    const calories =
      parseFloat(foodItem.caloriesPerUnit) * parseFloat(data.quantity);

    return prisma.dietEntry.create({
      data: {
        userId,
        foodId: data.foodId,
        quantity: data.quantity,
        calories,
        consumptionDate: new Date(data.consumptionDate),
        mealType: data.mealType || 'Uncategorized',
        notes: data.notes,
      },
      include: {
        foodItem: true,
      },
    });
  },

  updateDietEntry: async (entryId, userId, data) => {
    const dietEntry = await prisma.dietEntry.findUnique({
      where: { id: entryId },
    });

    if (!dietEntry) {
      throw new ApiError(404, 'Diet entry not found');
    }

    if (dietEntry.userId !== userId) {
      throw new ApiError(
        403,
        'You do not have permission to update this diet entry',
      );
    }

    let calories = dietEntry.calories;
    if (data.foodId || data.quantity !== undefined) {
      const foodId = data.foodId || dietEntry.foodId;
      const quantity =
        data.quantity !== undefined ? data.quantity : dietEntry.quantity;

      const foodItem = await prisma.foodItem.findUnique({
        where: { id: foodId },
      });

      if (!foodItem) {
        throw new ApiError(404, 'Food item not found');
      }
      calories = parseFloat(foodItem.caloriesPerUnit) * parseFloat(quantity);
    }

    const updatePayload = {
      ...(data.foodId && { foodId: data.foodId }),
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      calories,
      ...(data.consumptionDate && {
        consumptionDate: new Date(data.consumptionDate),
      }),
      ...(data.mealType && { mealType: data.mealType }),
      ...(data.notes !== undefined && { notes: data.notes }),
    };

    return prisma.dietEntry.update({
      where: { id: entryId },
      data: updatePayload,
      include: {
        foodItem: true,
      },
    });
  },

  deleteDietEntry: async (entryId, userId) => {
    const dietEntry = await prisma.dietEntry.findUnique({
      where: { id: entryId },
    });

    if (!dietEntry) {
      throw new ApiError(404, 'Diet entry not found');
    }

    if (dietEntry.userId !== userId) {
      throw new ApiError(
        403,
        'You do not have permission to delete this diet entry',
      );
    }

    return prisma.dietEntry.delete({
      where: { id: entryId },
    });
  },

  getUserDietSummary: async (userId, { startDate, endDate }) => {
    const validStartDate = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const validEndDate = endDate ? new Date(endDate) : new Date();

    const dietEntries = await prisma.dietEntry.findMany({
      where: {
        userId,
        consumptionDate: {
          gte: validStartDate,
          lte: validEndDate,
        },
      },
      include: {
        foodItem: true,
      },
      orderBy: { // This one only has one condition, so it's fine as an object
        consumptionDate: 'asc',
      },
    });

    const dailySummary = {};
    const mealTypeSummary = {};
    let totalCalories = 0;

    dietEntries.forEach((entry) => {
      const dateKey = entry.consumptionDate.toISOString().split('T')[0];
      if (!dailySummary[dateKey]) {
        dailySummary[dateKey] = 0;
      }
      dailySummary[dateKey] += parseFloat(entry.calories);

      const mealType = entry.mealType || 'Uncategorized';
      if (!mealTypeSummary[mealType]) {
        mealTypeSummary[mealType] = 0;
      }
      mealTypeSummary[mealType] += parseFloat(entry.calories);

      totalCalories += parseFloat(entry.calories);
    });

    const dates = Object.keys(dailySummary).sort();
    const dailyCalories = dates.map((date) => ({
      date,
      calories: dailySummary[date],
    }));

    const avgCaloriesPerDay =
      dates.length > 0 ? totalCalories / dates.length : 0;

    return {
      period: {
        startDate: validStartDate.toISOString().split('T')[0],
        endDate: validEndDate.toISOString().split('T')[0],
      },
      totalEntries: dietEntries.length,
      totalCalories,
      avgCaloriesPerDay,
      dailyCalories,
      mealTypeSummary,
    };
  },

  getMonthlyCalorieConsumption: async (userId, numberOfMonths = 12) => {
    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth() - (numberOfMonths - 1), // Go back (numberOfMonths - 1) full months
      1, // Start from the 1st day of that month
    );
    startDate.setHours(0, 0, 0, 0);

    // Fetch diet entries within the date range that have calories
    const dietEntries = await prisma.dietEntry.findMany({
      where: {
        userId,
        consumptionDate: {
          gte: startDate,
          lte: today, // Up to today
        },
        calories: {
          not: null, // Ensure calories are logged
          gt: 0,     // Optionally, only count if calories > 0
        },
      },
      select: {
        consumptionDate: true,
        calories: true,
      },
      orderBy: {
        consumptionDate: 'asc',
      },
    });

    const monthlyCalories = {};

    // Initialize months in the range with 0 calories
    for (let i = 0; i < numberOfMonths; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(
        monthDate.getMonth() + 1,
      ).padStart(2, '0')}`;
      monthlyCalories[monthKey] = 0;
    }

    // Aggregate calories per month
    dietEntries.forEach((entry) => {
      const year = entry.consumptionDate.getFullYear();
      const month = String(entry.consumptionDate.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;

      if (entry.calories) { // Should always be true due to where clause, but good practice
        if (monthlyCalories[monthKey] !== undefined) {
          monthlyCalories[monthKey] += parseFloat(entry.calories.toString());
        } else {
          // Fallback, though initialization should cover this
          monthlyCalories[monthKey] = parseFloat(entry.calories.toString());
        }
      }
    });

    // Convert to sorted array format
    const result = Object.entries(monthlyCalories)
      .map(([month, totalCalories]) => ({
        month,
        totalCalories: parseFloat(totalCalories.toFixed(2)), // Ensure two decimal places
      }))
      .sort((a, b) => (a.month < b.month ? -1 : 1)); // Sort chronologically

    return result;
  }
};

module.exports = { dietEntryService };
