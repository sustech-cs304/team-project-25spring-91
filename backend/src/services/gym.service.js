// src/services/gym.service.js
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

// Common select clause for gym listings (remains the same)
const gymListSelect = {
  id: true,
  name: true,
  address: true,
  description: true,
  contactInfo: true,
  imageUrl: true,
  createdAt: true,
  ownerId: true,
  _count: {
    select: {
      classes: true,
      membershipPlans: true,
    },
  },
};

const gymService = {

getAllGyms: async ({ search, page = 1, limit = 10, paginate = true }) => {
      const filters = {};
      if (search) {
        filters.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (!paginate) { // If paginate is false, fetch all
        const gyms = await prisma.gym.findMany({
          where: filters,
          select: gymListSelect,
          orderBy: { name: 'asc' },
        });
        return {
          gyms,
          totalItems: gyms.length, // Total items is the length of the array
          paginationApplied: false,
        };
      }

      // Existing pagination logic
      const skip = (page - 1) * limit;
      const totalItems = await prisma.gym.count({ where: filters });
      const gyms = await prisma.gym.findMany({
        where: filters,
        select: gymListSelect,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      });

      return {
        gyms,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        paginationApplied: true,
      };
    },

  getAllGymsAdmin: async () => {
    const gyms = await prisma.gym.findMany({
      select: gymListSelect,
      orderBy: {
        name: 'asc',
      },
    });
    return gyms;
  },

  getMyGyms: async ({ ownerId, search, page = 1, limit = 10 }) => {
    const skip = (page - 1) * limit;
    const filters = { ownerId };

    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const totalItems = await prisma.gym.count({
      where: filters,
    });

    const gyms = await prisma.gym.findMany({
      where: filters,
      select: gymListSelect,
      orderBy: {
        name: 'asc',
      },
      skip,
      take: limit,
    });

    return {
      gyms,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  },

  getGymById: async (gymId) => {
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: {
        ...gymListSelect,
        owner: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        classes: { where: { isActive: true } },
        membershipPlans: { where: { isActive: true } },
      },
    });

    if (!gym) {
      throw new ApiError(404, 'Gym not found');
    }
    return gym;
  },

  getGymClasses: async (gymId) => {
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { id: true },
    });
    if (!gym) {
      throw new ApiError(404, 'Gym not found');
    }
    const classes = await prisma.gymClass.findMany({
      where: {
        gymId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        maxCapacity: true,
        durationMinutes: true,
        imageUrl: true,
        membersOnly: true,
        difficultyLevel: true,
        createdAt: true,
        gym: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return classes;
  },

  getGymMembershipPlans: async (gymId) => {
    const gym = await prisma.gym.findUnique({
      where: { id: gymId },
      select: { id: true },
    });
    if (!gym) {
      throw new ApiError(404, 'Gym not found');
    }
    const plans = await prisma.membershipPlan.findMany({
      where: {
        gymId,
        isActive: true,
      },
      orderBy: {
        price: 'asc',
      },
    });
    return plans;
  },

  // New service method for getting total gym count
  getTotalGymCount: async () => {
    const count = await prisma.gym.count();
    return count;
  },

  getOwnedGymCount: async (ownerId) => {
      const count = await prisma.gym.count({
        where: { ownerId },
      });
      return count;
    }

  
};

module.exports = { gymService };
