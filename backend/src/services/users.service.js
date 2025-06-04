// src/services/users.service.js
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const userService = {
  // ... (getUserProfile, updateUserProfile, changeUserRole, getAllUsers remain the same)
  getUserProfile: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        dateOfBirth: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        createdAt: true,
        role: true,
        imageUrl: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  },

  updateUserProfile: async (userId, updateData) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    let passwordUpdate = {};
    if (updateData.newPassword && updateData.currentPassword) {
      const isPasswordValid = await bcrypt.compare(
        updateData.currentPassword,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        throw new ApiError(400, 'Current password is incorrect');
      }
      passwordUpdate = {
        passwordHash: await bcrypt.hash(updateData.newPassword, 10),
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: updateData.displayName,
        dateOfBirth: updateData.dateOfBirth
          ? new Date(updateData.dateOfBirth)
          : undefined,
        gender: updateData.gender,
        heightCm: updateData.heightCm,
        weightKg: updateData.weightKg,
        imageUrl: updateData.imageUrl,
        ...passwordUpdate,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        dateOfBirth: true,
        gender: true,
        heightCm: true,
        weightKg: true,
        createdAt: true,
        role: true,
        imageUrl: true,
      },
    });
    return updatedUser;
  },

  changeUserRole: async (adminId, targetUserId, newRole) => {
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });
    if (admin?.role !== 'admin') {
      throw new ApiError(403, 'Only administrators can change user roles');
    }

    const allowedRoles = ['admin', 'gym_owner', 'user'];
    if (!allowedRoles.includes(newRole)) {
      throw new ApiError(
        400,
        `Role must be one of: ${allowedRoles.join(', ')}`,
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new ApiError(404, 'Target user not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });
    return updatedUser;
  },

  getAllUsers: async (page = 1, limit = 20, filter = {}) => {
    const skip = (page - 1) * limit;
    const where = {};
    if (filter.role) {
      where.role = filter.role;
    }
    if (filter.search) {
      where.OR = [
        { email: { contains: filter.search, mode: 'insensitive' } },
        { displayName: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
        imageUrl: true,
        _count: {
          select: {
            plannedWorkouts: true,
            actualWorkouts: true,
            userMemberships: true,
            userBookings: true,
            ownedGyms: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    return {
      users,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit,
      },
    };
  },

  // New: Get total user counts by role
  getUserCounts: async () => {
    const totalUsers = await prisma.user.count();
    const totalGymOwners = await prisma.user.count({
      where: { role: 'gym_owner' },
    });
    const totalAdmins = await prisma.user.count({
      where: { role: 'admin' },
    });
    const totalRegularUsers = await prisma.user.count({
      where: { role: 'user' },
    });

    return {
      totalUsers,
      totalGymOwners,
      totalAdmins,
      totalRegularUsers, // Count of users with the 'user' role
    };
  },

  // New: Get new user sign-ups per month for the past 12 months
  getNewUserSignupsPerMonth: async () => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    twelveMonthsAgo.setDate(1); // Start from the beginning of that month
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const now = new Date();

    // Fetch users created in the last 12 full months + current partial month
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const monthlySignups = {};

    // Initialize the last 12 months + current month with 0 signups
    for (let i = 0; i <= 12; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      const monthKey = `${monthDate.getFullYear()}-${String(
        monthDate.getMonth() + 1,
      ).padStart(2, '0')}`;
      monthlySignups[monthKey] = 0;
    }

    users.forEach((user) => {
      const signupMonth = user.createdAt.getFullYear();
      const signupYearMonth = `${signupMonth}-${String(
        user.createdAt.getMonth() + 1,
      ).padStart(2, '0')}`;
      if (monthlySignups[signupYearMonth] !== undefined) {
        monthlySignups[signupYearMonth]++;
      }
    });

    // Convert to array and sort, ensuring we only take the most recent 12-13 entries
    const result = Object.entries(monthlySignups)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => (a.month > b.month ? 1 : -1)) // Sort chronologically
      .slice(-13); // Get the last 13 months (12 full past + current)

    return result;
  },

};

module.exports = { userService };
