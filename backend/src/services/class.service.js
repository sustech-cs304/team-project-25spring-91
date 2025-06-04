// src/services/class.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const classService = {
getAllGymClasses: async ({
      gymId,
      difficultyLevel,
      search,
      page = 1,
      limit = 10,
      paginate = true, // New parameter
    }) => {
      const filters = { isActive: true };
      if (gymId) filters.gymId = gymId;
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (search) {
        filters.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const includeOptions = {
        gym: { select: { id: true, name: true } },
        schedules: {
          where: { startTime: { gte: new Date() }, isCancelled: false },
          orderBy: { startTime: 'asc' },
          take: 5,
        },
      };
      const orderByOptions = [{ gymId: 'asc' }, { name: 'asc' }];

      if (!paginate) {
        const classes = await prisma.gymClass.findMany({
          where: filters,
          include: includeOptions,
          orderBy: orderByOptions,
        });
        return {
          classes,
          totalItems: classes.length,
          paginationApplied: false,
        };
      }

      const skip = (page - 1) * limit;
      const totalItems = await prisma.gymClass.count({ where: filters });
      const classes = await prisma.gymClass.findMany({
        where: filters,
        include: includeOptions,
        orderBy: orderByOptions,
        skip,
        take: limit,
      });

      return {
        classes,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        paginationApplied: true,
      };
    },
  
  getGymClassById: async (classId) => {
    const gymClass = await prisma.gymClass.findUnique({
      where: { id: classId },
      include: {
        gym: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        // Include upcoming schedules
        schedules: {
          where: {
            startTime: {
              gte: new Date()
            },
            isCancelled: false
          },
          orderBy: {
            startTime: 'asc'
          },
          take: 10
        }
      }
    });
    
    if (!gymClass) {
      throw new ApiError(404, 'Class not found');
    }
    
    if (!gymClass.isActive) {
      throw new ApiError(410, 'This class is no longer available');
    }
    
    return gymClass;
  },
  
getClassSchedules: async (classId, queryStartDate, queryEndDate) => {
    const gymClass = await prisma.gymClass.findUnique({
      where: { id: classId },
      select: { id: true, isActive: true },
    });

    if (!gymClass) {
      throw new ApiError(404, 'Class not found');
    }
    if (!gymClass.isActive) {
      throw new ApiError(410, 'This class is no longer available');
    }

    const whereConditions = {
      classId,
      // isCancelled: false, // Consider adding this if you only want to show non-cancelled by default
    };

    // Only apply date filters if they are explicitly provided
    if (queryStartDate && queryEndDate) {
      whereConditions.startTime = {
        gte: new Date(queryStartDate),
        lte: new Date(queryEndDate),
      };
    } else if (queryStartDate) {
      whereConditions.startTime = {
        gte: new Date(queryStartDate),
      };
    } else if (queryEndDate) {
      whereConditions.startTime = {
        lte: new Date(queryEndDate),
      };
    }
    // If neither queryStartDate nor queryEndDate is provided, no date filter is applied.
    // This will return ALL schedules for the class.

    const schedules = await prisma.classSchedule.findMany({
      where: whereConditions,
      include: {
        gymClass: {
          select: {
            name: true,
            maxCapacity: true,
            durationMinutes: true,
            membersOnly: true,
          },
        },
        _count: {
          select: {
            userBookings: {
              where: {
                bookingStatus: { in: ['confirmed'] },
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // ... (rest of the mapping logic for schedulesWithAvailability)
    const schedulesWithAvailability = schedules.map(schedule => {
      const maxCapacity = schedule.gymClass.maxCapacity || 0;
      const currentBookings = schedule._count.userBookings;
      const spotsAvailable = maxCapacity - currentBookings;
      
      return {
        ...schedule,
        spotsAvailable: Math.max(0, spotsAvailable),
        isFull: currentBookings >= maxCapacity,
        currentBookings,
      };
    });
    
    return schedulesWithAvailability;
  }
};

module.exports = { classService };