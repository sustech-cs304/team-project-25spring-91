// src/controllers/users.controller.js
const { userService } = require('../services/users.service');
const { gymService } = require('../services/gym.service'); 
const { bookingService } = require('../services/booking.service'); 
const { membershipService } = require('../services/membership.service'); 
const fs = require('fs').promises;
const path = require('path');
const { ApiError } = require('../utils/ApiError'); // Make sure ApiError is imported

const userController = {
  // ... (getProfile, updateProfile, updateProfileImage, getAllUsers, changeUserRole, getWorkoutStats remain the same)
  getProfile: async (req, res) => {
    const userId = req.user.id;
    const profile = await userService.getUserProfile(userId);
    res.status(200).json({
      status: 'success',
      data: profile,
    });
  },

  updateProfile: async (req, res) => {
    const userId = req.user.id;
    const updateData = { ...req.body };
    if (req.processedImage) {
      const currentUser = await userService.getUserProfile(userId);
      if (currentUser.imageUrl) {
        try {
          const oldFilename = currentUser.imageUrl.split('/').pop();
          const oldFilepath = path.join(
            __dirname,
            '../../uploads/users',
            oldFilename,
          );
          await fs.unlink(oldFilepath);
        } catch (error) {
          console.log('Old image not found or already deleted');
        }
      }
      updateData.imageUrl = req.processedImage.url;
    }
    const updatedProfile = await userService.updateUserProfile(
      userId,
      updateData,
    );
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  },

  updateProfileImage: async (req, res) => {
    const userId = req.user.id;
    if (!req.processedImage) {
      throw new ApiError(400, 'Image file is required');
    }
    const currentUser = await userService.getUserProfile(userId);
    if (currentUser.imageUrl) {
      try {
        const oldFilename = currentUser.imageUrl.split('/').pop();
        const oldFilepath = path.join(
          __dirname,
          '../../uploads/users',
          oldFilename,
        );
        await fs.unlink(oldFilepath);
      } catch (error) {
        console.log('Old image not found or already deleted');
      }
    }
    const updatedProfile = await userService.updateUserProfile(userId, {
      imageUrl: req.processedImage.url,
    });
    res.status(200).json({
      status: 'success',
      message: 'Profile image updated successfully',
      data: {
        imageUrl: updatedProfile.imageUrl,
      },
    });
  },

  getAllUsers: async (req, res) => {
    const { page = 1, limit = 20, role, search } = req.query;
    const result = await userService.getAllUsers(parseInt(page), parseInt(limit), {
      role,
      search,
    });
    res.status(200).json({
      status: 'success',
      results: result.users.length,
      pagination: result.pagination,
      data: result.users,
    });
  },

  changeUserRole: async (req, res) => {
    const adminId = req.user.id;
    const targetUserId = parseInt(req.params.id);
    const { role } = req.body;
    const updatedUser = await userService.changeUserRole(
      adminId,
      targetUserId,
      role,
    );
    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: updatedUser,
    });
  },

  getWorkoutStats: async (req, res) => {
    const userId = req.user.id;
    // const stats = await userService.getUserWorkoutStats(userId); // Uncomment if you have this method
    // For now, let's return a placeholder if the method is commented out
    const stats = { message: "Workout stats endpoint placeholder" };
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  },

  // New: Controller for user counts
  getUserCounts: async (req, res) => {
    const counts = await userService.getUserCounts();
    res.status(200).json({
      status: 'success',
      data: counts,
    });
  },

  // New: Controller for monthly new user signups
  getNewUserSignups: async (req, res) => {
    const signups = await userService.getNewUserSignupsPerMonth();
    res.status(200).json({
      status: 'success',
      data: signups,
    });
  },

  getGymOwnerDashboardStats: async (req, res) => {
    const ownerId = req.user.id; // Assuming gym_owner is logged in

    const [
      ownedGymCount,
      totalBookings,
      currentMonthRevenue,
    ] = await Promise.all([
      gymService.getOwnedGymCount(ownerId),
      bookingService.getTotalBookingsForOwnedGyms(ownerId),
      membershipService.getCurrentMonthRevenueForOwnedGyms(ownerId),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        totalOwnedGyms: ownedGymCount,
        totalBookingsInOwnedGyms: totalBookings,
        revenueThisMonth: parseFloat(currentMonthRevenue.toString()), // Ensure it's a number
      },
    });
  }
};

module.exports = { userController };
